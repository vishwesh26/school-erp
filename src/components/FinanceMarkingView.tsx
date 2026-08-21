"use client";

import { useState, useEffect, useMemo } from "react";
import { getActiveCategoriesForClass, getStudentsByFeeCategory, bulkUpdateFees } from "@/lib/accountantActions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FeeDownloadButton from "@/components/FeeDownloadButton";
import { createClient } from "@/lib/supabase/client";

interface StudentFeeRecord {
    id: string;
    studentId: string;
    status: 'PAID' | 'PARTIAL' | 'PENDING';
    totalAmount: number;
    baseAmount?: number;
    discount?: number;
    paidAmount: number;
    pendingAmount: number;
    student: {
        name: string;
        surname?: string;
        rollNumber?: string;
        email?: string;
        phone?: string;
        bloodType?: string;
        parentName?: string;
    };
}

const FinanceMarkingView = ({ classId }: { classId: number }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [students, setStudents] = useState<StudentFeeRecord[]>([]);
    const [statuses, setStatuses] = useState<{ [studentId: string]: 'PAID' | 'PARTIAL' | 'PENDING' }>({});
    const [paidAmounts, setPaidAmounts] = useState<{ [studentId: string]: number }>({});
    const [totalAmounts, setTotalAmounts] = useState<{ [studentId: string]: number }>({});
    const [className, setClassName] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING'>('ALL');

    const router = useRouter();

    // Fetch Class Name
    useEffect(() => {
        if (classId) {
            const fetchClassName = async () => {
                const supabase = createClient();
                const { data } = await supabase.from('Class').select('name').eq('id', classId).single();
                if (data?.name) {
                    setClassName(data.name);
                }
            };
            fetchClassName();
        }
    }, [classId]);

    // 1. Fetch Categories for this class
    useEffect(() => {
        const fetchCats = async () => {
            const cats = await getActiveCategoriesForClass(classId);
            setCategories(cats || []);
            if (cats && cats.length > 0) {
                setSelectedCategoryId(cats[0].id);
            }
        };
        fetchCats();
    }, [classId]);

    // 2. Fetch Students and their status & amounts for the category
    useEffect(() => {
        if (classId && selectedCategoryId) {
            const fetchStudents = async () => {
                setLoading(true);
                const res = await getStudentsByFeeCategory(classId, selectedCategoryId);
                const studentList = (res.data || []) as StudentFeeRecord[];
                setStudents(studentList);

                const initialStatuses: { [studentId: string]: 'PAID' | 'PARTIAL' | 'PENDING' } = {};
                const initialPaid: { [studentId: string]: number } = {};
                const initialTotals: { [studentId: string]: number } = {};

                studentList.forEach((item) => {
                    initialStatuses[item.studentId] = item.status;
                    initialPaid[item.studentId] = Number(item.paidAmount || 0);
                    initialTotals[item.studentId] = Number(item.totalAmount || 0);
                });

                setStatuses(initialStatuses);
                setPaidAmounts(initialPaid);
                setTotalAmounts(initialTotals);
                setLoading(false);
            };
            fetchStudents();
        }
    }, [classId, selectedCategoryId]);

    // Quick Status Changes
    const handleQuickStatus = (studentId: string, targetStatus: 'PAID' | 'PARTIAL' | 'PENDING') => {
        const total = totalAmounts[studentId] || 0;
        let newPaid = paidAmounts[studentId] || 0;

        if (targetStatus === 'PAID') {
            newPaid = total;
        } else if (targetStatus === 'PENDING') {
            newPaid = 0;
        } else if (targetStatus === 'PARTIAL') {
            if (newPaid <= 0 || newPaid >= total) {
                newPaid = Math.round(total / 2);
            }
        }

        setStatuses(prev => ({ ...prev, [studentId]: targetStatus }));
        setPaidAmounts(prev => ({ ...prev, [studentId]: newPaid }));
    };

    // Custom Paid Amount Changes
    const handleCustomPaidChange = (studentId: string, value: string) => {
        const numValue = value === "" ? 0 : Math.max(0, Number(value));
        const total = totalAmounts[studentId] || 0;

        let newStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
        if (numValue >= total && total > 0) {
            newStatus = 'PAID';
        } else if (numValue > 0) {
            newStatus = 'PARTIAL';
        } else {
            newStatus = 'PENDING';
        }

        setPaidAmounts(prev => ({ ...prev, [studentId]: numValue }));
        setStatuses(prev => ({ ...prev, [studentId]: newStatus }));
    };

    // Bulk Actions
    const handleMarkAll = (targetStatus: 'PAID' | 'PENDING') => {
        const newStatuses: any = { ...statuses };
        const newPaid: any = { ...paidAmounts };

        students.forEach(s => {
            newStatuses[s.studentId] = targetStatus;
            newPaid[s.studentId] = targetStatus === 'PAID' ? (totalAmounts[s.studentId] || 0) : 0;
        });

        setStatuses(newStatuses);
        setPaidAmounts(newPaid);
        toast.info(`All students marked as ${targetStatus}`);
    };

    // Save Action
    const handleSubmit = async () => {
        if (!selectedCategoryId) return;
        setSaving(true);

        const updates = students.map(s => {
            const studentId = s.studentId;
            const total = totalAmounts[studentId] !== undefined ? totalAmounts[studentId] : s.totalAmount;
            const paid = paidAmounts[studentId] !== undefined ? paidAmounts[studentId] : s.paidAmount;
            const status = statuses[studentId] || s.status;

            return {
                studentId,
                status,
                paidAmount: paid,
                pendingAmount: Math.max(0, total - paid),
                totalAmount: total,
            };
        });

        const res = await bulkUpdateFees(selectedCategoryId, updates);

        if (res.success) {
            toast.success("Fee statuses and amounts updated successfully!");
            router.refresh();
        } else {
            toast.error("Failed to update fee records.");
        }
        setSaving(false);
    };

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    // Filtered Students
    const filteredStudents = useMemo(() => {
        return students.filter(item => {
            const currentStatus = statuses[item.studentId] || item.status;
            const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
            const matchesSearch = searchTerm.trim() === "" ||
                `${item.student?.name} ${item.student?.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.student?.rollNumber && item.student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesStatus && matchesSearch;
        });
    }, [students, statuses, statusFilter, searchTerm]);

    // Computed Stats
    const stats = useMemo(() => {
        const totalCount = students.length;
        let paidCount = 0;
        let partialCount = 0;
        let pendingCount = 0;
        let totalExpected = 0;
        let totalCollected = 0;

        students.forEach(s => {
            const st = statuses[s.studentId] || s.status;
            const total = totalAmounts[s.studentId] !== undefined ? totalAmounts[s.studentId] : (s.totalAmount || 0);
            const paid = paidAmounts[s.studentId] !== undefined ? paidAmounts[s.studentId] : (s.paidAmount || 0);

            if (st === 'PAID') paidCount++;
            else if (st === 'PARTIAL') partialCount++;
            else pendingCount++;

            totalExpected += total;
            totalCollected += paid;
        });

        const totalPending = Math.max(0, totalExpected - totalCollected);
        const collectionPercent = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

        return {
            totalCount,
            paidCount,
            partialCount,
            pendingCount,
            totalExpected,
            totalCollected,
            totalPending,
            collectionPercent,
        };
    }, [students, statuses, paidAmounts, totalAmounts]);

    // Derived Pending Amounts for PDF / child props
    const pendingAmounts = useMemo(() => {
        const map: { [studentId: string]: number } = {};
        students.forEach(s => {
            const total = totalAmounts[s.studentId] !== undefined ? totalAmounts[s.studentId] : s.totalAmount;
            const paid = paidAmounts[s.studentId] !== undefined ? paidAmounts[s.studentId] : s.paidAmount;
            map[s.studentId] = Math.max(0, total - paid);
        });
        return map;
    }, [students, totalAmounts, paidAmounts]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            {/* TOP HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-[#f16122] animate-pulse"></span>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Fee Collection & Amounts
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-lamaSkyLight text-lamaSky text-xs font-bold uppercase tracking-wider">
                            Class {className || classId}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        Track collection, customize paid amounts, and manage fee statuses in real time.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                    <FeeDownloadButton
                        students={students}
                        statuses={statuses}
                        paidAmounts={paidAmounts}
                        pendingAmounts={pendingAmounts}
                        totalAmounts={totalAmounts}
                        className={className || `${classId}`}
                        categoryName={selectedCategory?.name}
                        categoryAmount={selectedCategory?.baseAmount}
                    />

                    <button
                        type="button"
                        onClick={() => setShowQR(!showQR)}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-.01" /></svg>
                        {showQR ? "Hide QR" : "Payment QR"}
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving || loading || students.length === 0}
                        className="bg-gradient-to-r from-[#f16122] to-[#d84e12] hover:from-[#e05315] hover:to-[#c4430a] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95 cursor-pointer ml-auto sm:ml-0"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                <span>Save All Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* QR CODE DISPLAY */}
            {showQR && (
                <div className="p-6 bg-slate-50 border-2 border-dashed border-[#f16122]/30 rounded-2xl flex flex-col items-center animate-fade-in">
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col items-center">
                        <Image src="/logo.png" alt="Payment QR" width={160} height={160} className="object-contain" />
                        <div className="mt-3 text-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Scan to Pay UPI</span>
                            <p className="text-base font-black text-[#4e282c] mt-0.5 tracking-tight">DR CYRUS POONAWALLA EMS</p>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 font-medium">Show this official QR code to parents for instant fee payment.</p>
                </div>
            )}

            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Expected */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Expected</span>
                    <div className="mt-2">
                        <span className="text-xl sm:text-2xl font-black text-slate-800">
                            ₹{stats.totalExpected.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                            {stats.totalCount} enrolled students
                        </p>
                    </div>
                </div>

                {/* Collected */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Collected (Paid)</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                            {stats.collectionPercent}%
                        </span>
                    </div>
                    <div className="mt-2">
                        <span className="text-xl sm:text-2xl font-black text-emerald-700">
                            ₹{stats.totalCollected.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[11px] font-semibold text-emerald-600/90 mt-0.5">
                            {stats.paidCount} Full • {stats.partialCount} Partial
                        </p>
                    </div>
                </div>

                {/* Pending */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Pending Balance</span>
                    <div className="mt-2">
                        <span className="text-xl sm:text-2xl font-black text-rose-700">
                            ₹{stats.totalPending.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[11px] font-semibold text-rose-600/90 mt-0.5">
                            {stats.pendingCount + stats.partialCount} students with dues
                        </p>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Collection Status</span>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                            ✓ {stats.paidCount} Paid
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-extrabold">
                            ⏱ {stats.partialCount} Partial
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-extrabold">
                            ✕ {stats.pendingCount} Due
                        </span>
                    </div>
                </div>
            </div>

            {/* CATEGORY SELECTOR & CONTROLS TOOLBAR */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                {/* Category Dropdown */}
                <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                        Fee Category:
                    </label>
                    <select
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#f16122] shadow-2xs cursor-pointer"
                        value={selectedCategoryId || ""}
                        onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name} — (₹{Number(cat.baseAmount).toLocaleString("en-IN")})
                            </option>
                        ))}
                        {categories.length === 0 && <option value="">No fee categories assigned to this class</option>}
                    </select>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        placeholder="Search student or roll no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#f16122] shadow-2xs"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Bulk Action Buttons */}
                <div className="flex items-center gap-1.5 self-end md:self-center">
                    <button
                        type="button"
                        onClick={() => handleMarkAll('PAID')}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200/80 transition-all active:scale-95 cursor-pointer"
                        title="Mark all students as Paid"
                    >
                        All Paid
                    </button>
                    <button
                        type="button"
                        onClick={() => handleMarkAll('PENDING')}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200/80 transition-all active:scale-95 cursor-pointer"
                        title="Mark all students as Pending"
                    >
                        All Pending
                    </button>
                </div>
            </div>

            {/* STATUS FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Filter:</span>
                {[
                    { id: 'ALL', label: `All Students (${stats.totalCount})` },
                    { id: 'PAID', label: `Paid (${stats.paidCount})`, color: 'emerald' },
                    { id: 'PARTIAL', label: `Partial (${stats.partialCount})`, color: 'amber' },
                    { id: 'PENDING', label: `Pending Due (${stats.pendingCount})`, color: 'rose' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                            statusFilter === tab.id
                                ? "bg-slate-800 text-white shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* STUDENT CARDS GRID */}
            <div className="flex flex-col gap-3">
                {loading ? (
                    <div className="p-16 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-[#f16122]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading class fee data...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredStudents.map((item) => {
                            const studentId = item.studentId;
                            const total = totalAmounts[studentId] !== undefined ? totalAmounts[studentId] : item.totalAmount;
                            const paid = paidAmounts[studentId] !== undefined ? paidAmounts[studentId] : item.paidAmount;
                            const due = Math.max(0, total - paid);
                            const currentStatus = statuses[studentId] || item.status;

                            return (
                                <div
                                    key={item.id || studentId}
                                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between gap-4 group ${
                                        currentStatus === 'PAID'
                                            ? "bg-emerald-50/40 border-emerald-200/90 shadow-2xs hover:border-emerald-300"
                                            : currentStatus === 'PARTIAL'
                                            ? "bg-amber-50/40 border-amber-200/90 shadow-2xs hover:border-amber-300"
                                            : "bg-white border-slate-200/90 shadow-2xs hover:border-[#f16122]/50"
                                    }`}
                                >
                                    {/* CARD HEADER */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                                                {item.student?.name} {item.student?.surname || ""}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-semibold text-slate-400">
                                                <span>Roll: <strong className="text-slate-600">{item.student?.rollNumber || "N/A"}</strong></span>
                                                {item.student?.parentName && (
                                                    <span className="truncate">• {item.student.parentName}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status & Amount Badge */}
                                        <div
                                            className={`px-2.5 py-1 rounded-xl text-[11px] font-black tracking-wide shrink-0 shadow-2xs ${
                                                currentStatus === 'PAID'
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300/80"
                                                    : currentStatus === 'PARTIAL'
                                                    ? "bg-amber-100 text-amber-800 border border-amber-300/80"
                                                    : "bg-rose-100 text-rose-800 border border-rose-300/80"
                                            }`}
                                        >
                                            {currentStatus === 'PAID' && `PAID • ₹${paid.toLocaleString("en-IN")}`}
                                            {currentStatus === 'PARTIAL' && `PARTIAL • ₹${paid.toLocaleString("en-IN")}`}
                                            {currentStatus === 'PENDING' && `DUE • ₹${due.toLocaleString("en-IN")}`}
                                        </div>
                                    </div>

                                    {/* AMOUNT BREAKDOWN PILLS */}
                                    <div className="grid grid-cols-3 gap-2 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fee</span>
                                            <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                                                ₹{total.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                        <div className="flex flex-col border-x border-slate-100 px-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Paid</span>
                                            <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                                                ₹{paid.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Due</span>
                                            <span className="text-xs sm:text-sm font-extrabold text-rose-700">
                                                ₹{due.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* CUSTOM PAID AMOUNT INPUT */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={total}
                                                placeholder="Custom paid amount"
                                                value={paid === 0 ? "" : paid}
                                                onChange={(e) => handleCustomPaidChange(studentId, e.target.value)}
                                                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#f16122] shadow-2xs"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatus(studentId, 'PAID')}
                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-all active:scale-95 cursor-pointer"
                                            title="Fill total amount"
                                        >
                                            Full
                                        </button>
                                    </div>

                                    {/* QUICK ACTION BUTTONS */}
                                    <div className="flex gap-1.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatus(studentId, 'PAID')}
                                            className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wide transition-all uppercase cursor-pointer ${
                                                currentStatus === 'PAID'
                                                    ? "bg-emerald-600 text-white shadow-xs"
                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80"
                                            }`}
                                        >
                                            ✓ Paid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatus(studentId, 'PARTIAL')}
                                            className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wide transition-all uppercase cursor-pointer ${
                                                currentStatus === 'PARTIAL'
                                                    ? "bg-amber-500 text-white shadow-xs"
                                                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80"
                                            }`}
                                        >
                                            ⏱ Partial
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickStatus(studentId, 'PENDING')}
                                            className={`flex-1 py-2 rounded-xl text-xs font-black tracking-wide transition-all uppercase cursor-pointer ${
                                                currentStatus === 'PENDING'
                                                    ? "bg-rose-600 text-white shadow-xs"
                                                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80"
                                            }`}
                                        >
                                            ✕ Due
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {filteredStudents.length === 0 && !loading && (
                    <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🔍</span>
                        <p className="font-bold text-slate-600">No students match your filter or search.</p>
                        <p className="text-xs text-slate-400 font-semibold">Try changing the category or clearing the search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanceMarkingView;


"use client";
import { useState, useEffect } from "react";
import { getActiveCategoriesForClass, getStudentsByFeeCategory, bulkUpdateFees } from "@/lib/accountantActions";
import { getClassStudents } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";

type StudentType = {
    id: string;
    name: string;
    surname: string;
    StudentFee?: {
        status: 'PAID' | 'PARTIAL' | 'PENDING';
    }[];
};

const FinanceMarkingView = ({ classId }: { classId: number }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<{ [studentId: string]: 'PAID' | 'PARTIAL' | 'PENDING' }>({});
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const router = useRouter();

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

    // 2. Fetch Students and their status for the category
    useEffect(() => {
        if (classId && selectedCategoryId) {
            const fetchStudents = async () => {
                setLoading(true);
                const res = await getStudentsByFeeCategory(classId, selectedCategoryId, 1);
                const studentList = res.data || [];
                setStudents(studentList);

                const initialStatuses: any = {};
                studentList.forEach((item: any) => {
                    initialStatuses[item.studentId] = item.status;
                });
                setStatuses(initialStatuses);
                setLoading(false);
            };
            fetchStudents();
        }
    }, [classId, selectedCategoryId]);

    const handleStatusChange = (studentId: string, newStatus: 'PAID' | 'PARTIAL' | 'PENDING') => {
        setStatuses(prev => ({ ...prev, [studentId]: newStatus }));
    };

    const handleSubmit = async () => {
        if (!selectedCategoryId) return;
        setLoading(true);

        const updates = Object.keys(statuses).map(studentId => ({
            studentId,
            status: statuses[studentId]
        }));

        const res = await bulkUpdateFees(selectedCategoryId, updates);

        if (res.success) {
            toast.success("Fee statuses updated successfully!");
            router.refresh();
        } else {
            toast.error("Failed to update fee statuses.");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Fee Collection</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium italic">Mark manual payments for the class</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="flex items-center gap-2 bg-lamaSkyLight text-lamaSky px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-lamaSky hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-.01" /></svg>
                        {showQR ? "Hide QR Code" : "Show Payment QR"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || students.length === 0}
                        className="bg-lamaSky text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-lamaSky/20 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
                    >
                        {loading ? "Saving..." : "Save Statuses"}
                    </button>
                </div>
            </div>

            {/* QR CODE DISPLAY */}
            {showQR && (
                <div className="mb-8 p-6 bg-slate-50 border-2 border-dashed border-lamaSkyLight rounded-2xl flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <Image src="/logo.png" alt="Payment QR" width={200} height={200} className="opacity-50 grayscale" />
                        <div className="mt-4 text-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Scan to Pay</span>
                            <p className="text-lg font-black text-lamaSky mt-1 tracking-tight">SCHOOL FEES PORTAL</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 font-medium">Please display this QR code to parents for UPI payments.</p>
                </div>
            )}

            {/* CATEGORY SELECTOR */}
            <div className="mb-8 bg-lamaSkyLight/20 p-4 rounded-xl flex items-center gap-4">
                <label className="text-sm font-bold text-gray-600 min-w-fit uppercase tracking-wider">Fee Category:</label>
                <select
                    className="flex-1 p-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-lamaSky text-sm font-semibold text-gray-700 bg-white"
                    value={selectedCategoryId || ""}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} (₹{cat.baseAmount})</option>
                    ))}
                    {categories.length === 0 && <option value="">No categories assigned to this class</option>}
                </select>
            </div>

            {/* STUDENT LIST */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {students.map((item) => (
                        <div
                            key={item.id}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 group ${statuses[item.studentId] === 'PAID'
                                ? "bg-green-50 border-green-100 shadow-sm"
                                : statuses[item.studentId] === 'PARTIAL'
                                    ? "bg-amber-50 border-amber-100 shadow-sm"
                                    : "bg-white border-gray-100 hover:border-lamaSkyLight"
                                }`}
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800 leading-tight">{item.student?.name} {item.student?.surname}</span>
                                        <span className="text-[10px] text-gray-400 uppercase font-black mt-0.5 tracking-tighter">Roll No: {item.student?.rollNumber || "-"}</span>
                                    </div>
                                    <div className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest ${statuses[item.studentId] === 'PAID'
                                        ? "bg-green-100 text-green-700"
                                        : statuses[item.studentId] === 'PARTIAL'
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                        {statuses[item.studentId]}
                                    </div>
                                </div>

                                <div className="flex gap-1.5 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChange(item.studentId, 'PAID')}
                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all uppercase ${statuses[item.studentId] === 'PAID'
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                                            }`}
                                    >
                                        Paid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChange(item.studentId, 'PARTIAL')}
                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all uppercase ${statuses[item.studentId] === 'PARTIAL'
                                            ? "bg-amber-500 text-white"
                                            : "bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-600"
                                            }`}
                                    >
                                        Partial
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChange(item.studentId, 'PENDING')}
                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all uppercase ${statuses[item.studentId] === 'PENDING'
                                            ? "bg-red-500 text-white"
                                            : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                                            }`}
                                    >
                                        Pending
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {students.length === 0 && !loading && (
                    <div className="p-12 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                        <p className="font-bold text-gray-400">No students found with this fee category.</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black">Admin must assign fees to this category first.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanceMarkingView;

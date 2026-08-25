"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { fetchStudentsForCredentials, ClassGroup, StudentCredentialItem } from "@/lib/credentialsActions";
import { formatClassName } from "@/lib/utils";

interface StudentCredentialsPDFModalProps {
    initialClassId?: string | number;
    initialClassName?: string;
    classes?: { id: number; name: string }[];
}

export default function StudentCredentialsPDFModal({
    initialClassId,
    initialClassName,
    classes: propClasses,
}: StudentCredentialsPDFModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [classesList, setClassesList] = useState<{ id: number; name: string }[]>(propClasses || []);
    const [selectedClassId, setSelectedClassId] = useState<string>(
        initialClassId ? initialClassId.toString() : "all"
    );
    const [groupedData, setGroupedData] = useState<ClassGroup[]>([]);
    const [totalStudents, setTotalStudents] = useState<number>(0);

    // Credential configuration
    const [defaultPassword, setDefaultPassword] = useState<string>("dcpems@123");
    const [passwordFormat, setPasswordFormat] = useState<"fixed" | "roll" | "dob">("fixed");
    const [layoutMode, setLayoutMode] = useState<"table" | "cards">("table");
    const [activeTab, setActiveTab] = useState<"config" | "preview">("config");

    const pdfContainerRef = useRef<HTMLDivElement>(null);

    // Fetch data when modal opens or class changes
    const loadData = async (clsId: string) => {
        setLoading(true);
        try {
            const res = await fetchStudentsForCredentials(clsId === "all" ? undefined : clsId);
            if (res.success) {
                setGroupedData(res.groupedByClass);
                setTotalStudents(res.totalStudents);
                if (res.classes && res.classes.length > 0 && classesList.length === 0) {
                    setClassesList(res.classes);
                }
            }
        } catch (err) {
            console.error("Failed to load credential data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        loadData(selectedClassId);
    };

    const handleClassChange = (newClsId: string) => {
        setSelectedClassId(newClsId);
        loadData(newClsId);
    };

    // Helper to calculate displayed password
    const getStudentPassword = (student: StudentCredentialItem): string => {
        if (passwordFormat === "fixed") {
            return defaultPassword || "dcpems@123";
        }
        if (passwordFormat === "roll") {
            return student.rollNumber && student.rollNumber !== "N/A"
                ? `pass@${student.rollNumber}`
                : defaultPassword || "dcpems@123";
        }
        if (passwordFormat === "dob" && student.birthday) {
            try {
                const d = new Date(student.birthday);
                const dd = String(d.getDate()).padStart(2, "0");
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const yyyy = d.getFullYear();
                return `${dd}${mm}${yyyy}`;
            } catch {
                return defaultPassword || "dcpems@123";
            }
        }
        return defaultPassword || "dcpems@123";
    };

    // PDF Download Handler
    const handleDownloadPDF = async () => {
        if (typeof window === "undefined" || !pdfContainerRef.current) return;
        setGeneratingPdf(true);

        try {
            const html2pdf = (await import("html2pdf.js")).default;
            const element = pdfContainerRef.current;

            const wrapper = element.parentElement;
            if (wrapper) wrapper.style.display = "block";

            const selectedClassObj = classesList.find((c) => c.id.toString() === selectedClassId);
            const classNameTag = selectedClassId === "all" ? "All_Classes" : (selectedClassObj?.name || "Class").replace(/[^a-zA-Z0-9]/g, "_");
            const layoutTag = layoutMode === "table" ? "Roster" : "Cards";
            const filename = `DCPEMS_Student_Credentials_${classNameTag}_${layoutTag}.pdf`;

            const opt = {
                margin: layoutMode === "table" ? [8, 8, 8, 8] : [6, 6, 6, 6],
                filename: filename,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, windowWidth: 1200 },
                jsPDF: {
                    unit: "mm" as const,
                    format: "a4" as const,
                    orientation: layoutMode === "table" ? ("landscape" as const) : ("portrait" as const),
                },
                pagebreak: { mode: ["css", "legacy"] },
            };

            await html2pdf().set(opt as any).from(element).save();

            if (wrapper) wrapper.style.display = "none";
        } catch (error) {
            console.error("Error generating credentials PDF:", error);
            alert("An error occurred while generating the PDF. Please try again.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={handleOpen}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4e282c] to-[#6d1b22] hover:from-[#3d0f14] hover:to-[#57141a] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
                title="Generate Class-wise Student Login Credentials PDF"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-orange-400"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                    />
                </svg>
                <span>Credentials PDF</span>
            </button>

            {/* Main Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#4e282c] via-[#6d1b22] to-[#f16122] p-5 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6 text-orange-300"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black tracking-tight">
                                        Student Credentials PDF Generator
                                    </h2>
                                    <p className="text-xs text-orange-100 font-medium">
                                        Export class-wise login usernames & passwords for distribution
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-3">
                            <button
                                onClick={() => setActiveTab("config")}
                                className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all ${
                                    activeTab === "config"
                                        ? "border-[#f16122] text-[#4e282c]"
                                        : "border-transparent text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                ⚙️ Export Settings
                            </button>
                            <button
                                onClick={() => setActiveTab("preview")}
                                className={`pb-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all ${
                                    activeTab === "preview"
                                        ? "border-[#f16122] text-[#4e282c]"
                                        : "border-transparent text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                👁️ Live Preview ({totalStudents} Students)
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f16122]"></div>
                                    <p className="text-sm font-semibold">Loading student records...</p>
                                </div>
                            ) : activeTab === "config" ? (
                                <div className="space-y-6">
                                    {/* Class Selection & Summary Banner */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Select Target Class
                                            </label>
                                            <select
                                                value={selectedClassId}
                                                onChange={(e) => handleClassChange(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-[#f16122] focus:outline-none text-sm"
                                            >
                                                <option value="all">📚 All Classes (Full School Report)</option>
                                                {classesList.map((cls) => (
                                                    <option key={cls.id} value={cls.id.toString()}>
                                                        {formatClassName(cls.name)}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="text-[11px] text-gray-500">
                                                Choose a single class or export all classes arranged sequentially.
                                            </span>
                                        </div>

                                        <div className="bg-orange-50/80 border border-orange-200/80 rounded-xl p-4 flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                                                    Selected Scope
                                                </span>
                                                <h3 className="text-lg font-black text-gray-900 mt-0.5">
                                                    {selectedClassId === "all" ? "All Classes" : formatClassName(classesList.find((c) => c.id.toString() === selectedClassId)?.name)}
                                                </h3>
                                                <p className="text-xs text-orange-950 font-medium">
                                                    {groupedData.length} Class Section(s) • {totalStudents} Student(s)
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-orange-200/60 flex items-center justify-center text-orange-700 font-black text-lg">
                                                {totalStudents}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Configuration */}
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                                        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                                            🔑 Password Display Format on PDF
                                        </label>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <label
                                                className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                                                    passwordFormat === "fixed"
                                                        ? "border-[#f16122] bg-white shadow-xs text-[#4e282c]"
                                                        : "border-gray-200 bg-white/50 text-gray-600 hover:bg-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="pwdFormat"
                                                        checked={passwordFormat === "fixed"}
                                                        onChange={() => setPasswordFormat("fixed")}
                                                        className="text-[#f16122] focus:ring-[#f16122]"
                                                    />
                                                    <span className="text-xs font-bold">Standard Password</span>
                                                </div>
                                                <span className="text-[11px] text-gray-400 pl-5">
                                                    Fixed default password for all
                                                </span>
                                            </label>

                                            <label
                                                className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                                                    passwordFormat === "roll"
                                                        ? "border-[#f16122] bg-white shadow-xs text-[#4e282c]"
                                                        : "border-gray-200 bg-white/50 text-gray-600 hover:bg-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="pwdFormat"
                                                        checked={passwordFormat === "roll"}
                                                        onChange={() => setPasswordFormat("roll")}
                                                        className="text-[#f16122] focus:ring-[#f16122]"
                                                    />
                                                    <span className="text-xs font-bold">Roll No Based</span>
                                                </div>
                                                <span className="text-[11px] text-gray-400 pl-5">
                                                    e.g. pass@001, pass@002
                                                </span>
                                            </label>

                                            <label
                                                className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                                                    passwordFormat === "dob"
                                                        ? "border-[#f16122] bg-white shadow-xs text-[#4e282c]"
                                                        : "border-gray-200 bg-white/50 text-gray-600 hover:bg-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="pwdFormat"
                                                        checked={passwordFormat === "dob"}
                                                        onChange={() => setPasswordFormat("dob")}
                                                        className="text-[#f16122] focus:ring-[#f16122]"
                                                    />
                                                    <span className="text-xs font-bold">DOB (DDMMYYYY)</span>
                                                </div>
                                                <span className="text-[11px] text-gray-400 pl-5">
                                                    Student birth date format
                                                </span>
                                            </label>
                                        </div>

                                        {passwordFormat === "fixed" && (
                                            <div className="flex flex-col gap-1.5 pt-2">
                                                <label className="text-xs font-semibold text-gray-700">
                                                    Default Initial Password text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={defaultPassword}
                                                    onChange={(e) => setDefaultPassword(e.target.value)}
                                                    placeholder="e.g. dcpems@123"
                                                    className="w-full sm:w-80 p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 font-mono text-sm focus:ring-2 focus:ring-[#f16122] focus:outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Layout Selection */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                                            📄 PDF Layout Style
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div
                                                onClick={() => setLayoutMode("table")}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                                                    layoutMode === "table"
                                                        ? "border-[#f16122] bg-orange-50/40 shadow-xs"
                                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="p-2.5 bg-orange-100 text-[#f16122] rounded-xl shrink-0 font-bold">
                                                    📋
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">
                                                        Class Roster Sheet (Table View)
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Official tabular list with Sr, Roll No, Student Name, Username, Password, and Signature lines. Ideal for teachers.
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                onClick={() => setLayoutMode("cards")}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                                                    layoutMode === "cards"
                                                        ? "border-[#f16122] bg-orange-50/40 shadow-xs"
                                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 font-bold">
                                                    📇
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">
                                                        Individual Login Slips (Cut-out Cards)
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Grid of distinct login cards with School Crest, Student Details & Portal Instructions. Easy to cut & distribute to parents.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Live Preview Tab */
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
                                        <span>
                                            Showing sample data for <strong>{groupedData.length}</strong> class group(s). Click Download PDF below for the full print-ready document.
                                        </span>
                                        <span className="font-bold text-[#f16122] uppercase">
                                            Layout: {layoutMode.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Preview Content */}
                                    <div className="space-y-8">
                                        {groupedData.map((grp) => (
                                            <div key={grp.className} className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                                                <div className="bg-[#4e282c] text-white px-4 py-2.5 flex items-center justify-between">
                                                    <span className="font-bold text-sm">
                                                        Class: {formatClassName(grp.className)}
                                                    </span>
                                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">
                                                        {grp.students.length} Students
                                                    </span>
                                                </div>

                                                {layoutMode === "table" ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left text-xs border-collapse">
                                                            <thead>
                                                                <tr className="bg-gray-100 text-gray-700 font-bold border-b">
                                                                    <th className="p-2.5 w-12 text-center">Sr</th>
                                                                    <th className="p-2.5 w-20">Roll No</th>
                                                                    <th className="p-2.5">Student Name</th>
                                                                    <th className="p-2.5">Login Username</th>
                                                                    <th className="p-2.5">Initial Password</th>
                                                                    <th className="p-2.5">Login Email</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {grp.students.map((st, idx) => (
                                                                    <tr key={st.id || idx} className="hover:bg-gray-50">
                                                                        <td className="p-2.5 text-center font-bold text-gray-500">{idx + 1}</td>
                                                                        <td className="p-2.5 font-bold text-gray-800">{st.rollNumber}</td>
                                                                        <td className="p-2.5 font-semibold text-gray-900">{st.name} {st.surname}</td>
                                                                        <td className="p-2.5 font-mono font-bold text-[#f16122]">{st.username}</td>
                                                                        <td className="p-2.5 font-mono bg-gray-50 font-bold text-gray-700">{getStudentPassword(st)}</td>
                                                                        <td className="p-2.5 text-gray-500">{st.email}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50">
                                                        {grp.students.map((st, idx) => (
                                                            <div key={st.id || idx} className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                                                                <div className="flex items-center justify-between border-b pb-1.5">
                                                                    <div>
                                                                        <h5 className="font-bold text-xs text-gray-900">{st.name} {st.surname}</h5>
                                                                        <span className="text-[10px] text-gray-500">Roll No: {st.rollNumber} • {formatClassName(grp.className)}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase text-[#f16122] bg-orange-50 px-2 py-0.5 rounded">
                                                                        DCPEMS ERP
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div className="bg-gray-50 p-2 rounded-lg">
                                                                        <span className="text-[10px] text-gray-400 block font-semibold">USERNAME</span>
                                                                        <span className="font-mono font-bold text-gray-800">{st.username}</span>
                                                                    </div>
                                                                    <div className="bg-orange-50/60 p-2 rounded-lg">
                                                                        <span className="text-[10px] text-orange-600 block font-semibold">PASSWORD</span>
                                                                        <span className="font-mono font-bold text-orange-950">{getStudentPassword(st)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition"
                            >
                                Cancel
                            </button>

                            <div className="flex items-center gap-3">
                                {activeTab === "config" && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("preview")}
                                        className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition shadow-2xs"
                                    >
                                        Preview Output
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleDownloadPDF}
                                    disabled={generatingPdf || totalStudents === 0}
                                    className="flex items-center gap-2 bg-gradient-to-r from-[#f16122] to-[#d84e12] hover:from-[#e05315] hover:to-[#c4430a] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {generatingPdf ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>Building PDF...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                                                />
                                            </svg>
                                            <span>Download PDF ({totalStudents} Students)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Printable PDF Canvas */}
            <div style={{ display: "none" }}>
                <div
                    ref={pdfContainerRef}
                    className="p-4 text-black bg-white"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                >
                    {groupedData.map((group, groupIdx) => (
                        <div
                            key={group.className}
                            className="class-pdf-page"
                            style={{
                                pageBreakAfter: groupIdx < groupedData.length - 1 ? "always" : "auto",
                                breakAfter: groupIdx < groupedData.length - 1 ? "page" : "auto",
                                minHeight: "100%",
                                paddingBottom: "20px",
                                marginBottom: groupIdx < groupedData.length - 1 ? "30px" : "0",
                            }}
                        >
                            {/* School Header */}
                            <div className="relative mb-4 pb-2 border-b-2 border-gray-900 flex items-center justify-between">
                                <div style={{ width: "70px", height: "70px", position: "relative" }}>
                                    <Image
                                        src="/logo.png"
                                        alt="Logo"
                                        width={70}
                                        height={70}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="text-center flex-1 px-4">
                                    <h1
                                        className="text-xl font-bold uppercase tracking-tight text-black"
                                        style={{ lineHeight: "1.2" }}
                                    >
                                        DR CYRUS POONAWALLA ENGLISH MEDIUM SCHOOL
                                    </h1>
                                    <p className="text-[9pt] font-semibold text-gray-700 mt-0.5">
                                        Secondary & Higher Secondary Section • ERP Portal Credentials
                                    </p>
                                    <h2 className="text-[11pt] font-bold mt-1 uppercase tracking-wider text-slate-900">
                                        STUDENT LOGIN CREDENTIALS REPORT — {formatClassName(group.className)}
                                    </h2>
                                </div>
                                <div style={{ width: "70px", textAlign: "right" }}>
                                    <span className="text-[8pt] font-bold text-gray-500 uppercase">
                                        CONFIDENTIAL
                                    </span>
                                </div>
                            </div>

                            {/* Meta Information Bar */}
                            <div className="flex justify-between items-center mb-3 text-[9pt] font-semibold text-gray-800 border-b border-gray-300 pb-1">
                                <div>
                                    <span>Class: <strong>{formatClassName(group.className)}</strong></span>
                                    <span className="ml-6">Total Students: <strong>{group.students.length}</strong></span>
                                </div>
                                <div>
                                    <span>Portal URL: <strong>https://dcpems-erp.com/sign-in</strong></span>
                                </div>
                                <div>
                                    <span>Academic Session 2025-26</span>
                                </div>
                            </div>

                            {/* Format: Table View */}
                            {layoutMode === "table" ? (
                                <table className="w-full text-center border-collapse border border-slate-950 text-[9pt]">
                                    <thead>
                                        <tr className="bg-slate-100 font-bold uppercase">
                                            <th className="p-1.5 border border-slate-950 w-10">Sr</th>
                                            <th className="p-1.5 border border-slate-950 w-16">Roll No</th>
                                            <th className="p-1.5 border border-slate-950 text-left pl-3">Student Name</th>
                                            <th className="p-1.5 border border-slate-950 w-28 font-mono">Login Username</th>
                                            <th className="p-1.5 border border-slate-950 w-28 font-mono">Initial Password</th>
                                            <th className="p-1.5 border border-slate-950 text-left pl-3">Official Email</th>
                                            <th className="p-1.5 border border-slate-950 w-24">Parent Signature</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.students.map((student, idx) => (
                                            <tr
                                                key={student.id || idx}
                                                className={idx % 2 === 1 ? "bg-slate-50" : ""}
                                            >
                                                <td className="p-1.5 border border-slate-950 font-semibold">{idx + 1}</td>
                                                <td className="p-1.5 border border-slate-950 font-bold">{student.rollNumber || "N/A"}</td>
                                                <td className="p-1.5 border border-slate-950 text-left pl-3 font-semibold">
                                                    {student.name} {student.surname || ""}
                                                </td>
                                                <td className="p-1.5 border border-slate-950 font-mono font-bold text-black">
                                                    {student.username}
                                                </td>
                                                <td className="p-1.5 border border-slate-950 font-mono font-bold text-gray-900 bg-amber-50/40">
                                                    {getStudentPassword(student)}
                                                </td>
                                                <td className="p-1.5 border border-slate-950 text-left pl-3 text-[8pt]">
                                                    {student.email || "N/A"}
                                                </td>
                                                <td className="p-1.5 border border-slate-950"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                /* Format: Printable Cut-out Cards (2-columns) */
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "10px",
                                    }}
                                >
                                    {group.students.map((student, idx) => (
                                        <div
                                            key={student.id || idx}
                                            style={{
                                                border: "1.5px dashed #333",
                                                borderRadius: "6px",
                                                padding: "10px",
                                                backgroundColor: "#fff",
                                                pageBreakInside: "avoid",
                                                breakInside: "avoid",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    borderBottom: "1px solid #999",
                                                    paddingBottom: "4px",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <div>
                                                    <span style={{ fontSize: "9pt", fontWeight: "bold", textTransform: "uppercase" }}>
                                                        DR CYRUS POONAWALLA EMS
                                                    </span>
                                                    <span style={{ fontSize: "7pt", display: "block", color: "#555" }}>
                                                        Student Portal Login Slip
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: "8pt", fontWeight: "bold", background: "#eee", padding: "2px 6px", borderRadius: "3px" }}>
                                                    {formatClassName(group.className)}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: "9pt", marginBottom: "6px" }}>
                                                <div>
                                                    Student: <strong>{student.name} {student.surname || ""}</strong>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "8pt", color: "#444" }}>
                                                    <span>Roll No: <strong>{student.rollNumber || "N/A"}</strong></span>
                                                    <span>Session: 2025-26</span>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    background: "#f8f8f8",
                                                    border: "1px solid #ccc",
                                                    padding: "6px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "8.5pt",
                                                    fontFamily: "monospace",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <div>
                                                    <span style={{ color: "#666", fontSize: "7pt", display: "block" }}>USERNAME / ID</span>
                                                    <strong>{student.username}</strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: "#666", fontSize: "7pt", display: "block" }}>PASSWORD</span>
                                                    <strong>{getStudentPassword(student)}</strong>
                                                </div>
                                            </div>

                                            <div style={{ fontSize: "7pt", color: "#555", lineHeight: "1.2" }}>
                                                <div>🌐 Login: <strong>https://dcpems-erp.com/sign-in</strong></div>
                                                <div style={{ fontStyle: "italic", marginTop: "2px" }}>
                                                    * Please change password after initial login in profile settings.
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Signatures Footer */}
                            <div className="mt-8 flex justify-between items-end text-[9pt]">
                                <div className="text-center">
                                    <div className="w-40 border-b border-black mb-1"></div>
                                    <p className="font-bold">Class Teacher Signature</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[7.5pt] text-gray-500 mb-1">
                                        Generated on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                                    </p>
                                    <p className="text-[7.5pt] text-gray-400">Official ERP Portal Record</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-40 border-b border-black mb-1"></div>
                                    <p className="font-bold">Principal Signature</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

"use client";

import { useRef } from "react";
import Image from "next/image";

interface StudentFeeItem {
    id?: string;
    studentId: string;
    student?: {
        name: string;
        surname?: string;
        rollNumber?: string;
        email?: string;
        phone?: string;
        bloodType?: string;
        parentName?: string;
    };
    status: "PAID" | "PARTIAL" | "PENDING";
}

interface FeeDownloadButtonProps {
    students: StudentFeeItem[];
    statuses: { [studentId: string]: "PAID" | "PARTIAL" | "PENDING" };
    className: string;
    categoryName?: string;
    categoryAmount?: number;
}

const FeeDownloadButton = ({
    students,
    statuses,
    className,
    categoryName,
    categoryAmount,
}: FeeDownloadButtonProps) => {
    const pdfExportComponent = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (typeof window === "undefined") return;

        const html2pdf = (await import("html2pdf.js")).default;
        const element = pdfExportComponent.current;
        if (!element) return;

        const wrapper = element.parentElement;
        if (wrapper) wrapper.style.display = "block";

        const formattedCategory = categoryName ? categoryName.replace(/[^a-zA-Z0-9]/g, "_") : "Fee";
        const formattedClass = className ? className.replace(/[^a-zA-Z0-9]/g, "_") : "Class";

        const opt = {
            margin: 8,
            filename: `${formattedClass}_${formattedCategory}_Fee_Report.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, windowWidth: 1400 },
            jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "landscape" as const },
        };

        await html2pdf().set(opt).from(element).save();

        if (wrapper) wrapper.style.display = "none";
    };

    const totalStudents = students.length;
    const paidCount = students.filter(s => (statuses[s.studentId] || s.status) === "PAID").length;
    const partialCount = students.filter(s => (statuses[s.studentId] || s.status) === "PARTIAL").length;
    const pendingCount = students.filter(s => (statuses[s.studentId] || s.status) === "PENDING").length;
    const paidPercentage = totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0;
    const formattedDateString = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <button
                type="button"
                onClick={handleDownload}
                disabled={students.length === 0}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Download Fee PDF
            </button>

            {/* Hidden PDF Template */}
            <div style={{ display: "none" }}>
                <div
                    ref={pdfExportComponent}
                    className="pt-2 px-10 pb-10 text-black bg-white"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                >
                    {/* Header: Logo Left, Name Center */}
                    <div className="relative mb-6 pb-2 border-b-2 border-gray-800">
                        <div
                            style={{
                                position: "absolute",
                                left: "0",
                                top: "-5px",
                                width: "80px",
                                height: "80px",
                            }}
                        >
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                        <div className="text-center pt-0">
                            <h1
                                className="text-2xl font-bold uppercase"
                                style={{ margin: "0 90px", lineHeight: "1.2" }}
                            >
                                DR CYRUS POONAWALLA ENGLISH MEDIUM SCHOOL
                            </h1>
                            <p className="text-xs font-semibold text-gray-700 mt-1">
                                Secondary & Higher Secondary Section
                            </p>
                            <h2 className="text-lg font-bold mt-3 uppercase tracking-wider text-slate-900">
                                CLASS FEE COLLECTION REPORT
                            </h2>
                        </div>
                    </div>

                    {/* Metadata & Summary */}
                    <div className="flex justify-between items-center mb-6 text-xs">
                        <div>
                            <p className="font-bold text-sm">
                                Class: <span className="underline">{className || "N/A"}</span>
                            </p>
                            {categoryName && (
                                <p className="text-xs font-semibold text-gray-800 mt-1">
                                    Fee Category: <span className="font-bold">{categoryName}</span>
                                    {categoryAmount !== undefined && categoryAmount !== null && (
                                        <span className="text-gray-600 font-normal"> (₹{categoryAmount.toLocaleString("en-IN")})</span>
                                    )}
                                </p>
                            )}
                            <p className="text-xs font-semibold text-gray-600 mt-0.5">
                                Date: {formattedDateString}
                            </p>
                        </div>
                        <div className="text-right text-xs font-semibold bg-gray-50 p-3 rounded border border-gray-300">
                            <p>
                                Total Students: <span className="font-bold">{totalStudents}</span>
                            </p>
                            <p className="mt-0.5">
                                <span className="text-green-700">Paid: <span className="font-bold">{paidCount}</span></span>
                                {" | "}
                                <span className="text-amber-600">Partial: <span className="font-bold">{partialCount}</span></span>
                                {" | "}
                                <span className="text-red-600">Pending: <span className="font-bold">{pendingCount}</span></span>
                            </p>
                            <p className="mt-1">
                                Collection Rate: <span className="font-bold">{paidPercentage}%</span>
                            </p>
                        </div>
                    </div>

                    {/* Fee Status Table */}
                    <table className="w-full text-center border-collapse border-[1px] border-slate-950 text-[9pt]">
                        <thead>
                            <tr className="bg-slate-100 font-bold uppercase">
                                <th className="p-2 border border-slate-950 w-10">Sr</th>
                                <th className="p-2 border border-slate-950 w-20">Roll No</th>
                                <th className="p-2 border border-slate-950 text-left pl-3">Student Name</th>
                                <th className="p-2 border border-slate-950 text-left pl-3">Father Name</th>
                                <th className="p-2 border border-slate-950 w-28">Contact No</th>
                                <th className="p-2 border border-slate-950 text-left pl-3">Email ID</th>
                                <th className="p-2 border border-slate-950 w-24">Blood Group</th>
                                <th className="p-2 border border-slate-950 w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((item, idx) => {
                                const currentStatus = statuses[item.studentId] || item.status;
                                return (
                                    <tr key={item.id || item.studentId || idx} className={idx % 2 === 1 ? "bg-slate-50" : ""}>
                                        <td className="p-2 border border-slate-950 font-semibold">{idx + 1}</td>
                                        <td className="p-2 border border-slate-950 font-semibold">
                                            {item.student?.rollNumber || "N/A"}
                                        </td>
                                        <td className="p-2 border border-slate-950 text-left pl-3 font-semibold">
                                            {item.student?.name} {item.student?.surname || ""}
                                        </td>
                                        <td className="p-2 border border-slate-950 text-left pl-3 font-semibold">
                                            {item.student?.parentName || "N/A"}
                                        </td>
                                        <td className="p-2 border border-slate-950 font-semibold">
                                            {item.student?.phone || "N/A"}
                                        </td>
                                        <td className="p-2 border border-slate-950 text-left pl-3 font-semibold">
                                            {item.student?.email || "N/A"}
                                        </td>
                                        <td className="p-2 border border-slate-950 font-bold">
                                            {item.student?.bloodType || "N/A"}
                                        </td>
                                        <td
                                            className={`p-2 border border-slate-950 font-bold ${
                                                currentStatus === "PAID"
                                                    ? "text-green-700"
                                                    : currentStatus === "PARTIAL"
                                                    ? "text-amber-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {currentStatus}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Signatures */}
                    <div className="mt-12 flex justify-between items-end">
                        <div className="text-center">
                            <div className="w-44 border-b border-black mb-1"></div>
                            <p className="text-xs font-bold">Class Teacher Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="w-44 border-b border-black mb-1"></div>
                            <p className="text-xs font-bold">Principal / Accountant Signature</p>
                        </div>
                    </div>

                    <div className="mt-6 text-[8pt] text-gray-400">
                        Generated on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FeeDownloadButton;

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { formatClassName } from "@/lib/utils";
import {
    fetchMonthlyAttendanceReport,
    MonthlyAttendanceReportResult,
} from "@/lib/monthlyAttendanceActions";

interface MonthlyAttendanceModalProps {
    initialClassId?: number | string;
    initialClassName?: string;
    triggerLabel?: string;
    triggerClassName?: string;
    showTrigger?: boolean;
    buttonVariant?: "default" | "outline" | "compact";
    isOpen?: boolean;
    onClose?: () => void;
}

const MONTH_OPTIONS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

export default function MonthlyAttendanceModal(props: MonthlyAttendanceModalProps) {
    const {
        initialClassId,
        initialClassName,
        triggerLabel = "Monthly Attendance PDF",
        triggerClassName,
        showTrigger = true,
        buttonVariant = "default",
    } = props;

    const isControlled = props.isOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = isControlled ? Boolean(props.isOpen) : internalOpen;

    const [loading, setLoading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [selectedClassId, setSelectedClassId] = useState<string>(
        initialClassId ? initialClassId.toString() : ""
    );
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    const [report, setReport] = useState<MonthlyAttendanceReportResult | null>(null);

    const pdfContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialClassId) {
            setSelectedClassId(initialClassId.toString());
        }
    }, [initialClassId]);

    const closeModal = () => {
        if (isControlled && props.onClose) {
            props.onClose();
        } else {
            setInternalOpen(false);
        }
    };

    const yearOptions = [
        currentYear - 1,
        currentYear,
        currentYear + 1,
    ];

    // Load report data
    const loadReport = async (clsId: string, yr: number, mo: number) => {
        setLoading(true);
        try {
            const res = await fetchMonthlyAttendanceReport({
                classId: clsId || undefined,
                year: yr,
                month: mo,
            });
            setReport(res);
            if (!selectedClassId && res.classId) {
                setSelectedClassId(res.classId.toString());
            }
        } catch (err) {
            console.error("Failed to load monthly attendance report:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setInternalOpen(true);
        const targetId = selectedClassId || (initialClassId ? initialClassId.toString() : "");
        loadReport(targetId, selectedYear, selectedMonth);
    };

    useEffect(() => {
        if (isControlled && props.isOpen) {
            const targetId = selectedClassId || (initialClassId ? initialClassId.toString() : "");
            loadReport(targetId, selectedYear, selectedMonth);
        }
    }, [isControlled, props.isOpen, initialClassId]);

    const handleClassChange = (newClsId: string) => {
        setSelectedClassId(newClsId);
        loadReport(newClsId, selectedYear, selectedMonth);
    };

    const handleMonthChange = (newMonth: number) => {
        setSelectedMonth(newMonth);
        loadReport(selectedClassId, selectedYear, newMonth);
    };

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        loadReport(selectedClassId, newYear, selectedMonth);
    };

    // Direct Browser Print & Vector Landscape PDF Handler
    const handlePrint = () => {
        if (!pdfContainerRef.current) return;
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Popup blocked! Please allow popups to open the print dialog.");
            return;
        }

        const content = pdfContainerRef.current.innerHTML;
        const title = `Monthly_Attendance_${formatClassName(report?.className || "Class")}_${report?.monthName}_${report?.year}`;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @page {
                            size: A4 landscape;
                            margin: 6mm;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: #ffffff;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        table {
                            page-break-inside: auto;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        @media print {
                            body {
                                width: 100%;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${content}
                    <script>
                        window.onload = function() {
                            window.focus();
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 350);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Instant HTML2PDF Download
    const handleDownloadPdf = async () => {
        if (typeof window === "undefined" || !pdfContainerRef.current) return;

        setDownloadingPdf(true);
        try {
            const html2pdf = (await import("html2pdf.js")).default;
            const element = pdfContainerRef.current;
            const wrapper = element.parentElement;
            if (wrapper) wrapper.style.display = "block";

            const classTag = formatClassName(report?.className || "Class").replace(/[^a-zA-Z0-9]/g, "_");
            const filename = `DCPEMS_Monthly_Attendance_${classTag}_${report?.monthName}_${report?.year}.pdf`;

            const opt = {
                margin: 5,
                filename,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "landscape" as const },
            };

            await html2pdf().set(opt).from(element).save();
            if (wrapper) wrapper.style.display = "none";
        } catch (error) {
            console.error("Error generating monthly attendance PDF:", error);
            alert("Could not generate PDF directly. Trying high-resolution print window instead.");
            handlePrint();
        } finally {
            setDownloadingPdf(false);
        }
    };

    const displayClassName = report?.className
        ? formatClassName(report.className)
        : initialClassName
        ? formatClassName(initialClassName)
        : "Class";

    return (
        <>
            {showTrigger && (
                <button
                    type="button"
                    onClick={handleOpen}
                    className={
                        triggerClassName ||
                        (buttonVariant === "compact"
                            ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#4e282c] text-white hover:bg-[#3d1f22] transition shadow-xs cursor-pointer active:scale-95"
                            : buttonVariant === "outline"
                            ? "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-[#4e282c] text-[#4e282c] hover:bg-[#4e282c] hover:text-white transition shadow-xs cursor-pointer active:scale-95"
                            : "flex items-center gap-2 bg-gradient-to-r from-[#4e282c] to-[#6d1b22] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:brightness-110 transition shadow-sm cursor-pointer active:scale-95")
                    }
                    title="Download Monthly Attendance Register PDF"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-orange-300 shrink-0"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                        />
                    </svg>
                    <span>{triggerLabel}</span>
                </button>
            )}

            {/* Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#4e282c] via-[#6d1b22] to-[#f16122] p-4 sm:p-5 text-white flex items-center justify-between">
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
                                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black tracking-tight">
                                        Monthly Student Attendance Report
                                    </h2>
                                    <p className="text-xs text-orange-100 font-medium">
                                        Class-wise monthly register sheet with daily status & vector PDF download
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
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

                        {/* Filter Bar & Controls */}
                        <div className="bg-gray-50/90 border-b border-gray-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Class Selector */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                        Class
                                    </label>
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => handleClassChange(e.target.value)}
                                        className="p-2 sm:p-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-[#f16122] outline-none cursor-pointer"
                                    >
                                        {(report?.classes || []).map((cls) => (
                                            <option key={cls.id} value={cls.id.toString()}>
                                                {formatClassName(cls.name)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Month Selector */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                        Month
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
                                        className="p-2 sm:p-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-[#f16122] outline-none cursor-pointer"
                                    >
                                        {MONTH_OPTIONS.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year Selector */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                                        Year
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                                        className="p-2 sm:p-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-[#f16122] outline-none cursor-pointer"
                                    >
                                        {yearOptions.map((yr) => (
                                            <option key={yr} value={yr}>
                                                {yr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Refresh Button */}
                                <button
                                    type="button"
                                    onClick={() => loadReport(selectedClassId, selectedYear, selectedMonth)}
                                    disabled={loading}
                                    className="self-end p-2 sm:p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs transition cursor-pointer shadow-2xs"
                                    title="Refresh Data"
                                >
                                    ↻ Refresh
                                </button>
                            </div>

                            {/* Download & Print Buttons */}
                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    disabled={loading || !report?.students?.length}
                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-4 h-4 text-gray-600"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.72 13.829c-.24-1.048-.32-2.12-.32-3.212 0-3.957 2.47-7.25 6.012-8.528A9.034 9.034 0 0 1 12 2c4.97 0 9 4.03 9 9 0 1.092-.08 2.164-.32 3.212M6 20h12a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2Zm0-8h12V6H6v6Z"
                                        />
                                    </svg>
                                    <span>Print / Vector PDF</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadPdf}
                                    disabled={loading || downloadingPdf || !report?.students?.length}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                    {downloadingPdf ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>Generating PDF...</span>
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
                                            <span>Download PDF</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Summary Stats Banner */}
                        {report && !loading && (
                            <div className="px-6 py-3 bg-gradient-to-r from-orange-50/70 to-amber-50/70 border-b border-orange-200/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <span className="text-gray-500 font-medium">Class:</span>
                                    <span className="font-bold text-gray-900 ml-1.5">{displayClassName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 font-medium">Month:</span>
                                    <span className="font-bold text-[#f16122] ml-1.5">
                                        {report.monthName} {report.year}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 font-medium">Total Students:</span>
                                    <span className="font-bold text-gray-900 ml-1.5">
                                        {report.classStats.totalStudents}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 font-medium">Class Attendance Rate:</span>
                                    <span className="font-bold text-emerald-700 ml-1.5">
                                        {report.classStats.averageAttendancePercentage}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Body - Grid Preview */}
                        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f16122]"></div>
                                    <p className="text-sm font-semibold">Loading monthly attendance records...</p>
                                </div>
                            ) : !report || report.students.length === 0 ? (
                                <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
                                    No students found for this class or month.
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                                    <div className="overflow-x-auto max-h-[60vh]">
                                        <table className="w-full text-center border-collapse text-xs">
                                            <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 z-20 shadow-xs">
                                                {/* Header row 1: Day of week */}
                                                <tr className="border-b border-slate-300 text-[10px] text-gray-500">
                                                    <th className="p-2 border-r border-slate-200 w-10 sticky left-0 bg-slate-100 z-30"></th>
                                                    <th className="p-2 border-r border-slate-200 w-16 sticky left-10 bg-slate-100 z-30"></th>
                                                    <th className="p-2 border-r border-slate-300 text-left pl-3 min-w-[160px] sticky left-26 bg-slate-100 z-30"></th>
                                                    {report.dayDetails.map((dd) => (
                                                        <th
                                                            key={`dow-${dd.day}`}
                                                            className={`p-1 border-r border-slate-200 min-w-[26px] ${
                                                                dd.isSunday ? "bg-amber-100/70 text-amber-900 font-bold" : ""
                                                            }`}
                                                        >
                                                            {dd.dayOfWeek.slice(0, 1)}
                                                        </th>
                                                    ))}
                                                    <th className="p-2 border-r border-slate-200 min-w-[36px] bg-slate-100">WD</th>
                                                    <th className="p-2 border-r border-slate-200 min-w-[36px] bg-emerald-50 text-emerald-800">P</th>
                                                    <th className="p-2 border-r border-slate-200 min-w-[36px] bg-rose-50 text-rose-800">A</th>
                                                    <th className="p-2 min-w-[48px] bg-slate-100">%</th>
                                                </tr>

                                                {/* Header row 2: Day number */}
                                                <tr className="border-b-2 border-slate-300">
                                                    <th className="p-2 border-r border-slate-200 w-10 sticky left-0 bg-slate-100 z-30">Sr</th>
                                                    <th className="p-2 border-r border-slate-200 w-16 sticky left-10 bg-slate-100 z-30">Roll</th>
                                                    <th className="p-2 border-r border-slate-300 text-left pl-3 sticky left-26 bg-slate-100 z-30">
                                                        Student Name
                                                    </th>
                                                    {report.dayDetails.map((dd) => (
                                                        <th
                                                            key={`day-${dd.day}`}
                                                            className={`p-1 border-r border-slate-200 min-w-[26px] ${
                                                                dd.isSunday ? "bg-amber-100/70 text-amber-900" : ""
                                                            }`}
                                                        >
                                                            {dd.day}
                                                        </th>
                                                    ))}
                                                    <th className="p-2 border-r border-slate-200 text-gray-700">Days</th>
                                                    <th className="p-2 border-r border-slate-200 text-emerald-800 bg-emerald-50">Pres</th>
                                                    <th className="p-2 border-r border-slate-200 text-rose-800 bg-rose-50">Abs</th>
                                                    <th className="p-2 text-slate-900">Att %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {report.students.map((st, idx) => (
                                                    <tr
                                                        key={st.id || idx}
                                                        className={`hover:bg-amber-50/40 transition-colors ${
                                                            idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                                                        }`}
                                                    >
                                                        <td className="p-1.5 border-r border-slate-200 font-bold text-gray-500 sticky left-0 bg-inherit z-10">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="p-1.5 border-r border-slate-200 font-bold text-gray-900 font-mono sticky left-10 bg-inherit z-10">
                                                            {st.rollNumber}
                                                        </td>
                                                        <td className="p-1.5 border-r border-slate-300 text-left pl-3 font-semibold text-gray-900 whitespace-nowrap sticky left-26 bg-inherit z-10">
                                                            {st.name} {st.surname}
                                                        </td>
                                                        {report.dayDetails.map((dd) => {
                                                            const val = st.dailyStatus[dd.day];
                                                            return (
                                                                <td
                                                                    key={`st-${st.id}-d-${dd.day}`}
                                                                    className={`p-1 border-r border-slate-200 font-bold text-[11px] ${
                                                                        dd.isSunday
                                                                            ? "bg-amber-50/80 text-amber-700"
                                                                            : val === "P"
                                                                            ? "text-emerald-700 bg-emerald-50/30"
                                                                            : val === "A"
                                                                            ? "text-rose-700 bg-rose-100/60 font-black"
                                                                            : "text-slate-300"
                                                                    }`}
                                                                >
                                                                    {val === "Sun" ? "S" : val}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="p-1.5 border-r border-slate-200 font-bold text-slate-700">
                                                            {st.workingDays}
                                                        </td>
                                                        <td className="p-1.5 border-r border-slate-200 font-bold text-emerald-700 bg-emerald-50/40">
                                                            {st.totalPresent}
                                                        </td>
                                                        <td className="p-1.5 border-r border-slate-200 font-bold text-rose-700 bg-rose-50/40">
                                                            {st.totalAbsent}
                                                        </td>
                                                        <td className="p-1.5 font-bold text-slate-900">
                                                            {st.percentage}%
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            {/* Daily Totals Footer */}
                                            <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-400 sticky bottom-0 z-20">
                                                <tr>
                                                    <td colSpan={3} className="p-2 text-right pr-4 border-r border-slate-300 uppercase text-[11px]">
                                                        Daily Total Present:
                                                    </td>
                                                    {report.dayDetails.map((dd) => (
                                                        <td
                                                            key={`tot-p-${dd.day}`}
                                                            className={`p-1 border-r border-slate-200 text-[11px] text-emerald-800 ${
                                                                dd.isSunday ? "bg-amber-100/50" : ""
                                                            }`}
                                                        >
                                                            {dd.isSunday ? "-" : report.dailyTotals[dd.day]?.present || 0}
                                                        </td>
                                                    ))}
                                                    <td colSpan={4} className="p-2 text-center text-xs">
                                                        Avg: {report.classStats.averageAttendancePercentage}%
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-white border-t border-gray-200 p-4 px-6 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                                    <span className="font-semibold text-gray-700">P = Present</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                                    <span className="font-semibold text-gray-700">A = Absent</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded bg-amber-200 inline-block"></span>
                                    <span className="font-semibold text-gray-700">S = Sunday</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-400">-</span>
                                    <span className="font-semibold text-gray-700">No Record</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Landscape Printable Template for Browser Print & html2pdf */}
            <div style={{ display: "none" }}>
                {report && (
                    <div
                        ref={pdfContainerRef}
                        style={{
                            padding: "10mm 10mm",
                            background: "#ffffff",
                            color: "#000000",
                            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            fontSize: "8pt",
                        }}
                    >
                        {/* School Header */}
                        <div style={{ textAlign: "center", position: "relative", marginBottom: "8px", borderBottom: "2px solid #333", paddingBottom: "8px" }}>
                            <div style={{ position: "absolute", left: "0", top: "0", width: "65px", height: "65px" }}>
                                <Image
                                    src="/logo.png"
                                    alt="School Logo"
                                    width={65}
                                    height={65}
                                    style={{ objectFit: "contain" }}
                                />
                            </div>
                            <div style={{ margin: "0 70px" }}>
                                <h1 style={{ fontSize: "16pt", fontWeight: "900", margin: "0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    DR CYRUS POONAWALLA ENGLISH MEDIUM SCHOOL
                                </h1>
                                <p style={{ fontSize: "8pt", margin: "2px 0", color: "#333", fontWeight: "600" }}>
                                    Recognized by Govt. of Maharashtra | Affiliated to CBSE
                                </p>
                                <h2 style={{ fontSize: "11pt", fontWeight: "bold", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "1px", color: "#111" }}>
                                    MONTHLY STUDENT ATTENDANCE REGISTER — {report.monthName.toUpperCase()} {report.year}
                                </h2>
                            </div>
                        </div>

                        {/* Metadata Bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "8.5pt", fontWeight: "bold" }}>
                            <div>
                                <span>Class: <u>{displayClassName}</u></span>
                                {report.supervisorName && (
                                    <span style={{ marginLeft: "15px" }}>Class Teacher: <u>{report.supervisorName}</u></span>
                                )}
                            </div>
                            <div>
                                <span>Month: <u>{report.monthName} {report.year}</u></span>
                                <span style={{ marginLeft: "15px" }}>Total Students: <u>{report.classStats.totalStudents}</u></span>
                                <span style={{ marginLeft: "15px" }}>Class Avg Attendance: <u>{report.classStats.averageAttendancePercentage}%</u></span>
                            </div>
                        </div>

                        {/* Main Landscape Attendance Table */}
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                border: "1px solid #000000",
                                textAlign: "center",
                                fontSize: "7.5pt",
                                lineHeight: "1.1",
                            }}
                        >
                            <thead>
                                <tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                                    <th style={{ border: "1px solid #000", width: "22px", padding: "2px" }}>Sr</th>
                                    <th style={{ border: "1px solid #000", width: "32px", padding: "2px" }}>Roll</th>
                                    <th style={{ border: "1px solid #000", textAlign: "left", padding: "2px 4px", minWidth: "120px" }}>Student Name</th>
                                    {report.dayDetails.map((dd) => (
                                        <th
                                            key={`p-h-${dd.day}`}
                                            style={{
                                                border: "1px solid #000",
                                                width: "18px",
                                                padding: "1px 0",
                                                background: dd.isSunday ? "#fef3c7" : "#f1f5f9",
                                            }}
                                        >
                                            <div style={{ fontSize: "6pt", color: dd.isSunday ? "#b45309" : "#666" }}>
                                                {dd.dayOfWeek.slice(0, 1)}
                                            </div>
                                            <div>{dd.day}</div>
                                        </th>
                                    ))}
                                    <th style={{ border: "1px solid #000", width: "24px", padding: "2px" }}>WD</th>
                                    <th style={{ border: "1px solid #000", width: "24px", padding: "2px", color: "#166534" }}>P</th>
                                    <th style={{ border: "1px solid #000", width: "24px", padding: "2px", color: "#991b1b" }}>A</th>
                                    <th style={{ border: "1px solid #000", width: "30px", padding: "2px" }}>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.students.map((st, idx) => (
                                    <tr
                                        key={`p-row-${st.id || idx}`}
                                        style={{ background: idx % 2 === 1 ? "#fafafa" : "#ffffff" }}
                                    >
                                        <td style={{ border: "1px solid #000", padding: "2px" }}>{idx + 1}</td>
                                        <td style={{ border: "1px solid #000", padding: "2px", fontWeight: "bold" }}>
                                            {st.rollNumber}
                                        </td>
                                        <td style={{ border: "1px solid #000", textAlign: "left", padding: "2px 4px", fontWeight: "600", whiteSpace: "nowrap" }}>
                                            {st.name} {st.surname}
                                        </td>
                                        {report.dayDetails.map((dd) => {
                                            const val = st.dailyStatus[dd.day];
                                            return (
                                                <td
                                                    key={`p-cell-${st.id}-${dd.day}`}
                                                    style={{
                                                        border: "1px solid #000",
                                                        padding: "1px 0",
                                                        fontWeight: val === "A" ? "bold" : "normal",
                                                        color: val === "A" ? "#b91c1c" : val === "P" ? "#15803d" : "#777",
                                                        background: dd.isSunday ? "#fffbeb" : val === "A" ? "#fee2e2" : "inherit",
                                                    }}
                                                >
                                                    {val === "Sun" ? "S" : val}
                                                </td>
                                            );
                                        })}
                                        <td style={{ border: "1px solid #000", padding: "2px", fontWeight: "bold" }}>{st.workingDays}</td>
                                        <td style={{ border: "1px solid #000", padding: "2px", fontWeight: "bold", color: "#166534" }}>{st.totalPresent}</td>
                                        <td style={{ border: "1px solid #000", padding: "2px", fontWeight: "bold", color: "#991b1b" }}>{st.totalAbsent}</td>
                                        <td style={{ border: "1px solid #000", padding: "2px", fontWeight: "bold" }}>{st.percentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                                    <td colSpan={3} style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", textTransform: "uppercase" }}>
                                        Total Present:
                                    </td>
                                    {report.dayDetails.map((dd) => (
                                        <td
                                            key={`p-tot-${dd.day}`}
                                            style={{
                                                border: "1px solid #000",
                                                padding: "2px 0",
                                                background: dd.isSunday ? "#fef3c7" : "inherit",
                                                color: "#166534",
                                            }}
                                        >
                                            {dd.isSunday ? "-" : report.dailyTotals[dd.day]?.present || 0}
                                        </td>
                                    ))}
                                    <td colSpan={4} style={{ border: "1px solid #000", padding: "3px" }}>
                                        Avg: {report.classStats.averageAttendancePercentage}%
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Signatures & Footer */}
                        <div style={{ marginTop: "25px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: "160px", borderBottom: "1px solid #000", marginBottom: "4px" }}></div>
                                <span style={{ fontSize: "8pt", fontWeight: "bold" }}>Class Teacher Signature</span>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: "160px", borderBottom: "1px solid #000", marginBottom: "4px" }}></div>
                                <span style={{ fontSize: "8pt", fontWeight: "bold" }}>Checker / Supervisor</span>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: "160px", borderBottom: "1px solid #000", marginBottom: "4px" }}></div>
                                <span style={{ fontSize: "8pt", fontWeight: "bold" }}>Principal Signature</span>
                            </div>
                        </div>

                        <div style={{ marginTop: "10px", fontSize: "6.5pt", color: "#777", display: "flex", justifyContent: "space-between" }}>
                            <span>DCPEMS ERP Portal • Monthly Student Attendance Register</span>
                            <span>Generated on: {new Date().toLocaleDateString("en-GB")} {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

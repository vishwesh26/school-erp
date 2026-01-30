"use client";

import { useRef } from "react";
import Image from "next/image";

interface Student {
    id: string;
    name: string;
    surname: string;
    rollNumber: string;
}

const StudentListDownloadButton = ({
    students,
    className,
}: {
    students: Student[];
    className: string;
}) => {
    const pdfExportComponent = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (typeof window === "undefined") return;

        // Import html2pdf dynamically to avoid SSR issues
        const html2pdf = (await import("html2pdf.js")).default;

        const element = pdfExportComponent.current;
        if (!element) return;

        const opt = {
            margin: 10,
            filename: `${className}_Student_List.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <>
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-lamaSky text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-opacity-80 transition-all shadow-sm active:scale-95"
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
                Download PDF
            </button>

            {/* Hidden PDF Template */}
            <div className="hidden">
                <div
                    ref={pdfExportComponent}
                    className="pt-2 px-10 pb-10 text-black bg-white"
                    style={{ fontFamily: "'Times New Roman', serif" }}
                >
                    {/* Header: Logo Left, Name Center */}
                    <div className="relative mb-6 pb-2">
                        <div style={{
                            position: "absolute",
                            left: "0",
                            top: "-5px",
                            width: "90px",
                            height: "90px"
                        }}>
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={90}
                                height={90}
                                className="object-contain"
                            />
                        </div>
                        <div className="text-center pt-0">
                            <h1 className="text-2xl font-bold uppercase" style={{ margin: "0 100px", lineHeight: "1.2" }}>
                                DR CYRUS POONAWALLA ENGLISH MEDIUM SCHOOL
                            </h1>
                            <p className="text-sm font-semibold text-gray-700 mt-1">Secondary & Higher Secondary Section</p>
                            <h2 className="text-xl font-bold mt-4 underline decoration-slate-400 decoration-1 underline-offset-4">
                                Class {className}
                            </h2>
                            <p className="text-xs font-semibold mt-1">Academic Session 2025-26</p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-center border-collapse border-[1px] border-slate-950 text-[11pt]">
                        <thead>
                            <tr className="bg-slate-50 font-bold">
                                <th className="p-2 border border-slate-950 w-24">Roll No</th>
                                <th className="p-2 border border-slate-950">Name of Student</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className="p-2 border border-slate-950">
                                        {student.rollNumber || "N/A"}
                                    </td>
                                    <td className="p-2 border border-slate-950 text-left pl-6">
                                        {student.name} {student.surname}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="mt-16 flex justify-end">
                        <div className="text-center">
                            <div className="w-48 border-b border-black mb-1"></div>
                            <p className="text-sm font-bold">Principal Signature</p>
                        </div>
                    </div>

                    <div className="mt-8 text-[8pt] text-gray-400">
                        Generated on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentListDownloadButton;

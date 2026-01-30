"use client";

import Image from "next/image";
import { useRef } from "react";
// html2pdf.js does not have easy TS types, often requires ignore or any
// import html2pdf from "html2pdf.js"; 

const AssignmentView = ({ assignment }: { assignment: any }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = async () => {
        if (!contentRef.current) return;

        // Dynamically import html2pdf to ensure client-side execution
        // @ts-ignore
        const html2pdf = (await import("html2pdf.js")).default;

        const opt = {
            margin: 10,
            filename: `${assignment.title.replace(/\s+/g, '_')}_assignment.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(contentRef.current).set(opt).save();
    };

    return (
        <div className="flex gap-4 flex-col xl:flex-row">
            {/* LEFT: CONTENT TO PRINT */}
            <div className="w-full xl:w-2/3 bg-white p-8 rounded-md" ref={contentRef}>
                <div className="border-b pb-4 mb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{assignment.title}</h1>
                        <span className="text-sm text-gray-400">
                            Subject: {assignment.subject?.name} | Class: {assignment.class?.name}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">Due Date</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Teacher</h2>
                    <div className="flex items-center gap-2">
                        <Image
                            src={assignment.teacher?.img || "/noAvatar.png"}
                            alt="Teacher"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-600">
                            {assignment.teacher ? `${assignment.teacher.name} ${assignment.teacher.surname}` : 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Questions / Instructions</h2>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {assignment.description || "No description provided."}
                    </div>
                </div>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Actions</h2>
                    <button
                        onClick={handleDownloadPdf}
                        className="w-full flex items-center justify-center gap-2 bg-lamaSky text-black py-3 px-4 rounded-md font-medium hover:bg-lamaSkyLight transition-colors"
                    >
                        <Image src="/download.png" alt="" width={16} height={16} />
                        Download as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentView;

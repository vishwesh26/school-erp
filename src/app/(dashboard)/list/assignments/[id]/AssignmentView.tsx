"use client";

import Image from "next/image";
import { useRef } from "react";

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

        html2pdf().from(contentRef.current).set(opt as any).save();
    };

    const handleOpenUploadedPdf = () => {
        if (!assignment?.pdfUrl) return;
        if (assignment.pdfUrl.startsWith("data:application/pdf")) {
            const win = window.open();
            if (win) {
                win.document.write(
                    `<iframe src="${assignment.pdfUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                );
            }
        } else {
            window.open(assignment.pdfUrl, "_blank");
        }
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

                {assignment.pdfUrl && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xl font-bold">
                                📄
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 text-sm">Attached Assignment PDF</h3>
                                <p className="text-xs text-blue-700">Uploaded by teacher for students</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenUploadedPdf}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm flex items-center gap-1.5 justify-center"
                        >
                            <span>View / Download PDF</span>
                            <span>↗</span>
                        </button>
                    </div>
                )}

                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Questions / Instructions</h2>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {assignment.description || "No description provided."}
                    </div>
                </div>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm flex flex-col gap-3">
                    <h2 className="text-lg font-semibold mb-2">Actions</h2>
                    {assignment.pdfUrl && (
                        <button
                            onClick={handleOpenUploadedPdf}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <span className="text-lg">📄</span>
                            View Attached PDF
                        </button>
                    )}
                    <button
                        onClick={handleDownloadPdf}
                        className="w-full flex items-center justify-center gap-2 bg-lamaSky text-black py-3 px-4 rounded-md font-medium hover:bg-lamaSkyLight transition-colors"
                    >
                        <Image src="/download.png" alt="" width={16} height={16} />
                        Download Page as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentView;

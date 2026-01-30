"use client";

import { useState } from "react";
import LeavingCertificateForm from "./LeavingCertificateForm";
import BonafideCertificateForm from "./BonafideCertificateForm";
import AdmissionForm from "./AdmissionForm";

const CertificateGenerator = ({ students }: { students: any[] }) => {
    const [certType, setCertType] = useState<"leaving" | "bonafide" | "admission">("leaving");

    const selectedStudent = students[0];

    return (
        <div className="flex flex-col gap-6">
            {/* SELECTION AREA */}
            <div className="bg-slate-50 p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-4 max-w-2xl">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Select Document Type</label>
                        {certType === "admission" && !selectedStudent && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold animate-pulse">
                                Prospective Student Mode (Blank Form)
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setCertType("leaving")}
                            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${certType === "leaving"
                                ? "bg-lamaSky text-white shadow-lg scale-[1.02]"
                                : "bg-white text-gray-500 border border-gray-200 hover:border-lamaSky hover:text-lamaSky"
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M17 11l2 2 4-4" /></svg>
                            Leaving Certificate
                        </button>
                        <button
                            onClick={() => setCertType("bonafide")}
                            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${certType === "bonafide"
                                ? "bg-lamaSky text-white shadow-lg scale-[1.02]"
                                : "bg-white text-gray-500 border border-gray-200 hover:border-lamaSky hover:text-lamaSky"
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            Bonafide Certificate
                        </button>
                        <button
                            onClick={() => setCertType("admission")}
                            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${certType === "admission"
                                ? "bg-lamaSky text-white shadow-lg scale-[1.02]"
                                : "bg-white text-gray-500 border border-gray-200 hover:border-lamaSky hover:text-lamaSky"
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M7 14h.01" /><path d="M7 18h.01" /><path d="M11 14h.01" /><path d="M11 18h.01" /><path d="M15 14h.01" /><path d="M15 18h.01" /></svg>
                            Admission Form
                        </button>
                    </div>
                </div>
            </div>

            {/* FORM AREA */}
            <div className="mt-2">
                {!selectedStudent && certType !== "admission" ? (
                    <div className="p-12 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400">
                        <p className="font-bold text-lg">No Student Selected</p>
                        <p className="text-sm">Please select a student from the drill-down to generate certificates.</p>
                    </div>
                ) : (
                    <>
                        {certType === "leaving" && <LeavingCertificateForm student={selectedStudent} />}
                        {certType === "bonafide" && <BonafideCertificateForm student={selectedStudent} />}
                        {certType === "admission" && <AdmissionForm student={selectedStudent} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default CertificateGenerator;

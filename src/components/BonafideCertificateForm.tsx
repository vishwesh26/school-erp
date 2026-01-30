"use client";

import { useForm } from "react-hook-form";
import { useRef, useEffect } from "react";
import Image from "next/image";

const BonafideCertificateForm = ({ student }: { student: any }) => {
    const pdfExportComponent = useRef<HTMLDivElement>(null);

    const { register, reset, watch } = useForm({
        defaultValues: {
            date: new Date().toLocaleDateString('en-GB'),
            refNo: `dcpems/bonafide/${new Date().getFullYear()}/`,
            regNo: student?.rollNumber || "",
            studentName: `${student?.name} ${student?.surname}`.toUpperCase(),
            fatherName: (`${student?.parent?.name} ${student?.parent?.surname}`.toUpperCase()) || "",
            class: student?.class?.name || "",
            academicYear: "2025-2026",
            dob: student?.birthday ? new Date(student?.birthday).toLocaleDateString('en-GB') : "",
            dobWords: "",
            religion: (student?.religion || "").toUpperCase(),
            caste: (student?.caste || "").toUpperCase(),
            purpose: "Passport / Bank Account / Scholarship",
            place: "Uruli Kanchan"
        },
    });

    useEffect(() => {
        reset({
            date: new Date().toLocaleDateString('en-GB'),
            refNo: `dcpems/bonafide/${new Date().getFullYear()}/`,
            regNo: student?.rollNumber || "",
            studentName: `${student?.name} ${student?.surname}`.toUpperCase(),
            fatherName: (`${student?.parent?.name} ${student?.parent?.surname}`.toUpperCase()) || "",
            class: student?.class?.name || "",
            academicYear: "2025-2026",
            dob: student?.birthday ? new Date(student?.birthday).toLocaleDateString('en-GB') : "",
            dobWords: "",
            religion: student?.religion || "",
            caste: student?.caste || "",
            purpose: "Passport / Bank Account / Scholarship",
            place: "Uruli Kanchan"
        });
    }, [student, reset]);

    const formValues = watch();

    const handleDownload = async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = pdfExportComponent.current;
        if (!element) return;

        const opt = {
            margin: 0,
            filename: `Bonafide_Certificate_${student?.name}_${student?.surname}.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORM */}
            <div className="bg-slate-50 p-6 rounded-lg shadow-inner border border-gray-100 h-fit">
                <h2 className="text-lg font-bold mb-4 text-lamaSky">Bonafide Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Ref. No.</label>
                        <input {...register("refNo")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Reg. No.</label>
                        <input {...register("regNo")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-semibold text-gray-500">Student Name</label>
                        <input {...register("studentName")} className="p-2 text-sm border rounded outline-none uppercase font-semibold" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Class (Std)</label>
                        <input {...register("class")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Academic Year</label>
                        <input {...register("academicYear")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Birth Date</label>
                        <input {...register("dob")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Birth Date (In Words)</label>
                        <input {...register("dobWords")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Religion</label>
                        <input {...register("religion")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Caste</label>
                        <input {...register("caste")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs font-semibold text-gray-500">Purpose</label>
                        <input {...register("purpose")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Certificate Date</label>
                        <input {...register("date")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Place</label>
                        <input {...register("place")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="w-full mt-6 bg-lamaSky text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Download Bonafide PDF
                </button>
            </div>

            {/* PREVIEW */}
            <div className="bg-white border p-4 rounded-lg overflow-x-auto shadow-sm">
                <div className="origin-top scale-[0.55] md:scale-[0.75] lg:scale-[0.55]" style={{ width: "210mm" }}>
                    <div
                        ref={pdfExportComponent}
                        className="text-black bg-white relative p-8 border-[6px] border-double border-black"
                        style={{
                            fontFamily: "'Times New Roman', serif",
                            width: "794px",
                            fontSize: "13px",
                            lineHeight: "1.4"
                        }}
                    >
                        {/* HEADER MATCHING OFFICIAL BRANDING */}
                        <div className="flex items-center gap-4 mb-4">
                            <Image src="/logo.png" alt="logo" width={96} height={96} className="object-contain" />
                            <div className="flex-1 text-center">
                                <p className="text-xs font-bold m-0" style={{ color: '#800000' }}>Mahatma Gandhi Sarvodaya Sangh&apos;s</p>
                                <h1 className="text-4xl font-extrabold italic m-0" style={{
                                    color: '#800000',
                                    fontFamily: "'Brush Script MT', cursive, serif"
                                }}>
                                    Dr. Cyrus Poonawalla English Medium School
                                </h1>
                                <p className="text-[10px] font-bold mt-1 mb-0">Uruli Kanchan, Tal : Haveli, Dist : Pune 412202. Ph(020) 26927272</p>
                                <p className="text-[10px] font-bold m-0">UDISE : 27250507717 CBSE Affiliation Code : 1130365 School Code : 30256</p>
                                <p className="text-[10px] m-0">Email : dcpems@gmail.com / Website : www.dcpems.in</p>
                            </div>
                        </div>

                        <div className="w-full h-[1.5px] bg-black mb-4"></div>

                        {/* TOP INFO ROW: REF NO AND REG NO */}
                        <div className="flex justify-between items-baseline mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold">Ref.No.:-</span>
                                <span className="border-b border-black min-w-[200px] px-2 text-center pb-[4px] font-semibold">{formValues.refNo}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold">Reg. No.:-</span>
                                <span className="border-b border-black min-w-[120px] px-2 text-center pb-[4px] font-bold">{formValues.regNo}</span>
                            </div>
                        </div>

                        {/* TITLE AND PHOTO BOX */}
                        <div className="relative mb-8 mt-4">
                            <h2 className="text-3xl font-bold text-center uppercase tracking-[0.2em]" style={{ textDecoration: 'underline double', textUnderlineOffset: '8px' }}>
                                Bonafide Certificate
                            </h2>
                            <div className="absolute right-0 -top-4 w-28 h-32 border-2 border-black flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
                                <span className="text-[10px] font-bold text-gray-400">PASSPORT SIZE</span>
                                <span className="text-[10px] font-bold text-gray-400">PHOTO</span>
                            </div>
                        </div>

                        {/* DATE ROW */}
                        <div className="flex justify-start mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold">Date:-</span>
                                <span className="border-b border-black min-w-[120px] px-2 text-center pb-[4px]">{formValues.date}</span>
                            </div>
                        </div>

                        {/* BODY CONTENT - NARRATIVE STRUCTURE */}
                        <div className="space-y-6 text-justify px-6 text-[15px] leading-[2.2]">
                            <p className="indent-16 m-0">
                                This is to certify that Kumar / Kumari <span className="font-bold border-b border-black px-4 min-w-[380px] text-center inline-block pb-[4px] translate-y-[2px]">{formValues.studentName}</span>
                                is a Bonafide student of our School studying in std. <span className="font-bold border-b border-black px-4 min-w-[100px] text-center inline-block pb-[4px] translate-y-[2px]">{formValues.class}</span>
                                in the academic year <span className="font-bold border-b border-black px-4 min-w-[180px] text-center inline-block pb-[4px] translate-y-[2px]">{formValues.academicYear}</span>.
                            </p>

                            <p className="m-0">
                                His/her birth date according to our school general register is <span className="font-bold border-b border-black px-4 min-w-[160px] text-center inline-block pb-[4px] translate-y-[2px]">{formValues.dob}</span>
                                (In Words) <span className="font-bold border-b border-black px-4 flex-1 min-w-[300px] text-center inline-block pb-[4px] translate-y-[2px]">{formValues.dobWords || "......................................................................."}</span>.
                            </p>

                            <div className="flex items-baseline gap-x-12 mt-4">
                                <div className="flex items-baseline gap-2 flex-1">
                                    <span className="font-bold whitespace-nowrap">Religion :-</span>
                                    <span className="border-b border-black flex-1 px-4 text-center font-bold pb-[4px] translate-y-[2px]">{formValues.religion}</span>
                                </div>
                                <div className="flex items-baseline gap-2 flex-1">
                                    <span className="font-bold whitespace-nowrap">Caste :-</span>
                                    <span className="border-b border-black flex-1 px-4 text-center font-bold pb-[4px] translate-y-[2px]">{formValues.caste}</span>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER PLACE/SIGNATURES */}
                        <div className="mt-8 px-6">
                            <div className="flex items-baseline gap-1 mb-12">
                                <span className="font-bold">Place :-</span>
                                <span className="font-bold border-b border-dotted border-black px-4 min-w-[150px] pb-[4px]">{formValues.place}</span>
                            </div>

                            <div className="flex justify-between items-end font-bold text-center mt-12">
                                <div className="w-[150px]">
                                    <div className="border-t border-black pt-2">Clerk</div>
                                </div>
                                <div className="w-[150px]">
                                    <div className="border-t border-black pt-2">Class Teacher</div>
                                </div>
                                <div className="w-[150px]">
                                    <div className="border-t border-black pt-2">Principal</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BonafideCertificateForm;

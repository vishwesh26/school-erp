"use client";

import { useForm } from "react-hook-form";
import { useRef, useEffect } from "react";
import Image from "next/image";

const SCHOOL_UDISE = "27250507717";

const LeavingCertificateForm = ({ student }: { student: any }) => {
    const pdfExportComponent = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            srNo: "101",
            grNo: student?.rollNumber || "",
            udise: SCHOOL_UDISE,
            studentName: `${student?.name} ${student?.surname}`.toUpperCase(),
            motherName: (student?.motherName || "").toUpperCase(),
            fatherName: (student?.fatherName || (`${student?.parent?.name} ${student?.parent?.surname}`.toUpperCase()) || "").toUpperCase(),
            aadharNo: student?.aadharNo || "",
            dobFigures: student?.birthday ? new Date(student?.birthday).toISOString().split('T')[0] : "",
            dobWords: "",
            placeOfBirth: (student?.placeOfBirth || "").toUpperCase(),
            taluka: (student?.taluka || "Haveli").toUpperCase(),
            district: (student?.district || "Pune").toUpperCase(),
            nationality: (student?.nationality || "Indian").toUpperCase(),
            religion: (student?.religion || "").toUpperCase(),
            caste: (student?.caste || "").toUpperCase(),
            isST: student?.isST || "No",
            classAdmitted: student?.classAdmitted || "",
            classLeaving: student?.class?.name || "",
            lastDateAttendance: student?.lastDateAttendance ? new Date(student?.lastDateAttendance).toISOString().split('T')[0] : "",
            examTaken: student?.examTaken || "",
            examResult: student?.examResult || "",
            isFailed: student?.isFailed || "No",
            subjectsStudied: "English, Hindi, Marathi, Math, Science, Social Studies",
            qualifiedPromotion: student?.qualifiedPromotion || "Yes",
            duesPaidUpTo: student?.duesPaidUpTo || "",
            feeConcession: student?.feeConcession || "No",
            workingDays: student?.workingDays || "220",
            presentDays: student?.presentDays || "",
            isNcc: student?.isNcc || "No",
            extraCurricular: student?.extraCurricular || "",
            conduct: student?.conduct || "Good",
            dateApplication: student?.dateApplication ? new Date(student?.dateApplication).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dateIssue: student?.dateIssue ? new Date(student?.dateIssue).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            reasonLeaving: student?.reasonLeaving || "Further Education",
            remarks: student?.remarks || "",
            studentId: student?.stateStudentId || "",
            pen: student?.pen || "",
            apaarId: student?.apaarId || "",
        },
    });

    // Reset form when student changes
    useEffect(() => {
        reset({
            srNo: "101",
            grNo: student?.rollNumber || "",
            udise: SCHOOL_UDISE,
            studentName: `${student?.name} ${student?.surname}`.toUpperCase(),
            motherName: student?.motherName || "",
            fatherName: student?.fatherName || (`${student?.parent?.name} ${student?.parent?.surname}`.toUpperCase()) || "",
            aadharNo: student?.aadharNo || "",
            dobFigures: student?.birthday ? new Date(student?.birthday).toISOString().split('T')[0] : "",
            dobWords: "",
            placeOfBirth: student?.placeOfBirth || "",
            taluka: student?.taluka || "Haveli",
            district: student?.district || "Pune",
            nationality: student?.nationality || "Indian",
            religion: student?.religion || "",
            caste: student?.caste || "",
            isST: student?.isST || "No",
            classAdmitted: student?.classAdmitted || "",
            classLeaving: student?.class?.name || "",
            lastDateAttendance: student?.lastDateAttendance ? new Date(student?.lastDateAttendance).toISOString().split('T')[0] : "",
            examTaken: student?.examTaken || "",
            examResult: student?.examResult || "",
            isFailed: student?.isFailed || "No",
            subjectsStudied: "English, Hindi, Marathi, Mathematics, Science, Social Studies",
            qualifiedPromotion: student?.qualifiedPromotion || "Yes",
            duesPaidUpTo: student?.duesPaidUpTo || "",
            feeConcession: student?.feeConcession || "No",
            workingDays: student?.workingDays || "220",
            presentDays: student?.presentDays || "",
            isNcc: student?.isNcc || "No",
            extraCurricular: student?.extraCurricular || "",
            conduct: student?.conduct || "Good",
            dateApplication: student?.dateApplication ? new Date(student?.dateApplication).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            dateIssue: student?.dateIssue ? new Date(student?.dateIssue).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            reasonLeaving: student?.reasonLeaving || "Further Education",
            remarks: student?.remarks || "",
            studentId: student?.stateStudentId || "",
            pen: student?.pen || "",
            apaarId: student?.apaarId || "",
        });
    }, [student, reset]);

    const formValues = watch();

    const handleDownload = async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = pdfExportComponent.current;
        if (!element) return;

        const opt = {
            margin: 0,
            filename: `Leaving_Certificate_${student?.name}_${student?.surname}.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORM INTERFACE */}
            <div className="bg-slate-50 p-6 rounded-lg shadow-inner max-h-[85vh] overflow-y-auto border border-gray-100">
                <h2 className="text-lg font-bold mb-4 text-lamaSky">Certificate Generation Form</h2>
                <p className="text-xs text-gray-500 mb-6">Edit any field below to update the live preview. Data is pre-filled from the student database where available.</p>

                <div className="space-y-8">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">1. Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Sr.No</label>
                                <input {...register("srNo")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Gr.No (Roll No)</label>
                                <input {...register("grNo")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500">Name of Pupil</label>
                                <input {...register("studentName")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none uppercase" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Mother&apos;s Name</label>
                                <input {...register("motherName")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Father&apos;s Name</label>
                                <input {...register("fatherName")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Birth & Identity */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">2. Birth & Identity Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Date of Birth (Fig)</label>
                                <input type="date" {...register("dobFigures")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Date of Birth (Words)</label>
                                <input {...register("dobWords")} placeholder="Optional if left empty" className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Place of Birth</label>
                                <input {...register("placeOfBirth")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Aadhar No</label>
                                <input {...register("aadharNo")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Taluka</label>
                                <input {...register("taluka")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">District</label>
                                <input {...register("district")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Nationality</label>
                                <input {...register("nationality")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Religious details */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">3. Category & Religion</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Religion</label>
                                <input {...register("religion")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Caste</label>
                                <input {...register("caste")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Schedule Tribe?</label>
                                <select {...register("isST")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none">
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Admission & Leaving */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">4. School Career</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Class Admitted</label>
                                <input {...register("classAdmitted")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Class Leaving</label>
                                <input {...register("classLeaving")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Last Date of Attendance</label>
                                <input type="date" {...register("lastDateAttendance")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Reason of Leaving</label>
                                <input {...register("reasonLeaving")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Academics */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">5. Academic Progress</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Last Exam Taken</label>
                                <input {...register("examTaken")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Exam Result</label>
                                <input {...register("examResult")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Failed in Same Class?</label>
                                <select {...register("isFailed")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none">
                                    <option value="No">No</option>
                                    <option value="Once">Once</option>
                                    <option value="Twice">Twice</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Qualified For Promotion?</label>
                                <select {...register("qualifiedPromotion")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Partially">Partially</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500">Subjects Studied</label>
                                <input {...register("subjectsStudied")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none italic" />
                            </div>
                        </div>
                    </div>

                    {/* Dues & Attendance */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">6. Fees & Attendance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Dues Paid Up To</label>
                                <input {...register("duesPaidUpTo")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Fee Concession Availed?</label>
                                <input {...register("feeConcession")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Total Working Days</label>
                                <input {...register("workingDays")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Days Present</label>
                                <input {...register("presentDays")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Activities & Conduct */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">7. Conduct & Activities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">NCC / Scout Cadet?</label>
                                <input {...register("isNcc")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Conduct</label>
                                <input {...register("conduct")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500">Extra-Curricular Activities</label>
                                <input {...register("extraCurricular")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none italic" />
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-500">Any Other Remarks</label>
                                <input {...register("remarks")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none italic" />
                            </div>
                        </div>
                    </div>

                    {/* Identifiers */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">8. Official Government IDs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Student ID (State)</label>
                                <input {...register("studentId")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">PEN (Permanent Edu Number)</label>
                                <input {...register("pen")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">APAAR ID</label>
                                <input {...register("apaarId")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">9. Certificate Dates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Date of Application</label>
                                <input type="date" {...register("dateApplication")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500">Date of Issue</label>
                                <input type="date" {...register("dateIssue")} className="p-2 text-sm border rounded focus:ring-1 focus:ring-lamaSky outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    className="w-full mt-10 bg-lamaSky text-white font-bold py-4 rounded-md hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Download Official Certificate
                </button>
            </div>

            {/* PREVIEW AREA */}
            <div className="bg-white border p-4 rounded-lg overflow-x-auto">
                <h2 className="text-sm font-semibold mb-2 text-gray-400 uppercase tracking-widest">Live Preview</h2>
                <div
                    className="origin-top scale-[0.6] md:scale-[0.8] lg:scale-[0.6] xl:scale-[0.7]"
                    style={{ width: "210mm", height: "auto" }}
                >
                    {/* THE ACTUAL PDF TEMPLATE */}
                    <div
                        ref={pdfExportComponent}
                        className="text-black bg-white p-6"
                        style={{
                            fontFamily: "'Times New Roman', serif",
                            width: "794px",
                            fontSize: "12px",
                            lineHeight: "1.25"
                        }}
                    >
                        {/* HEADER MATCHING IMAGE */}
                        <div className="flex items-center gap-4 mb-1">
                            <Image src="/logo.png" alt="logo" width={64} height={64} className="object-contain" />
                            <div className="flex-1 text-center">
                                <p className="text-[10px] font-bold m-0" style={{ color: '#800000' }}>Mahatma Gandhi Sarvodaya Sangh&apos;s</p>
                                <h1 className="text-2xl font-extrabold italic m-0" style={{
                                    color: '#800000',
                                    fontFamily: "'Brush Script MT', cursive, serif"
                                }}>
                                    Dr. Cyrus Poonawalla English Medium School
                                </h1>
                                <p className="text-[8px] font-bold m-0 mt-0.5">CBSE : 1130365 / 2012 / Uruli Kanchan, Pune. Reg.No.PTRR E 31 Dt.18.11.1952</p>
                                <p className="text-[8px] font-bold m-0">Uruli Kanchan, Tal-Haveli,Dist - Pune 412202. Ph. : 020-26927272 E-mail : dcpems@gmail.com</p>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-black mb-1"></div>

                        {/* ROW 1: SR NO, TITLE, GR NO */}
                        <div className="flex justify-between items-center mb-1">
                            <p className="m-0 font-bold text-xs">Sr.No. <span className="text-base ml-1">{formValues.srNo}</span></p>
                            <div className="border border-black px-4 py-0.5 font-bold text-base uppercase tracking-wider">
                                LEAVING CERTIFICATE
                            </div>
                            <p className="m-0 font-bold text-xs">Gr.No. <span className="ml-1">{formValues.grNo}</span></p>
                        </div>

                        {/* FIELDS 1-28 */}
                        <div className="space-y-0 text-[11.5px]">
                            {/* 1. School Udise */}
                            <div className="flex items-center gap-2">
                                <p className="m-0 font-bold min-w-[120px]">1) School Udise :</p>
                                <div className="flex">
                                    {(formValues.udise.padEnd(11, ' ').split('')).map((char: string, i: number) => (
                                        <span key={i} className="border border-black w-5 h-6 flex items-center justify-center font-bold text-xs bg-white">
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 2-4 Name Fields */}
                            <p className="m-0 flex items-baseline leading-relaxed">2) Name of Pupil <span className="border-b border-black inline-block flex-1 min-w-[500px] font-bold ml-2 pb-[4px]">{formValues.studentName}</span></p>
                            <p className="m-0 flex items-baseline leading-relaxed">3) Mother&apos;s Name <span className="border-b border-black inline-block flex-1 min-w-[500px] font-semibold ml-2 pb-[4px]">{formValues.motherName}</span></p>
                            <p className="m-0 flex items-baseline leading-relaxed">4) Father&apos;s Name <span className="border-b border-black inline-block flex-1 min-w-[500px] font-semibold ml-2 pb-[4px]">{formValues.fatherName}</span></p>

                            {/* 5 Aadhar */}
                            <div className="flex items-center gap-2">
                                <p className="m-0 font-bold min-w-[120px]">5) Aadhar No.</p>
                                <div className="flex">
                                    {(formValues.aadharNo.padEnd(12, ' ').split('')).map((char: string, i: number) => (
                                        <span key={i} className="border border-black w-5 h-6 flex items-center justify-center text-xs bg-white">
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 6 DOB */}
                            <p className="m-0 flex items-baseline leading-relaxed">6) Date Of Birth (in Figures) <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.dobFigures}</span></p>
                            <p className="m-0 pl-6 flex items-baseline leading-relaxed">(in words) <span className="border-b border-black inline-block min-w-[500px] italic pb-[4px]">{formValues.dobWords || "......................................................................................."}</span></p>

                            {/* 7 Place of Birth */}
                            <div className="flex gap-8">
                                <p className="m-0 flex items-baseline leading-relaxed">7) Place Of Birth <span className="border-b border-black px-4 font-bold pb-[4px]">{formValues.placeOfBirth}</span></p>
                                <p className="m-0 flex items-baseline leading-relaxed">Dist. <span className="border-b border-black px-4 font-bold pb-[4px]">{formValues.district}</span></p>
                                <p className="m-0 flex items-baseline leading-relaxed">Tal. <span className="border-b border-black px-4 font-bold pb-[4px]">{formValues.taluka}</span></p>
                            </div>

                            {/* 8 Nationality etc */}
                            <div className="flex gap-8">
                                <p className="m-0 flex items-baseline leading-relaxed">8) Nationality <span className="border-b border-black px-4 font-bold pb-[4px]">{formValues.nationality}</span></p>
                                <p className="m-0 flex items-baseline leading-relaxed">Religion <span className="border-b border-black px-4 font-bold pb-[4px]">{formValues.religion}</span></p>
                                <p className="m-0 flex items-baseline leading-relaxed">Caste <span className="border-b border-black px-4 font-bold pb-[4px]">{formValues.caste}</span></p>
                            </div>

                            {/* 9 ST */}
                            <p className="m-0 flex items-baseline leading-relaxed">9) Whether The Pupil Belong To ST <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.isST}</span></p>

                            {/* 10-12 Career */}
                            <p className="m-0 flex items-baseline leading-relaxed">10) Class in which admitted <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.classAdmitted}</span></p>
                            <p className="m-0 flex items-baseline leading-relaxed">11) Class In which Leaving <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.classLeaving}</span></p>
                            <p className="m-0 flex items-baseline leading-relaxed">12) Last Date Of Attendance <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.lastDateAttendance}</span></p>

                            {/* 13 Exam */}
                            <p className="m-0 flex items-baseline leading-relaxed">13) School / Board Exam Last Taken <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.examTaken} - {formValues.examResult}</span></p>

                            {/* 14 Failed */}
                            <p className="m-0 flex items-baseline leading-relaxed">14) Whether Failed, If So Once / Twice <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.isFailed}</span></p>

                            {/* 15 Subjects */}
                            <p className="m-0 flex items-baseline leading-relaxed">15) Subject Studied : <span className="border-b border-black px-2 italic text-[10px] ml-2 pb-[4px]">{formValues.subjectsStudied}</span></p>

                            {/* 16 Promotion */}
                            <p className="m-0 flex items-baseline leading-relaxed">16) Promotion To Higher Class <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.qualifiedPromotion}</span></p>

                            {/* 17 Dues */}
                            <p className="m-0 flex items-baseline leading-relaxed">17) School Dues Paid Up To : <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.duesPaidUpTo}</span></p>

                            {/* 18 Concession */}
                            <p className="m-0 flex items-baseline leading-relaxed">18) Any Fee Concession Availed Of <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.feeConcession}</span></p>

                            {/* 19 Attendance */}
                            <p className="m-0 flex items-baseline leading-relaxed">19) Working Days / Present Days : <span className="font-bold border-b border-black px-2 pb-[4px]">{formValues.workingDays}</span> / <span className="font-bold border-b border-black px-2 pb-[4px]">{formValues.presentDays}</span></p>

                            {/* 20 NCC */}
                            <p className="m-0 flex items-baseline leading-relaxed">20) NCC Cadet / Boy Scout / Girl Guide : <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.isNcc}</span></p>

                            {/* 21 Extra Activities */}
                            <p className="m-0 flex items-baseline leading-relaxed">21) Extra - Curricular Activities : <span className="border-b border-black px-2 italic ml-2 pb-[4px] flex-1">{formValues.extraCurricular || "Not Specified"}</span></p>

                            {/* 22 Conduct */}
                            <p className="m-0 flex items-baseline leading-relaxed">22) General Conduct : <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.conduct}</span></p>

                            {/* 23 Application/Issue Date */}
                            <div className="flex gap-16">
                                <p className="m-0 flex items-baseline leading-relaxed">23) Date Of Application <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.dateApplication}</span></p>
                                <p className="m-0 flex items-baseline leading-relaxed">Date Issue <span className="border-b border-black px-4 font-bold ml-2 pb-[4px]">{formValues.dateIssue}</span></p>
                            </div>

                            {/* 24 Reason */}
                            <p className="m-0 flex items-baseline leading-relaxed">24) Reason Of Leaving <span className="border-b border-black px-4 font-bold ml-2 pb-[4px] flex-1">{formValues.reasonLeaving}</span></p>

                            {/* 25 Remarks */}
                            <p className="m-0 flex items-baseline leading-relaxed">25) Any Other Remarks : <span className="border-b border-black px-4 italic ml-2 pb-[4px] flex-1">{formValues.remarks || "No Remarks"}</span></p>

                            {/* 26-28 Digits */}
                            <div className="flex items-center gap-2 pt-0.5">
                                <p className="m-0 font-bold min-w-[120px]">26) Student Id :</p>
                                <div className="flex">
                                    {(formValues.studentId.padEnd(20, ' ').split('')).map((char: string, i: number) => (
                                        <span key={i} className="border border-black w-4.5 h-5.5 flex items-center justify-center text-[9px] bg-white">
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <p className="m-0 font-bold min-w-[120px]">27) PEN :</p>
                                <div className="flex">
                                    {(formValues.pen.padEnd(11, ' ').split('')).map((char: string, i: number) => (
                                        <span key={i} className="border border-black w-5 h-6 flex items-center justify-center text-xs font-bold bg-white">
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <p className="m-0 font-bold min-w-[120px]">28) APAAR ID :</p>
                                <div className="flex">
                                    {(formValues.apaarId.padEnd(12, ' ').split('')).map((char: string, i: number) => (
                                        <span key={i} className="border border-black w-5 h-6 flex items-center justify-center text-xs bg-white">
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SIGNATURE SECTION */}
                        <div className="mt-6 flex justify-between text-[10px] font-bold pb-1">
                            <p>Date</p>
                            <p>Clerk Sign</p>
                            <p>Class Teacher Sign</p>
                            <p>Principal Sign</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeavingCertificateForm;

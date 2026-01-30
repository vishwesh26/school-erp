"use client";

import { useForm } from "react-hook-form";
import { useRef, useEffect } from "react";
import Image from "next/image";

const AdmissionForm = ({ student }: { student?: any }) => {
    const pdfExportComponent = useRef<HTMLDivElement>(null);

    const getDefaults = (s: any) => ({
        formNo: "542",
        lastName: s?.surname?.toUpperCase() || "",
        firstName: s?.name?.toUpperCase() || "",
        middleName: (s?.parent?.name || "").toUpperCase(),
        sex: s?.sex || "",
        motherTongue: "Marathi",
        dob: s?.birthday ? new Date(s?.birthday).toLocaleDateString('en-GB').replace(/\//g, '') : "",
        placeOfBirth: s?.address || "",
        nationality: "Indian",
        religionCaste: s ? `${s?.religion || ""} / ${s?.caste || ""}` : "",
        standardSought: s?.class?.name || "",
        prevSchool: "",
        prevStd: "",
        board: "CBSE",
        isRecognised: "yes",
        fatherSurname: (s?.parent?.surname || "").toUpperCase(),
        fatherName: (s?.parent?.name || "").toUpperCase(),
        fatherGrandName: "",
        fatherAge: "",
        motherSurname: (s?.parent?.surname || "").toUpperCase(),
        motherName: "",
        motherGrandName: "",
        motherAge: "",
        residentialAddress: s?.address || "",
        telRes: "",
        telOff: "",
        mobile: s?.phone || "",
        email: s?.email || "",
        pinCode: "",
    });

    const { register, reset, watch } = useForm({
        defaultValues: getDefaults(student),
    });

    useEffect(() => {
        reset(getDefaults(student));
    }, [student, reset]);

    const formValues = watch();

    const handleDownload = async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = pdfExportComponent.current;
        if (!element) return;

        const opt = {
            margin: 0,
            filename: `Admission_Form_${student?.name}_${student?.surname}.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
    };

    const dobDigits = formValues.dob.padEnd(8, ' ').split('');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FORM SIDE */}
            <div className="bg-slate-50 p-6 rounded-lg shadow-inner border border-gray-100 h-fit">
                <h2 className="text-lg font-bold mb-4 text-lamaSky">Admission Form Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Form No.</label>
                        <input {...register("formNo")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Last Name</label>
                        <input {...register("lastName")} className="p-2 text-sm border rounded outline-none uppercase" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">First Name</label>
                        <input {...register("firstName")} className="p-2 text-sm border rounded outline-none uppercase" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Middle Name</label>
                        <input {...register("middleName")} className="p-2 text-sm border rounded outline-none uppercase" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">Standard Sought</label>
                        <input {...register("standardSought")} className="p-2 text-sm border rounded outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500">DOB (DDMMYYYY)</label>
                        <input {...register("dob")} maxLength={8} className="p-2 text-sm border rounded outline-none" />
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="w-full mt-6 bg-lamaSky text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    Download Admission Form PDF
                </button>
            </div>

            {/* PREVIEW SIDE */}
            <div className="bg-white border p-4 rounded-lg overflow-x-auto shadow-sm">
                <div className="origin-top scale-[0.55] md:scale-[0.75] lg:scale-[0.55]" style={{ width: "210mm" }}>
                    <div
                        ref={pdfExportComponent}
                        className="text-black bg-white p-10 relative"
                        style={{
                            fontFamily: "'Times New Roman', serif",
                            width: "794px",
                            fontSize: "12px",
                            lineHeight: "1.35"
                        }}
                    >
                        {/* HEADER SECTION */}
                        <div className="flex items-start gap-4 mb-2">
                            <Image src="/logo.png" alt="logo" width={96} height={96} className="object-contain mt-2" />
                            <div className="flex-1 text-center">
                                <p className="text-[14px] font-bold m-0 italic">Mahatma Gandhi Sarvodaya Sangh&apos;s</p>
                                <h1 className="text-[26px] font-extrabold m-0 leading-tight">DR.CYRUS POONAWALLA ENGLISH</h1>
                                <h1 className="text-[26px] font-extrabold m-0 leading-tight">MEDIUM SENIOR SECONDARY SCHOOL</h1>
                                <p className="text-[10px] font-bold m-0 mt-1 uppercase tracking-tighter">CBSE : 1130365 / 2012 / Uruli Kanchan, Pune. Reg.No.PTRR E 31 Dt.18.11.1952</p>
                                <p className="text-[10px] font-bold m-0">Uruli Kanchan, Tal-Haveli,Dist - Pune 412202.</p>
                                <div className="flex justify-center gap-4 text-[10px] font-bold">
                                    <span>Ph. : 020-26927272</span>
                                    <span>E-mail : dcpems@gmail.com</span>
                                </div>
                            </div>
                            <div className="w-[100px]">
                                <div className="border-[1.5px] border-black w-[100px] h-[120px] flex flex-col items-center justify-center p-2 text-center text-[11px] font-bold bg-white">
                                    <span>Recent Passport Size Photo</span>
                                </div>
                                <div className="mt-2 text-right">
                                    <span className="text-2xl font-bold italic pr-4">{formValues.formNo}</span>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center underline my-4 tracking-wider">ADMISSION FORM</h2>

                        {/* STUDENT INFO */}
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold">Student&apos;s Name :</span>
                                <div className="flex-1 flex gap-4 text-center">
                                    <div className="flex-1 flex flex-col">
                                        <span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.lastName}</span>
                                        <span className="text-[10px]">Last Name</span>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.firstName}</span>
                                        <span className="text-[10px]">First Name</span>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.middleName}</span>
                                        <span className="text-[10px]">Middle Name</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-10">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold">Sex :</span>
                                    <span className="border-b border-black min-w-[80px] text-center pb-[4px] translate-y-[2px] inline-block">{formValues.sex}</span>
                                </div>
                                <div className="flex items-baseline gap-2 flex-1">
                                    <span className="font-bold">Mother Tongue :</span>
                                    <span className="border-b border-black flex-1 text-center pb-[4px] translate-y-[2px] inline-block">{formValues.motherTongue}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-bold">Date of Birth :</span>
                                <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px]"></span>
                                <div className="flex items-center gap-0.5 text-[9px] font-bold">
                                    <div className="flex">
                                        <div className="border border-black w-6 h-7 flex items-center justify-center bg-white">{dobDigits[0]}</div>
                                        <div className="border border-black w-6 h-7 border-l-0 flex items-center justify-center bg-white">{dobDigits[1]}</div>
                                    </div>
                                    <div className="flex ml-1">
                                        <div className="border border-black w-6 h-7 flex items-center justify-center bg-white">{dobDigits[2]}</div>
                                        <div className="border border-black w-6 h-7 border-l-0 flex items-center justify-center bg-white">{dobDigits[3]}</div>
                                    </div>
                                    <div className="flex ml-1">
                                        <div className="border border-black w-6 h-7 flex items-center justify-center bg-white">{dobDigits[4]}</div>
                                        <div className="border border-black w-6 h-7 border-l-0 flex items-center justify-center bg-white">{dobDigits[5]}</div>
                                        <div className="border border-black w-6 h-7 border-l-0 flex items-center justify-center bg-white">{dobDigits[6]}</div>
                                        <div className="border border-black w-6 h-7 border-l-0 flex items-center justify-center bg-white">{dobDigits[7]}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-[42px] pr-2 mt-[-4px]">
                                <span className="text-[9px] font-bold">Date</span>
                                <span className="text-[9px] font-bold">Month</span>
                                <span className="text-[9px] font-bold pr-4">Year</span>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-baseline gap-2 flex-1">
                                    <span className="font-bold">Place of Birth :</span>
                                    <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.placeOfBirth}</span>
                                </div>
                                <div className="flex items-baseline gap-2 flex-1">
                                    <span className="font-bold">Nationality :</span>
                                    <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.nationality}</span>
                                </div>
                                <div className="flex items-baseline gap-2 flex-1">
                                    <span className="font-bold whitespace-nowrap">Religion / Caste :</span>
                                    <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.religionCaste}</span>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 border-b border-black pb-[4px] translate-y-[2px]">
                                <span className="font-bold">Standard to which admission is sought :</span>
                                <span className="flex-1 text-center font-bold tracking-widest">{formValues.standardSought}</span>
                            </div>

                            <div className="pt-1">
                                <p className="font-bold m-0 italic">Name of the School and Standard which the child is studying at present :</p>
                                <div className="flex gap-2 items-baseline mt-1">
                                    <span className="font-bold">School :</span>
                                    <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] inline-block">{formValues.prevSchool}</span>
                                    <span className="font-bold pr-2">Std :</span>
                                    <span className="border-b border-black w-24 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.prevStd}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 font-bold text-[11px]">
                                    <div className="flex items-center gap-1">
                                        <span>put a</span>
                                        <div className="w-5 h-5 border border-black flex items-center justify-center bg-white">
                                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span>on</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1"><span>ICSE</span> <div className="w-4 h-4 border border-black bg-white"></div></div>
                                        <div className="flex items-center gap-1"><span>CBSE</span> <div className="w-4 h-4 border border-black bg-white flex items-center justify-center">
                                            {formValues.board === "CBSE" && <div className="w-2.5 h-2.5 bg-black"></div>}
                                        </div></div>
                                        <div className="flex items-center gap-1"><span>SSC</span> <div className="w-4 h-4 border border-black bg-white"></div></div>
                                        <div className="flex items-center gap-1"><span>OTHERS</span> <div className="w-4 h-4 border border-black bg-white"></div></div>
                                    </div>
                                    <div className="flex-1 flex justify-end gap-4 italic font-bold">
                                        <div className="flex items-center gap-1 flex-row-reverse"><div className="w-4 h-4 border border-black bg-white"></div><span>(recognised)</span></div>
                                        <div className="flex items-center gap-1 flex-row-reverse"><div className="w-4 h-4 border border-black bg-white"></div><span>not recognised)</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* PARENTS INFO */}
                            <div className="space-y-4 pt-1">
                                <div className="flex gap-4 items-baseline">
                                    <span className="font-bold whitespace-nowrap">Father&apos;s /Guardian&apos;s Name :</span>
                                    <div className="flex-1 flex gap-4 text-center">
                                        <div className="flex-1 flex flex-col"><span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.fatherSurname}</span><span className="text-[10px]">Surname</span></div>
                                        <div className="flex-1 flex flex-col"><span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.fatherName}</span><span className="text-[10px]">Name</span></div>
                                        <div className="flex-1 flex flex-col"><span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.fatherGrandName}</span><span className="text-[10px]">Father&apos;s Name</span></div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold">Age :</span>
                                        <span className="border-b border-black w-14 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.fatherAge}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-baseline">
                                    <span className="font-bold whitespace-nowrap">Mother&apos;s Name :</span>
                                    <div className="flex-1 flex gap-4 text-center">
                                        <div className="flex-1 flex flex-col"><span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.motherSurname}</span><span className="text-[10px]">Surname</span></div>
                                        <div className="flex-1 flex flex-col"><span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.motherName}</span><span className="text-[10px]">Name</span></div>
                                        <div className="flex-1 flex flex-col"><span className="border-b border-black font-bold pb-[4px] translate-y-[2px]">{formValues.motherGrandName}</span><span className="text-[10px]">Father&apos;s Name</span></div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold">Age :</span>
                                        <span className="border-b border-black w-14 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.motherAge}</span>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold whitespace-nowrap">Residential address of Parents :</span>
                                    <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] inline-block">{formValues.residentialAddress}</span>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold">Tel. : (Res.)</span>
                                        <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.telRes}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold">(Off.)</span>
                                        <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.telOff}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold">Mobile :</span>
                                        <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] text-center inline-block">{formValues.mobile}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold">Pin Code :</span>
                                        <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] text-center inline-block font-bold">{formValues.pinCode}</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold">Email :</span>
                                    <span className="border-b border-black flex-1 pb-[4px] translate-y-[2px] inline-block">{formValues.email}</span>
                                </div>
                            </div>

                            <p className="font-bold italic text-[11px] pt-1">Please answer against the relevant category/ categories. (put a <div className="inline-flex w-3.5 h-3.5 border border-black bg-white items-center justify-center"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg></div> on YES /NO)</p>
                            <p className="font-bold italic text-[11px]">Are you seeking admission for any other child/children of your own? If yes, fill in the following details:</p>

                            <table className="w-full border-collapse border border-black text-center text-[11px]">
                                <thead>
                                    <tr className="font-bold">
                                        <th className="border border-black p-1 w-12">Sr.No.</th>
                                        <th className="border border-black p-1">Surname</th>
                                        <th className="border border-black p-1">Name</th>
                                        <th className="border border-black p-1">Father&apos;s Name</th>
                                        <th className="border border-black p-1 w-16">Std.</th>
                                        <th className="border border-black p-1 w-20">From No.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="h-7">
                                        <td className="border border-black">1.</td>
                                        <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
                                    </tr>
                                    <tr className="h-7">
                                        <td className="border border-black">2.</td>
                                        <td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="w-full border-b border-dotted border-black my-4"></div>

                        {/* LIST OF DOCUMENTS */}
                        <div className="text-[10px] leading-tight flex justify-between">
                            <div className="w-[48%] space-y-0.5">
                                <h3 className="font-bold underline text-[11px] mb-1">LIST OF SUPPORTING DOCUMENTS :</h3>
                                <p>1. Six photographs</p>
                                <p>2. Copy of Birth Certificate (only for Nur.)</p>
                                <p>3. Residence Proof(Local)</p>
                                <p>4. Copy of Mark sheet /Progress Report</p>
                                <p>5. Original Leaving Certificate(Std.II and Above)</p>
                            </div>
                            <div className="w-[48%] space-y-0.5 pt-4">
                                <p>6.Fitness Certificate from Registered Medical Practitioner</p>
                                <p>7. Copy of Caste Certificate (optional)/Parents L.C.Xerox Of X Std.</p>
                                <p>8. Copy of Passport /PIO card (for students travelling from outside India)</p>
                                <p>9. Adhar Card copy</p>
                                <p>10. Blood Group</p>
                            </div>
                        </div>

                        {/* NOTES */}
                        <div className="mt-2 text-[10px] leading-tight space-y-0.5">
                            <h3 className="font-bold underline text-[11px] mb-1">NOTES :</h3>
                            <p>1. Original Documents to be produced for verification at the time of admission.</p>
                            <p>2. Forms will NOT be accepted if they are incomplete,without the supporting document or if the original documents are not produced for verification.</p>
                            <p>3. If a pupil has come from a different District /State,other than Pune district,the Transfer Certificate must be Countersigned by the appropriate country concerned :</p>
                            <p>4. If a pupil has come from a different country,other than India the Transfer Certificate must be countersigned by the appropriate officer of the Indian Embassy/Consulate/High Commission in that country concerned. Documents without this stamp will not be accepted and the admission will be provisional(up to 2 months) subject to the parents providing the said documents.</p>
                            <p>5. Prospectus amount will be non-refundable.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionForm;

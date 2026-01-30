"use client";

import { registerUser } from "./actions";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [role, setRole] = useState("student");
    const [state, formAction] = useFormState(registerUser, { success: false, errors: {} } as any);
    const router = useRouter();

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                // After successful registration, usually we stay in dashboard or go back to list
                // router.push("/sign-in"); 
            } else {
                toast.error(state.message);
            }
        }
    }, [state, router]);

    const errors = state?.errors || {};

    return (
        <div className="p-4 md:p-8 flex flex-col items-center">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-5xl">
                <div className="flex justify-between items-center mb-8 pb-4 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 capitalize">{role} Registration</h1>
                        <p className="text-sm text-gray-500">Register a new user to the school portal</p>
                    </div>
                    <Image src="/logo.png" alt="Logo" width={48} height={48} />
                </div>

                <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {["student", "teacher", "librarian", "accountant", "admin"].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRole(r)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${role === r
                                ? "bg-lamaSky text-white shadow-md"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"}`}
                        >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>

                <form action={formAction} className="flex flex-col gap-8">
                    <input type="hidden" name="role" value={role} />

                    {/* Common Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-lamaSky rounded-full"></div>
                            <h2 className="text-lg font-bold text-gray-800">Account Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="First Name" name="name" error={errors.name} />
                            <InputField label="Last Name" name="surname" error={errors.surname} />
                            <InputField label="Email Address" name="email" type="email" error={errors.email} placeholder="example@email.com" />
                            {role !== "admin" && (
                                <InputField label="Phone Number" name="phone" error={errors.phone} placeholder="+1 234 567 890" />
                            )}
                        </div>
                    </div>

                    {role === "student" && (
                        <>
                            {/* Student Specific Details */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-lamaPurple rounded-full"></div>
                                    <h2 className="text-lg font-bold text-gray-800">Student Profile</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="Blood Type" name="bloodType" error={errors.bloodType} />
                                    <InputField label="Birthday" name="birthday" type="date" error={errors.birthday} />
                                    <SelectField label="Sex" name="sex" options={["MALE", "FEMALE"]} error={errors.sex} />
                                    <div className="flex flex-col gap-1">
                                        <InputField label="Grade / Standard" name="grade" type="number" error={errors.grade} placeholder="e.g. 10" />
                                        <span className="text-[10px] text-gray-400 ml-1">Two digits (e.g. 05, 10)</span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Local Residential Address</label>
                                        <textarea
                                            name="address"
                                            className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-lamaSky outline-none transition-all"
                                            rows={2}
                                            placeholder="Enter student's current address"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Official Identifiers */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-amber-400 rounded-full"></div>
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        Official Identifiers
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">Optional</span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <InputField label="Aadhar No" name="aadharNo" error={errors.aadharNo} />
                                    <InputField label="Saral ID" name="stateStudentId" error={errors.stateStudentId} />
                                    <InputField label="PEN" name="pen" error={errors.pen} />
                                    <InputField label="APAAR ID" name="apaarId" error={errors.apaarId} />
                                </div>
                            </div>

                            {/* Parent Details */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-lamaYellow rounded-full"></div>
                                    <h2 className="text-lg font-bold text-gray-800">Parent Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="Parent's Given Name" name="parentName" error={errors.parentName} />
                                    <InputField label="Parent's Surname" name="parentSurname" error={errors.parentSurname} />
                                    <InputField label="Parent Phone" name="parentPhone" error={errors.parentPhone} />
                                    <InputField label="Parent Email" name="parentEmail" type="email" error={errors.parentEmail} />
                                    <div className="md:col-span-2">
                                        <InputField label="Parent Permanent Address" name="parentAddress" error={errors.parentAddress} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {(role === "teacher" || role === "librarian" || role === "accountant") && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-lamaPurple rounded-full"></div>
                                <h2 className="text-lg font-bold text-gray-800">Profile Details</h2>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Residential Address</label>
                                <textarea name="address" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-lamaSky outline-none transition-all" rows={2}></textarea>
                                {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t flex justify-end">
                        <button type="submit" className="bg-lamaSky text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-md active:scale-95">
                            Complete {role} Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const InputField = ({ label, name, type = "text", error, placeholder }: any) => {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-lamaSky outline-none transition-all w-full"
            />
            {error && <span className="text-red-500 text-[10px] font-bold">{error}</span>}
        </div>
    );
};

const SelectField = ({ label, name, options, error }: any) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        <select name={name} className="p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-lamaSky outline-none transition-all">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {error && <span className="text-red-500 text-[10px] font-bold">{error}</span>}
    </div>
);

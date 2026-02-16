"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
    admissionInquirySchema,
    AdmissionInquirySchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
    createAdmissionInquiry,
    updateAdmissionInquiry,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const InquiryForm = ({
    type,
    data,
    setOpen,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdmissionInquirySchema>({
        resolver: zodResolver(admissionInquirySchema),
        defaultValues: data,
    });

    const [state, formAction] = useFormState(
        type === "create" ? createAdmissionInquiry : updateAdmissionInquiry,
        {
            success: false,
            error: false,
        }
    );

    const onSubmit = handleSubmit((formData) => {
        formAction(formData);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Inquiry has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    return (
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Record Admission Inquiry" : "Update Inquiry"}
            </h1>

            <div className="flex justify-between flex-wrap gap-x-4 gap-y-2">
                <InputField
                    label="Student Full Name"
                    name="fullName"
                    defaultValue={data?.fullName}
                    register={register}
                    error={errors?.fullName}
                />
                <InputField
                    label="Mother's Name"
                    name="motherName"
                    defaultValue={data?.motherName}
                    register={register}
                    error={errors?.motherName}
                />
                <InputField
                    label="City / Village"
                    name="city"
                    defaultValue={data?.city}
                    register={register}
                    error={errors?.city}
                />
                <InputField
                    label="Current Class"
                    name="currentClass"
                    defaultValue={data?.currentClass}
                    register={register}
                    error={errors?.currentClass}
                />
                <InputField
                    label="Class Willing to Take Admission"
                    name="targetClass"
                    defaultValue={data?.targetClass}
                    register={register}
                    error={errors?.targetClass}
                />
                <InputField
                    label="Parent Phone Number"
                    name="parentPhone"
                    defaultValue={data?.parentPhone}
                    register={register}
                    error={errors?.parentPhone}
                />
                <InputField
                    label="Email ID"
                    name="emailId"
                    defaultValue={data?.emailId}
                    register={register}
                    error={errors?.emailId}
                />

                {data && (
                    <div className="flex flex-col gap-2 w-full md:w-1/4">
                        <label className="text-xs text-gray-500">Status</label>
                        <select
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("status")}
                            defaultValue={data?.status}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        {errors.status?.message && (
                            <p className="text-xs text-red-400">
                                {errors.status.message.toString()}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Additional Info / Remarks</label>
                    <textarea
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("additionalInfo")}
                        defaultValue={data?.additionalInfo}
                        rows={3}
                    />
                    {errors.additionalInfo?.message && (
                        <p className="text-xs text-red-400">
                            {errors.additionalInfo.message.toString()}
                        </p>
                    )}
                </div>

                {data && (
                    <input
                        {...register("id")}
                        defaultValue={data?.id}
                        hidden
                    />
                )}
            </div>

            {state.error && (
                <span className="text-red-500">Something went wrong!</span>
            )}
            <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Save Inquiry" : "Update"}
            </button>
        </form>
    );
};

export default InquiryForm;

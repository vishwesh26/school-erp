"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

const AssignmentForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(data?.pdfUrl || null);
    const [pdfName, setPdfName] = useState<string | null>(data?.pdfUrl ? "Attached PDF Document" : null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<AssignmentSchema>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            pdfUrl: data?.pdfUrl || "",
        }
    });

    useEffect(() => {
        setValue("pdfUrl", pdfUrl || "");
    }, [pdfUrl, setValue]);

    const [state, formAction] = useFormState(
        type === "create" ? createAssignment : updateAssignment,
        {
            success: false,
            error: false,
        }
    );

    const onSubmit = handleSubmit((formData) => {
        formAction({ ...formData, pdfUrl: pdfUrl || "" });
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
                toast.error("Please upload a valid PDF file.");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error("PDF file size must be less than 10MB.");
                return;
            }
            setPdfName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPdfUrl(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePdf = () => {
        setPdfUrl(null);
        setPdfName(null);
        setValue("pdfUrl", "");
    };

    const { subjects, classes } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new assignment" : "Update the assignment"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Assignment Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />
                <InputField
                    label="Start Date"
                    name="startDate"
                    defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split("T")[0] : ""}
                    register={register}
                    error={errors?.startDate}
                    type="date"
                />
                <InputField
                    label="Due Date"
                    name="dueDate"
                    defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : ""}
                    register={register}
                    error={errors?.dueDate}
                    type="date"
                />

                <div className="flex flex-col gap-2 w-full md:w-full">
                    <label className="text-xs text-gray-500">Assignment Questions / Description</label>
                    <textarea
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-32"
                        {...register("description")}
                        defaultValue={data?.description}
                        placeholder="Type the assignment questions here..."
                    />
                    {errors.description?.message && (
                        <p className="text-xs text-red-400">
                            {errors.description.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-full bg-slate-50 p-4 rounded-lg border border-dashed border-gray-300">
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                        <span>📎 Upload Assignment PDF (Optional)</span>
                    </label>

                    {pdfUrl ? (
                        <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium overflow-hidden">
                                <span className="text-lg">📄</span>
                                <span className="truncate max-w-xs">{pdfName || "Uploaded Assignment PDF"}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemovePdf}
                                className="text-xs text-red-500 hover:underline font-semibold px-2 py-1 bg-red-50 rounded"
                            >
                                Remove PDF
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <label className="cursor-pointer flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md border border-blue-200 text-xs font-medium transition-colors">
                                <span>📁 Choose PDF File</span>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>

                            {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
                                <CldUploadWidget
                                    uploadPreset="school"
                                    options={{ clientAllowedFormats: ["pdf"] }}
                                    onSuccess={(result: any, { widget }) => {
                                        if (result?.info?.secure_url) {
                                            setPdfUrl(result.info.secure_url);
                                            setPdfName((result.info.original_filename || "document") + ".pdf");
                                        }
                                        widget.close();
                                    }}
                                >
                                    {({ open }) => (
                                        <button
                                            type="button"
                                            onClick={() => open()}
                                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md border border-gray-300 text-xs font-medium transition-colors"
                                        >
                                            <Image src="/upload.png" alt="" width={16} height={16} />
                                            <span>Upload via Cloudinary</span>
                                        </button>
                                    )}
                                </CldUploadWidget>
                            )}
                            <span className="text-xs text-gray-400">Max size: 10MB</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Subject</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("subjectId")}
                        defaultValue={data?.subjectId}
                    >
                        {subjects && subjects.map((subject: { id: number; name: string }) => (
                            <option value={subject.id} key={subject.id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    {errors.subjectId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.subjectId.message.toString()}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Class</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("classId")}
                        defaultValue={data?.classId}
                    >
                        {classes && classes.map((item: { id: number; name: string }) => (
                            <option value={item.id} key={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    {errors.classId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.classId.message.toString()}
                        </p>
                    )}
                </div>

                {data && (
                    <InputField
                        label="Id"
                        name="id"
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}
            </div>
            {state.error && (
                <span className="text-red-500">Something went wrong!</span>
            )}
            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default AssignmentForm;

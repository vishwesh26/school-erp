"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { formatClassName } from "@/lib/utils";

const LessonForm = ({
    type,
    data,
    setOpen,
    relatedData,
    onSuccess,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
    onSuccess?: () => void;
}) => {
    const { subjects = [], classes = [], teachers = [] } = relatedData || {};

    // Helper to format ISO (UTC) or Date object to Local "YYYY-MM-DDTHH:mm" for input
    const formatToLocalDatetime = (val?: string | Date) => {
        if (!val) return "";
        try {
            let date: Date;
            if (val instanceof Date) {
                date = val;
            } else {
                const str = String(val);
                const safeIso = str.endsWith("Z") || str.includes("+") ? str : str + "Z";
                date = new Date(safeIso);
            }
            if (isNaN(date.getTime())) return "";

            const pad = (n: number) => n.toString().padStart(2, "0");
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
            return "";
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            id: type === "update" && data?.id ? data.id : undefined,
            name: data?.name || "",
            startTime: data?.startTime ? (formatToLocalDatetime(data.startTime) as any) : undefined,
            endTime: data?.endTime ? (formatToLocalDatetime(data.endTime) as any) : undefined,
            subjectId: data?.subjectId ? Number(data.subjectId) : (subjects[0]?.id ? Number(subjects[0].id) : undefined),
            classId: data?.classId ? Number(data.classId) : (classes[0]?.id ? Number(classes[0].id) : undefined),
            teacherId: data?.teacherId || teachers[0]?.id || "",
        },
    });

    const [state, formAction] = useFormState(
        type === "create" ? createLesson : updateLesson,
        {
            success: false,
            error: false,
        }
    );

    const onSubmit = handleSubmit((formData) => {
        const dataToSubmit: any = { ...formData };

        if (formData.startTime) {
            const startDate = new Date(formData.startTime);
            dataToSubmit.startTime = startDate;

            // Automatically derive the day from the startTime date
            const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
            dataToSubmit.day = days[startDate.getDay()] as any;
        }
        if (formData.endTime) {
            dataToSubmit.endTime = new Date(formData.endTime);
        }

        if (type === "create") {
            delete dataToSubmit.id;
        }

        formAction(dataToSubmit);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast.success(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            onSuccess?.();
            router.refresh();
        }
    }, [state.success, router, type, setOpen, onSuccess]);

    useEffect(() => {
        if (state.error) {
            toast.error(state.message || "Failed to save lesson!");
        }
    }, [state.error, state.message]);

    return (
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="border-b border-gray-100 pb-3">
                <h1 className="text-xl font-bold text-gray-800">
                    {type === "create" ? "Create New Lesson" : "Update Lesson Schedule"}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    {type === "create" ? "Assign a subject, class, and time slot" : "Modify class timetable and time slot"}
                </p>
            </div>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Lesson Name / Topic"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                <InputField
                    label="Start Time"
                    name="startTime"
                    defaultValue={formatToLocalDatetime(data?.startTime)}
                    register={register}
                    error={errors?.startTime}
                    type="datetime-local"
                />
                <InputField
                    label="End Time"
                    name="endTime"
                    defaultValue={formatToLocalDatetime(data?.endTime)}
                    register={register}
                    error={errors?.endTime}
                    type="datetime-local"
                />

                {type === "update" && data?.id !== undefined && (
                    <InputField
                        label="Id"
                        name="id"
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Subject</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-slate-800 outline-none transition"
                        {...register("subjectId")}
                        defaultValue={data?.subjectId}
                    >
                        {subjects.map((subject: { id: number; name: string }) => (
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
                        className="ring-[1.5px] ring-gray-300 p-2.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-slate-800 outline-none transition"
                        {...register("classId")}
                        defaultValue={data?.classId}
                    >
                        {classes.map((classItem: { id: number; name: string }) => (
                            <option value={classItem.id} key={classItem.id}>
                                {formatClassName(classItem.name)}
                            </option>
                        ))}
                    </select>
                    {errors.classId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.classId.message.toString()}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Teacher</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-slate-800 outline-none transition"
                        {...register("teacherId")}
                        defaultValue={data?.teacherId}
                    >
                        {teachers.map(
                            (teacher: { id: string; name: string; surname: string }) => (
                                <option value={teacher.id} key={teacher.id}>
                                    {teacher.name + " " + teacher.surname}
                                </option>
                            )
                        )}
                    </select>
                    {errors.teacherId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.teacherId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            {state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {state.message || "Something went wrong while saving the lesson."}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium shadow-sm transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                    {isSubmitting ? "Saving..." : type === "create" ? "Create Lesson" : "Update Lesson"}
                </button>
            </div>
        </form>
    );
};

export default LessonForm;

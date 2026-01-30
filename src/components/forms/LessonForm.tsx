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

const LessonForm = ({
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
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
    });

    const [state, formAction] = useFormState(
        type === "create" ? createLesson : updateLesson,
        {
            success: false,
            error: false,
        }
    );

    const onSubmit = handleSubmit((formData) => {
        const dataToSubmit = { ...formData };

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

        formAction(dataToSubmit);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { subjects, classes, teachers } = relatedData;

    // Helper to format ISO (UTC) string to Local "YYYY-MM-DDTHH:mm" for input
    const formatToLocalDatetime = (isoString?: string) => {
        if (!isoString) return "";
        const safeIso = isoString.endsWith("Z") || isoString.includes("+") ? isoString : isoString + "Z";
        const date = new Date(safeIso);

        const pad = (n: number) => n.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new lesson" : "Update the lesson"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Lesson Name"
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

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Subject</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("classId")}
                        defaultValue={data?.classId}
                    >
                        {classes.map((classItem: { id: number; name: string }) => (
                            <option value={classItem.id} key={classItem.id}>
                                {classItem.name}
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
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
                <span className="text-red-500">Something went wrong!</span>
            )}
            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default LessonForm;

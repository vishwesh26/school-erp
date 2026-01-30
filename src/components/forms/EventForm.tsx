"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EventForm = ({
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
    } = useForm<EventSchema>({
        resolver: zodResolver(eventSchema),
    });

    const [state, formAction] = useFormState(
        type === "create" ? createEvent : updateEvent,
        {
            success: false,
            error: false,
        }
    );

    const onSubmit = handleSubmit((data) => {
        formAction(data);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { grades } = relatedData;

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        // Create local ISO string: YYYY-MM-DDTHH:mm
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const defaultStartTime = data?.startTime ? formatDateTime(data.startTime) : "";
    const defaultEndTime = data?.endTime ? formatDateTime(data.endTime) : "";

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new event" : "Update the event"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Event Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />
                <InputField
                    label="Description"
                    name="description"
                    defaultValue={data?.description}
                    register={register}
                    error={errors?.description}
                />
                <InputField
                    label="Start Time"
                    name="startTime"
                    defaultValue={defaultStartTime}
                    register={register}
                    error={errors?.startTime}
                    type="datetime-local"
                />
                <InputField
                    label="End Time"
                    name="endTime"
                    defaultValue={defaultEndTime}
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

                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Target Audience</label>
                    <div className="p-2 border border-gray-300 rounded-md flex flex-col gap-2 max-h-40 overflow-y-auto">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                value="-1"
                                {...register("gradeIds")}
                            />
                            <span className="text-sm text-gray-700">All Students</span>
                        </label>
                        {grades && grades.map((grade: { id: number; level: number }) => (
                            <label key={grade.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    value={grade.id}
                                    {...register("gradeIds")}
                                />
                                <span className="text-sm text-gray-700">Grade {grade.level}</span>
                            </label>
                        ))}
                    </div>
                    {errors.gradeIds?.message && (
                        <p className="text-xs text-red-400">
                            {errors.gradeIds.message.toString()}
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

export default EventForm;

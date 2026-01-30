"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect } from "react";
import { feeCategorySchema, FeeCategorySchema } from "@/lib/formValidationSchemas";
import { createFeeCategory, updateFeeCategory } from "@/lib/accountantActions";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";

const FeeCategoryForm = ({
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
    } = useForm<FeeCategorySchema>({
        resolver: zodResolver(feeCategorySchema),
        defaultValues: data,
    });

    const [state, formAction] = useFormState(
        type === "create" ? createFeeCategory : updateFeeCategory,
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
            toast(`Category has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { grades } = relatedData || { grades: [] };

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new Fee Category" : "Update Fee Category"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Category Name"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                <InputField
                    label="Amount (₹)"
                    name="baseAmount"
                    type="number"
                    defaultValue={data?.baseAmount}
                    register={register}
                    error={errors?.baseAmount}
                />

                <div className="flex flex-col gap-2 w-full md:w-[48%]">
                    <label className="text-xs text-gray-400">Grade (Optional - applies to all if empty)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("gradeId")}
                        defaultValue={data?.gradeId}
                    >
                        <option value="">All Grades</option>
                        {grades.map((grade: any) => (
                            <option value={grade.id} key={grade.id}>
                                Grade {grade.level}
                            </option>
                        ))}
                    </select>
                    {errors.gradeId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.gradeId.message.toString()}
                        </p>
                    )}
                </div>
            </div>

            <input type="hidden" {...register("id")} value={data?.id} />

            {state.error && (
                <span className="text-red-500 font-semibold">Something went wrong!</span>
            )}
            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default FeeCategoryForm;

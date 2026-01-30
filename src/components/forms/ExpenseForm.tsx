"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { expenseSchema, ExpenseSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createExpense, updateExpense } from "@/lib/accountantActions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ExpenseForm = ({
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
    } = useForm<ExpenseSchema>({
        resolver: zodResolver(expenseSchema),
        defaultValues: data ? {
            ...data,
            date: data.date ? new Date(data.date).toISOString().split("T")[0] : ""
        } : undefined
    });

    const [state, formAction] = useFormState(
        type === "create" ? createExpense : updateExpense,
        {
            success: false,
            error: false,
        } as { success: boolean; error: boolean }
    );

    const onSubmit = handleSubmit((data) => {
        formAction(data);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Expense has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Record New Expense" : "Update Expense Record"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors.title}
                />

                <InputField
                    label="Amount (₹)"
                    name="amount"
                    type="number"
                    defaultValue={data?.amount}
                    register={register}
                    error={errors.amount}
                />

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Category</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("category")}
                        defaultValue={data?.category}
                    >
                        <option value="Salary">Salary</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Utility">Utility</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.category?.message && (
                        <p className="text-xs text-red-400">
                            {errors.category.message.toString()}
                        </p>
                    )}
                </div>

                <InputField
                    label="Date"
                    name="date"
                    type="date"
                    defaultValue={data?.date ? new Date(data.date).toISOString().split("T")[0] : ""}
                    register={register}
                    error={errors.date}
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
            </div>

            {state.error && (
                <span className="text-red-500">Something went wrong!</span>
            )}
            <button type="submit" className="bg-lamaSky text-white p-2 rounded-md font-bold">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default ExpenseForm;

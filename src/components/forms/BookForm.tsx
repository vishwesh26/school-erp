"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { bookSchema, BookSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createBook, updateBook } from "@/lib/librarianActions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const BookForm = ({
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
    } = useForm<BookSchema>({
        resolver: zodResolver(bookSchema),
    });

    // Wrapper for update action to match signature if needed, or use directly if signatures match
    const formActionWrapper = async (prevState: any, formData: BookSchema) => {
        try {
            if (type === "create") {
                const res = await createBook(formData);
                if (res.error) return { success: false, error: true };
                return { success: true, error: false };
            } else {
                // Check if ID exists
                if (!data?.id) return { success: false, error: true };
                const res = await updateBook(data.id, formData);
                if (res.error) return { success: false, error: true };
                return { success: true, error: false };
            }
        } catch (err) {
            console.log(err);
            return { success: false, error: true };
        }
    };

    const [state, formAction] = useFormState(formActionWrapper, {
        success: false,
        error: false,
    });

    const onSubmit = handleSubmit((data) => {
        // If creating, set available copies = total copies if not provided
        if (type === "create") {
            data.available_copies = data.total_copies;
        }
        formAction(data);
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(`Book has been ${type === "create" ? "created" : "updated"}!`);
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Add a New Book" : "Update Book"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Title"
                    name="title"
                    defaultValue={data?.title}
                    register={register}
                    error={errors?.title}
                />
                <InputField
                    label="Author"
                    name="author"
                    defaultValue={data?.author}
                    register={register}
                    error={errors?.author}
                />
                <InputField
                    label="Accession No"
                    name="accession_no"
                    defaultValue={data?.accession_no}
                    register={register}
                    error={errors?.accession_no}
                />
                <InputField
                    label="Category"
                    name="category"
                    defaultValue={data?.category}
                    register={register}
                    error={errors?.category}
                />
                <InputField
                    label="Rack No"
                    name="rack_no"
                    defaultValue={data?.rack_no}
                    register={register}
                    error={errors?.rack_no}
                />
                <InputField
                    label="Total Copies"
                    name="total_copies"
                    type="number"
                    defaultValue={data?.total_copies}
                    register={register}
                    error={errors?.total_copies}
                />
            </div>
            <button className="bg-blue-400 text-white p-2 rounded-md">
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default BookForm;

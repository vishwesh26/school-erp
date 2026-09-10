"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers = [] } = relatedData || {};
  const initialTeacherId =
    data?.teacherId ||
    (Array.isArray(data?.teachers) ? data.teachers[0] : data?.teachers) ||
    "";

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-bold text-[#4e282c]">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
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
        <div className="flex flex-col gap-2 w-full md:w-5/12">
          <label className="text-xs font-semibold text-gray-700">
            Assigned Teacher
          </label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2.5 rounded-lg text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#4e282c]"
            {...register("teacherId")}
            defaultValue={initialTeacherId}
          >
            <option value="">-- Select Teacher (Optional) --</option>
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option value={teacher.id} key={teacher.id}>
                  {teacher.name} {teacher.surname}
                </option>
              )
            )}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-500 font-medium">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500 text-sm font-medium">
          {state.message || "Something went wrong!"}
        </span>
      )}
      <button className="bg-[#4e282c] hover:bg-[#3d1f22] transition-colors text-white py-2.5 px-6 rounded-lg font-medium shadow-sm">
        {type === "create" ? "Create Subject" : "Update Subject"}
      </button>
    </form>
  );
};

export default SubjectForm;

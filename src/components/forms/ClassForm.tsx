"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
} from "@/lib/formValidationSchemas";
import {
  createClass,
  updateClass,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
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
  const { teachers = [], grades = [] } = relatedData || {};

  // Infer initial division if updating (e.g. name "10A" -> "A")
  const initialDivision = data?.name ? data.name.replace(/^[0-9]+/, "") : "A";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      capacity: data?.capacity !== undefined ? Number(data.capacity) : 40,
      gradeId: data?.gradeId !== undefined ? Number(data.gradeId) : (grades[0]?.id ? Number(grades[0].id) : undefined),
      supervisorId: data?.supervisorId || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const selectedGradeId = watch("gradeId");
  const selectedDivision = watch("division" as any);

  // Watch logic to auto-update name if Grade or Division changes
  useEffect(() => {
    if (selectedGradeId) {
      const grade = grades.find((g: any) => g.id == selectedGradeId);
      const div = selectedDivision || initialDivision || "A";
      if (grade) {
        setValue("name", `${grade.level}${div}`);
      }
    }
  }, [selectedGradeId, selectedDivision, grades, initialDivision, setValue]);

  const onSubmit = handleSubmit((formData) => {
    // If name is empty, compose it or fallback to data.name
    if (!formData.name) {
      const grade = grades.find((g: any) => g.id == formData.gradeId);
      const div = selectedDivision || initialDivision || "A";
      if (grade) {
        formData.name = `${grade.level}${div}`;
      } else if (data?.name) {
        formData.name = data.name;
      }
    }

    if (type === "update" && data?.id) {
      formData.id = Number(data.id);
    }

    formData.capacity = Number(formData.capacity);
    formData.gradeId = Number(formData.gradeId);
    if (!formData.supervisorId || formData.supervisorId.trim() === "") {
      formData.supervisorId = null;
    }

    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Class has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-bold text-slate-800">
        {type === "create" ? "Create a new class" : "Update Class & Strength"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Hidden Name Input for Zod/Submission */}
        <input type="hidden" {...register("name")} defaultValue={data?.name || ""} />

        {/* Class / Grade Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Class (Grade)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full font-semibold outline-none focus:ring-2 focus:ring-lamaSky"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            <option value="">Select Grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option
                value={grade.id}
                key={grade.id}
              >
                Grade {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-500 font-semibold">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        {/* Division Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Division</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full font-semibold outline-none focus:ring-2 focus:ring-lamaSky"
            {...register("division" as any)}
            defaultValue={initialDivision}
          >
            <option value="">Select Division</option>
            {["A", "B", "C", "D", "E"].map((div) => (
              <option value={div} key={div}>
                Division {div}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Capacity / Max Strength"
          name="capacity"
          type="number"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
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
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supervisor / Class Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full font-semibold outline-none focus:ring-2 focus:ring-lamaSky"
            {...register("supervisorId")}
            defaultValue={data?.supervisorId || ""}
          >
            <option value="">None (No Supervisor)</option>
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option
                  value={teacher.id}
                  key={teacher.id}
                >
                  {teacher.name + " " + teacher.surname}
                </option>
              )
            )}
          </select>
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-500 font-semibold">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">
          Failed to save class. Please ensure all required fields are filled correctly.
        </div>
      )}

      <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer">
        {type === "create" ? "Create Class" : "Update Class & Strength"}
      </button>
    </form>
  );
};

export default ClassForm;


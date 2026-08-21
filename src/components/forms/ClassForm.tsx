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

import { formatGrade } from "@/lib/utils";

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

  // Infer initial division if updating (e.g. name "10A" -> "A", "Nursery B" -> "B")
  const initialDivision = data?.name ? (data.name.match(/[A-Z]$/i)?.[0]?.toUpperCase() || "A") : "A";

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

  // Watch logic to auto-update name if Grade or Division changes on create mode
  useEffect(() => {
    if (selectedGradeId && type === "create") {
      const grade = grades.find((g: any) => g.id == selectedGradeId);
      const div = selectedDivision || initialDivision || "A";
      if (grade) {
        if (grade.level === -2) {
          setValue("name", `Nursery ${div}`);
        } else if (grade.level === -1) {
          setValue("name", `Junior KG ${div}`);
        } else if (grade.level === 0) {
          setValue("name", `Senior KG ${div}`);
        } else {
          setValue("name", `${grade.level}${div}`);
        }
      }
    }
  }, [selectedGradeId, selectedDivision, grades, initialDivision, setValue, type]);

  const onSubmit = handleSubmit((formData) => {
    // If name is empty, compose it or fallback to data.name
    if (!formData.name || formData.name.trim() === "") {
      const grade = grades.find((g: any) => g.id == formData.gradeId);
      const div = selectedDivision || initialDivision || "A";
      if (grade) {
        if (grade.level === -2) {
          formData.name = `Nursery ${div}`;
        } else if (grade.level === -1) {
          formData.name = `Junior KG ${div}`;
        } else if (grade.level === 0) {
          formData.name = `Senior KG ${div}`;
        } else {
          formData.name = `${grade.level}${div}`;
        }
      } else if (data?.name) {
        formData.name = data.name;
      }
    } else {
      formData.name = formData.name.trim();
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
        {type === "create" ? "Create a new class" : "Update Class & Rename"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Name Input - Editable for renaming */}
        <div className="md:col-span-2">
          <InputField
            label="Class Name (e.g. Nursery A, Junior KG B, 10A)"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors?.name}
            placeholder="e.g. Nursery A, Senior KG B, 10A"
          />
        </div>

        {/* Class / Grade Selection */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Class (Grade)</label>
          <select
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#f16122] focus:bg-white focus:ring-2 focus:ring-[#f16122]/20 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold outline-none transition-all duration-200 shadow-2xs"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            <option value="">Select Grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option
                value={grade.id}
                key={grade.id}
              >
                {formatGrade(grade.level)}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        {/* Division Selection */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Division</label>
          <select
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#f16122] focus:bg-white focus:ring-2 focus:ring-[#f16122]/20 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold outline-none transition-all duration-200 shadow-2xs"
            {...register("division" as any)}
            defaultValue={initialDivision}
          >
            <option value="">Select Division</option>
            {["A", "B", "C", "D", "E", "F"].map((div) => (
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

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Supervisor / Class Teacher</label>
          <select
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#f16122] focus:bg-white focus:ring-2 focus:ring-[#f16122]/20 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold outline-none transition-all duration-200 shadow-2xs"
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
            <p className="text-xs text-rose-500 font-medium">
              {errors.supervisorId.message.toString()}
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


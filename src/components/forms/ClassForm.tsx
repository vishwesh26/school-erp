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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { formatGrade, formatClassName } from "@/lib/utils";

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Initial formatted class name for clean editing
  const initialName = data?.name ? formatClassName(data.name) : "";

  // Infer initial division (e.g. name "10A" -> "A", "Nursery B" -> "B")
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
      id: data?.id ? Number(data.id) : undefined,
      name: initialName,
      capacity: data?.capacity !== undefined ? Number(data.capacity) : 40,
      gradeId: data?.gradeId !== undefined ? Number(data.gradeId) : (grades[0]?.id ? Number(grades[0].id) : undefined),
      supervisorId: data?.supervisorId || "",
    },
  });

  const selectedGradeId = watch("gradeId");
  const selectedDivision = watch("division" as any);

  // Helper to generate standard name from selected grade and division
  const generateName = (gradeId: number | string | undefined, div: string) => {
    const grade = grades.find((g: any) => g.id == gradeId);
    if (!grade) return "";
    if (grade.level === -2) return `Nursery ${div}`;
    if (grade.level === -1) return `Junior KG ${div}`;
    if (grade.level === 0) return `Senior KG ${div}`;
    return `${grade.level}${div}`;
  };

  // Auto-generate name on create mode or when requested
  useEffect(() => {
    if (type === "create" && selectedGradeId) {
      const generated = generateName(selectedGradeId, selectedDivision || initialDivision || "A");
      if (generated) {
        setValue("name", generated, { shouldValidate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGradeId, selectedDivision, type]);

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Ensure name is clean and non-empty
      let finalName = formData.name ? formData.name.trim() : "";
      if (!finalName) {
        finalName = generateName(formData.gradeId, selectedDivision || initialDivision || "A") || data?.name || "";
      }

      if (!finalName) {
        setErrorMessage("Class name cannot be empty.");
        setLoading(false);
        return;
      }

      const payload: ClassSchema = {
        id: type === "update" ? Number(data?.id || formData.id) : undefined,
        name: finalName,
        capacity: Number(formData.capacity),
        gradeId: Number(formData.gradeId),
        supervisorId: formData.supervisorId && formData.supervisorId.trim() !== "" ? formData.supervisorId : null,
      };

      const result = type === "create"
        ? await createClass({ success: false, error: false }, payload)
        : await updateClass({ success: false, error: false }, payload);

      if (result.success) {
        toast.success(`Class has been ${type === "create" ? "created" : "updated"} successfully!`);
        setOpen(false);
        router.refresh();
      } else {
        const msg = (result as any).message || "Failed to save class. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error("ClassForm submit error:", err);
      const msg = err?.message || "An unexpected error occurred while saving.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            {type === "create" ? "Create New Class" : "Rename & Edit Class"}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {type === "create" ? "Set up a new class division and capacity." : "Update class name, grade, capacity, or supervisor."}
          </p>
        </div>
        {type === "update" && (
          <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200/80">
            ID: {data?.id}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Name Input - Editable for renaming */}
        <div className="md:col-span-2">
          <InputField
            label="Class Name (Rename freely, e.g. Nursery A, Senior KG B, 10A)"
            name="name"
            defaultValue={initialName}
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
            onChange={(e) => {
              register("gradeId").onChange(e);
              const generated = generateName(e.target.value, selectedDivision || initialDivision || "A");
              if (generated) setValue("name", generated, { shouldValidate: true });
            }}
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
            onChange={(e) => {
              const div = e.target.value;
              const generated = generateName(selectedGradeId || data?.gradeId, div);
              if (generated) setValue("name", generated, { shouldValidate: true });
            }}
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

        {data?.id && (
          <input
            type="hidden"
            {...register("id")}
            value={data.id}
          />
        )}
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#4e282c] via-[#802a2c] to-[#f16122] hover:opacity-95 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 text-xs flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{type === "create" ? "Create Class" : "Save Class Changes"}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
  subjectSchema,
  SubjectSchema,
} from "@/lib/formValidationSchemas";
import {
  createClass,
  createSubject,
  updateClass,
  updateSubject,
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
  });

  // Watch fields to auto-generate name if needed (optional, or just handle in submit)
  // Actually, we'll compose data on submit, but zod needs 'name' to pass validation.
  // So we'll update a hidden 'name' field whenever Grade or Division changes.

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    // Determine Name from Logic
    // formData.gradeId is the ID. We need the Level.
    const selectedGrade = relatedData?.grades?.find((g: any) => g.id == formData.gradeId);
    const level = selectedGrade?.level || "";
    // division is custom field, we need to register it or just read from form?
    // We can register 'division' even if not in schema if we cast or just read value.
    // Actually simpler: Just accept "name" is what we send.
    // If user filled "Class" (GradeId) and "Division", we set Name = Level + Division.

    // However, validation happens BEFORE onSubmit. 
    // So 'name' must be populated.
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Class has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers, grades } = relatedData;

  // Watch logic to update hidden Name
  const selectedGradeId = watch("gradeId");
  const selectedDivision = watch("division" as any); // "division" not in schema, safe cast

  useEffect(() => {
    if (selectedGradeId && selectedDivision) {
      const grade = grades.find((g: any) => g.id == selectedGradeId);
      if (grade) {
        setValue("name", `${grade.level}${selectedDivision}`);
      }
    }
  }, [selectedGradeId, selectedDivision, grades, setValue]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new class" : "Update the class"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {/* Hidden Name Input for Zod/Submission */}
        <input type="hidden" {...register("name")} />

        {/* Class / Grade Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class (Grade)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            <option value="">Select Grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option
                value={grade.id}
                key={grade.id}
                selected={data && grade.id === data.gradeId}
              >
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        {/* Division Selection */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Division</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("division" as any)} // Register as custom
            defaultValue={data?.name ? data.name.slice(-1) : ""} // Guess division from name if updating
          >
            <option value="">Select Division</option>
            {["A", "B", "C", "D", "E"].map((div) => (
              <option value={div} key={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Capacity"
          name="capacity"
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
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
            <p className="text-xs text-red-400">
              {errors.supervisorId.message.toString()}
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

export default ClassForm;

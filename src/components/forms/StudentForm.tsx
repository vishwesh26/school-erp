"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  studentSchema,
  StudentSchema,
  teacherSchema,
  TeacherSchema,
} from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
  createStudent,
  createTeacher,
  updateStudent,
  updateTeacher,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();

  const selectedClassId = watch("classId");
  const rollNumberValue = watch("rollNumber");

  const { grades, classes } = relatedData;

  useEffect(() => {
    if (type === "create" && selectedClassId && rollNumberValue && rollNumberValue.length >= 3) {
      const classItem = classes.find((c: any) => c.id === parseInt(selectedClassId as any));
      if (classItem) {
        setValue("username", `${classItem.name}-${rollNumberValue}`);
      }
    }
  }, [selectedClassId, rollNumberValue, classes, setValue, type]);

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("hello");
    console.log(data);
    formAction({ ...data, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);


  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>
      <span className="text-sm text-blue-600 font-bold border-b pb-2 mb-2">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-x-4 gap-y-2">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
          inputProps={{ readOnly: type === "update", className: type === "update" ? "bg-gray-100 cursor-not-allowed" : "" }}
        />
        <InputField
          label="Roll Number"
          name="rollNumber"
          defaultValue={data?.rollNumber}
          register={register}
          error={errors?.rollNumber}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-sm text-blue-600 font-bold border-b pb-2 mb-2">
        Personal Information
      </span>
      {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => {
            return (
              <div
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 w-max"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="" width={24} height={24} />
                <span>{img ? "Photo uploaded!" : "Upload a photo"}</span>
              </div>
            );
          }}
        </CldUploadWidget>
      )}
      <div className="flex justify-between flex-wrap gap-x-4 gap-y-2">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
          register={register}
          error={errors.birthday}
          type="date"
        />
        <InputField
          label="Parent Id"
          name="parentId"
          defaultValue={data?.parentId}
          register={register}
          error={errors.parentId}
          inputProps={{ readOnly: type === "update", className: type === "update" ? "bg-gray-100 cursor-not-allowed" : "" }}
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
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className={`ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full ${type === "update" ? "bg-gray-100 pointer-events-none" : ""}`}
            {...register("gradeId")}
            defaultValue={data?.gradeId}
            tabIndex={type === "update" ? -1 : 0}
            aria-disabled={type === "update"}
          >
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className={`ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full ${type === "update" ? "bg-gray-100 pointer-events-none" : ""}`}
            {...register("classId")}
            defaultValue={data?.classId}
            tabIndex={type === "update" ? -1 : 0}
            aria-disabled={type === "update"}
          >
            {classes.map(
              (classItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={classItem.id} key={classItem.id}>
                  ({classItem.name} -{" "}
                  {classItem._count.students + "/" + classItem.capacity}{" "}
                  Capacity)
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
      </div>

      <span className="text-sm text-blue-600 font-bold border-b pb-2 mb-2 flex items-center gap-2">
        Official Identifiers
        <span className="text-[10px] font-normal text-gray-400 border border-gray-200 px-1 rounded uppercase tracking-tighter">Optional</span>
      </span>
      <div className="flex justify-between flex-wrap gap-x-4 gap-y-2">
        <InputField
          label="Student Id"
          name="stateStudentId"
          inputProps={{ placeholder: "Student Id / Saral Id" }}
          defaultValue={data?.stateStudentId}
          register={register}
          error={errors.stateStudentId}
        />
        <InputField
          label="PEN"
          name="pen"
          inputProps={{ placeholder: "Permanent Education Number" }}
          defaultValue={data?.pen}
          register={register}
          error={errors.pen}
        />
        <InputField
          label="APAAR ID"
          name="apaarId"
          defaultValue={data?.apaarId}
          register={register}
          error={errors.apaarId}
        />
      </div>

      <span className="text-sm text-blue-600 font-bold border-b pb-2 mb-2">
        Identity & Background (For Certificate)
      </span>
      <div className="flex justify-between flex-wrap gap-x-4 gap-y-2">
        <InputField
          label="Mother&apos;s Name"
          name="motherName"
          defaultValue={data?.motherName}
          register={register}
          error={errors.motherName}
        />
        <InputField
          label="Aadhar No"
          name="aadharNo"
          defaultValue={data?.aadharNo}
          register={register}
          error={errors.aadharNo}
        />
        <InputField
          label="Place of Birth"
          name="placeOfBirth"
          defaultValue={data?.placeOfBirth}
          register={register}
          error={errors.placeOfBirth}
        />
        <InputField
          label="Taluka"
          name="taluka"
          defaultValue={data?.taluka}
          register={register}
          error={errors.taluka}
        />
        <InputField
          label="District"
          name="district"
          defaultValue={data?.district}
          register={register}
          error={errors.district}
        />
        <InputField
          label="Nationality"
          name="nationality"
          defaultValue={data?.nationality}
          register={register}
          error={errors.nationality}
        />
        <InputField
          label="Religion"
          name="religion"
          defaultValue={data?.religion}
          register={register}
          error={errors.religion}
        />
        <InputField
          label="Caste"
          name="caste"
          defaultValue={data?.caste}
          register={register}
          error={errors.caste}
        />
        <InputField
          label="Is ST? (Yes/No)"
          name="isST"
          defaultValue={data?.isST}
          register={register}
          error={errors.isST}
        />
      </div>


      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const formatDate = (val: any) => {
  if (!val) return "";
  try {
    const d = typeof val === "string" || typeof val === "number" ? new Date(val) : val instanceof Date ? val : new Date(val);
    if (!d || isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const TeacherForm = ({
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
    setValue,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [imgUrl, setImgUrl] = useState<string>(data?.img || "");
  const [cldImg, setCldImg] = useState<any>();

  const initialSubjects = data?.subjects
    ? data.subjects.map((s: any) => (typeof s === "object" ? s.id : Number(s)))
    : [];
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>(initialSubjects);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    const photoToSave = imgUrl || cldImg?.secure_url || data?.img || null;
    formAction({
      ...formData,
      img: photoToSave,
      subjects: selectedSubjects.map(String),
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update teacher profile"}
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

      {/* Profile Photo Uploader */}
      <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-gray-200 rounded-xl">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Profile Photo
        </label>
        <div className="flex items-center gap-4 flex-wrap">
          {imgUrl || data?.img ? (
            <Image
              src={imgUrl || data?.img}
              alt="Teacher Photo"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-lamaSky shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold border border-gray-300">
              No Photo
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-700 flex items-center gap-2 cursor-pointer bg-white hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-300 transition-colors w-max font-semibold shadow-sm active:scale-95">
              <Image src="/upload.png" alt="" width={18} height={18} />
              <span>{imgUrl || data?.img ? "Change Photo" : "Upload Photo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
              <CldUploadWidget
                uploadPreset="school"
                onSuccess={(result, { widget }) => {
                  if ((result.info as any)?.secure_url) {
                    setCldImg(result.info);
                    setImgUrl((result.info as any).secure_url);
                  }
                  widget.close();
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline text-left font-medium"
                    onClick={() => open()}
                  >
                    Upload via Cloudinary
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>
        </div>
      </div>

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
          defaultValue={formatDate(data?.birthday)}
          register={register}
          error={errors.birthday}
          type="date"
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
      </div>

      {/* Subjects Selection Manager */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Assigned Subjects (Click to select/deselect)
        </label>
        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-gray-200 rounded-xl">
          {subjects.map((subject: { id: number; name: string }) => {
            const isSelected = selectedSubjects.includes(subject.id);
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => toggleSubject(subject.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <span>{isSelected ? "✓" : "+"}</span>
                <span>{subject.name}</span>
              </button>
            );
          })}
          {(!subjects || subjects.length === 0) && (
            <span className="text-xs text-gray-400 italic">No subjects available to select.</span>
          )}
        </div>
        {errors.subjects?.message && (
          <p className="text-xs text-red-400">
            {errors.subjects.message.toString()}
          </p>
        )}
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
        {type === "create" ? "Create Teacher" : "Save Profile Changes"}
      </button>
    </form>
  );
};

export default TeacherForm;

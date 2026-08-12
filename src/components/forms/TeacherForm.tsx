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
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            {type === "create" ? "Create New Teacher" : "Edit Teacher Profile"}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {type === "create" ? "Fill in credentials and personal details to register a teacher." : "Update profile information and assigned subjects."}
          </p>
        </div>
      </div>

      {/* AUTHENTICATION SECTION */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-[#4e282c] flex items-center gap-2 border-b border-[#4e282c]/10 pb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f16122]"></span>
          Authentication Information
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Username"
            name="username"
            defaultValue={data?.username}
            register={register}
            error={errors?.username}
          />
          <InputField
            label="Email Address"
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
      </div>

      {/* PERSONAL INFORMATION SECTION */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-[#4e282c] flex items-center gap-2 border-b border-[#4e282c]/10 pb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f16122]"></span>
          Personal Information
        </span>

        {/* Profile Photo Uploader */}
        <div className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Profile Photo
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            {imgUrl || data?.img ? (
              <Image
                src={imgUrl || data?.img}
                alt="Teacher Photo"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#f16122] shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-300">
                No Photo
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-700 flex items-center gap-2 cursor-pointer bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-300 transition-all font-bold shadow-2xs active:scale-95">
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
                      className="text-xs text-[#f16122] hover:underline text-left font-bold"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
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
            label="Phone Number"
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
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sex</label>
            <select
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#f16122] focus:bg-white focus:ring-2 focus:ring-[#f16122]/20 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold outline-none transition-all duration-200 shadow-2xs"
              {...register("sex")}
              defaultValue={data?.sex}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.sex?.message && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.sex.message.toString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ASSIGNED SUBJECTS MANAGER */}
      <div className="flex flex-col gap-2 pt-1">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Assigned Subjects</span>
          <span className="text-[10px] text-slate-400 font-normal">Click tag to select/deselect</span>
        </label>
        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
          {subjects.map((subject: { id: number; name: string }) => {
            const isSelected = selectedSubjects.includes(subject.id);
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => toggleSubject(subject.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#4e282c] text-white shadow-xs scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                }`}
              >
                <span>{isSelected ? "✓" : "+"}</span>
                <span>{subject.name}</span>
              </button>
            );
          })}
          {(!subjects || subjects.length === 0) && (
            <span className="text-xs text-slate-400 italic">No subjects available to select.</span>
          )}
        </div>
        {errors.subjects?.message && (
          <p className="text-xs text-rose-500 font-medium">
            {errors.subjects.message.toString()}
          </p>
        )}
      </div>

      {state.error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold">
          Something went wrong! Please check your input and try again.
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-[#4e282c] to-[#f16122] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-[#f16122]/20 active:scale-95 transition-all"
        >
          {type === "create" ? "Create Teacher" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;

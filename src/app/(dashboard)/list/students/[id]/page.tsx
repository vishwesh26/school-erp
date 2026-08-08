import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;

  const { data: student, error } = await supabase
    .from("Student")
    .select("*, class:Class(*)")
    .eq("id", id)
    .single();

  if (error || !student) {
    return notFound();
  }

  // Fetch lesson count for the class
  const { count: lessonCount, error: lessonError } = await supabase
    .from("Lesson")
    .select("*", { count: "exact", head: true })
    .eq("classId", student.classId);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl flex-1 flex flex-col sm:flex-row gap-6 shadow-xl border border-white/10 relative overflow-hidden group animate-slide-up hover-lift">
            {/* Decorative ambient background glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-lamaPurple/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative p-1 rounded-full bg-gradient-to-br from-white/30 to-white/5 border border-white/20 shadow-lg">
                <Image
                  src={student.img || "/noAvatar.png"}
                  alt=""
                  width={128}
                  height={128}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-inner"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-4 min-w-0 z-10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                    {student.name + " " + student.surname}
                  </h1>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-0.5 inline-block">
                    Student Profile
                  </span>
                </div>
                {["admin", "teacher"].includes(role) && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0">
                  <Image src="/blood.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                  <span className="truncate text-white/90">{student.bloodType || "-"}</span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0">
                  <Image src="/date.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                  <span className="truncate text-white/90">
                    {new Intl.DateTimeFormat("en-GB").format(new Date(student.birthday))}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0 col-span-1 sm:col-span-2" title={student.email || "-"}>
                  <Image src="/mail.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                  <span className="truncate text-white/90">{student.email || "-"}</span>
                </div>

                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-200 min-w-0 col-span-1 sm:col-span-2">
                  <Image src="/phone.png" alt="" width={15} height={15} className="invert brightness-200 flex-shrink-0" />
                  <span className="truncate text-white/90">{student.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Suspense fallback="loading...">
                <StudentAttendanceCard id={student.id} />
              </Suspense>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {student.class?.name ? parseInt(student.class.name) : ""}th
                </h1>
                <span className="text-sm text-gray-400">Grade</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {lessonCount || 0}
                </h1>
                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">{student.class?.name}</h1>
                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Student&apos;s Schedule</h1>
          <BigCalendarContainer type="classId" id={student.classId} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/lessons?classId=${student.classId}`}
            >
              Student&apos;s Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/teachers?classId=${student.classId}`}
            >
              Student&apos;s Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?classId=${student.classId}`}
            >
              Student&apos;s Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/assignments?classId=${student.classId}`}
            >
              Student&apos;s Assignments
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/results?studentId=${student.id}`}
            >
              Student&apos;s Results
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;

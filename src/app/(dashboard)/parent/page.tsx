import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatGrade, formatClassName } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const ParentPage = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  let students: any[] = [];

  if (currentUserId) {
    // 1. Direct query by parentId
    const { data: directStudents } = await supabase
      .from("Student")
      .select("*, class:Class(*), grade:Grade!gradeId(level)")
      .eq("parentId", currentUserId);

    if (directStudents && directStudents.length > 0) {
      students = directStudents;
    } else {
      // 2. Lookup parent record by user id or email or phone
      const { data: parentRecord } = await supabase
        .from("Parent")
        .select("id")
        .or(
          `id.eq.${currentUserId},email.eq.${user?.email || ""},phone.eq.${
            user?.phone || ""
          }`
        )
        .limit(1)
        .single();

      if (parentRecord?.id) {
        const { data: matchedStudents } = await supabase
          .from("Student")
          .select("*, class:Class(*), grade:Grade!gradeId(level)")
          .eq("parentId", parentRecord.id);
        students = matchedStudents || [];
      }
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-6 flex gap-6 flex-col xl:flex-row max-w-7xl mx-auto w-full">
      {/* LEFT COLUMN: STUDENT PROFILES & SCHEDULE */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        {/* WELCOME / HEADER */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#f16122] bg-[#fdece7] px-3 py-1 rounded-full">
              Parent Portal
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-2">
              My Children & Academics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              View real-time student profiles, updated photos, attendance, and weekly timetables.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              {students.length} {students.length === 1 ? "Child Linked" : "Children Linked"}
            </span>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
              👨‍👧‍👦
            </div>
            <h3 className="text-base font-bold text-slate-700">No Student Records Linked</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Your parent account is active, but no student records are currently assigned to your ID. Please contact school administration if your child is not listed here.
            </p>
          </div>
        ) : (
          students.map((student: any) => {
            const gradeName =
              student.grade?.level !== undefined
                ? formatGrade(student.grade.level)
                : formatGrade(student.class?.name);
            const className = formatClassName(student.class?.name) || "Not Assigned";

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-gray-100/90 shadow-sm overflow-hidden flex flex-col gap-6 p-6 transition-all duration-300 hover:shadow-md"
              >
                {/* STUDENT PROFILE HERO CARD */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl border border-white/10 relative overflow-hidden group">
                  {/* Decorative Glow */}
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#f16122]/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                  {/* STUDENT PHOTO (UPDATED BY TEACHER/ADMIN) */}
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#f16122]/60 via-white/20 to-white/5 border border-white/20 shadow-2xl">
                      <Image
                        src={student.img || "/noAvatar.png"}
                        alt={`${student.name} ${student.surname || ""}`}
                        width={128}
                        height={128}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-cover shadow-inner bg-slate-800"
                        priority
                      />
                      <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-xs uppercase tracking-wider">
                        Enrolled
                      </span>
                    </div>
                  </div>

                  {/* STUDENT DETAILS */}
                  <div className="flex-1 flex flex-col justify-between gap-4 w-full min-w-0 text-center sm:text-left z-10">
                    <div>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f16122] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                          {gradeName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[11px] font-bold tracking-wide backdrop-blur-xs border border-white/10">
                          Class {className}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                          Roll No: {student.rollNumber || "N/A"}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                        {student.name} {student.surname || ""}
                      </h2>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        Username: <span className="text-white font-bold">{student.username}</span>
                      </p>
                    </div>

                    {/* METADATA CHIPS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
                      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                        <span className="text-[10px] text-white/60 uppercase block font-bold">Blood Group</span>
                        <span className="text-white">{student.bloodType || "-"}</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                        <span className="text-[10px] text-white/60 uppercase block font-bold">Date of Birth</span>
                        <span className="text-white">{formatDate(student.birthday)}</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-white/60 uppercase block font-bold">Gender</span>
                        <span className="text-white capitalize">{student.sex?.toLowerCase() || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATTENDANCE & SHORTCUTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ATTENDANCE CARD */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-slate-200 flex-shrink-0">
                      <Image
                        src="/singleAttendance.png"
                        alt="Attendance"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Attendance Status
                      </span>
                      <Suspense fallback={<span className="text-xs text-slate-400">Loading attendance...</span>}>
                        <StudentAttendanceCard id={student.id} />
                      </Suspense>
                    </div>
                  </div>

                  {/* QUICK SHORTCUTS */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-col justify-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Quick Portals
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/list/results?studentId=${student.id}`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                      >
                        📊 Exam Results
                      </Link>
                      <Link
                        href={`/list/assignments`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                      >
                        📝 Assignments
                      </Link>
                    </div>
                  </div>
                </div>

                {/* SCHEDULE TIMETABLE */}
                <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f16122]" />
                      Weekly Class Schedule ({className})
                    </h3>
                  </div>
                  <div className="h-[550px] bg-slate-50 p-3 rounded-xl border border-slate-200/70 overflow-hidden">
                    {student.classId ? (
                      <BigCalendarContainer type="classId" id={student.classId} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                        No class timetable assigned yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RIGHT COLUMN: ANNOUNCEMENTS */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;

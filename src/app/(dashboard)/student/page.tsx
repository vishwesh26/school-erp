import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import { createClient } from "@/lib/supabase/server";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import { Suspense } from "react";
import Image from "next/image";

const StudentPage = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const { data: student } = await supabase
    .from('Student')
    .select('*, class:Class(*)')
    .eq('id', userId)
    .single();

  const classId = student?.classId;

  // Fetch lesson count
  let lessonCount = 0;
  if (classId) {
    const { count } = await supabase
      .from("Lesson")
      .select("*", { count: "exact", head: true })
      .eq("classId", classId);
    lessonCount = count || 0;
  }

  return (
    <div className="p-4 flex gap-4 flex-col">
      {/* SUMMARY CARDS */}
      <div className="flex gap-4 justify-between flex-wrap">
        {/* CARD */}
        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[24%] shadow-sm">
          <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-6 h-6" />
          <Suspense fallback="loading...">
            <StudentAttendanceCard id={userId!} />
          </Suspense>
        </div>
        {/* CARD */}
        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[24%] shadow-sm">
          <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold">
              {student?.class?.name ? parseInt(student.class.name) : ""}th
            </h1>
            <span className="text-sm text-gray-400">Grade</span>
          </div>
        </div>
        {/* CARD */}
        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[24%] shadow-sm">
          <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold">{lessonCount}</h1>
            <span className="text-sm text-gray-400">Lessons</span>
          </div>
        </div>
        {/* CARD */}
        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[24%] shadow-sm">
          <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold">{student?.class?.name || "-"}</h1>
            <span className="text-sm text-gray-400">Class</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-col xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
          <div className="h-full bg-white p-4 rounded-md shadow-sm">
            <h1 className="text-xl font-semibold mb-4">Schedule ({student?.class?.name || "-"})</h1>
            {classId && <BigCalendarContainer type="classId" id={classId} />}
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
          <EventCalendar />
          <Announcements classId={classId} />
        </div>
      </div>
    </div>
  );
};

export default StudentPage;

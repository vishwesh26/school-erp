import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import { createClient } from "@/lib/supabase/server";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import StudentDashboardClient from "@/components/dashboard/StudentDashboardClient";
import { Suspense } from "react";

const StudentPage = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const { data: student } = await supabase
    .from('Student')
    .select('*, class:Class(*), grade:Grade!gradeId(level)')
    .eq('id', userId)
    .single();

  const classId = student?.classId;

  // 1. Fetch lesson count
  let lessonCount = 0;
  if (classId) {
    const { count } = await supabase
      .from("Lesson")
      .select("*", { count: "exact", head: true })
      .eq("classId", classId);
    lessonCount = count || 0;
  }

  // 2. Fetch homework/assignments for this class (Demo 4 style)
  let homeworkItems: any[] = [];
  if (classId) {
    const { data: assignments } = await supabase
      .from("Assignment")
      .select("*, subject:Subject(*), teacher:Teacher(*)")
      .eq("classId", classId)
      .order("dueDate", { ascending: false })
      .limit(6);

    homeworkItems = (assignments || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      subjectName: a.subject?.name || "General",
      className: student?.class?.name,
      teacherName: a.teacher ? `${a.teacher.name} ${a.teacher.surname || ""}`.trim() : undefined,
      assignedDate: a.startDate || a.createdAt,
      dueDate: a.dueDate,
      status: new Date(a.dueDate) < new Date() ? "Pending" : "Assigned",
    }));
  }

  // 3. Fetch classmates (Demo 5 style)
  let classmates: any[] = [];
  if (classId) {
    const { data: studentsData } = await supabase
      .from("Student")
      .select("id, name, surname, img, rollNumber")
      .eq("classId", classId)
      .order("rollNumber", { ascending: true });

    classmates = (studentsData || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      surname: s.surname,
      img: s.img,
      rollNumber: s.rollNumber,
      className: student?.class?.name,
    }));
  }

  return (
    <StudentDashboardClient
      student={student}
      lessonCount={lessonCount}
      homeworkItems={homeworkItems}
      classmates={classmates}
      attendanceSlot={
        <Suspense fallback={<div className="h-6 w-16 bg-slate-100 animate-pulse rounded" />}>
          <StudentAttendanceCard id={userId!} />
        </Suspense>
      }
      scheduleSlot={
        classId ? (
          <BigCalendarContainer type="classId" id={classId} />
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">No class schedule assigned.</div>
        )
      }
      calendarSlot={<EventCalendar />}
      announcementsSlot={<Announcements classId={classId} />}
    />
  );
};

export default StudentPage;

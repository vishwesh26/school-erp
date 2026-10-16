import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import { createClient } from "@/lib/supabase/server";
import ParentDashboardClient from "@/components/dashboard/ParentDashboardClient";
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
    <ParentDashboardClient
      students={students}
      announcementsSlot={
        <Suspense fallback={<div className="h-64 w-full bg-slate-100 rounded-3xl animate-pulse" />}>
          <Announcements />
        </Suspense>
      }
      renderAttendanceCard={(studentId: string) => (
        <Suspense fallback={<div className="h-6 w-16 bg-slate-200 animate-pulse rounded" />}>
          <StudentAttendanceCard id={studentId} showLabel={false} />
        </Suspense>
      )}
      renderCalendar={(classId: number | string) => (
        <Suspense fallback={<div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl" />}>
          <BigCalendarContainer type="classId" id={classId} />
        </Suspense>
      )}
    />
  );
};

export default ParentPage;

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import TeacherDashboardClient from "@/components/dashboard/TeacherDashboardClient";
import { createClient } from "@/lib/supabase/server";

const TeacherPage = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  // 1. Fetch Teacher Profile
  const { data: teacher } = await supabase
    .from('Teacher')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  // 2. Fetch Supervised Class (if any)
  const { data: supervisedClass } = await supabase
    .from('Class')
    .select('*')
    .eq('supervisorId', userId)
    .maybeSingle();

  // 3. Lesson Count
  let lessonCount = 0;
  if (userId) {
    const { count } = await supabase
      .from('Lesson')
      .select('*', { count: 'exact', head: true })
      .eq('teacherId', userId);
    lessonCount = count || 0;
  }

  // 4. Recently Assigned Homework (Demo 4 style)
  let homeworkItems: any[] = [];
  if (userId) {
    const { data: assignments } = await supabase
      .from('Assignment')
      .select('*, subject:Subject(*), class:Class(*)')
      .eq('teacherId', userId)
      .order('dueDate', { ascending: false })
      .limit(6);

    homeworkItems = (assignments || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      subjectName: a.subject?.name || "General",
      className: a.class?.name,
      teacherName: teacher ? `${teacher.name} ${teacher.surname || ""}`.trim() : undefined,
      assignedDate: a.startDate || a.createdAt,
      dueDate: a.dueDate,
      status: new Date(a.dueDate) < new Date() ? "Pending" : "Assigned",
    }));
  }

  // 5. Class Students Roster (Demo 5 style)
  let classStudents: any[] = [];
  if (supervisedClass?.id) {
    const { data: students } = await supabase
      .from('Student')
      .select('id, name, surname, img, rollNumber')
      .eq('classId', supervisedClass.id)
      .order('rollNumber', { ascending: true });

    classStudents = (students || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      surname: s.surname,
      img: s.img,
      rollNumber: s.rollNumber,
      className: supervisedClass.name,
    }));
  }

  return (
    <TeacherDashboardClient
      teacher={teacher}
      supervisedClass={supervisedClass}
      lessonCount={lessonCount}
      homeworkItems={homeworkItems}
      classStudents={classStudents}
      createLessonModalSlot={
        <div className="flex items-center gap-2">
          <FormContainer table="lesson" type="create" data={{ teacherId: userId }} />
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">Add Lesson</span>
        </div>
      }
      scheduleSlot={
        userId ? (
          <BigCalendarContainer type="teacherId" id={userId} />
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">No teacher schedule available.</div>
        )
      }
      announcementsSlot={<Announcements />}
    />
  );
};

export default TeacherPage;

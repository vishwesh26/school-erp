import { createClient } from "@/lib/supabase/server";
import BigCalendar from "./BigCalender";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  const currentUserId = user?.id;

  const { data: dataRes } = await supabase
    .from('Lesson')
    .select('*, subject:Subject(*), class:Class(*), teacher:Teacher(*)')
    .eq(type, id);

  const { data: lessonSubjects } = await supabase.from("Subject").select("id, name");
  const { data: lessonClasses } = await supabase.from("Class").select("id, name");
  const { data: lessonTeachers } = await supabase.from("Teacher").select("id, name, surname");

  const relatedData = {
    subjects: lessonSubjects || [],
    classes: lessonClasses || [],
    teachers: lessonTeachers || [],
  };

  const data = dataRes?.map((lesson: any) => ({
    id: lesson.id,
    title: lesson.name,
    start: lesson.startTime, // Pass ISO string
    end: lesson.endTime,     // Pass ISO string
    day: lesson.day,
    subject: lesson.subject,
    class: lesson.class,
    teacher: lesson.teacher,
    rawLesson: lesson,
  })) || [];

  return (
    <div className="">
      <BigCalendar
        data={data}
        role={role}
        currentUserId={currentUserId}
        relatedData={relatedData}
      />
    </div>
  );
};

export default BigCalendarContainer;

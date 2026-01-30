import { createClient } from "@/lib/supabase/server";
import FormModal from "./FormModal";

export type FormContainerProps = {
  table:
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement"
  | "librarian"
  | "book"
  | "feeCategory";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  const currentUserId = user?.id;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const { data: subjectTeachers } = await supabase.from("Teacher").select("id, name, surname");
        relatedData = { teachers: subjectTeachers || [] };
        break;
      case "class":
        const { data: classGrades } = await supabase.from("Grade").select("id, level");
        const { data: classTeachers } = await supabase.from("Teacher").select("id, name, surname");
        relatedData = { teachers: classTeachers || [], grades: classGrades || [] };
        break;
      case "teacher":
        const { data: teacherSubjects } = await supabase.from("Subject").select("id, name");
        relatedData = { subjects: teacherSubjects || [] };
        break;
      case "student":
        const { data: studentGrades } = await supabase.from("Grade").select("id, level");
        const { data: studentClasses } = await supabase.from("Class").select("*, _count:Student(count)");
        // Note: Supabase count relation syntax might differ. For simple dropdowns, usually just name/id is needed.
        // Prisma: include: { _count: { select: { students: true } } }
        // Let's just fetch classes for now. Capacity check is usually done in actions.
        relatedData = { classes: studentClasses || [], grades: studentGrades || [] };
        break;
      case "exam":
        const { data: examLessons } = await supabase.from("Lesson").select("id, name, teacherId"); // Ensure teacherId is fetched for filter
        // Logic for role filter can be cleaner:
        const examLessonsFiltered = role === "teacher"
          ? (examLessons || []).filter(l => l.teacherId === currentUserId)
          : (examLessons || []);

        relatedData = { lessons: examLessonsFiltered };
        break;
      case "assignment":
        const { data: assignmentSubjects } = await supabase.from("Subject").select("id, name");
        const { data: assignmentClasses } = await supabase.from("Class").select("id, name");
        relatedData = { subjects: assignmentSubjects || [], classes: assignmentClasses || [] };
        break;
      case "lesson":
        const { data: lessonSubjects } = await supabase.from("Subject").select("id, name");
        const { data: lessonClasses } = await supabase.from("Class").select("id, name");
        const { data: lessonTeachers } = await supabase.from("Teacher").select("id, name, surname");
        relatedData = { subjects: lessonSubjects || [], classes: lessonClasses || [], teachers: lessonTeachers || [] };
        break;
      case "result":
        const { data: resultExams } = await supabase.from("Exam").select("id, title");
        const { data: resultAssignments } = await supabase.from("Assignment").select("id, title");
        const { data: resultStudents } = await supabase.from("Student").select("id, name, surname");
        relatedData = { exams: resultExams || [], assignments: resultAssignments || [], students: resultStudents || [] };
        break;
      case "event":
      case "announcement":
        console.log("Fetching grades for", table);
        const { data: eventGrades, error: gradesError } = await supabase.from("Grade").select("id, level");
        if (gradesError) console.error("Error fetching grades:", gradesError);
        console.log("Grades fetched:", eventGrades?.length);
        relatedData = { grades: eventGrades || [] };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;

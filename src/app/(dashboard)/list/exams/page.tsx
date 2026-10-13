import { createClient } from "@/lib/supabase/server";
import { getExams } from "@/lib/examActions";
import ExamHubView from "@/components/exams/ExamHubView";

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const role = user?.user_metadata?.role;

  let effectiveRole = role || "student";
  let studentClassId: number | null = null;
  let studentClassName: string | undefined = undefined;
  let teacherName: string | undefined = undefined;

  if (userId) {
    if (role === "teacher") {
      const { data: teacher } = await supabase
        .from("Teacher")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (teacher) {
        teacherName = `${teacher.name} ${teacher.surname || ""}`.trim();
      }
      effectiveRole = "teacher";
    } else if (role === "admin") {
      effectiveRole = "admin";
    } else {
      // Check if student
      const { data: student } = await supabase
        .from("Student")
        .select("*, class:Class(*)")
        .eq("id", userId)
        .maybeSingle();

      if (student) {
        effectiveRole = "student";
        studentClassId = student.classId ?? null;
        studentClassName = student.class?.name;
      } else {
        // Fallback check teacher
        const { data: teacher } = await supabase
          .from("Teacher")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (teacher) {
          effectiveRole = "teacher";
          teacherName = `${teacher.name} ${teacher.surname || ""}`.trim();
        }
      }
    }
  }

  const examData = await getExams({
    classId: studentClassId ?? undefined,
    className: studentClassName,
    role: effectiveRole,
  });

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Examinations & Academic Assessment Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {effectiveRole === "student" && studentClassName
              ? `Examination Timetable PDF, Syllabus, Online Paper Patterns, Marks Distribution & Reference Question Banks for Class ${studentClassName}`
              : "Comprehensive Online Exam Calendar, Paper Patterns, Syllabus Breakdowns, Marks Distribution, Timetable & Reference Question Bank PDFs"}
          </p>
        </div>
      </div>

      {/* EXAM HUB VIEW (CALENDAR + TIMETABLE + SYLLABUS + PATTERN + QUESTION BANK PDF) */}
      <ExamHubView
        initialExams={examData}
        role={effectiveRole}
        classId={studentClassId ?? undefined}
        className={studentClassName}
        teacherName={teacherName}
      />
    </div>
  );
};

export default ExamListPage;

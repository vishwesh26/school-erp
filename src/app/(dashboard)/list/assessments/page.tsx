import { createClient } from "@/lib/supabase/server";
import { getAssessments } from "@/lib/assessmentActions";
import TeacherAssessmentView from "@/components/assessments/TeacherAssessmentView";
import StudentAssessmentView from "@/components/assessments/StudentAssessmentView";

const AssessmentsPage = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const role = user?.user_metadata?.role;

  let effectiveRole = role || "student";
  let studentData: any = null;
  let teacherData: any = null;

  if (userId) {
    if (role === "teacher") {
      const { data: teacher } = await supabase
        .from("Teacher")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      teacherData = teacher;
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
        studentData = student;
        effectiveRole = "student";
      } else {
        // Fallback check teacher
        const { data: teacher } = await supabase
          .from("Teacher")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (teacher) {
          teacherData = teacher;
          effectiveRole = "teacher";
        }
      }
    }
  }

  // Fetch assessment data based on role
  if (effectiveRole === "teacher" || effectiveRole === "admin") {
    const teacherName = teacherData
      ? `${teacherData.name} ${teacherData.surname || ""}`.trim()
      : "Faculty";

    const quizData = await getAssessments({
      teacherId: userId,
      role: effectiveRole,
    });

    return (
      <div className="p-4 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Assessments & Quizzes Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Schedule tests, build MCQ questions, monitor submissions, and track calendar dates
            </p>
          </div>
        </div>

        <TeacherAssessmentView
          initialQuizzes={quizData}
          teacherId={userId}
          teacherName={teacherName}
        />
      </div>
    );
  }

  // Student Assessment View
  const studentClassId = studentData?.classId;
  const studentClassName = studentData?.class?.name;
  const studentName = studentData
    ? `${studentData.name} ${studentData.surname || ""}`.trim()
    : "Student";

  const quizData = await getAssessments({
    classId: studentClassId,
    className: studentClassName,
    studentId: userId,
    role: "student",
  });

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Assessments & Quizzes Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            View active quizzes for Class {studentClassName || "-"}, track upcoming test dates, and review scores
          </p>
        </div>
      </div>

      <StudentAssessmentView
        initialQuizzes={quizData}
        studentId={userId || "student-1"}
        studentName={studentName}
        className={studentClassName}
        rollNumber={studentData?.rollNumber}
      />
    </div>
  );
};

export default AssessmentsPage;

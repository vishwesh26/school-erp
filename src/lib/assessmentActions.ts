"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  className?: string;
  rollNumber?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  answers: Record<string, string>; // questionId -> selectedOption
}

export interface QuizItem {
  id: string;
  title: string;
  description?: string;
  classId: number | string;
  className: string;
  subjectId: number | string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  type: "Quiz" | "MCQ Quiz" | "Unit Test" | "Assessment";
  status: "PUBLISHED" | "DRAFT" | "COMPLETED";
  questions: QuizQuestion[];
  submissions: QuizSubmission[];
  createdAt: string;
  computedStatus?: "active" | "upcoming" | "past";
  userSubmission?: QuizSubmission;
}

export interface CalendarQuizDay {
  day: number;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  quizCount: number;
  quizzes: QuizItem[];
  hasActive: boolean;
  hasUpcoming: boolean;
  hasPast: boolean;
}

export interface AssessmentCalendarData {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  firstDayOfWeek: number;
  days: CalendarQuizDay[];
  stats: {
    totalQuizzes: number;
    upcomingQuizzes: number;
    activeQuizzes: number;
    pastQuizzes: number;
  };
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  classId: number | string;
  className: string;
  subjectId: number | string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  type: "Quiz" | "MCQ Quiz" | "Unit Test" | "Assessment";
  questions: QuizQuestion[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "data", "assessments.json");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Helper to get YYYY-MM-DD */
function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Load quizzes from persistent JSON storage */
async function loadQuizzesFromFile(): Promise<QuizItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error loading assessments.json:", error);
    return [];
  }
}

/** Save quizzes to persistent JSON storage */
async function saveQuizzesToFile(quizzes: QuizItem[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(quizzes, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving assessments.json:", error);
    return false;
  }
}

/** Determine status: active (today), upcoming (future), past (previous) */
function computeQuizStatus(scheduledDate: string, todayStr: string): "active" | "upcoming" | "past" {
  if (scheduledDate === todayStr) {
    return "active";
  } else if (scheduledDate > todayStr) {
    return "upcoming";
  } else {
    return "past";
  }
}

/** Fetch all assessments with filters for student or teacher */
export async function getAssessments(filters?: {
  classId?: number | string;
  className?: string;
  teacherId?: string;
  role?: string;
  studentId?: string;
}) {
  const quizzes = await loadQuizzesFromFile();
  const todayStr = getTodayDateStr();

  // Filter based on class isolation or teacher
  let filtered = quizzes;

  if (filters?.classId) {
    const classIdStr = String(filters.classId);
    filtered = filtered.filter(
      (q) => String(q.classId) === classIdStr || (filters.className && q.className.toLowerCase() === filters.className.toLowerCase())
    );
  } else if (filters?.className) {
    filtered = filtered.filter(
      (q) => q.className.toLowerCase() === filters.className!.toLowerCase()
    );
  }

  // If filtered by teacher
  if (filters?.teacherId && filters.role === "teacher") {
    // Show quizzes created by teacher, plus any general quizzes
    filtered = filtered.filter((q) => !q.teacherId || q.teacherId === filters.teacherId);
  }

  // Tag with computed status and user submission (if student)
  const enriched: QuizItem[] = filtered.map((q) => {
    const computed = computeQuizStatus(q.scheduledDate, todayStr);
    const userSubmission = filters?.studentId
      ? q.submissions?.find((s) => s.studentId === filters.studentId)
      : undefined;

    return {
      ...q,
      computedStatus: computed,
      userSubmission,
    };
  });

  // Sort upcoming & active first (by scheduledDate ascending), then past (descending)
  const active = enriched.filter((q) => q.computedStatus === "active");
  const upcoming = enriched
    .filter((q) => q.computedStatus === "upcoming")
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const past = enriched
    .filter((q) => q.computedStatus === "past")
    .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

  // Compute student completion statistics
  let studentCompletedCount = 0;
  let studentTotalScore = 0;
  let studentPossibleMarks = 0;

  if (filters?.studentId) {
    enriched.forEach((q) => {
      const sub = q.submissions?.find((s) => s.studentId === filters.studentId);
      if (sub) {
        studentCompletedCount++;
        studentTotalScore += sub.score;
        studentPossibleMarks += sub.totalMarks;
      }
    });
  }

  const studentAverageScore =
    studentPossibleMarks > 0
      ? Math.round((studentTotalScore / studentPossibleMarks) * 100)
      : 0;

  const totalSubmissions = enriched.reduce(
    (acc, q) => acc + (q.submissions ? q.submissions.length : 0),
    0
  );

  return {
    all: enriched,
    active,
    upcoming,
    past,
    stats: {
      total: enriched.length,
      upcomingCount: upcoming.length,
      activeCount: active.length,
      pastCount: past.length,
      totalSubmissions,
      studentCompletedCount,
      studentAverageScore,
    },
  };
}

/** Fetch assessment calendar data for a specific year and month */
export async function getAssessmentCalendarData(params?: {
  year?: number;
  month?: number; // 1-12
  classId?: number | string;
  className?: string;
  teacherId?: string;
  role?: string;
  studentId?: string;
}): Promise<AssessmentCalendarData> {
  const now = new Date();
  const year = params?.year || now.getFullYear();
  const month = params?.month || now.getMonth() + 1; // 1-12

  const todayStr = getTodayDateStr();

  // Days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun

  // Load and filter quizzes
  const { all: quizzes } = await getAssessments({
    classId: params?.classId,
    className: params?.className,
    teacherId: params?.teacherId,
    role: params?.role,
    studentId: params?.studentId,
  });

  const days: CalendarQuizDay[] = [];

  let totalQuizzes = 0;
  let upcomingQuizzes = 0;
  let activeQuizzes = 0;
  let pastQuizzes = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayQuizzes = quizzes.filter((q) => q.scheduledDate === dateStr);
    const dayOfWeek = DAY_NAMES[new Date(year, month - 1, d).getDay()];

    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;

    const hasActive = isToday && dayQuizzes.length > 0;
    const hasUpcoming = isFuture && dayQuizzes.length > 0;
    const hasPast = isPast && dayQuizzes.length > 0;

    totalQuizzes += dayQuizzes.length;
    if (hasActive) activeQuizzes += dayQuizzes.length;
    if (hasUpcoming) upcomingQuizzes += dayQuizzes.length;
    if (hasPast) pastQuizzes += dayQuizzes.length;

    days.push({
      day: d,
      dateStr,
      dayOfWeek,
      isToday,
      isPast,
      isFuture,
      quizCount: dayQuizzes.length,
      quizzes: dayQuizzes,
      hasActive,
      hasUpcoming,
      hasPast,
    });
  }

  return {
    year,
    month,
    monthName: MONTH_NAMES[month - 1],
    daysInMonth,
    firstDayOfWeek,
    days,
    stats: {
      totalQuizzes,
      upcomingQuizzes,
      activeQuizzes,
      pastQuizzes,
    },
  };
}

/** Create a new quiz (Teacher Action) */
export async function createQuizAction(data: CreateQuizInput) {
  try {
    if (!data.title || !data.title.trim()) {
      return { success: false, error: "Quiz title is required." };
    }
    if (!data.classId || !data.className) {
      return { success: false, error: "Please select a target class." };
    }
    if (!data.subjectId || !data.subjectName) {
      return { success: false, error: "Please select a subject." };
    }
    if (!data.scheduledDate) {
      return { success: false, error: "Please specify a scheduled date." };
    }
    if (!data.questions || data.questions.length === 0) {
      return { success: false, error: "Please add at least 1 question." };
    }

    const quizzes = await loadQuizzesFromFile();

    const newQuizId = `quiz-${Date.now()}`;
    const calculatedTotalMarks = data.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

    const newQuiz: QuizItem = {
      id: newQuizId,
      title: data.title.trim(),
      description: data.description?.trim() || "",
      classId: data.classId,
      className: data.className,
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      teacherId: data.teacherId || "teacher-1",
      teacherName: data.teacherName || "Teacher",
      scheduledDate: data.scheduledDate,
      startTime: data.startTime || "09:00",
      endTime: data.endTime || "10:00",
      durationMinutes: Number(data.durationMinutes) || 30,
      totalMarks: calculatedTotalMarks || Number(data.totalMarks) || 20,
      passingMarks: Number(data.passingMarks) || Math.ceil((calculatedTotalMarks || 20) * 0.4),
      type: data.type || "Quiz",
      status: "PUBLISHED",
      questions: data.questions.map((q, idx) => ({
        id: q.id || `q-${idx + 1}-${Date.now()}`,
        question: q.question.trim(),
        options: q.options.filter((o) => o && o.trim() !== ""),
        correctAnswer: q.correctAnswer || q.options[0],
        marks: Number(q.marks) || 5,
        explanation: q.explanation?.trim() || undefined,
      })),
      submissions: [],
      createdAt: new Date().toISOString(),
    };

    quizzes.unshift(newQuiz);
    await saveQuizzesToFile(quizzes);

    revalidatePath("/list/assessments");
    revalidatePath("/student");
    revalidatePath("/teacher");

    return { success: true, quiz: newQuiz };
  } catch (err: any) {
    console.error("createQuizAction error:", err);
    return { success: false, error: err.message || "Failed to create quiz." };
  }
}

/** Submit a quiz attempt (Student Action) */
export async function submitQuizAction(payload: {
  quizId: string;
  studentId: string;
  studentName: string;
  className?: string;
  rollNumber?: string;
  answers: Record<string, string>;
}) {
  try {
    const quizzes = await loadQuizzesFromFile();
    const quizIndex = quizzes.findIndex((q) => q.id === payload.quizId);

    if (quizIndex === -1) {
      return { success: false, error: "Quiz not found." };
    }

    const quiz = quizzes[quizIndex];

    // Calculate score
    let score = 0;
    const reviewItems: Array<{
      questionId: string;
      question: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      marksAwarded: number;
      explanation?: string;
    }> = [];

    quiz.questions.forEach((q) => {
      const userAnswer = payload.answers[q.id] || "";
      const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      const marksAwarded = isCorrect ? q.marks : 0;
      score += marksAwarded;

      reviewItems.push({
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marksAwarded,
        explanation: q.explanation,
      });
    });

    const percentage = Math.round((score / quiz.totalMarks) * 100);
    const passed = score >= quiz.passingMarks;

    const submission: QuizSubmission = {
      id: `sub-${Date.now()}-${payload.studentId}`,
      quizId: payload.quizId,
      studentId: payload.studentId,
      studentName: payload.studentName,
      className: payload.className || quiz.className,
      rollNumber: payload.rollNumber,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      passed,
      submittedAt: new Date().toISOString(),
      answers: payload.answers,
    };

    // Replace if already submitted by this student, else append
    if (!quiz.submissions) {
      quiz.submissions = [];
    }

    const existingSubIndex = quiz.submissions.findIndex(
      (s) => s.studentId === payload.studentId
    );
    if (existingSubIndex >= 0) {
      quiz.submissions[existingSubIndex] = submission;
    } else {
      quiz.submissions.push(submission);
    }

    quizzes[quizIndex] = quiz;
    await saveQuizzesToFile(quizzes);

    revalidatePath("/list/assessments");
    revalidatePath("/student");

    return {
      success: true,
      submission,
      review: reviewItems,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      passed,
    };
  } catch (err: any) {
    console.error("submitQuizAction error:", err);
    return { success: false, error: err.message || "Failed to submit quiz." };
  }
}

/** Delete a quiz (Teacher Action) */
export async function deleteQuizAction(quizId: string) {
  try {
    const quizzes = await loadQuizzesFromFile();
    const filtered = quizzes.filter((q) => q.id !== quizId);

    if (filtered.length === quizzes.length) {
      return { success: false, error: "Quiz not found." };
    }

    await saveQuizzesToFile(filtered);

    revalidatePath("/list/assessments");
    revalidatePath("/student");
    revalidatePath("/teacher");

    return { success: true };
  } catch (err: any) {
    console.error("deleteQuizAction error:", err);
    return { success: false, error: err.message || "Failed to delete quiz." };
  }
}

/** Fetch options for Class and Subject from Supabase */
export async function getAssessmentFormData() {
  try {
    const supabase = createClient();

    const [classRes, subjectRes] = await Promise.all([
      supabase.from("Class").select("id, name").order("name"),
      supabase.from("Subject").select("id, name").order("name"),
    ]);

    return {
      classes: (classRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
      })),
      subjects: (subjectRes.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
      })),
    };
  } catch (err) {
    console.error("getAssessmentFormData error:", err);
    return {
      classes: [
        { id: 43, name: "8A" },
        { id: 44, name: "8B" },
        { id: 19, name: "7B" },
        { id: 22, name: "1A" },
      ],
      subjects: [
        { id: 7, name: "Biology" },
        { id: 6, name: "Mathematics" },
        { id: 16, name: "Computer" },
        { id: 5, name: "Chemistry" },
        { id: 2, name: "Hindi" },
        { id: 9, name: "Phisical Education" },
      ],
    };
  }
}

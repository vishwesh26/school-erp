"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ExamUnit {
  unitName: string;
  weightage: number;
  topics: string[];
}

export interface ExamSyllabus {
  units: ExamUnit[];
  prescribedBook?: string;
  generalInstructions?: string;
}

export interface ExamPatternSection {
  sectionName: string;
  questionCount: number;
  marksPerQuestion: number;
  totalMarks: number;
  description: string;
}

export interface ExamPattern {
  totalQuestions: number;
  sections: ExamPatternSection[];
}

export interface ExamTimetable {
  examDate: string;
  dayOfWeek: string;
  reportingTime: string;
  readingTime: string;
  writingTime: string;
  hallNumber: string;
  seatRange?: string;
  chiefInvigilator?: string;
}

export interface ExamQuestionBank {
  title: string;
  fileSize?: string;
  pdfUrl?: string;
  sampleQuestions: string[];
}

export interface ExamItem {
  id: string | number;
  title: string;
  subjectId?: number | string;
  subjectName: string;
  classId?: number | string;
  className: string;
  teacherName?: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reportingTime?: string;
  duration: string;
  hallNumber?: string;
  totalMarks: number;
  passingMarks: number;
  syllabus: ExamSyllabus;
  pattern: ExamPattern;
  timetable: ExamTimetable;
  questionBank: ExamQuestionBank;
  computedStatus?: "active" | "upcoming" | "past";
}

export interface ExamCalendarDay {
  day: number;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  examCount: number;
  exams: ExamItem[];
  hasActive: boolean;
  hasUpcoming: boolean;
  hasPast: boolean;
}

export interface ExamCalendarData {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  firstDayOfWeek: number;
  days: ExamCalendarDay[];
  stats: {
    totalExams: number;
    upcomingExams: number;
    activeExams: number;
    pastExams: number;
  };
}

export interface CreateExamInput {
  title: string;
  subjectId: number | string;
  subjectName: string;
  classId: number | string;
  className: string;
  teacherName?: string;
  examDate: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  reportingTime?: string;
  duration: string;
  hallNumber?: string;
  totalMarks: number;
  passingMarks: number;
  syllabusUnitsText?: string;
  prescribedBook?: string;
  patternSections?: ExamPatternSection[];
  questionBankTitle?: string;
  questionBankPdfUrl?: string;
  sampleQuestionsText?: string;
}

const DATA_FILE_PATH = path.join(process.cwd(), "data", "exams.json");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadExamsFromFile(): Promise<ExamItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error("Error loading exams.json:", error);
    return [];
  }
}

async function saveExamsToFile(exams: ExamItem[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(exams, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error saving exams.json:", error);
    return false;
  }
}

function computeStatus(examDate: string, todayStr: string): "active" | "upcoming" | "past" {
  if (examDate === todayStr) {
    return "active";
  } else if (examDate > todayStr) {
    return "upcoming";
  } else {
    return "past";
  }
}

/** Get all exams with Syllabus, Pattern, Timetable, Questions Bank */
export async function getExams(filters?: {
  classId?: number | string;
  className?: string;
  role?: string;
  search?: string;
}) {
  const fileExams = await loadExamsFromFile();
  const todayStr = getTodayDateStr();

  // Also query Supabase Exam table to sync any external database rows
  let mergedExams: ExamItem[] = [...fileExams];
  try {
    const supabase = createClient();
    const { data: dbExams } = await supabase
      .from("Exam")
      .select("*, lesson:Lesson(*, subject:Subject(*), class:Class(*), teacher:Teacher(*))");

    if (dbExams && dbExams.length > 0) {
      dbExams.forEach((dbE: any) => {
        const idKey = `db-exam-${dbE.id}`;
        const alreadyExists = mergedExams.some((e) => String(e.id) === String(dbE.id) || e.id === idKey);

        if (!alreadyExists && dbE.lesson) {
          const dateOnly = dbE.startTime ? dbE.startTime.slice(0, 10) : todayStr;
          const timeOnly = dbE.startTime ? dbE.startTime.slice(11, 16) : "09:00";
          const endOnly = dbE.endTime ? dbE.endTime.slice(11, 16) : "12:00";

          mergedExams.push({
            id: idKey,
            title: dbE.title || `${dbE.lesson?.subject?.name || "Subject"} Examination`,
            subjectId: dbE.lesson?.subjectId,
            subjectName: dbE.lesson?.subject?.name || "General",
            classId: dbE.lesson?.classId,
            className: dbE.lesson?.class?.name || "General",
            teacherName: dbE.lesson?.teacher
              ? `${dbE.lesson.teacher.name} ${dbE.lesson.teacher.surname || ""}`.trim()
              : "Faculty",
            examDate: dateOnly,
            startTime: timeOnly,
            endTime: endOnly,
            duration: "3 Hours (180 mins)",
            hallNumber: "Exam Hall 1, Main Campus",
            totalMarks: 80,
            passingMarks: 28,
            syllabus: {
              units: [
                {
                  unitName: "Unit 1: Core Concepts & Principles",
                  weightage: 40,
                  topics: ["Fundamental Theory", "Key Applications", "Standard Formulas"],
                },
                {
                  unitName: "Unit 2: Advanced Analysis & Problem Solving",
                  weightage: 40,
                  topics: ["Analytical Problems", "Case Scenarios", "Practical Exercises"],
                },
              ],
              prescribedBook: "Standard Curriculum Textbook & Reference Guide",
            },
            pattern: {
              totalQuestions: 30,
              sections: [
                {
                  sectionName: "Section A (Objective & MCQs)",
                  questionCount: 15,
                  marksPerQuestion: 1,
                  totalMarks: 15,
                  description: "Multiple choice and short objective items.",
                },
                {
                  sectionName: "Section B (Short Answer)",
                  questionCount: 7,
                  marksPerQuestion: 3,
                  totalMarks: 21,
                  description: "Conceptual and analytical questions.",
                },
                {
                  sectionName: "Section C (Long Answer)",
                  questionCount: 4,
                  marksPerQuestion: 6,
                  totalMarks: 24,
                  description: "Comprehensive step-by-step problem solving.",
                },
                {
                  sectionName: "Section D (Case Study)",
                  questionCount: 4,
                  marksPerQuestion: 5,
                  totalMarks: 20,
                  description: "Applied scenarios with contextual data.",
                },
              ],
            },
            timetable: {
              examDate: dateOnly,
              dayOfWeek: DAY_NAMES[new Date(dateOnly).getDay()] || "Scheduled",
              reportingTime: "08:30 AM",
              readingTime: "08:45 AM - 09:00 AM (15 Minutes)",
              writingTime: `${timeOnly} - ${endOnly}`,
              hallNumber: "Exam Hall 1, Main Campus",
            },
            questionBank: {
              title: `${dbE.lesson?.subject?.name || "General"} Official Question Bank & Model Paper`,
              fileSize: "2.5 MB",
              pdfUrl: "/sample_question_bank_general.pdf",
              sampleQuestions: [
                "Explain the fundamental theorem and provide two real-world examples.",
                "Solve the practice problem showing all intermediate steps.",
                "Differentiate between key principles discussed in chapter syllabus.",
              ],
            },
          });
        }
      });
    }
  } catch (err) {
    console.error("Error syncing Supabase exams:", err);
  }

  // Filter based on class isolation if student
  let filtered = mergedExams;

  if (filters?.classId) {
    const classIdStr = String(filters.classId);
    filtered = filtered.filter(
      (e) => String(e.classId) === classIdStr || (filters.className && e.className.toLowerCase() === filters.className.toLowerCase())
    );
  } else if (filters?.className) {
    filtered = filtered.filter(
      (e) => e.className.toLowerCase() === filters.className!.toLowerCase()
    );
  }

  if (filters?.search && filters.search.trim()) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.subjectName.toLowerCase().includes(s) ||
        e.className.toLowerCase().includes(s)
    );
  }

  // Enrich with computedStatus
  const enriched: ExamItem[] = filtered.map((e) => ({
    ...e,
    computedStatus: computeStatus(e.examDate, todayStr),
  }));

  const active = enriched.filter((e) => e.computedStatus === "active");
  const upcoming = enriched
    .filter((e) => e.computedStatus === "upcoming")
    .sort((a, b) => a.examDate.localeCompare(b.examDate));
  const past = enriched
    .filter((e) => e.computedStatus === "past")
    .sort((a, b) => b.examDate.localeCompare(a.examDate));

  return {
    all: enriched,
    upcoming,
    active,
    past,
    stats: {
      total: enriched.length,
      upcomingCount: upcoming.length,
      activeCount: active.length,
      pastCount: past.length,
    },
  };
}

/** Fetch Exam Calendar Data for month grid */
export async function getExamCalendarData(params?: {
  year?: number;
  month?: number;
  classId?: number | string;
  className?: string;
  role?: string;
}): Promise<ExamCalendarData> {
  const now = new Date();
  const year = params?.year || now.getFullYear();
  const month = params?.month || now.getMonth() + 1; // 1-12
  const todayStr = getTodayDateStr();

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun

  const { all: exams } = await getExams({
    classId: params?.classId,
    className: params?.className,
    role: params?.role,
  });

  const days: ExamCalendarDay[] = [];

  let totalExams = 0;
  let upcomingExams = 0;
  let activeExams = 0;
  let pastExams = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const dayExams = exams.filter((e) => e.examDate === dateStr);
    const dayOfWeek = DAY_NAMES[new Date(year, month - 1, d).getDay()];

    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isFuture = dateStr > todayStr;

    const hasActive = isToday && dayExams.length > 0;
    const hasUpcoming = isFuture && dayExams.length > 0;
    const hasPast = isPast && dayExams.length > 0;

    totalExams += dayExams.length;
    if (hasActive) activeExams += dayExams.length;
    if (hasUpcoming) upcomingExams += dayExams.length;
    if (hasPast) pastExams += dayExams.length;

    days.push({
      day: d,
      dateStr,
      dayOfWeek,
      isToday,
      isPast,
      isFuture,
      examCount: dayExams.length,
      exams: dayExams,
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
      totalExams,
      upcomingExams,
      activeExams,
      pastExams,
    },
  };
}

/** Create a new Exam Schedule with Syllabus, Pattern, Timetable, Questions Bank */
export async function createExamScheduleAction(data: CreateExamInput) {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "Exam title is required." };
    }
    if (!data.examDate) {
      return { success: false, error: "Exam date is required." };
    }

    const fileExams = await loadExamsFromFile();
    const newId = `exam-${Date.now()}`;
    const dayOfWeek = DAY_NAMES[new Date(data.examDate).getDay()] || "Scheduled";

    // Parse syllabus units
    const units: ExamUnit[] = data.syllabusUnitsText
      ? data.syllabusUnitsText
          .split("\n")
          .filter((line) => line.trim())
          .map((line, idx) => ({
            unitName: line.trim(),
            weightage: 20,
            topics: ["Comprehensive coverage of prescribed chapters and sample problems"],
          }))
      : [
          {
            unitName: "Unit 1: Mid-Term Curriculum Units",
            weightage: 40,
            topics: ["Core theory, theorems, and definitions"],
          },
          {
            unitName: "Unit 2: Applied & Problem Solving",
            weightage: 40,
            topics: ["Case analyses and practical numerical exercises"],
          },
        ];

    // Parse sample questions
    const sampleQuestions: string[] = data.sampleQuestionsText
      ? data.sampleQuestionsText.split("\n").filter((q) => q.trim())
      : [
          "State the fundamental laws and provide an illustrative example.",
          "Solve the model question and verify against syllabus constraints.",
          "Explain the process and diagrammatic representation.",
        ];

    const newExam: ExamItem = {
      id: newId,
      title: data.title.trim(),
      subjectId: data.subjectId,
      subjectName: data.subjectName,
      classId: data.classId,
      className: data.className,
      teacherName: data.teacherName || "Faculty",
      examDate: data.examDate,
      startTime: data.startTime || "09:00",
      endTime: data.endTime || "12:00",
      reportingTime: data.reportingTime || "08:30 AM",
      duration: data.duration || "3 Hours (180 mins)",
      hallNumber: data.hallNumber || "Exam Hall 1, Main Campus",
      totalMarks: Number(data.totalMarks) || 80,
      passingMarks: Number(data.passingMarks) || 28,
      syllabus: {
        units,
        prescribedBook: data.prescribedBook || "Standard Prescribed Textbook",
        generalInstructions: "Calculators and smart devices are prohibited in exam hall.",
      },
      pattern: {
        totalQuestions: 35,
        sections: data.patternSections || [
          {
            sectionName: "Section A (Objective & MCQs)",
            questionCount: 20,
            marksPerQuestion: 1,
            totalMarks: 20,
            description: "Objective items and MCQs.",
          },
          {
            sectionName: "Section B (Short Answer)",
            questionCount: 6,
            marksPerQuestion: 3,
            totalMarks: 18,
            description: "Conceptual questions with logical steps.",
          },
          {
            sectionName: "Section C (Long Answer)",
            questionCount: 4,
            marksPerQuestion: 6,
            totalMarks: 24,
            description: "Detailed problem solving and proofs.",
          },
          {
            sectionName: "Section D (Case Studies)",
            questionCount: 3,
            marksPerQuestion: 6,
            totalMarks: 18,
            description: "Contextual application questions.",
          },
        ],
      },
      timetable: {
        examDate: data.examDate,
        dayOfWeek,
        reportingTime: data.reportingTime || "08:30 AM",
        readingTime: "08:45 AM - 09:00 AM (15 Minutes)",
        writingTime: `${data.startTime || "09:00"} - ${data.endTime || "12:00"}`,
        hallNumber: data.hallNumber || "Exam Hall 1, Main Campus",
      },
      questionBank: {
        title: data.questionBankTitle || `${data.subjectName} Official Model Question Bank 2026`,
        fileSize: "2.4 MB",
        pdfUrl: data.questionBankPdfUrl || "/sample_question_bank_general.pdf",
        sampleQuestions,
      },
    };

    fileExams.unshift(newExam);
    await saveExamsToFile(fileExams);

    revalidatePath("/list/exams");
    revalidatePath("/student");
    revalidatePath("/teacher");

    return { success: true, exam: newExam };
  } catch (err: any) {
    console.error("createExamScheduleAction error:", err);
    return { success: false, error: err.message || "Failed to create exam schedule." };
  }
}

/** Delete an Exam Schedule */
export async function deleteExamScheduleAction(examId: string | number) {
  try {
    const fileExams = await loadExamsFromFile();
    const filtered = fileExams.filter((e) => String(e.id) !== String(examId));

    if (filtered.length === fileExams.length) {
      // Check if it's a Supabase Exam ID
      if (typeof examId === "number" || !isNaN(Number(examId))) {
        const supabase = createClient();
        await supabase.from("Exam").delete().eq("id", Number(examId));
      }
    } else {
      await saveExamsToFile(filtered);
    }

    revalidatePath("/list/exams");
    revalidatePath("/student");
    revalidatePath("/teacher");

    return { success: true };
  } catch (err: any) {
    console.error("deleteExamScheduleAction error:", err);
    return { success: false, error: err.message || "Failed to delete exam." };
  }
}

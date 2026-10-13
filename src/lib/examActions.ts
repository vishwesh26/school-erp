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

export interface MarksDistributionSection {
  sectionName: string;
  questionCount: number;
  marksPerQuestion: number;
  totalMarks: number;
  description: string;
}

export interface ExamMarksDistribution {
  totalMarks: number;
  passingMarks: number;
  scoringPolicy?: string;
  sections: MarksDistributionSection[];
}

export interface ExamPaperPattern {
  totalQuestions: number;
  durationMinutes: number;
  durationLabel: string;
  examMode: "Offline Pen-Paper Examination" | "Offline Pen-Paper" | "Offline" | "Online";
  sectionsSummary: string;
  examHallInstructions: string[];
  onlineExamInstructions?: string[];
}

export interface ExamTimetable {
  examDate: string; // YYYY-MM-DD
  dayOfWeek: string;
  reportingTime: string;
  startTime: string;
  endTime: string;
  readingTime?: string;
  writingTime: string;
  hallOrPortal: string;
  pdfUrl?: string; // Uploaded timetable PDF
  pdfName?: string;
  chiefInvigilator?: string;
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
  duration: string;
  totalMarks: number;
  passingMarks: number;
  examMode: "Online" | "Offline";
  syllabus: ExamSyllabus;
  pattern: ExamPaperPattern;
  marksDistribution: ExamMarksDistribution;
  timetable: ExamTimetable;
  timetablePdfUrl?: string;
  timetablePdfName?: string;
  // Question Bank PDF for Reference
  questionBankPdfUrl?: string;
  questionBankPdfName?: string;
  questionBankTitle?: string;
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
  hallOrPortal?: string;
  totalMarks: number;
  passingMarks: number;
  examMode?: "Offline" | "Online";
  // Syllabus
  syllabusUnitsText?: string;
  prescribedBook?: string;
  generalInstructions?: string;
  // Offline Paper Pattern & Exam Hall Guidelines
  sectionsSummary?: string;
  examHallInstructionsText?: string;
  onlineInstructionsText?: string;
  // Marks Distribution / Marking Scheme
  marksSections?: MarksDistributionSection[];
  scoringPolicy?: string;
  // Timetable PDF Upload
  timetablePdfUrl?: string;
  timetablePdfName?: string;
  // Question Bank PDF for Reference
  questionBankPdfUrl?: string;
  questionBankPdfName?: string;
  questionBankTitle?: string;
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

/** Get all exams with Syllabus, Pattern, Marks Distribution & Timetable PDF */
export async function getExams(filters?: {
  classId?: number | string;
  className?: string;
  role?: string;
  search?: string;
}) {
  const fileExams = await loadExamsFromFile();
  const todayStr = getTodayDateStr();

  // Sync any external database rows from Supabase
  let mergedExams: ExamItem[] = [...fileExams];
  try {
    const supabase = createClient();
    const { data: dbExams } = await supabase
      .from("Exam")
      .select("*, lesson:Lesson(*, subject:Subject(*), class:Class(*), teacher:Teacher(*))");

    if (dbExams && dbExams.length > 0) {
      dbExams.forEach((dbE: any) => {
        const idKey = `db-exam-${dbE.id}`;
        const alreadyExists = mergedExams.some(
          (e) => String(e.id) === String(dbE.id) || e.id === idKey
        );

        if (!alreadyExists && dbE.lesson) {
          const dateOnly = dbE.startTime ? dbE.startTime.slice(0, 10) : todayStr;
          const timeOnly = dbE.startTime ? dbE.startTime.slice(11, 16) : "09:00";
          const endOnly = dbE.endTime ? dbE.endTime.slice(11, 16) : "12:00";

          mergedExams.push({
            id: idKey,
            title: dbE.title || `${dbE.lesson?.subject?.name || "Subject"} Examination (Online)`,
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
            totalMarks: 80,
            passingMarks: 28,
            examMode: "Offline",
            syllabus: {
              units: [
                {
                  unitName: "Unit 1: Theory & Core Concepts",
                  weightage: 40,
                  topics: ["Definitions", "Theorems", "Standard Formulas"],
                },
                {
                  unitName: "Unit 2: Applied Analysis & Problem Solving",
                  weightage: 40,
                  topics: ["Case Scenarios", "Calculations", "Practical Analysis"],
                },
              ],
              prescribedBook: "Standard Prescribed Textbook",
            },
            pattern: {
              totalQuestions: 30,
              durationMinutes: 180,
              durationLabel: "3 Hours (180 mins)",
              examMode: "Offline Pen-Paper Examination",
              sectionsSummary: "Section A: Objective MCQs (20 Marks), Section B: Short Answers (30 Marks), Section C: Case Analysis (30 Marks).",
              examHallInstructions: [
                "Report to assigned examination hall 15 minutes before the exam.",
                "15 minutes mandatory question paper reading time before writing.",
                "Use only blue or black ballpoint pen. Bring geometry box.",
                "Electronic devices, smartwatches, and notes strictly prohibited.",
              ],
              onlineExamInstructions: [
                "Report to assigned examination hall 15 minutes before the exam.",
                "15 minutes mandatory question paper reading time before writing.",
              ],
            },
            marksDistribution: {
              totalMarks: 80,
              passingMarks: 28,
              scoringPolicy: "No negative marking. Step-wise grading applicable.",
              sections: [
                {
                  sectionName: "Section A (Objective MCQs)",
                  questionCount: 20,
                  marksPerQuestion: 1,
                  totalMarks: 20,
                  description: "Multiple choice questions with instant auto-grading.",
                },
                {
                  sectionName: "Section B (Short Answer)",
                  questionCount: 10,
                  marksPerQuestion: 3,
                  totalMarks: 30,
                  description: "Concise reasoning and formula steps.",
                },
                {
                  sectionName: "Section C (Descriptive / Cases)",
                  questionCount: 6,
                  marksPerQuestion: 5,
                  totalMarks: 30,
                  description: "Comprehensive analytical problem-solving.",
                },
              ],
            },
            timetable: {
              examDate: dateOnly,
              dayOfWeek: DAY_NAMES[new Date(dateOnly).getDay()] || "Scheduled",
              reportingTime: "08:30 AM",
              startTime: timeOnly,
              endTime: endOnly,
              readingTime: "08:45 AM - 09:00 AM (15 Minutes)",
              writingTime: `${timeOnly} - ${endOnly}`,
              hallOrPortal: "Examination Hall 1, Block A",
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
      (e) =>
        String(e.classId) === classIdStr ||
        (filters.className && e.className.toLowerCase() === filters.className.toLowerCase())
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

/** Fetch Exam Calendar Data */
export async function getExamCalendarData(params?: {
  year?: number;
  month?: number;
  classId?: number | string;
  className?: string;
  role?: string;
}): Promise<ExamCalendarData> {
  const now = new Date();
  const year = params?.year || now.getFullYear();
  const month = params?.month || now.getMonth() + 1;
  const todayStr = getTodayDateStr();

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

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

/** Create new Exam Schedule with Syllabus, Pattern, Marks Distribution, and Timetable PDF */
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
          .map((line) => ({
            unitName: line.trim(),
            weightage: 20,
            topics: ["Key syllabus concepts, definitions, and model problem applications."],
          }))
      : [
          {
            unitName: "Unit 1: Mid-Term Curriculum Units",
            weightage: 40,
            topics: ["Core concepts, definitions, and theorems."],
          },
          {
            unitName: "Unit 2: Applied & Analytical Topics",
            weightage: 40,
            topics: ["Practical applications and analytical problem solving."],
          },
        ];

    const examHallInstructions = data.examHallInstructionsText || data.onlineInstructionsText
      ? (data.examHallInstructionsText || data.onlineInstructionsText)!
          .split("\n")
          .filter((l) => l.trim())
      : [
          "Report to the assigned examination hall 15 minutes before start time.",
          "Mandatory 15-minute question paper reading time before writing begins.",
          "Write answers only using blue or black ballpoint pen on the answer booklet.",
          "Electronic devices, smartwatches, and unauthorized notes are strictly prohibited.",
        ];

    const marksSections: MarksDistributionSection[] = data.marksSections || [
      {
        sectionName: "Section A (Objective & MCQs)",
        questionCount: 20,
        marksPerQuestion: 1,
        totalMarks: 20,
        description: "Multiple choice questions and one-word answers.",
      },
      {
        sectionName: "Section B (Short Answer)",
        questionCount: 6,
        marksPerQuestion: 3,
        totalMarks: 18,
        description: "Concise reasoning with step-by-step mathematical working.",
      },
      {
        sectionName: "Section C (Long Answer)",
        questionCount: 4,
        marksPerQuestion: 6,
        totalMarks: 24,
        description: "In-depth problem solving and analytical proofs.",
      },
      {
        sectionName: "Section D (Case-Based / Applied)",
        questionCount: 3,
        marksPerQuestion: 6,
        totalMarks: 18,
        description: "Real-world contextual scenario problems.",
      },
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
      duration: data.duration || "3 Hours (180 mins)",
      totalMarks: Number(data.totalMarks) || 80,
      passingMarks: Number(data.passingMarks) || 28,
      examMode: data.examMode || "Offline",
      syllabus: {
        units,
        prescribedBook: data.prescribedBook || "Standard Prescribed Textbook",
        generalInstructions:
          data.generalInstructions ||
          "Physical written examination conducted in school exam hall. Printed question paper and answer sheets will be provided.",
      },
      pattern: {
        totalQuestions: marksSections.reduce((sum, s) => sum + s.questionCount, 0) || 33,
        durationMinutes: 180,
        durationLabel: data.duration || "3 Hours (180 mins)",
        examMode: "Offline Pen-Paper Examination",
        sectionsSummary:
          data.sectionsSummary ||
          `${marksSections.length} Printed Sections: Objective, Short, Long & Applied Case Studies.`,
        examHallInstructions,
        onlineExamInstructions: examHallInstructions,
      },
      marksDistribution: {
        totalMarks: Number(data.totalMarks) || 80,
        passingMarks: Number(data.passingMarks) || 28,
        scoringPolicy: data.scoringPolicy || "Step-wise marking applicable for all sections. Full working must be shown.",
        sections: marksSections,
      },
      timetable: {
        examDate: data.examDate,
        dayOfWeek,
        reportingTime: data.reportingTime || "08:30 AM",
        startTime: data.startTime || "09:00",
        endTime: data.endTime || "12:00",
        readingTime: "08:45 AM - 09:00 AM (15 Minutes)",
        writingTime: `${data.startTime || "09:00"} - ${data.endTime || "12:00"}`,
        hallOrPortal: data.hallOrPortal || "Examination Hall 1, Block A",
        pdfUrl: data.timetablePdfUrl,
        pdfName: data.timetablePdfName,
        chiefInvigilator: data.teacherName || "Assigned Faculty",
      },
      timetablePdfUrl: data.timetablePdfUrl,
      timetablePdfName: data.timetablePdfName,
      questionBankPdfUrl: data.questionBankPdfUrl,
      questionBankPdfName: data.questionBankPdfName,
      questionBankTitle: data.questionBankTitle,
    };

    fileExams.unshift(newExam);
    await saveExamsToFile(fileExams);

    revalidatePath("/list/exams");
    revalidatePath("/student");
    revalidatePath("/teacher");

    return { success: true, exam: newExam };
  } catch (err: any) {
    console.error("createExamScheduleAction error:", err);
    return { success: false, error: err.message || "Failed to schedule exam." };
  }
}

/** Delete an Exam Schedule */
export async function deleteExamScheduleAction(examId: string | number) {
  try {
    const fileExams = await loadExamsFromFile();
    const filtered = fileExams.filter((e) => String(e.id) !== String(examId));

    if (filtered.length === fileExams.length) {
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

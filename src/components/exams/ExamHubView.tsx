"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ExamItem,
  deleteExamScheduleAction,
} from "@/lib/examActions";
import ExamCalendarView from "./ExamCalendarView";
import ExamDetailModal from "./ExamDetailModal";
import CreateExamModal from "./CreateExamModal";

interface ExamHubViewProps {
  initialExams: {
    all: ExamItem[];
    upcoming: ExamItem[];
    active: ExamItem[];
    past: ExamItem[];
    stats: {
      total: number;
      upcomingCount: number;
      activeCount: number;
      pastCount: number;
    };
  };
  role?: string;
  classId?: number | string;
  className?: string;
  teacherName?: string;
}

const ExamHubView: React.FC<ExamHubViewProps> = ({
  initialExams,
  role = "student",
  classId,
  className,
  teacherName,
}) => {
  const [exams, setExams] = useState<ExamItem[]>(initialExams.all);
  const [viewMode, setViewMode] = useState<"calendar" | "cards">("calendar");
  const [activeTab, setActiveTab] = useState<"upcoming" | "active" | "all" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");

  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [detailDefaultTab, setDetailDefaultTab] = useState<"syllabus" | "pattern" | "marks" | "timetable" | "questionBank">("syllabus");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const canManage = role === "admin" || role === "teacher";

  const handleExamCreated = (newExam: ExamItem) => {
    setExams((prev) => [newExam, ...prev]);
  };

  const handleDeleteExam = async (examId: string | number) => {
    if (!confirm("Are you sure you want to delete this exam schedule?")) return;
    setDeletingId(examId);
    try {
      const res = await deleteExamScheduleAction(examId);
      if (res.success) {
        setExams((prev) => prev.filter((e) => String(e.id) !== String(examId)));
      }
    } catch (e) {
      console.error("Delete exam error:", e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenExamDetail = (exam: ExamItem, tab: "syllabus" | "pattern" | "marks" | "timetable" | "questionBank" = "syllabus") => {
    setSelectedExam(exam);
    setDetailDefaultTab(tab);
  };

  const uniqueSubjects = Array.from(new Set(exams.map((e) => e.subjectName))).filter(Boolean);
  const uniqueClasses = Array.from(new Set(exams.map((e) => e.className))).filter(Boolean);

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === "all" || e.subjectName === selectedSubjectFilter;

    const matchesClass =
      selectedClassFilter === "all" || e.className === selectedClassFilter;

    return matchesSearch && matchesSubject && matchesClass;
  });

  const activeExams = filteredExams.filter((e) => e.computedStatus === "active");
  const upcomingExams = filteredExams.filter((e) => e.computedStatus === "upcoming");
  const pastExams = filteredExams.filter((e) => e.computedStatus === "past");

  const displayedCards =
    activeTab === "upcoming"
      ? upcomingExams
      : activeTab === "active"
      ? activeExams
      : activeTab === "past"
      ? pastExams
      : filteredExams;

  const examsWithPdf = exams.filter((e) => Boolean(e.timetablePdfUrl || e.questionBankPdfUrl));

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL EXAMS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-[#4e282c]">
          <div className="w-11 h-11 rounded-xl bg-[#f4eaea] flex items-center justify-center flex-shrink-0">
            <Image src="/exam.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{exams.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">
              Scheduled Papers
            </span>
          </div>
        </div>

        {/* ACTIVE TODAY */}
        <div
          onClick={() => {
            setViewMode("cards");
            setActiveTab("active");
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-[#f16122] cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#fdece7] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{activeExams.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f16122] block mt-0.5">
              Active Today
            </span>
          </div>
        </div>

        {/* UPCOMING */}
        <div
          onClick={() => {
            setViewMode("cards");
            setActiveTab("upcoming");
          }}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-indigo-500 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-xl">🕒</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{upcomingExams.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 block mt-0.5">
              Upcoming Papers
            </span>
          </div>
        </div>

        {/* STUDY RESOURCES & PDFS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-emerald-500">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📑</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">
              {examsWithPdf.length > 0 ? examsWithPdf.length : exams.length}
            </h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 block mt-0.5">
              Q-Banks & PDFs
            </span>
          </div>
        </div>
      </div>

      {/* 2. MODE SWITCHER & ACTIONS BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* VIEW MODE TOGGLE */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-[#4e282c] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📅</span>
              <span>Exam Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#4e282c] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📋</span>
              <span>Timetable & Cards</span>
            </button>
          </div>

          {viewMode === "cards" && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upcoming"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Upcoming ({upcomingExams.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "active"
                    ? "bg-[#f16122] text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Active ({activeExams.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({filteredExams.length})
              </button>
            </div>
          )}
        </div>

        {/* RIGHT CONTROLS: CREATE EXAM IF TEACHER/ADMIN */}
        <div className="flex items-center gap-3">
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#f16122] hover:bg-[#d85218] text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span className="text-base leading-none">+</span>
              <span>Schedule Online Exam</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. CALENDAR VIEW OR CARDS LIST VIEW */}
      {viewMode === "calendar" ? (
        <ExamCalendarView
          classId={classId}
          className={className}
          role={role}
          onSelectExam={handleOpenExamDetail}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search exams by title, subject, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#4e282c]"
              />
              <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {canManage && (
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="all">All Classes</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* EXAM CARDS */}
          {displayedCards.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">📅</span>
              <p className="text-sm font-bold text-slate-700">No examination schedules found.</p>
              <p className="text-xs text-slate-400">
                Switch to &quot;Exam Calendar&quot; above or adjust your search filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCards.map((exam) => {
                const isActive = exam.computedStatus === "active";
                const isUpcoming = exam.computedStatus === "upcoming";
                const isDeleting = deletingId === exam.id;

                return (
                  <div
                    key={exam.id}
                    className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between gap-4 hover:shadow-md ${
                      isActive
                        ? "border-l-4 border-l-[#f16122] border-slate-100"
                        : isUpcoming
                        ? "border-l-4 border-l-indigo-500 border-slate-100"
                        : "border-l-4 border-l-slate-400 border-slate-100"
                    }`}
                  >
                    <div>
                      {/* TOP BADGES */}
                      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                            {exam.subjectName}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Class {exam.className}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Online CBT
                          </span>
                        </div>

                        {isActive ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#fdece7] text-[#f16122] animate-pulse">
                            ⚡ Active Today
                          </span>
                        ) : isUpcoming ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                            🕒 Upcoming
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            ✅ Past
                          </span>
                        )}
                      </div>

                      {/* TITLE */}
                      <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {exam.title}
                      </h4>

                      {/* METRICS */}
                      <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Duration</span>
                          <span className="font-extrabold text-slate-800">{exam.duration}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Total Marks</span>
                          <span className="font-extrabold text-slate-800">{exam.totalMarks}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Passing</span>
                          <span className="font-extrabold text-slate-800">{exam.passingMarks}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span>📅</span>
                          <span className="font-bold text-slate-700">{exam.examDate}</span>
                          <span className="text-slate-400">({exam.timetable?.writingTime || `${exam.startTime} - ${exam.endTime}`})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>💻</span>
                          <span className="truncate">{exam.timetable?.hallOrPortal || "Online Examination Portal"}</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS: SYLLABUS, PATTERN, MARKS DISTRIBUTION, TIMETABLE PDF, Q-BANK PDF */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenExamDetail(exam, "syllabus")}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#4e282c] hover:text-white text-slate-700 text-xs font-bold transition-all text-center cursor-pointer"
                        >
                          📖 Syllabus ({exam.syllabus?.units?.length || 0})
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenExamDetail(exam, "pattern")}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#f16122] hover:text-white text-slate-700 text-xs font-bold transition-all text-center cursor-pointer"
                        >
                          📋 Exam Pattern
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenExamDetail(exam, "marks")}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-[11px] font-bold transition-all text-center border border-emerald-200 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>🎯</span>
                          <span>Marks</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenExamDetail(exam, "timetable")}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-[11px] font-black transition-all border border-indigo-200 flex items-center gap-1 cursor-pointer"
                          title="View or download Timetable PDF"
                        >
                          <span>📄</span>
                          <span>Timetable</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenExamDetail(exam, "questionBank")}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 text-[11px] font-black transition-all border border-teal-200 flex items-center gap-1 cursor-pointer"
                          title="View or download Reference Question Bank PDF"
                        >
                          <span>📑</span>
                          <span>Q-Bank</span>
                        </button>

                        {canManage && (
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteExam(exam.id)}
                            className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                            title="Delete exam"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      <ExamDetailModal
        exam={selectedExam}
        isOpen={Boolean(selectedExam)}
        onClose={() => setSelectedExam(null)}
        defaultTab={detailDefaultTab}
      />

      {/* CREATE EXAM MODAL */}
      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleExamCreated}
        teacherName={teacherName}
      />
    </div>
  );
};

export default ExamHubView;

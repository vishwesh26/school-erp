"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  QuizItem,
  deleteQuizAction,
  QuizSubmission,
} from "@/lib/assessmentActions";
import CreateQuizModal from "./CreateQuizModal";
import AssessmentCalendarView from "./AssessmentCalendarView";

interface TeacherAssessmentViewProps {
  initialQuizzes: {
    all: QuizItem[];
    active: QuizItem[];
    upcoming: QuizItem[];
    past: QuizItem[];
    stats: {
      total: number;
      upcomingCount: number;
      activeCount: number;
      pastCount: number;
      totalSubmissions: number;
    };
  };
  teacherId?: string;
  teacherName?: string;
}

const TeacherAssessmentView: React.FC<TeacherAssessmentViewProps> = ({
  initialQuizzes,
  teacherId,
  teacherName,
}) => {
  const [quizzes, setQuizzes] = useState(initialQuizzes.all);
  const [activeTab, setActiveTab] = useState<"upcoming" | "active" | "all" | "past" | "calendar">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inspectQuizSubmissions, setInspectQuizSubmissions] = useState<QuizItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleQuizCreated = (newQuiz: QuizItem) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }
    setDeletingId(quizId);
    try {
      const res = await deleteQuizAction(quizId);
      if (res.success) {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      }
    } catch (e) {
      console.error("Delete quiz error:", e);
    } finally {
      setDeletingId(null);
    }
  };

  // Distinct classes and subjects for filter dropdowns
  const uniqueClasses = Array.from(new Set(quizzes.map((q) => q.className))).filter(Boolean);
  const uniqueSubjects = Array.from(new Set(quizzes.map((q) => q.subjectName))).filter(Boolean);

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      selectedClassFilter === "all" || q.className === selectedClassFilter;

    const matchesSubject =
      selectedSubjectFilter === "all" || q.subjectName === selectedSubjectFilter;

    return matchesSearch && matchesClass && matchesSubject;
  });

  const activeQuizzes = filteredQuizzes.filter((q) => q.computedStatus === "active");
  const upcomingQuizzes = filteredQuizzes.filter((q) => q.computedStatus === "upcoming");
  const pastQuizzes = filteredQuizzes.filter((q) => q.computedStatus === "past");

  const displayedList =
    activeTab === "upcoming"
      ? upcomingQuizzes
      : activeTab === "active"
      ? activeQuizzes
      : activeTab === "past"
      ? pastQuizzes
      : filteredQuizzes;

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL QUIZZES */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-[#4e282c]">
          <div className="w-11 h-11 rounded-xl bg-[#f4eaea] flex items-center justify-center flex-shrink-0">
            <Image src="/exam.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{quizzes.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">
              Total Quizzes
            </span>
          </div>
        </div>

        {/* ACTIVE TODAY */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-[#f16122]">
          <div className="w-11 h-11 rounded-xl bg-[#fdece7] flex items-center justify-center flex-shrink-0">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{activeQuizzes.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">
              Active Today
            </span>
          </div>
        </div>

        {/* UPCOMING */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-indigo-500">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🕒</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{upcomingQuizzes.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">
              Upcoming
            </span>
          </div>
        </div>

        {/* SUBMISSIONS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-emerald-500">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Image src="/result.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">
              {quizzes.reduce((sum, q) => sum + (q.submissions?.length || 0), 0)}
            </h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">
              Submissions
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIONS & FILTER BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* TAB BUTTONS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "upcoming"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>🕒 Upcoming</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {upcomingQuizzes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "active"
                ? "bg-[#f16122] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>⚡ Active Today</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {activeQuizzes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "calendar"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>📅 Calendar View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === "past"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Past ({pastQuizzes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#4e282c] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({filteredQuizzes.length})
          </button>
        </div>

        {/* CREATE QUIZ BUTTON */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#f16122] hover:bg-[#d85218] text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
        >
          <span className="text-base leading-none">+</span>
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* 3. CALENDAR VIEW OR CARD LIST */}
      {activeTab === "calendar" ? (
        <AssessmentCalendarView
          role="teacher"
          teacherId={teacherId}
          onViewSubmissions={(q) => setInspectQuizSubmissions(q)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search assessments by title, subject, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#f16122]"
              />
              <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
            </div>

            <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* QUIZ CARDS */}
          {displayedList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
                📝
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600">No assessments found.</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click &quot;Create New Quiz&quot; above to schedule your first assessment!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedList.map((quiz) => {
                const isActive = quiz.computedStatus === "active";
                const isUpcoming = quiz.computedStatus === "upcoming";
                const isDeleting = deletingId === quiz.id;

                return (
                  <div
                    key={quiz.id}
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
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                            {quiz.subjectName}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Class {quiz.className}
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

                      {/* TITLE & DESCRIPTION */}
                      <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {quiz.title}
                      </h4>
                      {quiz.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {quiz.description}
                        </p>
                      )}

                      {/* STATS ROW */}
                      <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Duration</span>
                          <span className="font-extrabold text-slate-800">{quiz.durationMinutes}m</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Marks</span>
                          <span className="font-extrabold text-slate-800">{quiz.totalMarks}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">Questions</span>
                          <span className="font-extrabold text-slate-800">{quiz.questions.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        <span>📅 {quiz.scheduledDate}</span>
                        {quiz.startTime && <span className="ml-1 text-slate-400">({quiz.startTime})</span>}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectQuizSubmissions(quiz)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          Submissions ({quiz.submissions?.length || 0})
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="w-7 h-7 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold transition-all"
                          title="Delete assessment"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <CreateQuizModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleQuizCreated}
        teacherId={teacherId}
        teacherName={teacherName}
      />

      {/* SUBMISSIONS MODAL */}
      {inspectQuizSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col my-auto overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Student Submissions: {inspectQuizSubmissions.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Class {inspectQuizSubmissions.className} • Total Marks: {inspectQuizSubmissions.totalMarks}
                </p>
              </div>
              <button
                onClick={() => setInspectQuizSubmissions(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
              {(!inspectQuizSubmissions.submissions || inspectQuizSubmissions.submissions.length === 0) ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-bold text-slate-500">No student submissions yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Submissions will appear here in real time as students complete the quiz.
                  </p>
                </div>
              ) : (
                inspectQuizSubmissions.submissions.map((sub: QuizSubmission) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="text-xs sm:text-sm font-black text-slate-900">
                        {sub.studentName}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        Roll No: {sub.rollNumber || "N/A"} • Submitted: {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          sub.passed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {sub.score} / {sub.totalMarks} ({sub.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectQuizSubmissions(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssessmentView;

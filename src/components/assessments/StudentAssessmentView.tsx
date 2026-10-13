"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  QuizItem,
  QuizSubmission,
} from "@/lib/assessmentActions";
import TakeQuizModal from "./TakeQuizModal";
import AssessmentCalendarView from "./AssessmentCalendarView";

interface StudentAssessmentViewProps {
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
      studentCompletedCount: number;
      studentAverageScore: number;
    };
  };
  studentId: string;
  studentName: string;
  className?: string;
  rollNumber?: string;
}

const StudentAssessmentView: React.FC<StudentAssessmentViewProps> = ({
  initialQuizzes,
  studentId,
  studentName,
  className,
  rollNumber,
}) => {
  const [quizzes, setQuizzes] = useState(initialQuizzes.all);
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "calendar" | "completed" | "all">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [activeQuizForAttempt, setActiveQuizForAttempt] = useState<QuizItem | null>(null);

  const handleQuizSubmitted = (sub: QuizSubmission) => {
    setQuizzes((prev) =>
      prev.map((q) => {
        if (q.id === sub.quizId) {
          return {
            ...q,
            userSubmission: sub,
            submissions: [...(q.submissions || []), sub],
          };
        }
        return q;
      })
    );
  };

  const uniqueSubjects = Array.from(new Set(quizzes.map((q) => q.subjectName))).filter(Boolean);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === "all" || q.subjectName === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  const activeQuizzes = filteredQuizzes.filter((q) => q.computedStatus === "active");
  const upcomingQuizzes = filteredQuizzes.filter((q) => q.computedStatus === "upcoming");
  const completedQuizzes = filteredQuizzes.filter((q) => Boolean(q.userSubmission));

  const displayedList =
    activeTab === "active"
      ? activeQuizzes
      : activeTab === "upcoming"
      ? upcomingQuizzes
      : activeTab === "completed"
      ? completedQuizzes
      : filteredQuizzes;

  // Compute student stats
  let completedCount = 0;
  let totalScoreSum = 0;
  let totalPossibleSum = 0;

  quizzes.forEach((q) => {
    if (q.userSubmission) {
      completedCount++;
      totalScoreSum += q.userSubmission.score;
      totalPossibleSum += q.userSubmission.totalMarks;
    }
  });

  const averageScorePercent =
    totalPossibleSum > 0 ? Math.round((totalScoreSum / totalPossibleSum) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* ACTIVE TODAY */}
        <div
          onClick={() => setActiveTab("active")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-[#f16122] cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#fdece7] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{activeQuizzes.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f16122] block mt-0.5">
              Active Today
            </span>
          </div>
        </div>

        {/* UPCOMING */}
        <div
          onClick={() => setActiveTab("upcoming")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-indigo-500 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-xl">🕒</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{upcomingQuizzes.length}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 block mt-0.5">
              Upcoming
            </span>
          </div>
        </div>

        {/* COMPLETED */}
        <div
          onClick={() => setActiveTab("completed")}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image src="/result.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{completedCount}</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 block mt-0.5">
              Completed
            </span>
          </div>
        </div>

        {/* AVERAGE SCORE */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 border-l-4 border-l-[#4e282c]">
          <div className="w-11 h-11 rounded-xl bg-[#f4eaea] flex items-center justify-center flex-shrink-0">
            <span className="text-base font-black text-[#4e282c]">%</span>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-slate-900">{averageScorePercent}%</h3>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">
              Average Score
            </span>
          </div>
        </div>
      </div>

      {/* 2. TABS & SEARCH */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* TAB BUTTONS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
            onClick={() => setActiveTab("calendar")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "calendar"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>📅 Assessment Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            My Results ({completedCount})
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

        {/* SUBJECT FILTER */}
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
        </div>
      </div>

      {/* 3. CALENDAR VIEW OR QUIZ CARDS */}
      {activeTab === "calendar" ? (
        <AssessmentCalendarView
          role="student"
          className={className}
          studentId={studentId}
          onTakeQuiz={(q) => setActiveQuizForAttempt(q)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* SEARCH BAR */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search assessment name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-hidden focus:border-[#f16122]"
            />
            <span className="absolute left-3 top-3 text-xs text-slate-400">🔍</span>
          </div>

          {/* QUIZZES LIST */}
          {displayedList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">🎉</span>
              <p className="text-sm font-bold text-slate-700">No assessments in this section.</p>
              <p className="text-xs text-slate-400">
                You are all caught up! Check the &quot;Upcoming&quot; tab or &quot;Assessment Calendar&quot; for scheduled tests.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedList.map((quiz) => {
                const isActive = quiz.computedStatus === "active";
                const isUpcoming = quiz.computedStatus === "upcoming";
                const hasSubmission = Boolean(quiz.userSubmission);

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
                      {/* TOP ROW */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                          {quiz.subjectName}
                        </span>

                        {hasSubmission ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            Completed ({quiz.userSubmission?.score}/{quiz.userSubmission?.totalMarks})
                          </span>
                        ) : isActive ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#fdece7] text-[#f16122] animate-pulse">
                            ⚡ Available Today
                          </span>
                        ) : isUpcoming ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                            🕒 Scheduled
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Closed
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

                      {/* METRICS */}
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
                          <span className="text-[10px] font-bold text-slate-400 block">Passing</span>
                          <span className="font-extrabold text-slate-800">{quiz.passingMarks}</span>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM ACTION */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        <span>📅 {quiz.scheduledDate}</span>
                        {quiz.startTime && <span className="ml-1 text-slate-400">({quiz.startTime})</span>}
                      </div>

                      {hasSubmission ? (
                        <button
                          type="button"
                          onClick={() => setActiveQuizForAttempt(quiz)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          Review Answers →
                        </button>
                      ) : isActive ? (
                        <button
                          type="button"
                          onClick={() => setActiveQuizForAttempt(quiz)}
                          className="px-4 py-1.5 rounded-xl bg-[#f16122] hover:bg-[#d85218] text-white text-xs font-black shadow-xs transition-all"
                        >
                          Take Quiz Now →
                        </button>
                      ) : isUpcoming ? (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
                          Upcoming
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAKE / REVIEW QUIZ MODAL */}
      <TakeQuizModal
        quiz={activeQuizForAttempt}
        isOpen={Boolean(activeQuizForAttempt)}
        onClose={() => setActiveQuizForAttempt(null)}
        studentId={studentId}
        studentName={studentName}
        className={className}
        rollNumber={rollNumber}
        onSubmitted={handleQuizSubmitted}
      />
    </div>
  );
};

export default StudentAssessmentView;

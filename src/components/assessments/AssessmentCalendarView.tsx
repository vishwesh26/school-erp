"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  AssessmentCalendarData,
  CalendarQuizDay,
  QuizItem,
  getAssessmentCalendarData,
} from "@/lib/assessmentActions";

interface AssessmentCalendarViewProps {
  initialData?: AssessmentCalendarData;
  classId?: number | string;
  className?: string;
  teacherId?: string;
  role?: "student" | "teacher" | "admin";
  studentId?: string;
  onTakeQuiz?: (quiz: QuizItem) => void;
  onViewSubmissions?: (quiz: QuizItem) => void;
}

const AssessmentCalendarView: React.FC<AssessmentCalendarViewProps> = ({
  initialData,
  classId,
  className,
  teacherId,
  role = "student",
  studentId,
  onTakeQuiz,
  onViewSubmissions,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(
    initialData?.year || new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    initialData?.month || new Date().getMonth() + 1
  );
  const [calendarData, setCalendarData] = useState<AssessmentCalendarData | null>(
    initialData || null
  );
  const [selectedDay, setSelectedDay] = useState<CalendarQuizDay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);

  const fetchMonth = async (yr: number, mo: number) => {
    setIsLoading(true);
    try {
      const data = await getAssessmentCalendarData({
        year: yr,
        month: mo,
        classId,
        className,
        teacherId,
        role,
        studentId,
      });
      setCalendarData(data);
      // If selected day exists in new month, re-select it; otherwise default to today if in month
      const todayCell = data.days.find((d) => d.isToday);
      if (todayCell && todayCell.quizzes.length > 0) {
        setSelectedDay(todayCell);
      } else {
        const firstWithQuiz = data.days.find((d) => d.quizzes.length > 0);
        setSelectedDay(firstWithQuiz || todayCell || data.days[0]);
      }
    } catch (e) {
      console.error("Error fetching calendar data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonth(currentYear, currentMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth, classId, teacherId]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Selected day quizzes or all month quizzes if no day selected
  const activeQuizzesToShow = selectedDay ? selectedDay.quizzes : [];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 flex flex-col gap-6">
      {/* 1. CALENDAR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fdece7] flex items-center justify-center flex-shrink-0">
              <Image src="/calendar.png" alt="" width={20} height={20} className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Assessment Schedule Calendar
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Click any highlighted date to inspect scheduled quizzes and tests
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTodayClick}
            type="button"
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200/60">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-2xs transition-all font-bold text-sm"
              title="Previous Month"
            >
              ‹
            </button>
            <span className="px-3 text-xs sm:text-sm font-extrabold text-slate-800 min-w-[130px] text-center">
              {calendarData?.monthName || "Month"} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-2xs transition-all font-bold text-sm"
              title="Next Month"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 2. CALENDAR SUMMARY STATS */}
      {calendarData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-xs text-slate-700 shadow-2xs">
              {calendarData.stats.totalQuizzes}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Scheduled</span>
              <span className="text-xs font-extrabold text-slate-800">In {calendarData.monthName}</span>
            </div>
          </div>

          <div className="bg-[#fdece7]/40 p-3 rounded-2xl border border-[#fdece7] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#f16122] text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {calendarData.stats.activeQuizzes}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f16122] block">Active Today</span>
              <span className="text-xs font-extrabold text-slate-800">Ready to take</span>
            </div>
          </div>

          <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {calendarData.stats.upcomingQuizzes}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Upcoming</span>
              <span className="text-xs font-extrabold text-slate-800">Coming soon</span>
            </div>
          </div>

          <div className="bg-slate-100/60 p-3 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {calendarData.stats.pastQuizzes}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Past / Completed</span>
              <span className="text-xs font-extrabold text-slate-800">Historical</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALENDAR MONTH GRID */}
      <div className="flex flex-col">
        {/* DAY HEADERS */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {dayHeaders.map((dh, i) => (
            <div
              key={dh}
              className={`text-center py-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider ${
                i === 0 ? "text-rose-500" : "text-slate-500"
              }`}
            >
              {dh}
            </div>
          ))}
        </div>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-[#f16122] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading assessment calendar...</span>
          </div>
        )}

        {/* DAYS CELLS */}
        {!isLoading && calendarData && (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank cells for offset before 1st day of month */}
            {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[64px] sm:min-h-[82px] bg-slate-50/40 rounded-xl sm:rounded-2xl border border-transparent"
              />
            ))}

            {/* Actual Month Days */}
            {calendarData.days.map((dayItem) => {
              const isSelected = selectedDay?.dateStr === dayItem.dateStr;
              const hasQuizzes = dayItem.quizCount > 0;

              return (
                <button
                  key={dayItem.dateStr}
                  type="button"
                  onClick={() => setSelectedDay(dayItem)}
                  className={`min-h-[68px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between text-left relative group ${
                    isSelected
                      ? "border-[#f16122] bg-[#fffaf8] shadow-sm ring-2 ring-[#f16122]/30"
                      : dayItem.isToday
                      ? "border-[#f16122]/60 bg-[#fdece7]/20 hover:border-[#f16122]"
                      : hasQuizzes
                      ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      : "border-slate-100 bg-white/70 hover:bg-slate-50/80"
                  }`}
                >
                  {/* Top Bar: Date Number + Today Indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        dayItem.isToday
                          ? "w-6 h-6 rounded-full bg-[#f16122] text-white flex items-center justify-center text-[11px]"
                          : isSelected
                          ? "text-[#f16122]"
                          : "text-slate-800"
                      }`}
                    >
                      {dayItem.day}
                    </span>

                    {/* Quiz Count Pill */}
                    {hasQuizzes && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          dayItem.hasActive
                            ? "bg-[#f16122] text-white shadow-2xs animate-pulse"
                            : dayItem.hasUpcoming
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {dayItem.quizCount} {dayItem.quizCount === 1 ? "Quiz" : "Quizzes"}
                      </span>
                    )}
                  </div>

                  {/* Badges preview inside cell */}
                  {hasQuizzes ? (
                    <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                      {dayItem.quizzes.slice(0, 2).map((q) => (
                        <div
                          key={q.id}
                          className={`text-[9px] sm:text-[10px] font-extrabold truncate px-1 sm:px-1.5 py-0.5 rounded-md ${
                            dayItem.hasActive
                              ? "bg-[#fdece7] text-[#9a3810]"
                              : dayItem.hasUpcoming
                              ? "bg-indigo-50 text-indigo-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={`${q.subjectName}: ${q.title}`}
                        >
                          {q.subjectName}
                        </div>
                      ))}
                      {dayItem.quizzes.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold">
                          +{dayItem.quizzes.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="min-h-[16px]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. SELECTED DAY DETAIL SECTION */}
      {selectedDay && (
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Scheduled Assessments on:
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900">
                {selectedDay.dayOfWeek}, {selectedDay.day} {calendarData?.monthName} {currentYear}
              </span>
              {selectedDay.isToday && (
                <span className="text-[10px] font-black uppercase bg-[#f16122] text-white px-2 py-0.5 rounded-md">
                  Today
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-slate-500">
              {activeQuizzesToShow.length} {activeQuizzesToShow.length === 1 ? "assessment" : "assessments"} scheduled
            </span>
          </div>

          {/* QUIZZES ON SELECTED DATE */}
          {activeQuizzesToShow.length === 0 ? (
            <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-slate-500">
                No assessments scheduled on this date.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select another date with a colored dot or badge to view details.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeQuizzesToShow.map((quiz) => {
                const isActive = quiz.computedStatus === "active" || selectedDay.isToday;
                const isUpcoming = quiz.computedStatus === "upcoming";
                const isPast = quiz.computedStatus === "past";

                return (
                  <div
                    key={quiz.id}
                    className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between gap-3 ${
                      isActive
                        ? "border-l-4 border-l-[#f16122] border-slate-100"
                        : isUpcoming
                        ? "border-l-4 border-l-indigo-500 border-slate-100"
                        : "border-l-4 border-l-slate-400 border-slate-100"
                    }`}
                  >
                    <div>
                      {/* STATUS & SUBJECT TAGS */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                            {quiz.subjectName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Class {quiz.className}
                          </span>
                        </div>

                        {isActive ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#fdece7] text-[#f16122]">
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
                      <h4 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">
                        {quiz.title}
                      </h4>
                      {quiz.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {quiz.description}
                        </p>
                      )}

                      {/* METRICS */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mt-3 pt-2.5 border-t border-slate-100">
                        <span>⏱ {quiz.durationMinutes} mins</span>
                        <span>🎯 {quiz.totalMarks} Marks</span>
                        <span>❓ {quiz.questions.length} Questions</span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {quiz.startTime ? `${quiz.startTime} - ${quiz.endTime}` : "Anytime today"}
                      </span>

                      {role === "student" && (
                        <div>
                          {quiz.userSubmission ? (
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              Completed: {quiz.userSubmission.score}/{quiz.userSubmission.totalMarks} ({quiz.userSubmission.percentage}%)
                            </span>
                          ) : isActive ? (
                            <button
                              onClick={() => onTakeQuiz && onTakeQuiz(quiz)}
                              type="button"
                              className="px-4 py-1.5 rounded-xl bg-[#f16122] hover:bg-[#d85218] text-white text-xs font-black transition-all shadow-xs"
                            >
                              Take Quiz Now →
                            </button>
                          ) : isUpcoming ? (
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
                              Opens on {quiz.scheduledDate}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">
                              Closed
                            </span>
                          )}
                        </div>
                      )}

                      {(role === "teacher" || role === "admin") && (
                        <div className="flex items-center gap-2">
                          {onViewSubmissions && (
                            <button
                              onClick={() => onViewSubmissions(quiz)}
                              type="button"
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                            >
                              Submissions ({quiz.submissions?.length || 0})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentCalendarView;

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ExamCalendarData,
  ExamCalendarDay,
  ExamItem,
  getExamCalendarData,
} from "@/lib/examActions";
import ExamDetailModal from "./ExamDetailModal";

interface ExamCalendarViewProps {
  initialData?: ExamCalendarData;
  classId?: number | string;
  className?: string;
  role?: string;
  onSelectExam?: (exam: ExamItem, tab?: "syllabus" | "pattern" | "marks" | "timetable") => void;
}

const ExamCalendarView: React.FC<ExamCalendarViewProps> = ({
  initialData,
  classId,
  className,
  role = "student",
  onSelectExam,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(
    initialData?.year || new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    initialData?.month || new Date().getMonth() + 1
  );
  const [calendarData, setCalendarData] = useState<ExamCalendarData | null>(
    initialData || null
  );
  const [selectedDay, setSelectedDay] = useState<ExamCalendarDay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [modalExam, setModalExam] = useState<ExamItem | null>(null);
  const [modalDefaultTab, setModalDefaultTab] = useState<"syllabus" | "pattern" | "marks" | "timetable">("syllabus");

  const fetchMonth = async (yr: number, mo: number) => {
    setIsLoading(true);
    try {
      const data = await getExamCalendarData({
        year: yr,
        month: mo,
        classId,
        className,
        role,
      });
      setCalendarData(data);

      const todayCell = data.days.find((d) => d.isToday);
      if (todayCell && todayCell.exams.length > 0) {
        setSelectedDay(todayCell);
      } else {
        const firstWithExam = data.days.find((d) => d.exams.length > 0);
        setSelectedDay(firstWithExam || todayCell || data.days[0]);
      }
    } catch (e) {
      console.error("Error fetching exam calendar:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonth(currentYear, currentMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth, classId]);

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
  const activeExamsToShow = selectedDay ? selectedDay.exams : [];

  const handleOpenDetail = (exam: ExamItem, tab: "syllabus" | "pattern" | "marks" | "timetable" = "syllabus") => {
    if (onSelectExam) {
      onSelectExam(exam, tab);
    } else {
      setModalExam(exam);
      setModalDefaultTab(tab);
    }
  };

  const examsWithTimetablePdf = calendarData?.days.flatMap((d) => d.exams).filter((e) => Boolean(e.timetablePdfUrl)) || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 flex flex-col gap-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fdece7] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Image src="/exam.png" alt="" width={22} height={22} className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Online Exam Schedule & Timetable Calendar
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Click any calendar date to find upcoming exams, Syllabus, Paper Pattern, Marks Distribution & Timetable PDF
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTodayClick}
            type="button"
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200/60">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-2xs transition-all font-bold text-sm cursor-pointer"
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-2xs transition-all font-bold text-sm cursor-pointer"
              title="Next Month"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      {calendarData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-xs text-slate-700 shadow-2xs">
              {calendarData.stats.totalExams}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Exams</span>
              <span className="text-xs font-extrabold text-slate-800">{calendarData.monthName}</span>
            </div>
          </div>

          <div className="bg-[#fdece7]/50 p-3 rounded-2xl border border-[#fdece7] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#f16122] text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {calendarData.stats.activeExams}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f16122] block">Today&apos;s Exams</span>
              <span className="text-xs font-extrabold text-slate-800">Happening now</span>
            </div>
          </div>

          <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {calendarData.stats.upcomingExams}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Upcoming</span>
              <span className="text-xs font-extrabold text-slate-800">Coming up</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              📄
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Schedule PDFs</span>
              <span className="text-xs font-extrabold text-slate-800">
                {examsWithTimetablePdf.length > 0 ? `${examsWithTimetablePdf.length} Uploaded` : "Available"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALENDAR MONTH GRID */}
      <div className="flex flex-col">
        {/* HEADERS */}
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

        {/* LOADING */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-[#f16122] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading exam calendar...</span>
          </div>
        )}

        {/* CELLS */}
        {!isLoading && calendarData && (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[64px] sm:min-h-[86px] bg-slate-50/40 rounded-xl sm:rounded-2xl border border-transparent"
              />
            ))}

            {calendarData.days.map((dayItem) => {
              const isSelected = selectedDay?.dateStr === dayItem.dateStr;
              const hasExams = dayItem.examCount > 0;

              return (
                <button
                  key={dayItem.dateStr}
                  type="button"
                  onClick={() => setSelectedDay(dayItem)}
                  className={`min-h-[68px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between text-left relative cursor-pointer ${
                    isSelected
                      ? "border-[#4e282c] bg-[#fffaf8] shadow-sm ring-2 ring-[#4e282c]/30"
                      : dayItem.isToday
                      ? "border-[#f16122]/60 bg-[#fdece7]/20 hover:border-[#f16122]"
                      : hasExams
                      ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      : "border-slate-100 bg-white/70 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        dayItem.isToday
                          ? "w-6 h-6 rounded-full bg-[#f16122] text-white flex items-center justify-center text-[11px]"
                          : isSelected
                          ? "text-[#4e282c]"
                          : "text-slate-800"
                      }`}
                    >
                      {dayItem.day}
                    </span>

                    {hasExams && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          dayItem.hasActive
                            ? "bg-[#f16122] text-white animate-pulse"
                            : dayItem.hasUpcoming
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {dayItem.examCount} Exam
                      </span>
                    )}
                  </div>

                  {hasExams ? (
                    <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                      {dayItem.exams.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className={`text-[9px] sm:text-[10px] font-extrabold truncate px-1 sm:px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                            dayItem.hasActive
                              ? "bg-[#fdece7] text-[#9a3810]"
                              : dayItem.hasUpcoming
                              ? "bg-indigo-50 text-indigo-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          title={`${e.subjectName}: ${e.title} (${e.duration})`}
                        >
                          <span className="truncate">{e.subjectName}</span>
                          {e.timetablePdfUrl && <span className="text-[8px] flex-shrink-0">📄</span>}
                        </div>
                      ))}
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Scheduled Papers on:
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
              {activeExamsToShow.length} {activeExamsToShow.length === 1 ? "paper" : "papers"} scheduled
            </span>
          </div>

          {activeExamsToShow.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-bold text-slate-500">No exams scheduled on this date.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select a highlighted date with exams to review syllabus, paper pattern, marks distribution, and timetable PDF.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeExamsToShow.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3 border-l-4 border-l-[#4e282c]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                          {exam.subjectName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          Class {exam.className}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Online CBT
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {exam.duration}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">
                      {exam.title}
                    </h4>

                    <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                      <p>⏰ <strong>Writing Window:</strong> {exam.timetable?.writingTime || `${exam.startTime} - ${exam.endTime}`}</p>
                      <p>💻 <strong>Portal / Room:</strong> {exam.timetable?.hallOrPortal || "Online Examination Portal"}</p>
                      <p>🎯 <strong>Marks:</strong> {exam.totalMarks} (Passing: {exam.passingMarks})</p>
                    </div>
                  </div>

                  {/* 4 QUICK ACCESS BUTTONS: SYLLABUS, PATTERN, MARKS DISTRIBUTION, TIMETABLE PDF */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(exam, "syllabus")}
                      className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-[#4e282c] hover:text-white text-slate-700 text-[11px] font-bold transition-all text-center cursor-pointer"
                    >
                      📖 Syllabus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(exam, "pattern")}
                      className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-[#f16122] hover:text-white text-slate-700 text-[11px] font-bold transition-all text-center cursor-pointer"
                    >
                      📋 Pattern
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(exam, "marks")}
                      className="px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-[11px] font-bold transition-all text-center border border-emerald-200 cursor-pointer"
                    >
                      🎯 Marks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(exam, "timetable")}
                      className="px-2 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-[11px] font-black transition-all text-center border border-indigo-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>📄</span>
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL IF TRIGGERED LOCALLY */}
      <ExamDetailModal
        exam={modalExam}
        isOpen={Boolean(modalExam)}
        onClose={() => setModalExam(null)}
        defaultTab={modalDefaultTab}
      />
    </div>
  );
};

export default ExamCalendarView;

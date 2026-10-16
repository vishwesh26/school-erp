"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    fetchStudentAttendanceCalendar,
    StudentAttendanceCalendarData,
    StudentCalendarDay,
} from "@/lib/studentAttendanceActions";
import { formatClassName } from "@/lib/utils";

interface StudentAttendanceCalendarViewProps {
    studentId: string;
    studentName?: string;
    className?: string;
    rollNumber?: string;
    onClose?: () => void;
    isModal?: boolean;
}

const MONTH_OPTIONS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StudentAttendanceCalendarView({
    studentId,
    studentName,
    className,
    rollNumber,
    onClose,
    isModal = false,
}: StudentAttendanceCalendarViewProps) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    const [calendarData, setCalendarData] = useState<StudentAttendanceCalendarData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDay, setSelectedDay] = useState<StudentCalendarDay | null>(null);

    const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    const loadData = async (yr: number, mo: number) => {
        if (!studentId) return;
        setLoading(true);
        try {
            const data = await fetchStudentAttendanceCalendar(studentId, yr, mo);
            setCalendarData(data);
            const todayItem = data.days.find((d) => d.isToday) || data.days[0] || null;
            setSelectedDay(todayItem);
        } catch (err) {
            console.error("Error loading attendance calendar:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (studentId) {
            loadData(selectedYear, selectedMonth);
        }
    }, [studentId, selectedYear, selectedMonth]);

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear((prev) => prev - 1);
        } else {
            setSelectedMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear((prev) => prev + 1);
        } else {
            setSelectedMonth((prev) => prev + 1);
        }
    };

    const handleGoToday = () => {
        setSelectedYear(currentYear);
        setSelectedMonth(currentMonth);
    };

    const stats = calendarData?.stats || {
        monthWorkingDays: 0,
        monthPresentDays: 0,
        monthAbsentDays: 0,
        monthSundays: 0,
        monthPercentage: 0,
        yearlyWorkingDays: 0,
        yearlyPresentDays: 0,
        yearlyAbsentDays: 0,
        yearlyPercentage: 0,
    };

    const firstDayIndex = calendarData?.firstDayOfWeek || 0;
    const blankDays = Array.from({ length: firstDayIndex });

    const displayName = calendarData?.studentName || studentName || "Student";
    const displayClass = formatClassName(calendarData?.className || className || "");
    const displayRoll = calendarData?.rollNumber || rollNumber;
    const isHighAttendance = stats.monthPercentage >= 75;

    return (
        <div className={`flex flex-col bg-white ${isModal ? "" : "rounded-3xl border border-slate-100 shadow-xs overflow-hidden"}`}>
            {/* 1. HEADER (Only if modal or top banner) */}
            {isModal ? (
                <div className="bg-gradient-to-r from-[#4e282c] via-[#6d1b22] to-[#f16122] p-4 sm:p-6 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
                            <Image
                                src="/singleAttendance.png"
                                alt="Attendance"
                                width={28}
                                height={28}
                                className="w-7 h-7 object-contain brightness-0 invert"
                            />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="bg-orange-500/80 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-orange-400/40">
                                    Attendance Calendar
                                </span>
                                {displayClass && (
                                    <span className="bg-white/15 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                                        Class: {displayClass}
                                    </span>
                                )}
                                {displayRoll && (
                                    <span className="bg-amber-400/30 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        Roll No: {displayRoll}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white truncate">
                                {displayName}
                            </h2>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer flex-shrink-0"
                            title="Close Calendar"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            ) : (
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f16122]" />
                            <span className="text-xs font-black uppercase tracking-wider text-[#f16122] bg-[#fdece7] px-2.5 py-0.5 rounded-full">
                                Attendance Portal
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            My Attendance Calendar
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Track daily presence, absence records, and monthly percentages
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                        <Link
                            href="/list/attendance"
                            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
                        >
                            <span>📋</span>
                            <span>View Attendance Table</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* 2. CONTROLS BAR */}
            <div className="bg-slate-50 border-b border-slate-200/80 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition shadow-2xs cursor-pointer active:scale-95"
                        title="Previous Month"
                    >
                        ‹
                    </button>

                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                        className="h-9 px-3 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-800 shadow-2xs outline-none focus:ring-2 focus:ring-[#f16122] cursor-pointer"
                    >
                        {MONTH_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                        className="h-9 px-3 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-800 shadow-2xs outline-none focus:ring-2 focus:ring-[#f16122] cursor-pointer"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition shadow-2xs cursor-pointer active:scale-95"
                        title="Next Month"
                    >
                        ›
                    </button>

                    <button
                        type="button"
                        onClick={handleGoToday}
                        className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-600 transition shadow-2xs cursor-pointer active:scale-95 hidden sm:inline-block"
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadData(selectedYear, selectedMonth)}
                        disabled={loading}
                        className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                        title="Refresh Attendance Data"
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {/* 3. KPI STATS SUMMARY CARDS */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-100">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {/* MONTH ATTENDANCE PERCENTAGE */}
                    <div
                        className={`p-3.5 rounded-2xl border transition-all ${
                            isHighAttendance
                                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                                : "bg-amber-50/70 border-amber-200/80 text-amber-950"
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">
                            Month Attendance
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl sm:text-2xl font-black">
                                {stats.monthPercentage}%
                            </span>
                            <span className="text-[11px] font-bold opacity-75">
                                {isHighAttendance ? "Good" : "Needs Attention"}
                            </span>
                        </div>
                        <span className="text-[10px] opacity-60 block mt-0.5">
                            CBSE Target: 75%
                        </span>
                    </div>

                    {/* PRESENT DAYS */}
                    <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 text-emerald-900">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                            Present Days
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xl sm:text-2xl font-black text-emerald-700">
                                {stats.monthPresentDays}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                                / {stats.monthWorkingDays} Days
                            </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            Attended Lectures
                        </span>
                    </div>

                    {/* ABSENT DAYS */}
                    <div className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/40 text-rose-900">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                            Absent Days
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xl sm:text-2xl font-black text-rose-700">
                                {stats.monthAbsentDays}
                            </span>
                            <span className="text-xs font-bold text-rose-600">Days</span>
                        </div>
                        <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                            Missed School Days
                        </span>
                    </div>

                    {/* ACADEMIC YEAR OVERALL */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            Academic Year Avg
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xl sm:text-2xl font-black text-slate-900">
                                {stats.yearlyPercentage}%
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                ({stats.yearlyPresentDays}/{stats.yearlyWorkingDays})
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                            Total Recorded Days
                        </span>
                    </div>
                </div>
            </div>

            {/* 4. CALENDAR BODY & DAY INSPECTOR */}
            <div className="p-4 sm:p-6 bg-slate-50/60 flex flex-col gap-5">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#f16122] border-t-transparent" />
                        <p className="text-xs font-bold text-slate-500">
                            Loading attendance calendar for {calendarData?.monthName || "month"}...
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 sm:p-5 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                    {calendarData?.monthName} {selectedYear}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Click any day cell to view attendance details and session info
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-slate-700">
                                    {stats.monthPresentDays} Present
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-xs font-bold text-slate-700">
                                    {stats.monthAbsentDays} Absent
                                </span>
                            </div>
                        </div>

                        {/* 7-COLUMNS CALENDAR GRID */}
                        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                            {DAY_LABELS.map((dayLabel, idx) => (
                                <div
                                    key={dayLabel}
                                    className={`text-center py-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider rounded-xl ${
                                        idx === 0
                                            ? "bg-amber-50 text-amber-800"
                                            : "bg-slate-100/70 text-slate-600"
                                    }`}
                                >
                                    {dayLabel}
                                </div>
                            ))}

                            {blankDays.map((_, idx) => (
                                <div
                                    key={`blank-${idx}`}
                                    className="h-16 sm:h-20 rounded-xl bg-slate-50/50 border border-transparent opacity-40 pointer-events-none"
                                />
                            ))}

                            {calendarData?.days.map((item) => {
                                const isSelected = selectedDay?.day === item.day;

                                let badgeColor = "bg-slate-100 text-slate-600";
                                let badgeText = "—";
                                let cellBorder = "border-slate-100";
                                let cellBg = "bg-white hover:bg-slate-50";

                                if (item.isSunday) {
                                    badgeColor = "bg-amber-100 text-amber-800 font-bold";
                                    badgeText = "Sunday";
                                    cellBg = "bg-amber-50/30 hover:bg-amber-50/60";
                                    cellBorder = "border-amber-100";
                                } else if (item.status === "present") {
                                    badgeColor = "bg-emerald-500 text-white font-black";
                                    badgeText = "Present";
                                    cellBg = "bg-emerald-50/40 hover:bg-emerald-50/70";
                                    cellBorder = "border-emerald-200/90";
                                } else if (item.status === "absent") {
                                    badgeColor = "bg-rose-500 text-white font-black";
                                    badgeText = "Absent";
                                    cellBg = "bg-rose-50/40 hover:bg-rose-50/70";
                                    cellBorder = "border-rose-200/90";
                                } else if (item.status === "future") {
                                    badgeColor = "bg-slate-100 text-slate-400";
                                    badgeText = "Upcoming";
                                    cellBg = "bg-slate-50/30 text-slate-400";
                                }

                                return (
                                    <button
                                        key={`day-${item.day}`}
                                        type="button"
                                        onClick={() => setSelectedDay(item)}
                                        className={`h-16 sm:h-20 rounded-xl border p-1.5 sm:p-2 flex flex-col justify-between text-left transition-all cursor-pointer relative ${cellBg} ${cellBorder} ${
                                            isSelected
                                                ? "ring-2 ring-[#f16122] shadow-sm scale-[1.02] z-10"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span
                                                className={`text-xs sm:text-sm font-black ${
                                                    item.isToday
                                                        ? "w-6 h-6 rounded-full bg-[#f16122] text-white flex items-center justify-center shadow-xs"
                                                        : item.isSunday
                                                        ? "text-amber-800"
                                                        : "text-slate-800"
                                                }`}
                                            >
                                                {item.day}
                                            </span>
                                            {item.isToday && (
                                                <span className="text-[9px] font-black uppercase text-[#f16122] tracking-wider hidden sm:inline">
                                                    Today
                                                </span>
                                            )}
                                        </div>

                                        <div className="w-full flex items-center justify-center">
                                            <span
                                                className={`w-full text-center py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold tracking-tight truncate shadow-2xs ${badgeColor}`}
                                            >
                                                <span className="hidden sm:inline">{badgeText}</span>
                                                <span className="sm:hidden font-black">
                                                    {item.status === "present"
                                                        ? "P"
                                                        : item.status === "absent"
                                                        ? "A"
                                                        : item.isSunday
                                                        ? "Sun"
                                                        : "—"}
                                                </span>
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* SELECTED DAY DETAILS INSPECTOR */}
                        {selectedDay && (
                            <div className="mt-2 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 shadow-2xs ${
                                            selectedDay.status === "present"
                                                ? "bg-emerald-500 text-white"
                                                : selectedDay.status === "absent"
                                                ? "bg-rose-500 text-white"
                                                : selectedDay.isSunday
                                                ? "bg-amber-200 text-amber-900"
                                                : "bg-slate-200 text-slate-700"
                                        }`}
                                    >
                                        {selectedDay.status === "present"
                                            ? "✓"
                                            : selectedDay.status === "absent"
                                            ? "✕"
                                            : selectedDay.isSunday
                                            ? "Sun"
                                            : "—"}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            {selectedDay.dayOfWeek}, {calendarData?.monthName} {selectedDay.day}, {selectedYear}
                                            {selectedDay.isToday && " (Today)"}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            {selectedDay.isSunday
                                                ? "Weekly Holiday — School Closed"
                                                : selectedDay.status === "present"
                                                ? "Marked Present for standard lectures"
                                                : selectedDay.status === "absent"
                                                ? "Marked Absent for school session"
                                                : selectedDay.status === "future"
                                                ? "Future date — session not yet conducted"
                                                : "No attendance record submitted for this date"}
                                            {selectedDay.lessonName && ` • Lesson: ${selectedDay.lessonName}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="self-end sm:self-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                            selectedDay.status === "present"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : selectedDay.status === "absent"
                                                ? "bg-rose-100 text-rose-800"
                                                : selectedDay.isSunday
                                                ? "bg-amber-100 text-amber-800"
                                                : "bg-slate-200 text-slate-700"
                                        }`}
                                    >
                                        {selectedDay.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 5. FOOTER & LEGEND */}
            <div className="bg-white border-t border-slate-200 p-3 sm:p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-bold text-[11px] sm:text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-2xs" />
                        <span className="text-slate-700">Present</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-2xs" />
                        <span className="text-slate-700">Absent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-2xs" />
                        <span className="text-slate-700">Sunday</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-slate-300 inline-block shadow-2xs" />
                        <span className="text-slate-700">Unrecorded / Future</span>
                    </div>
                </div>

                {isModal && onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition cursor-pointer"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface CalendarItem {
  id: string | number;
  title: string;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek?: string; // MONDAY, TUESDAY, etc. for repeating lessons
  startTime?: string;
  endTime?: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
  description?: string;
  badgeText?: string;
  badgeType?: "active" | "upcoming" | "past" | "primary" | "warning" | "success";
  actionHref?: string;
  actionLabel?: string;
  rawItem?: any;
}

interface ModuleCalendarViewProps {
  title: string;
  subtitle: string;
  icon?: string;
  accentColor?: string; // e.g. "#4e282c", "#f16122", "#4f46e5"
  items: CalendarItem[];
  itemTypeLabel?: string; // e.g. "Lesson", "Assignment", "Event", "Announcement"
  emptyStateMessage?: string;
  onItemClick?: (item: CalendarItem) => void;
  supportsWeeklyRecurrence?: boolean; // If true, matches dayOfWeek for lessons
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WEEKDAY_MAP: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

const ModuleCalendarView: React.FC<ModuleCalendarViewProps> = ({
  title,
  subtitle,
  icon = "/calendar.png",
  accentColor = "#4e282c",
  items,
  itemTypeLabel = "Item",
  emptyStateMessage = "No items scheduled for this date.",
  onItemClick,
  supportsWeeklyRecurrence = false,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [searchFilter, setSearchFilter] = useState("");

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = Sun

  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

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
    setSelectedDateStr(todayStr);
  };

  // Helper to find items for a specific date
  const getItemsForDate = (dateStr: string, dayOfWeekIndex: number): CalendarItem[] => {
    const weekdayName = WEEKDAY_MAP[dayOfWeekIndex];

    return items.filter((item) => {
      // Direct date match (YYYY-MM-DD)
      const directMatch = item.dateStr && item.dateStr.slice(0, 10) === dateStr;

      // Weekly recurrence match (for Lessons)
      const recurrenceMatch =
        supportsWeeklyRecurrence &&
        item.dayOfWeek &&
        item.dayOfWeek.toUpperCase() === weekdayName;

      return directMatch || recurrenceMatch;
    });
  };

  // Selected date details
  const selectedDateObj = new Date(selectedDateStr);
  const selectedDayOfWeekIdx = selectedDateObj.getDay();
  const rawItemsForSelectedDate = getItemsForDate(selectedDateStr, selectedDayOfWeekIdx);

  const filteredSelectedItems = rawItemsForSelectedDate.filter((it) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      it.title.toLowerCase().includes(q) ||
      (it.subjectName && it.subjectName.toLowerCase().includes(q)) ||
      (it.className && it.className.toLowerCase().includes(q)) ||
      (it.description && it.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 flex flex-col gap-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Image src={icon} alt="" width={22} height={22} className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* MONTH CONTROLS */}
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
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
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

      {/* 2. CALENDAR MONTH GRID */}
      <div className="flex flex-col">
        {/* DAY HEADERS */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {DAY_NAMES.map((dh, i) => (
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

        {/* CELLS */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Blank offset cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div
              key={`blank-${i}`}
              className="min-h-[64px] sm:min-h-[82px] bg-slate-50/40 rounded-xl sm:rounded-2xl border border-transparent"
            />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const mStr = String(currentMonth).padStart(2, "0");
            const dStr = String(dayNum).padStart(2, "0");
            const cellDateStr = `${currentYear}-${mStr}-${dStr}`;

            const dayOfWeekIdx = (firstDayOfWeek + idx) % 7;
            const dayItems = getItemsForDate(cellDateStr, dayOfWeekIdx);
            const isSelected = selectedDateStr === cellDateStr;
            const isToday = cellDateStr === todayStr;
            const hasItems = dayItems.length > 0;

            return (
              <button
                key={cellDateStr}
                type="button"
                onClick={() => setSelectedDateStr(cellDateStr)}
                className={`min-h-[68px] sm:min-h-[86px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between text-left relative ${
                  isSelected
                    ? "border-[#f16122] bg-[#fffaf8] shadow-sm ring-2 ring-[#f16122]/30"
                    : isToday
                    ? "border-[#f16122]/60 bg-[#fdece7]/20 hover:border-[#f16122]"
                    : hasItems
                    ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    : "border-slate-100 bg-white/70 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      isToday
                        ? "w-6 h-6 rounded-full bg-[#f16122] text-white flex items-center justify-center text-[11px]"
                        : isSelected
                        ? "text-[#f16122]"
                        : "text-slate-800"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {hasItems && (
                    <span
                      className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        isToday
                          ? "bg-[#f16122] text-white animate-pulse"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {/* Day Items Preview Pills */}
                {hasItems ? (
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayItems.slice(0, 2).map((it) => (
                      <div
                        key={it.id}
                        className="text-[9px] sm:text-[10px] font-extrabold truncate px-1 sm:px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        title={it.title}
                      >
                        {it.subjectName || it.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold">
                        +{dayItems.length - 2} more
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
      </div>

      {/* 3. SELECTED DATE DETAIL DRAWER */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Scheduled on:
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900">
              {DAY_NAMES[selectedDayOfWeekIdx]}, {selectedDateStr}
            </span>
            {selectedDateStr === todayStr && (
              <span className="text-[10px] font-black uppercase bg-[#f16122] text-white px-2 py-0.5 rounded-md">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Search ${itemTypeLabel.toLowerCase()}s...`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-hidden"
            />
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {filteredSelectedItems.length} {itemTypeLabel.toLowerCase()}
              {filteredSelectedItems.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* ITEMS LIST */}
        {filteredSelectedItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-500">{emptyStateMessage}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click another date with a badge to view its scheduled items.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSelectedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item)}
                className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3 border-l-4 transition-all hover:shadow-md ${
                  onItemClick ? "cursor-pointer" : ""
                }`}
                style={{ borderLeftColor: accentColor }}
              >
                <div>
                  {/* TOP BADGES */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {item.subjectName && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FEFCE8] text-[#854d0e] border border-amber-200">
                          {item.subjectName}
                        </span>
                      )}
                      {item.className && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          Class {item.className}
                        </span>
                      )}
                    </div>

                    {item.startTime && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                        {item.startTime} {item.endTime ? `- ${item.endTime}` : ""}
                      </span>
                    )}
                  </div>

                  {/* TITLE */}
                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {item.title}
                  </h4>

                  {/* DESCRIPTION */}
                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}

                  {/* TEACHER INFO */}
                  {item.teacherName && (
                    <p className="text-[11px] text-slate-400 font-semibold mt-2">
                      👨‍🏫 Teacher: {item.teacherName}
                    </p>
                  )}
                </div>

                {/* ACTION LINK */}
                {item.actionHref && (
                  <div className="pt-2.5 border-t border-slate-100 flex justify-end">
                    <Link
                      href={item.actionHref}
                      className="text-xs font-black text-[#f16122] hover:underline flex items-center gap-1"
                    >
                      <span>{item.actionLabel || "View Details"}</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCalendarView;

"use client";

import React, { useState } from "react";
import ModuleCalendarView, { CalendarItem } from "../calendar/ModuleCalendarView";

interface LessonsClientViewProps {
  calendarItems: CalendarItem[];
  tableViewSlot: React.ReactNode;
}

const LessonsClientView: React.FC<LessonsClientViewProps> = ({
  calendarItems,
  tableViewSlot,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* VIEW TOGGLE BAR */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              viewMode === "table"
                ? "bg-[#4e282c] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📋</span>
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              viewMode === "calendar"
                ? "bg-[#4e282c] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📅</span>
            <span>Lessons Calendar & Timetable</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {calendarItems.length}
            </span>
          </button>
        </div>

        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
          {calendarItems.length} Weekly Lectures Scheduled
        </span>
      </div>

      {/* VIEW RENDER */}
      {viewMode === "calendar" ? (
        <ModuleCalendarView
          title="Weekly Lessons & Lecture Timetable"
          subtitle="Click on any date to inspect scheduled class lectures, subject teachers, and classroom timings"
          icon="/lesson.png"
          accentColor="#4e282c"
          items={calendarItems}
          itemTypeLabel="Lesson"
          supportsWeeklyRecurrence={true}
          emptyStateMessage="No scheduled lectures on this date."
        />
      ) : (
        tableViewSlot
      )}
    </div>
  );
};

export default LessonsClientView;

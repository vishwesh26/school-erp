"use client";

import Link from "next/link";
import React, { useState } from "react";
import { formatDate } from "@/lib/utils";

export type HomeworkItem = {
  id: number;
  title?: string;
  subjectName: string;
  className?: string;
  teacherName?: string;
  assignedDate?: string | Date;
  dueDate: string | Date;
  status?: "Assigned" | "Submitted" | "Pending" | "Graded";
  href?: string;
};

interface HomeworkCardListProps {
  items: HomeworkItem[];
  title?: string;
  emptyMessage?: string;
  viewAllHref?: string;
}

const HomeworkCardList: React.FC<HomeworkCardListProps> = ({
  items,
  title = "Homework & Assignments",
  emptyMessage = "No homework assigned currently.",
  viewAllHref = "/list/assignments",
}) => {
  const [filter, setFilter] = useState<"all" | "assigned" | "pending">("all");

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 transition-all">
      {/* HEADER WITH CONTROLS (DEMO 4 STYLE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f16122]"></span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#fdece7] text-[#f16122]">
            {items.length}
          </span>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setFilter("all")}
              type="button"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === "all"
                  ? "bg-white text-[#4e282c] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("assigned")}
              type="button"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === "assigned"
                  ? "bg-white text-[#4e282c] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Assigned
            </button>
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-bold text-[#f16122] hover:text-[#4e282c] transition-colors px-2 py-1"
            >
              View All →
            </Link>
          )}
        </div>
      </div>

      {/* HOMEWORK LIST */}
      {filteredItems.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs font-medium">
          {emptyMessage}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => {
            const statusColor =
              item.status === "Submitted"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : item.status === "Pending"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200";

            return (
              <Link
                key={item.id}
                href={item.href || `/list/assignments/${item.id}`}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#f4eaea]/30 via-slate-50/50 to-white border border-slate-100 hover:border-[#f16122]/40 transition-all duration-200 hover:shadow-xs hover:scale-[1.01] border-l-4 border-l-[#4e282c]"
              >
                {/* LEFT: SUBJECT & DETAILS */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase group-hover:text-[#4e282c] transition-colors">
                      {item.subjectName}
                    </span>
                    {item.title && (
                      <span className="text-xs font-semibold text-slate-500">
                        • {item.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    {item.assignedDate && (
                      <span className="flex items-center gap-1 font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-slate-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.253 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
                          />
                        </svg>
                        {formatDate(item.assignedDate)}
                      </span>
                    )}

                    {item.teacherName && (
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-slate-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                        {item.teacherName}
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT: STATUS & SUBMISSION DEADLINE */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${statusColor}`}
                  >
                    {item.status || "Assigned"}
                  </span>

                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400 text-[11px] font-medium">Submit On</span>{" "}
                    <span className="text-[#f16122]">{formatDate(item.dueDate)}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeworkCardList;

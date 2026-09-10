"use client";

import Image from "next/image";
import React from "react";

export type TabItem = {
  id: string;
  label: string;
  badge?: number | string;
};

interface DashboardHeaderProps {
  name: string;
  role: string;
  identifier?: string; // Roll number, Employee ID, etc.
  subtitle?: string; // Class, Grade, or Department
  academicYear?: string;
  img?: string | null;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  showSearch?: boolean;
  onSearchChange?: (term: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  name,
  role,
  identifier,
  subtitle,
  academicYear = "2026-27",
  img,
  tabs = [],
  activeTab,
  onTabChange,
  showSearch = true,
  onSearchChange,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 mb-5 transition-all">
      {/* TOP ROW: PROFILE & IDENTITY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/80 pb-4 sm:pb-5">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* AVATAR WITH BRAND BORDER */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#4e282c]/20 bg-gradient-to-br from-[#f4eaea] to-[#fdece7] shadow-xs flex-shrink-0 flex items-center justify-center">
            {img ? (
              <Image
                src={img}
                alt={name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#4e282c] via-[#802a2c] to-[#f16122] text-white flex items-center justify-center text-xl font-black uppercase">
                {name.charAt(0)}
              </div>
            )}
          </div>

          {/* NAME & META BADGES */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                Hi, {name}
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#4e282c]/10 text-[#4e282c] border border-[#4e282c]/20">
                {role}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap font-medium">
              {identifier && (
                <span className="inline-flex items-center gap-1 font-bold text-[#f16122] bg-[#fdece7] px-2 py-0.5 rounded-md text-[11px]">
                  ID: {identifier}
                </span>
              )}
              {subtitle && (
                <span className="text-slate-600 font-semibold">{subtitle}</span>
              )}
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="font-semibold text-slate-500">
                Dr. Cyrus Poonawalla English Medium School
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: ACADEMIC YEAR PILL */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4eaea] text-[#4e282c] border border-[#4e282c]/15 text-xs font-black shadow-2xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3.5 h-3.5 text-[#f16122]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.253 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
              />
            </svg>
            <span>AY: {academicYear}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: TABS & QUICK SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5">
        {/* TABS */}
        {tabs.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 relative whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-[#4e282c] to-[#802a2c] text-white shadow-xs shadow-[#4e282c]/30 scale-[1.02]"
                      : "text-slate-600 hover:text-[#4e282c] hover:bg-[#f4eaea]/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive
                          ? "bg-white text-[#4e282c]"
                          : "bg-[#fdece7] text-[#f16122]"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* SEARCH BAR WITH MIC ICON (MATCHING DEMO 2) */}
        {showSearch && (
          <div className="relative flex items-center w-full sm:w-64 md:w-72">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[#f16122] transition-all"
            />
            {/* Mic icon */}
            <button
              type="button"
              className="absolute right-2.5 text-slate-400 hover:text-[#f16122] transition-colors"
              title="Voice Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a3 3 0 00-3 3v4.5a3 3 0 006 0v-4.5a3 3 0 00-3-3z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;

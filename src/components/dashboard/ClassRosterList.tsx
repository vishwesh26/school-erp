"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export type RosterStudent = {
  id: string;
  name: string;
  surname?: string;
  img?: string | null;
  rollNumber?: string | number | null;
  className?: string;
  phone?: string;
};

interface ClassRosterListProps {
  students: RosterStudent[];
  title?: string;
  className?: string;
  actionSlot?: React.ReactNode;
}

const pastelPalette = [
  { bg: "bg-[#fdece7]/80 hover:bg-[#fdece7]", border: "border-l-[#f16122]", badge: "text-[#f16122] bg-white" },
  { bg: "bg-emerald-50/80 hover:bg-emerald-100/80", border: "border-l-emerald-400", badge: "text-emerald-700 bg-white" },
  { bg: "bg-[#FEFCE8] hover:bg-amber-100/60", border: "border-l-[#FAE27C]", badge: "text-amber-800 bg-white" },
  { bg: "bg-sky-50/80 hover:bg-sky-100/80", border: "border-l-sky-400", badge: "text-sky-700 bg-white" },
  { bg: "bg-purple-50/80 hover:bg-purple-100/80", border: "border-l-purple-400", badge: "text-purple-700 bg-white" },
  { bg: "bg-[#f4eaea]/80 hover:bg-[#f4eaea]", border: "border-l-[#4e282c]", badge: "text-[#4e282c] bg-white" },
];

const ClassRosterList: React.FC<ClassRosterListProps> = ({
  students,
  title = "My Class",
  className: customClass,
  actionSlot,
}) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 transition-all ${customClass || ""}`}>
      {/* HEADER (MATCHING DEMO 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f16122]"></span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#fdece7] text-[#f16122]">
            {students.length} Students
          </span>
        </div>

        <div className="flex items-center gap-3">
          {actionSlot}
          <Link
            href="/list/students"
            className="text-xs font-bold text-[#f16122] hover:text-[#4e282c] transition-colors"
          >
            View Directory →
          </Link>
        </div>
      </div>

      {/* STUDENT CARDS GRID (DEMO 5 STYLE) */}
      {students.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          No students found in this class.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {students.map((student, idx) => {
            const style = pastelPalette[idx % pastelPalette.length];
            const fullName = `${student.name} ${student.surname || ""}`.trim();

            return (
              <div
                key={student.id}
                className={`relative flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl border border-slate-100/80 shadow-2xs transition-all duration-200 hover:scale-[1.01] border-l-4 ${style.border} ${style.bg} group`}
              >
                {/* PHOTO CONTAINER */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white shadow-2xs flex-shrink-0 bg-white flex items-center justify-center">
                  {student.img ? (
                    <Image
                      src={student.img}
                      alt={fullName}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#4e282c] via-[#802a2c] to-[#f16122] text-white flex items-center justify-center text-base font-black uppercase">
                      {fullName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate group-hover:text-[#4e282c] transition-colors">
                    {fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-slate-600">
                      Roll No. :{" "}
                      <span className="font-extrabold text-slate-900">
                        {student.rollNumber || (idx + 1)}
                      </span>
                    </span>
                    {student.className && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-white/80 text-slate-600 border border-slate-200/60">
                        {student.className}
                      </span>
                    )}
                  </div>
                </div>

                {/* VIEW ACTION */}
                <Link
                  href={`/list/students/${student.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl bg-white text-slate-600 hover:text-[#4e282c] shadow-2xs border border-slate-200/60"
                  title="View Student"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassRosterList;

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate, formatGrade, formatClassName } from "@/lib/utils";
import StudentAttendanceCalendarModal from "../StudentAttendanceCalendarModal";
import DashboardHeader from "./DashboardHeader";

interface ParentDashboardClientProps {
  students: any[];
  announcementsSlot: React.ReactNode;
  renderAttendanceCard: (studentId: string) => React.ReactNode;
  renderCalendar: (classId: number | string) => React.ReactNode;
}

const ParentDashboardClient: React.FC<ParentDashboardClientProps> = ({
  students,
  announcementsSlot,
  renderAttendanceCard,
  renderCalendar,
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [attendanceModalStudent, setAttendanceModalStudent] = useState<any | null>(null);

  const displayedStudents =
    selectedChildId === "all"
      ? students
      : students.filter((s) => s.id === selectedChildId);

  const tabs = [
    { id: "all", label: `All Children (${students.length})` },
    ...students.map((s, idx) => ({
      id: s.id,
      label: `${s.name} (${formatClassName(s.class?.name) || `Child ${idx + 1}`})`,
    })),
  ];

  return (
    <div className="p-3.5 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
      {/* 1. TOP HEADER */}
      <DashboardHeader
        name="Parent Portal"
        role="Parent / Guardian"
        subtitle="Real-time academics, attendance records & class schedules"
        academicYear="2026-27"
        tabs={students.length > 1 ? tabs : undefined}
        activeTab={selectedChildId}
        onTabChange={setSelectedChildId}
      />

      {/* 2. MAIN SPLIT LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT COLUMN: CHILDREN CARDS */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {displayedStudents.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                👨‍👧‍👦
              </div>
              <h3 className="text-base font-bold text-slate-700">No Student Records Found</h3>
              <p className="text-xs text-slate-400 max-w-md">
                No enrolled children are currently linked to this profile. Please contact the school administrative office.
              </p>
            </div>
          ) : (
            displayedStudents.map((student) => {
              const gradeName =
                student.grade?.level !== undefined
                  ? formatGrade(student.grade.level)
                  : formatGrade(student.class?.name);
              const className = formatClassName(student.class?.name) || "Not Assigned";
              const fullName = `${student.name} ${student.surname || ""}`.trim();

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col gap-5 p-4 sm:p-6 transition-all duration-200 hover:shadow-md"
                >
                  {/* HERO PROFILE CARD */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-xl border border-white/10 relative overflow-hidden group">
                    {/* Decorative Background Glow */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#f16122]/20 rounded-full blur-3xl pointer-events-none" />

                    {/* PHOTO */}
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#f16122]/60 via-white/20 to-white/5 border border-white/20 shadow-2xl">
                        <Image
                          src={student.img || "/noAvatar.png"}
                          alt={fullName}
                          width={112}
                          height={112}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-inner bg-slate-800"
                          priority
                        />
                        <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-xs uppercase tracking-wider">
                          Enrolled
                        </span>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 flex flex-col justify-between gap-3 w-full min-w-0 text-center sm:text-left z-10">
                      <div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#f16122] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-xs">
                            {gradeName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[10px] sm:text-[11px] font-bold tracking-wide backdrop-blur-xs border border-white/10">
                            Class {className}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] sm:text-[11px] font-bold border border-amber-400/30">
                            Roll No: {student.rollNumber || "N/A"}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                          {fullName}
                        </h2>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          User ID: <span className="text-white font-bold">{student.username}</span>
                        </p>
                      </div>

                      {/* METADATA CHIPS */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
                        <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-center sm:text-left">
                          <span className="text-[9px] text-white/60 uppercase block font-bold">Blood Group</span>
                          <span className="text-white font-bold">{student.bloodType || "-"}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-center sm:text-left">
                          <span className="text-[9px] text-white/60 uppercase block font-bold">Date of Birth</span>
                          <span className="text-white font-bold truncate block">{formatDate(student.birthday)}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1 text-center sm:text-left">
                          <span className="text-[9px] text-white/60 uppercase block font-bold">Gender</span>
                          <span className="text-white capitalize font-bold">{student.sex?.toLowerCase() || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ATTENDANCE & QUICK ACTION BUTTONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* ATTENDANCE CARD */}
                    <div
                      onClick={() => setAttendanceModalStudent(student)}
                      className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 flex gap-3.5 items-center cursor-pointer hover:bg-slate-100/70 transition-all group"
                      title="Click to view complete Attendance Calendar"
                    >
                      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Image
                          src="/singleAttendance.png"
                          alt="Attendance"
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renderAttendanceCard(student.id)}
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                            Attendance Status
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-black text-[#f16122] bg-[#fdece7] px-1.5 py-0.2 rounded-md group-hover:bg-[#f16122] group-hover:text-white transition-colors shadow-2xs">
                            Calendar ↗
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QUICK ACTION PORTALS */}
                    <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 flex flex-col justify-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Quick Academics
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/list/results?studentId=${student.id}`}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                        >
                          <span>📊</span>
                          <span>Results</span>
                        </Link>
                        <Link
                          href={student.classId ? `/list/assignments?classId=${student.classId}` : `/list/assignments`}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                        >
                          <span>📝</span>
                          <span>Homework</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setAttendanceModalStudent(student)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#f16122] text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
                        >
                          <span>📅</span>
                          <span>Attendance</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* WEEKLY CLASS SCHEDULE */}
                  <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#f16122]" />
                        Weekly Class Timetable ({className})
                      </h3>
                    </div>
                    <div className="h-[340px] sm:h-[450px] bg-slate-50 p-2 sm:p-3 rounded-2xl border border-slate-200/70 overflow-hidden">
                      {student.classId ? (
                        renderCalendar(student.classId)
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                          No class timetable assigned yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: ANNOUNCEMENTS */}
        <div className="flex flex-col gap-5">
          {announcementsSlot}
        </div>
      </div>

      {/* ATTENDANCE MODAL FOR PARENT */}
      {attendanceModalStudent && (
        <StudentAttendanceCalendarModal
          isOpen={Boolean(attendanceModalStudent)}
          onClose={() => setAttendanceModalStudent(null)}
          studentId={attendanceModalStudent.id}
          studentName={`${attendanceModalStudent.name} ${attendanceModalStudent.surname || ""}`.trim()}
          className={formatClassName(attendanceModalStudent.class?.name)}
          rollNumber={attendanceModalStudent.rollNumber}
        />
      )}
    </div>
  );
};

export default ParentDashboardClient;

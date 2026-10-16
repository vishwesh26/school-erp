"use client";

import React, { useState } from "react";
import Image from "next/image";
import DashboardHeader from "./DashboardHeader";
import QuickLauncherGrid, { LauncherTile } from "./QuickLauncherGrid";
import HomeworkCardList, { HomeworkItem } from "./HomeworkCardList";
import ClassRosterList, { RosterStudent } from "./ClassRosterList";
import { formatClassName, formatGrade } from "@/lib/utils";
import StudentAttendanceCalendarModal from "../StudentAttendanceCalendarModal";
import StudentAttendanceCalendarView from "../StudentAttendanceCalendarView";
import StudentAssessmentView from "../assessments/StudentAssessmentView";

interface StudentDashboardClientProps {
  student: any;
  lessonCount: number;
  homeworkItems: HomeworkItem[];
  classmates: RosterStudent[];
  attendanceSlot: React.ReactNode;
  scheduleSlot: React.ReactNode;
  calendarSlot: React.ReactNode;
  announcementsSlot: React.ReactNode;
  assessmentData?: any;
}

const StudentDashboardClient: React.FC<StudentDashboardClientProps> = ({
  student,
  lessonCount,
  homeworkItems,
  classmates,
  attendanceSlot,
  scheduleSlot,
  calendarSlot,
  announcementsSlot,
  assessmentData,
}) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAttendanceCalendar, setShowAttendanceCalendar] = useState<boolean>(false);

  const studentName = `${student?.name || "Student"} ${student?.surname || ""}`.trim();
  const className = formatClassName(student?.class?.name) || "-";
  const gradeLevel =
    student?.grade?.level !== undefined
      ? formatGrade(student.grade.level)
      : formatGrade(student?.class?.name);

  const tabs = [
    { id: "dashboard", label: "Dashboard", badge: homeworkItems.length || undefined },
    {
      id: "assessments",
      label: "Assessments & Quizzes",
      badge:
        assessmentData?.stats?.activeCount > 0
          ? `${assessmentData.stats.activeCount} Active`
          : assessmentData?.stats?.upcomingCount || undefined,
    },
    { id: "attendance", label: "Attendance Calendar" },
    { id: "schedule", label: "Timeline / Schedule" },
    { id: "class", label: "My Class", badge: classmates.length || undefined },
  ];

  // Quick action launcher tiles tailored for student (matching Demo 2)
  const launcherTiles: LauncherTile[] = [
    {
      id: "assessments",
      title: "Assessments",
      onClick: () => setActiveTab("assessments"),
      icon: "/exam.png",
      badge:
        assessmentData?.stats?.activeCount > 0
          ? `${assessmentData.stats.activeCount} Active`
          : assessmentData?.stats?.upcomingCount
          ? `${assessmentData.stats.upcomingCount} Due`
          : "Quizzes",
    },
    {
      id: "attendance",
      title: "Attendance",
      onClick: () => setShowAttendanceCalendar(true),
      icon: "/singleAttendance.png",
      badge: "Calendar",
    },
    {
      id: "homework",
      title: "Homework",
      href: "/list/assignments",
      icon: "/assignment.png",
      badge: homeworkItems.length > 0 ? `${homeworkItems.length} Due` : undefined,
    },
    {
      id: "results",
      title: "Result Sheet",
      href: "/list/results",
      icon: "/result.png",
    },
    {
      id: "timetable",
      title: "Timetable",
      onClick: () => setActiveTab("schedule"),
      icon: "/singleLesson.png",
    },
    {
      id: "myclass",
      title: "My Class",
      onClick: () => setActiveTab("class"),
      icon: "/singleClass.png",
      badge: classmates.length > 0 ? `${classmates.length}` : undefined,
    },
    {
      id: "circular",
      title: "Circular",
      href: "/list/announcements",
      icon: "/announcement.png",
    },
    {
      id: "library",
      title: "Library",
      href: "/student/library",
      icon: "/subject.png",
    },
    {
      id: "exams",
      title: "Exams",
      href: "/list/exams",
      icon: "/exam.png",
    },
    {
      id: "events",
      title: "Events",
      href: "/list/events",
      icon: "/calendar.png",
    },
    {
      id: "profile",
      title: "My Profile",
      href: "/profile",
      icon: "/profile.png",
    },
  ];

  const filteredTiles = launcherTiles.filter((tile) =>
    tile.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3.5 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
      {/* 1. TOP PROFILE HEADER & TABS (DEMO 1 & 2 STYLE) */}
      <DashboardHeader
        name={studentName}
        role="Student"
        identifier={student?.rollNumber ? `Roll No. ${student.rollNumber}` : undefined}
        subtitle={`${className} • ${gradeLevel}`}
        academicYear="2026-27"
        img={student?.img}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
      />

      {/* 2. TAB CONTENT */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* SUMMARY CARDS IN PASTEL THEME */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {/* ATTENDANCE CARD */}
            <div
              onClick={() => setShowAttendanceCalendar(true)}
              className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-md hover:border-slate-200 transition-all border-l-4 border-l-[#4e282c] cursor-pointer group"
              title="Click to view full Attendance Calendar"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#f4eaea] flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Image src="/singleAttendance.png" alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                {attendanceSlot}
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">Attendance</span>
                  <span className="text-[9px] sm:text-[10px] font-black text-[#f16122] bg-[#fdece7] px-1.5 py-0.5 rounded-md group-hover:bg-[#f16122] group-hover:text-white transition-colors shadow-2xs flex-shrink-0">
                    ↗
                  </span>
                </div>
              </div>
            </div>

            {/* GRADE CARD */}
            <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-sm transition-all border-l-4 border-l-[#f16122]">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#fdece7] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Image src="/singleBranch.png" alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">{gradeLevel}</h3>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5 truncate">Academic Grade</span>
              </div>
            </div>

            {/* LESSONS CARD */}
            <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-sm transition-all border-l-4 border-l-[#FAE27C]">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FEFCE8] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{lessonCount}</h3>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5 truncate">Lessons / Week</span>
              </div>
            </div>

            {/* CLASS CARD */}
            <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-sm transition-all border-l-4 border-l-sky-500">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Image src="/singleClass.png" alt="" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">{className}</h3>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5 truncate">Assigned Class</span>
              </div>
            </div>
          </div>

          {/* QUICK LAUNCHER TILES (DEMO 2 STYLE GRID) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6">
            <QuickLauncherGrid tiles={filteredTiles} columns={4} title="Student Services & Quick Actions" />
          </div>

          {/* SPLIT: HOMEWORK & ANNOUNCEMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: HOMEWORK CARDS (DEMO 4 STYLE) */}
            <div className="lg:col-span-2">
              <HomeworkCardList items={homeworkItems} title="Assigned Homework & Deadlines" />
            </div>

            {/* RIGHT: ANNOUNCEMENTS & CALENDAR */}
            <div className="flex flex-col gap-5">
              {calendarSlot}
              {announcementsSlot}
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSESSMENTS TAB */}
      {activeTab === "assessments" && assessmentData && (
        <div className="animate-fade-in flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab("dashboard")}
              type="button"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white"
            >
              ← Back to Dashboard
            </button>
          </div>
          <StudentAssessmentView
            initialQuizzes={assessmentData}
            studentId={student?.id || "student-1"}
            studentName={studentName}
            className={className}
            rollNumber={student?.rollNumber}
          />
        </div>
      )}

      {/* 4. ATTENDANCE CALENDAR TAB */}
      {activeTab === "attendance" && (
        <div className="animate-fade-in flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab("dashboard")}
              type="button"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white"
            >
              ← Back to Dashboard
            </button>
          </div>
          <StudentAttendanceCalendarView
            studentId={student?.id}
            studentName={studentName}
            className={className}
            rollNumber={student?.rollNumber}
          />
        </div>
      )}

      {/* 4. TIMELINE / SCHEDULE TAB */}
      {activeTab === "schedule" && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900">
                Weekly Class Timetable ({className})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                View your scheduled lectures, classrooms, and subject teachers
              </p>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              type="button"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              ← Back to Dashboard
            </button>
          </div>
          {scheduleSlot}
        </div>
      )}

      {/* 5. MY CLASS TAB (DEMO 5 STYLE) */}
      {activeTab === "class" && (
        <div className="animate-fade-in">
          <ClassRosterList students={classmates} title={`My Classmates (${className})`} />
        </div>
      )}

      {/* ATTENDANCE CALENDAR MODAL (Triggered via Attendance Button & Attendance Card) */}
      <StudentAttendanceCalendarModal
        isOpen={showAttendanceCalendar}
        onClose={() => setShowAttendanceCalendar(false)}
        studentId={student?.id}
        studentName={studentName}
        className={className}
        rollNumber={student?.rollNumber}
      />
    </div>
  );
};

export default StudentDashboardClient;

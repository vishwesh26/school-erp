"use client";

import React, { useState } from "react";
import Image from "next/image";
import DashboardHeader from "./DashboardHeader";
import QuickLauncherGrid, { LauncherTile } from "./QuickLauncherGrid";
import HomeworkCardList, { HomeworkItem } from "./HomeworkCardList";
import ClassRosterList, { RosterStudent } from "./ClassRosterList";
import MonthlyAttendanceModal from "../MonthlyAttendanceModal";
import { formatClassName } from "@/lib/utils";

interface TeacherDashboardClientProps {
  teacher: any;
  supervisedClass: any;
  lessonCount: number;
  homeworkItems: HomeworkItem[];
  classStudents: RosterStudent[];
  scheduleSlot: React.ReactNode;
  announcementsSlot: React.ReactNode;
  createLessonModalSlot?: React.ReactNode;
}

const TeacherDashboardClient: React.FC<TeacherDashboardClientProps> = ({
  teacher,
  supervisedClass,
  lessonCount,
  homeworkItems,
  classStudents,
  scheduleSlot,
  announcementsSlot,
  createLessonModalSlot,
}) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState<boolean>(false);

  const teacherName = `${teacher?.name || "Teacher"} ${teacher?.surname || ""}`.trim();
  const supervisedClassName = supervisedClass?.name
    ? formatClassName(supervisedClass.name)
    : undefined;

  const tabs = [
    { id: "dashboard", label: "Dashboard", badge: homeworkItems.length || undefined },
    { id: "schedule", label: "Timeline / Schedule", badge: lessonCount || undefined },
    ...(supervisedClass
      ? [{ id: "class", label: `My Class (${supervisedClassName})`, badge: classStudents.length || undefined }]
      : []),
  ];

  // Quick action launcher tiles tailored for teacher (matching Demo 2)
  const launcherTiles: LauncherTile[] = [
    {
      id: "attendance",
      title: "Attendance",
      href: "/list/attendance",
      icon: "/singleAttendance.png",
    },
    {
      id: "monthly_attendance",
      title: "Monthly Att. PDF",
      onClick: () => setIsMonthlyModalOpen(true),
      icon: "/singleAttendance.png",
      badge: "PDF",
    },
    {
      id: "homework",
      title: "Homework",
      href: "/list/assignments",
      icon: "/assignment.png",
      badge: homeworkItems.length > 0 ? `${homeworkItems.length}` : undefined,
    },
    {
      id: "schedule",
      title: "Schedule",
      onClick: () => setActiveTab("schedule"),
      icon: "/singleLesson.png",
    },
    {
      id: "exams",
      title: "Exams",
      href: "/list/exams",
      icon: "/exam.png",
    },
    {
      id: "results",
      title: "Results",
      href: "/list/results",
      icon: "/result.png",
    },
    ...(supervisedClass
      ? [
          {
            id: "myclass",
            title: "My Class",
            onClick: () => setActiveTab("class"),
            icon: "/singleClass.png",
            badge: classStudents.length > 0 ? `${classStudents.length}` : undefined,
          },
        ]
      : [
          {
            id: "classes",
            title: "Classes",
            href: "/list/classes",
            icon: "/class.png",
          },
        ]),
    {
      id: "students",
      title: "Students",
      href: "/list/students",
      icon: "/student.png",
    },
    {
      id: "circular",
      title: "Circular",
      href: "/list/announcements",
      icon: "/announcement.png",
    },
    {
      id: "events",
      title: "Events",
      href: "/list/events",
      icon: "/calendar.png",
    },
    {
      id: "promotion",
      title: "Promotion",
      href: "/list/promotion",
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
        name={teacherName}
        role="Faculty Member"
        identifier={teacher?.username || undefined}
        subtitle={
          supervisedClassName
            ? `Class Supervisor • ${supervisedClassName}`
            : "Teaching Staff"
        }
        academicYear="2026-27"
        img={teacher?.img}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
      />

      {/* 2. TAB CONTENT: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* WEEKLY LESSONS */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-all border-l-4 border-l-[#4e282c]">
              <div className="w-11 h-11 rounded-xl bg-[#f4eaea] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Image src="/singleLesson.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{lessonCount}</h3>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">Lessons / Week</span>
              </div>
            </div>

            {/* SUPERVISED CLASS */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-all border-l-4 border-l-[#f16122]">
              <div className="w-11 h-11 rounded-xl bg-[#fdece7] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Image src="/singleClass.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {supervisedClassName || "Subject Teacher"}
                </h3>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">Assigned Supervision</span>
              </div>
            </div>

            {/* ACTIVE HOMEWORK */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-all border-l-4 border-l-[#FAE27C]">
              <div className="w-11 h-11 rounded-xl bg-[#FEFCE8] flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Image src="/assignment.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{homeworkItems.length}</h3>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">Assigned Tasks</span>
              </div>
            </div>

            {/* CLASS STUDENTS */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-all border-l-4 border-l-emerald-500">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Image src="/student.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{classStudents.length || "-"}</h3>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mt-0.5">Students Enrolled</span>
              </div>
            </div>
          </div>

          {/* QUICK LAUNCHER TILES (DEMO 2 STYLE GRID) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6">
            <QuickLauncherGrid tiles={filteredTiles} columns={4} title="Teacher Services & Quick Actions" />
          </div>

          {/* SPLIT: RECENT HOMEWORK & ANNOUNCEMENTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT: HOMEWORK CREATED (DEMO 4 STYLE) */}
            <div className="lg:col-span-2">
              <HomeworkCardList items={homeworkItems} title="Recently Assigned Homework" />
            </div>

            {/* RIGHT: ANNOUNCEMENTS */}
            <div>
              {announcementsSlot}
            </div>
          </div>
        </div>
      )}

      {/* 3. TIMELINE / SCHEDULE TAB */}
      {activeTab === "schedule" && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900">
                My Teaching Timetable & Schedule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click on any lecture to update timing, or add a new scheduled slot
              </p>
            </div>
            <div className="flex items-center gap-3">
              {createLessonModalSlot}
              <button
                onClick={() => setActiveTab("dashboard")}
                type="button"
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
          {scheduleSlot}
        </div>
      )}

      {/* 4. MY CLASS TAB (DEMO 5 STYLE) */}
      {activeTab === "class" && (
        <div className="animate-fade-in">
          <ClassRosterList
            students={classStudents}
            title={`My Supervised Class Roster (${supervisedClassName})`}
            actionSlot={
              <MonthlyAttendanceModal
                initialClassId={supervisedClass?.id}
                initialClassName={supervisedClass?.name}
                buttonVariant="compact"
                triggerLabel="Monthly Attendance PDF"
              />
            }
          />
        </div>
      )}

      {/* Controlled Monthly Attendance Modal for Quick Launcher Grid */}
      <MonthlyAttendanceModal
        isOpen={isMonthlyModalOpen}
        onClose={() => setIsMonthlyModalOpen(false)}
        showTrigger={false}
        initialClassId={supervisedClass?.id}
        initialClassName={supervisedClass?.name}
      />
    </div>
  );
};

export default TeacherDashboardClient;

"use client";

import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import QuickLauncherGrid, { LauncherTile } from "./QuickLauncherGrid";

interface AdminDashboardClientProps {
  userCardsSlot: React.ReactNode;
  countChartSlot: React.ReactNode;
  attendanceChartSlot: React.ReactNode;
  eventCalendarSlot: React.ReactNode;
  announcementsSlot: React.ReactNode;
}

const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  userCardsSlot,
  countChartSlot,
  attendanceChartSlot,
  eventCalendarSlot,
  announcementsSlot,
}) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const tabs = [
    { id: "dashboard", label: "Dashboard Overview" },
    { id: "launcher", label: "Quick Launcher Grid", badge: "16" },
  ];

  // 16 Admin quick action launcher tiles (matching Demo 2 grid)
  const adminLauncherTiles: LauncherTile[] = [
    {
      id: "students",
      title: "Students",
      href: "/list/students",
      icon: "/student.png",
    },
    {
      id: "teachers",
      title: "Teachers",
      href: "/list/teachers",
      icon: "/teacher.png",
    },
    {
      id: "classes",
      title: "Classes",
      href: "/list/classes",
      icon: "/class.png",
    },
    {
      id: "finance",
      title: "Finance & Fees",
      href: "/list/finance",
      icon: "/finance.png",
    },
    {
      id: "attendance",
      title: "Attendance",
      href: "/list/attendance",
      icon: "/attendance.png",
    },
    {
      id: "exams",
      title: "Exams",
      href: "/list/exams",
      icon: "/exam.png",
    },
    {
      id: "lessons",
      title: "Lessons & Timetable",
      href: "/list/lessons",
      icon: "/lesson.png",
    },
    {
      id: "results",
      title: "Results",
      href: "/list/results",
      icon: "/result.png",
    },
    {
      id: "parents",
      title: "Parents",
      href: "/list/parents",
      icon: "/parent.png",
    },
    {
      id: "librarians",
      title: "Library",
      href: "/list/librarians",
      icon: "/subject.png",
    },
    {
      id: "announcements",
      title: "Circulars",
      href: "/list/announcements",
      icon: "/announcement.png",
    },
    {
      id: "inquiries",
      title: "Admissions Inquiry",
      href: "/list/inquiries",
      icon: "/assignment.png",
    },
    {
      id: "documents",
      title: "Documents",
      href: "/admin/documents",
      icon: "/view.png",
    },
    {
      id: "promotion",
      title: "Promotion",
      href: "/list/promotion",
      icon: "/calendar.png",
    },
    {
      id: "register",
      title: "Registration",
      href: "/register",
      icon: "/student.png",
    },
    {
      id: "settings",
      title: "Settings",
      href: "/settings",
      icon: "/setting.png",
    },
  ];

  const filteredTiles = adminLauncherTiles.filter((tile) =>
    tile.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3.5 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
      {/* 1. TOP HEADER BANNER (DEMO 1 & 2 STYLE) */}
      <DashboardHeader
        name="Administrator"
        role="Admin"
        subtitle="Dr. Cyrus Poonawalla School ERP"
        academicYear="2026-27"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
      />

      {/* 2. TAB CONTENT */}
      {activeTab === "dashboard" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* USER CARDS ROW */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#4e282c]/70 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4e282c] animate-pulse"></span>
                School Community Overview
              </h2>
            </div>
            {userCardsSlot}
          </div>

          {/* QUICK LAUNCHER TILES (PREVIEW ON DASHBOARD) */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6">
            <QuickLauncherGrid
              tiles={filteredTiles.slice(0, 8)}
              columns={4}
              title="Quick Access Portals"
            />
          </div>

          {/* MAIN CHARTS & WIDGETS */}
          <div className="flex gap-5 flex-col lg:flex-row">
            {/* LEFT: CHARTS */}
            <div className="w-full lg:w-2/3 flex flex-col gap-5">
              <div className="flex gap-5 flex-col lg:flex-row">
                {/* COUNT CHART */}
                <div className="w-full lg:w-1/3 h-[450px]">
                  {countChartSlot}
                </div>
                {/* ATTENDANCE CHART */}
                <div className="w-full lg:w-2/3 h-[450px]">
                  {attendanceChartSlot}
                </div>
              </div>
            </div>

            {/* RIGHT: CALENDAR & ANNOUNCEMENTS */}
            <div className="w-full lg:w-1/3 flex flex-col gap-5">
              {eventCalendarSlot}
              {announcementsSlot}
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL LAUNCHER TAB (DEMO 2 STYLE) */}
      {activeTab === "launcher" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 animate-fade-in">
          <QuickLauncherGrid
            tiles={filteredTiles}
            columns={4}
            title="All Administrative Modules & Services"
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboardClient;

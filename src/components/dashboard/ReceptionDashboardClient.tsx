"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardHeader from "./DashboardHeader";
import QuickLauncherGrid, { LauncherTile } from "./QuickLauncherGrid";

interface ReceptionDashboardClientProps {
  userCardsSlot: React.ReactNode;
  inquiriesSlot: React.ReactNode;
  calendarSlot: React.ReactNode;
  announcementsSlot: React.ReactNode;
}

const ReceptionDashboardClient: React.FC<ReceptionDashboardClientProps> = ({
  userCardsSlot,
  inquiriesSlot,
  calendarSlot,
  announcementsSlot,
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const tabs = [
    { id: "overview", label: "Front Desk Overview" },
    { id: "inquiries", label: "Inquiries & Admissions" },
    { id: "calendar", label: "Calendar & Events" },
  ];

  const launcherTiles: LauncherTile[] = [
    {
      id: "inquiries",
      title: "Inquiries",
      href: "/list/inquiries",
      icon: "/announcement.png",
      badge: "Admissions",
    },
    {
      id: "students",
      title: "Students",
      href: "/list/students",
      icon: "/student.png",
    },
    {
      id: "teachers",
      title: "Faculty Staff",
      href: "/list/teachers",
      icon: "/teacher.png",
    },
    {
      id: "parents",
      title: "Parents",
      href: "/list/parents",
      icon: "/parent.png",
    },
    {
      id: "events",
      title: "School Events",
      href: "/list/events",
      icon: "/calendar.png",
    },
    {
      id: "circulars",
      title: "Circulars",
      href: "/list/announcements",
      icon: "/announcement.png",
    },
  ];

  const filteredTiles = launcherTiles.filter((tile) =>
    tile.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3.5 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full">
      {/* 1. TOP HEADER */}
      <DashboardHeader
        name="Front Desk & Reception"
        role="Front Office Desk"
        subtitle="Visitor Inquiries, Admissions & Campus Calendar"
        academicYear="2026-27"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
      />

      {/* 2. USER STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {userCardsSlot}
      </div>

      {/* 3. QUICK ACTION LAUNCHER TILES */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6">
        <QuickLauncherGrid tiles={filteredTiles} columns={3} title="Reception Services & Quick Actions" />
      </div>

      {/* 4. SPLIT: INQUIRIES & CALENDAR */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT: INQUIRIES TABLE */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f16122]" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Recent Inquiries
                </h2>
              </div>
              <Link
                href="/list/inquiries"
                className="text-xs font-bold text-[#f16122] hover:text-[#4e282c] transition-colors"
              >
                View All Inquiries →
              </Link>
            </div>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              {inquiriesSlot}
            </div>
          </div>
        </div>

        {/* RIGHT: CALENDAR & ANNOUNCEMENTS */}
        <div className="flex flex-col gap-5">
          {calendarSlot}
          {announcementsSlot}
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboardClient;

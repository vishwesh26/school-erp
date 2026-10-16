"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardHeader from "./DashboardHeader";
import QuickLauncherGrid, { LauncherTile } from "./QuickLauncherGrid";

interface AccountantDashboardClientProps {
  stats: {
    totalToday: number;
    totalMonth: number;
    totalPending: number;
    totalExpenses: number;
  };
  chartsSlot: React.ReactNode;
  announcementsSlot: React.ReactNode;
}

const AccountantDashboardClient: React.FC<AccountantDashboardClientProps> = ({
  stats,
  chartsSlot,
  announcementsSlot,
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const tabs = [
    { id: "overview", label: "Financial Overview" },
    { id: "fees", label: "Fee Collections", badge: `₹${stats.totalToday}` },
    { id: "dues", label: "Pending Dues", badge: "Urgent" },
    { id: "expenses", label: "Expenses" },
  ];

  const launcherTiles: LauncherTile[] = [
    {
      id: "collect_fee",
      title: "Fee Register",
      href: "/list/fees",
      icon: "/finance.png",
      badge: "Collect",
    },
    {
      id: "pending_fees",
      title: "Pending Dues",
      href: "/list/fees?status=pending",
      icon: "/finance.png",
      badge: `₹${stats.totalPending}`,
    },
    {
      id: "expenses",
      title: "Expenses",
      href: "/list/expenses",
      icon: "/finance.png",
      badge: `₹${stats.totalExpenses}`,
    },
    {
      id: "students",
      title: "Student Accounts",
      href: "/list/students",
      icon: "/student.png",
    },
    {
      id: "circular",
      title: "Circulars",
      href: "/list/announcements",
      icon: "/announcement.png",
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
      {/* 1. TOP HEADER */}
      <DashboardHeader
        name="Finance & Accounts"
        role="Accounts Officer"
        subtitle="Fee Collections, Pending Dues & Expense Ledgers"
        academicYear="2026-27"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearchChange={setSearchTerm}
      />

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* COLLECTED TODAY */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-md transition-all border-l-4 border-l-emerald-500">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-700 font-black text-sm sm:text-base shadow-2xs">
            ₹
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                Today
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                Collected
              </span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
              ₹{stats.totalToday.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* FEES THIS MONTH */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-md transition-all border-l-4 border-l-[#f16122]">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#fdece7] flex items-center justify-center flex-shrink-0 text-[#f16122] font-black text-sm sm:text-base shadow-2xs">
            ₹
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                Month
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-[#f16122] bg-[#fdece7] px-1.5 py-0.2 rounded-md">
                Total
              </span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
              ₹{stats.totalMonth.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* TOTAL PENDING */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-md transition-all border-l-4 border-l-rose-500">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-rose-600 font-black text-sm sm:text-base shadow-2xs">
            ⚠️
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                Pending
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-md">
                Dues
              </span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-rose-600 tracking-tight mt-0.5 truncate">
              ₹{stats.totalPending.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* EXPENSES MONTH */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5 hover:shadow-md transition-all border-l-4 border-l-amber-500">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-700 font-black text-sm sm:text-base shadow-2xs">
            📉
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                Expenses
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-md">
                Month
              </span>
            </div>
            <h3 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 truncate">
              ₹{stats.totalExpenses.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION LAUNCHER TILES */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6">
        <QuickLauncherGrid tiles={filteredTiles} columns={3} title="Financial Operations & Quick Access" />
      </div>

      {/* 4. CHARTS & ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 flex flex-col gap-5">
          {chartsSlot}
        </div>
        <div className="flex flex-col gap-5">
          {announcementsSlot}
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboardClient;

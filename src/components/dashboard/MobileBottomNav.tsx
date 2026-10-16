"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface MobileBottomNavProps {
  role?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ role = "student" }) => {
  const pathname = usePathname();

  // Role-based home path
  const homePath =
    role === "admin"
      ? "/admin"
      : role === "teacher"
      ? "/teacher"
      : role === "parent"
      ? "/parent"
      : role === "accountant"
      ? "/accountant"
      : role === "receptionist"
      ? "/reception"
      : "/student";

  // Navigation items customized per role
  const getNavItems = () => {
    switch (role) {
      case "admin":
        return [
          { label: "Dashboard", href: "/admin", icon: "/home.png" },
          { label: "Students", href: "/list/students", icon: "/student.png" },
          { label: "Attendance", href: "/list/attendance", icon: "/attendance.png" },
          { label: "Circulars", href: "/list/announcements", icon: "/announcement.png" },
          { label: "Settings", href: "/settings", icon: "/setting.png" },
        ];
      case "teacher":
        return [
          { label: "Home", href: "/teacher", icon: "/home.png" },
          { label: "Attendance", href: "/list/attendance", icon: "/singleAttendance.png" },
          { label: "Timetable", href: "/list/lessons", icon: "/singleLesson.png" },
          { label: "Homework", href: "/list/assignments", icon: "/assignment.png" },
          { label: "Profile", href: "/profile", icon: "/profile.png" },
        ];
      case "parent":
        return [
          { label: "Children", href: "/parent", icon: "/home.png" },
          { label: "Finance", href: "/list/finance", icon: "/finance.png" },
          { label: "Circulars", href: "/list/announcements", icon: "/announcement.png" },
          { label: "Profile", href: "/profile", icon: "/profile.png" },
        ];
      case "accountant":
        return [
          { label: "Dashboard", href: "/accountant", icon: "/home.png" },
          { label: "Finance", href: "/list/finance", icon: "/finance.png" },
          { label: "Circulars", href: "/list/announcements", icon: "/announcement.png" },
          { label: "Profile", href: "/profile", icon: "/profile.png" },
        ];
      case "receptionist":
        return [
          { label: "Home", href: "/reception", icon: "/home.png" },
          { label: "Inquiries", href: "/list/inquiries", icon: "/assignment.png" },
          { label: "Circulars", href: "/list/announcements", icon: "/announcement.png" },
          { label: "Profile", href: "/profile", icon: "/profile.png" },
        ];
      default: // student
        return [
          { label: "Home", href: "/student", icon: "/home.png" },
          { label: "Homework", href: "/list/assignments", icon: "/assignment.png" },
          { label: "Timetable", href: "/list/lessons", icon: "/singleLesson.png" },
          { label: "Results", href: "/list/results", icon: "/result.png" },
          { label: "Profile", href: "/profile", icon: "/profile.png" },
        ];
    }
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === homePath) return pathname === homePath;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none safe-bottom"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 min-w-[58px] active:scale-95 ${
                active
                  ? "text-[#4e282c] font-black"
                  : "text-slate-400 font-semibold hover:text-slate-600"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-tr from-[#4e282c] to-[#f16122] text-white shadow-md shadow-[#4e282c]/20 scale-105"
                    : "bg-transparent group-hover:bg-slate-100"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={`object-contain transition-all duration-200 ${
                    active ? "brightness-0 invert" : "opacity-60"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-[62px] ${
                  active ? "font-black text-[#4e282c]" : "font-semibold text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/constants";

const Menu = ({ role }: { role: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    if (href === "/admin" || href === "/teacher" || href === "/student" || href === "/parent") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="mt-3 text-sm w-full select-none">
      {/* MOBILE MENU TOGGLE - VISIBLE ON MOBILE ONLY */}
      <div className="lg:hidden mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 w-full justify-between ${
            isOpen
              ? "border-rose-200 bg-rose-50/90 text-rose-600 shadow-rose-100"
              : "border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50 text-slate-700 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1 w-4">
              <span className={`h-0.5 w-full rounded-full transition-all ${isOpen ? "bg-rose-500 rotate-45 translate-y-1.5" : "bg-slate-600"}`}></span>
              <span className={`h-0.5 w-full rounded-full transition-all ${isOpen ? "opacity-0" : "bg-slate-600"}`}></span>
              <span className={`h-0.5 w-full rounded-full transition-all ${isOpen ? "bg-rose-500 -rotate-45 -translate-y-1.5" : "bg-slate-600"}`}></span>
            </div>
            <span className="font-extrabold tracking-wide">{isOpen ? "Close Navigation" : "Quick Menu"}</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-500">
            {role}
          </span>
        </button>
      </div>

      {/* MENU LIST - TOGGLEABLE ON MOBILE, ALWAYS VISIBLE ON LG */}
      <div className={`${isOpen ? "block" : "hidden lg:block"} transition-all duration-300 space-y-4`}>
        {menuItems.map((i) => (
          <div className="flex flex-col gap-1" key={i.title}>
            {/* GROUP HEADER */}
            <div className="flex items-center gap-2 mt-4 mb-2 pl-2 pr-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 shadow-2xs"></span>
              <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest">
                {i.title}
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-100 to-transparent"></div>
            </div>

            {i.items.map((item) => {
              if (item.visible.includes(role)) {
                const active = isLinkActive(item.href);

                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    onClick={() => setIsOpen(false)}
                    className={`relative flex items-center justify-between text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all duration-200 group font-semibold border-l-4 ${
                      active
                        ? "bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-transparent text-indigo-700 border-indigo-600 shadow-xs shadow-indigo-100/50 pl-3.5"
                        : "text-slate-600 border-transparent hover:border-sky-400 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1.5 active:scale-95"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg transition-all duration-300 flex items-center justify-center ${
                        active
                          ? "bg-white shadow-xs border border-indigo-200/80 scale-110"
                          : "group-hover:scale-115 group-hover:rotate-6 group-hover:bg-sky-50"
                      }`}>
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={18}
                          height={18}
                          className="transition-transform duration-200 object-contain"
                        />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* ACTIVE INDICATOR DOT */}
                    {active && (
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                      </span>
                    )}
                  </Link>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;

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
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 shadow-md active:scale-95 w-full justify-between ${
            isOpen
              ? "border-rose-200 bg-rose-50/90 text-rose-600 shadow-rose-100"
              : "border-[#4e282c]/20 bg-gradient-to-r from-[#4e282c] via-[#802a2c] to-[#f16122] text-white shadow-[#f16122]/20 hover:opacity-95"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1 w-4">
              <span className={`h-0.5 w-full rounded-full transition-all ${isOpen ? "bg-rose-500 rotate-45 translate-y-1.5" : "bg-white"}`}></span>
              <span className={`h-0.5 w-full rounded-full transition-all ${isOpen ? "opacity-0" : "bg-white"}`}></span>
              <span className={`h-0.5 w-full rounded-full transition-all ${isOpen ? "bg-rose-500 -rotate-45 -translate-y-1.5" : "bg-white"}`}></span>
            </div>
            <span className="font-black tracking-wide uppercase text-[11px]">{isOpen ? "Close Navigation" : "Quick Menu"}</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white">
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
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#4e282c] to-[#f16122] shadow-xs shadow-[#f16122]/40 animate-pulse"></span>
              <span className="text-[#4e282c]/60 font-black uppercase text-[10px] tracking-widest">
                {i.title}
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#f16122]/20 to-transparent"></div>
            </div>

            {i.items.map((item) => {
              if (item.visible.includes(role)) {
                const active = isLinkActive(item.href);

                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    onClick={() => setIsOpen(false)}
                    className={`relative flex items-center justify-between text-xs sm:text-sm py-2.5 px-3 rounded-xl transition-all duration-300 group font-bold border-l-4 overflow-hidden ${
                      active
                        ? "bg-gradient-to-r from-[#4e282c]/15 via-[#f16122]/10 to-transparent text-[#4e282c] border-[#4e282c] shadow-xs shadow-[#4e282c]/10 pl-3.5"
                        : "text-slate-700 border-transparent hover:border-[#f16122] hover:bg-gradient-to-r hover:from-[#f4eaea]/80 hover:to-transparent hover:text-[#4e282c] hover:translate-x-2 active:scale-95"
                    }`}
                  >
                    {/* SHIMMER LIGHT LINE ON HOVER */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
                        active
                          ? "bg-white shadow-xs border border-[#f16122]/40 scale-110 shadow-[#f16122]/20"
                          : "group-hover:scale-125 group-hover:rotate-12 group-hover:bg-[#fdece7]"
                      }`}>
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={18}
                          height={18}
                          className="transition-transform duration-300 object-contain"
                        />
                      </div>
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>

                    {/* ACTIVE INDICATOR DOT (BRAND ORANGE & MAROON PING) */}
                    {active && (
                      <span className="relative flex h-2.5 w-2.5 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f16122] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4e282c]"></span>
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

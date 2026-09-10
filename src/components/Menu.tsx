"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/constants";

interface UserInfo {
  name: string;
  img?: string | null;
  identifier?: string | null;
  role: string;
}

const Menu = ({ role, userInfo }: { role: string; userInfo?: UserInfo }) => {
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
    <div className="text-sm w-full select-none">
      {/* MOBILE MENU TOGGLE - VISIBLE ON MOBILE ONLY */}
      <div className="lg:hidden mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-200 shadow-xs active:scale-95 w-full justify-between ${
            isOpen
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-[#4e282c]/20 bg-gradient-to-r from-[#4e282c] via-[#802a2c] to-[#f16122] text-white shadow-md shadow-[#4e282c]/20 hover:opacity-95"
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

      {/* DRAWER BODY */}
      <div className={`${isOpen ? "block" : "hidden lg:block"} transition-all duration-300 space-y-3`}>
        {/* PROFILE HEADER IN SIDEBAR (MATCHING DEMO IMAGES 1 & 3) */}
        {userInfo && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#4e282c] via-[#6a1f26] to-[#f16122] text-white shadow-xs mb-3 border border-white/15 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-white/30 bg-white/20 flex-shrink-0 flex items-center justify-center">
                {userInfo.img ? (
                  <Image
                    src={userInfo.img}
                    alt={userInfo.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-base font-black uppercase">
                    {userInfo.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black tracking-tight leading-tight truncate">
                  {userInfo.name}
                </h4>
                {userInfo.identifier && (
                  <p className="text-[10px] font-bold text-[#FAE27C] tracking-wide mt-0.5">
                    {userInfo.identifier}
                  </p>
                )}
                <p className="text-[9px] font-semibold text-white/80 tracking-wider uppercase mt-0.5">
                  2026-27
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/15 text-[9px] font-bold text-white/90 truncate">
              Dr. Cyrus Poonawalla School
            </div>
          </div>
        )}

        {/* MENU LIST */}
        {menuItems.map((i) => (
          <div className="flex flex-col gap-1" key={i.title}>
            {/* GROUP HEADER */}
            <div className="flex items-center gap-2 mt-3 mb-1 pl-2 pr-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f16122]"></span>
              <span className="text-[#4e282c]/70 font-black uppercase text-[10px] tracking-widest">
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
                    className={`relative flex items-center justify-between text-xs sm:text-sm py-2 px-2.5 rounded-xl transition-all duration-200 group font-bold overflow-hidden ${
                      active
                        ? "bg-[#4e282c] text-white shadow-xs shadow-[#4e282c]/20"
                        : "text-slate-700 hover:bg-[#f4eaea]/80 hover:text-[#4e282c] active:scale-98"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#f4eaea]/60 group-hover:bg-[#fdece7]"
                        }`}
                      >
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={16}
                          height={16}
                          className={`object-contain transition-transform duration-200 ${
                            active ? "brightness-200 invert" : "group-hover:scale-110"
                          }`}
                        />
                      </div>
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>

                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FAE27C]"></span>
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

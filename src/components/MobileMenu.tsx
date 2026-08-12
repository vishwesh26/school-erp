"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/constants";

const MobileMenu = ({ role }: { role: string }) => {
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
        <div className="lg:hidden w-full select-none">
            {/* TOGGLE BUTTON */}
            <button
                className="flex items-center justify-between gap-3 py-2.5 px-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-md shadow-indigo-200/50 hover:opacity-95 active:scale-95 transition-all w-full"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex flex-col gap-1 w-4">
                        <div className="h-0.5 w-full bg-white rounded-full"></div>
                        <div className="h-0.5 w-full bg-white rounded-full"></div>
                        <div className="h-0.5 w-full bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm tracking-wide font-extrabold">Open Portal Navigation</span>
                </div>
                <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {role || "User"}
                </span>
            </button>

            {/* FULL SCREEN MENU OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex flex-col overflow-hidden animate-fadeIn">
                    <div className="flex-1 bg-white/95 backdrop-blur-xl flex flex-col h-full max-w-lg w-full ml-auto shadow-2xl">
                        {/* MENU HEADER */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="p-1 bg-slate-50 border border-slate-200/80 rounded-xl">
                                    <Image src="/logo.png" alt="logo" width={32} height={32} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-slate-800 text-base">DCPEMS ERP</span>
                                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Navigation Menu</span>
                                </div>
                            </div>
                            {/* THE CROSS BUTTON */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-full border border-rose-100 active:scale-90 transition-all font-bold"
                                aria-label="Close menu"
                            >
                                <span className="text-xl">✕</span>
                            </button>
                        </div>

                        {/* MENU ITEMS - SCROLLABLE CONTENT */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                            <div className="flex flex-col gap-5">
                                {menuItems.map((group) => (
                                    <div key={group.title} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 pl-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                            <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
                                                {group.title}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5">
                                            {group.items.map((item) => {
                                                if (item.visible.includes(role)) {
                                                    const active = isLinkActive(item.href);
                                                    return (
                                                        <Link
                                                            href={item.href}
                                                            key={item.label}
                                                            onClick={() => setIsOpen(false)}
                                                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                                                                active
                                                                    ? "bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-transparent border-indigo-500/40 text-indigo-700 font-bold shadow-xs"
                                                                    : "bg-white text-slate-700 border-slate-100 font-semibold hover:bg-slate-50 active:scale-98"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3.5">
                                                                <div className={`p-1.5 rounded-lg ${active ? "bg-white border border-indigo-200" : "bg-slate-50"}`}>
                                                                    <Image src={item.icon} alt="" width={20} height={20} />
                                                                </div>
                                                                <span className="text-sm">{item.label}</span>
                                                            </div>
                                                            {active && (
                                                                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                                                            )}
                                                        </Link>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BOTTOM QUICK ACTION */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <span>CLOSE NAVIGATION</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileMenu;

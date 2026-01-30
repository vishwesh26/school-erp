"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { menuItems } from "@/lib/constants";

const MobileMenu = ({ role }: { role: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="lg:hidden w-full">
            {/* TOGGLE BUTTON - Below Logo (as placed in Layout) */}
            <button
                className="flex items-center gap-2 py-2 px-4 bg-lamaPurple text-white rounded-lg font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex flex-col gap-1 w-5">
                    <div className="h-0.5 w-full bg-white rounded-full"></div>
                    <div className="h-0.5 w-full bg-white rounded-full"></div>
                    <div className="h-0.5 w-full bg-white rounded-full"></div>
                </div>
                <span>Open Menu</span>
            </button>

            {/* FULL SCREEN MENU OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 bg-white z-[9999] flex flex-col overflow-hidden">
                    {/* MENU HEADER */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.png" alt="logo" width={32} height={32} />
                            <span className="font-bold text-lg">DCPEMS</span>
                        </div>
                        {/* THE CROSS BUTTON */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-full border border-red-100 active:scale-90 transition-all"
                            aria-label="Close menu"
                        >
                            <span className="text-2xl font-bold">✕</span>
                        </button>
                    </div>

                    {/* MENU ITEMS - SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                        <div className="flex flex-col gap-6">
                            {menuItems.map((group) => (
                                <div key={group.title} className="flex flex-col gap-3">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest pl-2">
                                        {group.title}
                                    </span>
                                    <div className="grid grid-cols-1 gap-1">
                                        {group.items.map((item) => {
                                            if (item.visible.includes(role)) {
                                                return (
                                                    <Link
                                                        href={item.href}
                                                        key={item.label}
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-4 text-gray-700 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-lamaSkyLight transition-colors"
                                                    >
                                                        <Image src={item.icon} alt="" width={22} height={22} />
                                                        <span className="font-semibold">{item.label}</span>
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
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span>CLOSE MENU</span>
                            <span className="text-xl">✕</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileMenu;

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { menuItems } from "@/lib/constants";

const Menu = ({ role }: { role: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 text-sm w-full">
      {/* MOBILE MENU TOGGLE - VISIBLE ON MOBILE ONLY */}
      <div className="lg:hidden mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-bold transition-all shadow-sm active:scale-95 w-fit ${isOpen
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-gray-200 bg-gray-50 text-gray-700"
            }`}
        >
          {isOpen ? (
            "Close"
          ) : (
            <>
              <div className="flex flex-col gap-0.5 w-3">
                <div className="h-0.5 w-full bg-gray-600 rounded-full"></div>
                <div className="h-0.5 w-full bg-gray-600 rounded-full"></div>
                <div className="h-0.5 w-full bg-gray-600 rounded-full"></div>
              </div>
              <span>Menu</span>
            </>
          )}
        </button>
      </div>

      {/* MENU LIST - TOGGLEABLE ON MOBILE, ALWAYS VISIBLE ON LG */}
      <div className={`${isOpen ? "block" : "hidden lg:block"} transition-all duration-300`}>
        {menuItems.map((i) => (
          <div className="flex flex-col gap-2" key={i.title}>
            <span className="text-gray-400 font-light my-4 uppercase text-[10px] tracking-widest pl-2">
              {i.title}
            </span>
            {i.items.map((item) => {
              if (item.visible.includes(role)) {
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-start gap-4 text-gray-500 py-3 px-3 rounded-xl hover:bg-lamaSkyLight active:bg-lamaSky transition-all"
                  >
                    <Image src={item.icon} alt="" width={22} height={22} />
                    <span className="">{item.label}</span>
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

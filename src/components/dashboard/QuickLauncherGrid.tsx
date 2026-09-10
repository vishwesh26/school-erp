"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export type LauncherTile = {
  id: string;
  title: string;
  href?: string;
  onClick?: () => void;
  icon: string; // PNG or SVG path
  badge?: string | number;
  badgeColor?: "maroon" | "orange" | "yellow" | "green";
  color?: string;
};

interface QuickLauncherGridProps {
  tiles: LauncherTile[];
  columns?: 2 | 3 | 4 | 6;
  title?: string;
}

const QuickLauncherGrid: React.FC<QuickLauncherGridProps> = ({
  tiles,
  columns = 3,
  title = "Quick Actions",
}) => {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  }[columns];

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#4e282c]/70 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f16122] animate-pulse"></span>
            {title}
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">Tap to navigate</span>
        </div>
      )}

      <div className={`grid ${colClass} gap-3 sm:gap-4`}>
        {tiles.map((tile) => {
          const content = (
            <div className="relative w-full h-full bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden">
              {/* SHIMMER LIGHT ON HOVER */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fdece7]/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

              {/* BADGE INDICATOR */}
              {tile.badge !== undefined && (
                <span className="absolute top-2.5 right-2.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-[#f16122] text-white shadow-xs">
                  {tile.badge}
                </span>
              )}

              {/* ICON CONTAINER WITH PASTEL ACCENT BLOB (DEMO 2 STYLE) */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#f4eaea] via-[#fdece7] to-[#FEFCE8] flex items-center justify-center p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-2xs border border-[#4e282c]/10">
                <Image
                  src={tile.icon}
                  alt={tile.title}
                  width={30}
                  height={30}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* TITLE */}
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight mt-3 line-clamp-1 group-hover:text-[#4e282c] transition-colors">
                {tile.title}
              </span>
            </div>
          );

          if (tile.href) {
            return (
              <Link href={tile.href} key={tile.id} className="block w-full">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={tile.id}
              onClick={tile.onClick}
              type="button"
              className="w-full text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLauncherGrid;

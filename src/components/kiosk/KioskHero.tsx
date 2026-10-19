"use client";

import React from "react";
import { Store, PlusCircle, Sparkles, MapPin, Search } from "lucide-react";

interface KioskHeroProps {
  onOpenRegister: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  totalProjects: number;
}

export default function KioskHero({
  onOpenRegister,
  searchQuery,
  onSearchChange,
  totalProjects,
}: KioskHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#0c1222]/90 border border-slate-200/80 dark:border-indigo-500/20 p-6 sm:p-9 mb-8 shadow-sm backdrop-blur-xl transition-all">
      {/* Elegant Radial Gradients - Indigo & Violet Signature Theme */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Meta Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>كشك المشاريع</span>
          </div>

          {totalProjects > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {totalProjects} مشروع متاح
            </span>
          )}
        </div>

        {/* Hero Title & Description with balanced CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              مشاريع وإبداعات الطلبة
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400 mt-1">
                تصفح واطلب مباشرة من زملائك بالجامعة
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              منصة طلابية تفتح آفاق التسويق لمشاريع الطلبة (مأكولات، حلويات، أشغال يدوية، خدمات طلابية، وطباعة وتصوير). تواصل مع صاحب المشروع واطلب مباشرة عبر واتساب بكل سهولة ودون أي عمولات.
            </p>
          </div>

          {/* Action CTA Box */}
          <div className="shrink-0 flex sm:self-start lg:self-center">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>سجّل مشروعك</span>
            </button>
          </div>
        </div>

        {/* Integrated Clean Search Bar */}
        <div className="relative pt-2">
          <div className="relative flex items-center">
            <Search className="absolute right-4 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن مشروع، حلويات، خدمة، اسم الجامعة، أو اسم صاحب المشروع..."
              className="w-full pr-12 pl-4 py-3.5 bg-slate-50/80 dark:bg-[#070b14]/80 border border-slate-200 dark:border-white/10 rounded-2xl text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute left-3 px-2.5 py-1 text-xs rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

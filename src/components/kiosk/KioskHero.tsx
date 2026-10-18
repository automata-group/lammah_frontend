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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-5 sm:p-8 mb-6 shadow-sm">
      {/* Decorative Blur Spheres */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium">
            <Store className="w-3.5 h-3.5" />
            <span>كشك المشاريع الطلابية الجامعية</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            ادعم مشاريع زملاءك في الجامعة..
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500">
              واطلب واستلم وين ما كنت بالجامعة 🎓
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-300 leading-relaxed font-medium">
            منصة مخصصة لعرض إبداعات ومشاريع طلبة الجامعة (مأكولات، حلويات، أشغال يدوية، خدمات، وطباعة).
            تواصل واطلب مباشرة من صاحب المشروع عبر واتساب بكل سهولة ودون وسطاء.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{totalProjects > 0 ? `${totalProjects} مشروع نشط` : "مشاريع معتمدة"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>توصيل وتسليم داخل الحرم الجامعي</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-95 transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5" />
            <span>سجّل مشروعك مجاناً 🚀</span>
          </button>
        </div>
      </div>

      {/* Mobile-First Search Bar */}
      <div className="relative mt-6">
        <div className="relative flex items-center">
          <Search className="absolute right-4 w-5 h-5 text-slate-600 dark:text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن مشروع، منتج، حلويات، خدمة، أو اسم زميل..."
            className="w-full pr-12 pl-4 py-3.5 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-3 px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              مسح
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

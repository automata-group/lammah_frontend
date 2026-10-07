"use client";
import Link from "next/link";
import React from "react";
import { Instagram, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-10 py-12 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#02050e] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/lammah-logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain opacity-80" />
          <div>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">منصة لمّاح الذكية</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()} — إحدى ابتكارات <span className="text-indigo-600 dark:text-indigo-400 font-black">Automata</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
          <a
            href="https://instagram.com/lammah.site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-all hover:scale-105"
            title="حساب إنستغرام الرسمي لمنصة لمّاح"
          >
            <Instagram className="w-4 h-4" />
            <span dir="ltr">@lammah.site</span>
          </a>
          <Link href="/plans" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الباقات والأسعار</Link>
          <Link href="/marketplace" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">متجر الدفاتر</Link>
          <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الشروط والأحكام</Link>
          <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">سياسة الخصوصية</Link>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold shadow-xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title="الصعود إلى أعلى الصفحة"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>إلى أعلى الصفحة</span>
        </button>
      </div>
    </footer>
  );
}

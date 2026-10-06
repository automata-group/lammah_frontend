import Link from "next/link";
import React from "react";

export default function Footer() {
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
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-bold text-slate-600 dark:text-slate-400">
          <Link href="/plans" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الباقات والأسعار</Link>
          <Link href="/marketplace" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">متجر الدفاتر</Link>
          <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الشروط والأحكام</Link>
          <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">سياسة الخصوصية</Link>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import React from "react";
import { Instagram, ArrowUp, Sparkles, BookOpen, ShieldCheck } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-[#02050e]/90 backdrop-blur-xl text-right transition-colors" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        
        {/* Upper Tier: Clean Organized Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-10">
          
          {/* Brand Info (Span 6 on desktop) */}
          <div className="md:col-span-6 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/lammah-logo.png"
                alt="شعار لمّاح"
                width={40}
                height={40}
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <div>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
                  منصة لمّاح الذكية
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                  الرفيق الأكاديمي الشامل لطلاب الجامعات
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md">
              حوّل تفريغ محاضراتك الصوتية وسلايداتك إلى دفاتر دراسية منسقة، اختبارات تجريبية ذكية، وشات أكاديمي خصوصي يفهم أدق تفاصيل شرح دكتورك.
            </p>

            {/* Official Instagram Badge */}
            <a
              href="https://instagram.com/lammah.site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 dark:bg-pink-500/10 border border-pink-200/80 dark:border-pink-500/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-500/20 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xs"
              title="حساب إنستغرام الرسمي لمنصة لمّاح"
            >
              <Instagram className="w-4 h-4" />
              <span dir="ltr">@lammah.site</span>
            </a>
          </div>

          {/* Quick Links Column 1 (Span 3 on desktop) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>المنصة والخدمات</span>
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              <Link href="/#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                الباقات والأسعار
              </Link>
              <Link href="/kiosk" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                <span>كشك مشاريع الجامعة</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-full">جديد 🔥</span>
              </Link>
              <Link href="/marketplace" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                متجر الدفاتر الجامعية
              </Link>
              <Link href="/study" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                دوّن ملاحظاتك
              </Link>
              <Link href="/faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                الأسئلة الشائعة
              </Link>
            </div>
          </div>

          {/* Quick Links Column 2 (Span 3 on desktop) */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>المعلومات والدعم</span>
            </h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                الشروط والأحكام
              </Link>
              <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                سياسة الخصوصية
              </Link>
              <a
                href="https://instagram.com/lammah.site"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                الدعم الفني عبر إنستغرام
              </a>
            </div>
          </div>

        </div>

        {/* Lower Tier: Copyright & Scroll to Top */}
        <div className="border-t border-slate-200/80 dark:border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 text-center sm:text-right">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} منصة لمّاح — إحدى ابتكارات{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-black">Automata</span>
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs font-bold shadow-xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="الصعود إلى أعلى الصفحة"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>إلى أعلى الصفحة</span>
          </button>
        </div>

      </div>
    </footer>
  );
}

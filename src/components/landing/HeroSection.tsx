"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  Play, 
  Volume2,
  Brain,
  Zap,
  FileText
} from "lucide-react";

export default function HeroSection() {

  return (
    <section className="relative z-10 pt-14 sm:pt-24 lg:pt-28 pb-14 sm:pb-28 px-4 sm:px-6 max-w-5xl mx-auto text-center" dir="rtl">
      
      {/* ── Floating Decorative Ornaments ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 max-w-7xl mx-auto hidden md:block">
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] text-amber-400/60 dark:text-amber-500/40"
        >
          <Sparkles className="w-12 h-12 drop-shadow-xl" />
        </motion.div>
        
        <motion.div
          animate={{ y: [15, -10, 15], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-[8%] text-indigo-400/60 dark:text-indigo-500/40"
        >
          <Brain className="w-14 h-14 drop-shadow-xl" />
        </motion.div>
        
        <motion.div
          animate={{ y: [-5, 15, -5], rotate: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-72 right-[5%] text-pink-400/50 dark:text-pink-500/30"
        >
          <Zap className="w-10 h-10 drop-shadow-xl" />
        </motion.div>

        <motion.div
          animate={{ y: [10, -15, 10], rotate: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-80 left-[5%] text-blue-400/50 dark:text-blue-500/30"
        >
          <FileText className="w-12 h-12 drop-shadow-xl" />
        </motion.div>
      </div>

      {/* ── Top Catchphrase / Accent ─────────────────────────── */}
      <div className="mb-2 sm:mb-4">
        <span className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white inline-flex items-center justify-center gap-2 sm:gap-4 tracking-tight">
          <span>كُن</span>
          <span>ل<span className="text-amber-500">مّ</span>احاً</span>
        </span>
      </div>

      {/* ── 1. Punchy Main Headline ───────────────────────────────── */}
      <h1
        className="relative z-10 text-[2.75rem] leading-[1.3] xs:text-[3rem] xs:leading-[1.3] sm:text-6xl sm:leading-[1.3] lg:text-7xl lg:leading-[1.25] font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto"
      >
        <span className="block mb-2 sm:mb-3">
          <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2">
            <span>حوّل</span>
            <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400 opacity-90 relative">
              <motion.span 
                animate={{ y: [-2, 3, -2], rotate: [-6, 3, -6] }} 
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} 
                className="inline-block origin-bottom"
              >
                فو
              </motion.span>
              <motion.span 
                animate={{ y: [2, -3, 2], rotate: [5, -4, 5] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                className="inline-block origin-bottom"
              >
                ضى
              </motion.span>
            </span>
          </span>

          {/* Line 2 on Mobile (Inline on Desktop) */}
          <span className="block sm:inline sm:mr-3 mt-2 sm:mt-0">
            <span className="inline-flex items-center text-slate-900 dark:text-white">
              <span>الـ</span>
              <span className="inline-flex flex-col items-center justify-end -mx-0.5">
                {/* Two Dots of Taa */}
                <span className="flex gap-1 mb-1 sm:mb-1.5 translate-y-2 sm:translate-y-2.5 z-10">
                  <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2 sm:h-2 bg-slate-900 dark:bg-white rounded-xs sm:rounded-sm rotate-45"></span>
                  <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2 sm:h-2 bg-slate-900 dark:bg-white rounded-xs sm:rounded-sm rotate-45"></span>
                </span>
                {/* Waveform acting as the base of Taa - Uses GPU scaleY with origin-bottom to prevent layout shifts */}
                <span className="inline-flex items-end gap-[3px] xs:gap-1 sm:gap-1 h-8 xs:h-9 sm:h-11 lg:h-14 translate-y-0.5 sm:translate-y-1">
                  <motion.span animate={{ scaleY: [0.3, 0.8, 0.4, 1.0, 0.3] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }} className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full origin-bottom bg-indigo-500 rounded-full" />
                  <motion.span animate={{ scaleY: [0.5, 1.0, 0.3, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full origin-bottom bg-purple-500 rounded-full" />
                  <motion.span animate={{ scaleY: [0.8, 0.4, 1.0, 0.5, 0.8] }} transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }} className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full origin-bottom bg-pink-500 rounded-full" />
                  <motion.span animate={{ scaleY: [0.4, 0.9, 0.2, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }} className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full origin-bottom bg-amber-500 rounded-full" />
                </span>
              </span>
              <span>ـسجيلات</span>
            </span>
          </span>
        </span>

        {/* Line 3 on Mobile (Line 2 on Desktop) */}
        <span className="block mt-2 sm:mt-0 pt-4 pb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">
          إلى أعلى العلامات
        </span>
      </h1>

      {/* ── 2. Subtitle (Immediate Paint for 0ms LCP Delay) ─────── */}
      <p
        className="mt-7 sm:mt-6 text-xs sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed sm:leading-relaxed font-medium px-2 sm:px-0"
      >
        وداعاً لإضاعة الساعات في تفريغ المحاضرات يدوياً. حوّل تسجيلاتك وملفات الـ PDF فوراً إلى ملخصات فائقة الدقة، أسئلة امتحانات متوقعة، وشات ذكي يجيبك عن كل مسألة.
      </p>

      {/* ── 3. Action Buttons ─────────────────────────────────────── */}
      <div
        className="mt-8 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-[310px] sm:max-w-none mx-auto w-full"
      >
        <a
          href="/register"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-lg shadow-indigo-600/25 dark:shadow-[0_0_35px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          <span>سجل في لماح</span>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </a>

        <a
          href="#interactive-demo"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400 translate-x-0.5" />
          <span>جرب لماح مجانا</span>
        </a>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  ArrowLeft, 
  Play, 
  Brain, 
  Zap, 
  FileText,
  Loader2
} from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [isNavigatingAuth, setIsNavigatingAuth] = useState(false);

  useEffect(() => {
    router.prefetch("/auth");
    router.prefetch("/dashboard");
  }, [router]);

  return (
    <section className="relative z-10 pt-16 xs:pt-20 sm:pt-20 lg:pt-24 pb-20 xs:pb-24 sm:pb-28 px-4 sm:px-6 max-w-5xl mx-auto text-center" dir="rtl">
      
      {/* ── Floating Decorative Ornaments (Pure GPU CSS Animation - 0ms TBT) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 max-w-7xl mx-auto hidden md:block">
        <div className="absolute top-20 right-[10%] text-amber-400/60 dark:text-amber-500/40 animate-float-1">
          <Sparkles className="w-12 h-12 drop-shadow-xl" />
        </div>
        
        <div className="absolute top-32 left-[8%] text-indigo-400/60 dark:text-indigo-500/40 animate-float-2">
          <Brain className="w-14 h-14 drop-shadow-xl" />
        </div>
        
        <div className="absolute top-72 right-[5%] text-pink-400/50 dark:text-pink-500/30 animate-float-1" style={{ animationDelay: "1.5s" }}>
          <Zap className="w-10 h-10 drop-shadow-xl" />
        </div>

        <div className="absolute top-80 left-[5%] text-blue-400/50 dark:text-blue-500/30 animate-float-2" style={{ animationDelay: "2s" }}>
          <FileText className="w-12 h-12 drop-shadow-xl" />
        </div>
      </div>

      {/* ── Top Catchphrase / Accent ─────────────────────────── */}
      <div className="mb-3 sm:mb-5">
        <span className="text-[2.1rem] xs:text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white inline-flex items-center justify-center gap-2.5 sm:gap-4 tracking-tight">
          <span>كُن</span>
          <span>ل<span className="text-amber-500">مّ</span>احاً</span>
        </span>
      </div>

      {/* ── 1. Punchy Main Headline ───────────────────────────────── */}
      <h1
        className="relative z-10 text-[2.1rem] xs:text-[2.45rem] sm:text-5xl lg:text-6xl leading-[1.35] font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto"
      >
        <span className="block mb-2 sm:mb-3">
          <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2">
            <span>حوّل</span>
            <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400 opacity-90 relative">
              <span className="inline-block transform -rotate-3 text-indigo-600 dark:text-indigo-400 font-extrabold px-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-500/20">
                فوضى
              </span>
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
                {/* Waveform acting as the base of Taa - 100% GPU Keyframes to guarantee 0ms LCP & 0ms TBT */}
                <span className="inline-flex items-end gap-[3px] xs:gap-1 sm:gap-1 h-9 xs:h-10 sm:h-11 lg:h-14 translate-y-0.5 sm:translate-y-1">
                  <span className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full bg-indigo-500 rounded-full animate-wave-1" />
                  <span className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full bg-purple-500 rounded-full animate-wave-2" />
                  <span className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full bg-pink-500 rounded-full animate-wave-3" />
                  <span className="w-1.5 xs:w-2 sm:w-2.5 lg:w-3 h-full bg-amber-500 rounded-full animate-wave-4" />
                </span>
              </span>
              <span>ـسجيلات</span>
            </span>
          </span>
        </span>

        {/* Line 3 on Mobile (Line 2 on Desktop) */}
        <span className="block text-[1.4rem] xs:text-[1.75rem] sm:text-5xl lg:text-6xl whitespace-nowrap mt-1 sm:mt-0 pt-2 sm:pt-4 pb-2 sm:pb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">
          إلى أعلى العلامات
        </span>
      </h1>

      {/* ── 2. Subtitle (Immediate Paint for 0ms LCP Delay) ─────── */}
      <p
        className="mt-7 sm:mt-8 text-base xs:text-[17px] sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed sm:leading-relaxed font-medium px-3 sm:px-0"
      >
        وداعاً لإضاعة الساعات في تفريغ المحاضرات يدوياً. حوّل تسجيلاتك وملفات الـ PDF فوراً إلى ملخصات فائقة الدقة، أسئلة امتحانات متوقعة، وشات ذكي يجيبك عن كل مسألة.
      </p>

      {/* ── 3. Action Buttons ─────────────────────────────────────── */}
      <div
        className="mt-9 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-[340px] sm:max-w-none mx-auto w-full"
      >
        <Link
          href="/auth"
          prefetch={true}
          onClick={() => setIsNavigatingAuth(true)}
          className={`w-full sm:w-auto px-8 py-4 rounded-full font-black text-[15px] xs:text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg shadow-indigo-600/25 dark:shadow-[0_0_35px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer ${
            isNavigatingAuth
              ? "opacity-90 scale-98 pointer-events-none"
              : "hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isNavigatingAuth ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>جاري التحويل...</span>
            </>
          ) : (
            <>
              <span>سجل في لماح</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </>
          )}
        </Link>

        <a
          href="#interactive-demo"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('interactive-demo')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full sm:w-auto px-7 py-4 rounded-full font-bold text-[15px] xs:text-base text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400 translate-x-0.5" />
          <span>جرب لماح مجانا</span>
        </a>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Video, ArrowLeft, Calendar, ShieldCheck, Clock } from "lucide-react";
import AppHeader from "@/components/AppHeader";

export default function SessionsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white flex flex-col justify-between" dir="rtl">
      {/* Subtle Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200/40 dark:from-slate-800/30 via-transparent to-transparent" />
      </div>

      <AppHeader />

      <section className="relative z-10 flex-1 flex items-center justify-center py-10 px-4">
        <div className="max-w-lg w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white dark:bg-[#0C0F17] border border-slate-200 dark:border-white/10 p-7 sm:p-9 rounded-3xl text-center shadow-lg shadow-slate-900/5 relative overflow-hidden"
          >
            {/* Minimalist Top Sheen */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent" />

            {/* Clean Monochromatic Icon */}
            <div className="w-13 h-13 mx-auto mb-5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shadow-sm">
              <Video className="w-6 h-6" />
            </div>

            {/* Subtle Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold mb-4">
              <span>الحصص الخاصة والمراجعات الفردية • قريباً</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5 tracking-tight">
              حصصك وجلساتك الدراسية
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium max-w-md mx-auto">
              نعمل حالياً على تدقيق واعتماد نخبة من المعلمين المتميزين لإطلاق جلسات الشرح والمراجعة الفردية التفاعلية. ستتمكن من حجز حصصك ومتابعة مواعيدك وروابط لقاءاتك مباشرة من هنا فور الإطلاق الرسمي.
            </p>

            {/* Clean Unified Highlights (Monochrome SaaS look) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-7 text-right">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-0.5">شروحات مباشرة</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-snug">مراجعات فردية للمواد الصعبة</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-0.5">روابط فورية</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-snug">لقاءات مرئية مؤمنة وسريعة</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-0.5">أوائل معتمدين</div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-snug">متفوقين تم تدقيق علاماتهم</div>
              </div>
            </div>

            {/* Clean Professional Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>العودة للوحة التحكم</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/notebook"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all border border-slate-200/60 dark:border-white/5"
              >
                تصفح الدفتر والملخصات
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


    </main>
  );
}

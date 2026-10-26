"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Layers, ArrowLeft, CheckSquare, Loader2 } from "lucide-react";
import { StudentProfileData } from "@/types/dashboard";

interface DashboardHeroBannerProps {
  userFullName: string | null;
  userEmail?: string | null;
  studentProfileData: StudentProfileData | null;
  onOpenStudentProfileModal: () => void;
}

export default function DashboardHeroBanner({
  userFullName,
  userEmail,
  studentProfileData,
  onOpenStudentProfileModal,
}: DashboardHeroBannerProps) {
  const router = useRouter();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const displayName = userFullName || (userEmail ? userEmail.split("@")[0] : null) || "طالبنا";
  const isProfileCompleted = Boolean(studentProfileData?.university);

  // Eagerly prefetch all companion navigation routes for instantaneous 0ms transitions
  useEffect(() => {
    router.prefetch("/study");
    router.prefetch("/notebook");
    router.prefetch("/tasks");
    router.prefetch("/summarize");
  }, [router]);

  return (
    <div className="w-full space-y-3.5">

      {/* Bento Grid Row 1: Primary Action & Academic Profile */}
      <div className={`grid grid-cols-1 ${!isProfileCompleted ? "lg:grid-cols-3" : ""} gap-3.5`}>
        {/* Cell 1: Main Action Tile (Luminous Light / Deep Obsidian Dark) */}
        <div className={`${!isProfileCompleted ? "lg:col-span-2" : "w-full"} relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c111d] bg-gradient-to-br from-indigo-50/60 via-white to-slate-50/30 dark:from-slate-900/90 dark:via-[#0c1222] dark:to-indigo-950/30 border border-indigo-100/90 dark:border-indigo-500/20 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group`}>
          {/* Subtle Ambient Decorative Light */}
          <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              أهلاً بك، {displayName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 mt-1.5 font-medium max-w-lg leading-relaxed">
              حوّل تسجيلات المحاضرات وسلايدات PDF إلى ملخصات مركزة وبنوك أسئلة واختبارات تجريبية خلال ثوانٍ.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between gap-3">
            <Link
              href="/summarize"
              prefetch={true}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <span>ابدأ تلخيص جديد</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/50 hidden sm:inline font-medium">
              صوت • فيديو • ملفات PDF
            </span>
          </div>
        </div>

        {/* Cell 2: Academic Profile Widget (Only shown when NOT completed) */}
        {!isProfileCompleted && (
          <div
            onClick={onOpenStudentProfileModal}
            className="rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/50 dark:from-indigo-950/40 dark:via-[#0e1426] dark:to-[#0c111d] border-2 border-indigo-400/70 dark:border-indigo-500/60 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] dark:shadow-[0_4px_25px_-5px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 active:scale-[0.99]"
          >
            {/* Ambient Corner Glow when not completed */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2.5 mb-3.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      بيانات جامعتك وتخصصك
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      لتجهيز دفاتر ومراجعات لموادك
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200/80 dark:border-indigo-500/30 shrink-0">
                  <span>خطوة مهمة</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-2">
                اختر جامعتك وتخصصك عشان نجهّز لك دفاتر وملخصات واختبارات تناسب موادك بالضبط
              </p>
            </div>

            <div className="mt-4 pt-3.5 border-t border-indigo-100/90 dark:border-indigo-500/20 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                ملفك الدراسي
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 flex items-center gap-1.5 transition-all group-hover:scale-105">
                <span>حدد تخصصك</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bento Grid Row 2: 3 Clean Academic Companion Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Cell 1: ورقة مهام المذاكرة */}
        <Link
          href="/tasks"
          prefetch={true}
          onClick={() => setNavigatingTo("/tasks")}
          className={`rounded-3xl bg-white dark:bg-[#0c111d] border p-4 sm:p-5 flex items-center justify-between cursor-pointer shadow-xs hover:shadow-sm active:scale-[0.98] transition-all group relative overflow-hidden ${
            navigatingTo === "/tasks"
              ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 pointer-events-none"
              : "border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0 ${navigatingTo === "/tasks" ? "scale-105" : ""}`}>
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  ورقة مهام المذاكرة
                </h4>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shrink-0">
                  مفكرة 📝
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {navigatingTo === "/tasks" ? "جاري الفتح..." : "تنظيم وإنجاز مهامك الدراسية"}
              </p>
            </div>
          </div>
          {navigatingTo === "/tasks" ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0 mr-1" />
          ) : (
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:-translate-x-1 transition-all shrink-0 mr-1" />
          )}
        </Link>

        {/* Cell 2: Interactive Study Space */}
        <Link
          href="/study"
          prefetch={true}
          onClick={() => setNavigatingTo("/study")}
          className={`rounded-3xl bg-white dark:bg-[#0c111d] border p-4 sm:p-5 flex items-center justify-between cursor-pointer shadow-xs hover:shadow-sm active:scale-[0.98] transition-all group ${
            navigatingTo === "/study"
              ? "border-purple-400 dark:border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/30 dark:bg-purple-950/20 pointer-events-none"
              : "border-slate-200/90 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-500/30"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-10 h-10 rounded-2xl bg-purple-50 dark:purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0 ${navigatingTo === "/study" ? "scale-105" : ""}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                مساحة المذاكرة
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {navigatingTo === "/study" ? "جاري الفتح والتجهيز..." : "ملاحظات ومراجعة دراسية ذكية"}
              </p>
            </div>
          </div>
          {navigatingTo === "/study" ? (
            <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400 shrink-0 mr-1" />
          ) : (
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:-translate-x-1 transition-all shrink-0 mr-1" />
          )}
        </Link>

        {/* Cell 3: Notebook / Saved Collections */}
        <Link
          href="/notebook"
          prefetch={true}
          onClick={() => setNavigatingTo("/notebook")}
          className={`rounded-3xl bg-white dark:bg-[#0c111d] border p-4 sm:p-5 flex items-center justify-between cursor-pointer shadow-xs hover:shadow-sm active:scale-[0.98] transition-all group ${
            navigatingTo === "/notebook"
              ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20 pointer-events-none"
              : "border-slate-200/90 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0 ${navigatingTo === "/notebook" ? "scale-105" : ""}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                دفاتر المحاضرات
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {navigatingTo === "/notebook" ? "جاري فتح الدفاتر..." : "تصفح جميع محاضراتك ودفاترك"}
              </p>
            </div>
          </div>
          {navigatingTo === "/notebook" ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0 mr-1" />
          ) : (
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:-translate-x-1 transition-all shrink-0 mr-1" />
          )}
        </Link>
      </div>
    </div>
  );
}

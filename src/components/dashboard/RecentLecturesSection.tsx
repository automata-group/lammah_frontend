"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  Calendar,
  BookOpen,
  Download,
  Loader2,
} from "lucide-react";
import SmartGenerateButton from "@/components/SmartGenerateButton";
import { RecentLectureLog } from "@/types/dashboard";

interface RecentLecturesSectionProps {
  recentLogs: RecentLectureLog[];
  loadingRecentLogs: boolean;
  onSelectLecture?: (log: RecentLectureLog) => void;
}

export default function RecentLecturesSection({
  recentLogs,
  loadingRecentLogs,
  onSelectLecture,
}: RecentLecturesSectionProps) {
  const router = useRouter();
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [isOpeningHistory, setIsOpeningHistory] = useState<boolean>(false);

  useEffect(() => {
    router.prefetch("/history");
    router.prefetch("/notebook");
    router.prefetch("/dashboard");
    router.prefetch("/study");
    router.prefetch("/tasks");
    router.prefetch("/summarize");
  }, [router]);

  const handleOpenLecture = (log: RecentLectureLog) => {
    setOpeningId(log.id);
    if (log.metadata?.is_notebook || log.metadata?.job_id?.startsWith("notebook_")) {
      const jobId = log.metadata?.job_id;
      const title = log.metadata?.title || log.feature_name || "دفتر دراسي";
      const studentName = log.metadata?.student_name || "طالب متميز";
      if (jobId) {
        router.push(`/notebook?job_id=${jobId}&title=${encodeURIComponent(title)}&student_name=${encodeURIComponent(studentName)}&history_id=${log.id}`);
      } else {
        router.push(`/notebook?history_id=${log.id}`);
      }
    } else {
      if (onSelectLecture) {
        onSelectLecture(log);
      } else {
        router.push(`/dashboard?history_id=${log.id}`);
      }
    }
  };

  const displayLogs = recentLogs
    .filter(
      (log) =>
        !log.metadata?.is_demo &&
        log.id !== "4198557f-5b1b-48ac-91a8-d8129de8ca0b" &&
        !log.metadata?.title?.includes("تشفير البلوك")
    )
    .slice(0, 4);

  const getLectureHref = (log: RecentLectureLog) => {
    if (log.metadata?.is_notebook || log.metadata?.job_id?.startsWith("notebook_")) {
      const jobId = log.metadata?.job_id;
      const title = log.metadata?.title || log.feature_name || "دفتر دراسي";
      const studentName = log.metadata?.student_name || "طالب متميز";
      return jobId
        ? `/notebook?job_id=${jobId}&title=${encodeURIComponent(title)}&student_name=${encodeURIComponent(studentName)}&history_id=${log.id}`
        : `/notebook?history_id=${log.id}`;
    }
    return `/dashboard?history_id=${log.id}`;
  };

  return (
    <div className="space-y-3.5 w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            محاضراتي الأخيرة
          </h3>
        </div>
        <Link
          href="/history"
          prefetch={true}
          onClick={() => setIsOpeningHistory(true)}
          className={`text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
            isOpeningHistory
              ? "text-indigo-700 dark:text-indigo-300 opacity-90 pointer-events-none"
              : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          }`}
        >
          {isOpeningHistory ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري فتح السجل...</span>
            </>
          ) : (
            <>
              <span>عرض كل السجل</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </>
          )}
        </Link>
      </div>

      {loadingRecentLogs && recentLogs.length === 0 ? (
        /* Bento Grid Skeleton Loading - Horizontal scroll on mobile */
        <div className="flex overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="min-w-[260px] max-w-[285px] sm:min-w-0 sm:max-w-none shrink-0 snap-start p-5 rounded-3xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
              <div className="h-8 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : displayLogs.length > 0 ? (
        /* Uniform Clean Bento Grid for Recent Lectures - Horizontal scroll on mobile */
        <div className="flex overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {displayLogs.map((log) => {
            const title = log.metadata?.title || "محاضرة بدون عنوان";
            const dateStr = log.created_at
              ? new Intl.DateTimeFormat("ar-EG", {
                  day: "numeric",
                  month: "short",
                }).format(new Date(log.created_at))
              : "";
            const hasPdf = !!log.metadata?.job_id;

            return (
              <div
                key={log.id}
                onClick={() => handleOpenLecture(log)}
                onMouseEnter={() => router.prefetch(getLectureHref(log))}
                onPointerDown={() => router.prefetch(getLectureHref(log))}
                className="min-w-[260px] max-w-[285px] sm:min-w-0 sm:max-w-none shrink-0 snap-start rounded-3xl bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex items-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenLecture(log);
                    }}
                    disabled={openingId === log.id}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white dark:bg-slate-800/60 hover:dark:bg-indigo-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white border border-slate-200/70 hover:border-indigo-600 dark:border-slate-700/60 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-80 disabled:pointer-events-none"
                  >
                    {openingId === log.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الفتح...</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>متابعة المذاكرة</span>
                      </>
                    )}
                  </button>

                  {hasPdf && (() => {
                    const isNotebook = !!(log.metadata?.is_notebook || log.metadata?.job_id?.startsWith("notebook_"));
                    const isPrep = log.metadata?.is_prep !== undefined
                      ? !!log.metadata.is_prep
                      : (log.metadata?.has_audio !== undefined ? !log.metadata.has_audio : !log.metadata?.transcript?.trim());
                    const rawTitle = log.metadata?.title || "المادة الدراسية";
                    const cleanTitle = rawTitle.replace(/^دفتر\s+/, "").replace(/^محاضرة\s+/, "").replace(/[\\/*?:"<>|]/g, " ").trim() || "المادة الدراسية";
                    const filename = isNotebook
                      ? `${cleanTitle} - ${isPrep ? "دفتر تحضير سلايدات" : "دفتر مخطط فويسات"} - لمّاح.pdf`
                      : `${cleanTitle} - ${isPrep ? "تحضير سلايدات" : "مخططة فويسات"} - لمّاح.pdf`;
                    const downloadPath = isNotebook
                      ? `/api/v1/notebook/download/${log.metadata?.job_id}.pdf?download=true&title=${encodeURIComponent(cleanTitle)}&is_prep=${isPrep}`
                      : `/api/v1/summarize/download/${log.metadata?.job_id}.pdf?title=${encodeURIComponent(cleanTitle)}&is_prep=${isPrep}`;

                    return (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${downloadPath}`}
                        download={filename}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 transition cursor-pointer"
                        title="تحميل الملف PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0c111d] border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              لا توجد محاضرات سابقة حتى الآن
            </h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              ابدأ بتلخيص أول محاضرة لك لتظهر هنا وتتمكن من متابعة دراستك والعودة إليها في أي وقت.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <Link href="/summarize" prefetch={true}>
              <SmartGenerateButton
                text="ابدأ تلخيص أول محاضرة"
                variant="pill"
                size="sm"
                fullWidth={false}
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

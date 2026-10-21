"use client";

import React, { useState } from "react";
import { BookOpen, Pencil, Check, X, ChevronLeft } from "lucide-react";

import StudyFocusTimer from "@/components/dashboard/StudyFocusTimer";

interface DashboardTitleBarProps {
  lectureTitle: string;
  setLectureTitle: (title: string) => void;
  currentHistoryId: string | null;
  sessionToken?: string;
  onBackToHome: () => void;
}

export default function DashboardTitleBar({
  lectureTitle,
  setLectureTitle,
  currentHistoryId,
  sessionToken,
  onBackToHome,
}: DashboardTitleBarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const handleSaveTitle = async () => {
    if (titleInput.trim() && currentHistoryId && sessionToken) {
      setLectureTitle(titleInput.trim());
      setIsEditingTitle(false);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/history/${currentHistoryId}/title`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: titleInput.trim() }),
        }
      ).catch(() => {});
    }
  };

  return (
    <div className="lg:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xs relative overflow-hidden mb-1 group transition-all">
      <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-xs group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors shrink-0">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") setIsEditingTitle(false);
              }}
              className="bg-slate-50 dark:bg-slate-950 border border-indigo-300 dark:border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full max-w-md shadow-inner"
              placeholder="عنوان المحاضرة..."
              maxLength={120}
              autoFocus
            />
            <button
              onClick={handleSaveTitle}
              className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditingTitle(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight line-clamp-2 md:line-clamp-none">
              {lectureTitle || "محاضرة بدون عنوان"}
            </h1>
            {currentHistoryId && (
              <button
                onClick={() => {
                  setIsEditingTitle(true);
                  setTitleInput(lectureTitle || "");
                }}
                className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 shrink-0 cursor-pointer"
                title="تعديل العنوان"
              >
                <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
        <StudyFocusTimer currentHistoryId={currentHistoryId} lectureTitle={lectureTitle} />

        <button
          onClick={onBackToHome}
          className="relative z-10 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-bold transition-all bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-indigo-600/20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm w-full md:w-auto text-center justify-center text-xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}

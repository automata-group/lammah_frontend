"use client";

import React from "react";
import { BookOpen, MessageCircle, Target, Layers, BrainCircuit, Award } from "lucide-react";
import { DashboardAnnotations, FocusPoint, PastExamItem } from "@/types/dashboard";

interface DashboardTabsNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  annotations?: DashboardAnnotations;
  hasPdfDownload: boolean;
  filteredFocusPoints: FocusPoint[];
  pastExamQuestions: PastExamItem[];
  currentHistoryId: string | null;
  onSelectQuizTab?: () => void;
}

export default function DashboardTabsNav({
  activeTab,
  setActiveTab,
  annotations,
  hasPdfDownload,
  filteredFocusPoints,
  pastExamQuestions,
  currentHistoryId,
  onSelectQuizTab,
}: DashboardTabsNavProps) {
  const hasSlideExplanations = (annotations?.slide_explanations?.length ?? 0) > 0 || (annotations?.sticky_notes?.length ?? 0) > 0;
  const hasFocus = filteredFocusPoints.length > 0;
  const hasFlashcards = (annotations?.flashcards?.length ?? 0) > 0;
  const hasMcqs = (annotations?.mcqs?.length ?? 0) > 0;
  // ميزة الامتحانات السابقة مؤجلة للتحديث القادم
  const hasPastExams = false;

  const showTabsBar =
    (!hasPdfDownload && hasSlideExplanations) ||
    hasFocus ||
    hasMcqs ||
    hasFlashcards ||
    hasPastExams ||
    !!currentHistoryId;

  if (!showTabsBar) return null;

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 sm:p-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs relative z-20">
      {/* 1. Slide Explanations (only if no PDF) */}
      {!hasPdfDownload && (
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`flex items-center justify-between gap-1 sm:gap-1.5 py-2 px-2 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer ${
            activeTab === "notes"
              ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm border-2 border-indigo-500/80 dark:border-indigo-400 ring-2 ring-indigo-500/20"
              : "bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <BookOpen className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "notes" ? "text-indigo-600 dark:text-indigo-400" : "text-indigo-500"}`} />
            <span className="whitespace-nowrap">شروحات الشرائح</span>
          </div>
          {(annotations?.slide_explanations?.length ?? 0) > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 transition-colors ml-1 ${
                activeTab === "notes"
                  ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25"
                  : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700/60"
              }`}
            >
              {annotations?.slide_explanations?.length}
            </span>
          )}
        </button>
      )}

      {/* 2. Smart Chat */}
      {currentHistoryId && (
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer ${
            activeTab === "chat"
              ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm border-2 border-blue-500/80 dark:border-blue-400 ring-2 ring-blue-500/20"
              : "bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <MessageCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "chat" ? "text-blue-600 dark:text-blue-400 fill-blue-500/20" : "text-blue-500"}`} />
            <span className="whitespace-nowrap">المحادثة الذكية</span>
          </div>
        </button>
      )}

      {/* 3. Focus Points */}
      {hasFocus && (
        <button
          type="button"
          onClick={() => setActiveTab("focus")}
          className={`flex items-center justify-between gap-1 sm:gap-1.5 py-2 px-2 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer ${
            activeTab === "focus"
              ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-sm border-2 border-amber-500/80 dark:border-amber-400 ring-2 ring-amber-500/20"
              : "bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <Target className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "focus" ? "text-amber-600 dark:text-amber-400" : "text-amber-500"}`} />
            <span className="whitespace-nowrap">نقاط التركيز</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 transition-colors ml-1 ${
              activeTab === "focus"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700/60"
            }`}
          >
            {filteredFocusPoints.length}
          </span>
        </button>
      )}

      {/* 4. Flashcards */}
      {hasFlashcards && (
        <button
          type="button"
          onClick={() => setActiveTab("flashcards")}
          className={`flex items-center justify-between gap-1 sm:gap-1.5 py-2 px-2 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer ${
            activeTab === "flashcards"
              ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border-2 border-purple-500/80 dark:border-purple-400 ring-2 ring-purple-500/20"
              : "bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <Layers className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "flashcards" ? "text-purple-600 dark:text-purple-400" : "text-purple-500"}`} />
            <span className="whitespace-nowrap">بطاقات الحفظ</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 transition-colors ml-1 ${
              activeTab === "flashcards"
                ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25"
                : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700/60"
            }`}
          >
            {annotations?.flashcards?.length}
          </span>
        </button>
      )}

      {/* 5. MCQs Quiz */}
      {hasMcqs && (
        <button
          type="button"
          onClick={() => {
            setActiveTab("quiz");
            if (onSelectQuizTab) onSelectQuizTab();
          }}
          className={`flex items-center justify-between gap-1 sm:gap-1.5 py-2 px-2 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer ${
            activeTab === "quiz"
              ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm border-2 border-emerald-500/80 dark:border-emerald-400 ring-2 ring-emerald-500/20"
              : "bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <BrainCircuit className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "quiz" ? "text-emerald-600 dark:text-emerald-400" : "text-emerald-500"}`} />
            <span className="whitespace-nowrap">اختبر نفسك</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 transition-colors ml-1 ${
              activeTab === "quiz"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700/60"
            }`}
          >
            {annotations?.mcqs?.length}
          </span>
        </button>
      )}

      {/* 6. Past Exams */}
      {hasPastExams && (
        <button
          type="button"
          onClick={() => setActiveTab("past_exams")}
          className={`flex items-center justify-between gap-1 sm:gap-1.5 py-2 px-2 sm:px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer ${
            activeTab === "past_exams"
              ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-sm border-2 border-amber-500/80 dark:border-amber-400 ring-2 ring-amber-500/20"
              : "bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <Award className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === "past_exams" ? "text-amber-600 dark:text-amber-400" : "text-amber-500"}`} />
            <span className="whitespace-nowrap">الامتحانات السابقة</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black shrink-0 transition-colors ml-1 ${
              activeTab === "past_exams"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/50 dark:border-slate-700/60"
            }`}
          >
            {pastExamQuestions.length}
          </span>
        </button>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Sparkles,
  RotateCcw,
  Target,
  Search,
  FileText,
  Check,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  Lock,
  Crown,
} from "lucide-react";
import { PastExamItem } from "@/types/dashboard";
import { getActualSlidePage } from "@/lib/dashboardUtils";

interface PastExamsTabContentProps {
  pastExamQuestions: PastExamItem[];
  isBasicPlan: boolean;
  slidePageMap?: Record<number, number>;
  jumpToPdfSlide: (pageOrSlideNum: number, targetType?: "slide" | "comp1" | "comp2" | number) => void;
}

export default function PastExamsTabContent({
  pastExamQuestions,
  isBasicPlan,
  slidePageMap,
  jumpToPdfSlide,
}: PastExamsTabContentProps) {
  const router = useRouter();

  const [pastExamSelectedAnswers, setPastExamSelectedAnswers] = useState<Record<string | number, string>>({});
  const [pastExamShowExplanation, setPastExamShowExplanation] = useState<Record<string | number, boolean>>({});
  const [pastExamsFilterYear, setPastExamsFilterYear] = useState<string>("all");
  const [pastExamsSearch, setPastExamsSearch] = useState<string>("");

  const totalQ = pastExamQuestions.length;
  const answeredCount = Object.keys(pastExamSelectedAnswers).length;
  const correctCount = pastExamQuestions.filter((q, i) => {
    const key = q.id || i;
    return pastExamSelectedAnswers[key] === q.correct_answer;
  }).length;
  const readinessPercent = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

  // Extract unique year filters
  const uniqueYears: string[] = ["all", ...Array.from(new Set<string>(pastExamQuestions.map((q) => String(q.year || "عام"))))];

  // Filter questions
  const filtered = pastExamQuestions.filter((q) => {
    const matchYear = pastExamsFilterYear === "all" || q.year === pastExamsFilterYear;
    const matchSearch =
      !pastExamsSearch.trim() ||
      q.question?.toLowerCase().includes(pastExamsSearch.toLowerCase()) ||
      q.doctor_explanation?.toLowerCase().includes(pastExamsSearch.toLowerCase()) ||
      q.options?.some((opt) => opt.toLowerCase().includes(pastExamsSearch.toLowerCase()));
    return matchYear && matchSearch;
  });

  return (
    <div className="space-y-6 relative z-10">
      {/* Plan Lock Overlay */}
      {isBasicPlan && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/90 rounded-[2.5rem] p-4 sm:p-8 text-center border border-amber-200 dark:border-amber-500/20 shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200 dark:border-amber-500/30">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-l dark:from-amber-200 dark:to-orange-400 mb-4">
            افتح بنك أسئلة السنوات السابقة المربوطة بالشرائح!
          </h3>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium">
            ميزة <strong>أسئلة السنوات السابقة وربطها التفاعلي بالسلايدات وفخاخ الاختبارات</strong> متاحة لجميع مشتركي باقات لمّاح المدفوعة. <br />
            <span className="text-slate-500 dark:text-slate-400 text-sm mt-2 block">
              اشترك الآن لتضمن التفوق واجتياز الامتحانات بأعلى الدرجات!
            </span>
          </p>
          <Link
            href="/plans"
            prefetch={true}
            className="bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center text-base sm:text-lg transform hover:-translate-y-1 cursor-pointer"
          >
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 ml-2" /> ترقية الباقة الآن لفك القفل
          </Link>
        </div>
      )}

      <div className={isBasicPlan ? "opacity-20 pointer-events-none select-none transition-all" : ""}>
        <div className="space-y-6">
          {/* Hero Stats & Readiness Card */}
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-amber-500/30 p-5 sm:p-7 rounded-3xl sm:rounded-[2.5rem] shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      بنك أسئلة السنوات السابقة المربوطة
                    </h3>
                    <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                      {totalQ} سؤال معتمد
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    مربوطة تلقائياً بشرائح السلايدات لتوضيح مصدر السؤال وسبب إجابته
                  </p>
                </div>
              </div>

              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPastExamSelectedAnswers({});
                    setPastExamShowExplanation({});
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer self-start md:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  إعادة تصفير الحل
                </button>
              )}
            </div>

            {/* Exam Readiness Gauge */}
            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-200">
                    مؤشر الجاهزية للاختبار: {readinessPercent}%
                  </span>
                </div>
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-3">
                  <span>
                    تم حل: {answeredCount} من {totalQ}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">صحيح: {correctCount}</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-amber-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${Math.max(5, readinessPercent)}%` }}
                />
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
              {/* Year Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {uniqueYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setPastExamsFilterYear(yr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      pastExamsFilterYear === yr
                        ? "bg-amber-500 text-white shadow-xs font-black"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {yr === "all" ? `الكل (${totalQ})` : yr}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[200px] sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={pastExamsSearch}
                  onChange={(e) => setPastExamsSearch(e.target.value)}
                  placeholder="ابحث في الأسئلة والشروحات..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Questions List */}
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-10 rounded-3xl text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-base font-bold">لا توجد أسئلة تطابق بحثك الحالي</p>
              <button
                onClick={() => {
                  setPastExamsFilterYear("all");
                  setPastExamsSearch("");
                }}
                className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
              >
                إعادة عرض جميع الأسئلة
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((q, idx) => {
                const key = q.id || idx;
                const isAnswered = !!pastExamSelectedAnswers[key];
                const selected = pastExamSelectedAnswers[key];

                return (
                  <div
                    key={key}
                    className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-amber-500/20 p-5 sm:p-7 rounded-3xl shadow-xs transition-all hover:border-amber-300 dark:hover:border-amber-500/40 relative overflow-hidden"
                  >
                    {/* Card Top Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          {q.year || "امتحان السنوات السابقة"}
                        </span>
                        {q.exam_type && (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md" dir="ltr">
                            {q.exam_type}
                          </span>
                        )}
                      </div>

                      {/* Jump to slide button */}
                      {q.page_number && (
                        <button
                          type="button"
                          onClick={() => jumpToPdfSlide(q.page_number!, "slide")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                          title={`الانتقال إلى شريحة ${q.page_number} في الملف المخطط (صفحة ${getActualSlidePage(q.page_number, 1, slidePageMap)})`}
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>انتقل للشريحة {q.page_number} 📄</span>
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-5 leading-relaxed">
                      <span className="text-amber-600 dark:text-amber-400 font-mono ml-2">#{idx + 1}</span>
                      {q.question}
                    </h4>

                    {/* Options Grid */}
                    <div className="space-y-3 mb-4">
                      {q.options?.map((opt: string, optIdx: number) => {
                        let btnStyle =
                          "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200";

                        if (isAnswered) {
                          if (opt === q.correct_answer) {
                            btnStyle =
                              "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black shadow-sm";
                          } else if (opt === selected) {
                            btnStyle =
                              "bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 font-bold opacity-85";
                          } else {
                            btnStyle =
                              "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 text-slate-400 opacity-40";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => {
                              setPastExamSelectedAnswers((prev) => ({ ...prev, [key]: opt }));
                              setPastExamShowExplanation((prev) => ({ ...prev, [key]: true }));
                            }}
                            className={`w-full text-right p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <span className="leading-relaxed">{opt}</span>
                            {isAnswered && opt === q.correct_answer && (
                              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            {isAnswered && opt === selected && opt !== q.correct_answer && (
                              <X className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Doctor's Explanation & Exam Trap Box */}
                    {pastExamShowExplanation[key] && (
                      <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        {/* Model Answer & Doctor's Note */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                          <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>تفسير الدكتور والحل النموذجي:</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {q.doctor_explanation}
                          </p>
                        </div>

                        {/* Exam Trap Alert */}
                        {q.trap_warning && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                            <div className="flex items-center gap-2 mb-1.5 text-amber-900 dark:text-amber-300 font-black text-xs sm:text-sm">
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>تنبيه فخ الاختبار:</span>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                              {q.trap_warning}
                            </p>
                          </div>
                        )}

                        {/* Direct slide linkage footer action */}
                        {q.page_number && (
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => jumpToPdfSlide(q.page_number!, "slide")}
                              className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                            >
                              <span>
                                افتح شريحة {q.page_number} في الملف المخطط لمراجعة الفقرة نصياً
                              </span>
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

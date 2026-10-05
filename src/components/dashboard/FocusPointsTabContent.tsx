"use client";

import React, { useState } from "react";
import { Target, CheckCircle2, Circle, Sparkles, ExternalLink } from "lucide-react";
import { FocusPoint } from "@/types/dashboard";
import { getActualSlidePage, getActualCompPage } from "@/lib/dashboardUtils";

interface FocusPointsTabContentProps {
  filteredFocusPoints: FocusPoint[];
  slidePageMap?: Record<number, number>;
  companionPageMap?: Record<number, number[] | number>;
  jumpToPdfSlide: (pageOrSlideNum: number, targetType?: "slide" | "comp1" | "comp2" | number) => void;
}

export default function FocusPointsTabContent({
  filteredFocusPoints,
  slidePageMap,
  companionPageMap,
  jumpToPdfSlide,
}: FocusPointsTabContentProps) {
  const [reviewedFocusPoints, setReviewedFocusPoints] = useState<Record<number, boolean>>({});
  const [focusFilter, setFocusFilter] = useState<"all" | "remaining">("all");

  const totalFocus = filteredFocusPoints.length;
  const reviewedCount = filteredFocusPoints.filter((_, idx) => reviewedFocusPoints[idx]).length;
  const progressPercent = totalFocus > 0 ? Math.round((reviewedCount / totalFocus) * 100) : 0;

  if (totalFocus === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-8 rounded-3xl text-center space-y-2">
        <Target className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
        <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">لا توجد مواضع تركيز إضافية</h4>
        <p className="text-xs text-slate-500">
          تم استبعاد شرائح الغلاف والمقدمات التمهيدية تلقائياً للتركيز على المحتوى الأكاديمي الحقيقي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative z-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs relative overflow-hidden">
        {/* Header & Study Progress Section */}
        <div className="mb-4 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          {/* Title, Badge & Subtitle */}
          <div className="mb-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 dark:border-amber-500/30 shadow-2xs shrink-0 mt-0.5">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                    مواضع الأسئلة والتركيز
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30 shrink-0 whitespace-nowrap">
                    {totalFocus} {totalFocus === 1 ? "موضع" : totalFocus === 2 ? "موضعان" : totalFocus <= 10 ? "مواضع" : "موضع"}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                  خطة مراجعة مركزة للمفاهيم الأكاديمية والأسئلة الامتحانية الجوهرية
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800 mb-3">
            <button
              type="button"
              onClick={() => setFocusFilter("all")}
              className={`text-xs font-black py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                focusFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-700/80"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>جميع المواضع</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                  focusFilter === "all"
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {totalFocus}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFocusFilter("remaining")}
              className={`text-xs font-black py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                focusFilter === "remaining"
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs border border-amber-200/80 dark:border-amber-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <span>المتبقي</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                  totalFocus - reviewedCount > 0
                    ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300"
                    : "bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {totalFocus - reviewedCount}
              </span>
            </button>
          </div>

          {/* Study Progress Bar */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">
                إنجاز المراجعة: {reviewedCount} من {totalFocus} ({progressPercent}%)
              </span>
              {reviewedCount === totalFocus && totalFocus > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> أتممت مراجعة كل مواضع الاختبار!
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  متبقي {totalFocus - reviewedCount} {totalFocus - reviewedCount <= 10 ? "نقاط" : "نقطة"}
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1.5 custom-scrollbar">
          {filteredFocusPoints.map((fp: any, i: number) => {
            const isReviewed = !!reviewedFocusPoints[i];
            if (focusFilter === "remaining" && isReviewed) {
              return null;
            }

            const actualSlide = getActualSlidePage(fp.page_number, i + 1, slidePageMap);
            const actualComp = getActualCompPage(fp.page_number, i + 1, companionPageMap, slidePageMap);

            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
                  isReviewed
                    ? "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800/60 border-r-4 border-r-emerald-500 opacity-75"
                    : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 border-r-4 border-r-amber-500 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs"
                }`}
              >
                {/* Card Top: Number + Review Action */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shrink-0 ${
                        isReviewed
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>موضع تركيز #{i + 1}</span>
                    </span>

                    {fp.page_number && (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/60 shrink-0">
                        شريحة {actualSlide}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setReviewedFocusPoints((prev) => ({ ...prev, [i]: !prev[i] }))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isReviewed
                        ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {isReviewed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>تمت المراجعة ✓</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-400" />
                        <span>تحديد كمُراجَع</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Focus Point Title */}
                {fp.point && fp.point.trim() && (
                  <h4
                    className={`text-base sm:text-lg font-black leading-snug break-words mb-2.5 ${
                      isReviewed
                        ? "text-slate-600 dark:text-slate-400 line-through opacity-75"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {fp.point}
                  </h4>
                )}

                {/* Direct Explanation */}
                {fp.explanation && (
                  <p className="text-xs sm:text-sm leading-[1.9] text-slate-600 dark:text-slate-300 font-normal break-words">
                    {fp.explanation}
                  </p>
                )}

                {/* Footer Slide Navigation */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200/80 dark:border-amber-500/20 flex items-center gap-1.5 shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>مفهوم امتحاني هام</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {fp.page_number && (
                      <button
                        type="button"
                        onClick={() => jumpToPdfSlide(fp.page_number, "slide")}
                        className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                        title={`انتقل للشريحة ${actualSlide} في ملف الـ PDF`}
                      >
                        <span>عرض الشريحة {actualSlide}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    )}

                    {companionPageMap?.[fp.page_number] && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToPdfSlide(fp.page_number, "comp1");
                        }}
                        className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title={`انتقل لشريحة الشرح ${actualComp} المخصصة لهذه الشريحة داخل الدفتر`}
                      >
                        <span>شريحة الشرح {actualComp} 📖</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

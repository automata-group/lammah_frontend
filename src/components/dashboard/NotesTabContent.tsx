"use client";

import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { DashboardAnnotations } from "@/types/dashboard";
import { getActualSlidePage } from "@/lib/dashboardUtils";

interface NotesTabContentProps {
  annotations?: DashboardAnnotations;
  jumpToPdfSlide: (pageOrSlideNum: number, targetType?: "slide" | "comp1" | "comp2" | number) => void;
}

export default function NotesTabContent({
  annotations,
  jumpToPdfSlide,
}: NotesTabContentProps) {
  const slideExplanations = annotations?.slide_explanations || [];
  const stickyNotes = annotations?.sticky_notes || [];
  const slidePageMap = annotations?.slide_page_map;
  const companionMap = annotations?.companion_page_map;

  return (
    <div className="space-y-4 relative z-10">
      {/* Slide Explanations List */}
      {slideExplanations.length > 0 && (
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-indigo-500/20 p-3.5 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  شروحات وتفكيك الشرائح
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  شرح مبسط ومترجم لكل فكرة مع أمثلة واقعية وفخاخ الاختبار
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              {slideExplanations.length} شريحة
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {slideExplanations.map((slide: any, idx: number) => {
              const pageNum = slide.page_number || idx + 1;
              const actualPage = getActualSlidePage(pageNum, idx + 1, slidePageMap);

              return (
                <div
                  key={idx}
                  className="bg-slate-50/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 transition-all duration-200 shadow-2xs hover:shadow-xs group"
                >
                  {/* Slide Card Header & Jump Actions */}
                  <div className="mb-2.5 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40 px-2 py-0.5 rounded-md shrink-0">
                        شريحة {actualPage}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => jumpToPdfSlide(pageNum, "slide")}
                          className="text-[10px] font-black bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          title="انقر للانتقال لهذه الشريحة وتوسيطها في الملف"
                        >
                          <span>شريحة {actualPage}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>

                        {companionMap?.[pageNum] && (
                          <div className="flex flex-wrap items-center gap-1">
                            {(Array.isArray(companionMap[pageNum])
                              ? (companionMap[pageNum] as number[])
                              : [companionMap[pageNum] as number]
                            ).map((compPage: number, cIdx: number, arr: number[]) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  jumpToPdfSlide(compPage, compPage);
                                }}
                                className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title={`انتقل للشريحة التوضيحية صفحة ${compPage}`}
                              >
                                <span>شريحة الشرح {arr.length > 1 ? `${cIdx + 1} ` : ""}(صـ {compPage}) 📖</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 leading-snug break-words">
                      {slide.title || `الشريحة ${pageNum}`}
                    </h4>
                  </div>

                  {/* Summary Phrase */}
                  {slide.summary_phrase && (
                    <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 mb-2 bg-indigo-50/60 dark:bg-indigo-950/30 px-2 py-1 rounded-lg border border-indigo-100/60 dark:border-indigo-900/40">
                      🎯 الفكرة: {slide.summary_phrase}
                    </p>
                  )}

                  {/* Tier 1: Doctor's Audio Notes */}
                  {slide.doctor_explanation && (
                    <div className="my-2.5 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                        <span>🎙️</span>
                        <span>ما ركز عليه وشرحه الدكتور صوتياً في القاعة:</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-[1.85] font-normal whitespace-pre-line">
                        {slide.doctor_explanation}
                      </div>
                    </div>
                  )}

                  {/* Tier 2: Lammah Smart AI Deep Dive */}
                  {slide.ai_explanation && (
                    <div className="my-2.5 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 text-xs sm:text-sm text-purple-950 dark:text-purple-200 shadow-2xs">
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
                          <span>💡</span>
                          <span>الشرح والتفكيك الذكي (من لمّاح):</span>
                        </div>
                        <span className="text-[9px] bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold">
                          توضيح لمّاح
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 px-2 py-1 rounded mb-2 border border-amber-200/60 dark:border-amber-800/30 font-medium">
                        ⚠️ تنبيه دراسي: هذا الشرح والتفكيك مُعد من نظام لمّاح لمساعدتك في استيعاب المادة وتغطية ما ذكره المحاضر (ليس من كلام الدكتور المباشر).
                      </p>
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-[1.85] font-normal whitespace-pre-line">
                        {slide.ai_explanation}
                      </div>
                    </div>
                  )}

                  {/* Fallback Legacy Explanation */}
                  {!slide.doctor_explanation && !slide.ai_explanation && slide.explanation && (
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-[1.85] font-normal mb-2.5">
                      {slide.explanation}
                    </div>
                  )}

                  {/* Real-World Example Card */}
                  {slide.example && (
                    <div className="my-2.5 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5 shadow-2xs">
                      <span className="shrink-0 text-base">🚀</span>
                      <div className="leading-[1.85]">
                        <strong className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                          مثال واقعي يوضح الفكرة تماماً:
                        </strong>
                        <p>{slide.example}</p>
                      </div>
                    </div>
                  )}

                  {/* Vocabulary Chips */}
                  {Array.isArray(slide.vocabulary) && slide.vocabulary.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                        📖 مصطلحات:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {slide.vocabulary.map((vocab: any, vIdx: number) => {
                          const term = typeof vocab === "string" ? vocab : vocab.term || vocab.english || "";
                          const def =
                            typeof vocab === "object"
                              ? vocab.meaning || vocab.arabic || vocab.translation || ""
                              : "";
                          return (
                            <span
                              key={vIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40 font-medium inline-flex items-center gap-1"
                            >
                              <span className="font-bold" dir="ltr">
                                {term}
                              </span>
                              {def && <span className="text-teal-600 dark:text-teal-400 font-normal">({def})</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Exam Tip */}
                  {slide.exam_tip && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 text-[10px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                      <span className="shrink-0 text-xs">⚠️</span>
                      <span className="leading-snug">
                        <strong className="font-bold">فخ الاختبار:</strong> {slide.exam_tip}
                      </span>
                    </div>
                  )}

                  {/* Sticky Note */}
                  {slide.sticky_note && (
                    <div className="mt-1.5 p-2 rounded-lg bg-yellow-50/70 dark:bg-yellow-950/20 border border-yellow-200/60 dark:border-yellow-800/30 text-[10px] text-yellow-900 dark:text-yellow-200 flex items-start gap-1.5">
                      <span className="shrink-0 text-xs">📌</span>
                      <span className="leading-snug">{slide.sticky_note}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Standalone Sticky Notes */}
      {stickyNotes.length > 0 && (
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-indigo-500/20 p-3.5 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <h3 className="text-xs sm:text-sm font-black flex items-center mb-2.5 text-indigo-700 dark:text-indigo-300">
            ملاحظات المحاضر السريعة
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {stickyNotes.map((note: any, i: number) => (
              <div
                key={i}
                onClick={() => note.page_number && jumpToPdfSlide(note.page_number, "slide")}
                className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-900 transition-colors"
              >
                <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full mb-1 inline-block">
                  شريحة {note.page_number}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{note.note_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback if both empty */}
      {slideExplanations.length === 0 && stickyNotes.length === 0 && (
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl text-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto mb-2.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 mb-1">
            لم يتم استخراج شروحات بعد
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            يمكنك استخدام تبويب "المحادثة" لطرح أي سؤال وسيجيبك المساعد الذكي فوراً.
          </p>
        </div>
      )}
    </div>
  );
}

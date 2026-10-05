"use client";

import React, { useState } from "react";
import { FileText, Sparkles, Check, Copy, Search, CheckCircle } from "lucide-react";
import { ParsedTranscriptItem } from "@/types/dashboard";

interface DashboardTranscriptViewerProps {
  transcript: string;
  parsedTranscriptLines: ParsedTranscriptItem[];
  transcriptSearchQuery: string;
}

export default function DashboardTranscriptViewer({
  transcript,
  parsedTranscriptLines,
  transcriptSearchQuery,
}: DashboardTranscriptViewerProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-[2.5rem] shadow-xs overflow-hidden relative group transition-all">
      {/* Header Section */}
      <div className="p-5 sm:p-8 pb-4 sm:pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-xs shrink-0">
              <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mb-1">
                تفريغ لمّاح السريع
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                نص المحاضرة مفرغ ومنسق بدقة عبر محرك لمّاح
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-[1.25rem] font-bold transition-all border text-xs sm:text-sm w-full md:w-auto justify-center cursor-pointer ${
                isCopied
                  ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 shadow-2xs"
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {isCopied ? "تم النسخ!" : "نسخ النص"}
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-8 pb-5 sm:pb-8">
        <div className="bg-slate-50 dark:bg-slate-950/40 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-slate-800/80 relative overflow-hidden max-h-[700px] overflow-y-auto custom-scrollbar">
          <div className="relative z-10 leading-relaxed text-slate-800 dark:text-slate-200">
            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed font-normal">
              {parsedTranscriptLines.map((item: ParsedTranscriptItem) => {
                if (!item.parts) {
                  return (
                    <p key={item.id} className="mb-6 last:mb-0">
                      {item.line}
                    </p>
                  );
                }
                return (
                  <p key={item.id} className="mb-6 last:mb-0">
                    {item.parts.map((part: string, j: number) =>
                      part.toLowerCase() === transcriptSearchQuery.toLowerCase() ? (
                        <mark
                          key={j}
                          className="bg-amber-200 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 border-b border-amber-400 rounded-xs px-1 font-bold not-italic"
                        >
                          {part}
                        </mark>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              })}
              {transcriptSearchQuery && parsedTranscriptLines.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800/50 border-dashed">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-base font-semibold">لا توجد نتائج بحث لـ "{transcriptSearchQuery}"</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-12 text-indigo-600 dark:text-indigo-400/60 text-xs font-black uppercase tracking-[0.2em] border-t border-slate-200 dark:border-slate-800/60 pt-6 justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
              نهاية التفريغ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

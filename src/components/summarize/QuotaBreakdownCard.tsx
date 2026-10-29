"use client";

import React from "react";
import Link from "next/link";
import { Calculator, FileAudio, FileText, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import SmartGenerateButton from "@/components/SmartGenerateButton";
import { QuotaCostBreakdown, UploadedAudio } from "./types";

interface QuotaBreakdownCardProps {
  quotaCostBreakdown: QuotaCostBreakdown;
  quota: number | null;
  hasPaidPlan: boolean;
  hasAudio: boolean;
  hasPdf: boolean;
  totalAudioSeconds: number;
  formatDuration: (seconds: number) => string;
  isAnyAudioUploading: boolean;
  isPdfUploading: boolean;
  isRangeInvalid: boolean;
  isProcessing: boolean;
  audioUploadProgress: number;
  pdfUploadProgress: number;
  multiAudioFiles: UploadedAudio[];
  completedAudioCount: number;
  totalAudioCount: number;
  onProcess: () => void;
}

export default function QuotaBreakdownCard({
  quotaCostBreakdown,
  quota,
  hasPaidPlan,
  hasAudio,
  hasPdf,
  totalAudioSeconds,
  formatDuration,
  isAnyAudioUploading,
  isPdfUploading,
  isRangeInvalid,
  isProcessing,
  audioUploadProgress,
  pdfUploadProgress,
  multiAudioFiles,
  completedAudioCount,
  totalAudioCount,
  onProcess,
}: QuotaBreakdownCardProps) {
  const hasFiles = hasAudio || hasPdf;

  return (
    <>
      {hasFiles && (
        <div
          className={`mb-5 p-4 rounded-2xl border transition-all text-right ${
            quotaCostBreakdown.isSufficient
              ? "bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border-indigo-200/80 dark:border-indigo-800/60 shadow-xs"
              : "bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  quotaCostBreakdown.isSufficient ? "bg-indigo-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  ملخص خصم الرصيد قبل بدء المعالجة
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  حساب شفاف ودقيق للمدة والدقائق المستهلكة من رصيدك
                </p>
              </div>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-medium">رصيدك الحالي</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {quota !== null ? `${quota} دقيقة` : "..."}
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            {/* Audio Cost Badge */}
            {hasAudio ? (
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileAudio className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block leading-tight">تسجيل المحاضرة:</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {formatDuration(totalAudioSeconds)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                  -{quotaCostBreakdown.audioCostMinutes} دقيقة
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-slate-400 text-xs">
                <FileAudio className="w-4 h-4 shrink-0 opacity-50" />
                <span>لم يتم إرفاق تسجيل صوتي</span>
              </div>
            )}

            {/* PDF Cost Badge */}
            {hasPdf ? (
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block leading-tight">سلايدات المحاضرة:</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {quotaCostBreakdown.selectedPages} شريحة مختارة
                    </span>
                  </div>
                </div>
                {hasAudio ? (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-md">
                    مشمولة برصيد الصوت (0 دقيقة إضافية)
                  </span>
                ) : (
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0 tabular-nums bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-md">
                    -{quotaCostBreakdown.docCostMinutes} دقيقة
                  </span>
                )}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-slate-400 text-xs">
                <FileText className="w-4 h-4 shrink-0 opacity-50" />
                <span>لم يتم إرفاق سلايدات</span>
              </div>
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 dark:text-slate-300">إجمالي الخصم من الرصيد:</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs">
                {quotaCostBreakdown.totalCost} دقيقة
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-bold">
              {quotaCostBreakdown.isSufficient ? (
                <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    رصيدك المتبقي بعد المعالجة:{" "}
                    <strong className="font-black tabular-nums">{quotaCostBreakdown.remainingAfter} دقيقة</strong>
                  </span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>ينقصك {quotaCostBreakdown.missingMinutes} دقيقة لإتمام العملية!</span>
                </span>
              )}
            </div>
          </div>

          {/* Insufficient Quota Action */}
          {!quotaCostBreakdown.isSufficient && (
            <div className="mt-3 pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                ⚠️ رصيدك الحالي لا يكفي. يمكنك تقليل عدد الصفحات أو شحن باقتك للمتابعة.
              </p>
              <Link
                href="/plans"
                prefetch={true}
                className="shrink-0 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <CreditCard className="w-3 h-3" />
                <span>شحن الرصيد</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quota Lock Banner if completely 0 and unpaid */}
      {quota !== null && quota <= 0 && !hasPaidPlan && (
        <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/40 p-4 text-right">
          <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
            🚫 رصيدك صفر دقيقة — يرجى شحن الرصيد للمتابعة.
          </p>
          <Link
            href="/plans"
            prefetch={true}
            className="mt-2.5 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" /> شحن الرصيد الآن
          </Link>
        </div>
      )}

      {/* Submit Action Button */}
      <div className="pt-2">
        <SmartGenerateButton
          onClick={onProcess}
          disabled={
            !hasFiles ||
            isAnyAudioUploading ||
            isPdfUploading ||
            isRangeInvalid ||
            (hasFiles && !quotaCostBreakdown.isSufficient)
          }
          isProcessing={isProcessing}
          quota={quota}
          text={
            isRangeInvalid
              ? "⚠️ نطاق الصفحات غير صحيح (البداية أكبر من النهاية)"
              : isAnyAudioUploading
              ? multiAudioFiles.length > 0
                ? `جاري رفع التسجيلات (${completedAudioCount}/${totalAudioCount})...`
                : `جاري رفع الملف الصوتي (${audioUploadProgress}%)...`
              : isPdfUploading
              ? `جاري رفع السلايدات (${pdfUploadProgress}%)...`
              : !quotaCostBreakdown.isSufficient && hasFiles
              ? `🚫 رصيدك غير كافٍ (المطلوب: ${quotaCostBreakdown.totalCost} دقيقة | المتوفر: ${quotaCostBreakdown.currentQuota} دقيقة)`
              : "ابدأ التلخيص الذكي وتوليد الملف المخطط"
          }
          loadingText="جاري التوليد والتلخيص..."
          variant="pill"
          size="md"
        />
      </div>
    </>
  );
}

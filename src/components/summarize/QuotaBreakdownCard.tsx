"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CreditCard } from "lucide-react";
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
  isAudioDurationPending?: boolean;
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
  isAudioDurationPending = false,
  isProcessing,
  audioUploadProgress,
  pdfUploadProgress,
  multiAudioFiles,
  completedAudioCount,
  totalAudioCount,
  onProcess,
}: QuotaBreakdownCardProps) {
  const hasFiles = hasAudio || hasPdf;
  const isInsufficient = hasFiles && !quotaCostBreakdown.isSufficient;

  return (
    <>
      {/* Insufficient Quota Banner (only rendered if balance is truly deficient) */}
      {isInsufficient && (
        <div className="mb-4 p-3.5 rounded-2xl border bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-right">
          <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">
              رصيدك الحالي ({quota !== null ? `${quota} دقيقة` : "0"}) لا يكفي لمعالجة هذه المحاضرة ({quotaCostBreakdown.totalCost} دقيقة).
            </span>
          </div>
          <Link
            href="/plans"
            prefetch={true}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" /> شحن الرصيد الآن
          </Link>
        </div>
      )}

      {/* Transparent Combined Cost Breakdown Pill (Audio + Slides) */}
      {hasAudio && hasPdf && quotaCostBreakdown.totalCost > 0 && (
        <div className="mb-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-[11px] text-slate-500">تفصيل الخصم من الرصيد:</span>
          <div className="flex items-center gap-1.5 font-bold tabular-nums text-[11px]">
            <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-0.5 rounded-md">
              🎙️ {quotaCostBreakdown.audioCostMinutes} د صوت
            </span>
            <span className="text-slate-400 font-normal">+</span>
            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 px-2 py-0.5 rounded-md">
              📄 {quotaCostBreakdown.docCostMinutes} د سلايدات
            </span>
            <span className="text-slate-400 font-normal">=</span>
            <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-black">
              ⚡ {quotaCostBreakdown.totalCost} دقيقة
            </span>
          </div>
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
            isAudioDurationPending ||
            (hasFiles && !quotaCostBreakdown.isSufficient)
          }
          isProcessing={isProcessing}
          quota={quota}
          text={
            isRangeInvalid
              ? "⚠️ نطاق الصفحات غير صحيح (البداية أكبر من النهاية)"
              : isAudioDurationPending
              ? "⏳ جاري فحص وحساب مدة التسجيلات والتكلفة..."
              : isAnyAudioUploading
              ? multiAudioFiles.length > 0
                ? `جاري رفع التسجيلات (${completedAudioCount}/${totalAudioCount})...`
                : `جاري رفع الملف الصوتي (${audioUploadProgress}%)...`
              : isPdfUploading
              ? `جاري رفع السلايدات (${pdfUploadProgress}%)...`
              : !quotaCostBreakdown.isSufficient && hasFiles
              ? `🚫 رصيدك غير كافٍ (المطلوب: ${quotaCostBreakdown.totalCost} دقيقة | المتوفر: ${quotaCostBreakdown.currentQuota} دقيقة)`
              : multiAudioFiles.length > 0 && completedAudioCount < totalAudioCount && completedAudioCount > 0
              ? `⚡ بدء التلخيص للمقاطع الجاهزة (${completedAudioCount} من ${totalAudioCount} جاهز)`
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

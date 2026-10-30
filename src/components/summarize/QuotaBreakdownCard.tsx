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

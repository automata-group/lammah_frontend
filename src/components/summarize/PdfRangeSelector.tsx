"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  Check,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Info,
  Clock,
  Layers
} from "lucide-react";

export interface PdfRangeSelectorProps {
  file: File | null;
  startPage: string;
  endPage: string;
  onRangeChange: (start: string, end: string) => void;
  onTotalPagesDetected?: (pages: number | null) => void;
  disabled?: boolean;
}

export default function PdfRangeSelector({
  file,
  startPage,
  endPage,
  onRangeChange,
  onTotalPagesDetected,
  disabled = false,
}: PdfRangeSelectorProps) {
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [isPptxFile, setIsPptxFile] = useState<boolean>(false);

  // Instant client-side page detection using pdf-lib (0ms server latency)
  useEffect(() => {
    let isCancelled = false;

    if (!file) {
      setTotalPages(null);
      onTotalPagesDetected?.(null);
      setIsDetecting(false);
      setDetectError(null);
      setIsPptxFile(false);
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    const isPptx = fileNameLower.endsWith(".pptx") || fileNameLower.endsWith(".ppt");
    const isPdf = file.type === "application/pdf" || fileNameLower.endsWith(".pdf");

    if (isPptx) {
      setIsPptxFile(true);
      setTotalPages(null);
      onTotalPagesDetected?.(null);
      setIsDetecting(false);
      setDetectError(null);
      return;
    }

    setIsPptxFile(false);

    if (!isPdf) {
      setTotalPages(null);
      onTotalPagesDetected?.(null);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);
    setDetectError(null);

    const loadDoc = async () => {
      try {
        const buffer = await file.arrayBuffer();
        // Load with ignoreEncryption to avoid throwing on password-empty or mildly encrypted PDFs
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        if (!isCancelled) {
          const count = pdfDoc.getPageCount();
          setTotalPages(count);
          onTotalPagesDetected?.(count);
          setIsDetecting(false);
        }
      } catch (err: any) {
        console.warn("[PdfRangeSelector] pdf-lib extraction warning:", err);
        if (!isCancelled) {
          setDetectError("تعذر قراءة عدد الصفحات آلياً (قد يكون الملف محمياً). يمكنك كتابة الأرقام يدوياً.");
          setIsDetecting(false);
        }
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  // Numerical conversions & Validation
  const parsedStart = useMemo(() => {
    const val = parseInt(startPage, 10);
    return isNaN(val) ? null : val;
  }, [startPage]);

  const parsedEnd = useMemo(() => {
    const val = parseInt(endPage, 10);
    return isNaN(val) ? null : val;
  }, [endPage]);

  // Validation Flags
  const validationError = useMemo(() => {
    if (parsedStart !== null && parsedStart < 1) {
      return "بداية النطاق يجب أن تكون من الصفحة 1 على الأقل.";
    }
    if (totalPages !== null) {
      if (parsedStart !== null && parsedStart > totalPages) {
        return `بداية النطاق (${parsedStart}) تتجاوز إجمالي صفحات الملف (${totalPages}).`;
      }
      if (parsedEnd !== null && parsedEnd > totalPages) {
        return `نهاية النطاق (${parsedEnd}) تتجاوز إجمالي صفحات الملف (${totalPages}).`;
      }
    }
    if (parsedStart !== null && parsedEnd !== null && parsedStart > parsedEnd) {
      return `صفحة البداية (${parsedStart}) يجب أن تكون أقل من أو تساوي صفحة النهاية (${parsedEnd}).`;
    }
    return null;
  }, [parsedStart, parsedEnd, totalPages]);

  // Calculate selected range summary
  const summary = useMemo(() => {
    if (!totalPages && parsedStart === null && parsedEnd === null) return null;

    const effectiveStart = parsedStart ?? 1;
    const effectiveEnd = parsedEnd ?? totalPages ?? effectiveStart;

    if (effectiveStart > effectiveEnd) return null;

    const count = effectiveEnd - effectiveStart + 1;
    const isFull = (effectiveStart === 1 && (totalPages ? effectiveEnd === totalPages : parsedEnd === null));

    // Quota math: 1 minute per 2 slides, minimum 3 minutes
    let fullCost = totalPages ? Math.max(3, Math.ceil(totalPages / 2)) : 0;
    let selectedCost = Math.max(3, Math.ceil(count / 2));
    let savedMinutes = Math.max(0, fullCost - selectedCost);

    return {
      effectiveStart,
      effectiveEnd,
      count,
      isFull,
      savedMinutes,
      hasSavings: !isFull && savedMinutes > 0,
    };
  }, [totalPages, parsedStart, parsedEnd]);

  // Quick Preset Handlers
  const applyPreset = useCallback((start: number, end: number) => {
    if (disabled) return;
    onRangeChange(String(start), String(end));
  }, [disabled, onRangeChange]);

  const clearRange = useCallback(() => {
    if (disabled) return;
    onRangeChange("", "");
  }, [disabled, onRangeChange]);

  // Step Helpers
  const handleStepStart = (delta: number) => {
    if (disabled) return;
    const current = parsedStart ?? 1;
    const nextVal = Math.max(1, current + delta);
    if (totalPages && nextVal > totalPages) return;
    if (parsedEnd !== null && nextVal > parsedEnd) {
      onRangeChange(String(nextVal), String(nextVal));
    } else {
      onRangeChange(String(nextVal), endPage);
    }
  };

  const handleStepEnd = (delta: number) => {
    if (disabled) return;
    const current = parsedEnd ?? (totalPages ?? (parsedStart ?? 1));
    const nextVal = Math.max(1, current + delta);
    if (totalPages && nextVal > totalPages) return;
    if (parsedStart !== null && nextVal < parsedStart) {
      onRangeChange(String(nextVal), String(nextVal));
    } else {
      onRangeChange(startPage, String(nextVal));
    }
  };

  const hasRangeSet = Boolean(startPage || endPage);

  return (
    <div
      className="w-full mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-right select-none transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header bar: Title + Total Pages Detection Pill + Reset Button */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            نطاق الصفحات / الشرائح
          </span>

          {/* Live Page Detection Badge */}
          {isDetecting ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              جاري كشف الصفحات...
            </span>
          ) : totalPages !== null ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
              <Layers className="w-3 h-3 text-emerald-500" />
              <span>{totalPages} شريحة</span>
            </span>
          ) : isPptxFile ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
              <span>عرض تقديمي PPTX</span>
            </span>
          ) : null}
        </div>

        {hasRangeSet && (
          <button
            type="button"
            onClick={clearRange}
            disabled={disabled}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            title="إلغاء التحديد وتضمين كامل الملف"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إلغاء التحديد (الكل)</span>
          </button>
        )}
      </div>

      {/* Quick Preset Chips for 1-Click Selection (The Naive User's Dream) */}
      {totalPages !== null && totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Preset: All Pages */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => applyPreset(1, totalPages)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              summary?.isFull || (!startPage && !endPage)
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
            }`}
          >
            <span>كامل الملف</span>
            <span className="text-[10px] opacity-75">({totalPages})</span>
          </button>

          {/* Preset: First 10 Pages */}
          {totalPages >= 10 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(1, 10)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                parsedStart === 1 && parsedEnd === 10
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <span>أول 10 شرائح</span>
            </button>
          )}

          {/* Preset: First 20 Pages */}
          {totalPages >= 20 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(1, 20)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                parsedStart === 1 && parsedEnd === 20
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <span>أول 20 شريحة</span>
            </button>
          )}

          {/* Preset: First Half */}
          {totalPages >= 6 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(1, Math.ceil(totalPages / 2))}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                parsedStart === 1 && parsedEnd === Math.ceil(totalPages / 2)
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <span>النصف الأول</span>
              <span className="text-[10px] opacity-75">(1-{Math.ceil(totalPages / 2)})</span>
            </button>
          )}

          {/* Preset: Second Half */}
          {totalPages >= 6 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(Math.ceil(totalPages / 2) + 1, totalPages)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                parsedStart === Math.ceil(totalPages / 2) + 1 && parsedEnd === totalPages
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <span>النصف الثاني</span>
              <span className="text-[10px] opacity-75">({Math.ceil(totalPages / 2) + 1}-{totalPages})</span>
            </button>
          )}
        </div>
      )}

      {/* Input Controls Row: Start Page & End Page */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Start Page Input with +/- Stepper */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              من شريحة:
            </label>
            <span className="text-[10px] text-slate-400 font-mono">1</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={disabled || (parsedStart !== null && parsedStart <= 1)}
              onClick={() => handleStepStart(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-black text-sm shrink-0"
              title="إنقاص شريحة"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={totalPages ?? undefined}
              placeholder="1"
              value={startPage}
              disabled={disabled}
              onChange={(e) => onRangeChange(e.target.value, endPage)}
              className={`w-full text-xs font-black px-2 py-1.5 rounded-lg border text-center transition-all focus:outline-none focus:ring-2 ${
                validationError && parsedStart !== null && (parsedStart < 1 || (totalPages && parsedStart > totalPages) || (parsedEnd !== null && parsedStart > parsedEnd))
                  ? "border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 focus:ring-rose-400"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500"
              }`}
            />
            <button
              type="button"
              disabled={disabled || (totalPages !== null && parsedStart !== null && parsedStart >= totalPages)}
              onClick={() => handleStepStart(1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-black text-sm shrink-0"
              title="زيادة شريحة"
            >
              +
            </button>
          </div>
        </div>

        {/* End Page Input with +/- Stepper */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              إلى شريحة:
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {totalPages ? totalPages : "النهاية"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={disabled || (parsedEnd !== null && parsedEnd <= 1)}
              onClick={() => handleStepEnd(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-black text-sm shrink-0"
              title="إنقاص شريحة"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={totalPages ?? undefined}
              placeholder={totalPages ? String(totalPages) : "النهاية"}
              value={endPage}
              disabled={disabled}
              onChange={(e) => onRangeChange(startPage, e.target.value)}
              className={`w-full text-xs font-black px-2 py-1.5 rounded-lg border text-center transition-all focus:outline-none focus:ring-2 ${
                validationError && parsedEnd !== null && ((totalPages && parsedEnd > totalPages) || (parsedStart !== null && parsedStart > parsedEnd))
                  ? "border-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 focus:ring-rose-400"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500"
              }`}
            />
            <button
              type="button"
              disabled={disabled || (totalPages !== null && parsedEnd !== null && parsedEnd >= totalPages)}
              onClick={() => handleStepEnd(1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-black text-sm shrink-0"
              title="زيادة شريحة"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Validation Feedback Warning (if any) */}
      {validationError && (
        <div className="mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Non-fatal Detection warning */}
      {detectError && (
        <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[10px] font-medium flex items-center gap-1.5">
          <Info className="w-3 h-3 shrink-0" />
          <span>{detectError}</span>
        </div>
      )}

      {/* Contextual Quota Savings Banner & Live Feedback */}
      {!validationError && summary && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200 font-bold min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="truncate">
              {summary.isFull
                ? `سيتم معالجة كامل الملف (${summary.count} شريحة).`
                : `سيتم تلخيص النطاق المحدد: من ${summary.effectiveStart} إلى ${summary.effectiveEnd} (${summary.count} شريحة).`}
            </span>
          </div>

          {summary.hasSavings && (
            <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 font-black text-[10px] flex items-center gap-1">
              <span>توفير ~{summary.savedMinutes} دقيقة رصيد ⚡</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

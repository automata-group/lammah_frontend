"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Lock, Download, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiConfig";

interface DashboardPdfViewerProps {
  pdfContainerRef: React.RefObject<HTMLDivElement | null>;
  pdfFlash: number | null;
  downloadUrl: string;
  pdfPage: number;
  isBasicPlan: boolean;
  lectureTitle: string;
  isDocumentOnly?: boolean;
}

export default function DashboardPdfViewer({
  pdfContainerRef,
  pdfFlash,
  downloadUrl,
  pdfPage,
  isBasicPlan,
  lectureTitle,
  isDocumentOnly,
}: DashboardPdfViewerProps) {
  const router = useRouter();
  const apiUrl = getApiBaseUrl();

  const [hasPdfError, setHasPdfError] = useState<boolean>(false);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const cleanTitle = (lectureTitle || "المادة الدراسية")
    .replace(/^محاضرة\s+/, "")
    .replace(/^(?:دفتر|ملف)\s+/, "")
    .replace(/[\\/*?:"<>|]/g, " ")
    .trim() || "المادة الدراسية";
  const isPrep = !!isDocumentOnly;
  const suggestedFilename = `${cleanTitle} - ${isPrep ? "تحضير سلايدات" : "مخططة فويسات"} - لمّاح.pdf`;
  const sep = downloadUrl.includes("?") ? "&" : "?";
  const fullDownloadUrl = `${apiUrl}${downloadUrl}${sep}title=${encodeURIComponent(cleanTitle)}&is_prep=${isPrep}`;

  useEffect(() => {
    let isMounted = true;
    let currentObjectUrl: string | null = null;
    const abortController = new AbortController();

    if (!downloadUrl) return;

    let retryTimer: NodeJS.Timeout | null = null;
    let attempts = 0;

    const loadPdfBlob = async () => {
      setIsPdfLoading(true);
      setHasPdfError(false);

      try {
        const res = await fetch(fullDownloadUrl, {
          signal: abortController.signal,
        });

        if (!isMounted) return;

        // If 404, retry up to 3 times in case the file is still flushing to disk
        if (res.status === 404 && attempts < 3) {
          attempts++;
          retryTimer = setTimeout(loadPdfBlob, attempts * 1000);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          throw new Error("Received JSON instead of PDF");
        }

        const blob = await res.blob();
        if (!isMounted) return;

        if (blob.size < 100) {
          throw new Error("PDF blob too small or corrupted");
        }

        const objectUrl = URL.createObjectURL(blob);
        currentObjectUrl = objectUrl;
        setBlobUrl(objectUrl);
        setHasPdfError(false);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error loading PDF blob:", err);
        if (isMounted) {
          setHasPdfError(true);
        }
      } finally {
        if (isMounted) {
          setIsPdfLoading(false);
        }
      }
    };

    loadPdfBlob();

    return () => {
      isMounted = false;
      abortController.abort();
      if (retryTimer) clearTimeout(retryTimer);
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [fullDownloadUrl, downloadUrl, retryCount]);

  return (
    <div
      ref={pdfContainerRef}
      className={`bg-white dark:bg-[#0b0f19] border p-3.5 sm:p-5 rounded-2xl shadow-xs relative overflow-hidden group z-10 transition-all duration-500 ${
        pdfFlash
          ? "border-indigo-500 ring-4 ring-indigo-500/40 shadow-2xl scale-[1.008]"
          : "border-slate-200/90 dark:border-slate-800"
      }`}
    >
      {pdfFlash && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>تم الانتقال والتوسيط على الشريحة {pdfFlash}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-xs shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
              ملف التلخيص المخطط
            </h2>
          </div>
        </div>

        {isBasicPlan ? (
          <Link
            href="/plans"
            prefetch={true}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/80 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center shadow-xs hover:shadow-sm w-full sm:w-auto text-center justify-center text-xs cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 ml-1.5 text-amber-500" /> تنزيل الملف المخطط (للمشتركين)
          </Link>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={fullDownloadUrl}
              download={suggestedFilename}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center shadow-xs shadow-indigo-500/20 hover:shadow-indigo-500/30 w-full sm:w-auto text-center justify-center text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 ml-1.5" />
              تحميل الملف
            </a>
          </div>
        )}
      </div>

      <div className="relative rounded-xl p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-inner">
        {hasPdfError ? (
          <div className="w-full min-h-[380px] sm:min-h-[500px] rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5 shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-2">
              تعذّر عرض ملف الـ PDF المخطط حالياً
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md leading-relaxed mb-4">
              قد يكون الملف قيد الحفظ على الخادم، أو حدث تأخير في الاتصال. يمكنك مراجعة مواضع الأسئلة والتركيز والبطاقات والاختبار مباشرة، أو تجربة تحميل الملف أو إعادة المحاولة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href={fullDownloadUrl}
                download={suggestedFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل الملف المخطط</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setHasPdfError(false);
                  setRetryCount((c) => c + 1);
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة وعرض الملف</span>
              </button>
              <Link
                href="/summarize"
                prefetch={true}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold transition cursor-pointer"
              >
                <span>إعادة تلخيص المحاضرة</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            {isPdfLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs rounded-lg transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin mb-3" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  جاري تحميل وعرض الملف المخطط...
                </span>
              </div>
            )}
            {blobUrl ? (
              <iframe
                key={blobUrl}
                src={`${blobUrl}#page=${pdfPage || 1}`}
                onLoad={() => setIsPdfLoading(false)}
                className="w-full h-[400px] sm:h-[550px] lg:h-[700px] rounded-lg bg-white dark:bg-slate-950 transition-all border border-slate-200 dark:border-slate-900"
              />
            ) : (
              <div className="w-full h-[400px] sm:h-[550px] lg:h-[700px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useRef } from "react";
import { FileText, CheckCircle, X } from "lucide-react";
import PdfRangeSelector from "./PdfRangeSelector";
import { QuotaCostBreakdown } from "./types";
import { getUploaderBaseUrl, getApiBaseUrl } from "@/lib/apiConfig";

interface SlidesUploadCardProps {
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  pdfTempId: string | null;
  setPdfTempId: (id: string | null) => void;
  pdfUploadProgress: number;
  setPdfUploadProgress: (prog: number) => void;
  isPdfUploading: boolean;
  setIsPdfUploading: (val: boolean) => void;
  startPage: string;
  setStartPage: (val: string) => void;
  endPage: string;
  setEndPage: (val: string) => void;
  pdfDetectedPages: number | null;
  setPdfDetectedPages: (pages: number | null) => void;
  quotaCostBreakdown: QuotaCostBreakdown;
  hasAudio: boolean;
  isProcessing: boolean;
  isStreaming: boolean;
  setError: (err: string | null) => void;
  session: any;
}

export default function SlidesUploadCard({
  pdfFile,
  setPdfFile,
  pdfTempId,
  setPdfTempId,
  pdfUploadProgress,
  setPdfUploadProgress,
  isPdfUploading,
  setIsPdfUploading,
  startPage,
  setStartPage,
  endPage,
  setEndPage,
  pdfDetectedPages,
  setPdfDetectedPages,
  quotaCostBreakdown,
  hasAudio,
  isProcessing,
  isStreaming,
  setError,
  session,
}: SlidesUploadCardProps) {
  const activeXhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadPdf = useCallback(async (file: File) => {
    setIsPdfUploading(true);
    setPdfUploadProgress(0);

    // Resolve token safely
    let token = session?.access_token;
    if (!token && typeof window !== "undefined") {
      try {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token;
      } catch {}
    }

    if (!token) {
      setError("🔒 يرجى تسجيل الدخول بحسابك أولاً لتتمكن من رفع السلايدات.");
      setIsPdfUploading(false);
      setPdfFile(null);
      return;
    }

    const uploaderUrl = getUploaderBaseUrl();
    const apiUrl = getApiBaseUrl();
    const endpoints = [
      `${uploaderUrl}/api/v1/summarize/upload-temp`,
      `${apiUrl}/api/v1/summarize/upload-temp-py`,
    ];
    const uniqueEndpoints = Array.from(new Set(endpoints));

    let lastError = "فشل رفع السلايدات";

    for (let attempt = 0; attempt < uniqueEndpoints.length; attempt++) {
      const url = uniqueEndpoints[attempt];
      try {
        const tempId = await new Promise<string>((resolve, reject) => {
          const formData = new FormData();
          formData.append("file", file);

          const xhr = new XMLHttpRequest();
          activeXhrRef.current = xhr;

          xhr.open("POST", url, true);
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setPdfUploadProgress(pct);
            }
          };

          xhr.onload = () => {
            activeXhrRef.current = null;
            if (xhr.status === 200) {
              try {
                const res = JSON.parse(xhr.responseText);
                if (res.temp_id) {
                  resolve(res.temp_id);
                } else {
                  reject(new Error("استجابة غير صالحة"));
                }
              } catch {
                reject(new Error("فشل فك استجابة السيرفر"));
              }
            } else {
              let msg = "";
              try {
                const parsed = JSON.parse(xhr.responseText);
                msg = parsed.detail?.user_message || (typeof parsed.detail === "string" ? parsed.detail : "") || parsed.message || "";
              } catch {
                msg = xhr.responseText || "";
              }
              if (xhr.status === 401 || xhr.status === 403) {
                reject(new Error(msg || "🔒 يرجى تسجيل الدخول بحسابك للمتابعة"));
              } else {
                reject(new Error(msg || `فشل الرفع (${xhr.status})`));
              }
            }
          };

          xhr.onerror = () => {
            activeXhrRef.current = null;
            reject(new Error("انقطاع في اتصال الشبكة"));
          };

          xhr.send(formData);
        });

        setPdfTempId(tempId);
        setPdfUploadProgress(100);
        setIsPdfUploading(false);
        return;
      } catch (err: any) {
        lastError = err.message || lastError;
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setIsPdfUploading(false);
    activeXhrRef.current = null;
    setError(`تعذر رفع ملف السلايدات «${file.name}»: ${lastError}`);
    setPdfFile(null);
  }, [session, setIsPdfUploading, setPdfUploadProgress, setPdfTempId, setError, setPdfFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setPdfFile(file);
      setPdfUploadProgress(0);
      setPdfTempId(null);
      uploadPdf(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
    }
    setPdfFile(null);
    setPdfTempId(null);
    setStartPage("");
    setEndPage("");
    setPdfDetectedPages(null);
    setIsPdfUploading(false);
    setPdfUploadProgress(0);
  };

  return (
    <div
      className={`relative group rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-center min-h-[160px] ${
        pdfFile
          ? "bg-slate-50/90 dark:bg-slate-900/60 border-indigo-500/60 dark:border-indigo-500/40 ring-1 ring-indigo-500/20"
          : "bg-white dark:bg-slate-900/30 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30"
      }`}
    >
      <input
        type="file"
        accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />

      {pdfFile ? (
        <div className="w-full z-20 relative flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                {isPdfUploading ? (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {pdfUploadProgress}%
                  </span>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate" dir="ltr">
                  {pdfFile.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {isPdfUploading ? (
                    <span className="text-[11px] text-slate-400 font-medium">جاري الرفع...</span>
                  ) : (
                    <>
                      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 px-2 py-0.5 rounded-md tabular-nums">
                        📄 {quotaCostBreakdown.selectedPages} شريحة
                      </span>
                      {hasAudio ? (
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                          مشمولة برصيد الصوت
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800 px-2 py-0.5 rounded-md tabular-nums">
                          ⚡ سيخصم: {quotaCostBreakdown.docCostMinutes} دقيقة
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
              title="إزالة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zero-Lag PDF Range Selector */}
          <PdfRangeSelector
            file={pdfFile}
            startPage={startPage}
            endPage={endPage}
            onRangeChange={(s, e) => {
              setStartPage(s);
              setEndPage(e);
            }}
            onTotalPagesDetected={(count) => {
              setPdfDetectedPages(count);
            }}
            disabled={isProcessing || isStreaming}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">سلايدات المحاضرة</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            اسحب السلايدات هنا أو{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">اختر ملفاً</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">PDF, PPTX</span>
        </div>
      )}
    </div>
  );
}

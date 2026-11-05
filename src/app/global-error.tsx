"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = String(error?.message || error?.name || error || "");
    if (
      msg.includes("ChunkLoadError") ||
      msg.includes("Failed to load chunk") ||
      msg.includes("Loading chunk")
    ) {
      const key = "last_global_chunk_reload";
      const last = sessionStorage.getItem(key);
      const now = Date.now();
      if (!last || now - Number(last) > 8000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-1">تحديث جديد للمنصة</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              تم إطلاق تحديث جديد لنظام لمّاح. يرجى تحديث الصفحة للمتابعة بأحدث إصدار مستقر.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                sessionStorage.setItem("last_global_chunk_reload", String(Date.now()));
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-md shadow-indigo-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تحديث الصفحة الآن</span>
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

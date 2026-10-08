"use client";

import React, { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = error?.message || "";
    if (
      msg.includes("ChunkLoadError") ||
      msg.includes("Failed to load chunk") ||
      msg.includes("Loading chunk")
    ) {
      const key = "last_chunk_reload";
      const last = sessionStorage.getItem(key);
      const now = Date.now();
      if (!last || now - Number(last) > 10000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-[#0b0f19] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <RotateCcw className="w-6 h-6 animate-spin-reverse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            تم تحديث المنصة بنسخة جديدة
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            تم إطلاق تحديثات جديدة لتحسين تجربة الاستخدام. يرجى إعادة تحميل الصفحة لمتابعة استخدام لمّاح.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition cursor-pointer"
        >
          تحديث الصفحة الآن
        </button>
      </div>
    </div>
  );
}

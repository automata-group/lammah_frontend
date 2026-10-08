"use client";

import React, { useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { BookOpen, RotateCcw } from "lucide-react";

export default function NotebookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Notebook Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans" dir="rtl">
      <AppHeader activePage="notebook" />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black mb-2">تعذر فتح صفحة الدفتر مؤقتاً</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          حدث خطأ غير متوقع أثناء تحميل بيانات الدفتر. اضغط على الزر أدناه لإعادة المحاولة فوراً.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    </div>
  );
}

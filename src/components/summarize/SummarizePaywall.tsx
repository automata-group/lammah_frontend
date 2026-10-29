"use client";

import React from "react";
import Link from "next/link";
import { Lock, PenTool, ArrowLeft, CreditCard, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SummarizePaywall() {
  return (
    <motion.div
      key="paywall"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center mx-auto text-slate-800 dark:text-slate-200">
          <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <span>الخدمة تتطلب اشتراكاً نشطاً</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            معالجة المحاضرات مقفلة حالياً
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
            رصيدك الحالي 0 دقيقة. رفع وتلخيص المحاضرات بواسطة الذكاء الاصطناعي يتطلب باقة نشطة. اختر باقتك للمتابعة.
          </p>
        </div>

        {/* Free Tool Callout */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-right flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>مساحة «دوّن ملاحظاتك» متاحة مجاناً</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              بإمكانك فتح ملفات السلايدات وتخطيطها وتظليلها يدوياً بحرية تامة دون اشتراك.
            </p>
          </div>
          <Link
            href="/study"
            prefetch={true}
            className="w-full sm:w-auto shrink-0 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>فتح دوّن ملاحظاتك</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Link
            href="/plans"
            prefetch={true}
            className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>عرض الباقات والاشتراك</span>
          </Link>
          <a
            href="https://wa.me/972598298930?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%D9%8A%20%D9%81%D9%8A%20%D9%84%D9%85%D9%91%D8%A7%D8%AD"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold px-5 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل عبر واتساب للتفعيل</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

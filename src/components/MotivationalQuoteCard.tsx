"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Quote, RefreshCw, Copy, Check, Flame } from "lucide-react";

export const MOTIVATIONAL_QUOTES = [
  {
    quote: "تعب اليوم هو فخر الغد وشهادتك التي ستعتز بها للأبد.. استمر، أنت تصنع مستقبلك الآن بكل خطوة تخطوها!",
    author: "وقود الهمّة",
    tag: "إصرار 🚀"
  },
  {
    quote: "النجاح الأكاديمي ليس صدفة أبداً، بل هو تراكم لحظات صغيرة من التركيز والاجتهاد يومياً حين يختار غيرك الراحة.",
    author: "قانون الإنجاز",
    tag: "تركيز 🎯"
  },
  {
    quote: "كل مسألة صعبة أو فكرة معقدة تفهمها اليوم هي درجة إضافية تقرّبك من حلمك والتفوق الذي تستحقه.",
    author: "خطوة بخطوة",
    tag: "تفوق 🌟"
  },
  {
    quote: "لا تقلق بشأن ضخامة المادة، قسّمها خطوات بسيطة وابدأ بالفكرة الأولى، ولمّاح معك يسندك خطوة بخطوة!",
    author: "ذكاء الدراسة",
    tag: "انطلاقة 💡"
  },
  {
    quote: "العلم هو الاستثمار الوحيد الذي يدفع لك أعلى عائد أرباح في حياتك، وكل جهد تبذله محفوظ في ميزانك.",
    author: "بناء المستقبل",
    tag: "استثمار 🧠"
  },
  {
    quote: "اجعل دراستك عبادة ونية خير؛ فإن طلب العلم رفعة لك في الدنيا والآخرة، والله لا يُضيع أجر من أحسن عملاً.",
    author: "بركة العلم",
    tag: "طمأنينة 🤍"
  },
  {
    quote: "لا تنتظر المزاج المثالي لتبدأ المذاكرة؛ البدء والإنجاز هما اللذان يصنعان المزاج العالي والشغف!",
    author: "اكسر التسويف",
    tag: "حماس ⚡"
  },
  {
    quote: "الصعوبة التي تجدها الآن في الفهم هي علامة أن عقلك يتطور ويتسع لاستيعاب آفاق جديدة.",
    author: "عقلية النمو",
    tag: "تطور 🏆"
  },
  {
    quote: "أنت لست متأخراً ولست وحدك.. اليوم هو أفضل يوم لتبدأ صفحة جديدة وتصل لأعلى الدرجات.",
    author: "بداية جديدة",
    tag: "أمل 🌱"
  }
];

export default function MotivationalQuoteCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Initialize with a pseudo-random index based on day or random
  useEffect(() => {
    const saved = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setCurrentIndex(saved);
  }, []);

  const handleNext = () => {
    setIsRotating(true);
    setCurrentIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    setTimeout(() => setIsRotating(false), 500);
  };

  const current = MOTIVATIONAL_QUOTES[currentIndex];

  const handleCopy = () => {
    if (!current) return;
    navigator.clipboard.writeText(`"${current.quote}" - من منصة لمّاح`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!current) return null;

  return (
    <>
      {/* Mobile Compact Capsule View (< sm) */}
      <div className="flex sm:hidden items-center justify-between gap-2.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-purple-500/10 dark:from-amber-500/15 dark:via-indigo-500/10 dark:to-purple-500/15 border border-amber-200/80 dark:border-amber-500/20 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300/80 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight"
            >
              «{current.quote}»
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs active:scale-90 transition cursor-pointer"
            title="عبارة أخرى"
          >
            <RefreshCw className={`w-3 h-3 text-amber-500 ${isRotating ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs active:scale-90 transition cursor-pointer"
            title="نسخ العبارة"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Desktop Full Card View (>= sm) */}
      <div className="hidden sm:block relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-purple-500/10 dark:from-amber-500/15 dark:via-indigo-500/10 dark:to-purple-500/15 border border-amber-200/70 dark:border-amber-500/20 p-5 sm:p-6 backdrop-blur-xl shadow-xs transition-all">
        {/* Background Decorative Accents */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Quote Content */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs mt-0.5">
              <Quote className="w-5 h-5 rotate-180" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                  <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>جرعة تحفيزية لليوم</span>
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed"
                >
                  «{current.quote}»
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-1 md:pt-0">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
              title="نسخ العبارة"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">نسخ</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="عبارة تحفيزية أخرى"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRotating ? "animate-spin" : ""}`} />
              <span className="text-[11px]">عبارة أخرى ⚡</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles, Check, FileText, FileAudio } from "lucide-react";
import { PipelineStep } from "@/types/dashboard";
import { DHIKR_PHRASES, DHIKR_VIRTUES } from "@/lib/dashboardUtils";

interface DashboardProcessingScreenProps {
  isDocumentOnly: boolean;
  activeFileName: string;
  queuePosition: number;
  timeLeft: number | null;
  progressStep: string;
  progressPercent: number;
  currentPipelineSteps: PipelineStep[];
  activeStepIdx: number;
}

export default function DashboardProcessingScreen({
  isDocumentOnly,
  activeFileName,
  queuePosition,
  timeLeft,
  progressStep,
  progressPercent,
  currentPipelineSteps,
  activeStepIdx,
}: DashboardProcessingScreenProps) {
  // Dhikr Counter internal state
  const [dhikrTotal, setDhikrTotal] = useState(0);
  const [dhikrCurrentPhaseCount, setDhikrCurrentPhaseCount] = useState(0);
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState(0);
  const [dhikrBurst, setDhikrBurst] = useState<number | null>(null);

  useEffect(() => {
    if (!dhikrBurst) return;
    const timer = setTimeout(() => setDhikrBurst(null), 600);
    return () => clearTimeout(timer);
  }, [dhikrBurst]);

  const handleDhikrClick = () => {
    setDhikrTotal((prev) => prev + 1);
    setDhikrBurst(Date.now());
    const newPhaseCount = dhikrCurrentPhaseCount + 1;
    if (newPhaseCount >= 10) {
      setDhikrCurrentPhaseCount(0);
      setCurrentDhikrIndex((prev) => (prev + 1) % DHIKR_PHRASES.length);
    } else {
      setDhikrCurrentPhaseCount(newPhaseCount);
    }
  };

  return (
    <motion.div
      key="waiting"
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center py-1 sm:py-2 px-1 sm:px-2"
    >
      {/* Zero-Scroll SaaS Hero Card */}
      <div className="w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-indigo-100/90 dark:border-indigo-500/20 rounded-3xl p-4 sm:p-6 shadow-xl shadow-indigo-500/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden text-right">
        {/* Ambient Soft Glows */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Row 1: Header Bar (File Pill + Status/Queue Pill + Accurate Countdown Timer) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          {/* File Badge */}
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 px-3.5 py-1.5 rounded-xl max-w-xs sm:max-w-md truncate">
            {isDocumentOnly ? (
              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
            ) : (
              <FileAudio className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight">
                {isDocumentOnly ? "المستند قيد التلخيص:" : "المحاضرة قيد التفريغ:"}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 truncate">
                {activeFileName}
              </span>
            </div>
          </div>

          {/* Center: Live Active Status Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-black">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span>معالجة نشطة وفورية</span>
            </div>
          </div>
        </div>

        {/* Row 2: Header Headline & Live Dynamic Progress Message */}
        <div className="my-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isDocumentOnly ? "جاري تحويل السلايدات إلى ملف مخطط ومظلل" : "جاري تفريغ وتلخيص المحاضرة عبر لمّاح"}</span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              {progressStep ||
                (isDocumentOnly
                  ? "استخراج النصوص وتحليل الشرائح وصياغة الكبسولات الذكية وتنسيق الملف المخطط والمظلل..."
                  : "تحويل الصوت لنص ومطابقته مع السلايدات وتوليد الملاحظات...")}
            </p>
          </div>

          <div className="text-left shrink-0">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-500/20 px-2.5 py-1 rounded-lg">
              {progressPercent}% مكتمل
            </span>
          </div>
        </div>

        {/* Row 3: Sleek Dynamic Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative z-10 mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full shadow-xs"
            initial={{ width: "10%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 45, damping: 15 }}
          />
        </div>

        {/* Row 4: 4 Distinct Contextual Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4 relative z-10">
          {currentPipelineSteps.map((step, idx) => {
            const isDone = idx < activeStepIdx;
            const isActive = idx === activeStepIdx;
            const IconComponent = step.icon;

            return (
              <div
                key={step.id}
                className={`flex flex-col p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500/60 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30 scale-[1.02]"
                    : isDone
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400/40 opacity-90"
                    : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 opacity-60"
                }`}
              >
                {/* Top Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs animate-pulse"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                  </div>

                  <IconComponent
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 animate-bounce"
                        : isDone
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  />
                </div>

                {/* Title & Desc */}
                <h4
                  className={`text-xs sm:text-[13px] font-black leading-snug line-clamp-2 min-h-[2.1rem] flex items-center justify-center text-center ${
                    isActive
                      ? "text-indigo-950 dark:text-indigo-200"
                      : isDone
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed text-center">
                  {step.shortDesc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Row 5: Creative Interactive Zen Dhikr Bar */}
        <motion.div
          role="button"
          tabIndex={0}
          onClick={handleDhikrClick}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              handleDhikrClick();
            }
          }}
          whileHover={{ scale: 1.006 }}
          whileTap={{ scale: 0.985 }}
          className="relative overflow-hidden cursor-pointer select-none rounded-2xl p-3 sm:p-3.5 border border-emerald-300/80 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 shadow-xs hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-400/50 transition-all duration-200 group z-10"
          title="انقر في أي مكان داخل هذا المستطيل للتسبيح والاستغفار"
        >
          {/* Fluid Progress Background Fill */}
          <div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-200/50 via-teal-200/40 to-transparent dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-transparent pointer-events-none transition-all duration-300 ease-out"
            style={{ width: `${(dhikrCurrentPhaseCount / 10) * 100}%` }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
            {/* Right side: Icon, Phrase, Virtue & Hint */}
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <motion.div
                key={dhikrCurrentPhaseCount}
                initial={{ scale: 0.85, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-lg shadow-xs"
              >
                🌿
              </motion.div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                    {DHIKR_PHRASES[currentDhikrIndex]}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700/50 hidden xs:inline-flex items-center gap-1">
                    <span>انقر في أي مكان للتسبيح 👆</span>
                  </span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700/90 dark:text-emerald-300/80 truncate mt-0.5">
                  {DHIKR_VIRTUES[currentDhikrIndex]}
                </span>
              </div>
            </div>

            {/* Left side: Interactive Visual Counter & Progress Beads */}
            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              {/* Visual Bead Dots */}
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx < dhikrCurrentPhaseCount
                        ? "bg-emerald-500 shadow-xs shadow-emerald-400 scale-110"
                        : "bg-emerald-200/80 dark:bg-emerald-900/40"
                    }`}
                  />
                ))}
              </div>

              {/* Counter Badge with Pulse & Burst indicator */}
              <div className="flex items-center gap-2 bg-white/95 dark:bg-emerald-950/70 border border-emerald-300/70 dark:border-emerald-500/40 px-3.5 py-1.5 rounded-xl shadow-xs text-xs font-black text-emerald-800 dark:text-emerald-200 relative">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">العداد:</span>
                <span className="text-sm font-mono tabular-nums text-emerald-700 dark:text-emerald-300 font-black">
                  {dhikrCurrentPhaseCount} / 10
                </span>
                <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mr-1 border-r border-emerald-200 dark:border-emerald-800/80 pr-2">
                  مجموع: {dhikrTotal}
                </span>

                {/* Transient +1 animation */}
                <AnimatePresence>
                  {dhikrBurst && (
                    <motion.span
                      key={dhikrBurst}
                      initial={{ opacity: 1, y: 0, scale: 0.8 }}
                      animate={{ opacity: 0, y: -22, scale: 1.25 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.2 rounded-full pointer-events-none shadow-xs"
                    >
                      +1
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2, AlertCircle, X, FileText, BrainCircuit, Lightbulb, FileAudio } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import DashboardProcessingScreen from "@/components/dashboard/DashboardProcessingScreen";
import { PipelineStep } from "@/types/dashboard";

import { UploadedAudio } from "@/components/summarize/types";
import { useSummarizeQuota } from "@/components/summarize/useSummarizeQuota";
import { useSummarizeStream } from "@/components/summarize/useSummarizeStream";
import AudioUploadCard from "@/components/summarize/AudioUploadCard";
import SlidesUploadCard from "@/components/summarize/SlidesUploadCard";
import QuotaBreakdownCard from "@/components/summarize/QuotaBreakdownCard";
import SummarizePaywall from "@/components/summarize/SummarizePaywall";

function SummarizeContent() {
  const { session } = useAuth();

  // File States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [multiAudioFiles, setMultiAudioFiles] = useState<UploadedAudio[]>([]);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioTempId, setAudioTempId] = useState<string | null>(null);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isAudioUploading, setIsAudioUploading] = useState(false);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTempId, setPdfTempId] = useState<string | null>(null);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [startPage, setStartPage] = useState<string>("");
  const [endPage, setEndPage] = useState<string>("");
  const [pdfDetectedPages, setPdfDetectedPages] = useState<number | null>(null);

  const {
    quota,
    hasPaidPlan,
    isQuotaChecking,
    isMounted,
    quotaCostBreakdown,
    fetchQuota,
  } = useSummarizeQuota({
    session,
    audioDuration,
    multiAudioFiles,
    pdfFile,
    pdfTempId,
    startPage,
    endPage,
    pdfDetectedPages,
  });

  const {
    isProcessing,
    isStreaming,
    phase,
    displayedProgress,
    progressMessage,
    queuePosition,
    timeLeft,
    error,
    setError,
    startProcessing,
  } = useSummarizeStream();

  // Helpers
  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return "بضع ثوانٍ";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    if (secs === 0) return `${mins} دقيقة`;
    return `${mins} د و ${secs} ث`;
  };

  const isMultiAudioUploading = multiAudioFiles.length > 0 && multiAudioFiles.some((f) => f.isUploading || !f.tempId);
  const isAnyAudioUploading = isAudioUploading || isMultiAudioUploading;
  const completedAudioCount = multiAudioFiles.filter((f) => !f.isUploading && Boolean(f.tempId)).length;
  const totalAudioCount = multiAudioFiles.length;

  const totalAudioSeconds = useMemo(() => {
    if (multiAudioFiles.length > 0) {
      return multiAudioFiles.reduce((acc, f) => acc + (f.duration || 0), 0);
    }
    return audioDuration;
  }, [multiAudioFiles, audioDuration]);

  const hasAudio = !!audioFile || multiAudioFiles.length > 0;
  const hasPdf = !!pdfFile || !!pdfTempId;
  const isDocumentOnly = !hasAudio && hasPdf;

  const isRangeInvalid = useMemo(() => {
    const s = parseInt(startPage, 10);
    const e = parseInt(endPage, 10);
    if (!isNaN(s) && !isNaN(e) && s > e) return true;
    if (!isNaN(s) && s < 1) return true;
    return false;
  }, [startPage, endPage]);

  const activeFileName = useMemo(() => {
    if (audioFile) return audioFile.name;
    if (multiAudioFiles[0]) return multiAudioFiles[0].file.name;
    if (pdfFile) return pdfFile.name;
    return "محاضرة جامعية";
  }, [multiAudioFiles, audioFile, pdfFile]);

  const currentPipelineSteps: PipelineStep[] = useMemo(() => {
    if (isDocumentOnly) {
      return [
        { id: 1, title: "فحص وتدقيق الشرائح", shortDesc: "قراءة النصوص والجداول بدقة", icon: FileText },
        { id: 2, title: "استيعاب المفاهيم", shortDesc: "تحليل الأفكار والمعادلات والتعاريف", icon: BrainCircuit },
        { id: 3, title: "الشرح وفخاخ الاختبار", shortDesc: "صياغة الشرح والكبسولات والأسئلة", icon: Lightbulb },
        { id: 4, title: "إخراج الملف المخطط", shortDesc: "تجهيز وتلوين الملف المخطط والمظلل", icon: Sparkles },
      ];
    }
    return [
      { id: 1, title: "معالجة وتصفية الصوت", shortDesc: "تنقية التسجيل للمحرك الذكي", icon: FileAudio },
      { id: 2, title: "التفريغ الصوتي الذكي", shortDesc: "تحويل الصوت لنص دقيق ومصحح", icon: BrainCircuit },
      { id: 3, title: "مطابقة الصوت بالشرائح", shortDesc: "ربط الدقائق الصوتية بالشرائح", icon: FileText },
      { id: 4, title: "إخراج الملف المخطط", shortDesc: "توليد الأسئلة وتلوين الملف المخطط", icon: Sparkles },
    ];
  }, [isDocumentOnly]);

  const activeStepIdx = useMemo(() => {
    if (phase === "done" || phase === "pdf") return 3;
    if (phase === "ai") return 2;
    if (phase === "slides") return 1;
    if (phase === "audio" || phase === "queued") return 0;
    if (displayedProgress >= 88) return 3;
    if (displayedProgress >= 65) return 2;
    if (displayedProgress >= 35) return 1;
    return 0;
  }, [phase, displayedProgress]);

  const handleStartProcess = () => {
    startProcessing({
      audioFile,
      multiAudioFiles,
      pdfFile,
      audioTempId,
      pdfTempId,
      startPage,
      endPage,
      hasPaidPlan,
      quota,
      session,
      onQuotaDeducted: () => fetchQuota(),
    });
  };

  if (!isMounted) {
    return (
      <main
        className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300"
        dir="rtl"
      >
        <AppHeader quota={null} activePage="summarize" />
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300 selection:bg-indigo-500/20"
      dir="rtl"
    >
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full dark:from-indigo-600/15 dark:via-purple-600/10 pointer-events-none" />
      </div>

      <AppHeader quota={quota} activePage="summarize" />

      <div className="flex-1 flex flex-col items-center px-4 pt-10 sm:pt-14 pb-16 w-full max-w-4xl mx-auto relative z-10">
        {/* Navigation Bar */}
        <div className="w-full max-w-3xl mb-5 sm:mb-6 flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            prefetch={true}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
          >
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="text-right flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
              <span>لمّاح بخططلك</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-snug">
              {!hasPaidPlan || (quota !== null && quota <= 0)
                ? "يلزم وجود اشتراك نشط لمعالجة المحاضرات"
                : "ارفع التسجيل الصوتي أو السلايدات لتجهيز ملفك وشرحك التفاعلي فوراً"}
            </p>
          </div>
        </div>

        {/* Dynamic Display: Quota Checking -> Paywall -> Processing Screen -> Upload View */}
        <AnimatePresence mode="wait">
          {isQuotaChecking && quota === null ? (
            <motion.div
              key="quota-checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl flex flex-col items-center justify-center p-12 bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs text-center"
            >
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                جاري التحقق من الرصيد والاشتراك...
              </p>
            </motion.div>
          ) : !hasPaidPlan || (quota !== null && quota <= 0) ? (
            <SummarizePaywall key="paywall" />
          ) : isProcessing || isStreaming ? (
            <DashboardProcessingScreen
              key="processing"
              isDocumentOnly={isDocumentOnly}
              activeFileName={activeFileName}
              queuePosition={queuePosition}
              timeLeft={timeLeft}
              progressStep={progressMessage}
              progressPercent={Math.round(displayedProgress)}
              currentPipelineSteps={currentPipelineSteps}
              activeStepIdx={activeStepIdx}
            />
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-3xl"
            >
              {error && (
                <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-between gap-3 text-right">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Upload Card */}
              <div className="w-full bg-white dark:bg-[#070b16]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.06)] relative overflow-hidden transition-all text-right">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Grid for Audio + Slides Upload Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <AudioUploadCard
                    audioFile={audioFile}
                    setAudioFile={setAudioFile}
                    multiAudioFiles={multiAudioFiles}
                    setMultiAudioFiles={setMultiAudioFiles}
                    audioDuration={audioDuration}
                    setAudioDuration={setAudioDuration}
                    audioTempId={audioTempId}
                    setAudioTempId={setAudioTempId}
                    audioUploadProgress={audioUploadProgress}
                    setAudioUploadProgress={setAudioUploadProgress}
                    isAudioUploading={isAudioUploading}
                    setIsAudioUploading={setIsAudioUploading}
                    setError={setError}
                    session={session}
                    formatDuration={formatDuration}
                    audioCostMinutes={quotaCostBreakdown.audioCostMinutes}
                    totalAudioSeconds={totalAudioSeconds}
                  />

                  <SlidesUploadCard
                    pdfFile={pdfFile}
                    setPdfFile={setPdfFile}
                    pdfTempId={pdfTempId}
                    setPdfTempId={setPdfTempId}
                    pdfUploadProgress={pdfUploadProgress}
                    setPdfUploadProgress={setPdfUploadProgress}
                    isPdfUploading={isPdfUploading}
                    setIsPdfUploading={setIsPdfUploading}
                    startPage={startPage}
                    setStartPage={setStartPage}
                    endPage={endPage}
                    setEndPage={setEndPage}
                    pdfDetectedPages={pdfDetectedPages}
                    setPdfDetectedPages={setPdfDetectedPages}
                    quotaCostBreakdown={quotaCostBreakdown}
                    hasAudio={hasAudio}
                    isProcessing={isProcessing}
                    isStreaming={isStreaming}
                    setError={setError}
                    session={session}
                  />
                </div>

                {/* Quota Deduction Summary & Action Button */}
                <QuotaBreakdownCard
                  quotaCostBreakdown={quotaCostBreakdown}
                  quota={quota}
                  hasPaidPlan={hasPaidPlan}
                  hasAudio={hasAudio}
                  hasPdf={hasPdf}
                  totalAudioSeconds={totalAudioSeconds}
                  formatDuration={formatDuration}
                  isAnyAudioUploading={isAnyAudioUploading}
                  isPdfUploading={isPdfUploading}
                  isRangeInvalid={isRangeInvalid}
                  isProcessing={isProcessing}
                  audioUploadProgress={audioUploadProgress}
                  pdfUploadProgress={pdfUploadProgress}
                  multiAudioFiles={multiAudioFiles}
                  completedAudioCount={completedAudioCount}
                  totalAudioCount={totalAudioCount}
                  onProcess={handleStartProcess}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function SummarizePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <SummarizeContent />
    </Suspense>
  );
}

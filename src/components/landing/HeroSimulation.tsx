"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileAudio, FileText, Sparkles, Upload, Loader2, 
  CheckCircle, Check, X, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import DemoResultUI from "./DemoResultUI";

export interface HeroSimulationProps {
  isEmbedded?: boolean;
  onRecharge?: () => void;
}

export default function HeroSimulation({
  isEmbedded = false,
  onRecharge
}: HeroSimulationProps = {}) {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showDemoModal, setShowDemoModal] = useState<"audio" | "pdf" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);

  // Prevent background page scrolling when demo modal/result popup is open
  useEffect(() => {
    if (showResultPopup || showDemoModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showResultPopup, showDemoModal]);

  // Mock handling the demo import
  const handleImportDemo = (type: "audio" | "pdf") => {
    if (type === "audio") {
      const mockAudio = new File([""], "محاضرة_تطور_العملات_الذهب_للبيتكوين.mp3", { type: "audio/mp3" });
      setAudioFile(mockAudio);
    } else {
      const mockPdf = new File([""], "سلايدات_تطور_العملات_الذهب_للبيتكوين.pdf", { type: "application/pdf" });
      setPdfFile(mockPdf);
    }
    setShowDemoModal(null);
  };

  const handleProcess = () => {
    setIsProcessing(true);
    // Simulate processing for 2 seconds then show result popup
    setTimeout(() => {
      setIsProcessing(false);
      setShowResultPopup(true);
    }, 2000);
  };

  const content = (
    <div id="interactive-demo" className="w-full max-w-4xl mx-auto relative z-20 scroll-mt-24" dir="rtl">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/15 to-fuchsia-500/15 blur-3xl rounded-full opacity-60 dark:opacity-40" />
      </div>

      <AnimatePresence mode="wait">
        {!showResultPopup ? (
          <motion.div
            key="simulation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white/70 dark:bg-[#070b16]/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_80px_rgba(99,102,241,0.08)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.7)] relative overflow-hidden group ring-1 ring-white/50 dark:ring-white/5"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            {/* Floating Ornaments */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-indigo-400/50 dark:text-indigo-500/40 animate-pulse">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 text-fuchsia-400/50 dark:text-fuchsia-500/40 animate-pulse delay-700">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {/* Extra decorative circles inside */}
            <div className="absolute top-20 -left-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-20 w-40 h-40 bg-fuchsia-500/10 dark:bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto w-full relative z-10 flex flex-col items-center">
              
              {/* Dropzones Grid */}
              <div className="w-full mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 w-full relative z-10">
                  {/* PDF Slide Dropzone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setShowDemoModal('pdf'); }}
                    className={`relative group rounded-[1.25rem] sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-500 transform hover:-translate-y-1 cursor-pointer min-h-[130px] sm:min-h-[220px] ${pdfFile ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-[0_15px_40px_rgba(168,85,247,0.15)]' : 'bg-white/80 dark:bg-[#020617]/50 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 shadow-sm'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-indigo-500/0 group-hover:from-purple-500/5 group-hover:to-indigo-500/5 rounded-[1.5rem] sm:rounded-[2rem] transition-colors duration-500 pointer-events-none" />
                    <div onClick={() => setShowDemoModal('pdf')} className="absolute inset-0 z-20" />
                    
                    {pdfFile ? (
                      <div className="text-center w-full z-20 relative">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-inner">
                          <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-purple-500 dark:text-purple-400" />
                        </div>
                        <p className="font-black text-purple-800 dark:text-purple-200 text-[10px] sm:text-xs truncate w-full mb-2 sm:mb-3" dir="ltr">{pdfFile.name}</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); }} className="text-[10px] sm:text-[11px] text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/30 px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-rose-200 dark:border-rose-500/20 transition-colors z-30 relative shadow-sm">
                          إزالة الملف
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-tr from-purple-100 to-indigo-50 dark:from-purple-900/40 dark:to-indigo-900/20 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-purple-500/10 border border-purple-200 dark:border-purple-500/20 rotate-3 group-hover:rotate-0">
                          <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-100 mb-1 sm:mb-2">شرائح العرض (PDF)</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center mb-2 sm:mb-3">اسحب الـ PDF هنا لربط الشرح شفوياً</p>
                      </>
                    )}
                  </div>
                  
                  {/* Audio Slide Dropzone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setShowDemoModal('audio'); }}
                    className={`relative group rounded-[1.25rem] sm:rounded-[2rem] p-4 sm:p-6 flex flex-col items-center justify-center transition-all duration-500 transform hover:-translate-y-1 cursor-pointer min-h-[130px] sm:min-h-[220px] ${audioFile ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-[0_15px_40px_rgba(99,102,241,0.15)]' : 'bg-white/80 dark:bg-[#020617]/50 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 shadow-sm'}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 rounded-[1.5rem] sm:rounded-[2rem] transition-colors duration-500 pointer-events-none" />
                    <div onClick={() => setShowDemoModal('audio')} className="absolute inset-0 z-20" />
                    
                    {audioFile ? (
                      <div className="text-center w-full z-20 relative">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-inner">
                          <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <p className="font-black text-indigo-800 dark:text-indigo-200 text-[10px] sm:text-xs truncate w-full mb-2 sm:mb-3" dir="ltr">{audioFile.name}</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setAudioFile(null); }} className="text-[10px] sm:text-[11px] text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/30 px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-rose-200 dark:border-rose-500/20 transition-colors z-30 relative shadow-sm">
                          إزالة الملف
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-tr from-indigo-100 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/20 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 -rotate-3 group-hover:rotate-0">
                          <FileAudio className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-100 mb-1 sm:mb-2">تسجيل المحاضرة</h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">اسحب الملف الصوتي هنا<br /><span className="text-[9px] sm:text-[10px] opacity-75">(MP3, WAV, M4A)</span></p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Creative Free Trial Banner */}
              <div className="mt-6 sm:mt-8 mb-6 sm:mb-8 flex flex-row items-center sm:items-start gap-3 sm:gap-4 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-900/30 dark:to-purple-900/30 backdrop-blur-md border border-indigo-100 dark:border-indigo-500/20 p-3 sm:p-6 rounded-xl sm:rounded-3xl text-right w-full shadow-lg shadow-indigo-900/5 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1.5 sm:w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-xl sm:rounded-r-3xl"></div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white dark:bg-indigo-950/70 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-500/30 z-10">
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                </div>
                <div className="flex-1 z-10 text-right">
                  <p className="text-xs sm:text-base font-black text-indigo-950 dark:text-indigo-200 mb-0.5 sm:mb-2">كيف تبدأ تجربتك النموذجية؟</p>
                  <p className="text-[10px] sm:text-sm text-indigo-800/90 dark:text-indigo-300/90 leading-relaxed font-medium">
                    <span className="sm:hidden">اختر ملفاً بالأعلى ثم اضغط زر البدء لترى النتائج!</span>
                    <span className="hidden sm:inline">ببساطة، انقر فوق <strong>تسجيل المحاضرة</strong> أو <strong>شرائح العرض (PDF)</strong> بالأعلى لاختيار ملف تجريبي، ثم اضغط على زر البدء أدناه ودع <strong>لمّاح</strong> يلخص محاضرتك بدقة فائقة!</span>
                  </p>
                </div>
              </div>

              {/* Epic Start Button */}
              <button 
                onClick={handleProcess} 
                disabled={isProcessing || (!audioFile && !pdfFile)}
                className="w-full relative group overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-3.5 sm:py-6 rounded-xl sm:rounded-3xl shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {isProcessing ? (
                  <span className="relative z-10 flex items-center justify-center text-sm sm:text-lg"><Loader2 className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 animate-spin" />جاري التوليد والتلخيص...</span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center text-sm sm:text-lg group-hover:text-white transition-colors duration-500"><Upload className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:-translate-y-1 transition-transform" />ابدأ التلخيص الذكي الآن</span>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-full"
          >
            <DemoResultUI 
              actionText={isEmbedded ? "شحن رصيدك لتلخيص محاضراتك" : "أنشئ حسابك لحفظ النتيجة"}
              onAction={isEmbedded ? (onRecharge || (() => router.push("/plans"))) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Modal (Audio & PDF) */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full relative text-right"
            >
              <button onClick={() => setShowDemoModal(null)} className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-50">
                <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              </button>
              
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  {showDemoModal === 'audio' ? <FileAudio className="w-8 h-8 text-indigo-400" /> : <FileText className="w-8 h-8 text-indigo-400" />}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 text-center">
                استيراد {showDemoModal === 'audio' ? 'محاضرة تجريبية' : 'ملف شرائح تجريبي'}
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-6 leading-relaxed">
                أنت حالياً في النسخة التجريبية (رصيدك 0 دقيقة). لتجربة سرعة ودقة محرك لمّاح، تفضل بتحميل {showDemoModal === 'audio' ? 'المحاضرة الصوتية المميزة' : 'ملف الـ PDF التجريبي'}:
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 mb-6 text-center">
                <p className="text-[10px] text-slate-500 mb-1">اسم الملف التجريبي:</p>
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-300 truncate" dir="ltr">
                  {showDemoModal === 'audio' ? 'محاضرة_تطور_العملات_الذهب_للبيتكوين.mp3' : 'سلايدات_تطور_العملات_الذهب_للبيتكوين.pdf'}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex-row-reverse">
                  <span>{showDemoModal === 'audio' ? 'المدة: 48 دقيقة' : 'عدد الصفحات: 79 شريحة'}</span>
                  <span>حجم الملف: {showDemoModal === 'audio' ? '18.2' : '2.2'} ميجابايت</span>
                </div>
              </div>
              
              <button
                onClick={() => handleImportDemo(showDemoModal)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                استيراد الملف التجريبي وبدء المعالجة
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Result Modal - Full Screen */}
      <AnimatePresence>
        {showResultPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-100/80 dark:bg-slate-950/90 backdrop-blur-2xl px-2 sm:px-4 pt-20 sm:pt-28 pb-12 sm:pb-16 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain w-full max-w-full"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-transparent w-full max-w-full overflow-x-hidden relative text-right flex items-center justify-center"
            >
              <button 
                onClick={() => setShowResultPopup(false)} 
                className="fixed top-6 right-6 p-2.5 sm:p-3 bg-white/90 dark:bg-slate-800/80 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-[110] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xl backdrop-blur-md hidden sm:block cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              {/* For mobile, add close button in a different spot */}
              <button 
                onClick={() => setShowResultPopup(false)} 
                className="fixed top-4 left-4 p-2 bg-white/90 dark:bg-slate-800/80 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-[110] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xl backdrop-blur-md sm:hidden cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-full max-w-6xl mx-auto overflow-x-hidden">
                <DemoResultUI 
                  actionText={isEmbedded ? "شحن رصيدك لتلخيص محاضراتك" : "أنشئ حسابك لحفظ النتيجة"}
                  onAction={isEmbedded ? (onRecharge || (() => router.push("/plans"))) : undefined}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isEmbedded) {
    return (
      <div className="w-full relative z-20" dir="rtl">
        {/* Zero Quota Simulation Notice Banner */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  رصيدك الحالي 0 دقيقة — وضع المحاكاة التفاعلية مفعّل
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  نسخة استعراضية
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                يمكنك تجربة واختبار محرك لمّاح بالكامل عبر الملفات النموذجية أدناه. لشحن رصيدك وتلخيص ملفاتك الجامعية الحقيقية، اشترك في إحدى باقاتنا.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRecharge || (() => router.push("/plans"))}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <span>شحن الرصيد والترقية</span>
          </button>
        </div>

        {content}
      </div>
    );
  }

  return (
    <section className="relative w-full py-24 z-20 flex flex-col items-center">
      {/* ── Section Headers ── */}
      <div className="mb-12 relative z-10 flex flex-col items-center">
        <h2 className="text-lg xs:text-xl sm:text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-3 sm:mb-4 px-6 text-center max-w-sm sm:max-w-none mx-auto leading-snug">
          جرب المنصة الآن <span className="text-indigo-600 dark:text-indigo-400">بدون تسجيل</span>
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-base max-w-[290px] xs:max-w-[330px] sm:max-w-xl mx-auto text-center px-2 sm:px-6 leading-relaxed font-medium">
          <span className="block sm:inline">ارفع ملفاً صوتياً أو ملف PDF لترى كيف يقوم لمّاح</span>{" "}
          <span className="block sm:inline mt-0.5 sm:mt-0">بتحليل وتلخيص المحتوى السحري أمام عينيك!</span>
        </p>
      </div>

      {content}
    </section>
  );
}

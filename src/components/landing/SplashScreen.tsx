"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    const hasHash = window.location.hash !== "";

    if (hasSeenSplash || hasHash) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
      sessionStorage.setItem("hasSeenSplash", "true");
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    // Safety auto-dismiss in case video fails to fire onEnded or on slow devices
    if (isVisible) {
      const fallbackTimer = setTimeout(() => {
        handleDismiss();
      }, 3500);
      return () => clearTimeout(fallbackTimer);
    }
  }, [isVisible]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(Math.min(100, currentProgress));
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    document.body.style.overflow = "";
  };

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.03, 
            transition: { duration: 0.35, ease: "easeInOut" } 
          }}
          className="fixed inset-0 z-[999999] w-screen h-[100dvh] bg-[#070B19] flex flex-col items-center justify-between py-6 sm:py-10 px-4 sm:px-6 overflow-hidden select-none"
          dir="rtl"
        >
          {/* ── 1. Top Bar: Minimalist Logo + Quick Skip ─────────── */}
          <div className="w-full max-w-4xl flex items-center justify-between relative z-20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
                منظومة لمّاح الأكاديمية
              </span>
            </div>

            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
            >
              <span>تخطي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── 2. Cinematic Centerpiece (Responsive Video + Typography) */}
          <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto text-center my-auto py-2">
            
            {/* Ambient Background Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[radial-gradient(circle,_rgba(234,179,8,0.2)_0%,_rgba(99,102,241,0.15)_45%,_transparent_70%)] blur-3xl pointer-events-none" />

            {/* Glowing Golden Video Emblem */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-44 h-44 sm:w-60 sm:h-60 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden p-1 bg-gradient-to-b from-amber-400/40 via-amber-500/10 to-transparent shadow-[0_0_80px_rgba(234,179,8,0.25)] ring-1 ring-white/20 mb-4 sm:mb-6"
            >
              <div className="w-full h-full rounded-[2.3rem] sm:rounded-[2.8rem] overflow-hidden bg-[#070B19] flex items-center justify-center relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  poster="/lammah-logo.png"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleDismiss}
                  className="w-full h-full object-cover scale-105 filter brightness-110 contrast-105"
                >
                  <source src="/splash-animation.webm" type="video/webm" />
                  <source src="/splash-animation.mp4" type="video/mp4" />
                </video>
              </div>
            </motion.div>

            {/* Majestic Academic Typography */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_30px_rgba(234,179,8,0.35)]">
                  لَمّـاح
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-amber-300 font-black">
                  AI
                </span>
              </div>

              <p className="text-xs sm:text-base font-semibold text-slate-300 max-w-sm mx-auto leading-relaxed">
                منصة التلخيص الذكي وتوليد الدفاتر لطلبة الجامعات
              </p>

              <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs text-slate-500 font-medium pt-0.5">
                <span>تفريغ فوري</span>
                <span>•</span>
                <span>توقّع أسئلة الامتحان</span>
                <span>•</span>
                <span>شات المادة</span>
              </div>
            </div>

          </div>

          {/* ── 3. Bottom: Premium Floating Status Bar ───────────── */}
          <div className="w-full max-w-xs relative z-20">
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-xl backdrop-blur-xl space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  تهيئة المساعد الأكاديمي...
                </span>
                <span className="font-mono text-slate-400">{Math.round(progress)}%</span>
              </div>

              {/* Glowing Laser Progress Line */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

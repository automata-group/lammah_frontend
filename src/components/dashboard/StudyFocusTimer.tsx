"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Sparkles,
  Flame,
  Trophy,
  Volume2,
  VolumeX,
  X,
  FastForward,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sliders,
  CheckCircle2,
  CloudRain
} from "lucide-react";

interface StudyFocusTimerProps {
  currentHistoryId?: string | null;
  lectureTitle?: string;
}

export type TimerMode = "study" | "break";

interface PresetConfig {
  id: string;
  name: string;
  studyMins: number;
  breakMins: number;
  icon: string;
  desc: string;
}

const PRESETS: PresetConfig[] = [
  {
    id: "pomodoro",
    name: "كويز سريع (Pomodoro)",
    studyMins: 25,
    breakMins: 5,
    icon: "⚡",
    desc: "25 دقيقة تركيز + 5 دقائق راحة",
  },
  {
    id: "deep",
    name: "مذاكرة شابتر (Deep Focus)",
    studyMins: 45,
    breakMins: 10,
    icon: "📚",
    desc: "45 دقيقة تركيز + 10 دقائق راحة",
  },
  {
    id: "sprint",
    name: "جلسة مكثفة (Sprint)",
    studyMins: 60,
    breakMins: 15,
    icon: "🎯",
    desc: "60 دقيقة دراسة + 15 دقيقة راحة",
  },
];

export default function StudyFocusTimer({ currentHistoryId, lectureTitle }: StudyFocusTimerProps) {
  // Config state
  const [studyMinutes, setStudyMinutes] = useState<number>(25);
  const [breakMinutes, setBreakMinutes] = useState<number>(5);
  const [selectedPreset, setSelectedPreset] = useState<string>("pomodoro");

  // Timer operational state
  const [mode, setMode] = useState<TimerMode>("study");
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  // Audio settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ambientRainEnabled, setAmbientRainEnabled] = useState<boolean>(false);

  // Cumulative statistics state
  const [todayStudySeconds, setTodayStudySeconds] = useState<number>(0);
  const [lectureStudySeconds, setLectureStudySeconds] = useState<number>(0);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  // Web Audio Context & Synthesizer refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNoiseNodeRef = useRef<AudioNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Today's storage key: YYYY-MM-DD
  const todayKey = useMemo(() => {
    const d = new Date();
    return `lammah_study_seconds_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const lectureKey = useMemo(() => {
    return currentHistoryId ? `lammah_study_lecture_${currentHistoryId}` : null;
  }, [currentHistoryId]);

  // Load cumulative stats from localStorage on mount
  useEffect(() => {
    try {
      const savedToday = localStorage.getItem(todayKey);
      if (savedToday) setTodayStudySeconds(Number(savedToday) || 0);

      const savedSessions = localStorage.getItem(`${todayKey}_sessions`);
      if (savedSessions) setCompletedSessionsCount(Number(savedSessions) || 0);

      if (lectureKey) {
        const savedLec = localStorage.getItem(lectureKey);
        if (savedLec) setLectureStudySeconds(Number(savedLec) || 0);
      }
    } catch {}
  }, [todayKey, lectureKey]);

  // Init Web Audio
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Synthesize crystal bell chimes for notifications
  const playChime = useCallback(
    (type: "start" | "break" | "complete") => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "start") {
          // Energetic ascending chime: 523Hz (C5) -> 659Hz (E5)
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.85);
        } else if (type === "break") {
          // Calm, soothing bell: 440Hz (A4) -> 330Hz (E4)
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.3);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.start(now);
          osc.stop(now + 1.25);
        } else {
          // Triumphant double chord
          osc.type = "triangle";
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.setValueAtTime(880, now + 0.2); // A5
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
          osc.start(now);
          osc.stop(now + 1.55);
        }
      } catch {}
    },
    [soundEnabled, getAudioContext]
  );

  // Soft Ambient Pink Noise Generator (Rain-like sound)
  useEffect(() => {
    if (!ambientRainEnabled || !isRunning || mode !== "study") {
      if (ambientNoiseNodeRef.current) {
        try {
          (ambientNoiseNodeRef.current as any).stop?.();
          ambientNoiseNodeRef.current.disconnect();
        } catch {}
        ambientNoiseNodeRef.current = null;
      }
      return;
    }

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.05; // very gentle volume
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      ambientNoiseNodeRef.current = noise;
    } catch {}

    return () => {
      if (ambientNoiseNodeRef.current) {
        try {
          (ambientNoiseNodeRef.current as any).stop?.();
          ambientNoiseNodeRef.current.disconnect();
        } catch {}
        ambientNoiseNodeRef.current = null;
      }
    };
  }, [ambientRainEnabled, isRunning, mode, getAudioContext]);

  // Main countdown & study-time accumulation effect
  useEffect(() => {
    if (!isRunning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Timer finished!
          if (mode === "study") {
            playChime("break");
            // Increment completed sessions
            setCompletedSessionsCount((c) => {
              const next = c + 1;
              try {
                localStorage.setItem(`${todayKey}_sessions`, String(next));
              } catch {}
              return next;
            });
            // Switch to break
            setMode("break");
            return breakMinutes * 60;
          } else {
            // Break finished!
            playChime("start");
            setMode("study");
            return studyMinutes * 60;
          }
        }
        return prev - 1;
      });

      // Accumulate study time only during 'study' mode
      if (mode === "study") {
        setTodayStudySeconds((prev) => {
          const next = prev + 1;
          if (next % 5 === 0) {
            try {
              localStorage.setItem(todayKey, String(next));
            } catch {}
          }
          return next;
        });

        if (lectureKey) {
          setLectureStudySeconds((prev) => {
            const next = prev + 1;
            if (next % 5 === 0) {
              try {
                localStorage.setItem(lectureKey, String(next));
              } catch {}
            }
            return next;
          });
        }
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, mode, studyMinutes, breakMinutes, todayKey, lectureKey, playChime]);

  // Handlers
  const handleTogglePlay = () => {
    getAudioContext();
    if (!isRunning) {
      playChime(mode === "study" ? "start" : "break");
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const target = mode === "study" ? studyMinutes * 60 : breakMinutes * 60;
    setSecondsLeft(target);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === "study") {
      setMode("break");
      setSecondsLeft(breakMinutes * 60);
    } else {
      setMode("study");
      setSecondsLeft(studyMinutes * 60);
    }
  };

  const handleSelectPreset = (preset: PresetConfig) => {
    setSelectedPreset(preset.id);
    setStudyMinutes(preset.studyMins);
    setBreakMinutes(preset.breakMins);
    setIsRunning(false);
    setMode("study");
    setSecondsLeft(preset.studyMins * 60);
    setIsCustomizing(false);
  };

  const handleApplyCustom = (studyM: number, breakM: number) => {
    setSelectedPreset("custom");
    setStudyMinutes(studyM);
    setBreakMinutes(breakM);
    setIsRunning(false);
    setMode("study");
    setSecondsLeft(studyM * 60);
    setIsCustomizing(false);
  };

  // Helper formatting: mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Helper formatting for cumulative hours & minutes
  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} ساعة و ${mins} دقيقة`;
    }
    if (mins > 0) {
      return `${mins} دقيقة`;
    }
    return `${totalSeconds} ثانية`;
  };

  // Progress percentage calculation
  const totalModeSeconds = (mode === "study" ? studyMinutes : breakMinutes) * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalModeSeconds - secondsLeft) / totalModeSeconds) * 100));

  // Stroke Dash for circular SVG progress
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <>
      {/* 1. Header Trigger Pill (Rendered in DashboardTitleBar or top toolbar) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer group active:scale-95 ${
            isRunning
              ? mode === "study"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shadow-amber-500/10"
                : "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 shadow-emerald-500/10"
              : "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
          }`}
          title="مؤقت المذاكرة الذكي"
        >
          {isRunning ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    mode === "study" ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    mode === "study" ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                />
              </span>
              <span className="font-mono font-black text-xs sm:text-sm tracking-wider">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[11px] font-medium hidden sm:inline">
                {mode === "study" ? "دراسة 🎯" : "استراحة ☕"}
              </span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>مؤقت المذاكرة</span>
              {todayStudySeconds > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[10px] text-indigo-600 dark:text-indigo-300 font-black hidden lg:inline">
                  {Math.floor(todayStudySeconds / 60)} د
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* 2. Floating Mini-Pill (Always visible when active & modal is closed) */}
      <AnimatePresence>
        {!isModalOpen && isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-40 bg-white/90 dark:bg-[#0c1222]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-2.5 flex items-center gap-3 pr-3.5"
            dir="rtl"
          >
            {/* Mode Indicator & Time */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  mode === "study"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {mode === "study" ? "🎯" : "☕"}
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white leading-none">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {mode === "study" ? "جلسة تركيز" : "وقت استراحة"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-transform active:scale-90"
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all"
                title="تكبير"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Comprehensive Focus Timer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      مؤقت المذاكرة والتركيز
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-500/20">
                        لمّاح بخططلك
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      اضبط أوقات دراستك واستراحتك بدقة وتابع إنجازك
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Sound toggle */}
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      soundEnabled
                        ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-500"
                    }`}
                    title={soundEnabled ? "كتم الأصوات" : "تفعيل الأصوات"}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* Ambient Rain / White Noise Toggle */}
                  <button
                    type="button"
                    onClick={() => setAmbientRainEnabled(!ambientRainEnabled)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      ambientRainEnabled
                        ? "bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-300 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                    }`}
                    title="أصوات تركيز هادئة (مطر خفيف)"
                  >
                    <CloudRain className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col items-center">
                {/* Mode Selector Tabs (Study vs Break) */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("study");
                      setIsRunning(false);
                      setSecondsLeft(studyMinutes * 60);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      mode === "study"
                        ? "bg-white dark:bg-[#131b2e] text-amber-600 dark:text-amber-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>🎯</span>
                    <span>جلسة دراسة ({studyMinutes} د)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("break");
                      setIsRunning(false);
                      setSecondsLeft(breakMinutes * 60);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      mode === "break"
                        ? "bg-white dark:bg-[#131b2e] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>☕</span>
                    <span>استراحة ({breakMinutes} د)</span>
                  </button>
                </div>

                {/* Circular Progress Ring with Countdown */}
                <div className="relative w-52 h-52 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    {/* Background Track */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-slate-100 dark:text-slate-800/80"
                    />
                    {/* Animated Progress Arc */}
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className={`transition-all duration-1000 ease-linear ${
                        mode === "study"
                          ? "text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                          : "text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      }`}
                    />
                  </svg>

                  {/* Central Text & Counter */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                      {mode === "study" ? "جلسة تركيز دراسي" : "وقت استراحة مريح"}
                    </span>
                    <span className="font-mono text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formatTime(secondsLeft)}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-2 ${
                        isRunning
                          ? mode === "study"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isRunning ? "يعمل الآن ⏳" : "متوقف مؤقتاً ⏸️"}
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                    title="إعادة تعيين المؤقت"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2.5 transition-all transform active:scale-95 shadow-md cursor-pointer ${
                      isRunning
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                        : mode === "study"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>إيقاف مؤقت</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>{mode === "study" ? "ابدأ الدراسة الآن" : "ابدأ الاستراحة"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                    title={mode === "study" ? "تخطي إلى الاستراحة" : "تخطي إلى الدراسة"}
                  >
                    <FastForward className="w-4 h-4 rtl:-scale-x-100" />
                  </button>
                </div>

                {/* Preset Selector & Custom Mode Drawer */}
                <div className="w-full mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                      <span>أنماط الدراسة المقترحة</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomizing(!isCustomizing)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {isCustomizing ? "الرجوع للأنماط" : "تخصيص الدقائق ⚙️"}
                    </button>
                  </div>

                  {!isCustomizing ? (
                    <div className="grid grid-cols-3 gap-2">
                      {PRESETS.map((p) => {
                        const isSelected = selectedPreset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPreset(p)}
                            className={`p-2.5 rounded-2xl border text-right transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-xs"
                                : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                            }`}
                          >
                            <div className="text-base mb-1">{p.icon}</div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {p.name.split(" ")[0]}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {p.studyMins}د / {p.breakMins}د
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Custom Minutes Controls */
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-700 dark:text-slate-300">وقت الدراسة:</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{studyMinutes} دقيقة</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="90"
                          step="5"
                          value={studyMinutes}
                          onChange={(e) => handleApplyCustom(Number(e.target.value), breakMinutes)}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-700 dark:text-slate-300">وقت الاستراحة:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{breakMinutes} دقيقة</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="1"
                          value={breakMinutes}
                          onChange={(e) => handleApplyCustom(studyMinutes, Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cumulative Study Statistics Card */}
                <div className="w-full mt-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      <Flame className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">
                        إجمالي وقت مذاكرتك اليوم
                      </h5>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold">
                        {formatTotalTime(todayStudySeconds)} • {completedSessionsCount} جلسات مكتملة 🔥
                      </p>
                    </div>
                  </div>

                  {lectureStudySeconds > 0 && (
                    <div className="text-left shrink-0">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                        لهذه المحاضرة
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {Math.floor(lectureStudySeconds / 60)} دقيقة
                      </span>
                    </div>
                  )}
                </div>

                {/* Break mode advice prompt */}
                {mode === "break" && (
                  <div className="w-full mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <Coffee className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>أحسنت! اشرب ماء، تحرك قليلاً، وريّح عينيك من الشاشة قبل الجلسة القادمة.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

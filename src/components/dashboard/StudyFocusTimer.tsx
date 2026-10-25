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
  ArrowRight,
  Sliders,
  CheckCircle2,
  CloudRain,
  CheckCheck,
  Award
} from "lucide-react";

interface StudyFocusTimerProps {
  currentHistoryId?: string | null;
  lectureTitle?: string;
  variant?: "pill" | "header" | "compact";
  className?: string;
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
    name: "جلسة بومودورو (Pomodoro)",
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

export default function StudyFocusTimer({
  currentHistoryId,
  lectureTitle,
  variant = "pill",
  className = "",
}: StudyFocusTimerProps) {
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

  // Session summary dialog state
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [lastCompletedSessionMins, setLastCompletedSessionMins] = useState<number>(0);

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
  const ambientGainRef = useRef<GainNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Today's storage key: YYYY-MM-DD
  const todayKey = useMemo(() => {
    const d = new Date();
    return `lammah_study_seconds_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const lectureKey = useMemo(() => {
    if (!currentHistoryId) return null;
    return `lammah_study_lecture_${currentHistoryId}`;
  }, [currentHistoryId]);

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global event listener to open study timer from anywhere on the platform
  useEffect(() => {
    const handleOpen = () => setIsModalOpen(true);
    window.addEventListener("open-study-timer", handleOpen);
    return () => window.removeEventListener("open-study-timer", handleOpen);
  }, []);

  // Load persisted seconds on mount
  useEffect(() => {
    try {
      const savedToday = localStorage.getItem(todayKey);
      if (savedToday) setTodayStudySeconds(parseInt(savedToday, 10) || 0);

      const savedSessions = localStorage.getItem(`${todayKey}_sessions`);
      if (savedSessions) setCompletedSessionsCount(parseInt(savedSessions, 10) || 0);

      if (lectureKey) {
        const savedLecture = localStorage.getItem(lectureKey);
        if (savedLecture) setLectureStudySeconds(parseInt(savedLecture, 10) || 0);
      }
    } catch (e) {
      console.warn("Could not read study timer from storage:", e);
    }
  }, [todayKey, lectureKey]);

  // Lazy Web Audio Context initializer
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Synthesize pleasant acoustic chime
  const playChime = useCallback(
    (type: "start" | "break" | "complete") => {
      if (!soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const chords =
          type === "start"
            ? [523.25, 659.25, 783.99] // C5 - E5 - G5
            : type === "break"
            ? [783.99, 659.25, 523.25, 659.25] // Relaxing descending
            : [523.25, 659.25, 783.99, 1046.5]; // Victory fan-fare

        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.0);
        });
      } catch (err) {
        console.warn("Audio chime error:", err);
      }
    },
    [soundEnabled, getAudioContext]
  );

  // Synthesize gentle, realistic stereo rain sound for deep focus
  useEffect(() => {
    const shouldPlay = ambientRainEnabled && (isModalOpen || isRunning) && mode === "study";

    if (!shouldPlay) {
      if (ambientGainRef.current && audioCtxRef.current) {
        try {
          ambientGainRef.current.gain.linearRampToValueAtTime(
            0.0001,
            audioCtxRef.current.currentTime + 0.15
          );
        } catch {}
      }
      const timer = setTimeout(() => {
        if (ambientNoiseNodeRef.current) {
          try {
            (ambientNoiseNodeRef.current as AudioBufferSourceNode).stop();
            (ambientNoiseNodeRef.current as AudioBufferSourceNode).disconnect();
          } catch {}
          ambientNoiseNodeRef.current = null;
        }
        ambientGainRef.current = null;
      }, 160);

      return () => clearTimeout(timer);
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // If already playing, don't recreate
    if (ambientNoiseNodeRef.current) return;

    try {
      const sampleRate = ctx.sampleRate || 44100;
      // 4-second loop of high quality stereo pink noise
      const bufferSize = sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(2, bufferSize, sampleRate);
      const left = noiseBuffer.getChannelData(0);
      const right = noiseBuffer.getChannelData(1);

      let b0_l = 0, b1_l = 0, b2_l = 0, b3_l = 0, b4_l = 0, b5_l = 0, b6_l = 0;
      let b0_r = 0, b1_r = 0, b2_r = 0, b3_r = 0, b4_r = 0, b5_r = 0, b6_r = 0;

      for (let i = 0; i < bufferSize; i++) {
        // Left channel pink noise
        const whiteL = Math.random() * 2 - 1;
        b0_l = 0.99886 * b0_l + whiteL * 0.0555179;
        b1_l = 0.99332 * b1_l + whiteL * 0.0750759;
        b2_l = 0.96900 * b2_l + whiteL * 0.1538520;
        b3_l = 0.86650 * b3_l + whiteL * 0.3104856;
        b4_l = 0.55000 * b4_l + whiteL * 0.5329522;
        b5_l = -0.7616 * b5_l - whiteL * 0.0168980;
        left[i] = (b0_l + b1_l + b2_l + b3_l + b4_l + b5_l + b6_l + whiteL * 0.5362) * 0.09;
        b6_l = whiteL * 0.115926;

        // Right channel pink noise (decorrelated for authentic stereo field)
        const whiteR = Math.random() * 2 - 1;
        b0_r = 0.99886 * b0_r + whiteR * 0.0555179;
        b1_r = 0.99332 * b1_r + whiteR * 0.0750759;
        b2_r = 0.96900 * b2_r + whiteR * 0.1538520;
        b3_r = 0.86650 * b3_r + whiteR * 0.3104856;
        b4_r = 0.55000 * b4_r + whiteR * 0.5329522;
        b5_r = -0.7616 * b5_r - whiteR * 0.0168980;
        right[i] = (b0_r + b1_r + b2_r + b3_r + b4_r + b5_r + b6_r + whiteR * 0.5362) * 0.09;
        b6_r = whiteR * 0.115926;
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // Highpass filter: remove deep hum below 180Hz
      const highpass = ctx.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.setValueAtTime(180, ctx.currentTime);

      // Lowpass filter: gentle warm ceiling at 2600Hz for soft rain acoustics
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(2600, ctx.currentTime);
      lowpass.Q.setValueAtTime(0.7, ctx.currentTime);

      // Master gain node with smooth fade-in to comfortable, audible level
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.20, ctx.currentTime + 0.3);

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
      ambientNoiseNodeRef.current = source;
      ambientGainRef.current = gainNode;
    } catch (e) {
      console.warn("Rain sound synthesizer error:", e);
    }

    return () => {
      if (ambientNoiseNodeRef.current) {
        try {
          (ambientNoiseNodeRef.current as AudioBufferSourceNode).stop();
          (ambientNoiseNodeRef.current as AudioBufferSourceNode).disconnect();
        } catch {}
        ambientNoiseNodeRef.current = null;
      }
      ambientGainRef.current = null;
    };
  }, [ambientRainEnabled, isRunning, isModalOpen, mode, getAudioContext]);

  // Handle ESC key to quickly dismiss the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (showSummary) setShowSummary(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, showSummary]);

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
            playChime("complete");
            setCompletedSessionsCount((c) => {
              const next = c + 1;
              try {
                localStorage.setItem(`${todayKey}_sessions`, String(next));
              } catch {}
              return next;
            });
            setLastCompletedSessionMins(studyMinutes);
            setShowSummary(true);
            setIsRunning(false);
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
  const handleToggleRain = () => {
    setAmbientRainEnabled((prev) => {
      const next = !prev;
      if (next) {
        const ctx = getAudioContext();
        if (ctx && ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
      }
      return next;
    });
  };

  const handleTogglePlay = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
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

  // Explicitly End Session & Calculate Time (Requested by the user)
  const handleEndSessionAndTally = () => {
    setIsRunning(false);
    const studiedSecs = Math.max(0, studyMinutes * 60 - secondsLeft);
    const sessionMins = Math.max(1, Math.round(studiedSecs / 60));
    setLastCompletedSessionMins(sessionMins);
    setCompletedSessionsCount((c) => {
      const next = c + 1;
      try {
        localStorage.setItem(`${todayKey}_sessions`, String(next));
      } catch {}
      return next;
    });
    playChime("complete");
    setShowSummary(true);
    setSecondsLeft(studyMinutes * 60);
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
    if (mode === "study") {
      setSecondsLeft(studyM * 60);
    } else {
      setSecondsLeft(breakM * 60);
    }
    // Note: Do NOT call setIsCustomizing(false) so the user stays on the custom screen
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

  if (!mounted) {
    if (variant === "compact") return null;
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border text-xs font-bold bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-200/90 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 opacity-80">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-black">مؤقت المذاكرة والتركيز</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[10px] text-indigo-700 dark:text-indigo-300 font-black">
            25 د
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. Header Trigger Pill */}
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer group active:scale-95 ${
            isRunning
              ? mode === "study"
                ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shadow-amber-500/10"
                : "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 shadow-emerald-500/10"
              : "bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-200/90 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:border-indigo-300"
          }`}
          title="مؤقت المذاكرة والتركيز الذكي"
        >
          {isRunning ? (
            <>
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    mode === "study" ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 ${
                    mode === "study" ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                />
              </span>
              <span className="font-mono font-black text-xs tracking-wider">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium hidden md:inline">
                {mode === "study" ? "دراسة 🎯" : "استراحة ☕"}
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black">مؤقت المذاكرة والتركيز</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[10px] text-indigo-700 dark:text-indigo-300 font-black">
                {studyMinutes} د
              </span>
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
            className="fixed bottom-6 left-6 z-40 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-2.5 flex items-center gap-3 pr-3.5"
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
              <div className="text-right">
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white block leading-tight">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {mode === "study" ? "جلسة تركيز" : "استراحة راحة"}
                </span>
              </div>
            </div>

            {/* Quick Play/Pause */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* End session quick button */}
            <button
              type="button"
              onClick={handleEndSessionAndTally}
              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
              title="إنهاء الجلسة وحساب الإنجاز"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss mini-pill */}
            <button
              type="button"
              onClick={() => setIsRunning(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="إخفاء وإيقاف المؤقت"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Primary Full Modal Interface */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-start p-3 sm:p-4 pt-28 sm:pt-32 pb-8 bg-black/65 backdrop-blur-sm transition-all animate-in fade-in duration-200 overflow-y-auto"
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-[390px] sm:max-w-[400px] max-h-[calc(100vh-9.5rem)] my-auto shrink-0 flex flex-col bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header (Pinned at top) */}
              <div className="shrink-0 flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                      مؤقت المذاكرة والتركيز
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Sound Toggle */}
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      soundEnabled
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 line-through"
                    }`}
                    title={soundEnabled ? "كتم الأصوات" : "تفعيل الأصوات"}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>

                  {/* Ambient Rain / White Noise Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleRain}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      ambientRainEnabled
                        ? "bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-300 shadow-xs ring-1 ring-sky-400/50"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                    }`}
                    title={ambientRainEnabled ? "إيقاف صوت المطر الهادئ" : "أصوات تركيز هادئة (مطر خفيف)"}
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                  </button>

                  {/* Prominent Guaranteed Close Button */}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:white transition-colors cursor-pointer"
                    title="إغلاق (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body with internal smooth scroll */}
              <div className="overflow-y-auto px-4 py-2.5 sm:py-3 flex flex-col items-center [scrollbar-width:thin]">
                {/* Mode Selector Tabs (Study vs Break) */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-2 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("study");
                      setIsRunning(false);
                      setSecondsLeft(studyMinutes * 60);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      mode === "break"
                        ? "bg-white dark:bg-[#131b2e] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>☕</span>
                    <span>استراحة ({breakMinutes} د)</span>
                  </button>
                </div>

                {/* Sleek, Compact Circular Progress Ring */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center my-0.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-100 dark:text-slate-800/80"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="8"
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

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                      {mode === "study" ? "جلسة تركيز دراسي" : "وقت استراحة مريح"}
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {formatTime(secondsLeft)}
                    </span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-1 ${
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
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                    title="إعادة تعيين المؤقت"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`px-5 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all transform active:scale-95 shadow-sm cursor-pointer ${
                      isRunning
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                        : mode === "study"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/25"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>إيقاف مؤقت</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>{mode === "study" ? "ابدأ الدراسة الآن" : "ابدأ الاستراحة"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                    title={mode === "study" ? "تخطي إلى الاستراحة" : "تخطي إلى الدراسة"}
                  >
                    <FastForward className="w-3.5 h-3.5 rtl:-scale-x-100" />
                  </button>
                </div>

                {/* Explicit "End Session & Tally Time" Button */}
                {mode === "study" && (studyMinutes * 60 - secondsLeft > 30 || isRunning) && (
                  <button
                    type="button"
                    onClick={handleEndSessionAndTally}
                    className="mt-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>إنهاء الجلسة وحساب وقت الدراسة</span>
                  </button>
                )}

                {/* Preset Selector & Custom Mode Drawer */}
                <div className="w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Mode Tab Switcher: Presets vs Custom */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl mb-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => setIsCustomizing(false)}
                      className={`flex-1 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        !isCustomizing
                          ? "bg-white dark:bg-[#131b2e] text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      ⚡ الأنماط السريعة
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomizing(true)}
                      className={`flex-1 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        isCustomizing
                          ? "bg-white dark:bg-[#131b2e] text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      ⚙️ تخصيص الوقت بنفسك
                    </button>
                  </div>

                  {!isCustomizing ? (
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {PRESETS.map((p) => {
                        const isSelected = selectedPreset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPreset(p)}
                            className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-xs ring-1 ring-indigo-400"
                                : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                            }`}
                          >
                            <div className="text-sm mb-0.5">{p.icon}</div>
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
                    /* Custom Minutes Controls with Quick Chips + Range Slider */
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      {/* Back arrow button to return to presets */}
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/80">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                          تحديد أوقات مخصصة بدقة
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCustomizing(false)}
                          className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
                        >
                          <span>الرجوع للأنماط</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      {/* Study Duration */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>🎯</span>
                            <span>مدة جلسة المذاكرة:</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                            {studyMinutes} دقيقة
                          </span>
                        </div>
                        {/* Quick Study Chips */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {[15, 20, 25, 30, 45, 60, 90].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleApplyCustom(m, breakMinutes)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                studyMinutes === m
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300"
                              }`}
                            >
                              {m} د
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="120"
                          step="1"
                          value={studyMinutes}
                          onChange={(e) => handleApplyCustom(Number(e.target.value), breakMinutes)}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Break Duration */}
                      <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>☕</span>
                            <span>مدة وقت الاستراحة:</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-xs">
                            {breakMinutes} دقيقة
                          </span>
                        </div>
                        {/* Quick Break Chips */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {[3, 5, 10, 15, 20].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => handleApplyCustom(studyMinutes, b)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                breakMinutes === b
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300"
                              }`}
                            >
                              {b} د
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="45"
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
                <div className="w-full mt-2.5 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      <Flame className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-900 dark:text-white">
                        إجمالي وقت مذاكرتك اليوم
                      </h5>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">
                        {formatTotalTime(todayStudySeconds)} • {completedSessionsCount} جلسات مكتملة 🔥
                      </p>
                    </div>
                  </div>

                  {lectureStudySeconds > 0 && (
                    <div className="text-left shrink-0">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block">
                        لهذه المحاضرة
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        {Math.floor(lectureStudySeconds / 60)} دقيقة
                      </span>
                    </div>
                  )}
                </div>

                {/* Break mode advice prompt */}
                {mode === "break" && (
                  <div className="w-full mt-2.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <Coffee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>أحسنت! اشرب ماء، تحرك قليلاً، وريّح عينيك من الشاشة قبل الجلسة القادمة.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Session Completed Celebration Modal (Requested: لما أخلص يحسبلي قديش خلصت) */}
      <AnimatePresence>
        {showSummary && (
          <div
            onClick={() => setShowSummary(false)}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-start sm:justify-center p-4 pt-28 sm:pt-32 pb-8 bg-black/60 backdrop-blur-sm overflow-y-auto"
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0B0F19] border border-emerald-300 dark:border-emerald-500/40 rounded-3xl p-6 text-center shadow-2xl"
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/25 mb-4 ring-4 ring-emerald-50 dark:ring-emerald-950/40">
                🎉
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                أحسنت يا بطل! أنهيت جلستك
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                تم تسجيل إنجازك بنجاح وإضافته إلى إحصائيات دراستك
              </p>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 mb-5 text-right">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">إنجاز هذه الجلسة:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {lastCompletedSessionMins} دقيقة تركيز
                  </span>
                </div>
                <div className="border-t border-slate-200/60 dark:border-slate-800" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">إجمالي دراستك اليوم:</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    {formatTotalTime(todayStudySeconds)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">عدد الجلسات المكتملة:</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {completedSessionsCount} جلسة 🔥
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowSummary(false);
                    setMode("break");
                    setSecondsLeft(breakMinutes * 60);
                    setIsRunning(true);
                  }}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-xs"
                >
                  أخذ استراحة ({breakMinutes} د) ☕
                </button>
                <button
                  type="button"
                  onClick={() => setShowSummary(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs transition cursor-pointer"
                >
                  متابعة المهام 👍
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

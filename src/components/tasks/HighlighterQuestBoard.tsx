"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Check,
  Plus,
  Trash2,
  FastForward,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  Palette,
  Clock,
  ArrowRight,
  BookOpen,
  Share2,
  CheckCircle2,
  ListOrdered,
  AlertCircle
} from "lucide-react";

export interface QuestTask {
  id: string;
  title: string;
  subject?: string;
  estimatedMinutes?: number;
  completed: boolean;
  completedAt?: string | null;
  highlightColor?: string | null; // id of pastel highlighter
  timeSpentSeconds: number;
}

// 5 Curated Aesthetic Pastel Highlighters
export const PASTEL_PENS = [
  {
    id: "lemon",
    name: "ليموني مشرق",
    colorHex: "#FACC15",
    bgClass: "bg-yellow-200/90 dark:bg-yellow-400/30 text-yellow-900 dark:text-yellow-100",
    strokeClass: "from-yellow-300/80 via-yellow-200/90 to-yellow-300/80 dark:from-yellow-500/40 dark:via-yellow-400/50 dark:to-yellow-500/40",
    borderClass: "border-yellow-400 dark:border-yellow-500/50",
    dotClass: "bg-yellow-400",
    shadowClass: "shadow-yellow-500/20",
    accentText: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "pink",
    name: "وردي زهر الكرز",
    colorHex: "#F472B6",
    bgClass: "bg-pink-200/90 dark:bg-pink-400/30 text-pink-900 dark:text-pink-100",
    strokeClass: "from-pink-300/80 via-pink-200/90 to-pink-300/80 dark:from-pink-500/40 dark:via-pink-400/50 dark:to-pink-500/40",
    borderClass: "border-pink-400 dark:border-pink-500/50",
    dotClass: "bg-pink-400",
    shadowClass: "shadow-pink-500/20",
    accentText: "text-pink-700 dark:text-pink-300",
  },
  {
    id: "mint",
    name: "نعناعي هادئ",
    colorHex: "#34D399",
    bgClass: "bg-emerald-200/90 dark:bg-emerald-400/30 text-emerald-900 dark:text-emerald-100",
    strokeClass: "from-emerald-300/80 via-emerald-200/90 to-emerald-300/80 dark:from-emerald-500/40 dark:via-emerald-400/50 dark:to-emerald-500/40",
    borderClass: "border-emerald-400 dark:border-emerald-500/50",
    dotClass: "bg-emerald-400",
    shadowClass: "shadow-emerald-500/20",
    accentText: "text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "lilac",
    name: "لافندر حالم",
    colorHex: "#A78BFA",
    bgClass: "bg-purple-200/90 dark:bg-purple-400/30 text-purple-900 dark:text-purple-100",
    strokeClass: "from-purple-300/80 via-purple-200/90 to-purple-300/80 dark:from-purple-500/40 dark:via-purple-400/50 dark:to-purple-500/40",
    borderClass: "border-purple-400 dark:border-purple-500/50",
    dotClass: "bg-purple-400",
    shadowClass: "shadow-purple-500/20",
    accentText: "text-purple-700 dark:text-purple-300",
  },
  {
    id: "cyan",
    name: "سماوي جليدي",
    colorHex: "#38BDF8",
    bgClass: "bg-sky-200/90 dark:bg-sky-400/30 text-sky-900 dark:text-sky-100",
    strokeClass: "from-sky-300/80 via-sky-200/90 to-sky-300/80 dark:from-sky-500/40 dark:via-sky-400/50 dark:to-sky-500/40",
    borderClass: "border-sky-400 dark:border-sky-500/50",
    dotClass: "bg-sky-400",
    shadowClass: "shadow-sky-500/20",
    accentText: "text-sky-700 dark:text-sky-300",
  },
];

const DEFAULT_TEMPLATES = [
  {
    name: "قاعدة الـ 3 مهام اليومية 🌟",
    desc: "أقوى تكنيك لإنهاء التسويف: مهمة كبرى + مهمتان متوسطتان",
    tasks: [
      { title: "المهمة الأساسية: دراسة الفصل الأصعب أو حل الواجب المعقد", subject: "المهمة الأهم", estimatedMinutes: 45 },
      { title: "المهمة الثانية: مراجعة سريعة للمحاضرة وتدوين الملاحظات", subject: "مراجعة", estimatedMinutes: 25 },
      { title: "المهمة الثالثة: حل 5 أسئلة من بنك الأسئلة أو التلخيص", subject: "تطبيق", estimatedMinutes: 20 },
    ],
  },
  {
    name: "سباق ليلة الامتحان 🎯",
    desc: "خطة سريعة ومحكمة لتقفيل المادة بدون تشتت",
    tasks: [
      { title: "قراءة الملخص الشامل ونقاط التركيز من لماح", subject: "تثبيت المفاهيم", estimatedMinutes: 30 },
      { title: "مراجعة الفلاش كاردز للمصطلحات والتعاريف", subject: "استرجاع نشط", estimatedMinutes: 20 },
      { title: "حل نموذج امتحان سابق واختبار التجريبي", subject: "اختبار تجريبي", estimatedMinutes: 35 },
      { title: "مراجعة الأخطاء فقط والراحة التامة", subject: "تقفيل", estimatedMinutes: 15 },
    ],
  },
  {
    name: "جلسة التركيز الخفيفة ☕",
    desc: "مناسبة للأيام المزدحمة أو بعد العودة من الجامعة",
    tasks: [
      { title: "تجهيز المكتب وترتيب سلايدات المحاضرة", subject: "تهيئة", estimatedMinutes: 10 },
      { title: "جلسة دراسة مركزة 25 دقيقة (بدون هاتف)", subject: "بومودورو", estimatedMinutes: 25 },
      { title: "استخراج 3 أسئلة متوقعة للمحاضرة القادمة", subject: "تلخيص", estimatedMinutes: 15 },
    ],
  },
];

const INITIAL_DEMO_TASKS: QuestTask[] = [
  {
    id: "q-1",
    title: "مراجعة سلايدات المحاضرة الثانية وتحديد النقاط المبهمة",
    subject: "خوارزميات وبيانات",
    estimatedMinutes: 25,
    completed: true,
    completedAt: "منذ قليل",
    highlightColor: "lemon",
    timeSpentSeconds: 1500,
  },
  {
    id: "q-2",
    title: "تلخيص أهم قوانين الفصل الثالث ومقارنة الملاحظات",
    subject: "إحصاء واحتمالات",
    estimatedMinutes: 30,
    completed: false,
    highlightColor: null,
    timeSpentSeconds: 340,
  },
  {
    id: "q-3",
    title: "حل مسألتين من أسئلة الامتحانات السابقة للتأكد من الفهم",
    subject: "إحصاء واحتمالات",
    estimatedMinutes: 20,
    completed: false,
    highlightColor: null,
    timeSpentSeconds: 0,
  },
  {
    id: "q-4",
    title: "تجهيز بطاقات الفلاش كاردز لمراجعتها قبل النوم",
    subject: "مراجعة عامة",
    estimatedMinutes: 15,
    completed: false,
    highlightColor: null,
    timeSpentSeconds: 0,
  },
];

export default function HighlighterQuestBoard() {
  const [tasks, setTasks] = useState<QuestTask[]>([]);
  const [selectedPen, setSelectedPen] = useState<string>("lemon");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [justCelebratedId, setJustCelebratedId] = useState<string | null>(null);

  // Active Task Timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lammah_highlighter_quests_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
          return;
        }
      }
      setTasks(INITIAL_DEMO_TASKS);
    } catch {
      setTasks(INITIAL_DEMO_TASKS);
    }
  }, []);

  // Save to LocalStorage
  const saveTasks = (newTasks: QuestTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem("lammah_highlighter_quests_v1", JSON.stringify(newTasks));
    } catch {}
  };

  // Find the current active (first uncompleted) task index
  const activeTaskIndex = useMemo(() => {
    return tasks.findIndex((t) => !t.completed);
  }, [tasks]);

  const activeTask = activeTaskIndex !== -1 ? tasks[activeTaskIndex] : null;

  // Active Task Timer Effect
  useEffect(() => {
    if (isTimerRunning && activeTask) {
      timerIntervalRef.current = setInterval(() => {
        setTasks((prev) => {
          const next = [...prev];
          const curIndex = next.findIndex((t) => !t.completed);
          if (curIndex !== -1) {
            next[curIndex] = {
              ...next[curIndex],
              timeSpentSeconds: (next[curIndex].timeSpentSeconds || 0) + 1,
            };
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeTask?.id]);

  // Web Audio Synthesizer: ASMR Marker Stroke + Sweet Victory Chime
  const playHighlighterSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // 1. ASMR Marker Friction Sound (Bandpassed Noise)
      const bufferSize = ctx.sampleRate * 0.18;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();

      // 2. Sweet Pentatonic Bell Chime (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.08 + idx * 0.06);

        noteGain.gain.setValueAtTime(0, ctx.currentTime + 0.08 + idx * 0.06);
        noteGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1 + idx * 0.06);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6 + idx * 0.06);

        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.start(ctx.currentTime + 0.08 + idx * 0.06);
        osc.stop(ctx.currentTime + 0.7 + idx * 0.06);
      });
    } catch {}
  };

  // Complete Active Task with the selected highlighter pen
  const handleHighlightTask = (taskIndex: number) => {
    if (taskIndex !== activeTaskIndex) return; // Only active task can be highlighted!

    playHighlighterSound();
    const task = tasks[taskIndex];
    setJustCelebratedId(task.id);

    const updated = [...tasks];
    updated[taskIndex] = {
      ...task,
      completed: true,
      completedAt: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      highlightColor: selectedPen,
    };

    saveTasks(updated);

    // Pause timer
    setIsTimerRunning(false);

    setTimeout(() => {
      setJustCelebratedId(null);
    }, 1800);
  };

  // Un-highlight a completed task
  const handleUnHighlightTask = (taskIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex] = {
      ...updated[taskIndex],
      completed: false,
      completedAt: null,
      highlightColor: null,
    };
    saveTasks(updated);
  };

  // Emergency Pass: Move blocked active task to the end of the list
  const handleEmergencyPass = () => {
    if (activeTaskIndex === -1) return;
    const taskToPostpone = tasks[activeTaskIndex];
    const updated = tasks.filter((_, idx) => idx !== activeTaskIndex);
    updated.push(taskToPostpone);
    saveTasks(updated);
    setIsTimerRunning(false);
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: QuestTask = {
      id: "q-" + Date.now(),
      title: newTaskTitle.trim(),
      subject: newTaskSubject.trim() || "مهمة دراسية",
      estimatedMinutes: newTaskMinutes || 25,
      completed: false,
      highlightColor: null,
      timeSpentSeconds: 0,
    };

    saveTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskSubject("");
    setShowAddForm(false);
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  // Apply Routine Template
  const handleApplyTemplate = (templateTasks: any[]) => {
    const formatted: QuestTask[] = templateTasks.map((t, idx) => ({
      id: "template-" + Date.now() + "-" + idx,
      title: t.title,
      subject: t.subject,
      estimatedMinutes: t.estimatedMinutes,
      completed: false,
      highlightColor: null,
      timeSpentSeconds: 0,
    }));
    saveTasks(formatted);
    setShowTemplatesModal(false);
  };

  // Reset all tasks for tomorrow
  const handleResetForTomorrow = () => {
    const resetList = tasks.map((t) => ({
      ...t,
      completed: false,
      completedAt: null,
      highlightColor: null,
      timeSpentSeconds: 0,
    }));
    saveTasks(resetList);
    setIsTimerRunning(false);
  };

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const currentPenObj = PASTEL_PENS.find((p) => p.id === selectedPen) || PASTEL_PENS[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* ── HEADER BANNER & HIGHLIGHTER TOOLBAR ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-48 bg-gradient-to-bl from-amber-400/10 via-pink-400/5 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center text-lg shadow-md shadow-amber-500/20">
                🎨
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>مهام المذاكرة الذكية</span>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-2xs">
                    إنجاز متسلسل بالهايلايتر 🎨
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  لا تشتيت! رتّب مهماتك ولونها بالهايلايتر خطوة بخطوة؛ أنجز المهمة الحالية لتفتح لك التالية.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-2xl border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                soundEnabled
                  ? "bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
              title={soundEnabled ? "مؤثرات الهايلايتر مفعلة (صوت خط القلم)" : "المؤثرات الصوتية مكتومة"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? "صوت القلم" : "مكتوم"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>قوالب جاهزة</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>مهمة جديدة</span>
            </button>
          </div>
        </div>

        {/* ── HIGHLIGHTER PEN PALETTE DOCK ── */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>قلم الهايلايتر النشط:</span>
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
              {PASTEL_PENS.map((pen) => {
                const isSelected = selectedPen === pen.id;
                return (
                  <button
                    key={pen.id}
                    type="button"
                    onClick={() => setSelectedPen(pen.id)}
                    className={`relative px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 shadow-xs ring-2 ring-indigo-500/40 -translate-y-0.5 scale-105"
                        : "opacity-75 hover:opacity-100 hover:bg-white/60 dark:hover:bg-slate-900/60"
                    }`}
                    title={`اختيار ${pen.name}`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shrink-0"
                      style={{ backgroundColor: pen.colorHex }}
                    />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 hidden md:inline">
                      {pen.name}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Progress Gauge */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>الإنجاز:</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">
                {completedCount} من {tasks.length}
              </span>
            </div>
            <div className="w-24 sm:w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/80 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 w-8 text-left">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* ── ACTIVE TASK HERO CARD & TIMER ── */}
      {activeTask && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white dark:to-[#0c111d] border-2 border-indigo-400 dark:border-indigo-500/60 p-5 sm:p-6 shadow-md shadow-indigo-500/10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-2xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current animate-pulse text-amber-300" />
                  <span>المهمة الحالية المفتوحة</span>
                </span>
                {activeTask.subject && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                    {activeTask.subject}
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>مقدرة بـ {activeTask.estimatedMinutes || 25} دقيقة</span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {activeTask.title}
              </h2>
            </div>

            {/* Stopwatch & Action Controls */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-indigo-100 dark:border-indigo-500/20">
              {/* Focus Timer Display */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-1 rounded-xl transition cursor-pointer ${
                    isTimerRunning
                      ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      : "text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  }`}
                  title={isTimerRunning ? "إيقاف مؤقت" : "بدء المؤقت"}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  {formatTimer(activeTask.timeSpentSeconds || 0)}
                </span>
              </div>

              {/* Emergency Pass (Move to end) */}
              {tasks.length > 1 && (
                <button
                  type="button"
                  onClick={handleEmergencyPass}
                  className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="عالق في هذه المهمة؟ اضغط لتأجيلها لآخر القائمة وفتح المهمة التالية فوراً"
                >
                  <FastForward className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">تأجيل لآخر القائمة</span>
                  <span className="md:hidden">تأجيل</span>
                </button>
              )}

              {/* Big Highlight Task Button */}
              <button
                type="button"
                onClick={() => handleHighlightTask(activeTaskIndex)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2 transition-all cursor-pointer transform active:scale-95 border ${currentPenObj.borderClass} ${currentPenObj.bgClass} ${currentPenObj.shadowClass}`}
                style={{
                  boxShadow: `0 4px 14px 0 ${currentPenObj.colorHex}55`,
                }}
              >
                <Sparkles className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-300" />
                <span>لوّن بالهايلايتر وأكمل</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ALL TASKS SEQUENTIAL TIMELINE ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-indigo-500" />
            <span>تسلسل المهام ({tasks.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            كل مهمة تفتح تلقائياً بعد إنهاء ما قبلها
          </span>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence>
            {tasks.map((task, index) => {
              const isCompleted = task.completed;
              const isActive = index === activeTaskIndex;
              const isLocked = index > activeTaskIndex && activeTaskIndex !== -1;

              // Find pen style if completed
              const penStyle = PASTEL_PENS.find((p) => p.id === task.highlightColor) || PASTEL_PENS[0];

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isCompleted
                      ? "bg-white/95 dark:bg-[#0c111d]/95 border-slate-200/80 dark:border-slate-800"
                      : isActive
                      ? "bg-white dark:bg-[#0f1527] border-indigo-300 dark:border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/20"
                      : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60 backdrop-blur-2xs"
                  }`}
                >
                  {/* Visual Highlighter Ink Streak Animation on completion */}
                  {isCompleted && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className={`absolute inset-y-0 right-0 pointer-events-none opacity-45 dark:opacity-30 bg-gradient-to-l ${penStyle.strokeClass}`}
                    />
                  )}

                  <div className="relative z-10 p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Status Icon Indicator */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <button
                            type="button"
                            onClick={() => handleUnHighlightTask(index)}
                            className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs hover:bg-emerald-600 transition cursor-pointer"
                            title="اضغط لإلغاء التلوين والعودة"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        ) : isActive ? (
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/30">
                            {index + 1}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Task Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate transition-all ${
                              isCompleted
                                ? "line-through text-slate-500 dark:text-slate-400 decoration-slate-400 dark:decoration-slate-500 decoration-2"
                                : isActive
                                ? "text-slate-900 dark:text-white font-black"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {task.title}
                          </span>

                          {isCompleted && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${penStyle.borderClass} ${penStyle.bgClass}`}
                            >
                              ملونة بـ {penStyle.name}
                            </span>
                          )}

                          {isLocked && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>مقفلة</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          {task.subject && <span>{task.subject}</span>}
                          {task.estimatedMinutes && <span>• {task.estimatedMinutes} دقيقة</span>}
                          {task.completedAt && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              • أُنجزت {task.completedAt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions on Task Item */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => handleHighlightTask(index)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition cursor-pointer border ${currentPenObj.borderClass} ${currentPenObj.bgClass}`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>هايلايتر</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── DAILY HIGHLIGHTER RIBBON / CANVAS ── */}
      {completedCount > 0 && (
        <div className="rounded-3xl bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>شريط إنجازات اليوم الملونة (Highlighter Ribbon)</span>
            </h4>
            <button
              type="button"
              onClick={handleResetForTomorrow}
              className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط ليوم جديد</span>
            </button>
          </div>

          {/* Visual Color Strip */}
          <div className="w-full flex rounded-2xl overflow-hidden h-6 p-1 bg-slate-100 dark:bg-slate-800 gap-1 border border-slate-200 dark:border-slate-700">
            {tasks
              .filter((t) => t.completed)
              .map((task) => {
                const pen = PASTEL_PENS.find((p) => p.id === task.highlightColor) || PASTEL_PENS[0];
                return (
                  <div
                    key={task.id}
                    className="flex-1 h-full rounded-lg transition-all relative group cursor-pointer hover:scale-105"
                    style={{ backgroundColor: pen.colorHex }}
                    title={`${task.title} (${pen.name})`}
                  />
                );
              })}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
            كل شريحة ملونة تمثل مهمة تم إنجازها وتلوينها بالهايلايتر اليوم 🎉 استمر بالتركيز!
          </p>
        </div>
      )}

      {/* ── ADD TASK MODAL / FORM ── */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0c111d] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                <span>إضافة مهمة دراسية جديدة</span>
              </h3>

              <form onSubmit={handleAddTask} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان المهمة *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="مثال: قراءة الفصل الثاني وحل أسئلة 1 إلى 5"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم المادة أو التصنيف
                    </label>
                    <input
                      type="text"
                      value={newTaskSubject}
                      onChange={(e) => setNewTaskSubject(e.target.value)}
                      placeholder="مثال: فيزياء، برمجة"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الوقت المتوقع (بالدقائق)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={newTaskMinutes}
                      onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition cursor-pointer"
                  >
                    إضافة للقائمة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ROUTINE TEMPLATES MODAL ── */}
      <AnimatePresence>
        {showTemplatesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#0c111d] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <span>قوالب روتين دراسية جاهزة</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTemplatesModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                اختر قالباً جاهزاً ليتم إعداده في قائمة مهام المذاكرة فوراً بضغطة زر واحدة:
              </p>

              <div className="space-y-3">
                {DEFAULT_TEMPLATES.map((tpl, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {tpl.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(tpl.tasks)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        تطبيق القالب
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {tpl.desc}
                    </p>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                      {tpl.tasks.map((t, idx) => (
                        <li key={idx} className="truncate">
                          {t.title} ({t.estimatedMinutes}د)
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

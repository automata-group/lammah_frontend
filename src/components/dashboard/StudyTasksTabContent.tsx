"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Trophy,
  Target,
  AlertTriangle,
  Flame,
  Zap,
  BookOpen,
  Layers,
  BrainCircuit,
  Coffee,
  Volume2,
  VolumeX,
  X,
  Tag,
  PenTool,
  Check,
  Award
} from "lucide-react";
import { DashboardAnnotations } from "@/types/dashboard";

export type HighlighterColor = "yellow" | "pink" | "blue" | "green" | null;

export interface TaskTag {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  highlightColor: HighlighterColor;
  tag: TaskTag | null;
  durationMinutes: number;
  breakMinutes: number;
  type?: "slides" | "focus" | "flashcards" | "quiz" | "exam" | "custom";
  targetSlide?: number;
  xpReward: number;
  completedAt?: string;
}

const AVAILABLE_TAGS: TaskTag[] = [
  { id: "expected_exam", label: "سؤال متوقع", icon: "🎯", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  { id: "critical_trap", label: "فخ امتحاني", icon: "⚠️", color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
  { id: "quick_task", label: "مهمة سريعة", icon: "⏱️", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  { id: "deep_focus", label: "تركيز عميق", icon: "🧠", color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
  { id: "note_taking", label: "تلخيص وتدوين", icon: "📝", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
];

const HIGHLIGHTER_STYLES: Record<string, { name: string; dot: string; card: string; border: string; glow: string }> = {
  yellow: {
    name: "أصفر فسفوري (أساسي وفهم)",
    dot: "bg-amber-400 ring-amber-400/50",
    card: "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.18)]",
    border: "border-amber-400",
    glow: "rgba(251, 191, 36, 0.25)",
  },
  pink: {
    name: "وردي مشع (سؤال حتمي / نقطة حرجة)",
    dot: "bg-rose-400 ring-rose-400/50",
    card: "bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.18)]",
    border: "border-rose-400",
    glow: "rgba(244, 63, 94, 0.25)",
  },
  blue: {
    name: "أزرق هادئ (مصطلحات وقوانين)",
    dot: "bg-sky-400 ring-sky-400/50",
    card: "bg-sky-50/70 dark:bg-sky-950/20 border-sky-300 dark:border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.18)]",
    border: "border-sky-400",
    glow: "rgba(14, 165, 233, 0.25)",
  },
  green: {
    name: "أخضر نضر (مراجعة وتطبيق)",
    dot: "bg-emerald-400 ring-emerald-400/50",
    card: "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.18)]",
    border: "border-emerald-400",
    glow: "rgba(16, 185, 129, 0.25)",
  },
};

// Pure Web Audio API Sound Synthesizer
const playSoundEffect = (type: "complete" | "unlock" | "timer" | "victory") => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "complete") {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.35);
      });
    } else if (type === "unlock") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14);
      osc.type = "sine";
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === "victory") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.45);
      });
    } else if (type === "timer") {
      [880, 880, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.14);
        osc.stop(ctx.currentTime + i * 0.14 + 0.12);
      });
    }
  } catch {
    // Fallback silently if audio context is blocked
  }
};

// Pure HTML5 Canvas Confetti Function
const triggerConfettiCelebration = () => {
  try {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#eab308"];
    const particles: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rot: number;
      vrot: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 140; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * (canvas.width * 0.6),
        y: canvas.height * 0.35 + (Math.random() - 0.5) * 80,
        w: Math.random() * 11 + 6,
        h: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 20,
        vy: Math.random() * -18 - 6,
        rot: Math.random() * 360,
        vrot: (Math.random() - 0.5) * 14,
        opacity: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.42; // gravity
        p.vx *= 0.98; // air resistance
        p.rot += p.vrot;

        if (frame > 65) p.opacity -= 0.015;

        if (p.opacity > 0 && p.y < canvas.height + 60) {
          anyAlive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      frame++;
      if (anyAlive && frame < 220) {
        requestAnimationFrame(animate);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };

    requestAnimationFrame(animate);
  } catch (err) {
    console.error("Confetti animation error:", err);
  }
};

interface StudyTasksTabContentProps {
  annotations?: DashboardAnnotations;
  currentHistoryId: string | null;
  lectureTitle: string;
  jumpToPdfSlide?: (pageOrSlideNum: number, targetType?: any) => void;
  setActiveTab?: (tab: string) => void;
}

export default function StudyTasksTabContent({
  annotations,
  currentHistoryId,
  lectureTitle,
  jumpToPdfSlide,
  setActiveTab,
}: StudyTasksTabContentProps) {
  const storageKey = currentHistoryId ? `lammah_study_tasks_${currentHistoryId}` : "lammah_student_personal_tasks";

  // Execution Mode: "sequential" (خطوة بخطوة صارم) vs "free" (حر وعشوائي)
  const [executionMode, setExecutionMode] = useState<"sequential" | "free">("sequential");
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lockWarning, setLockWarning] = useState<string | null>(null);
  const [recentlyUnlockedId, setRecentlyUnlockedId] = useState<string | null>(null);

  // New Custom Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState(15);
  const [newBreak, setNewBreak] = useState(5);
  const [newTag, setNewTag] = useState<TaskTag | null>(null);
  const [newHighlight, setNewHighlight] = useState<HighlighterColor>("yellow");

  // Pomodoro Timer States
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerPhase, setTimerPhase] = useState<"study" | "break">("study");
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Celebration state
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // ── 1. Smart Initial Seeding (Purely from lecture contents, NO AI generation) ──
  const buildInitialTasks = useCallback((): StudyTask[] => {
    if (!annotations) {
      // General independent personal study tasks
      return [
        {
          id: "task_p1",
          title: "مراجعة وتلخيص المحاضرة",
          description: "تدوين النقاط المحورية واستخراج الأفكار الأساسية بأسلوبك الخاص",
          completed: false,
          order: 1,
          highlightColor: "yellow",
          tag: AVAILABLE_TAGS[4], // تلخيص وتدوين
          durationMinutes: 25,
          breakMinutes: 5,
          type: "custom",
          xpReward: 60,
        },
        {
          id: "task_p2",
          title: "حل الأسئلة والتمارين التطبيقية",
          description: "تطبيق عملي وممارسة حل المسائل لتثبيت الفهم واختبار الاستيعاب",
          completed: false,
          order: 2,
          highlightColor: "pink",
          tag: AVAILABLE_TAGS[0], // سؤال متوقع
          durationMinutes: 20,
          breakMinutes: 5,
          type: "custom",
          xpReward: 50,
        },
        {
          id: "task_p3",
          title: "تثبيت المفاهيم والمصطلحات الأساسية",
          description: "استرجاع سريع للقوانين والتعاريف بدون الاعتماد على المذكرة",
          completed: false,
          order: 3,
          highlightColor: "blue",
          tag: AVAILABLE_TAGS[2], // مهمة سريعة
          durationMinutes: 15,
          breakMinutes: 5,
          type: "custom",
          xpReward: 40,
        },
        {
          id: "task_p4",
          title: "المراجعة الختامية والتقييم الذاتي",
          description: "التأكد من اكتمال كافة النقاط الدراسية المطلوبة وإغلاق المذاكرة بثقة",
          completed: false,
          order: 4,
          highlightColor: "green",
          tag: AVAILABLE_TAGS[3], // تركيز عميق
          durationMinutes: 15,
          breakMinutes: 5,
          type: "custom",
          xpReward: 50,
        },
      ];
    }

    const list: StudyTask[] = [];
    let orderCounter = 1;

    // Task 1: Slides Explanation Review
    const slidesCount = annotations?.slide_explanations?.length ?? 0;
    list.push({
      id: "task_slides_review",
      title: slidesCount > 0 ? `قراءة ومراجعة شروحات السلايدات (${slidesCount} شريحة)` : "تصفح وتخطيط السلايدات الدراسية",
      description: "فهم شرح المادة وتحديد النقاط المحورية",
      completed: false,
      order: orderCounter++,
      highlightColor: "yellow",
      tag: AVAILABLE_TAGS[4], // تلخيص وتدوين
      durationMinutes: 20,
      breakMinutes: 5,
      type: "slides",
      xpReward: 60,
    });

    // Task 2: Focus Points
    const focusCount = annotations?.focus_points?.length ?? 0;
    if (focusCount > 0) {
      list.push({
        id: "task_focus_points",
        title: `استيعاب نقاط التركيز والأسئلة الحرجة (${focusCount} نقطة)`,
        description: "مراجعة النقاط الجوهرية التي لا يخلو منها أي امتحان فصلي أو نهائي",
        completed: false,
        order: orderCounter++,
        highlightColor: "pink",
        tag: AVAILABLE_TAGS[0], // سؤال متوقع
        durationMinutes: 15,
        breakMinutes: 5,
        type: "focus",
        xpReward: 50,
      });
    }

    // Task 3: Flashcards
    const flashCount = annotations?.flashcards?.length ?? 0;
    if (flashCount > 0) {
      list.push({
        id: "task_flashcards",
        title: `تثبيت بطاقات الحفظ والمفاهيم (${flashCount} بطاقة)`,
        description: "تقليب البطاقات واختبار التذكر اللحظي للمصطلحات والقوانين",
        completed: false,
        order: orderCounter++,
        highlightColor: "blue",
        tag: AVAILABLE_TAGS[2], // مهمة سريعة
        durationMinutes: 10,
        breakMinutes: 3,
        type: "flashcards",
        xpReward: 50,
      });
    }

    // Task 4: Quiz
    const mcqsCount = annotations?.mcqs?.length ?? 0;
    if (mcqsCount > 0) {
      list.push({
        id: "task_quiz",
        title: `خوض الكويز التجريبي وقياس نسبة الفهم (${mcqsCount} سؤال)`,
        description: "الإجابة على أسئلة الاختيار من متعدد مع التحقق الفوري من التفسيرات",
        completed: false,
        order: orderCounter++,
        highlightColor: "green",
        tag: AVAILABLE_TAGS[1], // فخ امتحاني
        durationMinutes: 15,
        breakMinutes: 5,
        type: "quiz",
        xpReward: 70,
      });
    }

    // Task 5: Comprehensive Summary
    list.push({
      id: "task_final_wrapup",
      title: "التلخيص النهائي وإغلاق المذاكرة بثقة",
      description: "إلقاء نظرة شاملة على الدفتر وتدوين الملاحظات اليدوية للتثبيت الأخير",
      completed: false,
      order: orderCounter++,
      highlightColor: null,
      tag: AVAILABLE_TAGS[3], // تركيز عميق
      durationMinutes: 10,
      breakMinutes: 5,
      type: "custom",
      xpReward: 40,
    });

    return list;
  }, [annotations]);

  // ── 2. Local Storage Persistence & Restoration ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          setTasks(parsed.tasks);
          if (parsed.mode) setExecutionMode(parsed.mode);
          setIsInitialized(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not read saved study tasks:", e);
    }

    // Fallback: seed initial tasks
    const initial = buildInitialTasks();
    setTasks(initial);
    setIsInitialized(true);
  }, [storageKey, buildInitialTasks]);

  // Save changes to localStorage automatically
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          tasks,
          mode: executionMode,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn("Could not persist study tasks:", e);
    }
  }, [tasks, executionMode, isInitialized, storageKey]);

  // ── 3. Sequential Locking Logic ──
  // The first incomplete task is ACTIVE. All subsequent tasks are LOCKED.
  const firstIncompleteIndex = useMemo(() => {
    return tasks.findIndex((t) => !t.completed);
  }, [tasks]);

  const isTaskLocked = useCallback(
    (index: number, task: StudyTask) => {
      if (executionMode === "free") return false;
      if (task.completed) return false;
      if (firstIncompleteIndex === -1) return false; // all completed
      return index > firstIncompleteIndex;
    },
    [executionMode, firstIncompleteIndex]
  );

  // ── 4. Task Toggle Completion ──
  const toggleTaskCompleted = (taskId: string, index: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (isTaskLocked(index, task)) {
      setLockWarning("🔒 أكمل المهمة الحالية أولاً لفتح هذه المرحلة!");
      if (soundEnabled) playSoundEffect("unlock");
      setTimeout(() => setLockWarning(null), 3000);
      return;
    }

    const nextState = !task.completed;
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
          }
        : t
    );

    setTasks(updated);

    if (nextState) {
      // Completed sound
      if (soundEnabled) playSoundEffect("complete");

      // Check if this unlocked the next task
      if (executionMode === "sequential" && index + 1 < tasks.length) {
        const nextTask = tasks[index + 1];
        if (nextTask && !nextTask.completed) {
          setRecentlyUnlockedId(nextTask.id);
          setTimeout(() => setRecentlyUnlockedId(null), 2000);
        }
      }

      // Check if ALL tasks are now completed
      const allDone = updated.every((t) => t.completed);
      if (allDone) {
        if (soundEnabled) playSoundEffect("victory");
        triggerConfettiCelebration();
        setShowCelebrationModal(true);
      }
    }
  };

  // ── 5. Reordering & Sorting ──
  const moveTask = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= tasks.length) return;

    const reordered = [...tasks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setTasks(reordered);
  };

  const handleSmartSort = (criterion: "priority" | "duration_asc" | "duration_desc" | "pending_first" | "default") => {
    const cloned = [...tasks];
    if (criterion === "priority") {
      // Priority based on tags (exam/trap first)
      const tagPriority: Record<string, number> = {
        critical_trap: 5,
        expected_exam: 4,
        deep_focus: 3,
        note_taking: 2,
        quick_task: 1,
      };
      cloned.sort((a, b) => {
        const pA = a.tag?.id ? tagPriority[a.tag.id] || 0 : 0;
        const pB = b.tag?.id ? tagPriority[b.tag.id] || 0 : 0;
        return pB - pA;
      });
    } else if (criterion === "duration_asc") {
      cloned.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (criterion === "duration_desc") {
      cloned.sort((a, b) => b.durationMinutes - a.durationMinutes);
    } else if (criterion === "pending_first") {
      cloned.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    } else {
      // Default: preserve initial order
      cloned.sort((a, b) => a.order - b.order);
    }
    setTasks(cloned);
  };

  // ── 6. Highlighter & Tag Modifiers ──
  const setTaskHighlight = (taskId: string, color: HighlighterColor) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, highlightColor: t.highlightColor === color ? null : color } : t))
    );
  };

  const setTaskTag = (taskId: string, tag: TaskTag) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, tag: t.tag?.id === tag.id ? null : tag } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTimerTaskId === taskId) {
      setIsTimerRunning(false);
      setActiveTimerTaskId(null);
    }
  };

  // ── 7. Pomodoro Timer Logic ──
  const startPomodoro = (task: StudyTask) => {
    setActiveTimerTaskId(task.id);
    setTimerPhase("study");
    const secs = task.durationMinutes * 60;
    setTimerTotalSeconds(secs);
    setTimerSecondsLeft(secs);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timerSecondsLeft === 0) {
      // Phase completed!
      if (soundEnabled) playSoundEffect("timer");
      const currentTask = tasks.find((t) => t.id === activeTimerTaskId);

      if (timerPhase === "study" && currentTask) {
        // Switch to break
        setTimerPhase("break");
        const breakSecs = (currentTask.breakMinutes || 5) * 60;
        setTimerTotalSeconds(breakSecs);
        setTimerSecondsLeft(breakSecs);
      } else {
        // Timer completed entirely
        setIsTimerRunning(false);
        setActiveTimerTaskId(null);
        if (currentTask && !currentTask.completed) {
          toggleTaskCompleted(currentTask.id, tasks.findIndex((t) => t.id === currentTask.id));
        }
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, timerPhase, activeTimerTaskId, tasks, soundEnabled]);

  const formatTimerDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ── 8. Stats & Computations ──
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const totalEstimatedRemainingMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 15), 0);
  const totalXPEarned = tasks
    .filter((t) => t.completed)
    .reduce((acc, curr) => acc + (curr.xpReward || 50), 0);
  const totalXPPossible = tasks.reduce((acc, curr) => acc + (curr.xpReward || 50), 0);

  // Jump to appropriate tab based on task type
  const handleTaskActionJump = (task: StudyTask) => {
    if (task.type === "slides") {
      if (jumpToPdfSlide) jumpToPdfSlide(1);
    } else if (task.type === "focus") {
      setActiveTab?.("focus");
    } else if (task.type === "flashcards") {
      setActiveTab?.("flashcards");
    } else if (task.type === "quiz") {
      setActiveTab?.("quiz");
    }
  };

  const activeTimerTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTimerTaskId);
  }, [tasks, activeTimerTaskId]);

  return (
    <div className="space-y-4 text-right select-none font-sans" dir="rtl">
      
      {/* ── TOP STATS & LIVE PROGRESS RING HUD ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.04] rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          
          {/* Progress Ring & Counts */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* SVG Circular Ring */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Active Ring */}
                <path
                  className="text-emerald-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeDashoffset="0"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[9px] text-slate-400 font-bold mt-0.5">إنجاز</span>
              </div>
            </div>

            {/* Labels */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  مهام مذاكرة المحاضرة
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {completedTasksCount} من {totalTasksCount} منجزة
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                {totalEstimatedRemainingMinutes > 0 ? (
                  <>⏱️ متبقي حوالي <strong className="text-slate-700 dark:text-slate-200">{totalEstimatedRemainingMinutes} دقيقة</strong> لإنهاء قائمة المهام</>
                ) : (
                  <>🎉 اكتملت جميع المهام بنجاح كامل!</>
                )}
              </p>
            </div>
          </div>

          {/* XP & Sound Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
            {/* XP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-[11px] font-black">
                <span>{totalXPEarned}</span>
                <span className="text-[9px] opacity-70"> / {totalXPPossible} XP</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "كتم المؤثرات الصوتية" : "تفعيل المؤثرات الصوتية"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: MODE SWITCHER & CONTROLS ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-100/80 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        
        {/* Execution Mode Segmented Switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setExecutionMode("sequential")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
              executionMode === "sequential"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>خطوة بخطوة (صارم)</span>
          </button>

          <button
            type="button"
            onClick={() => setExecutionMode("free")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ${
              executionMode === "free"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>إنجاز حر وعشوائي</span>
          </button>
        </div>

        {/* Action Controls: Smart Sort & Add Task */}
        <div className="flex items-center gap-1.5">
          {/* Smart Sort Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:border-indigo-400 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>ترتيب ذكي</span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1 hidden group-hover:block hover:block z-30 text-xs space-y-0.5">
              <button
                type="button"
                onClick={() => handleSmartSort("priority")}
                className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                🎯 حسب الأولوية والوسوم
              </button>
              <button
                type="button"
                onClick={() => handleSmartSort("duration_asc")}
                className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                ⏱️ من الأسهل والأقصر وقتاً
              </button>
              <button
                type="button"
                onClick={() => handleSmartSort("pending_first")}
                className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                🔄 غير المنجز أولاً
              </button>
              <button
                type="button"
                onClick={() => handleSmartSort("default")}
                className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                ⚡ الترتيب الافتراضي للمحاضرة
              </button>
            </div>
          </div>

          {/* Add Custom Task Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Lock warning toast */}
      <AnimatePresence>
        {lockWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-black flex items-center justify-between gap-2 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{lockWarning}</span>
            </div>
            <button onClick={() => setLockWarning(null)} className="p-0.5 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE POMODORO FOCUS TIMER BANNER ── */}
      <AnimatePresence>
        {activeTimerTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-4 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 text-white shadow-lg border border-indigo-500/40 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Task Info & Mode */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  {timerPhase === "study" ? (
                    <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
                  ) : (
                    <Coffee className="w-6 h-6 text-emerald-400 animate-bounce" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      timerPhase === "study" ? "bg-amber-400 text-slate-950" : "bg-emerald-400 text-slate-950"
                    }`}>
                      {timerPhase === "study" ? "جلسة تركيز عميق 🎯" : "استراحة مستحقة ☕"}
                    </span>
                    <span className="text-xs text-indigo-200">
                      {timerPhase === "study" ? `استراحة بعدها: ${activeTimerTask.breakMinutes} د` : "تنفس واستعد"}
                    </span>
                  </div>
                  <h4 className="text-sm font-black mt-1 line-clamp-1">{activeTimerTask.title}</h4>
                </div>
              </div>

              {/* Countdown & Controls */}
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-emerald-300">
                  {formatTimerDisplay(timerSecondsLeft)}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold transition-transform active:scale-95 cursor-pointer shadow-md"
                    title={isTimerRunning ? "إيقاف مؤقت" : "تشغيل"}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const secs = (timerPhase === "study" ? activeTimerTask.durationMinutes : activeTimerTask.breakMinutes) * 60;
                      setTimerSecondsLeft(secs);
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="إعادة ضبط المؤقت"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setActiveTimerTaskId(null);
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white transition-colors cursor-pointer"
                    title="إغلاق المؤقت"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DRAGGABLE & REORDERABLE TASK LIST ── */}
      <Reorder.Group
        axis="y"
        values={tasks}
        onReorder={setTasks}
        className="space-y-2.5"
      >
        {tasks.map((task, index) => {
          const locked = isTaskLocked(index, task);
          const isCurrentActive = executionMode === "sequential" && index === firstIncompleteIndex;
          const highlightStyle = task.highlightColor ? HIGHLIGHTER_STYLES[task.highlightColor] : null;

          return (
            <Reorder.Item
              key={task.id}
              value={task}
              dragListener={!locked}
              className={`rounded-2xl transition-all duration-200 border p-3 sm:p-4 relative group ${
                task.completed
                  ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60"
                  : locked
                  ? "bg-slate-100/40 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-800/40 opacity-40 cursor-not-allowed"
                  : highlightStyle
                  ? highlightStyle.card
                  : isCurrentActive
                  ? "bg-white dark:bg-slate-900 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
              } ${recentlyUnlockedId === task.id ? "ring-4 ring-emerald-500/40 animate-pulse" : ""}`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3">
                
                {/* Drag Handle & Arrow Reordering */}
                <div className="flex flex-col items-center justify-center pt-0.5 gap-0.5 text-slate-400">
                  {!locked && (
                    <div 
                      className="cursor-grab active:cursor-grabbing p-1 hover:text-slate-600 dark:hover:text-slate-300"
                      title="اسحب لإعادة الترتيب"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                  )}

                  {/* Move Up / Down Buttons for mobile/quick clicks */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveTask(index, "up");
                      }}
                      className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                      title="تقديم المهمة لأعلى"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === tasks.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveTask(index, "down");
                      }}
                      className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                      title="تأخير المهمة لأسفل"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Checkbox / Lock Icon */}
                <button
                  type="button"
                  onClick={() => toggleTaskCompleted(task.id, index)}
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    task.completed
                      ? "bg-emerald-500 text-white shadow-xs"
                      : locked
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      : isCurrentActive
                      ? "border-2 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      : "border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500"
                  }`}
                  title={locked ? "المهمة مقفلة، أكمل السابقة لفتحها" : task.completed ? "إلغاء الإنجاز" : "تحديد كمكتملة"}
                >
                  {task.completed ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : locked ? (
                    <Lock className="w-3 h-3" />
                  ) : null}
                </button>

                {/* Task Content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    if (!locked) handleTaskActionJump(task);
                    else toggleTaskCompleted(task.id, index);
                  }}
                >
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {/* Status Badge */}
                    {isCurrentActive && !task.completed && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500 text-white animate-pulse">
                        المهمة النشطة الآن ⚡
                      </span>
                    )}

                    {locked && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> مقفلة خطوة بخطوة
                      </span>
                    )}

                    {/* Tag Badge */}
                    {task.tag && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${task.tag.color}`}>
                        <span>{task.tag.icon}</span>
                        <span>{task.tag.label}</span>
                      </span>
                    )}

                    {/* Duration Badge */}
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mr-auto">
                      <Clock className="w-3 h-3" />
                      {task.durationMinutes} دقيقة
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className={`text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug ${
                    task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
                  }`}>
                    {task.title}
                  </h4>

                  {/* Description */}
                  {task.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* ── INTERACTIVE TASK ACTIONS & HIGHLIGHTER PALETTE ── */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                    
                    {/* Highlighter Pens (Phosphorescent colors) */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <PenTool className="w-2.5 h-2.5" /> تظليل:
                      </span>
                      {(["yellow", "pink", "blue", "green"] as HighlighterColor[]).map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => col && setTaskHighlight(task.id, col)}
                          className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                            col === "yellow" ? "bg-amber-400" :
                            col === "pink" ? "bg-rose-400" :
                            col === "blue" ? "bg-sky-400" :
                            "bg-emerald-400"
                          } ${task.highlightColor === col ? "scale-125 ring-2 ring-offset-1 ring-slate-400" : "hover:scale-110 opacity-70 hover:opacity-100"}`}
                          title={col ? HIGHLIGHTER_STYLES[col].name : ""}
                        />
                      ))}
                      {task.highlightColor && (
                        <button
                          type="button"
                          onClick={() => setTaskHighlight(task.id, null)}
                          className="text-[9px] text-slate-400 hover:text-rose-500 font-bold px-1"
                          title="مسح التظليل"
                        >
                          مسح
                        </button>
                      )}
                    </div>

                    {/* Quick Tag Selector & Pomodoro Timer Launch */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Pomodoro Start Button */}
                      {!task.completed && (
                        <button
                          type="button"
                          onClick={() => startPomodoro(task)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black transition-colors cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>ابدأ التركيز ({task.durationMinutes}د)</span>
                        </button>
                      )}

                      {/* Tag Switcher Icon */}
                      <div className="relative group/tag">
                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="تغيير وسم الأهمية"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute left-0 bottom-full mb-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1 hidden group-hover/tag:block hover:group-hover/tag:block z-30 text-[10px] space-y-0.5">
                          {AVAILABLE_TAGS.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setTaskTag(task.id, t)}
                              className="w-full text-right px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 text-slate-700 dark:text-slate-200 cursor-pointer"
                            >
                              <span>{t.icon}</span>
                              <span>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Delete Task */}
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                        title="حذف المهمة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* ── ADD NEW TASK MODAL ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">إضافة مهمة مذاكرة جديدة</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المهمة
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: حل أسئلة نهاية الشابتر أو حفظ جدول المقارنة..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Duration & Break times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مدة المذاكرة (دقائق)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[10, 15, 25, 45].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setNewDuration(mins)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          newDuration === mins
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {mins}د
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مدة الاستراحة (دقائق)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 10].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setNewBreak(mins)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          newBreak === mins
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {mins}د
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tag selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وسم الأهمية
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {AVAILABLE_TAGS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewTag(newTag?.id === t.id ? null : t)}
                      className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        newTag?.id === t.id ? t.color + " ring-1 ring-current" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlighter picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  لون الهايلايتر التلقائي
                </label>
                <div className="flex items-center gap-2">
                  {(["yellow", "pink", "blue", "green"] as HighlighterColor[]).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewHighlight(col)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        col === "yellow" ? "bg-amber-400 text-slate-950" :
                        col === "pink" ? "bg-rose-400 text-white" :
                        col === "blue" ? "bg-sky-400 text-white" :
                        "bg-emerald-400 text-white"
                      } ${newHighlight === col ? "ring-2 ring-slate-900 dark:ring-white scale-105" : "opacity-60"}`}
                    >
                      {col === "yellow" ? "أصفر" : col === "pink" ? "وردي" : col === "blue" ? "أزرق" : "أخضر"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={!newTitle.trim()}
                  onClick={() => {
                    if (!newTitle.trim()) return;
                    const newTask: StudyTask = {
                      id: `custom_task_${Date.now()}`,
                      title: newTitle.trim(),
                      completed: false,
                      order: tasks.length + 1,
                      highlightColor: newHighlight,
                      tag: newTag,
                      durationMinutes: newDuration,
                      breakMinutes: newBreak,
                      type: "custom",
                      xpReward: 50,
                    };
                    setTasks((prev) => [...prev, newTask]);
                    setNewTitle("");
                    setIsAddModalOpen(false);
                    if (soundEnabled) playSoundEffect("complete");
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  إضافة المهمة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 100% COMPLETION CELEBRATION MODAL ── */}
      <AnimatePresence>
        {showCelebrationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400 dark:border-amber-500/80 p-6 shadow-2xl text-center space-y-4 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto shadow-inner border border-amber-500/30">
                <Trophy className="w-9 h-9 animate-bounce" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  إنجاز أسطوري 🎓
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                  أبدعت! أنهيت جميع مهام هذه المحاضرة بنجاح
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  استوعبت المحتوى، وتجاوزت الفخاخ، وأثبتت تفوقك الأكاديمي بجدارة!
                </p>
              </div>

              {/* XP reward highlight */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-black text-amber-900 dark:text-amber-200">
                  حصلت على +{totalXPPossible} XP في رصيد التفوق!
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCelebrationModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all cursor-pointer"
                >
                  متابعة التفوق الأكاديمي 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

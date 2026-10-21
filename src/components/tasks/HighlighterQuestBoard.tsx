"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Check,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  Clock,
  ArrowUp,
  ArrowDown,
  Pencil,
  CheckSquare,
  Square,
  AlertCircle,
  Tag,
  CheckCheck,
  Palette,
  Layers,
  ChevronDown,
  BookOpen
} from "lucide-react";

export interface StudyTask {
  id: string;
  title: string;
  subject?: string;
  estimatedMinutes?: number;
  completed: boolean;
  completedAt?: string | null;
  highlighterId: string; // "yellow" | "mint" | "violet" | "sky" | "peach" | "pink"
  createdAt: string;
}

// 6 Authentic Academic Highlighters
export const HIGHLIGHTERS = [
  {
    id: "yellow",
    name: "أصفر فسفوري",
    hex: "#FACC15",
    colorName: "Yellow",
    penTipClass: "bg-yellow-400 border-yellow-500",
    strokeBg: "bg-yellow-200/90 dark:bg-yellow-400/25",
    markerBorder: "border-yellow-400/80 dark:border-yellow-400/40",
    textClass: "text-amber-950 dark:text-yellow-100",
    dotClass: "bg-yellow-400",
    badgeClass: "bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-300/80 dark:border-yellow-500/30",
  },
  {
    id: "mint",
    name: "أخضر نعناعي",
    hex: "#4ADE80",
    colorName: "Mint",
    penTipClass: "bg-emerald-400 border-emerald-500",
    strokeBg: "bg-emerald-200/90 dark:bg-emerald-400/25",
    markerBorder: "border-emerald-400/80 dark:border-emerald-400/40",
    textClass: "text-emerald-950 dark:text-emerald-100",
    dotClass: "bg-emerald-400",
    badgeClass: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-500/30",
  },
  {
    id: "violet",
    name: "بنفسجي لمّاح",
    hex: "#C084FC",
    colorName: "Violet",
    penTipClass: "bg-purple-400 border-purple-500",
    strokeBg: "bg-purple-200/90 dark:bg-purple-400/25",
    markerBorder: "border-purple-400/80 dark:border-purple-400/40",
    textClass: "text-purple-950 dark:text-purple-100",
    dotClass: "bg-purple-400",
    badgeClass: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300/80 dark:border-purple-500/30",
  },
  {
    id: "sky",
    name: "أزرق سماوي",
    hex: "#38BDF8",
    colorName: "Sky",
    penTipClass: "bg-sky-400 border-sky-500",
    strokeBg: "bg-sky-200/90 dark:bg-sky-400/25",
    markerBorder: "border-sky-400/80 dark:border-sky-400/40",
    textClass: "text-sky-950 dark:text-sky-100",
    dotClass: "bg-sky-400",
    badgeClass: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300/80 dark:border-sky-500/30",
  },
  {
    id: "peach",
    name: "برتقالي مشمس",
    hex: "#FB923C",
    colorName: "Peach",
    penTipClass: "bg-orange-400 border-orange-500",
    strokeBg: "bg-orange-200/90 dark:bg-orange-400/25",
    markerBorder: "border-orange-400/80 dark:border-orange-400/40",
    textClass: "text-orange-950 dark:text-orange-100",
    dotClass: "bg-orange-400",
    badgeClass: "bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300/80 dark:border-orange-500/30",
  },
  {
    id: "pink",
    name: "وردي باستيل",
    hex: "#F472B6",
    colorName: "Pink",
    penTipClass: "bg-pink-400 border-pink-500",
    strokeBg: "bg-pink-200/90 dark:bg-pink-400/25",
    markerBorder: "border-pink-400/80 dark:border-pink-400/40",
    textClass: "text-pink-950 dark:text-pink-100",
    dotClass: "bg-pink-400",
    badgeClass: "bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 border-pink-300/80 dark:border-pink-500/30",
  },
];

const STORAGE_KEY = "lammah_academic_study_tasks_v3";
const MODE_STORAGE_KEY = "lammah_study_tasks_sequential_mode";

const SUBJECT_TAGS = [
  "عام",
  "تلخيص",
  "حل مسائل",
  "حفظ ومراجعة",
  "كويز وامتحان",
  "واجب منزلي",
];

const ESTIMATED_TIMES = [15, 30, 45, 60, 90];

export default function HighlighterQuestBoard() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sequential Mode Toggle (true = إنجاز بالترتيب, false = إنجاز حر بدون ترتيب)
  const [isSequential, setIsSequential] = useState<boolean>(true);

  // Active highlighter pen selected by user
  const [activePenId, setActivePenId] = useState<string>("yellow");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("عام");
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Locked notice feedback state (when user tries to click a locked task in sequential mode)
  const [lockedNoticeTaskId, setLockedNoticeTaskId] = useState<string | null>(null);

  // Today study time from localStorage
  const [todayStudySeconds, setTodayStudySeconds] = useState<number>(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      }

      const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
      if (savedMode !== null) {
        setIsSequential(savedMode === "true");
      }

      const d = new Date();
      const todayKey = `lammah_study_seconds_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const savedTodaySecs = localStorage.getItem(todayKey);
      if (savedTodaySecs) {
        setTodayStudySeconds(parseInt(savedTodaySecs, 10) || 0);
      }
    } catch (e) {
      console.warn("Error loading tasks:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Error saving tasks:", e);
    }
  }, [tasks, isLoaded]);

  // Save sequential mode to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, String(isSequential));
    } catch (e) {
      console.warn("Error saving mode:", e);
    }
  }, [isSequential, isLoaded]);

  // Focus inline edit input
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Today formatted in Arabic
  const todayFormatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
    } catch {
      return "اليوم";
    }
  }, []);

  // Compute Active Index for Sequential Mode (First task that is NOT completed)
  const activeSequentialIndex = useMemo(() => {
    return tasks.findIndex((t) => !t.completed);
  }, [tasks]);

  // Helper formatting for cumulative hours & minutes
  const formatTotalTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours} ساعة و ${mins} دقيقة`;
    if (mins > 0) return `${mins} دقيقة`;
    return "0 دقيقة";
  };

  // Add task handler
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    const newTask: StudyTask = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: trimmed,
      subject: selectedTag || "عام",
      estimatedMinutes: selectedMinutes,
      completed: false,
      highlighterId: activePenId,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
  };

  // Toggle task completion with Sequential Check
  const handleToggleTask = (task: StudyTask, index: number) => {
    // If sequential mode is enabled, check if task is locked
    if (isSequential) {
      if (!task.completed && activeSequentialIndex !== -1 && index !== activeSequentialIndex) {
        // Locked! Show feedback notice
        setLockedNoticeTaskId(task.id);
        setTimeout(() => setLockedNoticeTaskId(null), 2500);
        return;
      }
    }

    // Toggle completion state
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === task.id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null,
          };
        }
        return t;
      })
    );
  };

  // Change task highlighter color
  const handleChangeTaskColor = (taskId: string, colorId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, highlighterId: colorId } : t))
    );
  };

  // Move task up (reorder)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setTasks((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move task down (reorder)
  const handleMoveDown = (index: number) => {
    if (index >= tasks.length - 1) return;
    setTasks((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Save inline edit
  const handleSaveEdit = (taskId: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, title: trimmed } : t))
      );
    }
    setEditingId(null);
    setEditingTitle("");
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (editingId === taskId) {
      setEditingId(null);
    }
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    if (confirm("هل ترغب في مسح جميع المهام المنجزة من الدفتر؟")) {
      setTasks((prev) => prev.filter((t) => !t.completed));
    }
  };

  // Open global study timer
  const handleOpenTimer = () => {
    window.dispatchEvent(new CustomEvent("open-study-timer"));
  };

  // Statistics calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6" dir="rtl">
      
      {/* ── TOP TOOLBAR: Mode Switch & Study Timer Card ── */}
      <div className="bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Sequential Mode Toggle (الترتيب vs إنجاز حر) */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>نظام إنجاز المهام:</span>
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSequential(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                isSequential
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs border border-indigo-200/60 dark:border-indigo-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>إنجاز بالترتيب (تتابع ملزم)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSequential(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                !isSequential
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-xs border border-emerald-200/60 dark:border-emerald-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
              <span>إنجاز حر (بدون ترتيب)</span>
            </button>
          </div>
        </div>

        {/* Global Study Timer Launcher & Today Summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block">دراستك اليوم:</span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {formatTotalTime(todayStudySeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenTimer}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>مؤقت المذاكرة والتركيز</span>
          </button>
        </div>
      </div>

      {/* ── HIGHLIGHTER PENS TRAY (حامل أقلام الهايلايتر) ── */}
      <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-500" />
            <span>اختر قلم الهايلايتر لتلوين وتخطيط مهامك:</span>
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            القلم المحدد: <strong className="text-slate-700 dark:text-slate-300">{HIGHLIGHTERS.find(h => h.id === activePenId)?.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
          {HIGHLIGHTERS.map((pen) => {
            const isSelected = activePenId === pen.id;
            return (
              <button
                key={pen.id}
                type="button"
                onClick={() => setActivePenId(pen.id)}
                className={`relative p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-800/90 shadow-md scale-102 ring-2 ring-indigo-500/30"
                    : "bg-slate-50/70 dark:bg-white/[0.02] border-slate-200/60 dark:border-slate-800 hover:bg-slate-100/80 hover:scale-101"
                }`}
                style={{
                  borderColor: isSelected ? pen.hex : undefined,
                }}
              >
                {/* Visual Highlighter Pen Tip */}
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-5 rounded-t-sm rounded-b-xs shadow-xs transition-transform"
                    style={{ backgroundColor: pen.hex }}
                  />
                  <div className="w-3 h-4 bg-slate-300 dark:bg-slate-600 rounded-b-sm" />
                </div>

                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                  {pen.name}
                </span>

                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── THE ACADEMIC NOTEBOOK SHEET (ورقة الدفتر الأكاديمي المسطرة) ── */}
      <div className="relative rounded-3xl bg-white dark:bg-[#0c1222] border-2 border-slate-300/80 dark:border-slate-700/80 shadow-xl overflow-hidden">
        
        {/* Notebook Top Ring Holes (خروق دفتر السلك الأكاديمي) */}
        <div className="bg-slate-100 dark:bg-[#080d19] border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 inline-block shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 inline-block shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 inline-block shadow-inner" />
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                دفتر مهام المذاكرة الأكاديمي
              </span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <span>📅</span>
            <span>{todayFormatted}</span>
          </div>
        </div>

        {/* Notebook Paper Body with Ruled Lines & Red Margin Line */}
        <div
          className="relative p-6 sm:p-8 min-h-[500px]"
          style={{
            backgroundImage: `repeating-linear-gradient(transparent, transparent 43px, rgba(99, 102, 241, 0.08) 43px, rgba(99, 102, 241, 0.08) 44px)`,
          }}
        >
          {/* Vertical Pink Margin Line (RTL: right side) */}
          <div className="absolute top-0 bottom-0 right-14 sm:right-20 w-[2px] bg-rose-400/40 dark:bg-rose-500/20 pointer-events-none" />

          {/* New Task Input Line inside the notepad */}
          <form onSubmit={handleAddTask} className="mb-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-50/90 dark:bg-slate-900/90 p-2 sm:p-2.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs">
              
              {/* Task Title Input */}
              <div className="flex-1 flex items-center gap-2 px-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: HIGHLIGHTERS.find((h) => h.id === activePenId)?.hex }}
                  title="لون الهايلايتر المختار"
                />
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="اكتب مهمتك الدراسية هنا (مثال: دراسة شابتر 3، حل أسئلة الكويز)..."
                  className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Tag Selector */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <Tag className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  {SUBJECT_TAGS.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-slate-800">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Time Selector */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedMinutes}
                  onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  {ESTIMATED_TIMES.map((m) => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-800">
                      {m} دقيقة
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة للدفتر</span>
              </button>
            </div>
          </form>

          {/* Progress Bar & Filter Tabs */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-indigo-100/60 dark:border-slate-800">
              
              {/* Progress Bar */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {completedCount} من {totalCount} مكتملة ({completionPercentage}%)
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filter === "all"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  الكل ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("active")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filter === "active"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  قيد الإنجاز ({remainingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("completed")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filter === "completed"
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  المكتملة ({completedCount})
                </button>
              </div>

              {/* Clear Completed */}
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  مسح المنجز 🗑️
                </button>
              )}
            </div>
          )}

          {/* Sequential Mode Notification Banner */}
          {isSequential && remainingCount > 1 && (
            <div className="mb-4 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between text-xs text-indigo-800 dark:text-indigo-300">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  <strong>وضع التتابع مُفعّل:</strong> يجب إنجاز المهمة الحالية لفتح المهمة التي تليها!
                </span>
              </div>
              <span className="text-[10px] font-normal text-slate-500">
                (يمكنك استخدام الأسهم ⬆️ ⬇️ لترتيب أولوياتك)
              </span>
            </div>
          )}

          {/* ── TASKS LIST ── */}
          <div className="space-y-3 relative z-10">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => {
                  // Find original index in full tasks array
                  const originalIndex = tasks.findIndex((t) => t.id === task.id);
                  const isLocked =
                    isSequential &&
                    !task.completed &&
                    activeSequentialIndex !== -1 &&
                    originalIndex > activeSequentialIndex;
                  const isCurrentActive =
                    isSequential &&
                    !task.completed &&
                    originalIndex === activeSequentialIndex;

                  const pen =
                    HIGHLIGHTERS.find((h) => h.id === task.highlighterId) ||
                    HIGHLIGHTERS[0];

                  const isNoticeOpen = lockedNoticeTaskId === task.id;

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative group rounded-2xl p-3 sm:p-4 border transition-all duration-200 ${
                        task.completed
                          ? "bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 opacity-70"
                          : isLocked
                          ? "bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 opacity-75"
                          : isCurrentActive
                          ? "bg-white dark:bg-[#10172a] border-indigo-400 dark:border-indigo-500/80 shadow-md ring-2 ring-indigo-500/15"
                          : "bg-white dark:bg-[#0e1424] border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs"
                      }`}
                    >
                      {/* Locked Notice Popup (Shake feedback) */}
                      {isNoticeOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-3 right-8 z-30 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black shadow-lg flex items-center gap-1.5"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>يجب إنجاز المهمة السابقة أولاً!</span>
                        </motion.div>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        
                        {/* Checkbox / Lock Icon */}
                        <div className="flex items-center gap-3 shrink-0">
                          
                          {/* Sequential Order Number */}
                          <span className="w-5 text-center text-xs font-black text-slate-400">
                            {originalIndex + 1}.
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleTask(task, originalIndex)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              task.completed
                                ? "bg-emerald-600 text-white shadow-xs"
                                : isLocked
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                : isCurrentActive
                                ? "border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                                : "border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400"
                            }`}
                            title={isLocked ? "مهمة مقفلة - أنجز السابقة أولاً" : "تحديد كمكتمل"}
                          >
                            {task.completed ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : isLocked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : null}
                          </button>
                        </div>

                        {/* Task Content with Authentic Highlighter Stroke */}
                        <div className="flex-1 min-w-0">
                          {editingId === task.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEdit(task.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="w-full text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 border border-indigo-400 rounded-lg px-2 py-1 text-slate-900 dark:text-white focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(task.id)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                              >
                                حفظ
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              {/* Title with Highlighter effect */}
                              <div className="relative inline-block max-w-full">
                                <span
                                  className={`relative z-10 text-xs sm:text-sm font-black transition-all ${
                                    task.completed
                                      ? "line-through text-slate-400 dark:text-slate-500"
                                      : isLocked
                                      ? "text-slate-600 dark:text-slate-400"
                                      : "text-slate-900 dark:text-white"
                                  }`}
                                >
                                  {task.title}
                                </span>

                                {/* Realistic Highlighter Ink Underlay */}
                                {!task.completed && (
                                  <span
                                    className={`absolute inset-0 -inset-x-1.5 my-0.5 rounded-sm opacity-85 pointer-events-none transition-colors ${pen.strokeBg}`}
                                    style={{ zIndex: 0 }}
                                  />
                                )}
                              </div>

                              {/* Task Badges & Status */}
                              <div className="flex items-center gap-2 shrink-0">
                                {task.subject && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {task.subject}
                                  </span>
                                )}

                                {task.estimatedMinutes && (
                                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.estimatedMinutes} د
                                  </span>
                                )}

                                {isCurrentActive && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse">
                                    المهمة الحالية ⚡
                                  </span>
                                )}

                                {isLocked && (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" />
                                    مقفلة
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions (Change Color, Reorder ⬆️ ⬇️, Edit, Delete) */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          
                          {/* Highlighter color dot picker for this task */}
                          <div className="relative group/color">
                            <button
                              type="button"
                              className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer shadow-2xs hover:scale-110 transition-transform"
                              style={{ backgroundColor: pen.hex }}
                              title="تغيير لون قلم الهايلايتر لهذه المهمة"
                            />
                            {/* Color Picker Flyout on hover */}
                            <div className="hidden group-hover/color:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 gap-1 z-30">
                              {HIGHLIGHTERS.map((h) => (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => handleChangeTaskColor(task.id, h.id)}
                                  className="w-4 h-4 rounded-full cursor-pointer hover:scale-125 transition-transform"
                                  style={{ backgroundColor: h.hex }}
                                  title={h.name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Reorder Buttons (Move Up / Down) */}
                          <button
                            type="button"
                            onClick={() => handleMoveUp(originalIndex)}
                            disabled={originalIndex === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                            title="تقديم المهمة للأعلى"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(originalIndex)}
                            disabled={originalIndex >= tasks.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                            title="تأخير المهمة للأسفل"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit inline */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(task.id);
                              setEditingTitle(task.title);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                            title="تعديل اسم المهمة"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="حذف المهمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                /* Empty Notepad State (Clean, Academic, Inviting) */
                <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-3 shadow-inner">
                    <BookOpen className="w-8 h-8 opacity-70" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">
                    دفتر مهامك فارغ ومستعد لمذاكرتك
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mb-4">
                    اختر قلم الهايلايتر المفضل لديك من الأعلى واكتب مهمتك الدراسية لتنظيم يومك الأكاديمي.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

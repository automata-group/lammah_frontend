"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Pencil,
  Tag,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle
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

// 6 Curated Authentic Highlighters
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
  "واجب",
];

const ESTIMATED_TIMES = [15, 30, 45, 60];

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

  // Locked feedback animation
  const [lockedNoticeTaskId, setLockedNoticeTaskId] = useState<string | null>(null);
  // Active color picker task ID (for click-to-open and pin)
  const [activeColorPickerTaskId, setActiveColorPickerTaskId] = useState<string | null>(null);

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

  // Save mode to localStorage
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

  // Close color picker when clicking outside
  useEffect(() => {
    if (!activeColorPickerTaskId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-color-picker]')) {
        setActiveColorPickerTaskId(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [activeColorPickerTaskId]);

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

  // Compute Active Index for Sequential Mode
  const activeSequentialIndex = useMemo(() => {
    return tasks.findIndex((t) => !t.completed);
  }, [tasks]);

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
    if (isSequential) {
      if (!task.completed && activeSequentialIndex !== -1 && index !== activeSequentialIndex) {
        setLockedNoticeTaskId(task.id);
        setTimeout(() => setLockedNoticeTaskId(null), 2500);
        return;
      }
    }

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

  // Move task up
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

  // Move task down
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
    if (editingId === taskId) setEditingId(null);
  };

  // Clear completed
  const handleClearCompleted = () => {
    if (confirm("هل ترغب في مسح المهام المنجزة من الدفتر؟")) {
      setTasks((prev) => prev.filter((t) => !t.completed));
    }
  };

  // Stats
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
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center" dir="rtl">
      
      {/* ── METALLIC SPIRAL BINDER RINGS (حلقات السلك الأكاديمي) ── */}
      <div className="w-full px-8 -mb-3 z-20 flex justify-around pointer-events-none select-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="w-2.5 h-6 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 dark:from-slate-600 dark:via-slate-400 dark:to-slate-600 shadow-md border border-slate-400/50" />
            <span className="w-2 h-2 -mt-1 rounded-full bg-slate-300 dark:bg-slate-700 shadow-inner" />
          </div>
        ))}
      </div>

      {/* ── THE ELEGANT UNIFIED ACADEMIC NOTEBOOK ── */}
      <div className="w-full relative rounded-3xl bg-[#FAF8F5] dark:bg-[#0E1526] border border-slate-300/80 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Notebook Leather/Linen Header Strip */}
        <div className="bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-[#111A30] dark:to-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Title & Date */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>دفتر مهام المذاكرة</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{todayFormatted}</span>
              </span>
            </div>
          </div>

          {/* Mode Switch (🔒 بالترتيب vs 🔓 إنجاز حر) */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-full border border-slate-300/60 dark:border-slate-700/60 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setIsSequential(true)}
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSequential
                  ? "bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Lock className="w-3 h-3 text-indigo-500 dark:text-white" />
              <span>إنجاز بالترتيب</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSequential(false)}
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isSequential
                  ? "bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Unlock className="w-3 h-3 text-emerald-500 dark:text-white" />
              <span>إنجاز حر</span>
            </button>
          </div>
        </div>

        {/* Compact, Slim Highlighter Pens Rack (حامل أقلام الهايلايتر الأكاديمي) */}
        <div className="bg-slate-100/60 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
            قلم الهايلايتر:
          </span>
          <div className="flex items-center gap-2">
            {HIGHLIGHTERS.map((pen) => {
              const isSelected = activePenId === pen.id;
              return (
                <button
                  key={pen.id}
                  type="button"
                  onClick={() => setActivePenId(pen.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 shadow-xs scale-105 ring-1 ring-black/5 dark:ring-white/10"
                      : "bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                  }`}
                  title={pen.name}
                >
                  <span
                    className="w-3 h-3 rounded-full shadow-2xs shrink-0"
                    style={{ backgroundColor: pen.hex }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {pen.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── NOTEBOOK LINED PAPER (ورقة الدفتر المسطرة) ── */}
        <div
          className="relative p-6 sm:p-8 min-h-[460px]"
          style={{
            backgroundImage: `repeating-linear-gradient(transparent, transparent 41px, rgba(99, 102, 241, 0.08) 41px, rgba(99, 102, 241, 0.08) 42px)`,
          }}
        >
          {/* Subtle Vertical Pink Margin Line (RTL Right side) */}
          <div className="absolute top-0 bottom-0 right-10 sm:right-14 w-[1px] bg-rose-400/40 dark:bg-rose-500/25 pointer-events-none" />

          {/* New Task Row (Seamlessly styled onto the paper) */}
          <form onSubmit={handleAddTask} className="mb-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/95 dark:bg-slate-900/90 p-2 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs">
              
              <div className="flex-1 flex items-center gap-2 px-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: HIGHLIGHTERS.find((h) => h.id === activePenId)?.hex }}
                />
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="اكتب مهمتك هنا... (مثال: تلخيص شابتر 3، حل مسائل الشيت)..."
                  className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>

              {/* Tag Selector */}
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 shrink-0">
                <Tag className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
                >
                  {SUBJECT_TAGS.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-slate-800">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selector */}
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                <select
                  value={selectedMinutes}
                  onChange={(e) => setSelectedMinutes(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
                >
                  {ESTIMATED_TIMES.map((m) => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-800">
                      {m} د
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
          </form>

          {/* Progress & Filters Strip */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              {/* Progress counter */}
              <div className="flex items-center gap-2.5">
                <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {completedCount} من {totalCount} مكتملة ({completionPercentage}%)
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                    filter === "all"
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  الكل ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("active")}
                  className={`px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                    filter === "active"
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  قيد الإنجاز ({remainingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("completed")}
                  className={`px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                    filter === "completed"
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  المكتملة ({completedCount})
                </button>

                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="text-[10px] text-slate-400 hover:text-rose-500 mr-2 transition cursor-pointer"
                  >
                    مسح المنجز
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sequential Order Guidance Pill */}
          {isSequential && remainingCount > 1 && (
            <div className="mb-4 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-indigo-500" />
                <span>إنجاز المهام بالترتيب: المهمة التالية تفتح تلقائياً عند إنهاء الحالية</span>
              </span>
              <span className="text-[10px] text-slate-400">
                (استخدم الأسهم ⬆️ ⬇️ لتحديد الترتيب)
              </span>
            </div>
          )}

          {/* ── TASKS ROWS ON RULED PAPER ── */}
          <div className="space-y-2.5 relative z-10">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
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
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative group rounded-xl px-3.5 py-2.5 border transition-all duration-200 ${
                        task.completed
                          ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/40 opacity-70"
                          : isLocked
                          ? "bg-white/40 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/40 opacity-65"
                          : isCurrentActive
                          ? "bg-white dark:bg-[#121B2F] border-indigo-400 dark:border-indigo-500/80 shadow-xs ring-1 ring-indigo-500/20"
                          : "bg-white/90 dark:bg-[#101726] border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs"
                      }`}
                    >
                      {/* Locked Notice Shake */}
                      {isNoticeOpen && (
                        <div className="absolute -top-3 right-8 z-30 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-md flex items-center gap-1 animate-bounce">
                          <AlertCircle className="w-3 h-3" />
                          <span>يجب إنجاز المهمة السابقة أولاً!</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2.5">
                        
                        {/* Checkbox & Order Number */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="w-4 text-center text-xs font-black text-slate-400">
                            {originalIndex + 1}.
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleTask(task, originalIndex)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition cursor-pointer ${
                              task.completed
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : isLocked
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                : isCurrentActive
                                ? "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                                : "border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400"
                            }`}
                          >
                            {task.completed ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : isLocked ? (
                              <Lock className="w-3 h-3" />
                            ) : null}
                          </button>
                        </div>

                        {/* Task Title with Authentic Highlighter Marker Stroke */}
                        <div className="flex-1 min-w-0">
                          {editingId === task.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEdit(task.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-indigo-400 rounded px-2 py-0.5 text-slate-900 dark:text-white focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(task.id)}
                                className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-bold"
                              >
                                حفظ
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              
                              {/* Title with highlighter marker ink effect */}
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

                                {!task.completed && (
                                  <span
                                    className={`absolute inset-0 -inset-x-1.5 my-0.5 rounded-xs opacity-80 pointer-events-none ${pen.strokeBg}`}
                                    style={{ zIndex: 0 }}
                                  />
                                )}
                              </div>

                              {/* Badges */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {task.subject && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    {task.subject}
                                  </span>
                                )}

                                {task.estimatedMinutes && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {task.estimatedMinutes}د
                                  </span>
                                )}

                                {isCurrentActive && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                    قيد الإنجاز ⚡
                                  </span>
                                )}

                                {isLocked && (
                                  <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" />
                                    مقفلة
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Reorder & Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* Color Dot (Click or Hover to pick color) */}
                          <div
                            className="relative group/color"
                            data-color-picker
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveColorPickerTaskId((prev) => (prev === task.id ? null : task.id));
                              }}
                              className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 cursor-pointer shadow-2xs hover:scale-125 transition-transform focus:outline-hidden"
                              style={{ backgroundColor: pen.hex }}
                              title="تغيير لون قلم الهايلايتر (انقر للتثبيت أو مرر الفأرة)"
                              aria-label="تغيير لون قلم الهايلايتر"
                            />

                            {/* Color Palette Menu with continuous hit area bridge (pb-2 eliminates mouseleave gap) */}
                            <div
                              className={`absolute bottom-full left-1/2 -translate-x-1/2 pb-2 z-40 transition-all duration-150 ${
                                activeColorPickerTaskId === task.id
                                  ? "flex opacity-100 pointer-events-auto"
                                  : "hidden group-hover/color:flex opacity-100 pointer-events-auto"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-700 backdrop-blur-xs">
                                {HIGHLIGHTERS.map((h) => {
                                  const isCurrent = h.id === task.highlighterId;
                                  return (
                                    <button
                                      key={h.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleChangeTaskColor(task.id, h.id);
                                        setActiveColorPickerTaskId(null);
                                      }}
                                      className={`w-4 h-4 rounded-full cursor-pointer hover:scale-130 transition-transform flex items-center justify-center ${
                                        isCurrent ? "ring-2 ring-slate-900 dark:ring-white ring-offset-1" : "border border-black/10"
                                      }`}
                                      style={{ backgroundColor: h.hex }}
                                      title={h.name}
                                    >
                                      {isCurrent && <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMoveUp(originalIndex)}
                            disabled={originalIndex === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                            title="تقديم المهمة للأعلى"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(originalIndex)}
                            disabled={originalIndex >= tasks.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                            title="تأخير المهمة للأسفل"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(task.id);
                              setEditingTitle(task.title);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                            title="تعديل المهمة"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="حذف المهمة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                /* Clean Empty State */
                <div className="py-14 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mb-2.5">
                    <BookOpen className="w-6 h-6 opacity-60" />
                  </div>
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                    دفتر مهامك فارغ ومستعد لمذاكرتك
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    اكتب مهمتك الدراسية في السطر أعلاه لتنظيم يومك الأكاديمي.
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

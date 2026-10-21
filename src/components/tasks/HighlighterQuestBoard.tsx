"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Calendar,
  FileText,
  Tag,
} from "lucide-react";
import StudyFocusTimer from "@/components/dashboard/StudyFocusTimer";

export interface StudyTask {
  id: string;
  title: string;
  subject?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
}

const STORAGE_KEY = "lammah_study_tasks_v2";

const SUBJECT_TAGS = [
  "عام",
  "تلخيص",
  "حل مسائل",
  "حفظ ومراجعة",
  "كويز وامتحان",
];

export default function HighlighterQuestBoard() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load tasks strictly from localStorage on mount (NO fake demo tasks!)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load study tasks from storage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Failed to persist study tasks:", e);
    }
  }, [tasks, isLoaded]);

  // Focus edit input when opening inline editor
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Formatted date string in Arabic
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

  // Add new task
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    const newTask: StudyTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: trimmed,
      subject: selectedTag || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
  };

  // Toggle task completion
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
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

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t))
      );
    }
    setEditingId(null);
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Statistics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* 1. Academic Study Notepad Sheet (ورقة مهام المذاكرة) */}
      <div className="bg-white dark:bg-[#0c111d] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-2xl dark:shadow-black/40 overflow-hidden transition-all">
        {/* Paper Top Header (Notepad Binding Bar) */}
        <div className="bg-slate-50/90 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title & Date */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>ورقة مهام المذاكرة</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{todayFormatted}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Timer Trigger & Stats */}
            <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
              <StudyFocusTimer />

              {totalCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {completedCount} / {totalCount}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    ({completionPercentage}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Minimal Progress Bar if tasks exist */}
          {totalCount > 0 && (
            <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
          )}
        </div>

        {/* Paper Ruled Section: Input + List */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Quick Add Form (Like writing the next line on the notepad) */}
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 sm:p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <div className="p-2 text-slate-400 shrink-0">
                <Plus className="w-4 h-4 text-indigo-500" />
              </div>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="اكتب مهمتك الدراسية هنا واضغط Enter... (مثال: دراسة سلايدات الفصل 3)"
                className="flex-1 bg-transparent border-none text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-black transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <span>إضافة</span>
              </button>
            </div>

            {/* Optional Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pl-1 shrink-0">
                <Tag className="w-3 h-3" />
                <span>تصنيف:</span>
              </span>
              {SUBJECT_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(isSelected ? "" : tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40"
                        : "bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag("")}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold px-1.5 cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </form>

          {/* Filter Bar (Only shown when tasks exist) */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between border-y border-slate-100 dark:border-slate-800/80 py-3 text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filter === "all"
                      ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  الكل ({totalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("active")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filter === "active"
                      ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  قيد الإنجاز ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("completed")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filter === "completed"
                      ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  المكتملة ({completedCount})
                </button>
              </div>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  مسح المكتملة ({completedCount})
                </button>
              )}
            </div>
          )}

          {/* Tasks List (Ruled Lines Aesthetic) */}
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const isEditing = editingId === task.id;

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.18 }}
                      className="group flex items-center justify-between gap-3 py-3 px-3.5 rounded-2xl border-b border-slate-100/90 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all"
                    >
                      {/* Checkbox & Task Title */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer border ${
                            task.completed
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-2xs"
                              : "border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent"
                          }`}
                          title={task.completed ? "إلغاء التحديد" : "تحديد كمكتمل"}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(task.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="flex-1 bg-white dark:bg-slate-950 border border-indigo-400 rounded-xl px-3 py-1 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(task.id)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                            <span
                              onClick={() => handleToggleTask(task.id)}
                              className={`text-xs sm:text-sm font-semibold cursor-pointer transition-all leading-relaxed ${
                                task.completed
                                  ? "line-through text-slate-400 dark:text-slate-500 bg-amber-100/90 dark:bg-amber-400/15 px-2 py-0.5 rounded-md decoration-slate-400/80"
                                  : "text-slate-800 dark:text-slate-100"
                              }`}
                            >
                              {task.title}
                            </span>

                            {task.subject && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                                {task.subject}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hover Actions: Edit & Delete */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(task.id);
                              setEditingTitle(task.title);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="تعديل المهمة"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="حذف المهمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                /* Clean Empty State (When no tasks exist or filter has 0 items) */
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {filter === "completed"
                        ? "لا توجد مهام مكتملة بعد"
                        : filter === "active"
                        ? "أنهيت جميع المهام بنجاح! 🎉"
                        : "ورقة المهام فارغة 📝"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                      {filter === "all"
                        ? "أضف مهام المذاكرة الخاصة بك أعلاه لتنظيم دراستك خطوة بخطوة."
                        : "استمر في التقدم والإنجاز."}
                    </p>
                  </div>

                  {/* Gentle suggested starter tasks if sheet is totally empty */}
                  {totalCount === 0 && (
                    <div className="pt-3 flex flex-wrap justify-center gap-2">
                      <span className="w-full text-[11px] font-bold text-slate-400">
                        اقتراحات سريعة لإضافتها للمفكرة:
                      </span>
                      {[
                        "مراجعة وتلخيص المحاضرة الأخيرة",
                        "حل مسائل وتدريبات نهاية الفصل",
                        "مراجعة بطاقات الفلاش كاردز قبل النوم",
                      ].map((sugg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setTasks((prev) => [
                              {
                                id: `task_${Date.now()}_${i}`,
                                title: sugg,
                                completed: false,
                                createdAt: new Date().toISOString(),
                              },
                              ...prev,
                            ]);
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/20 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
                        >
                          + {sugg}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Paper Footer Note */}
        {totalCount > 0 && (
          <div className="bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 px-5 py-3 text-center sm:text-right flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>
              💡 رتّب مهامك بالأولوية وأنجزها واحدة تلو الأخرى لتركيز دراسي فائق.
            </span>
            <span className="hidden sm:inline font-bold">
              {activeCount} مهام متبقية
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

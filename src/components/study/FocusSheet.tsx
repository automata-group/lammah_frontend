"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  PenTool, 
  Plus, 
  Bookmark, 
  Sparkles, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import { StudyNote } from "@/hooks/useStudyNotes";
import NoteEditor from "./NoteEditor";

interface FocusSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumber: number;
  notesForCurrentPage: StudyNote[];
  allNotes: StudyNote[];
  onSaveNote: (noteData: Partial<StudyNote> & { pageNumber: number }) => void;
  onDeleteNote: (noteId: string) => void;
  onNavigateToPage: (page: number) => void;
  onAskAI?: (page: number) => void;
}

export default function FocusSheet({
  isOpen,
  onClose,
  pageNumber,
  notesForCurrentPage,
  allNotes,
  onSaveNote,
  onDeleteNote,
  onNavigateToPage,
  onAskAI,
}: FocusSheetProps) {
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [viewScope, setViewScope] = useState<"page" | "all">("page");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // If opening fresh with no notes on this page, open editor directly
  const shouldShowEditor = isCreatingNew || editingNote !== null || (notesForCurrentPage.length === 0 && viewScope === "page");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />

          {/* ── Main Container: Bottom Sheet on Mobile, Side Panel on Desktop ── */}
          <motion.aside
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className={`fixed z-50 bg-white dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col font-sans
              /* Mobile Styles (Bottom Sheet) */
              bottom-0 inset-x-0 rounded-t-[2.5rem] border-t max-h-[90vh] 
              ${isFullScreen ? "h-[94vh]" : "h-[75vh]"}

              /* Desktop Styles (Floating / Docked Side Panel) */
              md:top-20 md:bottom-6 md:left-6 md:right-auto md:w-[460px] md:max-h-none md:h-auto md:rounded-[2.5rem] md:border md:shadow-2xl md:translate-y-0
            `}
            dir="rtl"
          >
            {/* ── Drag Handle (Mobile) & Top Header ── */}
            <div className="relative pt-3 px-5 sm:px-6 pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              {/* Mobile Swipe Handle bar */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 md:hidden" />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      محرر التركيز والملاحظات
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {viewScope === "page" ? `الصفحة الحالية: ص ${pageNumber}` : `جميع ملاحظات الدفتر (${allNotes.length})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Fullscreen Toggle on Mobile */}
                  <button
                    type="button"
                    onClick={() => setIsFullScreen((prev) => !prev)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition md:hidden cursor-pointer"
                    title="تكبير النافذة"
                  >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scope Switcher: (هذه الصفحة / كل الدفتر) */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setViewScope("page");
                      setIsCreatingNew(false);
                      setEditingNote(null);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      viewScope === "page" 
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    صفحة {pageNumber} ({notesForCurrentPage.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewScope("all");
                      setIsCreatingNew(false);
                      setEditingNote(null);
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      viewScope === "all" 
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    جميع الصفحات ({allNotes.length})
                  </button>
                </div>

                {onAskAI && (
                  <button
                    type="button"
                    onClick={() => onAskAI(pageNumber)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold hover:opacity-90 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>اسأل لمّاح</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4">
              
              {/* Mode A: Note Editor */}
              {shouldShowEditor ? (
                <div className="space-y-3">
                  {notesForCurrentPage.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingNote(null);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mb-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>العودة لقائمة ملاحظات الصفحة</span>
                    </button>
                  )}

                  <NoteEditor
                    pageNumber={pageNumber}
                    initialNote={editingNote}
                    onSave={(noteData) => {
                      onSaveNote(noteData);
                      setIsCreatingNew(false);
                      setEditingNote(null);
                    }}
                    onDelete={onDeleteNote}
                    onClose={() => {
                      setIsCreatingNew(false);
                      setEditingNote(null);
                    }}
                  />
                </div>
              ) : (
                /* Mode B: Notes List for this Page or All Pages */
                <div className="space-y-3">
                  
                  {/* Action: Add new note button on current page */}
                  {viewScope === "page" && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(true)}
                      className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center gap-2 transition hover:bg-indigo-50 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة ملاحظة جديدة للصفحة {pageNumber}</span>
                    </button>
                  )}

                  {/* List of Notes */}
                  {(viewScope === "page" ? notesForCurrentPage : allNotes).length === 0 ? (
                    <div className="text-center py-10 space-y-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                      <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        لا توجد ملاحظات مسجلة {viewScope === "page" ? `في الصفحة ${pageNumber}` : "في هذا المستند"}.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNew(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ابدأ تدوين ملاحظة الآن</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(viewScope === "page" ? notesForCurrentPage : allNotes).map((note) => (
                        <div
                          key={note.id}
                          className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition space-y-2 group shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black font-mono">
                                ص {note.pageNumber}
                              </span>
                              {note.title && (
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                  {note.title}
                                </h4>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (viewScope === "all") onNavigateToPage(note.pageNumber);
                                setEditingNote(note);
                              }}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              تعديل ✏️
                            </button>
                          </div>

                          {/* Note Text Content */}
                          {note.content && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                              {note.content}
                            </p>
                          )}

                          {/* Hand Sketch Preview */}
                          {note.sketchDataUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white p-1 max-w-[200px]">
                              <img src={note.sketchDataUrl} alt="مخطط يدوي" className="w-full h-auto rounded-lg" />
                            </div>
                          )}

                          {/* Tags Display */}
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {note.tags.map((t, idx) => (
                                <span key={idx} className="text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

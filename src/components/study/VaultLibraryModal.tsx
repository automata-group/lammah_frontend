"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  FileText,
  Presentation,
  Trash2,
  Clock,
  HardDrive,
  Upload,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Search,
  ExternalLink,
  BookOpen,
  RotateCcw
} from "lucide-react";
import { VaultDocument } from "@/lib/studyVault";

interface VaultLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Omit<VaultDocument, "blob">[];
  currentDocumentId: string;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll?: () => void;
  isConverting?: boolean;
}

export default function VaultLibraryModal({
  isOpen,
  onClose,
  documents,
  currentDocumentId,
  onSelectDocument,
  onDeleteDocument,
  onUploadFile,
  onClearAll,
  isConverting = false,
}: VaultLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("ar-EG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "مؤخراً";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  مكتبة ملفاتي الدراسية
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تصفح دفاترك وكتبك المحفوظة وتابع المذاكرة وتدوين الملاحظات.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Upload Action Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-white dark:bg-slate-900">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في ملفاتي..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-hidden text-slate-900 dark:text-slate-100 transition"
              />
            </div>

            {/* Upload Button */}
            <label className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0">
              <Upload className="w-4 h-4" />
              <span>إضافة ملف أو صور (PDF / بوربوينت / صور)</span>
              <input
                type="file"
                accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                multiple
                onChange={(e) => {
                  onUploadFile(e);
                  onClose();
                }}
                className="hidden"
                disabled={isConverting}
              />
            </label>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredDocs.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  لا توجد ملفات محفوظة حالياً
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  قم برفع أي كتاب أو دفتر أو صور أو عرض تقديمي لتتمكن من تدوين الملاحظات والتخطيط عليها في أي وقت.
                </p>
                <label className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-xs font-black cursor-pointer border border-indigo-200/80 dark:border-indigo-500/20 transition">
                  اختر ملفاً أو صوراً من جهازك
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    multiple
                    onChange={(e) => {
                      onUploadFile(e);
                      onClose();
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = doc.id === currentDocumentId;
                const isPPT = doc.type === "pptx_converted" || doc.name.endsWith(".pptx") || doc.name.endsWith(".ppt");

                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500/50 shadow-sm shadow-indigo-500/10"
                        : "bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border-slate-200/70 dark:border-slate-800"
                    }`}
                  >
                    {/* Info */}
                    <div
                      onClick={() => {
                        onSelectDocument(doc.id);
                        onClose();
                      }}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isPPT
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        }`}
                      >
                        {isPPT ? <Presentation className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                              مفتوح الآن
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-medium">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(doc.lastOpenedAt)}
                          </span>
                          {isPPT && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">
                                بوربوينت مُحوّل
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDocument(doc.id);
                          onClose();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        {isActive ? "مُحدد" : "فتح"}
                      </button>

                      {confirmDeleteId === doc.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-xl border border-rose-300 dark:border-rose-500/40">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteDocument(doc.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black hover:bg-rose-700 transition cursor-pointer"
                          >
                            تأكيد الحذف
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 text-[10px] transition cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(doc.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Note & Reset Button */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>ملفاتك جاهزة للمذاكرة وتدوين الملاحظات.</span>
            </div>

            <div className="flex items-center gap-3">
              {documents.length > 0 && onClearAll && (
                confirmClearAll ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAll();
                        setConfirmClearAll(false);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold"
                    >
                      تأكيد الحذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="text-[10px] text-slate-400"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="text-slate-400 hover:text-rose-500 transition underline text-[10px]"
                  >
                    حذف جميع الملفات
                  </button>
                )
              )}
              <div className="font-bold text-slate-700 dark:text-slate-300">
                {documents.length} ملف محفوظ
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

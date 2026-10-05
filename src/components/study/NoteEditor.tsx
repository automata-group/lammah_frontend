"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, 
  Trash2, 
  Mic, 
  MicOff, 
  PenTool, 
  FileText, 
  CheckSquare, 
  Sparkles, 
  Bookmark, 
  AlertCircle,
  Tag,
  Palette,
  Layers,
  X
} from "lucide-react";
import { StudyNote } from "@/hooks/useStudyNotes";
import SketchCanvas from "./SketchCanvas";

interface NoteEditorProps {
  pageNumber: number;
  initialNote?: StudyNote | null;
  onSave: (noteData: Partial<StudyNote> & { pageNumber: number }) => void;
  onDelete?: (noteId: string) => void;
  onClose: () => void;
}

const TAG_OPTIONS = [
  { id: "exam", label: "سؤال امتحان 🎯", color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" },
  { id: "key_concept", label: "مفهوم رئيسي 💡", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  { id: "summary", label: "تلخيص سريع 📝", color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20" },
  { id: "formula", label: "قانون / معادلة 📐", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
];

export default function NoteEditor({
  pageNumber,
  initialNote,
  onSave,
  onDelete,
  onClose,
}: NoteEditorProps) {
  const [activeTab, setActiveTab] = useState<"text" | "sketch" | "checklist">("text");
  const [title, setTitle] = useState<string>(initialNote?.title || "");
  const [content, setContent] = useState<string>(initialNote?.content || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialNote?.tags || []);
  const [sketchDataUrl, setSketchDataUrl] = useState<string>(initialNote?.sketchDataUrl || "");
  
  // Voice Memo Speech Recognition State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || "");
      setContent(initialNote.content || "");
      setSelectedTags(initialNote.tags || []);
      setSketchDataUrl(initialNote.sketchDataUrl || "");
      if (initialNote.sketchDataUrl && !initialNote.content) {
        setActiveTab("sketch");
      }
    }
  }, [initialNote]);

  // Setup Web Speech API for Arabic voice-to-text
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "ar-SA";

      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setContent((prev) => prev ? `${prev} ${transcript}` : transcript);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert("خاصية التفريغ الصوتي غير مدعومة في هذا المتصفح. يرجى استخدام متصفح Chrome أو Safari.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleTag = (tagLabel: string) => {
    setSelectedTags((prev) => 
      prev.includes(tagLabel) ? prev.filter((t) => t !== tagLabel) : [...prev, tagLabel]
    );
  };

  const handleSave = () => {
    if (!content.trim() && !sketchDataUrl && !title.trim()) {
      onClose();
      return;
    }

    onSave({
      id: initialNote?.id,
      pageNumber,
      title: title.trim(),
      content: content.trim(),
      type: sketchDataUrl ? "sketch" : "text",
      sketchDataUrl: sketchDataUrl || undefined,
      tags: selectedTags,
    });

    onClose();
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100" dir="rtl">
      
      {/* ── Header: Page Indicator & Type Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-black">
            📌 ملاحظة لـ (الصفحة {pageNumber})
          </span>
        </div>

        {/* Tab switcher: Text Note vs Hand Sketch */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition ${
              activeTab === "text" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>كتابة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sketch")}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition ${
              activeTab === "sketch" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs" 
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>رسم وتخطيط</span>
          </button>
        </div>
      </div>

      {/* ── Title Input ── */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الملاحظة (اختياري)..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* ── Tab 1: Clean Text Area with Voice Memo ── */}
      {activeTab === "text" && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب أفكارك وملاحظاتك وتلخيص الصفحة هنا براحة تامة..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none font-medium custom-scrollbar"
            />

            {/* Voice Memo Button inside Textarea Corner */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`absolute bottom-3 left-3 p-2 rounded-xl transition-all shadow-md flex items-center gap-1 text-xs font-bold ${
                isRecording 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100"
              }`}
              title={isRecording ? "إيقاف التسجيل" : "تدوين صوتي سريع"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? "جاري الاستماع..." : "تدوين صوتي"}</span>
            </button>
          </div>

          {/* Quick Tags Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">تصنيف الملاحظة:</label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      isSelected 
                        ? `${tag.color} ring-1 ring-indigo-500 font-black` 
                        : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Canvas Hand Sketching ── */}
      {activeTab === "sketch" && (
        <div>
          <SketchCanvas
            initialDataUrl={sketchDataUrl}
            onSaveSketch={(dataUrl) => {
              setSketchDataUrl(dataUrl);
              setActiveTab("text");
            }}
          />
          {sketchDataUrl && (
            <div className="mt-2 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
              <span>✅ تم حفظ المخطط اليدوي وسيرفق بالملاحظة.</span>
              <button 
                type="button" 
                onClick={() => setSketchDataUrl("")}
                className="text-rose-500 hover:underline font-bold"
              >
                إزالة المخطط 🗑️
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Footer Actions (Delete / Cancel / Save) ── */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div>
          {initialNote?.id && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) {
                  onDelete(initialNote.id);
                  onClose();
                }
              }}
              className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
              title="حذف الملاحظة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>حفظ الملاحظة (ص {pageNumber})</span>
          </button>
        </div>
      </div>

    </div>
  );
}

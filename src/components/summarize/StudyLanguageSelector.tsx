"use client";

import React, { useState } from "react";
import { Languages, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export type StudyLanguage = "ar" | "en" | "bilingual";

interface StudyLanguageSelectorProps {
  value: StudyLanguage;
  onChange: (val: StudyLanguage) => void;
  disabled?: boolean;
}

export default function StudyLanguageSelector({
  value,
  onChange,
  disabled = false,
}: StudyLanguageSelectorProps) {
  const [activePreview, setActivePreview] = useState<StudyLanguage | null>(null);

  const options = [
    {
      id: "ar" as StudyLanguage,
      flag: "🌐",
      title: "عربي جامعي مبسط",
      badge: "الطب والهندسة",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900",
      description: "شرح عربي ذكي وممتع، مع إبقاء مصطلحات السلايد الإنجليزية بمكانها للامتحان.",
      sampleLabel: "عينة من الشرح:",
      sampleText: "في مرحلة الـ Acute Phase، بيكون تركيز الـ Pathogen في ذروته، عشان هيك بنسحب الدم قبل الـ Antibiotics حتى نتجنب الـ False-negative.",
      activeRing: "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40",
    },
    {
      id: "en" as StudyLanguage,
      flag: "🇬🇧",
      title: "English Study Guide",
      badge: "اللغات والترجمة",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900",
      description: "ملف، أسئلة، وشرح أكاديمي باللغة الإنجليزية بالكامل 100% بدون أي كلمة عربية.",
      sampleLabel: "Sample Preview:",
      sampleText: "During the acute phase, pathogen concentration reaches its clinical peak. Blood cultures must precede antimicrobial therapy to prevent false negatives.",
      activeRing: "ring-2 ring-purple-500 border-purple-500 bg-purple-50/60 dark:bg-purple-950/40",
    },
    {
      id: "bilingual" as StudyLanguage,
      flag: "🔤",
      title: "مزدوج (Bilingual)",
      badge: "شرح متوازٍ",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
      description: "كل فقرة بالإنجليزي تليها ترجمتها وتفكيكها بالعربي مباشرة سطراً بسطر.",
      sampleLabel: "عينة متوازية:",
      sampleText: "EN: Specimen collection must precede antibiotics.\nعربي: يجب جمع العينات دائماً قبل بدء المضادات الحيوية.",
      activeRing: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40",
    },
  ];

  const togglePreview = (id: StudyLanguage, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePreview((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-2 mb-6 text-right">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <label className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>لغة المذاكرة والشرح الأكاديمي</span>
        </label>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
          اختر لغة الملف المخطط والأسئلة والشرح
        </span>
      </div>

      {/* 3 Clean Compact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          const isPreviewOpen = activePreview === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`p-3.5 rounded-2xl border text-right transition-all duration-150 cursor-pointer relative overflow-hidden flex flex-col justify-between select-none ${
                isSelected
                  ? opt.activeRing + " shadow-sm shadow-indigo-500/10"
                  : "bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-slate-900"
              }`}
            >
              <div>
                {/* Top Row: Icon + Title + Badge + Check */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none shrink-0">{opt.flag}</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {opt.title}
                      </h4>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md border mt-1 ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* 1 Crisp Sentence (Never truncated with ellipsis!) */}
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                  {opt.description}
                </p>
              </div>

              {/* Minimalist Preview Toggle Button */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => togglePreview(opt.id, e)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-1 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isPreviewOpen ? "إخفاء العيّنة" : "شاهد عيّنة سريعة"}</span>
                  </span>
                  {isPreviewOpen ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>

                {/* Collapsible Clean Sample Box */}
                {isPreviewOpen && (
                  <div className="mt-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-[10.5px] text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                    <div className="text-[9px] font-bold text-slate-400 mb-1">
                      {opt.sampleLabel}
                    </div>
                    <div className="whitespace-pre-line font-medium dir-auto">
                      {opt.sampleText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

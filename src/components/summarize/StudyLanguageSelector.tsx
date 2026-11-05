"use client";

import React from "react";
import { Globe, BookOpen, Languages, Sparkles, Check } from "lucide-react";

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
  const options = [
    {
      id: "ar" as StudyLanguage,
      flag: "🌐",
      title: "عربي جامعي مبسط",
      subtitle: "افتراضي للطب والهندسة والإدارة",
      badge: "الافتراضي",
      description: "شرح مبسط وذكي بالعربية مع تطعيم المصطلحات الأجنبية لضمان الفهم السريع.",
      accent: "from-blue-500/10 to-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300",
      activeRing: "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40",
    },
    {
      id: "en" as StudyLanguage,
      flag: "🇬🇧",
      title: "English Study Guide",
      subtitle: "للغات، الترجمة، والأدب الإنجليزي",
      badge: "أقسام اللغات والترجمة",
      description: "تفكيك أكاديمي وتحليل أدبي وأسئلة بالإنجليزية بالكامل بأسلوب واضح وشامل.",
      accent: "from-purple-500/10 to-pink-500/10 border-purple-500/40 text-purple-700 dark:text-purple-300",
      activeRing: "ring-2 ring-purple-500 border-purple-500 bg-purple-50/70 dark:bg-purple-950/40",
    },
    {
      id: "bilingual" as StudyLanguage,
      flag: "🔤",
      title: "مزدوج (Bilingual)",
      subtitle: "إنجليزي مع ترجمة عربية موازية",
      badge: "شرح متوازي",
      description: "المفاهيم والشرح بالإنجليزية متبوعة فوراً بترجمة وتفكيك مصطلحات بالعربية.",
      accent: "from-emerald-500/10 to-teal-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
      activeRing: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40",
    },
  ];

  return (
    <div className="w-full space-y-2.5 mb-6 text-right">
      <div className="flex items-center justify-between gap-2 px-1">
        <label className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>لغة المذاكرة والشرح الأكاديمي</span>
        </label>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
          اختر لغة الملف المخطط والأسئلة والشرح
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`p-3.5 rounded-2xl border text-right transition-all duration-150 cursor-pointer relative overflow-hidden flex flex-col justify-between select-none active:scale-[0.98] ${
                isSelected
                  ? opt.activeRing + " shadow-sm shadow-indigo-500/10"
                  : "bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/80 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none shrink-0">{opt.flag}</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {opt.title}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

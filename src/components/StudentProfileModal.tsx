"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  X, 
  Check, 
  Loader2, 
  FileText, 
  Headphones, 
  HelpCircle, 
  Brain,
  ChevronLeft,
  ArrowRight,
  ChevronDown,
  Search
} from "lucide-react";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onSuccess?: (profile: any, resData?: any) => void;
  initialData?: any;
}

const UNIVERSITIES = [
  "جامعة بيرزيت",
  "جامعة النجاح الوطنية",
  "جامعة القدس (أبو ديس)",
  "الجامعة العربية الأمريكية (جنين/رام الله)",
  "جامعة بوليتكنك فلسطين",
  "جامعة فلسطين التقنية - خضوري",
  "جامعة الخليل",
  "جامعة بيت لحم",
  "الجامعة الإسلامية - غزة",
  "جامعة الأزهر - غزة",
  "جامعة القدس المفتوحة",
  "جامعة العلوم والتكنولوجيا الأردنية",
  "الجامعة الأردنية",
  "جامعة اليرموك",
  "جامعة أخرى"
];

const MAJORS = [
  "هندسة حاسوب / برمجيات",
  "نظم معلومات حاسوبية (CIS / IT)",
  "ذكاء اصطناعي وعلم بيانات",
  "طب بشري",
  "دكتور صيدلة / صيدلة",
  "طب وجراحة الأسنان",
  "تمريض وعلوم طبية مساندة",
  "إدارة أعمال وتسويق",
  "محاسبة وعلوم مالية ومصرفية",
  "قانون وحقوق",
  "لغات وترجمة / أدب إنجليزي",
  "هندسة مدنية / معمارية",
  "هندسة ميكانيكية / ميكاترونكس",
  "هندسة اتصالات وإلكترونيات",
  "إعلام وصحافة رقمية",
  "تصميم جرافيكي ووسائط متعددة",
  "رياضيات وفيزياء",
  "علوم أحياء وبيئة",
  "تخصص آخر"
];

const ACADEMIC_YEARS = [
  { id: "سنة أولى", label: "سنة 1" },
  { id: "سنة ثانية", label: "سنة 2" },
  { id: "سنة ثالثة", label: "سنة 3" },
  { id: "سنة رابعة", label: "سنة 4" },
  { id: "سنة تخرج", label: "تخرج" },
  { id: "دراسات عليا", label: "عليا" }
];

const INTERESTS_OPTIONS = [
  "الذكاء الاصطناعي والتعلم الآلي",
  "البرمجيات وتطوير الويب",
  "العلوم الطبية والصيدلانية",
  "إدارة الأعمال والمشاريع",
  "المالية والمصرفية والمحاسبة",
  "القانون والتشريعات الحقوقية",
  "التصميم الرقمي وتجربة المستخدم",
  "اللغات والترجمة الأكاديمية",
  "الهندسة والتصميم المعماري",
  "التحضير للامتحانات والـ MCQs"
];

const STUDY_STYLES = [
  { 
    id: "تلاخيص ودفاتر PDF", 
    label: "تلاخيص ودفاتر PDF", 
    desc: "ملفات دراسية جاهزة للقراءة والطباعة",
    icon: FileText 
  },
  { 
    id: "تفريغ صوتي فائق الدقة", 
    label: "تفريغ وشرح صوتي", 
    desc: "تحويل تسجيلات المحاضرات لنصوص وشرح",
    icon: Headphones 
  },
  { 
    id: "أسئلة وامتحانات تجريبية MCQs", 
    label: "بنك أسئلة واختبارات", 
    desc: "تدريب على أسئلة السنوات السابقة",
    icon: HelpCircle 
  },
  { 
    id: "ملخصات ونقاط مراجعة مركزة", 
    label: "ملخصات ونقاط مراجعة", 
    desc: "مراجعة سريعة ومركزة لليلة الامتحان",
    icon: Brain 
  }
];

// Custom Searchable Combobox Component matching Lammah's sleek palette
function SearchableSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  customValue,
  onCustomChange,
  customOptionLabel,
  customPlaceholder
}: {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  customValue: string;
  onCustomChange: (val: string) => void;
  customOptionLabel: string;
  customPlaceholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const isCustomSelected = value === customOptionLabel;
  const displayTitle = value
    ? isCustomSelected && customValue
      ? customValue
      : value
    : placeholder;

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-right ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900"
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        } ${value ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`}
      >
        <span className="truncate">{displayTitle}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 mr-2 ${
            isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 top-full mt-1.5 w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-2"
          >
            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ابحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-7 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-none">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0 mr-2" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  لا توجد نتائج مطابقة
                </div>
              )}

              {/* Instant option to pick custom name if not in list */}
              {searchQuery.trim() && !options.includes(searchQuery.trim()) && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(customOptionLabel);
                    onCustomChange(searchQuery.trim());
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all text-right cursor-pointer border border-dashed border-indigo-300 dark:border-indigo-500/30 mt-1"
                >
                  <span className="truncate">استخدام &quot;{searchQuery.trim()}&quot;</span>
                  <Check className="w-3.5 h-3.5 shrink-0 mr-2" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom input if "جامعة أخرى" or "تخصص آخر" is selected */}
      {isCustomSelected && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-1.5"
        >
          <input
            type="text"
            placeholder={customPlaceholder}
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-indigo-400 focus:border-indigo-600 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white outline-none transition"
            autoFocus
          />
        </motion.div>
      )}
    </div>
  );
}

export default function StudentProfileModal({
  isOpen,
  onClose,
  session,
  onSuccess,
  initialData
}: StudentProfileModalProps) {
  // Stepper state: 1, 2, 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Form Fields State
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [customUniversity, setCustomUniversity] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [customMajor, setCustomMajor] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [studyPreference, setStudyPreference] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingSuccess, setSavingSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [justWonBonus, setJustWonBonus] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Pre-fill existing data if available
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setCurrentStep(1);
    
    if (initialData) {
      populateFields(initialData);
      if (initialData.bonus_awarded) {
        setBonusAwarded(true);
      }
    } else if (session?.access_token) {
      fetch(`${API}/api/v1/subscription/student-profile`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data?.bonus_awarded) {
            setBonusAwarded(true);
          }
          if (data?.academic_profile) {
            populateFields({
              ...data.academic_profile,
              phone: data.phone_number || data.academic_profile?.phone
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen, session, initialData]);

  const populateFields = (data: any) => {
    if (!data) return;
    const uni = data.university || "";
    if (UNIVERSITIES.includes(uni)) {
      setSelectedUniversity(uni);
      setCustomUniversity("");
    } else if (uni) {
      setSelectedUniversity("جامعة أخرى");
      setCustomUniversity(uni);
    }

    const maj = data.major || "";
    if (MAJORS.includes(maj)) {
      setSelectedMajor(maj);
      setCustomMajor("");
    } else if (maj) {
      setSelectedMajor("تخصص آخر");
      setCustomMajor(maj);
    }

    setAcademicYear(data.academic_year || "");
    setSelectedInterests(Array.isArray(data.interests) ? data.interests : []);
    setStudyPreference(data.study_preference || "");
    setPhone(data.phone || "");
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const validateStep1 = () => {
    const finalUniversity = selectedUniversity === "جامعة أخرى" ? customUniversity.trim() : selectedUniversity;
    const finalMajor = selectedMajor === "تخصص آخر" ? customMajor.trim() : selectedMajor;

    if (!finalUniversity) {
      setError("يرجى اختيار اسم جامعتك أو كليتك للمتابعة.");
      return false;
    }
    if (!finalMajor) {
      setError("يرجى اختيار تخصصك الأكاديمي للمتابعة.");
      return false;
    }
    setError("");
    return true;
  };

  const goToStep = (step: 1 | 2 | 3) => {
    if (step > currentStep) {
      if (currentStep === 1 && !validateStep1()) return;
    }
    setError("");
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setDirection(1);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setDirection(1);
      setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setError("");
      setDirection(-1);
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const finalUniversity = selectedUniversity === "جامعة أخرى" 
      ? customUniversity.trim() 
      : selectedUniversity;

    const finalMajor = selectedMajor === "تخصص آخر" 
      ? customMajor.trim() 
      : selectedMajor;

    if (!finalUniversity || !finalMajor) {
      setCurrentStep(1);
      setError("يرجى التأكد من ملء الجامعة والتخصص أولاً.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        university: finalUniversity,
        major: finalMajor,
        academic_year: academicYear,
        interests: selectedInterests,
        study_preference: studyPreference,
        phone: phone.trim()
      };

      const res = await fetch(`${API}/api/v1/subscription/student-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || "فشل حفظ الملف الأكاديمي");
      }

      if (resData?.bonus_awarded) {
        setJustWonBonus(true);
        setBonusAwarded(true);
      }

      try {
        localStorage.setItem("lammah_student_profile_completed", "true");
        localStorage.setItem("lammah_student_profile_data", JSON.stringify({
          ...payload,
          bonus_awarded: true
        }));
      } catch {}

      setSavingSuccess(true);
      if (onSuccess) {
        onSuccess(payload, resData);
      }

      setTimeout(() => {
        setSavingSuccess(false);
        setJustWonBonus(false);
        onClose();
      }, 1600);

    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const finalUniDisplay = selectedUniversity === "جامعة أخرى" ? (customUniversity || "جامعة أخرى") : (selectedUniversity || "لم تُحدد بعد");
  const finalMajorDisplay = selectedMajor === "تخصص آخر" ? (customMajor || "تخصص آخر") : (selectedMajor || "لم يُحدد بعد");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header matching site palette */}
          <div className="p-4 sm:p-5 bg-white dark:bg-[#0b0f19] border-b border-slate-200/90 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    الملف الأكاديمي
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    تخصيص تجربة الذكاء الاصطناعي وفق مساقاتك وجامعتك
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition cursor-pointer shrink-0"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper (3 Clear Steps matching website tabs & pills) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              {[
                { step: 1, title: "الجامعة" },
                { step: 2, title: "الاهتمامات" },
                { step: 3, title: "التأكيد" }
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isDone = currentStep > s.step;

                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => goToStep(s.step as 1 | 2 | 3)}
                    className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold border cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/25"
                        : isDone
                        ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200/80 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20"
                        : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
                        isActive
                          ? "bg-white text-indigo-700"
                          : isDone
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                    </span>
                    <span className="truncate text-xs">
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 min-h-[300px] max-h-[58vh] scrollbar-none">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {savingSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-400 dark:border-indigo-600 rounded-2xl text-center space-y-1.5 my-4"
              >
                <div className="text-indigo-900 dark:text-indigo-200 font-black text-sm">
                  تم حفظ ملفك الأكاديمي بنجاح 🎓
                </div>
              </motion.div>
            )}

              {/* STEP 1: University & Major (Custom Searchable Comboboxes) */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && !savingSuccess && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: direction * -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * 15 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4 pb-12"
                  >
                    {/* University Searchable Select */}
                    <SearchableSelect
                      label="الجامعة أو الكلية *"
                      placeholder="اختر جامعتك أو ابحث عنها..."
                      options={UNIVERSITIES}
                      value={selectedUniversity}
                      onChange={setSelectedUniversity}
                      customValue={customUniversity}
                      onCustomChange={setCustomUniversity}
                      customOptionLabel="جامعة أخرى"
                      customPlaceholder="اكتب اسم جامعتك أو كليتك..."
                    />

                    {/* Major Searchable Select */}
                    <SearchableSelect
                      label="التخصص الجامعي *"
                      placeholder="اختر تخصصك الأكاديمي أو ابحث عنه..."
                      options={MAJORS}
                      value={selectedMajor}
                      onChange={setSelectedMajor}
                      customValue={customMajor}
                      onCustomChange={setCustomMajor}
                      customOptionLabel="تخصص آخر"
                      customPlaceholder="اكتب اسم تخصصك الأكاديمي..."
                    />
                  </motion.div>
                )}

                {/* STEP 2: Academic Year & Interests - Modern, Sleek, Professional */}
                {currentStep === 2 && !savingSuccess && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: direction * -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * 15 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    {/* Academic Year Selection - Single-Row Segmented Bar */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                        السنة الدراسية
                      </label>

                      <div className="grid grid-cols-6 gap-1 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                        {ACADEMIC_YEARS.map((y) => {
                          const isSelected = academicYear === y.id;
                          return (
                            <button
                              key={y.id}
                              type="button"
                              onClick={() => setAcademicYear(isSelected ? "" : y.id)}
                              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                                isSelected
                                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs font-black"
                                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                              }`}
                            >
                              {y.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Academic Interests - Aligned 2-Column Grid */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                          مجالات الاهتمام والتركيز (اختياري)
                        </label>
                        {selectedInterests.length > 0 && (
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            تم اختيار {selectedInterests.length}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-none">
                        {INTERESTS_OPTIONS.map((interest) => {
                          const isSelected = selectedInterests.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className={`flex items-center gap-2 p-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-right ${
                                isSelected
                                  ? "bg-indigo-50/80 dark:bg-indigo-500/15 border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="truncate">{interest}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Study Style & Final Confirmation */}
                {currentStep === 3 && !savingSuccess && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: direction * -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * 15 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    {/* Summary Quick Badge */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {finalUniDisplay} • {finalMajorDisplay}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline shrink-0 text-xs cursor-pointer"
                      >
                        تعديل
                      </button>
                    </div>

                    {/* Preferred Study Style */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                        النمط المفضل للتلخيص والدراسة
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STUDY_STYLES.map((style) => {
                          const Icon = style.icon;
                          const isSelected = studyPreference === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setStudyPreference(isSelected ? "" : style.id)}
                              className={`p-3 rounded-xl border text-right transition cursor-pointer flex items-start gap-3 ${
                                isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 dark:border-indigo-500 text-slate-900 dark:text-white shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                                  isSelected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold leading-snug">{style.label}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                                  {style.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Phone / WhatsApp (Optional) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                        رقم الهاتف / الواتساب (اختياري)
                      </label>

                      <input
                        type="tel"
                        placeholder="0599123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        dir="ltr"
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white text-right outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 transition"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          {/* Fixed Footer (Always visible on all screen sizes) */}
          <div className="p-4 sm:px-6 bg-slate-50/80 dark:bg-[#0b0f19] border-t border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                إلغاء
              </button>
            )}

            <div className="flex items-center gap-2">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || savingSuccess}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>حفظ الملف الأكاديمي</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

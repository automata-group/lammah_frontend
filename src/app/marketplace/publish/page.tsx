"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Store, BookOpen, User, Coins, CreditCard, 
  CheckCircle2, Loader2, GraduationCap, ShieldCheck, 
  FileText, Sparkles, Hash, Phone, ChevronLeft, ChevronRight,
  ChevronDown, Search, X, Check
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

const UNIVERSITIES = [
  "جامعة النجاح الوطنية",
  "جامعة بيرزيت",
  "جامعة القدس (أبو ديس)",
  "الجامعة العربية الأمريكية (جنين/رام الله)",
  "جامعة بوليتكنك فلسطين",
  "جامعة الخليل",
  "جامعة بيت لحم",
  "جامعة فلسطين التقنية - خضوري",
  "جامعة القدس المفتوحة",
  "جامعة غزة",
  "الجامعة الإسلامية بغزة",
  "جامعة الأزهر بغزة",
  "جامعة الاستقلال",
  "الجامعة الأردنية",
  "جامعة العلوم والتكنولوجيا الأردنية",
  "جامعة اليرموك"
];

const PRICE_PRESETS = [3, 5, 8, 10, 15];

// Strict sanitizer for Teacher/Doctor Name: strictly NO numbers allowed (Latin 0-9, Arabic ٠-٩, Persian ۰-۹)
function sanitizeTeacherName(val: string): string {
  return val
    .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, "")
    .replace(/[^\u0621-\u064A\u0671-\u06D3\u06D5a-zA-Z\s.-]/g, "");
}

// Strict sanitizer for Account Holder Name: letters and spaces only, strictly NO numbers
function sanitizeAccountName(val: string): string {
  return val
    .replace(/[0-9\u0660-\u0669\u06F0-\u06F9]/g, "")
    .replace(/[^\u0621-\u064A\u0671-\u06D3\u06D5a-zA-Z\s]/g, "");
}

// Strict sanitizer for Phone: exactly 9 digits, auto-strip leading 0 and country code prefix (+970/+972)
function sanitizePhoneNumber(val: string): string {
  let converted = val
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
  let digits = converted.replace(/\D/g, "");
  // If user pasted full international number with 970 or 972
  if ((digits.startsWith("970") || digits.startsWith("972")) && digits.length > 9) {
    digits = digits.slice(3);
  }
  // Strip leading 0
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 9);
}

const STEPS = [
  { id: 1, title: "بيانات المساق والدفتر", icon: GraduationCap },
  { id: 2, title: "المحتوى والتسعير", icon: Coins },
  { id: 3, title: "استلام الأرباح", icon: CreditCard },
];

/* Custom Searchable University Select Component (Replaces clunky native select) */
function UniversitySelect({
  value,
  onChange,
  onSelectOther
}: {
  value: string;
  onChange: (val: string) => void;
  onSelectOther: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = UNIVERSITIES.filter(u => 
    u.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer text-right ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900"
            : "bg-slate-50/80 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 dark:focus:bg-slate-900 border-slate-200 dark:border-slate-800"
        } ${value ? "text-slate-900 dark:text-white font-bold" : "text-slate-400 dark:text-slate-500"}`}
      >
        <span className="truncate">{value || "اختر جامعتك..."}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 mr-1.5 ${isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""}`} />
      </button>

      {/* Floating Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-2"
          >
            {/* Search Input */}
            <div className="relative mb-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="ابحث عن جامعتك بالاسم..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl pr-8 pl-7 py-1.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-none">
              {filtered.length > 0 ? (
                filtered.map((uni) => {
                  const isSelected = value === uni;
                  return (
                    <button
                      key={uni}
                      type="button"
                      onClick={() => {
                        onChange(uni);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all text-right cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      <span className="truncate">{uni}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-2 px-3 text-center text-xs text-slate-400">
                  لم يتم العثور على جامعة مطابقة
                </div>
              )}

              {/* Other Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectOther();
                  setIsOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-right cursor-pointer border-t border-slate-100 dark:border-slate-800/80 mt-1"
              >
                <span>جامعة أخرى (اسم مخصص)...</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PublishToMarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#030712] animate-pulse" />}>
      <PublishToMarketplaceContent />
    </Suspense>
  );
}

function PublishToMarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, loading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepError, setStepError] = useState<string>("");

  const [quota, setQuota] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("cached_user_quota");
      if (cached !== null && !isNaN(Number(cached))) return Number(cached);
    }
    return null;
  });

  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [courseName, setCourseName] = useState("");
  const [university, setUniversity] = useState("");
  const [showCustomUni, setShowCustomUni] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [pageCount, setPageCount] = useState(10);
  const [price, setPrice] = useState(5);
  const [description, setDescription] = useState("");

  const [reflectPhonePrefix, setReflectPhonePrefix] = useState("+972");
  const [reflectPhoneNumber, setReflectPhoneNumber] = useState("");
  const [reflectAccountName, setReflectAccountName] = useState("");

  const [sellerName, setSellerName] = useState("");
  const [sellerUsername, setSellerUsername] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const pdfUrl = searchParams.get("pdfUrl") || "";
  const previewUrl = searchParams.get("previewUrl") || "";

  useEffect(() => {
    const paramTitle = searchParams.get("title");
    if (paramTitle && !title) {
      setTitle(paramTitle);
    }
  }, [searchParams]);

  // Load seller profile & auto-load user's academic profile (university)
  useEffect(() => {
    if (session) {
      // 1. Quota & seller profile
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.quota_remaining !== undefined) {
          setQuota(data.quota_remaining);
        }
        if (data.full_name) {
          setSellerName(data.full_name);
          setReflectAccountName(prev => prev || data.full_name);
        }
        if (data.username) {
          setSellerUsername(data.username);
        }
      })
      .catch(e => console.error("Failed to load seller profile in publish page:", e));

      // 2. Auto-load student profile university if available
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/student-profile`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      .then((r) => r.json())
      .then((data) => {
        if (data?.academic_profile?.university && !university) {
          setUniversity(data.academic_profile.university);
        }
      })
      .catch(() => {});
    }
  }, [session]);

  const handleNextStep1 = () => {
    setStepError("");
    if (!title.trim() || title.trim().length < 3) {
      setStepError("يرجى إدخال عنوان واضح للدفتر أو المحاضرة (3 أحرف على الأقل)");
      return;
    }
    const uni = showCustomUni ? university.trim() : university;
    if (!uni || uni.trim().length < 3) {
      setStepError("يرجى اختيار أو تحديد اسم الجامعة");
      return;
    }
    const cleanTeacher = teacherName.trim();
    if (!cleanTeacher) {
      setStepError("يرجى إدخال اسم الدكتور أو الأستاذ (أحرف فقط وبدون أرقام)");
      return;
    }
    if (cleanTeacher.length < 3) {
      setStepError("اسم الدكتور يجب أن يتكون من 3 أحرف على الأقل (نص فقط)");
      return;
    }
    if (/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(cleanTeacher)) {
      setStepError("اسم الدكتور يجب أن يحتوي على أحرف فقط، يمنع إدخال أرقام");
      return;
    }
    if (!pageCount || pageCount < 1 || pageCount > 500) {
      setStepError("يرجى إدخال عدد صفحات صالح بين 1 و 500 صفحة");
      return;
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    setStepError("");
    if (price < 1 || price > 200 || isNaN(price)) {
      setStepError("يرجى تحديد سعر بيع صالح بين 1 شيكل و 200 شيكل");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setStepError("يرجى كتابة وصف موجز ومفيد لا يقل عن 10 أحرف للدفتر والمواضيع المغطاة");
      return;
    }
    setCurrentStep(3);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setStepError("");
    setError("");

    const cleanPhone = reflectPhoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 9) {
      setStepError(`رقم الهاتف يجب أن يتكون من 9 أرقام بالضبط بدون الصفر (أنت أدخلت ${cleanPhone.length} من 9). مثال: 598298930`);
      return;
    }

    const cleanAccount = reflectAccountName.trim();
    if (!cleanAccount || cleanAccount.length < 4) {
      setStepError("يرجى إدخال اسم صاحب الحساب الكامل (أحرف فقط وبدون أرقام)");
      return;
    }
    if (/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(cleanAccount)) {
      setStepError("اسم صاحب الحساب يجب أن يحتوي على أحرف فقط، يمنع إدخال أرقام");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanDesc = description.trim();
      const activeUni = showCustomUni ? university.trim() : university.trim();
      const cleanCourse = courseName.trim() || "عام";
      const formattedDescription = `🏫 الجامعة: ${activeUni}\n📚 المساق: ${cleanCourse}\n\n${cleanDesc}`;
      const originalStudentName = searchParams.get("studentName") || user?.email?.split('@')[0] || "طالب متميز";
      const finalAuthorName = sellerName.trim() || originalStudentName;
      const formattedStudentName = sellerUsername
        ? `${finalAuthorName} @${sellerUsername} (${activeUni})`
        : `${finalAuthorName} (${activeUni})`;
      const fullReflectDetails = `Reflect: ${reflectPhonePrefix} ${reflectPhoneNumber.trim()} (الاسم: ${reflectAccountName.trim()})`;

      const cleanTitle = title.trim();
      const finalTitle = courseName.trim() && !cleanTitle.toLowerCase().includes(courseName.trim().toLowerCase())
        ? `${courseName.trim()} - ${cleanTitle}`
        : cleanTitle;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: finalTitle,
          teacher_name: teacherName.trim() || "المحاضر",
          page_count: Number(pageCount),
          price: Number(price),
          reflect_details: fullReflectDetails,
          pdf_url: pdfUrl,
          preview_pdf_url: previewUrl,
          description: formattedDescription,
          student_name: formattedStudentName,
          publisher_username: sellerUsername || undefined,
          covered_topics: cleanDesc
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.detail?.user_message || errJson?.detail || "حدث خطأ أثناء نشر الدفتر.";
        throw new Error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/marketplace");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      const currentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/marketplace/publish";
      router.replace(`/auth?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [loading, user, router]);

  return (
    <main 
      className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100" 
      dir="rtl"
    >
      {/* Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full dark:from-indigo-600/15 dark:via-purple-600/10 pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* Standard App Header with Theme Switcher & Navigation */}
      <AppHeader quota={quota} activePage="marketplace" />

      {/* Main Centered Container - Compact & Roomy */}
      <div className="flex-1 max-w-lg w-full mx-auto px-3.5 sm:px-6 pt-1 sm:pt-3 pb-8 relative z-10 flex flex-col justify-start">

        {/* Form Card */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs dark:shadow-2xl relative transition-all">
          
          {/* Integrated Header (Title + Back Button) */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                  نشر الدفتر في المتجر 🛒
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  شارك دفترك الدراسي واربح من مبيعاته
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => router.back()} 
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors shrink-0 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-750 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 ml-0.5" />
              <span>العودة</span>
            </button>
          </div>

          {success ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                تم نشر الدفتر بنجاح! 🎉
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                أصبح دفترك معروضاً الآن في متجر لمّاح لجميع الطلاب. جاري نقلك إلى المتجر...
              </p>
            </div>
          ) : (
            <div>
              {/* Responsive Progress Stepper Bar */}
              <div className="my-3.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                      {currentStep}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-xs">
                      {STEPS[currentStep - 1].title}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    خطوة {currentStep} من 3
                  </span>
                </div>

                {/* 3 Progress Bars */}
                <div className="grid grid-cols-3 gap-1.5">
                  {STEPS.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          if (isCompleted) {
                            setStepError("");
                            setCurrentStep(step.id);
                          }
                        }}
                        disabled={!isCompleted && !isCurrent}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? "bg-indigo-600"
                            : isCompleted
                              ? "bg-emerald-500 cursor-pointer hover:opacity-80"
                              : "bg-slate-200 dark:bg-slate-800 cursor-not-allowed"
                        }`}
                        title={step.title}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Form Content per Step */}
              <form onSubmit={handlePublish} className="space-y-4">
                
                <AnimatePresence mode="wait">
                  
                  {/* STEP 1: بيانات المساق والدفتر */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3.5"
                    >
                      {/* Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>عنوان الدفتر / الموضوع</span>
                          <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input 
                          required 
                          type="text" 
                          value={title} 
                          onChange={e => setTitle(e.target.value)}
                          placeholder="مثال: ملخص شامل لاختبار الميدتيرم..."
                          className="w-full bg-slate-50/80 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" 
                        />
                      </div>

                      {/* University - Using the Clean Custom Searchable Component */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>الجامعة</span>
                          <span className="text-rose-500 font-bold">*</span>
                        </label>

                        {!showCustomUni ? (
                          <UniversitySelect
                            value={university}
                            onChange={(val) => {
                              setUniversity(val);
                              setShowCustomUni(false);
                            }}
                            onSelectOther={() => {
                              setShowCustomUni(true);
                              setUniversity("");
                            }}
                          />
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input 
                                required 
                                type="text" 
                                autoFocus
                                value={university} 
                                onChange={e => setUniversity(e.target.value)} 
                                placeholder="اكتب اسم جامعتك هنا..."
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none" 
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCustomUni(false);
                                  setUniversity(UNIVERSITIES[0]);
                                }}
                                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60"
                              >
                                القائمة
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Course Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>اسم المساق الدراسي</span>
                          <span className="text-slate-400 text-[10px] font-normal">(اختياري)</span>
                        </label>
                        <input 
                          type="text" 
                          value={courseName} 
                          onChange={e => setCourseName(e.target.value)} 
                          placeholder="مثال: فيزياء 1، برمجة كينونية، تشريح 2..."
                          className="w-full bg-slate-50/80 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" 
                        />
                      </div>

                      {/* Doctor Name (8 cols) & Page Count (4 cols) */}
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-8 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>اسم الدكتور أو الأستاذ</span>
                              <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              نص فقط
                            </span>
                          </div>
                          <input 
                            required
                            type="text" 
                            value={teacherName} 
                            onChange={e => setTeacherName(sanitizeTeacherName(e.target.value))} 
                            onKeyDown={e => {
                              if (/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="مثال: د. أحمد محمود..."
                            className="w-full bg-slate-50/80 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" 
                          />
                        </div>

                        <div className="col-span-4 space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>الصفحات</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input 
                            required 
                            type="number" 
                            min="1" 
                            max="500"
                            value={pageCount} 
                            onChange={e => setPageCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                            className="w-full bg-slate-50/80 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none font-bold text-center" 
                          />
                        </div>
                      </div>

                      {/* Step 1 Action */}
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={handleNextStep1}
                          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs active:scale-[0.99]"
                        >
                          <span>التالي: المحتوى والتسعير</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: المحتوى والتسعير */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3.5"
                    >
                      {/* Price Setting */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>سعر البيع المطلوب (شيكل)</span>
                            <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/20">
                            {price} ₪
                          </span>
                        </div>

                        {/* Input + Presets */}
                        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                          <div className="relative flex-1">
                            <input 
                              required 
                              type="number" 
                              min="0" 
                              step="0.5" 
                              value={price} 
                              onChange={e => setPrice(Number(e.target.value))}
                              className="w-full bg-slate-50/80 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 dark:focus:bg-slate-900 border border-amber-300/80 dark:border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-black focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none pl-9" 
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-amber-600 dark:text-amber-400 pointer-events-none">
                              ₪
                            </span>
                          </div>

                          {/* Quick Preset Buttons */}
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            {PRICE_PRESETS.map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setPrice(p)}
                                className={`flex-1 sm:flex-initial px-3 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                                  price === p
                                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-2xs"
                                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {p} ₪
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Description & Covered Topics */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>وصف محتوى الدفتر والمواضيع المغطاة</span>
                          <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <textarea 
                          required 
                          value={description} 
                          onChange={e => setDescription(e.target.value)} 
                          rows={3}
                          placeholder="مثال: تفريغ شامل للمحاضرات الأولى، شرح القوانين مع أمثلة عملية وملاحظات الدكتور الشفوية..."
                          className="w-full bg-slate-50/80 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none leading-relaxed" 
                        />
                      </div>

                      {/* Step 2 Actions */}
                      <div className="flex items-center justify-between gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setStepError("");
                            setCurrentStep(1);
                          }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>السابق</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextStep2}
                          className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <span>التالي: استلام الأرباح</span>
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: استلام الأرباح وهوية البائع */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3.5"
                    >
                      {/* Compact Review Summary Pill */}
                      <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white text-xs truncate">
                            📚 {courseName ? `${courseName} - ${title}` : title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>🏫 {showCustomUni ? university : university || "الجامعة"}</span>
                            <span>•</span>
                            <span>📄 {pageCount} صفحة</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20 shrink-0">
                          {price} ₪
                        </span>
                      </div>

                      {/* Payout Details */}
                      <div className="bg-slate-50/80 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                          <Phone className="w-3.5 h-3.5" />
                          <span>بيانات التحصيل عبر ريفلكت (Reflect) 💳</span>
                        </div>

                        <div className="space-y-3">
                          {/* Phone / Reflect Account */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <span>رقم هاتف حساب ريفلكت</span>
                                <span className="text-rose-500 font-bold">*</span>
                              </label>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                                reflectPhoneNumber.length === 9
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                              }`}>
                                {reflectPhoneNumber.length}/9 أرقام {reflectPhoneNumber.length === 9 ? "✓" : ""}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <select 
                                value={reflectPhonePrefix} 
                                onChange={e => setReflectPhonePrefix(e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-bold cursor-pointer shrink-0"
                              >
                                <option value="+972">+972</option>
                                <option value="+970">+970</option>
                              </select>
                              
                              <input 
                                required 
                                type="tel" 
                                inputMode="numeric"
                                maxLength={9}
                                placeholder="598298930" 
                                value={reflectPhoneNumber} 
                                onChange={e => setReflectPhoneNumber(sanitizePhoneNumber(e.target.value))}
                                onKeyDown={e => {
                                  if (["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) return;
                                  if (e.ctrlKey || e.metaKey) return;
                                  if (!/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-mono tracking-wider font-bold" 
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                              محدد بـ 9 أرقام بالضبط بدون الصفر الأول (مثال: 598298930)
                            </p>
                          </div>

                          {/* Account Holder Name */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <span>اسم صاحب الحساب الكامل</span>
                                <span className="text-rose-500 font-bold">*</span>
                              </label>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                أحرف فقط
                              </span>
                            </div>
                            <input 
                              required 
                              type="text" 
                              placeholder="مثال: أحمد يوسف علي" 
                              value={reflectAccountName} 
                              onChange={e => setReflectAccountName(sanitizeAccountName(e.target.value))}
                              onKeyDown={e => {
                                if (/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none font-medium" 
                            />
                          </div>
                        </div>

                        {/* Publisher Identity Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-[11px] shrink-0">
                              {(sellerName || user?.email || "ط")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold text-slate-400 block leading-none">
                                الناشر المعتمد:
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                                  {sellerName || user?.email?.split("@")[0] || "طالب متميز"}
                                </span>
                                {sellerUsername && (
                                  <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded" dir="ltr">
                                    @{sellerUsername}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-black flex items-center gap-0.5 shrink-0">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>بائع معتمد</span>
                          </span>
                        </div>
                      </div>

                      {/* Step 3 Actions */}
                      <div className="flex items-center justify-between gap-2.5 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setStepError("");
                            setCurrentStep(2);
                          }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>السابق</span>
                        </button>

                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>تأكيد ونشر الدفتر في المتجر 🚀</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* Validation and Error Alerts */}
                {(stepError || error) && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    {stepError || error}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

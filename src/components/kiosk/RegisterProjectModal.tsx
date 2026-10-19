"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  Store, 
  Phone, 
  MapPin, 
  AlertCircle,
  Loader2,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Layers,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { uploadKioskImage, submitKioskProject } from "@/lib/kioskApi";

interface RegisterProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onSuccess: () => void;
}

const UNIVERSITIES_LIST = [
  "جامعة النجاح الوطنية",
  "جامعة بيرزيت",
  "الجامعة العربية الأمريكية",
  "جامعة القدس (أبو ديس)",
  "جامعة بوليتكنك فلسطين",
  "جامعة الخليل",
  "جامعة فلسطين التقنية (خضوري)",
  "جامعة بيت لحم",
  "الجامعة الإسلامية بغزة",
  "جامعة الأزهر",
  "الجامعة الأردنية",
  "جامعة العلوم والتكنولوجيا الأردنية",
  "جامعة اليرموك",
  "الجامعة الهاشمية",
  "جامعة أخرى (كتابة يدوية)",
];

const CATEGORIES = [
  { id: "food", label: "أطعمة ومأكولات" },
  { id: "sweets", label: "حلويات ومخبوزات" },
  { id: "crafts", label: "أعمال يدوية وهدايا" },
  { id: "services", label: "خدمات طلابية وبحوث" },
  { id: "printing", label: "طباعة وتصوير وتجليد" },
  { id: "fashion", label: "إكسسوارات وملابس" },
  { id: "tech", label: "تقنية وإلكترونيات" },
  { id: "other", label: "أخرى" },
];

const SUGGESTED_LOCATIONS = [
  "كل الحرم الجامعي",
  "الكافتيريا المركزية",
  "المكتبة الجامعية",
  "مجمع الأنشطة الطلابية",
  "كليات الهندسة والعلوم",
  "كليات الآداب والإنسانيات",
  "البوابة الرئيسية للجامعة",
];

export default function RegisterProjectModal({
  isOpen,
  onClose,
  token,
  onSuccess,
}: RegisterProjectModalProps) {
  // Step Wizard State: 1 | 2 | 3 | 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [university, setUniversity] = useState("جامعة النجاح الوطنية");
  const [customUniversity, setCustomUniversity] = useState("");
  const [ownerFaculty, setOwnerFaculty] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "كل الحرم الجامعي",
  ]);
  const [customLocation, setCustomLocation] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Submission & Loading States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Body Scroll Lock to prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Reset form whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTitle("");
      setCategory("food");
      setDescription("");
      setPriceRange("");
      setWhatsappNumber("");
      setUniversity("جامعة النجاح الوطنية");
      setCustomUniversity("");
      setOwnerFaculty("");
      setSelectedLocations(["كل الحرم الجامعي"]);
      setCustomLocation("");
      setUploadedImages([]);
      setErrorMessage("");
      setIsSubmittedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Unauthenticated Guest Screen with redirect back to register form
  if (!token) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overscroll-contain"
        dir="rtl"
      >
        <div className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200/60 dark:border-indigo-500/20">
            <Store className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            تسجيل الدخول مطلوب
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            تصفح الكشك والطلب عبر واتساب متاح مجاناً لجميع الطلاب والزوار. لتسجيل وعرض مشروعك الخاص لزملائك (برسم رمزي 5 شيكل فقط)، يرجى تسجيل الدخول أولاً.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <a
              href="/login?redirect=/kiosk?action=register"
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm text-center shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              تسجيل الدخول والبدء
            </a>
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      if (selectedLocations.length === 1) return; // Keep at least one
      setSelectedLocations(selectedLocations.filter((l) => l !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const addCustomLocation = () => {
    if (customLocation.trim() && !selectedLocations.includes(customLocation.trim())) {
      setSelectedLocations([...selectedLocations, customLocation.trim()]);
      setCustomLocation("");
    }
  };

  // Image Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!token) {
      alert("يرجى تسجيل الدخول أولاً لتتمكن من رفع الصور وتسجيل المشروع");
      return;
    }

    if (uploadedImages.length >= 5) {
      alert("الحد الأقصى هو 5 صور لكل مشروع");
      return;
    }

    const remainingSlots = 5 - uploadedImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploadingImage(true);
    setErrorMessage("");

    try {
      const uploadPromises = filesToUpload.map((file) => uploadKioskImage(file, token));
      const urls = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setErrorMessage(err.message || "فشل رفع بعض الصور، يرجى المحاولة مرة أخرى");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    setErrorMessage("");
    if (currentStep === 1) {
      if (!title.trim() || title.length < 2) {
        setErrorMessage("يرجى كتابة اسم واضح لمشروعك أو متجرك");
        return false;
      }
      if (university === "جامعة أخرى (كتابة يدوية)" && !customUniversity.trim()) {
        setErrorMessage("يرجى كتابة اسم جامعتك");
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!description.trim() || description.length < 10) {
        setErrorMessage("يرجى كتابة وصف مختصر للمنتجات أو الخدمات (10 حروف على الأقل)");
        return false;
      }
      if (selectedLocations.length === 0) {
        setErrorMessage("يرجى تحديد مكان واحد على الأقل لتسليم الطلبات داخل الحرم الجامعي");
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (!whatsappNumber.trim() || whatsappNumber.length < 7) {
        setErrorMessage("يرجى كتابة رقم واتساب صحيح ليتواصل معك الطلاب للطلب");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) setStep((s) => (s + 1) as any);
    }
  };

  const handlePrev = () => {
    setErrorMessage("");
    if (step > 1) setStep((s) => (s - 1) as any);
  };

  // Final Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("يجب تسجيل الدخول لتسجيل مشروعك في الكشك");
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalUniversity = university === "جامعة أخرى (كتابة يدوية)"
        ? (customUniversity.trim() || "جامعة أخرى")
        : university;

      const combinedFaculty = ownerFaculty.trim()
        ? `${finalUniversity} • ${ownerFaculty.trim()}`
        : finalUniversity;

      await submitKioskProject(
        {
          title: title.trim(),
          category,
          description: description.trim(),
          price_range: priceRange.trim(),
          whatsapp_number: whatsappNumber.trim(),
          campus_locations: selectedLocations,
          images: uploadedImages,
          owner_faculty: combinedFaculty,
        },
        token
      );

      setIsSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "فشل تسجيل المشروع، يرجى مراجعة البيانات والاتصال بالإنترنت");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    { num: 1, title: "هوية المشروع", icon: Layers },
    { num: 2, title: "المنتجات والتوصيل", icon: FileText },
    { num: 3, title: "التواصل والصور", icon: ImageIcon },
    { num: 4, title: "المراجعة والرسوم", icon: DollarSign },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn overscroll-contain"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col overscroll-contain">
        
        {/* Pinned Header */}
        <div className="px-6 py-4 border-b border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                تسجيل مشروع في الكشك
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                اعرض مشروعك لآلاف الطلاب في جامعتك (رسم إدراج 5 شيكل)
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          {!isSubmittedSuccess && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              {stepTitles.map((s) => {
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                const StepIcon = s.icon;
                return (
                  <div
                    key={s.num}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                      isCurrent
                        ? "text-indigo-600 dark:text-indigo-400"
                        : isDone
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30"
                          : isDone
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isDone ? "✓" : s.num}
                    </div>
                    <span className="hidden sm:inline text-[11px]">{s.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Step Content with overscroll-contain */}
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-7 flex-1">
          {isSubmittedSuccess ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                تم استلام طلب تسجيل مشروعك بنجاح
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                سيقوم فريق الإشراف بمراجعة بيانات المشروع والتواصل معك لتأكيد رسم الـ 5 شيكل واعتماده مباشرة ليظهر في الكشك أمام زملائك بالجامعة. بالتوفيق!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ── STEP 1: هوية المشروع ── */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300">
                    الخطوة 1 من 4: حدد اسم مشروعك وتصنيفه والجامعة لسهولة وصول زملائك إليه.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        اسم المشروع أو المتجر *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: مخبوزات لينة، طباعة وتجليد سريع..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        تصنيف المشروع *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>اسم جامعتك *</span>
                      </label>
                      <select
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        {UNIVERSITIES_LIST.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>

                      {university === "جامعة أخرى (كتابة يدوية)" && (
                        <input
                          type="text"
                          required
                          value={customUniversity}
                          onChange={(e) => setCustomUniversity(e.target.value)}
                          placeholder="اكتب اسم جامعتك هنا..."
                          className="w-full mt-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-indigo-300 dark:border-indigo-500/40 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        الكلية أو التخصص الجامعي
                      </label>
                      <input
                        type="text"
                        value={ownerFaculty}
                        onChange={(e) => setOwnerFaculty(e.target.value)}
                        placeholder="مثال: كلية تكنولوجيا المعلومات، هندسة، تمريض..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: المنتجات والتوصيل ── */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300">
                    الخطوة 2 من 4: اشرح ما تقدمه للطلاب وحدد نقاط الاستلام داخل الحرم الجامعي.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      وصف المشروع وقائمة المنتجات / الخدمات *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="اشرح ما تقدمه، الأصناف المتوفرة، النكهات أو الخدمات، طريقة التوصيل، وكيف تضمن الجودة..."
                      className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      نطاق الأسعار التقريبي (اختياري)
                    </label>
                    <input
                      type="text"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      placeholder="مثال: 5 - 15 شيكل أو 2 - 5 دنانير"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>

                  {/* Delivery Locations */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>أماكن التوصيل والاستلام داخل الحرم الجامعي *</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_LOCATIONS.map((loc) => {
                        const isSelected = selectedLocations.includes(loc);
                        return (
                          <button
                            type="button"
                            key={loc}
                            onClick={() => toggleLocation(loc)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                            }`}
                          >
                            {loc}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="أضف مبنى، بوابة، أو نقطة تسليم محددة..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                      <button
                        type="button"
                        onClick={addCustomLocation}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: التواصل والصور ── */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300">
                    الخطوة 3 من 4: رقم الواتساب لتلقي طلبات زملائك، وصور المنتجات لزيادة الجاذبية.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      رقم الواتساب للطلبات المباشرة *
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="مثال: 059xxxxxxx أو 056xxxxxxx"
                        className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      سيقوم الطلاب بالضغط على زر «طلب عبر واتساب» ليرسل لهم رسالة جاهزة باسم طلبهم وموقع التسليم.
                    </p>
                  </div>

                  {/* Photos Upload */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        معرض صور المنتجات (حتى 5 صور)
                      </label>
                      <span className="text-[11px] text-slate-500 font-bold">
                        {uploadedImages.length} من 5 صور
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {uploadedImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-xs"
                        >
                          <img
                            src={url}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5 text-rose-400" />
                          </button>
                        </div>
                      ))}

                      {uploadedImages.length < 5 && (
                        <label className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors group bg-slate-50/50 dark:bg-slate-900/50">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            disabled={isUploadingImage}
                            className="sr-only"
                          />
                          {isUploadingImage ? (
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          ) : (
                            <>
                              <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mb-1 transition-colors" />
                              <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">
                                + إضافة صورة
                              </span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4: المراجعة ورسوم العرض (5 شيكل) ── */}
              {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                        رسوم إدراج وعرض المشروع في الكشك
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                        5 شيكل فقط
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      يتم دفع رسم رمزي قدره 5 شيكل لمرة واحدة لإدراج مشروعك وتثبيته في كشك الجامعة. يمكنك التحويل عبر جوال باي (Jawwal Pay) أو ريفلكت (Reflect)، وسيقوم فريق المنصة بمطابقة العملية واعتماد مشروعك ليظهر فوراً لجميع زملائك بالجامعة.
                    </p>
                  </div>

                  {/* Summary of Project Details */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                    <h4 className="font-black text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
                      ملخص بيانات المشروع:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div><strong className="text-slate-900 dark:text-white">الاسم:</strong> {title}</div>
                      <div><strong className="text-slate-900 dark:text-white">الجامعة:</strong> {university === "جامعة أخرى (كتابة يدوية)" ? customUniversity : university}</div>
                      <div><strong className="text-slate-900 dark:text-white">الواتساب:</strong> {whatsappNumber}</div>
                      <div><strong className="text-slate-900 dark:text-white">الصور المرفوعة:</strong> {uploadedImages.length} صور</div>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">أماكن الاستلام:</strong> {selectedLocations.join("، ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Pinned Bottom Actions */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>السابق</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>التالي</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingImage}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري إرسال المشروع...</span>
                      </>
                    ) : (
                      <span>تأكيد وإرسال المشروع للمراجعة</span>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

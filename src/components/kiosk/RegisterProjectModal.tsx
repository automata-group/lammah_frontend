"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  Store, 
  Plus, 
  Phone, 
  MapPin, 
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react";
import { uploadKioskImage, submitKioskProject } from "@/lib/kioskApi";

interface RegisterProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onSuccess: () => void;
}

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
  "مبنى الهندسة والتكنولوجيا",
  "مبنى العلوم الإنسانية",
  "مبنى الطب والعلوم الصحية",
  "الكافتيريا المركزية",
  "مجمع الأنشطة الطلابية",
  "المكتبة المركزية",
];

export default function RegisterProjectModal({
  isOpen,
  onClose,
  token,
  onSuccess,
}: RegisterProjectModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [ownerFaculty, setOwnerFaculty] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "كل الحرم الجامعي",
  ]);
  const [customLocation, setCustomLocation] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Reset form whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setCategory("food");
      setDescription("");
      setPriceRange("");
      setWhatsappNumber("");
      setOwnerFaculty("");
      setSelectedLocations(["كل الحرم الجامعي"]);
      setCustomLocation("");
      setUploadedImages([]);
      setErrorMessage("");
      setIsSubmittedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
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
      // Reset input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("يجب تسجيل الدخول لتسجيل مشروعك في الكشك");
      return;
    }

    if (!title.trim() || title.length < 2) {
      setErrorMessage("يرجى إدخال اسم مشروع واضح وجذاب");
      return;
    }

    if (!description.trim() || description.length < 10) {
      setErrorMessage("يرجى كتابة وصف تفصيلي للمنتجات أو الخدمات (10 حروف على الأقل)");
      return;
    }

    if (!whatsappNumber.trim() || whatsappNumber.length < 7) {
      setErrorMessage("يرجى إدخال رقم واتساب صالح ليتواصل معك الطلاب");
      return;
    }

    if (selectedLocations.length === 0) {
      setErrorMessage("يرجى تحديد مكان واحد على الأقل لتسليم وتوصيل الطلبات بالجامعة");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitKioskProject(
        {
          title: title.trim(),
          category,
          description: description.trim(),
          price_range: priceRange.trim(),
          whatsapp_number: whatsappNumber.trim(),
          campus_locations: selectedLocations,
          images: uploadedImages,
          owner_faculty: ownerFaculty.trim(),
        },
        token
      );

      setIsSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "فشل تسجيل المشروع، يرجى مراجعة البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fadeIn"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                تسجيل مشروع طلابي في الكشك 🚀
              </h2>
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                اعرض منتجاتك لآلاف الطلاب داخل الحرم الجامعي مجاناً
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-7">
          {isSubmittedSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                تم استلام طلب تسجيل مشروعك بنجاح! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                سيقوم فريق الإشراف بمراجعة بيانات المشروع والصور واعتماده خلال ساعات ليظهر مباشرة لجميع طلاب الجامعة في الكشك. بالتوفيق!
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

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    اسم المشروع / المتجر *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: مخبوزات لينة، شاورما الطيب، لمسة حرير..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    تصنيف المشروع *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  وصف المشروع وقائمة المنتجات / الخدمات *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اشرح ما تقدمه، الأصناف المتوفرة، النكهات أو الخدمات، طريقة التوصيل، وكيف تضمن الجودة..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Price Range & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    نطاق الأسعار التقريبي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="مثال: 5 - 15 شيكل أو 2 - 5 دنانير"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
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
                      placeholder="059xxxxxxx أو 079xxxxxxx"
                      className="w-full pr-10 pl-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Faculty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  كليتك أو تخصصك الجامعي
                </label>
                <input
                  type="text"
                  value={ownerFaculty}
                  onChange={(e) => setOwnerFaculty(e.target.value)}
                  placeholder="مثال: كلية تكنولوجيا المعلومات، كلية الهندسة، التمريض..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Delivery Locations */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400"
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Location Add */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="أضف مبنى أو نقطة تسليم أخرى..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomLocation}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold hover:bg-amber-500 hover:text-white transition-colors"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* ── 5 PHOTOS GALLERY UPLOAD (CRITICAL REQUIREMENT) ── */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    معرض صور المنتجات (حتى 5 صور) 📸
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {uploadedImages.length} من 5 صور
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {/* Uploaded Thumbnails */}
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
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-5 h-5 text-rose-400" />
                      </button>
                    </div>
                  ))}

                  {/* Add Photo Button */}
                  {uploadedImages.length < 5 && (
                    <label className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors group bg-slate-50/50 dark:bg-slate-900/50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        disabled={isUploadingImage}
                        className="sr-only"
                      />
                      {isUploadingImage ? (
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-amber-500 mb-1 transition-colors" />
                          <span className="text-[10px] font-bold text-slate-500 group-hover:text-amber-500">
                            + صورة
                          </span>
                        </>
                      )}
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  الصور الواضحة والجذابة تزيد من زيارات المتجر ونسبة الطلب أضعافاً مضاعفة!
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التسجيل...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>إرسال المشروع للمراجعة 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

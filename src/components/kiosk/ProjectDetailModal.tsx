"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Heart, 
  Star, 
  MessageCircle, 
  Eye, 
  Phone, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Send,
  GraduationCap,
  Store,
  Calendar,
  CheckCircle2,
  Clock,
  Maximize2
} from "lucide-react";
import { KioskProject, KioskReview } from "@/types/kiosk";
import { 
  recordProjectClick, 
  toggleProjectLike, 
  submitProjectReview, 
  fetchProjectDetails,
  formatWhatsAppUrl
} from "@/lib/kioskApi";
import { formatImageUrl } from "./ProjectCard";

interface ProjectDetailModalProps {
  project: KioskProject | null;
  isOpen: boolean;
  onClose: () => void;
  token?: string;
  onProjectUpdated?: (updated: KioskProject) => void;
}

const CATEGORY_NAMES_AR: Record<string, string> = {
  all: "عام",
  food: "أطعمة ومأكولات",
  sweets: "حلويات ومخبوزات",
  crafts: "أعمال يدوية وهدايا",
  services: "خدمات طلابية",
  printing: "طباعة وتجليد",
  fashion: "أزياء وإكسسوارات",
  tech: "تقنية وبرمجة",
  other: "أخرى",
};

export default function ProjectDetailModal({
  project: initialProject,
  isOpen,
  onClose,
  token,
  onProjectUpdated,
}: ProjectDetailModalProps) {
  const [project, setProject] = useState<KioskProject | null>(initialProject);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Review Form States
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  // Likes & Clicks States
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);

  // Sync state when initialProject changes
  useEffect(() => {
    if (initialProject && isOpen) {
      setProject(initialProject);
      setActiveImageIndex(0);
      setIsLiked(initialProject.is_liked || false);
      setLikesCount(initialProject.likes_count || 0);
      setClicksCount(initialProject.clicks_count || 0);
      setReviewSuccessMsg("");
      setUserComment("");

      // If user has previous review
      if (initialProject.user_review) {
        setUserRating(initialProject.user_review.rating);
        setUserComment(initialProject.user_review.comment);
      } else {
        setUserRating(5);
        setUserComment("");
      }

      // Fetch fresh project details including full reviews list
      fetchProjectDetails(initialProject.id, token).then((fresh) => {
        if (fresh) {
          setProject(fresh);
          setIsLiked(fresh.is_liked || false);
          setLikesCount(fresh.likes_count || 0);
          setClicksCount(fresh.clicks_count || 0);
          if (fresh.user_review) {
            setUserRating(fresh.user_review.rating);
            setUserComment(fresh.user_review.comment);
          }
        }
      });
    }
  }, [initialProject, isOpen, token]);

  if (!isOpen || !project) return null;

  const images = (project.images && project.images.length > 0) ? project.images : [];
  const hasImages = images.length > 0;

  const handlePrevImage = () => {
    if (!hasImages) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!hasImages) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Like Toggle
  const handleLike = async () => {
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً للإعجاب بالمشروع");
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await toggleProjectLike(project.id, token);
      setIsLiked(res.is_liked);
      setLikesCount(res.likes_count);
      const updated = { ...project, is_liked: res.is_liked, likes_count: res.likes_count };
      setProject(updated);
      if (onProjectUpdated) onProjectUpdated(updated);
    } catch (e) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  // WhatsApp Order Trigger
  const handleWhatsAppOrder = () => {
    recordProjectClick(project.id).then((newClicks) => {
      if (newClicks > 0) setClicksCount(newClicks);
      else setClicksCount((c) => c + 1);
    });

    const prefilledMessage = 
      `مرحباً ${project.owner_name}، شفت مشروعك "${project.title}" في كشك المشاريع بلمّاح\n` +
      `وحابب أطلب منك للتوصيل داخل الجامعة:\n\n` +
      `• اسم المنتج / الخدمة: \n` +
      `• الكمية: \n` +
      `• موقع التسليم داخل الجامعة (المبنى / القاعة): \n` +
      `• الوقت المفضل للاستلام: \n` +
      `• ملاحظات إضافية: `;

    const waUrl = formatWhatsAppUrl(project.whatsapp_number, prefilledMessage);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً لتتمكن من كتابة رأيك وتقييمك 🎓");
      return;
    }
    if (!userComment.trim()) {
      alert("يرجى كتابة تعليق عن تجربتك مع المشروع");
      return;
    }

    setIsSubmittingReview(true);
    setReviewSuccessMsg("");

    try {
      const res = await submitProjectReview(
        project.id,
        { rating: userRating, comment: userComment.trim() },
        token
      );
      setReviewSuccessMsg(res.message || "تم تسجيل تقييمك بنجاح! ⭐");

      // Refetch fresh project
      const fresh = await fetchProjectDetails(project.id, token);
      if (fresh) {
        setProject(fresh);
        if (onProjectUpdated) onProjectUpdated(fresh);
      }
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء إرسال التقييم");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const categoryLabel = CATEGORY_NAMES_AR[project.category] || project.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-fadeIn" dir="rtl">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/90 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-bold">
              {categoryLabel}
            </span>
            <div 
              title="عدد زيارات وافتتاح متجر هذا المشروع"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{clicksCount} زيارة للمتجر</span>
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

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ── 1. GALLERY (UP TO 5 PHOTOS) ── */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-slate-950 rounded-2xl overflow-hidden group select-none shadow-md">
              {hasImages ? (
                <img
                  src={formatImageUrl(images[activeImageIndex])}
                  alt={`${project.title} - صورة ${activeImageIndex + 1}`}
                  className="w-full h-full object-contain sm:object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-indigo-500 p-6 text-center">
                  <Sparkles className="w-12 h-12 mb-2 opacity-80" />
                  <span className="text-sm font-bold">مشروع طلابي</span>
                </div>
              )}

              {/* Prev / Next Buttons */}
              {hasImages && images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Photo Index Badge */}
              {hasImages && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-semibold">
                  الصورة {activeImageIndex + 1} من {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasImages && images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === activeImageIndex
                        ? "border-indigo-600 scale-105 shadow-md shadow-indigo-600/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={formatImageUrl(img)}
                      alt={`مصغرة ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. PROJECT OVERVIEW & OWNER CARD ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Info (2 Cols) */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {project.title}
                  </h1>
                  {project.price_range && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                      {project.price_range}
                    </span>
                  )}
                </div>

                {/* Rating & Likes Summary */}
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{project.rating_avg > 0 ? project.rating_avg.toFixed(1) : "بدون تقييم بعد"}</span>
                    <span className="text-slate-400">({project.rating_count} تقييم)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{project.comments_count || 0} تعليق</span>
                  </div>

                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                      isLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{likesCount} إعجاب</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  تفاصيل ووصف المشروع:
                </h3>
                <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line font-medium">
                  {project.description}
                </p>
              </div>

              {/* Campus Delivery Spots */}
              {project.campus_locations && project.campus_locations.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-2.5">
                    <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>أماكن التوصيل والاستلام داخل الحرم الجامعي:</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.campus_locations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (Owner Card & CTA) */}
            <div className="space-y-4">
              {/* Owner Info Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/20">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-bold block">
                      صاحب المشروع
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {project.owner_name}
                    </h4>
                    {project.owner_faculty && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                        {project.owner_faculty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>طالب جامعي</span>
                </div>
              </div>

              {/* Direct WhatsApp Ordering Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
                  <Phone className="w-4 h-4" />
                  <span>الطلب والتوصيل المباشر</span>
                </div>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                  تواصل مباشرة مع صاحب المشروع عبر واتساب برسالة مسبقة التجهيز لتحديد طلبك ومكان تسليمه في كليتك.
                </p>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-white/20" />
                  <span>طلب عبر واتساب</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── 3. COMMUNITY REVIEWS & FEEDBACK SECTION ── */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>تجارب وآراء الزملاء والطلبة ({project.comments_count || 0})</span>
              </h3>
            </div>

            {/* Add Review Box */}
            <form
              onSubmit={handleSubmitReview}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                جرّبت منتجات أو خدمات هذا المشروع؟ شارك زملاءك تقييمك ورأيك:
              </h4>

              {/* 5 Stars Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">تقييمك:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (hoverRating || userRating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-500">
                  {userRating} من 5 نجوم
                </span>
              </div>

              {/* Comment Input */}
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="اكتب تجربتك، جودة المنتج، سرعة التوصيل بالجامعة، أو أي نصيحة للطلاب..."
                rows={3}
                className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />

              {reviewSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? "جاري الإرسال..." : "إرسال التقييم"}</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            {project.reviews && project.reviews.length > 0 ? (
              <div className="space-y-3">
                {project.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                          {rev.user_name ? rev.user_name[0] : "ط"}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {rev.user_name}
                          </h5>
                          {rev.user_faculty && (
                            <span className="text-[11px] text-slate-400">
                              {rev.user_faculty}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {rev.comment}
                    </p>

                    <div className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                كن أول من يقيّم هذا المشروع ويكتب تجربته لزملائه
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

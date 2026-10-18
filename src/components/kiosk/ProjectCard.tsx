"use client";

import React, { useState } from "react";
import { 
  Heart, 
  Star, 
  MessageCircle, 
  Eye, 
  Phone, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { KioskProject } from "@/types/kiosk";
import { recordProjectClick, toggleProjectLike, formatWhatsAppUrl } from "@/lib/kioskApi";

interface ProjectCardProps {
  project: KioskProject;
  token?: string;
  onOpenDetails: (project: KioskProject) => void;
  onLikeChanged?: (projectId: string, isLiked: boolean, newCount: number) => void;
  isTrending?: boolean;
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

export function formatImageUrl(url: string): string {
  if (!url) return "";
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  // If it was saved with a localhost URL but now viewed from a remote/mobile host
  if (url.includes("localhost:8000") && typeof window !== "undefined" && window.location.hostname !== "localhost") {
    const idx = url.indexOf("/api/v1/kiosk/images/");
    if (idx !== -1) {
      return `${base}${url.substring(idx)}`;
    }
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ProjectCard({
  project,
  token,
  onOpenDetails,
  onLikeChanged,
  isTrending = false,
}: ProjectCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(project.is_liked || false);
  const [likesCount, setLikesCount] = useState(project.likes_count || 0);
  const [clicksCount, setClicksCount] = useState(project.clicks_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const images = (project.images && project.images.length > 0) ? project.images : [];
  const hasImages = images.length > 0;

  // Handle image slider arrows
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle Like toggle with optimistic UI
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      alert("يرجى تسجيل الدخول أولاً للإعجاب بالمشاريع الطلابية 💛");
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await toggleProjectLike(project.id, token);
      setIsLiked(res.is_liked);
      setLikesCount(res.likes_count);
      if (onLikeChanged) {
        onLikeChanged(project.id, res.is_liked, res.likes_count);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle Direct WhatsApp Order
  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Increment click count asynchronously
    recordProjectClick(project.id).then((newClicks) => {
      if (newClicks > 0) setClicksCount(newClicks);
      else setClicksCount((c) => c + 1);
    });

    const prefilledMessage = 
      `مرحباً ${project.owner_name}، شفت مشروعك "${project.title}" في كشك المشاريع بلمّاح 🎓\n` +
      `وحابب أستفسر / أطلب منك:\n\n` +
      `• المنتج / الطلب: \n` +
      `• الكمية: \n` +
      `• مكان التسليم داخل الجامعة (المبنى/الكلية): \n` +
      `• الوقت المفضل للاستلام: `;

    const waUrl = formatWhatsAppUrl(project.whatsapp_number, prefilledMessage);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const categoryLabel = CATEGORY_NAMES_AR[project.category] || project.category;

  return (
    <div
      onClick={() => onOpenDetails(project)}
      className="group relative flex flex-col bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/40 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]"
    >
      {/* ── CARD TOP BADGES & GALLERY ── */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden select-none">
        {hasImages ? (
          <img
            src={formatImageUrl(images[activeImageIndex])}
            alt={`${project.title} - صورة ${activeImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 p-6 text-center">
            <Sparkles className="w-10 h-10 mb-2 opacity-80" />
            <span className="text-xs font-bold">مشروع طلابي معتمد</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              جاهز للتوصيل بالجامعة
            </span>
          </div>
        )}

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10 pointer-events-auto">
          {/* Category Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-xs">
            {categoryLabel}
          </span>

          {/* STORE CLICKS COUNTER - Prominent Requirement */}
          <div 
            title="عدد مرات زيارة وافتتاح متجر هذا المشروع"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-extrabold shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{clicksCount} زيارة للمتجر</span>
          </div>
        </div>

        {/* Trending Ribbon if Applicable */}
        {isTrending && (
          <div className="absolute top-11 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-black shadow-md shadow-rose-500/30 animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>الأكثر رواجاً 🔥</span>
            </span>
          </div>
        )}

        {/* Image Slider Controls (if multiple images) */}
        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="الصورة السابقة"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm transition-opacity opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="الصورة التالية"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm transition-opacity opacity-80 sm:opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slider Dots Indicator */}
            <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeImageIndex
                      ? "w-4 bg-amber-400"
                      : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        {/* Title & Price */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {project.title}
            </h3>
            {project.price_range && (
              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                {project.price_range}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Student Owner & Delivery Spots */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{project.owner_name}</span>
            {project.owner_faculty && (
              <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                • {project.owner_faculty}
              </span>
            )}
          </div>

          {project.campus_locations && project.campus_locations.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
              <span className="truncate">
                {project.campus_locations.slice(0, 3).join("، ")}
                {project.campus_locations.length > 3 ? " والمزيد..." : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── CARD FOOTER: ENGAGEMENT & WHATSAPP ACTION ── */}
        <div className="pt-2 flex items-center justify-between gap-2">
          {/* Ratings & Likes & Comments */}
          <div className="flex items-center gap-3">
            {/* Rating Stars */}
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{project.rating_avg > 0 ? project.rating_avg.toFixed(1) : "جديد"}</span>
              {project.rating_count > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">
                  ({project.rating_count})
                </span>
              )}
            </div>

            {/* Comments Counter */}
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{project.comments_count || 0}</span>
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              aria-label="إعجاب بالمشروع"
              className={`flex items-center gap-1 text-xs font-bold transition-all p-1 rounded-lg ${
                isLiked
                  ? "text-rose-500 scale-105"
                  : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isLiked ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span>{likesCount}</span>
            </button>
          </div>

          {/* WhatsApp Direct Order CTA Button */}
          <button
            onClick={handleWhatsAppOrder}
            title="اطلب مباشرة من صاحب المشروع عبر واتساب"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:shadow-emerald-700/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 fill-white/20" />
            <span>طلب واتساب 💬</span>
          </button>
        </div>
      </div>
    </div>
  );
}

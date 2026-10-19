"use client";

import React, { useRef } from "react";
import { Sparkles, Flame, ChevronRight, ChevronLeft } from "lucide-react";
import { KioskProject } from "@/types/kiosk";
import ProjectCard from "./ProjectCard";

interface TrendingSectionProps {
  projects: KioskProject[];
  token?: string;
  onOpenDetails: (project: KioskProject) => void;
  onLikeChanged?: (projectId: string, isLiked: boolean, newCount: number) => void;
}

export default function TrendingSection({
  projects,
  token,
  onOpenDetails,
  onLikeChanged,
}: TrendingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // CRITICAL CONSTRAINT: DO NOT SHOW THIS SECTION IF EMPTY!
  if (!projects || projects.length === 0) {
    return null;
  }

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "right" ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="mb-10 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Flame className="w-5 h-5 fill-rose-500 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              الأكثر رواجاً في الجامعة
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-extrabold shadow-sm">
              الأكثر تفاعلاً
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 font-medium">
            المشاريع الأكثر تفاعلاً وإعجاباً وتقييماً من طلبة الجامعة هذا الأسبوع
          </p>
        </div>

        {/* Carousel Arrows on Desktop */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll("right")}
            aria-label="تمرير لليمين"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-colors shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("left")}
            aria-label="تمرير لليسار"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-colors shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel (Mobile snap, Desktop smooth) */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar"
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="shrink-0 w-[280px] sm:w-[320px] md:w-[340px] snap-start"
          >
            <ProjectCard
              project={project}
              token={token}
              onOpenDetails={onOpenDetails}
              onLikeChanged={onLikeChanged}
              isTrending={true}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

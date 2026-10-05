"use client";

import React from "react";
import { Sparkles, Loader2, Crown, AlertTriangle } from "lucide-react";

export interface SmartGenerateButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  progressStep?: string;
  progressMessage?: string;
  text?: string;
  loadingText?: string;
  quota?: number | null;
  deviceAbuse?: boolean;
  className?: string;
  variant?: "primary" | "pill" | "compact";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function SmartGenerateButton({
  onClick,
  disabled = false,
  isProcessing = false,
  progressStep,
  progressMessage,
  text = "توليد ملخص المحاضرة ودفتر التلخيص للامتحان ✨",
  loadingText = "جاري تجهيز دفترك الملخص للامتحان...",
  quota = null,
  deviceAbuse = false,
  className = "",
  variant = "pill",
  size = "md",
  fullWidth = true,
}: SmartGenerateButtonProps) {
  const hasNoQuota = quota !== null && quota <= 0;

  // Determine active display text
  const displayText = deviceAbuse
    ? "🚫 التجربة مستخدمة على هذا الجهاز"
    : hasNoQuota
    ? "🚫 رصيدك 0 دقيقة — اشحن للمتابعة"
    : isProcessing
    ? progressMessage || loadingText
    : text.replace(/✨/g, "").trim();

  // Size configurations
  const sizeClasses = {
    sm: "h-10 px-4 text-xs",
    md: "h-12 sm:h-13 px-6 text-xs sm:text-sm md:text-base",
    lg: "h-14 sm:h-15 px-8 text-sm sm:text-base md:text-lg",
  }[size];

  const radiusClass = variant === "pill" ? "rounded-full" : "rounded-2xl";

  // Luxury Royal Indigo & Electric Violet gradient matching Lammah's brand palette
  let bgClasses = "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:via-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/45 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] cursor-pointer";

  if (deviceAbuse) {
    bgClasses = "bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-rose-600/20 cursor-not-allowed";
  } else if (hasNoQuota) {
    bgClasses = "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/20 cursor-pointer";
  } else if (isProcessing) {
    bgClasses = "bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-600/40 cursor-wait scale-[0.995]";
  } else if (disabled) {
    // When disabled (e.g. before file upload), maintain the rich brand color with high contrast
    bgClasses = "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 cursor-pointer active:scale-[0.99]";
  }

  return (
    <div className={`relative ${fullWidth ? "w-full" : "w-auto inline-block"} ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={isProcessing || deviceAbuse}
        aria-label={displayText}
        className={`relative ${fullWidth ? "w-full" : "w-auto min-w-[260px]"} ${sizeClasses} ${radiusClass} ${bgClasses} border border-indigo-400/40 dark:border-white/20 ring-1 ring-white/15 flex items-center justify-center font-black transition-all duration-200 select-none overflow-hidden group`}
      >
        {/* Subtle Ambient Light Shimmer Overlay */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Content container */}
        <div className="relative z-10 flex items-center justify-center gap-2 px-2 w-full truncate">
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 text-white shrink-0 animate-spin" />
              <span className="truncate drop-shadow-xs font-bold text-xs sm:text-sm">
                {displayText}
              </span>
            </>
          ) : hasNoQuota ? (
            <>
              <Crown className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate drop-shadow-xs font-bold">{displayText}</span>
            </>
          ) : deviceAbuse ? (
            <>
              <AlertTriangle className="w-4 h-4 text-white shrink-0" />
              <span className="truncate drop-shadow-xs font-bold">{displayText}</span>
            </>
          ) : (
            <>
              <span className="truncate drop-shadow-xs font-black">
                {displayText}
              </span>
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
            </>
          )}
        </div>
      </button>
    </div>
  );
}

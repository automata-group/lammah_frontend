"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Wrench, 
  Tag, 
  GraduationCap, 
  Megaphone, 
  Rocket, 
  Gift, 
  Zap, 
  Flame, 
  Award, 
  Heart, 
  X, 
  ArrowLeft 
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Rocket,
  Gift,
  Zap,
  GraduationCap,
  Flame,
  Tag,
  Megaphone,
  Award,
  Heart,
  Wrench
};

interface AnnouncementData {
  message: string;
  active: boolean;
  banner_type?: string;
  bg_color?: string;
  text_color?: string;
  btn_bg?: string;
  btn_text?: string;
  icon_name?: string;
  cta_text?: string | null;
  cta_link?: string | null;
  is_dismissible?: boolean;
}

export default function GlobalAnnouncementBanner() {
  const pathname = usePathname();
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, [pathname]);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/admin/announcements`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" }
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.active && resData.message?.trim()) {
          setData(resData);
        } else {
          setData(null);
        }
      }
    } catch {
      // Ignore network errors on banner
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Do NOT show banner on any admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (!data || !data.active || !data.message?.trim() || dismissed) {
    return null;
  }

  const bgStyle = data.bg_color || "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)";
  const textColor = data.text_color || "#ffffff";
  const btnBg = data.btn_bg || "#ffffff";
  const btnText = data.btn_text || "#000000";
  const IconComponent = (data.icon_name && ICON_MAP[data.icon_name]) ? ICON_MAP[data.icon_name] : Sparkles;

  return (
    <div 
      style={{ background: bgStyle }}
      className="relative z-40 py-2.5 px-4 sm:px-8 w-full transition-all duration-300 shadow-xs" 
      dir="rtl"
    >
      <div className="w-full flex items-center justify-between gap-4 text-xs sm:text-sm">
        
        {/* Right Edge: Message & Icon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-black/15 flex items-center justify-center shrink-0">
            <IconComponent className="w-4 h-4" style={{ color: textColor }} />
          </div>
          <p 
            style={{ color: textColor }}
            className="font-bold text-xs sm:text-sm leading-relaxed truncate"
          >
            {data.message}
          </p>
        </div>

        {/* Left Edge: CTA & Dismiss Button */}
        <div className="flex items-center gap-3 shrink-0">
          {data.cta_text && (
            <Link
              href={data.cta_link || "/plans"}
              style={{
                backgroundColor: btnBg,
                color: btnText
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-90 active:scale-95"
            >
              <span 
                style={{ 
                  color: btnText,
                  fontWeight: 900,
                  fontSize: "12px"
                }}
              >
                {data.cta_text}
              </span>
              <ArrowLeft 
                className="w-3.5 h-3.5 shrink-0" 
                style={{ 
                  color: btnText,
                  stroke: btnText
                }} 
              />
            </Link>
          )}

          {data.is_dismissible !== false && (
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-black/15 transition cursor-pointer opacity-80 hover:opacity-100"
              style={{ color: textColor }}
              title="إغلاق الإعلان"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

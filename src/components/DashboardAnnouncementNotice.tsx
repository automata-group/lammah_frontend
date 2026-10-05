"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ArrowLeft, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function DashboardAnnouncementNotice() {
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

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
      // Ignore
    }
  };

  if (!data || !data.active || !data.message?.trim() || dismissed) {
    return null;
  }

  const bgStyle = data.bg_color || "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)";
  const textColor = data.text_color || "#ffffff";
  const btnBg = data.btn_bg || "#ffffff";
  const btnText = data.btn_text || "#000000";
  const IconComponent = (data.icon_name && ICON_MAP[data.icon_name]) ? ICON_MAP[data.icon_name] : Sparkles;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full max-w-3xl mb-5"
        dir="rtl"
      >
        <div 
          style={{ background: bgStyle }}
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all"
        >
          {/* Message Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5" style={{ color: textColor }} />
            </div>
            <div className="min-w-0">
              <span 
                style={{ color: textColor, opacity: 0.85 }}
                className="text-[10px] font-black uppercase tracking-wider block mb-0.5"
              >
                إعلان هام من المنصة 📢
              </span>
              <p 
                style={{ color: textColor }}
                className="font-bold text-xs sm:text-sm leading-relaxed"
              >
                {data.message}
              </p>
            </div>
          </div>

          {/* Action Button & Dismiss */}
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {data.cta_text && (
              <Link
                href={data.cta_link || "/plans"}
                style={{
                  backgroundColor: btnBg,
                  color: btnText
                }}
                className="px-4 py-2 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95"
              >
                <span style={{ color: btnText, fontWeight: 900 }}>
                  {data.cta_text}
                </span>
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" style={{ color: btnText, stroke: btnText }} />
              </Link>
            )}

            {data.is_dismissible !== false && (
              <button
                onClick={() => setDismissed(true)}
                className="p-2 rounded-xl hover:bg-black/15 transition cursor-pointer opacity-80 hover:opacity-100"
                style={{ color: textColor }}
                title="إخفاء الإعلان"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

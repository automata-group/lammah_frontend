"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Sparkles, 
  Megaphone, 
  Eye, 
  CheckCircle, 
  Flame, 
  Wrench, 
  GraduationCap, 
  Tag, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  X, 
  Send,
  ArrowLeft,
  Palette,
  Rocket,
  Gift,
  Zap,
  Award,
  Heart,
  Sliders,
  Check,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  session: any;
}

const ICON_MAP: Record<string, any> = {
  Sparkles: Sparkles,
  Rocket: Rocket,
  Gift: Gift,
  Zap: Zap,
  GraduationCap: GraduationCap,
  Flame: Flame,
  Tag: Tag,
  Megaphone: Megaphone,
  Award: Award,
  Heart: Heart,
  Wrench: Wrench
};

const GRADIENT_PALETTES = [
  {
    name: "بنفسجي وفوشي ملكي 🔮",
    bg: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
    text: "#ffffff",
    btnBg: "#ffffff",
    btnText: "#000000"
  },
  {
    name: "عنبري وبرتقالي ناري 🔥",
    bg: "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)",
    text: "#ffffff",
    btnBg: "#0f172a",
    btnText: "#fef08a"
  },
  {
    name: "زمردي وتيل عروض 🌿",
    bg: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #10b981 100%)",
    text: "#ffffff",
    btnBg: "#ffffff",
    btnText: "#000000"
  },
  {
    name: "سيان وأزرق تكنولوجي ⚡",
    bg: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)",
    text: "#ffffff",
    btnBg: "#ffffff",
    btnText: "#000000"
  },
  {
    name: "ياقوتي وأحمر احتفالي 💎",
    bg: "linear-gradient(135deg, #e11d48 0%, #be123c 50%, #881337 100%)",
    text: "#ffffff",
    btnBg: "#ffffff",
    btnText: "#000000"
  },
  {
    name: "فحمي وأسود مودرن 🖤",
    bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    text: "#ffffff",
    btnBg: "#6366f1",
    btnText: "#ffffff"
  },
  {
    name: "ذهبي وبرونزي VIP 👑",
    bg: "linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)",
    text: "#ffffff",
    btnBg: "#ffffff",
    btnText: "#000000"
  },
  {
    name: "زهري وباستيل لطيف 🌸",
    bg: "linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #fb7185 100%)",
    text: "#ffffff",
    btnBg: "#ffffff",
    btnText: "#000000"
  }
];

export default function AnnouncementsManager({ session }: Props) {
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(false);
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [isDismissible, setIsDismissible] = useState(true);

  // Custom visual styles
  const [bgColor, setBgColor] = useState("linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)");
  const [textColor, setTextColor] = useState("#ffffff");
  const [btnBg, setBtnBg] = useState("#ffffff");
  const [btnText, setBtnText] = useState("#000000");
  const [iconName, setIconName] = useState("Sparkles");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewDismissed, setPreviewDismissed] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`${API}/api/v1/admin/announcements`, {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "");
        setActive(data.active || false);
        setCtaText(data.cta_text || "");
        setCtaLink(data.cta_link || "");
        setIsDismissible(data.is_dismissible !== false);

        if (data.bg_color) setBgColor(data.bg_color);
        if (data.text_color) setTextColor(data.text_color);
        if (data.btn_bg) setBtnBg(data.btn_bg);
        if (data.btn_text) setBtnText(data.btn_text);
        if (data.icon_name) setIconName(data.icon_name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    const nextActive = !active;
    setActive(nextActive);
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`${API}/api/v1/admin/announcements`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          message, 
          active: nextActive,
          bg_color: bgColor,
          text_color: textColor,
          btn_bg: btnBg,
          btn_text: btnText,
          icon_name: iconName,
          cta_text: ctaText.trim() || null,
          cta_link: ctaLink.trim() || null,
          is_dismissible: isDismissible
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        // Revert on error
        setActive(!nextActive);
        alert("فشل تحديث حالة الإعلان على الخادم.");
      }
    } catch (err) {
      console.error("Failed to toggle announcement:", err);
      setActive(!nextActive);
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPalette = (palette: typeof GRADIENT_PALETTES[0]) => {
    setBgColor(palette.bg);
    setTextColor(palette.text);
    setBtnBg(palette.btnBg);
    setBtnText(palette.btnText);
    setPreviewDismissed(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`${API}/api/v1/admin/announcements`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          message, 
          active,
          bg_color: bgColor,
          text_color: textColor,
          btn_bg: btnBg,
          btn_text: btnText,
          icon_name: iconName,
          cta_text: ctaText.trim() || null,
          cta_link: ctaLink.trim() || null,
          is_dismissible: isDismissible
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        alert("حدث خطأ أثناء حفظ الإعلان.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  };

  const SelectedIconComponent = ICON_MAP[iconName] || Sparkles;

  if (loading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs font-bold text-slate-400">جاري جلب إعدادات الإعلانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      
      {/* ── Top Header Bar ── */}
      <div className="bg-white dark:bg-[#0b0f19] p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                استوديو تخصيص الإعلانات والشريط الترويجي 🎨
              </h2>
              <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                active 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                {active ? "البث مباشر الآن" : "البث متوقف"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              تحكم كامل في نصوص وألوان وخلفيات وأيقونات وأزرار الشريط الترويجي لطلاب الموقع.
            </p>
          </div>
        </div>

        {/* Master Active Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              {active ? "الإعلان مفعّل" : "الإعلان معطّل"}
            </span>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleToggleActive}
            className={`w-12 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer disabled:opacity-50 ${
              active ? "bg-emerald-500 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
            }`}
            title="تبديل حالة تفعيل الإعلان فوراً"
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>
      </div>

      {/* ── Main Layout: Controls & Live Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Color Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
            
            {/* 1. Message Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>نص الإعلان (الرسالة المعروضة):</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {message.length} حرف
                </span>
              </div>
              <textarea 
                value={message}
                onChange={(e) => { setMessage(e.target.value); setPreviewDismissed(false); }}
                placeholder="اكتب نص الإعلان الترويجي، التنبيه، أو كود الخصم هنا..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none shadow-inner"
              />
            </div>

            {/* 2. Choose Icon */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                أيقونة الإعلان:
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ICON_MAP).map((key) => {
                  const Icon = ICON_MAP[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setIconName(key)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                        iconName === key
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Preset Gradients (بنقرة واحدة) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>أنماط وتدرجات لونية جاهزة (One-Click Palettes):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GRADIENT_PALETTES.map((pal, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPalette(pal)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-right transition cursor-pointer group bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div className="h-4 w-full rounded-lg mb-1.5 shadow-2xs group-hover:scale-102 transition" style={{ background: pal.bg }} />
                    <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 block truncate">
                      {pal.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Detailed Color Pickers */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>محدد الألوان الحر والتفصيلي:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Background Color / CSS */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                    لون خلفية الشريط (HEX أو Gradient):
                  </span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      placeholder="#4f46e5 أو linear-gradient(...)"
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      dir="ltr"
                    />
                    <div 
                      className="w-7 h-7 rounded-xl border border-slate-300 dark:border-slate-700 shrink-0 shadow-inner"
                      style={{ background: bgColor }}
                    />
                  </div>
                </div>

                {/* Announcement Text Color */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                    لون نص الإعلان:
                  </span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={textColor.startsWith("#") ? textColor : "#ffffff"}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input 
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Button Background Color */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                    لون خلفية الزر (Button Background):
                  </span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={btnBg.startsWith("#") ? btnBg : "#ffffff"}
                      onChange={(e) => setBtnBg(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input 
                      type="text"
                      value={btnBg}
                      onChange={(e) => setBtnBg(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Button Text Color */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                    لون نص الزر (Button Text):
                  </span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={btnText.startsWith("#") ? btnText : "#000000"}
                      onChange={(e) => setBtnText(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input 
                      type="text"
                      value={btnText}
                      onChange={(e) => setBtnText(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      dir="ltr"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 5. Call-to-Action (CTA) */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                <span>زر الإجراء التفاعلي (Call to Action):</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">نص الزر:</span>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="مثال: اشترك الآن، جرّب الميزة"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">رابط الزر (URL):</span>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="مثال: /plans أو https://..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* 6. Dismissible */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  إمكانية إغلاق الإعلان (✕)
                </span>
                <span className="text-[11px] text-slate-400">
                  السماح للطلاب بإخفاء الشريط بالنقر على زر الإغلاق
                </span>
              </div>
              <input
                type="checkbox"
                checked={isDismissible}
                onChange={(e) => setIsDismissible(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {/* 7. Save & Broadcast Button */}
            <button 
              type="button"
              onClick={handleSave}
              disabled={saving || !message.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black text-xs transition shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ وتعميم الإعلان...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>تم حفظ وتحديث الإعلان بنجاح!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>حفظ ونشر التعديلات فوراً على المنصة 🚀</span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* Right Column: Live Interactive Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 sticky top-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>معاينة حية ومباشرة للألوان</span>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    previewDevice === "desktop" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-400"
                  }`}
                  title="معاينة شاشة الكمبيوتر"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    previewDevice === "mobile" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-slate-400"
                  }`}
                  title="معاينة الهاتف المحمول"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mockup Frame */}
            <div className={`mx-auto transition-all duration-300 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner ${
              previewDevice === "mobile" ? "max-w-[320px]" : "w-full"
            }`}>
              
              {/* Fake Browser Top Bar */}
              <div className="bg-slate-200 dark:bg-slate-900 px-3 py-2 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono" dir="ltr">lammah.site</span>
                <div className="w-6" />
              </div>

              {/* ── The Announcement Banner In Preview ── */}
              {active && message.trim() && !previewDismissed ? (
                <div 
                  style={{ background: bgColor }}
                  className="py-2.5 px-4 sm:px-6 w-full transition-all shadow-xs" 
                  dir="rtl"
                >
                  <div className="w-full flex items-center justify-between gap-3 text-xs">
                    
                    {/* Right Edge: Message & Icon */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-black/10 flex items-center justify-center shrink-0">
                        <SelectedIconComponent className="w-3.5 h-3.5" style={{ color: textColor }} />
                      </div>
                      <p 
                        style={{ color: textColor }}
                        className="font-bold text-[11px] sm:text-xs truncate leading-snug"
                      >
                        {message}
                      </p>
                    </div>

                    {/* Left Edge: CTA & Dismiss */}
                    <div className="flex items-center gap-2 shrink-0">
                      {ctaText.trim() && (
                        <span 
                          style={{
                            backgroundColor: btnBg,
                            color: btnText,
                            fontWeight: 900
                          }}
                          className="px-3 py-1 rounded-xl text-[10px] shadow-xs transition"
                        >
                          {ctaText}
                        </span>
                      )}

                      {isDismissible && (
                        <button
                          type="button"
                          onClick={() => setPreviewDismissed(true)}
                          className="opacity-70 hover:opacity-100 p-0.5 transition cursor-pointer"
                          style={{ color: textColor }}
                          title="تجربة زر الإغلاق"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ) : previewDismissed ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold text-center flex items-center justify-center gap-2 border-b border-amber-200 dark:border-amber-500/20">
                  <span>تمت تجربة إغلاق الشريط.</span>
                  <button 
                    onClick={() => setPreviewDismissed(false)}
                    className="underline text-indigo-600 dark:text-indigo-400 cursor-pointer font-black"
                  >
                    إعادة إظهاره
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-200/50 dark:bg-slate-900/50 text-slate-400 text-[11px] font-bold text-center border-b border-slate-200 dark:border-slate-800">
                  {active ? "اكتب نص الإعلان لمعاينته بالألوان" : "الشريط معطّل ومخفي حالياً عن الطلاب"}
                </div>
              )}

              {/* Fake Site Navbar & Page Header */}
              <div className="p-4 bg-white dark:bg-[#0b0f19] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                      ل
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">منصة لمّاح</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-4 rounded-md bg-slate-100 dark:bg-slate-800" />
                    <div className="w-12 h-4 rounded-md bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>

                {/* Fake Content Area */}
                <div className="space-y-2 py-4 text-center">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" />
                  <div className="h-2.5 w-48 bg-slate-100 dark:bg-slate-900 rounded-md mx-auto" />
                  <div className="h-16 w-full bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 mt-2 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                    محتوى شاشات المنصة والطلاب
                  </div>
                </div>
              </div>

            </div>

            <div className="text-[11px] text-slate-400 text-center leading-relaxed">
              💡 كل التعديلات في محدد الألوان تنعكس فوراً ومباشرة على شاشة المعاينة بالأعلى.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

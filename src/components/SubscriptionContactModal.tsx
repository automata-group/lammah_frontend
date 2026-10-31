"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MessageCircle, Crown, Zap, Sparkles, Check, 
  Copy, Phone, ShieldCheck, ArrowRight, ExternalLink, CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PlanItem {
  id: string;
  name: string;
  price_ils: number;
  duration_days?: number;
  minutes?: number;
  lecture_quota?: number;
}

interface SubscriptionContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanItem | null;
  initialFullName?: string;
  initialPhone?: string;
  sessionToken?: string;
  onSuccess?: () => void;
}

const ADMIN_WHATSAPP_NUMBER = "+972598298930";
const ADMIN_WHATSAPP_CLEAN = "972598298930";

export default function SubscriptionContactModal({
  isOpen,
  onClose,
  plan,
  initialFullName = "",
  initialPhone = "",
  sessionToken,
  onSuccess,
}: SubscriptionContactModalProps) {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState(initialFullName);
  const [copiedNumber, setCopiedNumber] = useState(false);

  useEffect(() => {
    if (initialFullName) {
      setStudentName(initialFullName);
    } else if (user?.user_metadata?.full_name) {
      setStudentName(user.user_metadata.full_name);
    } else if (user?.user_metadata?.name) {
      setStudentName(user.user_metadata.name);
    }
  }, [initialFullName, user]);

  if (!isOpen || !plan) return null;

  const isGoldPlan = plan.price_ils === 100 || plan.name.includes("الذهبية") || plan.name.includes("النخبة") || plan.name.toLowerCase().includes("elite");
  const isMidPlan = plan.price_ils === 60 || plan.name.includes("الميدتيرم") || plan.name.includes("التفوق") || plan.name.toLowerCase().includes("premium");
  const PlanIcon = isGoldPlan ? Crown : isMidPlan ? Zap : Sparkles;

  const buildWhatsAppMessage = () => {
    const lines = [
      `مرحباً، أود الاشتراك في (${plan.name}) بسعر ${plan.price_ils} ₪ عبر منصة لمّاح.`,
    ];

    const trimmedName = studentName.trim();
    if (trimmedName) {
      lines.push(`الاسم: ${trimmedName}`);
    }

    if (user?.email) {
      lines.push(`البريد الإلكتروني لحسابي: ${user.email}`);
    }

    lines.push(`أرجو تزويدي بطرق الدفع المتاحة وتفعيل الباقة في حسابي. شكراً لك!`);
    return lines.join("\n");
  };

  const handleOpenWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${ADMIN_WHATSAPP_CLEAN}?text=${encodeURIComponent(message)}`;
    
    // Log intent to backend silently if possible
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${apiUrl}/api/v1/transactions/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          plan_id: plan.id,
          phone_number: initialPhone || ADMIN_WHATSAPP_NUMBER,
          full_name: studentName.trim() || user?.user_metadata?.full_name || "طالب مهتم",
        }),
      }).catch(() => {});
    } catch {}

    window.open(url, "_blank");
    if (onSuccess) onSuccess();
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(ADMIN_WHATSAPP_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden text-right"
        >
          {/* Top Decorative Sheen */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 dark:via-emerald-400/70 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer z-10"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 sm:p-7 space-y-5">
            {/* Header: Plan Summary Pill */}
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isGoldPlan 
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                  : isMidPlan
                    ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/30"
                    : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
              }`}>
                <PlanIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    تفعيل فوري عبر واتساب
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {plan.price_ils} ₪
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                  تواصل معنا مباشرة عبر واتساب لتزويدك بطرق الدفع وتفعيل باقتك فوراً.
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Contact Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      رقم واتساب الإدارة المباشر:
                    </span>
                    <span className="font-mono font-black text-sm sm:text-base text-emerald-700 dark:text-emerald-300" dir="ltr">
                      {ADMIN_WHATSAPP_NUMBER}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Student Name Input (Optional helper) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                اسمك الكامل (ليظهر في رسالة الواتساب):
              </label>
              <input
                type="text"
                placeholder="أدخل اسمك هنا (مثال: سارة محمد)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition"
              />
              {user?.email && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  الحساب المسجل: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{user.email}</span>
                </p>
              )}
            </div>

            {/* Primary WhatsApp Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>تواصل معنا عبر واتساب الآن ({ADMIN_WHATSAPP_NUMBER})</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Payment Methods Notice */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                <span>طرق الدفع والتفعيل المتاحة:</span>
              </div>
              <p className="leading-relaxed">
                بال باي (PalPay) • بنك فلسطين • جوال باي (Jawwal Pay) • ريفلكت (Reflect) • تحويلات بنكية ومحلية.
              </p>
            </div>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 pt-0 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>تفعيل فوري ومتابعة شخصية من إدارة منصة لمّاح</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

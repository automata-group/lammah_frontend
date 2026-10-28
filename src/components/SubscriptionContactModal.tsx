"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MessageCircle, Crown, Zap, Sparkles, CheckCircle2, 
  Loader2, Phone, User, ArrowLeft, ShieldCheck 
} from "lucide-react";

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

const COUNTRY_CODES = [
  { code: "+970", country: "فلسطين", flag: "🇵🇸" },
  { code: "+972", country: "القدس والداخل", flag: "🇵🇸" },
  { code: "+962", country: "الأردن", flag: "🇯🇴" },
  { code: "+966", country: "السعودية", flag: "🇸🇦" },
  { code: "+20", country: "مصر", flag: "🇪🇬" },
  { code: "+971", country: "الإمارات", flag: "🇦🇪" },
  { code: "+974", country: "قطر", flag: "🇶🇦" },
  { code: "+965", country: "الكويت", flag: "🇰🇼" },
  { code: "custom", country: "أخرى (كود مخصص)", flag: "🌍" },
];

export default function SubscriptionContactModal({
  isOpen,
  onClose,
  plan,
  initialFullName = "",
  initialPhone = "",
  sessionToken,
  onSuccess,
}: SubscriptionContactModalProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+970");
  const [customCountryCode, setCustomCountryCode] = useState("+");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    formattedPhone: string;
    planName: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    if (initialFullName) setFullName(initialFullName);
    if (initialPhone) {
      // Try to parse country code if passed
      const matched = COUNTRY_CODES.find(c => c.code !== "custom" && initialPhone.startsWith(c.code));
      if (matched) {
        setSelectedCountryCode(matched.code);
        setPhoneNumber(initialPhone.slice(matched.code.length));
      } else {
        setPhoneNumber(initialPhone.replace(/\D/g, ""));
      }
    }
  }, [initialFullName, initialPhone]);

  useEffect(() => {
    if (!isOpen) {
      setError("");
      setOrderSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const isGoldPlan = plan.price_ils === 100 || plan.name.includes("الذهبية") || plan.name.includes("النخبة") || plan.name.toLowerCase().includes("elite");
  const isMidPlan = plan.price_ils === 60 || plan.name.includes("الميدتيرم") || plan.name.includes("التفوق") || plan.name.toLowerCase().includes("premium");
  const PlanIcon = isGoldPlan ? Crown : isMidPlan ? Zap : Sparkles;

  const getFullDialCode = () => {
    if (selectedCountryCode === "custom") {
      return customCountryCode.trim().startsWith("+") ? customCountryCode.trim() : `+${customCountryCode.trim()}`;
    }
    return selectedCountryCode;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("يرجى إدخال اسمك لتسهيل التواصل والمطابقة.");
      return;
    }

    const cleanDigits = phoneNumber.trim().replace(/\D/g, "").replace(/^0+/, "");
    if (!cleanDigits || cleanDigits.length < 7) {
      setError("يرجى إدخال رقم هاتف واتساب صحيح مكون من 7 أرقام على الأقل.");
      return;
    }

    const dialCode = getFullDialCode();
    if (!dialCode || dialCode === "+") {
      setError("يرجى إدخال أو تحديد مقدمة الدولة للواتساب.");
      return;
    }

    const fullFormattedPhone = `${dialCode}${cleanDigits}`;
    setSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(`${apiUrl}/api/v1/transactions/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          plan_id: plan.id,
          phone_number: fullFormattedPhone,
          full_name: fullName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail?.user_message || data.detail || "تعذر إرسال الطلب، يرجى المحاولة لاحقاً.");
      }

      setOrderSuccess({
        orderId: data.order_id || "NEW",
        formattedPhone: fullFormattedPhone,
        planName: plan.name,
        amount: plan.price_ils,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إرسال الطلب.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectWhatsAppClick = () => {
    if (!orderSuccess) return;
    const adminPhone = "972598298930";
    const msg = `مرحباً، قمت بطلب الاشتراك في (${orderSuccess.planName}) بسعر ${orderSuccess.amount} ₪ عبر منصة لمّاح.\nالاسم: ${fullName.trim()}\nرقم الطلب: #${orderSuccess.orderId}\nرقم الواتساب: ${orderSuccess.formattedPhone}\nأرجو تزويدي بطريقة الدفع وتفعيل الباقة. شكراً!`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden text-right"
        >
          {/* Top Decorative Sheen */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 dark:via-emerald-400/50 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer z-10"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          {!orderSuccess ? (
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
                      طلب اشتراك سريع
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {plan.price_ils} ₪
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
                    ضع رقمك مع مقدمة الواتساب وسنتواصل معك فوراً لتفعيل الباقة وتسهيل الدفع.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                    الاسم الكامل (أحرف لمخاطبتك وتوثيق الباقة):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد خليل"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl py-2.5 px-3.5 pr-10 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none transition"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. WhatsApp Number + Country Code */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                    رقم الواتساب مع مقدمة الدولة:
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {/* Country Code Select */}
                    <div className="sm:col-span-2">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-2xl py-2.5 px-3 text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer transition"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {c.flag} {c.country} ({c.code === "custom" ? "مخصص" : c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number Input */}
                    <div className="sm:col-span-3 relative">
                      <input
                        type="tel"
                        required
                        placeholder="مثال: 599123456"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl py-2.5 px-3.5 pr-10 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white outline-none transition text-left"
                        dir="ltr"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Custom dial code input if selected */}
                  {selectedCountryCode === "custom" && (
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-bold">أدخل مقدمة دولتك:</span>
                      <input
                        type="text"
                        placeholder="+000"
                        value={customCountryCode}
                        onChange={(e) => setCustomCountryCode(e.target.value)}
                        className="w-28 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 rounded-xl py-1 px-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white text-left outline-none"
                        dir="ltr"
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    💬 يرجى التأكد من أن الرقم مربوط بتطبيق واتساب نشط لتلقي رسالة التفعيل فوراً.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري إرسال الطلب...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>تواصل معي عبر واتساب</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Trust Footer */}
                <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>تفعيل فوري ومتابعة شخصية من إدارة منصة لمّاح</span>
                </div>
              </form>
            </div>
          ) : (
            /* ── Success State Screen ── */
            <div className="p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  تم استلام طلبك بنجاح 🎉
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                  سنتواصل معك عبر الواتساب الآن!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  تم تسجيل رقمك <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-black" dir="ltr">{orderSuccess.formattedPhone}</strong> للاشتراك في <strong className="text-slate-900 dark:text-white font-bold">{orderSuccess.planName}</strong>.
                </p>
              </div>

              {/* Order Reference Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 font-medium">رقم الطلب الخاص بك:</div>
                <div className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400">
                  #{orderSuccess.orderId}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDirectWhatsAppClick}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>راسلنا على واتساب فوراً لتسريع التفعيل ⚡</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  إغلاق والمتابعة
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

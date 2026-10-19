"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search, 
  Crown, 
  Clock, 
  ShieldCheck, 
  User, 
  Plus, 
  RefreshCw,
  Gift,
  Coins,
  Calendar,
  Layers,
  Star,
  Check,
  Flame,
  ChevronDown,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlanItem {
  id: string;
  name: string;
  name_en?: string;
  period_type: string;
  price_ils: number;
  lecture_quota: number;
  is_active: boolean;
  features?: string[] | string;
}

interface UserLookupResult {
  exists: boolean;
  id?: string;
  email: string;
  full_name?: string;
  quota_remaining?: number;
  current_plan?: string;
  current_plan_id?: string;
  message?: string;
}

interface AssignSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken?: string;
  initialEmail?: string;
  onSuccess?: () => void;
}

// 3 Canonical Lammah Plans matching Landing & Pricing Page
const CANONICAL_PLANS = [
  {
    id: "7e17c4ba-0830-4f91-88da-7d6440d22123",
    code: "elite",
    title: "باقة النخبة (Elite)",
    badge: "باقة النخبة • الفصل الكامل",
    badgeIcon: "star",
    price: 100,
    priceNote: "للفصل كاملاً",
    minutes: 2400,
    durationText: "صلاحية 90 يوم",
    desc: "الباقة الشاملة لأوائل الدفعات! رصيد عملاق للفصل كاملاً مع توليد الدفاتر الجمالية وبيعها بالمتجر للأرباح.",
    lectures: "40 إلى 45 محاضرة طوال الفصل",
    chapters: "تغطية كافة سلايدات وشباتر الفصل",
    specialPerk: "👑 توليد الدفاتر الذكية الشاملة (PDF فخم يغنيك عن المراجعة للطباعة الفورية)",
    theme: {
      borderSelected: "border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.06]",
      borderDefault: "border-amber-300/80 dark:border-amber-500/30 hover:border-amber-400",
      badgeBg: "bg-amber-400 text-slate-950",
      accentText: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      quotaBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
    }
  },
  {
    id: "f1f25974-6495-42e2-bb31-70b3b9796a8e",
    code: "premium",
    title: "باقة التفوق (Premium)",
    badge: "الأكثر طلباً • اشتراك شهري",
    badgeIcon: "zap",
    price: 60,
    priceNote: "شهرياً",
    minutes: 900,
    durationText: "صلاحية 30 يوم",
    desc: "الاشتراك الشهري الأكثر طلباً لتوديع تراكم المحاضرات! رصيد متجدد يغطي كافة مساقاتك بذكاء.",
    lectures: "15 إلى 18 محاضرة شهرياً",
    chapters: "حتى 60 شابتر أو ملف سلايدات",
    specialPerk: "تفريغ صوتي + فلاش كاردز مقلوبة + كويزات + شات ذكي (35 سؤال)",
    theme: {
      borderSelected: "border-indigo-600 ring-2 ring-indigo-500/40 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06]",
      borderDefault: "border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400",
      badgeBg: "bg-slate-900 text-white dark:bg-indigo-600",
      accentText: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      quotaBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
    }
  },
  {
    id: "f5aa8bae-7a95-4902-9167-7d217221627d",
    code: "essential",
    title: "باقة إنقاذ الكويزات (Essential)",
    badge: "شحن سريع للكويزات",
    badgeIcon: "sparkles",
    price: 25,
    priceNote: "دفعة واحدة",
    minutes: 300,
    durationText: "صلاحية 7 يوم",
    desc: "شحنة إنقاذ فورية قبل الكويزات! تفريغ وتلخيص مركز للشابترات الصعبة تكفي 5 إلى 6 محاضرات كاملة.",
    lectures: "5 إلى 6 محاضرات كاملة",
    chapters: "حتى 20 شابتر أو ملف سلايدات",
    specialPerk: "إنقاذ سريع للكويزات + شات ذكي (15 سؤال)",
    theme: {
      borderSelected: "border-slate-700 dark:border-slate-300 ring-2 ring-slate-400/40 bg-slate-500/[0.04]",
      borderDefault: "border-slate-200 dark:border-slate-800 hover:border-slate-300",
      badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      accentText: "text-slate-700 dark:text-slate-300",
      iconBg: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
      quotaBg: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
    }
  }
];

export default function AssignSubscriptionModal({
  isOpen,
  onClose,
  sessionToken,
  initialEmail = "",
  onSuccess
}: AssignSubscriptionModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("7e17c4ba-0830-4f91-88da-7d6440d22123"); // Default to Elite
  const [customBonusMinutes, setCustomBonusMinutes] = useState<number>(0);
  const [addToExisting, setAddToExisting] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [showCustomOption, setShowCustomOption] = useState<boolean>(false);

  // Lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupUser, setLookupUser] = useState<UserLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: "success" | "error"; text: string; details?: any } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";

  // Pre-fill email if passed
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      handleLookup(initialEmail);
    }
  }, [initialEmail, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setResultMessage(null);
    }
  }, [isOpen]);

  const handleLookup = async (targetEmail?: string) => {
    const emailToQuery = (targetEmail || email).trim().toLowerCase();
    if (!emailToQuery || !emailToQuery.includes("@")) {
      setLookupError("يرجى إدخال بريد إلكتروني صالح.");
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setLookupUser(null);

    try {
      const res = await fetch(`${API}/api/v1/admin/users/lookup-by-email?email=${encodeURIComponent(emailToQuery)}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setLookupUser(data);
      } else {
        setLookupError(data.detail?.user_message || data.detail || "تعذر فحص الحساب.");
      }
    } catch (err: any) {
      setLookupError("تعذر الاتصال بالخادم للتحقق من الحساب.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      alert("يرجى كتابة بريد العميل الإلكتروني بشكل صحيح.");
      return;
    }

    setSubmitting(true);
    setResultMessage(null);

    try {
      const res = await fetch(`${API}/api/v1/admin/subscriptions/assign-by-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          plan_id: selectedPlanId,
          custom_minutes: Number(customBonusMinutes) || 0,
          add_to_existing: addToExisting,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResultMessage({
          type: "success",
          text: data.message || "تم تفعيل الاشتراك وشحن الدقائق بنجاح!",
          details: data
        });
        if (onSuccess) onSuccess();
      } else {
        setResultMessage({
          type: "error",
          text: data.detail?.user_message || data.detail || "فشلت عملية تفعيل الاشتراك."
        });
      }
    } catch (err: any) {
      setResultMessage({
        type: "error",
        text: `حدث خطأ أثناء الاتصال بالخادم: ${err.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentSelectedPlan = CANONICAL_PLANS.find(p => p.id === selectedPlanId);
  const baseMinutes = currentSelectedPlan ? currentSelectedPlan.minutes : 0;
  const previousQuota = lookupUser?.quota_remaining || 0;
  const bonusMins = Number(customBonusMinutes) || 0;
  const totalCalculated = (addToExisting ? previousQuota : 0) + (selectedPlanId === "custom_only" ? 0 : baseMinutes) + bonusMins;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-l from-indigo-50/60 via-amber-50/20 to-transparent dark:from-indigo-950/25">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  شحن باقة ودقائق لعميل (Google Account)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  3 باقات رسمية
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                أدخل إيميل جوجل الخاص بالطالب، اختر الباقة المعتمدة، وسيتم إضافة الدقائق لحسابه فوراً 🚀
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Success / Error Notification Banner */}
          {resultMessage && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              resultMessage.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}>
              {resultMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <p className="font-black text-sm mb-1">{resultMessage.text}</p>
                {resultMessage.details && (
                  <div className="mt-2 p-3 rounded-xl bg-white/70 dark:bg-black/40 font-mono text-[11px] space-y-1">
                    <p>• البريد الإلكتروني: {resultMessage.details.email}</p>
                    <p>• الباقة المفعلة: {resultMessage.details.plan_name}</p>
                    <p>• إجمالي الرصيد الجديد: <span className="font-bold text-indigo-600 dark:text-indigo-400">{resultMessage.details.total_quota} دقيقة</span></p>
                    {resultMessage.details.expires_at && (
                      <p>• تاريخ الانتهاء: {new Date(resultMessage.details.expires_at).toLocaleDateString("ar-EG")}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Customer Google Email & Live Check */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>1. بريد جوجل الخاص بالعميل (Google Email):</span>
              <span className="text-[11px] text-slate-400 font-normal">الحساب الذي يسجل به الطالب في المنصة</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="email"
                required
                placeholder="مثال: student@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (lookupUser) setLookupUser(null);
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition dir-ltr text-right"
              />
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={lookupLoading || !email.trim()}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-sm shadow-indigo-600/20"
              >
                {lookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>فحص الحساب</span>
              </button>
            </div>

            {/* Error Message */}
            {lookupError && (
              <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{lookupError}</span>
              </p>
            )}

            {/* Lookup Card */}
            {lookupUser && (
              <div className="mt-2.5 p-3.5 rounded-2xl border bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">{lookupUser.full_name || lookupUser.email}</span>
                  </div>
                  {lookupUser.exists ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>حساب مسجل ونشط</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>حساب جديد (سيتم إنشاؤه وشحنه مسبقاً)</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">الباقة الحالية: </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{lookupUser.current_plan || "بدون باقة"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">الرصيد المتبقي له الآن: </span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{lookupUser.quota_remaining || 0} دقيقة</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: The 3 Canonical Plans Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>2. اختر باقة لمّاح المراد تفعيلها:</span>
                <span className="text-[10px] text-slate-400 font-normal">(باقات منصة لمّاح المعتمدة الثلاث)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCustomOption(!showCustomOption)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{showCustomOption ? "إخفاء الخيار المخصص" : "+ شحن يدوي مخصص بدون باقة"}</span>
              </button>
            </div>

            {/* 3 Main Plan Cards (Matching Landing & Pricing Page) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {CANONICAL_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isElite = plan.code === "elite";
                const isPremium = plan.code === "premium";

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                    }}
                    className={`rounded-3xl border p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer relative ${
                      isSelected
                        ? plan.theme.borderSelected
                        : `bg-white dark:bg-slate-900 ${plan.theme.borderDefault}`
                    } shadow-xs hover:shadow-md`}
                  >
                    {/* Top Pill Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black shadow-xs ${plan.theme.badgeBg}`}>
                        {plan.badgeIcon === "star" && <Star className="w-3 h-3 fill-current" />}
                        {plan.badgeIcon === "zap" && <Zap className="w-3 h-3 fill-current" />}
                        {plan.badgeIcon === "sparkles" && <Sparkles className="w-3 h-3" />}
                        <span>{plan.badge}</span>
                      </span>
                    </div>

                    {/* Price Header */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          ₪{plan.price}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {plan.priceNote}
                        </span>
                      </div>
                      <h3 className={`text-sm font-black mt-1 ${isElite ? "text-amber-600 dark:text-amber-400" : isPremium ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"}`}>
                        {plan.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {plan.desc}
                      </p>
                    </div>

                    {/* Quota & Validity Box */}
                    <div className={`p-2.5 rounded-2xl border mb-3 flex items-center justify-between text-xs font-black ${plan.theme.quotaBg}`}>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{plan.minutes} دقيقة ذكية</span>
                      </div>
                      <span className="text-[10px] font-bold opacity-80">{plan.durationText}</span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800/80 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span>{plan.lectures}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span>{plan.chapters}</span>
                      </div>
                      {plan.specialPerk && (
                        <div className={`p-2 rounded-xl text-[10px] font-bold leading-relaxed ${
                          isElite ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}>
                          {plan.specialPerk}
                        </div>
                      )}
                    </div>

                    {/* Select Radio / Button indicator */}
                    <div className="pt-2">
                      <div className={`w-full py-2 rounded-xl text-xs font-black text-center transition flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? (isElite ? "bg-amber-500 text-slate-950 font-black shadow-sm" : isPremium ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950")
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{isSelected ? "الباقة المختارة لتفعيلها ✓" : "اختر هذه الباقة"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Minutes Option (Toggleable) */}
            {showCustomOption && (
              <div 
                onClick={() => setSelectedPlanId("custom_only")}
                className={`p-4 rounded-2xl border text-right transition cursor-pointer flex items-center justify-between ${
                  selectedPlanId === "custom_only"
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-2">
                    <span>شحن رصيد دقائق مخصص فقط (بدون ربط بباقة)</span>
                    {selectedPlanId === "custom_only" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">محدد</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    تعبئة يدوية لأي عدد من الدقائق يحدده الأدمن مباشرة دون تغيير اسم الباقة
                  </p>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  تحديد يدوي
                </span>
              </div>
            )}
          </div>

          {/* Step 3: Bonus Minutes & Accumulation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5 block">
                {selectedPlanId === "custom_only" ? "عدد الدقائق المراد شحنها:" : "دقائق إضافية / بونص تمنحها للعميل:"}
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  step="5"
                  value={customBonusMinutes || ""}
                  placeholder={selectedPlanId === "custom_only" ? "مثال: 500" : "0 (اختياري)"}
                  onChange={(e) => setCustomBonusMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">دقيقة</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 mb-1.5 block">
                طريقة احتساب الدقائق في حساب الطالب:
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input 
                    type="radio"
                    name="mode"
                    checked={addToExisting}
                    onChange={() => setAddToExisting(true)}
                    className="accent-indigo-600"
                  />
                  <span>إضافة وتراكم فوق رصيده الحالي (مستحسن)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input 
                    type="radio"
                    name="mode"
                    checked={!addToExisting}
                    onChange={() => setAddToExisting(false)}
                    className="accent-indigo-600"
                  />
                  <span>استبدال الرصيد السابق بالرصيد الجديد</span>
                </label>
              </div>
            </div>
          </div>

          {/* Step 4: Summary Card Before Confirmation */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-indigo-600/10 border border-indigo-200 dark:border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">
                إجمالي رصيد الدقائق في حساب الطالب بعد الاعتماد:
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-indigo-700 dark:text-indigo-300">
                  {totalCalculated}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  دقيقة ذكية ({addToExisting ? `${previousQuota} رصيد سابق + ${selectedPlanId === "custom_only" ? bonusMins : baseMinutes + bonusMins}` : "رصيد معتمد جديد"})
                </span>
              </div>
            </div>

            <div className="text-left text-xs font-bold text-slate-700 dark:text-slate-300">
              <p>الباقة: <span className="font-black text-slate-900 dark:text-white">{currentSelectedPlan?.title || "رصيد مخصص"}</span></p>
              <p>الصلاحية: <span className="font-black text-slate-900 dark:text-white">{currentSelectedPlan?.durationText || "30 يوم"}</span></p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !email.trim() || (!selectedPlanId && customBonusMinutes <= 0)}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تفعيل الاشتراك وشحن الرصيد...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>تأكيد وشحن الباقة للعميل فوراً ⚡</span>
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}

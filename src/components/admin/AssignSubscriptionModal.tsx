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
  User, 
  Plus, 
  Star, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
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
  apiUrl?: string;
}

// The 3 Canonical Plans of Lammah
const CANONICAL_PLANS = [
  {
    id: "7e17c4ba-0830-4f91-88da-7d6440d22123",
    code: "elite",
    title: "باقة النخبة (Elite)",
    badge: "باقة النخبة • الفصل الكامل",
    badgeIcon: "star",
    price: 100,
    priceNote: "للفصل كاملاً",
    minutes: 4500,
    durationText: "صلاحية شهر (30 يوم)",
    desc: "الباقة الشاملة لأوائل الدفعات! رصيد عملاق (75 ساعة / 4,500 دقيقة) يكفي كل مساقات الفصل مع توليد الدفاتر الجمالية وبيعها بالمتجر للأرباح.",
    lectures: "75 إلى 100 محاضرة",
    chapters: "تغطية كافة سلايدات وشباتر الفصل",
    specialPerk: "👑 توليد الدفاتر الذكية الشاملة (PDF فخم يغنيك عن المراجعة)",
    theme: {
      borderSelected: "border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/[0.05] dark:bg-amber-500/[0.08]",
      borderDefault: "border-amber-200 dark:border-amber-500/20 hover:border-amber-400",
      badgeBg: "bg-amber-400 text-slate-950",
      titleColor: "text-amber-700 dark:text-amber-400",
      quotaBg: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
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
    minutes: 2200,
    durationText: "صلاحية شهر (30 يوم)",
    desc: "الاشتراك الشهري الأكثر طلباً لتوديع تراكم المحاضرات! رصيد ضخم (37 ساعة / 2,200 دقيقة) يغطي 3 إلى 4 مساقات شهرياً براحة تامة.",
    lectures: "35 إلى 45 محاضرة شهرياً",
    chapters: "حتى 60 شابتر أو ملف سلايدات",
    specialPerk: "تفريغ صوتي + كويزات + فلاش كاردز + شات ذكي",
    theme: {
      borderSelected: "border-indigo-600 ring-2 ring-indigo-500/40 bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08]",
      borderDefault: "border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-400",
      badgeBg: "bg-slate-900 text-white dark:bg-indigo-600",
      titleColor: "text-indigo-600 dark:text-indigo-400",
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
    minutes: 800,
    durationText: "صلاحية شهر (30 يوم)",
    desc: "شحنة إنقاذ قوية للكويزات والميدتيرم! رصيد (13.5 ساعة / 800 دقيقة) يكفي 7 إلى 14 محاضرة كاملة لتلخيص الشابترات الصعبة.",
    lectures: "7 إلى 14 محاضرة كاملة",
    chapters: "حتى 20 شابتر أو ملف سلايدات",
    specialPerk: "إنقاذ سريع للكويزات + شات ذكي",
    theme: {
      borderSelected: "border-slate-800 dark:border-slate-300 ring-2 ring-slate-400/40 bg-slate-500/[0.05]",
      borderDefault: "border-slate-200 dark:border-slate-800 hover:border-slate-400",
      badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      titleColor: "text-slate-800 dark:text-slate-200",
      quotaBg: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
    }
  }
];

export default function AssignSubscriptionModal({
  isOpen,
  onClose,
  sessionToken,
  initialEmail = "",
  onSuccess,
  apiUrl
}: AssignSubscriptionModalProps) {
  // Wizard Step: 1 = Email & Check, 2 = Choose Plan, 3 = Confirm & Assign
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [plansList, setPlansList] = useState(CANONICAL_PLANS);
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

  // Dynamically resolve API URL: prefer prop, then window origin if tunnel, then env var, fallback to safe port
  const API = apiUrl || (() => {
    if (typeof window !== "undefined") {
      if (window.location.port === "8888" || window.location.port === "9090") {
        return window.location.origin;
      }
      if (window.location.hostname.includes("lammah.site")) {
        return "https://api.lammah.site";
      }
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  })();

  // Pre-fill email and auto check if initialEmail exists
  useEffect(() => {
    if (initialEmail && isOpen) {
      setEmail(initialEmail);
      handleLookup(initialEmail);
    }
  }, [initialEmail, isOpen]);

  // Reset state when opening and sync live plans from DB
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setResultMessage(null);

      const fetchDbPlans = async () => {
        try {
          const res = await fetch(`${API}/api/v1/admin/subscriptions/plans`, {
            headers: {
              ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
            }
          });
          if (!res.ok) return;
          const dbPlans = await res.json().catch(() => null);
          if (Array.isArray(dbPlans) && dbPlans.length > 0) {
            setPlansList((prev) =>
              prev.map((cp) => {
                const match = dbPlans.find((p: any) => p.id === cp.id || p.price_ils === cp.price);
                if (match && typeof match.lecture_quota === "number") {
                  return {
                    ...cp,
                    minutes: match.lecture_quota,
                    price: typeof match.price_ils === "number" ? match.price_ils : cp.price
                  };
                }
                return cp;
              })
            );
          }
        } catch (err) {
          console.warn("Could not sync live DB plans:", err);
        }
      };

      fetchDbPlans();
    }
  }, [isOpen, sessionToken, API]);

  const handleLookup = async (targetEmail?: string) => {
    const emailToQuery = (targetEmail || email).trim().toLowerCase();
    if (!emailToQuery || !emailToQuery.includes("@")) {
      setLookupError("يرجى إدخال بريد إلكتروني صالح.");
      return;
    }

    setLookupLoading(true);
    setLookupError(null);

    try {
      const res = await fetch(`${API}/api/v1/admin/users/lookup-by-email?email=${encodeURIComponent(emailToQuery)}`, {
        headers: {
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
        }
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setLookupUser(data);
      } else {
        const msg = data.detail?.user_message || (typeof data.detail === "string" ? data.detail : null) || data.message || `تعذر فحص الحساب (رمز ${res.status})`;
        setLookupError(msg);
      }
    } catch (err: any) {
      setLookupError(`تعذر الاتصال بالخادم للتحقق من الحساب: ${err.message || err}`);
    } finally {
      setLookupLoading(false);
    }
  };

  const goToStep2 = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setLookupError("يرجى إدخال بريد إلكتروني صالح أولاً.");
      return;
    }
    // If not checked yet, run quick check
    if (!lookupUser) {
      await handleLookup(cleanEmail);
    }
    setStep(2);
  };

  const handleSubmit = async () => {
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
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify({
          email: cleanEmail,
          plan_id: selectedPlanId,
          custom_minutes: Number(customBonusMinutes) || 0,
          add_to_existing: addToExisting,
          notes: notes.trim() || undefined
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResultMessage({
          type: "success",
          text: data.message || "تم تفعيل الاشتراك وشحن الدقائق بنجاح!",
          details: data
        });
        if (onSuccess) onSuccess();
      } else {
        const errorText = data.detail?.user_message || (typeof data.detail === "string" ? data.detail : null) || data.message || `فشلت عملية تفعيل الاشتراك (رمز ${res.status})`;
        setResultMessage({
          type: "error",
          text: errorText
        });
      }
    } catch (err: any) {
      setResultMessage({
        type: "error",
        text: `حدث خطأ أثناء الاتصال بالخادم: ${err.message || err}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentSelectedPlan = plansList.find(p => p.id === selectedPlanId);
  const baseMinutes = currentSelectedPlan ? currentSelectedPlan.minutes : 0;
  const previousQuota = lookupUser?.quota_remaining || 0;
  const bonusMins = Number(customBonusMinutes) || 0;
  const totalCalculated = (addToExisting ? previousQuota : 0) + (selectedPlanId === "custom_only" ? 0 : baseMinutes) + bonusMins;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-3xl max-h-[88vh] flex flex-col bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Top Header (Fixed - Never Shrinks) */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-l from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>شحن واشتراك عميل بالبريد</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                  خطوات سريعة
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إيداع باقة معتمدة ورصيد دقائق في حساب أي عميل فورياً
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

        {/* Step Progress Bar (Fixed - Never Shrinks) */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {/* Step 1 Indicator */}
            <div 
              onClick={() => { if (!submitting) setStep(1); }}
              className={`flex items-center gap-2 cursor-pointer transition ${step === 1 ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-400 font-bold"}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                step === 1 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : (step > 1 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400")
              }`}>
                {step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
              </div>
              <span className="text-xs">البريد والحساب</span>
            </div>

            <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 1 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />

            {/* Step 2 Indicator */}
            <div 
              onClick={() => { if (!submitting && email.includes("@")) setStep(2); }}
              className={`flex items-center gap-2 cursor-pointer transition ${step === 2 ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-400 font-bold"}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                step === 2 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : (step > 2 ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400")
              }`}>
                {step > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
              </div>
              <span className="text-xs">اختيار الباقة</span>
            </div>

            <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 2 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />

            {/* Step 3 Indicator */}
            <div 
              onClick={() => { if (!submitting && email.includes("@")) setStep(3); }}
              className={`flex items-center gap-2 cursor-pointer transition ${step === 3 ? "text-indigo-600 dark:text-indigo-400 font-black" : "text-slate-400 font-bold"}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                step === 3 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                3
              </div>
              <span className="text-xs">تأكيد الشحن</span>
            </div>
          </div>
        </div>

        {/* Scrollable Modal Content (Takes Available Height Smoothly) */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">

          {/* Success / Error Notification Banner */}
          {resultMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                resultMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
              }`}
            >
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
                    <p>• الصلاحية: شهر كامل (30 يوماً)</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STEP 1: Email & Account Verification                     */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  الخطوة 1: أدخل بريد جوجل الخاص بالطالب
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  اكتب إيميل جوجل الذي يدخل به الطالب إلى المنصة للتحقق من بياناته
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  بريد جوجل للعميل (Google Email):
                </label>
                <div className="flex gap-2">
                  <input 
                    type="email"
                    autoFocus
                    required
                    placeholder="مثال: student@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (lookupUser) setLookupUser(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleLookup();
                      }
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

                {lookupError && (
                  <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{lookupError}</span>
                  </p>
                )}
              </div>

              {/* Verified Account Card */}
              {lookupUser ? (
                <div className="p-4 rounded-2xl border bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/30 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white">{lookupUser.full_name || lookupUser.email}</h4>
                        <span className="font-mono text-[11px] text-slate-500">{lookupUser.email}</span>
                      </div>
                    </div>
                    {lookupUser.exists ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>مسجل ونشط بالمنصة</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>حساب جديد (سيتم تهيئته)</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/50 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">الباقة المفعلة الحالية:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{lookupUser.current_plan || "بدون باقة"}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px]">رصيد الدقائق المتبقي له الآن:</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">{lookupUser.quota_remaining || 0} دقيقة</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs py-6">
                  💡 اكتب الإيميل ثم اضغط "فحص الحساب" للتأكد من رصيد وباقة الطالب قبل المتابعة
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STEP 2: Choose Plan (Clean 3 Cards)                      */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    الخطوة 2: اختر باقة الاشتراك المراد تفعيلها
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    جميع الباقات تمنح صلاحية <span className="font-bold text-indigo-600 dark:text-indigo-400">شهر كامل (30 يوماً)</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomOption(!showCustomOption)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {showCustomOption ? "إخفاء الخيار المخصص" : "+ شحن يدوي بدون باقة"}
                </button>
              </div>

              {/* The 3 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plansList.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isElite = plan.code === "elite";
                  const isPremium = plan.code === "premium";

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all cursor-pointer relative ${
                        isSelected
                          ? plan.theme.borderSelected
                          : `bg-white dark:bg-slate-900 ${plan.theme.borderDefault}`
                      } shadow-xs hover:shadow-md`}
                    >
                      {/* Top Pill Badge */}
                      <div className="mb-2.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black ${plan.theme.badgeBg}`}>
                          {plan.badgeIcon === "star" && <Star className="w-2.5 h-2.5 fill-current" />}
                          {plan.badgeIcon === "zap" && <Zap className="w-2.5 h-2.5 fill-current" />}
                          {plan.badgeIcon === "sparkles" && <Sparkles className="w-2.5 h-2.5" />}
                          <span>{plan.badge}</span>
                        </span>
                      </div>

                      {/* Price Header */}
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            ₪{plan.price}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                            {plan.priceNote}
                          </span>
                        </div>
                        <h4 className={`text-xs font-black mt-0.5 ${plan.theme.titleColor}`}>
                          {plan.title}
                        </h4>
                      </div>

                      {/* Quota & 1 Month Validity */}
                      <div className={`p-2 rounded-xl border mb-2.5 flex items-center justify-between text-[11px] font-black ${plan.theme.quotaBg}`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{plan.minutes} دقيقة</span>
                        </div>
                        <span className="text-[9px] font-bold opacity-85">صلاحية شهر (30 يوم)</span>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300 mb-3 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{plan.lectures}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{plan.chapters}</span>
                        </div>
                        {isElite && (
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[9px] font-bold leading-tight">
                            👑 ميزة توليد الدفاتر الذكية
                          </div>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      <div className={`py-1.5 rounded-xl text-[11px] font-black text-center flex items-center justify-center gap-1 transition ${
                        isSelected 
                          ? (isElite ? "bg-amber-500 text-slate-950" : isPremium ? "bg-indigo-600 text-white" : "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-950")
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{isSelected ? "مختارة ✓" : "تحديد"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Minutes Option (if toggled) */}
              {showCustomOption && (
                <div 
                  onClick={() => setSelectedPlanId("custom_only")}
                  className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex items-center justify-between ${
                    selectedPlanId === "custom_only"
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>شحن رصيد دقائق مخصص فقط (بدون باقة)</span>
                      {selectedPlanId === "custom_only" && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-600 text-white font-bold">محدد</span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      تعبئة يدوية لأي عدد دقائق تحدده في الخطوة التالية
                    </p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    تحديد يدوي
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* STEP 3: Calculation & Final Confirmation                 */}
          {/* ══════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  الخطوة 3: طريقة الاحتساب وتأكيد الشحن
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  راجع التفاصيل النهائية ورصيد الحساب قبل اعتماد العملية
                </p>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  addToExisting 
                    ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}>
                  <input 
                    type="radio"
                    name="calc_mode"
                    checked={addToExisting}
                    onChange={() => setAddToExisting(true)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white">
                      إضافة وتراكم الدقائق (مستحسن)
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      تُضاف دقائق الباقة فوق رصيده السابق ({previousQuota} دقيقة) دون ضياع أي دقيقة.
                    </p>
                  </div>
                </label>

                <label className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  !addToExisting 
                    ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}>
                  <input 
                    type="radio"
                    name="calc_mode"
                    checked={!addToExisting}
                    onChange={() => setAddToExisting(false)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <h5 className="font-black text-xs text-slate-900 dark:text-white">
                      استبدال الرصيد السابق
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      يتم تصفير الرصيد القديم واعتماد دقائق الباقة الجديدة فقط.
                    </p>
                  </div>
                </label>
              </div>

              {/* Bonus Minutes Input */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {selectedPlanId === "custom_only" ? "عدد الدقائق المراد شحنها:" : "دقائق إضافية / بونص تمنحها للعميل:"}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {selectedPlanId === "custom_only" ? "حدد رصيد الدقائق" : "اختياري (يمكن تركه 0)"}
                  </span>
                </div>
                <div className="relative w-36">
                  <input 
                    type="number"
                    min="0"
                    step="5"
                    value={customBonusMinutes || ""}
                    placeholder="0"
                    onChange={(e) => setCustomBonusMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 text-center"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">دقيقة</span>
                </div>
              </div>

              {/* Final Receipt / Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-indigo-600/10 border border-indigo-200 dark:border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">
                    إجمالي الدقائق النهائي في حساب الطالب:
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-indigo-700 dark:text-indigo-300">
                      {totalCalculated}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      دقيقة ذكية ({addToExisting ? `${previousQuota} سابق + ${selectedPlanId === "custom_only" ? bonusMins : baseMinutes + bonusMins}` : "رصيد معتمد"})
                    </span>
                  </div>
                </div>

                <div className="text-left text-xs font-bold text-slate-700 dark:text-slate-300 space-y-0.5">
                  <p>العميل: <span className="font-mono text-slate-900 dark:text-white">{email}</span></p>
                  <p>الباقة: <span className="font-black text-slate-900 dark:text-white">{currentSelectedPlan?.title || "رصيد مخصص"}</span></p>
                  <p>الصلاحية: <span className="font-black text-emerald-600 dark:text-emerald-400">صلاحية شهر (30 يوم)</span></p>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Modal Bottom Footer (Fixed - Never Shrinks) */}
        <div className="px-6 py-4 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            >
              إلغاء
            </button>

            {step === 1 && (
              <button
                type="button"
                onClick={goToStep2}
                disabled={lookupLoading || !email.trim() || !email.includes("@")}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <span>متابعة لاختيار الباقة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>متابعة لتأكيد الرصيد</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !email.trim() || (!selectedPlanId && customBonusMinutes <= 0)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الشحن والاعتماد...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>تأكيد وشحن الباقة فوراً ⚡</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}

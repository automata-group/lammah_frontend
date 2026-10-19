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
  Layers
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

export default function AssignSubscriptionModal({
  isOpen,
  onClose,
  sessionToken,
  initialEmail = "",
  onSuccess
}: AssignSubscriptionModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [customBonusMinutes, setCustomBonusMinutes] = useState<number>(0);
  const [addToExisting, setAddToExisting] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

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

  // Load plans on open
  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      setResultMessage(null);
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API}/api/v1/admin/subscriptions/plans`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
        // Default to Gold/Semester plan or first high quota plan
        const goldPlan = data.find((p: PlanItem) => p.name.includes("الذهبية") || p.lecture_quota >= 2000);
        if (goldPlan) {
          setSelectedPlanId(goldPlan.id);
        } else if (data.length > 0) {
          setSelectedPlanId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load plans:", err);
    }
  };

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

  const currentSelectedPlan = plans.find(p => p.id === selectedPlanId);
  const planMinutes = currentSelectedPlan ? currentSelectedPlan.lecture_quota : 0;
  const totalMinsCalculated = (addToExisting && lookupUser?.quota_remaining ? lookupUser.quota_remaining : 0) + planMinutes + (Number(customBonusMinutes) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-l from-indigo-50/50 via-transparent to-transparent dark:from-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>تفعيل باقة وشحن رصيد لعميل</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">
                  Google Account
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                أدخل إيميل جوجل الخاص بالعميل واختر الباقة لإيداع الدقائق في حسابه فوراً
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Result Alert if available */}
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
                <p className="font-bold text-sm mb-1">{resultMessage.text}</p>
                {resultMessage.details && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white/60 dark:bg-black/30 font-mono text-[11px] space-y-1">
                    <p>• الحساب: {resultMessage.details.email}</p>
                    <p>• الباقة المفعلة: {resultMessage.details.plan_name}</p>
                    <p>• الرصيد الإجمالي الجديد: {resultMessage.details.total_quota} دقيقة ذكية</p>
                    {resultMessage.details.expires_at && (
                      <p>• الصلاحية حتى: {new Date(resultMessage.details.expires_at).toLocaleDateString("ar-EG")}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1. Customer Email Field with Live Check */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>بريد جوجل للعميل (Google Email):</span>
              <span className="text-[10px] text-slate-400">البريد الذي يدخل به الطالب إلى المنصة</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="email"
                  required
                  placeholder="مثال: student@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (lookupUser) setLookupUser(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition dir-ltr text-right"
                />
              </div>
              <button
                type="button"
                onClick={() => handleLookup()}
                disabled={lookupLoading || !email.trim()}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {lookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>فحص الحساب</span>
              </button>
            </div>

            {/* Lookup result status box */}
            {lookupError && (
              <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{lookupError}</span>
              </p>
            )}

            {lookupUser && (
              <div className="mt-2.5 p-3 rounded-2xl border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{lookupUser.full_name || lookupUser.email}</span>
                  </div>
                  {lookupUser.exists ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      مسجل في المنظومة ✅
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                      حساب جديد (سيتم تهيئته) 🚀
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">الباقة الحالية: </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{lookupUser.current_plan || "بدون باقة"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">الرصيد المتبقي: </span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{lookupUser.quota_remaining || 0} دقيقة</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Select Subscription Plan */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>اختر الباقة المراد تفعيلها:</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                {plans.length} باقات متوفرة
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                const isGold = p.name.includes("الذهبية") || p.lecture_quota >= 2000;
                const isMidterm = p.name.includes("الميدتيرم") || p.lecture_quota === 900;
                
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {isGold && (
                      <span className="absolute left-2.5 top-2.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-xs flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />
                        الأقوى 🌟
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-400"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {p.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.period_type === "weekly" ? "أسبوعية" : (isGold ? "فصل كامل (120 يوم)" : "شهرية (30 يوم)")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">
                        {p.lecture_quota} دقيقة
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        {p.price_ils} شيكل
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Option: Custom minutes only without specific plan */}
              <button
                type="button"
                onClick={() => setSelectedPlanId("custom_only")}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedPlanId === "custom_only"
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedPlanId === "custom_only" ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-400"
                    }`}>
                      {selectedPlanId === "custom_only" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                      رصيد دقائق مخصص فقط
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    شحن يدوي بعدد دقائق تحدده أنت دون ربط بباقة
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-black text-amber-600 dark:text-amber-400 text-xs">
                    مخصص
                  </span>
                  <span className="text-[10px] text-slate-400">بدون تسعيرة ثابتة</span>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Bonus Minutes & Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                {selectedPlanId === "custom_only" ? "عدد الدقائق المراد شحنها:" : "دقائق إضافية / بونص (اختياري):"}
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  step="5"
                  value={customBonusMinutes || ""}
                  placeholder={selectedPlanId === "custom_only" ? "مثال: 500" : "0"}
                  onChange={(e) => setCustomBonusMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">دقيقة</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                طريقة احتساب الرصيد:
              </label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input 
                    type="radio"
                    name="mode"
                    checked={!addToExisting}
                    onChange={() => setAddToExisting(false)}
                    className="accent-indigo-600"
                  />
                  <span>ضبط رصيد جديد للباقة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input 
                    type="radio"
                    name="mode"
                    checked={addToExisting}
                    onChange={() => setAddToExisting(true)}
                    className="accent-indigo-600"
                  />
                  <span>إضافة وتراكم فوق الرصيد الحالي</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Live Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-200 dark:border-indigo-500/20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">
                إجمالي الدقائق بعد الاعتماد والتفعيل:
              </span>
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <span>{totalMinsCalculated}</span>
                <span className="text-xs font-bold text-slate-500">دقيقة ذكية</span>
              </span>
            </div>

            <div className="text-left text-xs font-bold text-slate-600 dark:text-slate-400">
              <p>الباقة: <span className="text-slate-900 dark:text-white">{currentSelectedPlan?.name || "رصيد مخصص"}</span></p>
              <p>الصلاحية: <span className="text-slate-900 dark:text-white">
                {currentSelectedPlan?.period_type === "weekly" ? "أسبوع كامل" : (currentSelectedPlan?.name.includes("الذهبية") ? "فصل كامل (4 شهور)" : "شهر كامل")}
              </span></p>
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
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تفعيل الاشتراك والشحن...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
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

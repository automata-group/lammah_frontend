"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { 
  Loader2, CheckCircle2, MessageCircle, Crown, Zap, 
  Sparkles, Phone, User, ArrowLeft, ShieldCheck 
} from "lucide-react";

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

export default function CheckoutPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const { user, session, loading } = useAuth();
  const router = useRouter();
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+970");
  const [customCountryCode, setCustomCountryCode] = useState("+");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth?redirect=/checkout/${planId}`);
      return;
    }
    
    if (session) {
      fetchOrderInit();
    }
  }, [user, loading, session]);
  
  const fetchOrderInit = async () => {
    try {
      setCheckoutLoading(true);
      // Fetch plan info and user profile
      const quotaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/quota`, {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (quotaRes.ok) {
        const qData = await quotaRes.json();
        if (qData.full_name) setFullName(qData.full_name);
        if (qData.phone_number) {
          const matched = COUNTRY_CODES.find(c => c.code !== "custom" && qData.phone_number.startsWith(c.code));
          if (matched) {
            setSelectedCountryCode(matched.code);
            setPhoneNumber(qData.phone_number.slice(matched.code.length));
          } else {
            setPhoneNumber(qData.phone_number.replace(/\D/g, ""));
          }
        }
      }

      // Fetch plan details
      const plansRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/plans`);
      if (plansRes.ok) {
        const pData = await plansRes.json();
        const allPlans = [...(pData.weekly || []), ...(pData.monthly || [])];
        const current = allPlans.find((p: any) => p.id === planId);
        if (current) {
          setOrderDetails({
            plan_name: current.name,
            amount: current.price_ils,
            order_id: "...",
          });
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getFullDialCode = () => {
    if (selectedCountryCode === "custom") {
      return customCountryCode.trim().startsWith("+") ? customCountryCode.trim() : `+${customCountryCode.trim()}`;
    }
    return selectedCountryCode;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      alert("الرجاء إدخال اسمك لتسهيل المطابقة.");
      return;
    }

    const cleanDigits = phoneNumber.trim().replace(/\D/g, "").replace(/^0+/, "");
    if (!cleanDigits || cleanDigits.length < 7) {
      alert("الرجاء إدخال رقم واتساب صحيح.");
      return;
    }

    const dialCode = getFullDialCode();
    const fullFormattedPhone = `${dialCode}${cleanDigits}`;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/transactions/checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ 
          plan_id: planId,
          full_name: fullName.trim(),
          phone_number: fullFormattedPhone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "حدث خطأ أثناء إرسال الطلب");

      setOrderDetails((prev: any) => ({
        ...prev,
        ...data,
        formattedPhone: fullFormattedPhone
      }));
      setOrderSent(true);
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWhatsAppDirect = () => {
    if (!orderDetails) return;
    const adminPhone = "972598298930";
    const cleanDigits = phoneNumber.trim().replace(/\D/g, "").replace(/^0+/, "");
    const formattedPhone = `${getFullDialCode()}${cleanDigits}`;
    const message = `مرحباً، أود تفعيل اشتراكي في باقة (${orderDetails.plan_name}) بسعر ${orderDetails.amount} ₪.\nالاسم: ${fullName.trim()}\nرقم الطلب: #${orderDetails.order_id}\nرقم الواتساب: ${formattedPhone}\nيرجى تزويدي بطريقة الدفع وتفعيل الباقة.`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const isGoldPlan = orderDetails?.amount === 100 || orderDetails?.plan_name?.includes("النخبة");
  const isMidPlan = orderDetails?.amount === 60 || orderDetails?.plan_name?.includes("التفوق");
  const PlanIcon = isGoldPlan ? Crown : isMidPlan ? Zap : Sparkles;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 p-4 sm:p-8 flex justify-center items-center font-sans transition-colors relative" dir="rtl">
      
      {/* Decorative ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="max-w-md w-full bg-white dark:bg-[#0b0f19] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10"
      >
        {loading || checkoutLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-xs font-bold text-slate-400">جاري تجهيز بيانات الباقة...</span>
          </div>
        ) : error ? (
          <div className="text-center space-y-4">
            <div className="text-rose-500 text-sm font-bold">{error}</div>
            <button onClick={() => router.push("/plans")} className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline">
              العودة للباقات
            </button>
          </div>
        ) : !orderSent ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-md ${
                isGoldPlan 
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                  : isMidPlan
                    ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/30"
                    : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
              }`}>
                <PlanIcon className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                طلب تفعيل الاشتراك
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-500/20">
                <span>{orderDetails?.plan_name}</span>
                <span>•</span>
                <span>{orderDetails?.amount} شيكل</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                أدخل رقم الواتساب الخاص بك وسيتواصل معك فريق لمّاح فوراً لتأكيد وتفعيل الباقة بكل سهولة.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-1.5 text-right">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  اسمك الكامل:
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="مثال: أحمد خليل" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white text-xs font-bold outline-none transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  رقم الواتساب مع مقدمة الدولة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-2.5 text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.country} ({c.code === "custom" ? "مخصص" : c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3 relative">
                    <input 
                      type="tel" 
                      required
                      placeholder="مثال: 599123456" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 pr-10 text-slate-900 dark:text-white text-xs font-mono font-bold outline-none transition text-left"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {selectedCountryCode === "custom" && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">مقدمة دولتك:</span>
                    <input
                      type="text"
                      placeholder="+000"
                      value={customCountryCode}
                      onChange={(e) => setCustomCountryCode(e.target.value)}
                      className="w-24 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-xs font-mono font-bold text-left outline-none"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
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
            </form>

            <div className="pt-2 text-center">
              <button 
                onClick={() => router.push("/plans")} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                العودة لصفحة الباقات
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                تم تسجيل طلبك بنجاح 🎉
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                سنتواصل معك عبر الواتساب فوراً!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                تم تسجيل رقمك <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-black" dir="ltr">{orderDetails?.formattedPhone}</strong> للاشتراك في <strong className="text-slate-900 dark:text-white font-bold">{orderDetails?.plan_name}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="text-slate-400 font-medium">رقم الطلب الخاص بك:</div>
              <div className="font-mono font-black text-base text-indigo-600 dark:text-indigo-400">
                #{orderDetails?.order_id}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsAppDirect}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>راسلنا على واتساب الآن لتسريع التفعيل ⚡</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}

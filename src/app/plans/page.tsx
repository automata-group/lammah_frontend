"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Zap, Crown, Star, Clock, Check } from "lucide-react";

export default function PlansPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any>({ weekly: [], monthly: [] });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribing, setSubscribing] = useState("");
  const [tab, setTab] = useState<"monthly" | "weekly">("monthly");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/subscription/plans`)
      .then(r => r.json())
      .then(data => { setPlans(data); setLoadingPlans(false); })
      .catch(() => setLoadingPlans(false));
  }, []);

  const handleSubscribe = (planId: string) => {
    if (!session) return;
    router.push(`/checkout/${planId}`);
  };

  const icons: Record<string, any> = { 
    "أسبوعي - طالب": Star, "أسبوعي - متقدم": Zap, "أسبوعي - VIP": Crown, 
    "شهري - أساسي": Star, "شهري - متقدم": Zap, "شهري - برو": Crown, "شهري - غير محدود": Crown 
  };
  const colors: Record<string, string> = { 
    "أسبوعي - طالب": "indigo", "شهري - أساسي": "indigo", 
    "أسبوعي - متقدم": "purple", "شهري - متقدم": "purple", 
    "أسبوعي - VIP": "amber", "شهري - برو": "amber", "شهري - غير محدود": "amber" 
  };

  if (loading || !user) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>;

  const activePlans = [
    {
      id: "free_tier",
      name: "التجربة المجانية",
      price_ils: 0,
      lecture_quota: 2,
      features: [
        "تلخيص أول 15 دقيقة فقط",
        "تفريغ حوالي 5 سلايدات",
        "شرح السلايدات ونقاط تركيز",
        "الميزات المتقدمة مغلقة (غير متاحة)"
      ]
    },
    ...(tab === "monthly" ? plans.monthly : plans.weekly)
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-8 pt-12" dir="rtl">
      <div className="max-w-[1400px] mx-auto">
        <button onClick={() => router.push("/dashboard")} className="text-slate-400 hover:text-indigo-300 text-sm mb-8 block transition-colors bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 w-fit">← العودة للوحة التحكم</button>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-l from-indigo-300 to-purple-300">اختر باقتك</h1>
          <p className="text-slate-400">اشترك الآن وابدأ بتلخيص محاضراتك واستخراج الأسئلة عبر محركنا الذكي</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-1.5 flex">
            <button onClick={() => setTab("monthly")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${tab === "monthly" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>
              <Clock className="w-4 h-4 inline ml-1" />شهري
            </button>
            <button onClick={() => setTab("weekly")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${tab === "weekly" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}>
              <Clock className="w-4 h-4 inline ml-1" />أسبوعي
            </button>
          </div>
        </div>

        {message && (
          <div className={`text-center mb-6 p-4 rounded-xl border ${message.includes("✅") || message.includes("🎉") ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>{message}</div>
        )}

        {loadingPlans ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
            {activePlans.map((plan: any, idx: number) => {
              const isFree = plan.id === "free_tier";
              const isBasic = plan.name.includes("أساسي") || plan.name.includes("طالب");
              const isPro = plan.name.includes("متقدم");
              const isVip = plan.name.includes("برو") || plan.name.includes("VIP") || plan.name.includes("غير محدود");
              
              const Icon = isVip ? Crown : isPro ? Zap : isBasic ? Star : Clock;
              
              // Premium gradients and borders based on tier
              let cardClasses = "relative bg-slate-900/60 border rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full ";
              let iconClasses = "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ";
              let buttonClasses = "w-full py-4 rounded-xl font-bold transition-all mt-auto disabled:opacity-50 ";
              
              if (isVip) {
                cardClasses += "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_0_50px_rgba(245,158,11,0.25)]";
                iconClasses += "bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 text-amber-400";
                buttonClasses += "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25";
              } else if (isPro) {
                cardClasses += "border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_50px_rgba(168,85,247,0.25)] transform xl:scale-[1.03] z-10";
                iconClasses += "bg-gradient-to-br from-purple-400/20 to-indigo-600/20 border border-purple-500/30 text-purple-400";
                buttonClasses += "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25";
              } else if (isBasic) {
                cardClasses += "border-indigo-500/30 hover:border-indigo-500/60 shadow-lg";
                iconClasses += "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400";
                buttonClasses += "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700";
              } else {
                cardClasses += "border-slate-700/50 hover:border-slate-600 shadow-lg opacity-90 hover:opacity-100";
                iconClasses += "bg-slate-800 border border-slate-700 text-slate-400";
                buttonClasses += "bg-slate-800/50 text-slate-500 cursor-default border border-slate-800";
              }
              
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className={cardClasses}>
                  
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black px-6 py-1.5 rounded-full shadow-lg shadow-purple-500/20 border border-purple-400/30">
                      الأكثر طلباً 🔥
                    </div>
                  )}
                  
                  {isVip && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-6 py-1.5 rounded-full shadow-lg shadow-amber-500/20 border border-amber-300/30">
                      أفضل قيمة 👑
                    </div>
                  )}

                  <div className={iconClasses}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-2xl font-black mb-2 text-white">{plan.name}</h3>
                  <div className="flex items-baseline mb-8">
                    {isFree ? (
                      <span className="text-4xl font-black text-white">مجاناً</span>
                    ) : (
                      <>
                        <span className="text-5xl font-black text-white">₪{plan.price_ils}</span>
                        <span className="text-slate-500 text-sm mr-2 font-bold">/{tab === "monthly" ? "شهر" : "أسبوع"}</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    <div className="flex items-center text-sm font-medium">
                      <Check className={`w-5 h-5 ml-3 flex-shrink-0 ${isFree ? 'text-slate-500' : isVip ? 'text-amber-400' : isPro ? 'text-purple-400' : 'text-indigo-400'}`} />
                      <span className="font-bold text-white">{plan.lecture_quota} محاضرة</span>
                    </div>
                    
                    {plan.features && (Array.isArray(plan.features) ? plan.features : (() => { try { return JSON.parse(plan.features); } catch { return []; } })()).map((f: string, i: number) => (
                      <div key={i} className="flex items-center text-sm font-medium text-slate-300">
                        <Check className={`w-5 h-5 ml-3 flex-shrink-0 ${isFree ? 'text-slate-600' : 'text-emerald-400'}`} />
                        <span>{f}</span>
                      </div>
                    ))}
                    
                    {(!isBasic && !isFree) && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className={`flex items-center text-xs font-bold uppercase tracking-widest mb-2 ${isVip ? 'text-amber-300' : 'text-purple-300'}`}>
                          <Zap className="w-3 h-3 ml-1" /> الشات الذكي المدعوم بـ AI
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-300">
                          <Check className={`w-5 h-5 ml-3 flex-shrink-0 ${isVip ? 'text-amber-400' : 'text-purple-400'}`} />
                          <span>
                            {isPro ? "40 رسالة ذكية لكل محاضرة" : "رسائل غير محدودة (100+) لكل محاضرة"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={() => plan.id !== "free_tier" && handleSubscribe(plan.id)} disabled={!!subscribing || plan.id === "free_tier"}
                    className={buttonClasses}>
                    {subscribing === plan.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : plan.id === "free_tier" ? "مفعلة تلقائياً" : "اشترك الآن"}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

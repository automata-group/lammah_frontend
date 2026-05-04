"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap, Crown, Star, Clock, Check, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<any>({ weekly: [], monthly: [] });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [tab, setTab] = useState<"monthly" | "weekly">("monthly");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.lammah.site"}/api/v1/subscription/plans`)
      .then(r => r.json())
      .then(data => { setPlans(data); setLoadingPlans(false); })
      .catch(() => setLoadingPlans(false));
  }, []);

  const freePlanFeatures = [
    { text: "تلخيص أول 15 دقيقة فقط", included: true },
    { text: "تفريغ حوالي 5 سلايدات", included: true },
    { text: "شرح السلايدات ونقاط تركيز", included: true },
    { text: "الشات الذكي مع المحاضرة", included: false },
    { text: "تحميل الملزمة الذكية PDF", included: false },
    { text: "الميزات المتقدمة", included: false },
  ];

  const activePlans = [
    { id: "free_tier", name: "التجربة المجانية", price_ils: 0, lecture_quota: 1, features: freePlanFeatures },
    ...(tab === "monthly" ? plans.monthly : plans.weekly)
  ];

  return (
    <section id="pricing" className="relative z-10 py-32 px-6 border-t border-slate-800/50 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">خطط الاشتراك</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">خطط تناسب طموحك</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">استثمر في مستقبلك الأكاديمي بأسعار مدروسة تناسب الجميع.</p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-14">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-1 shadow-xl">
            <button onClick={() => setTab("monthly")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${tab === "monthly" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-white"}`}>
              <Clock className="w-4 h-4 inline ml-2" />شهري
            </button>
            <button onClick={() => setTab("weekly")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${tab === "weekly" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-white"}`}>
              <Clock className="w-4 h-4 inline ml-2" />أسبوعي
            </button>
          </div>
        </div>

        {loadingPlans ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" /></div>
        ) : activePlans && activePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start pt-6">
            {activePlans.map((plan: any, idx: number) => {
              const isFree = plan.id === "free_tier";
              const isBasic = plan.name.includes("أساسي") || plan.name.includes("طالب");
              const isPro = plan.name.includes("متقدم");
              const isVip = plan.name.includes("برو") || plan.name.includes("VIP") || plan.name.includes("غير محدود");
              const Icon = isVip ? Crown : isPro ? Zap : Star;

              // Build features list for paid plans
              let featuresList: { text: string; included: boolean; highlight?: boolean }[] = [];
              if (isFree) {
                featuresList = plan.features;
              } else {
                const raw = Array.isArray(plan.features)
                  ? plan.features
                  : (() => { try { return JSON.parse(plan.features); } catch { return []; } })();
                featuresList = raw.map((f: string) => ({ text: f, included: true }));
                if (!isBasic) {
                  featuresList.push({
                    text: isPro ? "40 رسالة ذكية لكل محاضرة" : "رسائل ذكية غير محدودة",
                    included: true,
                    highlight: true,
                  });
                }
              }

              const gradientBorder = isPro
                ? "bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-900 shadow-[0_0_50px_rgba(168,85,247,0.25)]"
                : isVip
                ? "bg-gradient-to-b from-amber-400 via-orange-500 to-amber-800 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
                : isBasic
                ? "bg-gradient-to-b from-indigo-500/40 to-slate-800/20"
                : "bg-slate-800/40";

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative rounded-[2rem] p-[1px] ${gradientBorder} ${isPro ? "scale-[1.04] z-10" : ""}`}
                >
                  {/* Badges */}
                  {isPro && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg shadow-purple-500/30 border border-purple-300/20 whitespace-nowrap z-20">
                      🔥 الأكثر طلباً
                    </div>
                  )}
                  {isVip && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg shadow-amber-500/30 border border-amber-300/20 whitespace-nowrap z-20">
                      👑 أفضل قيمة
                    </div>
                  )}

                  {/* Card body */}
                  <div className="rounded-[1.9rem] p-8 h-full flex flex-col bg-slate-900/90 backdrop-blur-xl">

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      isPro ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30" :
                      isVip ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30" :
                      isBasic ? "bg-indigo-500/10 border border-indigo-500/20" :
                      "bg-slate-800 border border-slate-700"
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        isPro ? "text-purple-400" :
                        isVip ? "text-amber-400" :
                        isBasic ? "text-indigo-400" :
                        "text-slate-500"
                      }`} />
                    </div>

                    {/* Name */}
                    <h3 className="text-2xl font-black mb-3 text-white">{plan.name}</h3>

                    {/* Price */}
                    <div className="flex items-baseline mb-8">
                      {isFree ? (
                        <span className="text-4xl font-black text-white">مجاناً</span>
                      ) : (
                        <>
                          <span className={`text-5xl font-black ${isPro ? "text-purple-300" : isVip ? "text-amber-300" : "text-white"}`}>
                            ₪{plan.price_ils}
                          </span>
                          <span className="text-slate-500 text-sm mr-2 font-bold">/{tab === "monthly" ? "شهر" : "أسبوع"}</span>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className={`h-px mb-6 ${isPro ? "bg-purple-500/20" : isVip ? "bg-amber-500/20" : "bg-slate-800"}`} />

                    {/* Quota */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isFree ? "bg-slate-800 border border-slate-700" : "bg-emerald-500/20 border border-emerald-500/30"
                      }`}>
                        <Check className={`w-3 h-3 ${isFree ? "text-slate-500" : "text-emerald-400"}`} />
                      </div>
                      <span className="text-sm font-bold text-white">{plan.lecture_quota} محاضرة</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8 flex-1">
                      {featuresList.map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            !f.included ? "bg-slate-800/50 border border-slate-800" :
                            f.highlight
                              ? isPro ? "bg-purple-500/20 border border-purple-500/30" : "bg-amber-500/20 border border-amber-500/30"
                              : isFree ? "bg-slate-800 border border-slate-700" : "bg-emerald-500/20 border border-emerald-500/30"
                          }`}>
                            {f.included
                              ? <Check className={`w-3 h-3 ${
                                  f.highlight ? (isPro ? "text-purple-400" : "text-amber-400") :
                                  isFree ? "text-slate-500" : "text-emerald-400"
                                }`} />
                              : <X className="w-3 h-3 text-slate-700" />
                            }
                          </div>
                          <span className={`text-sm font-medium ${
                            !f.included ? "text-slate-600 line-through" :
                            f.highlight ? (isPro ? "text-purple-300 font-bold" : "text-amber-300 font-bold") :
                            isFree ? "text-slate-500" : "text-slate-300"
                          }`}>
                            {f.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => router.push(isFree ? "/register" : "/login")}
                      disabled={isFree}
                      className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${
                        isFree
                          ? "bg-slate-800/50 text-slate-600 cursor-default border border-slate-800"
                          : isPro
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                          : isVip
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25"
                          : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                      }`}
                    >
                      {isFree ? "مفعلة تلقائياً للمسجلين" : "ابدأ الآن ←"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-500">لا توجد خطط متاحة حالياً.</div>
        )}
      </div>
    </section>
  );
}

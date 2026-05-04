"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap, Crown, Star, Clock, Check, X, Sparkles, ArrowRight } from "lucide-react";
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
    <section id="pricing" className="relative z-10 py-32 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">اختر خطتك المثالية</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500"
          >
            استثمر في نجاحك
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-400 text-lg max-w-xl mx-auto font-medium"
          >
            وفر وقتك وجهدك مع لمّاح. اختر الباقة التي تناسب حجم دراستك وطموحك الأكاديمي.
          </motion.p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-20">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-1.5 rounded-3xl flex gap-1 shadow-2xl">
            {["monthly", "weekly"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as any)}
                className={`relative px-10 py-3.5 rounded-2xl font-black text-sm transition-all duration-500 ${
                  tab === t ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t === "monthly" ? "اشتراك شهري" : "اشتراك أسبوعي"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loadingPlans ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse">جاري تحميل العروض...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {activePlans.map((plan: any, idx: number) => {
              const isFree = plan.id === "free_tier";
              const isPro = plan.name.includes("أسبوعي - متقدم") || plan.name.includes("شهري - متقدم");
              const isVip = plan.name.includes("VIP") || plan.name.includes("برو");
              const Icon = isVip ? Crown : isPro ? Zap : Star;

              // Features processing
              let featuresList = isFree ? plan.features : [];
              if (!isFree) {
                const raw = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || "[]");
                featuresList = raw.map((f: string) => ({ text: f, included: true }));
                if (isPro || isVip) {
                  featuresList.push({ text: isVip ? "رسائل ذكية غير محدودة" : "40 رسالة ذكية / محاضرة", included: true, highlight: true });
                }
              }

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="relative h-full"
                >
                  <div className={`h-full flex flex-col glass rounded-[2.5rem] p-8 transition-all duration-500 ${
                    isVip ? 'border-amber-500/30 shadow-[0_20px_50px_rgba(245,158,11,0.1)]' :
                    isPro ? 'border-indigo-500/30 shadow-[0_20px_50px_rgba(99,102,241,0.1)]' :
                    'border-white/5 hover:border-white/10'
                  }`}>
                    
                    {/* Badge */}
                    {isVip && (
                      <div className="absolute -top-4 right-10 bg-gradient-to-r from-amber-400 to-orange-600 text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl uppercase tracking-tighter">
                        الملكـي
                      </div>
                    )}
                    {isPro && (
                      <div className="absolute -top-4 right-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl uppercase tracking-tighter">
                        الأكثر تميزاً
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-12 ${
                      isVip ? 'bg-amber-500/20 text-amber-400' :
                      isPro ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-white/5 text-slate-400'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                    
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-black text-white">
                        {isFree ? '0' : `₪${plan.price_ils}`}
                      </span>
                      {!isFree && <span className="text-slate-500 text-sm font-bold">/ {tab === "monthly" ? "شهر" : "أسبوع"}</span>}
                    </div>

                    <div className="space-y-4 mb-10 flex-1">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        {plan.lecture_quota} محاضرات ذكية
                      </div>
                      
                      {featuresList.map((f: any, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            !f.included ? 'bg-white/5 opacity-30' :
                            f.highlight ? 'bg-indigo-500/20' : 'bg-white/5'
                          }`}>
                            {f.included ? <Check className={`w-3 h-3 ${f.highlight ? 'text-indigo-400' : 'text-slate-400'}`} /> : <X className="w-3 h-3 text-slate-600" />}
                          </div>
                          <span className={`text-sm ${
                            !f.included ? 'text-slate-600 line-through' :
                            f.highlight ? 'text-indigo-300 font-bold' : 'text-slate-400'
                          }`}>
                            {f.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => isFree ? router.push("/register") : router.push("/login")}
                      disabled={isFree}
                      className={`w-full py-5 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                        isFree ? 'bg-white/5 text-slate-500 cursor-default' :
                        isVip ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:opacity-90' :
                        isPro ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40' :
                        'bg-white/10 hover:bg-white/15 text-white'
                      }`}
                    >
                      {isFree ? "باقة افتراضية" : (
                        <>
                          اشترك الآن
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-slate-500 text-sm font-medium">
            لديك مؤسسة تعليمية؟ <button className="text-indigo-400 font-black hover:underline">تواصل معنا لطلب عرض مخصص ←</button>
          </p>
        </div>
      </div>
    </section>
  );
}

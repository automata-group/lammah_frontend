"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Zap, Crown, Star, Clock, Check } from "lucide-react";
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

  const icons: Record<string, any> = { 
    "أسبوعي - طالب": Star, "أسبوعي - متقدم": Zap, "أسبوعي - VIP": Crown, 
    "شهري - أساسي": Star, "شهري - متقدم": Zap, "شهري - برو": Crown, "شهري - غير محدود": Crown 
  };
  const colors: Record<string, string> = { 
    "أسبوعي - طالب": "indigo", "شهري - أساسي": "indigo", 
    "أسبوعي - متقدم": "purple", "شهري - متقدم": "purple", 
    "أسبوعي - VIP": "amber", "شهري - برو": "amber", "شهري - غير محدود": "amber" 
  };

  const activePlans = tab === "monthly" ? plans.monthly : plans.weekly;

  return (
    <section id="pricing" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/50">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black mb-4">خطط تناسب طموحك</h2>
        <p className="text-slate-500 font-medium">استثمر في مستقبلك الأكاديمي مع أسعار مدروسة تناسب الجميع.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-1.5 flex shadow-lg">
          <button onClick={() => setTab("monthly")}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${tab === "monthly" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"}`}>
            <Clock className="w-4 h-4 inline ml-2" />شهري
          </button>
          <button onClick={() => setTab("weekly")}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${tab === "weekly" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-white"}`}>
            <Clock className="w-4 h-4 inline ml-2" />أسبوعي
          </button>
        </div>
      </div>

      {loadingPlans ? (
        <div className="text-center py-20"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" /></div>
      ) : activePlans && activePlans.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          {activePlans.map((plan: any, idx: number) => {
            const Icon = icons[plan.name] || Star;
            const color = colors[plan.name] || "indigo";
            const isPopular = idx === 1;
            
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className={`relative bg-slate-900/40 border rounded-[2rem] p-8 backdrop-blur-md transition-all hover:scale-[1.02] ${isPopular ? "border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]" : "border-slate-800 hover:border-indigo-500/30"}`}>
                
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black px-6 py-2 rounded-full shadow-lg shadow-purple-500/20">
                    الأكثر طلباً 🔥
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 text-${color}-400`} />
                </div>

                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-black text-white">₪{plan.price_ils}</span>
                  <span className="text-slate-500 text-sm mr-2 font-bold">/{tab === "monthly" ? "شهر" : "أسبوع"}</span>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center text-sm text-slate-300 font-medium">
                    <Check className="w-5 h-5 text-indigo-400 ml-3 flex-shrink-0" />
                    <span className="font-bold text-white">{plan.lecture_quota} محاضرة</span>
                  </div>
                  {plan.features && (Array.isArray(plan.features) ? plan.features : (() => { try { return JSON.parse(plan.features); } catch { return []; } })()).map((f: string, i: number) => (
                    <div key={i} className="flex items-center text-sm text-slate-400 font-medium">
                      <Check className="w-5 h-5 text-emerald-400 ml-3 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <div className="flex items-center text-sm text-slate-400 font-medium">
                    <Check className="w-5 h-5 text-amber-400 ml-3 flex-shrink-0" />
                    <span>
                      {plan.name.includes("متقدم") ? "40 رسالة ذكية لكل محاضرة" : 
                       (plan.name.includes("VIP") || plan.name.includes("برو") || plan.name.includes("غير محدود")) ? "رسائل غير محدودة للمحاضرة" : 
                       "15 رسالة ذكية لكل محاضرة"}
                    </span>
                  </div>
                </div>

                <button onClick={() => router.push("/login")}
                  className={`w-full py-4 rounded-2xl font-black transition-all ${isPopular ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]" : "bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-[0.98]"}`}>
                  ابدأ الآن
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-slate-500">لا توجد خطط متاحة حالياً.</div>
      )}
    </section>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Crown, Zap, Sparkles, Check, ArrowRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<any>({ weekly: [], monthly: [] });
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/plans`)
      .then(r => r.json())
      .then(data => { setPlans(data); setLoadingPlans(false); })
      .catch(() => setLoadingPlans(false));
  }, []);

  const getFriendlyPlanName = (name: string) => {
    if (!name || name === "مجاني") return "الباقة المجانية (Free)";
    if (name.includes("الذهبية") || name === "الباقة الذهبية") return "باقة النخبة (Elite)";
    if (name.includes("الميدتيرم") || name === "باقة الميدتيرم") return "باقة التفوق (Premium)";
    if (name.includes("الإنقاذ") || name === "باقة الإنقاذ") return "الباقة الأساسية (Essential)";
    return name;
  };

  const activePlans = [
    ...[...(plans.weekly || []), ...(plans.monthly || [])].filter((p: any) => p.name.includes("باقة"))
  ].sort((a: any, b: any) => a.price_ils - b.price_ils);

  return (
    <section id="pricing" className="relative z-10 py-32 px-6 overflow-hidden">
      {/* Background glowing elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/[0.04] rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-4 py-2 rounded-full mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300 uppercase tracking-widest">باقات شحن الدقائق ⏱️</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight"
          >
            استثمر في نجاحك
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-400 text-lg max-w-xl mx-auto font-medium"
          >
            اختر الباقة المناسبة لتفريغ محاضراتك وتوليد ملازمك الذكية بسهولة وسرعة. وفر وقتك وجهدك مع لمّاح.
          </motion.p>
        </div>

        {loadingPlans ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse">جاري تحميل الباقات...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {activePlans.map((plan: any, idx: number) => {
              const isGoldPlan = plan.price_ils === 100 || plan.name.includes("الذهبية");
              const isMidPlan = plan.price_ils === 60 || plan.name.includes("الميدتيرم");
              const isRescuePlan = plan.price_ils === 25 || plan.name.includes("الإنقاذ");
              
              let subtitle = "لتصفح المتجر والمذاكرة السريعة.";
              if (isGoldPlan) {
                subtitle = "باقة البائع الكاملة! توليد غير محدود لدفاتر البيع مع طباعة حقوق ملكيتك.";
              } else if (isMidPlan) {
                subtitle = "شحنة دقائق متكاملة للمذاكرة الفائقة وتصفح المتجر طوال الفصل الدراسي.";
              } else if (isRescuePlan) {
                subtitle = "مثالية لشحن دقائقك سريعاً عند اقتراب الامتحانات وتصفح المتجر.";
              }

              const Icon = isGoldPlan ? Crown : isMidPlan ? Zap : isRescuePlan ? Sparkles : Star;

              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className={`relative bg-[#0A0D14]/80 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-300 group h-full shadow-[0_20px_80px_rgba(0,0,0,0.4)] ${
                    isGoldPlan 
                      ? "border border-amber-500/30 bg-gradient-to-b from-[#0A0D14] to-amber-950/10 scale-100 lg:scale-[1.03] ring-1 ring-amber-500/20" 
                      : isMidPlan
                        ? "border border-purple-500/20 hover:border-purple-500/40 ring-1 ring-white/5"
                        : "border border-white/5 hover:border-white/10 ring-1 ring-white/5"
                  }`}
                >
                  
                  {isGoldPlan && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[11px] font-black px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap uppercase tracking-widest">
                      ⭐ باقة البائعين المتكاملة
                    </div>
                  )}

                  {isMidPlan && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[11px] font-black px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap uppercase tracking-widest">
                      🔥 الأكثر اختياراً
                    </div>
                  )}

                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                      isGoldPlan ? 'bg-amber-500/20 text-amber-400' :
                      isMidPlan ? 'bg-purple-500/20 text-purple-400' :
                      'bg-white/5 text-slate-400'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2">{getFriendlyPlanName(plan.name)}</h3>
                    <p className="text-xs text-slate-400 font-bold mb-8 leading-relaxed h-10">{subtitle}</p>

                    <div className="flex items-baseline mb-8">
                      <span className="text-5xl font-black text-white tracking-tight">₪{plan.price_ils}</span>
                      <span className="text-slate-500 text-xs font-bold mr-2">/ دفعة لمرة واحدة</span>
                    </div>

                    <div className="w-full h-px bg-white/10 mb-8" />

                    <div className="space-y-4 mb-10 flex-1">
                      <div className="flex items-start text-xs font-bold text-slate-200 gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span><span className="text-emerald-400">⏱️ {plan.lecture_quota} دقيقة</span> تفريغ ومعالجة ذكية</span>
                      </div>

                      <div className="flex items-start text-xs font-bold text-slate-200 gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-slate-300" />
                        </div>
                        <span>📚 تصفح كامل المتجر وشراء الملازم</span>
                      </div>

                      <div className="flex items-start text-xs font-bold text-slate-200 gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-slate-300" />
                        </div>
                        <span>✨ توليد تلقائي: بطاقات، امتحان، نقاط التركيز</span>
                      </div>

                      <div className="flex items-start text-xs font-bold text-slate-200 gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-slate-300" />
                        </div>
                        <span>
                          {isGoldPlan ? "💬 محادثة ذكية (100 رسالة إجمالاً لكافة محاضراتك)" : isMidPlan ? "💬 محادثة ذكية (25 رسالة إجمالاً لكافة محاضراتك)" : "💬 محادثة ذكية (5 رسائل إجمالاً لكافة محاضراتك)"}
                        </span>
                      </div>

                      <div className="flex items-start text-xs font-bold gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isGoldPlan ? 'bg-amber-500/20' : 'bg-white/10'}`}>
                          <Check className={`w-3 h-3 ${isGoldPlan ? 'text-amber-400' : 'text-slate-500'}`} />
                        </div>
                        <span className={isGoldPlan ? "text-amber-300" : "text-slate-500 line-through opacity-70"}>
                          💰 نشر وبيع ملازمك لجني أرباح حقيقية 🔓
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push("/register")}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 mt-auto flex items-center justify-center gap-2 shadow-md ${
                        isGoldPlan 
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950" 
                          : isMidPlan
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                            : "bg-white/10 hover:bg-white/15 text-white"
                      }`}
                  >
                    {isGoldPlan ? "ابدأ كبائع الآن" : "اشترك الآن"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-slate-500 text-sm font-medium">
            لديك مؤسسة تعليمية؟ <a href="mailto:support@lammah.site" className="text-indigo-400 font-black hover:underline transition-colors">تواصل معنا لطلب عرض مخصص ←</a>
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Crown, Zap, Sparkles, Check, ArrowRight, Star, Lock, Mic, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SubscriptionContactModal from "@/components/SubscriptionContactModal";

const DEFAULT_PLANS = {
  weekly: [],
  monthly: [
    { id: "f5aa8bae-7a95-4902-9167-7d217221627d", name: "باقة إنقاذ الكويزات (Essential)", price_ils: 25, duration_days: 30, minutes: 800, lecture_quota: 800 },
    { id: "f1f25974-6495-42e2-bb31-70b3b9796a8e", name: "باقة التفوق (Premium)", price_ils: 60, duration_days: 30, minutes: 2200, lecture_quota: 2200 },
    { id: "7e17c4ba-0830-4f91-88da-7d6440d22123", name: "باقة النخبة (Elite)", price_ils: 100, duration_days: 30, minutes: 4500, lecture_quota: 4500 }
  ]
};

export default function PricingSection() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [plans, setPlans] = useState<any>(DEFAULT_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/plans`)
      .then(r => r.json())
      .then(data => { 
        if (data && (data.weekly?.length || data.monthly?.length)) {
          setPlans(data); 
        }
        setLoadingPlans(false); 
      })
      .catch(() => setLoadingPlans(false));
  }, []);

  const getFriendlyPlanName = (name: string) => {
    if (!name || name === "مجاني" || name === "free" || name.includes("بدون")) return "بدون باقة نشطة";
    if (name.includes("الذهبية") || name.includes("النخبة") || name.includes("Elite")) return "باقة النخبة (Elite)";
    if (name.includes("الميدتيرم") || name.includes("التفوق") || name.includes("Premium")) return "باقة التفوق (Premium)";
    if (name.includes("الإنقاذ") || name.includes("إنقاذ") || name.includes("Essential")) return "باقة إنقاذ الكويزات (Essential)";
    return name;
  };

  const activePlans = [
    ...[...(plans.weekly || []), ...(plans.monthly || [])].filter((p: any) => p.name.includes("باقة"))
  ].sort((a: any, b: any) => a.price_ils - b.price_ils);

  return (
    <section id="pricing" className="relative scroll-mt-24 z-10 py-20 sm:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Background glowing elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 overflow-visible">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-4 pb-6 pt-2 text-slate-900 dark:text-white tracking-tight leading-[1.8] sm:leading-[1.5] overflow-visible">
            <span className="block sm:inline">استثمر في راحتك</span>{" "}
            <span className="block sm:inline mt-2.5 sm:mt-0 text-indigo-600 dark:text-indigo-400">
              وتفوقك الدراسي
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            من التلخيص الأكاديمي السريع قبل الامتحانات إلى توليد أفخم الدفاتر الملونة القابلة للطباعة وبيعها بالمتجر للأرباح!
          </p>
        </div>

        {loadingPlans ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold text-sm animate-pulse">جاري تحميل الباقات...</p>
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-5 lg:gap-6 items-stretch max-w-6xl mx-auto overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scroll-smooth scrollbar-none touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch] scroll-px-4 sm:scroll-px-6 pb-6 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {activePlans.map((plan: any) => {
              const isGoldPlan = plan.price_ils === 100 || plan.name.includes("الذهبية") || plan.name.includes("النخبة") || plan.name.includes("Elite");
              const isMidPlan = plan.price_ils === 60 || plan.name.includes("الميدتيرم") || plan.name.includes("التفوق") || plan.name.includes("Premium");
              const isRescuePlan = plan.price_ils === 25 || plan.name.includes("الإنقاذ") || plan.name.includes("إنقاذ") || plan.name.includes("Essential");

              let subtitle = "لتصفح المتجر والمذاكرة السريعة.";
              if (isGoldPlan) {
                subtitle = "الباقة الشاملة لأوائل الدفعات لتغطية مساقات الفصل بالكامل، مع ميزة توليد دفاتر الإنقاذ ورخصة بيع الملخصات بالمتجر.";
              } else if (isMidPlan) {
                subtitle = "الاشتراك الشهري الأكثر طلباً لتوديع تراكم المواد، برصيد ضخم يغطي 3 إلى 4 مساقات شهرياً بكل أريحية.";
              } else if (isRescuePlan) {
                subtitle = "شحنة إنقاذ مركزة وسريعة للميدتيرم والكويزات، تكفي لتلخيص أصعب الشابترات قبل دخول قاعة الامتحان.";
              }

              const Icon = isGoldPlan ? Crown : isMidPlan ? Zap : Sparkles;
              const periodText = isGoldPlan ? "للفصل كاملاً" : "شهرياً";

              return (
                <div 
                  key={plan.id}
                  className={`relative shrink-0 w-[290px] sm:w-[330px] md:w-auto snap-start bg-white dark:bg-[#0c111d] rounded-3xl p-5 sm:p-6 md:p-7 flex flex-col justify-between transition-all duration-300 group ${
                    isGoldPlan 
                      ? "border border-amber-300/80 dark:border-amber-500/30 shadow-md shadow-amber-500/5 hover:border-amber-400 dark:hover:border-amber-500/50 md:-translate-y-1.5" 
                      : isMidPlan
                        ? "border-2 border-indigo-500 dark:border-indigo-400 shadow-xl shadow-indigo-500/10 hover:border-indigo-600 md:-translate-y-2.5"
                        : "border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Floating Sleek Badges */}
                  {isGoldPlan && (
                    <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap tracking-wide">
                      <Star className="w-3 h-3 fill-white" /> باقة النخبة • رصيد 75 ساعة
                    </div>
                  )}

                  {isMidPlan && (
                    <div className="absolute -top-3.5 right-6 bg-indigo-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 whitespace-nowrap tracking-wide">
                      <Zap className="w-3 h-3 fill-white" /> الأكثر طلباً • رصيد 37 ساعة
                    </div>
                  )}

                  {isRescuePlan && (
                    <div className="absolute -top-3.5 right-6 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold px-3.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                      شحن الكويزات • 13.5 ساعة
                    </div>
                  )}

                  <div>
                    {/* Header: Icon + Price */}
                    <div className="flex justify-between items-start mb-3 pt-1">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs border transition-transform duration-300 group-hover:scale-105 ${
                        isGoldPlan ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                        isMidPlan ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="text-left" dir="ltr">
                        <div className="flex items-baseline">
                          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">₪{plan.price_ils}</span>
                        </div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block text-right mt-0.5">{periodText}</span>
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">{getFriendlyPlanName(plan.name)}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 leading-relaxed min-h-[2.5rem]">{subtitle}</p>

                    {/* Single Harmonious Capacity Box (No Eye-Straining Nested Boxes) */}
                    <div className="rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] p-3.5 border border-slate-200/70 dark:border-white/5 space-y-2.5 text-right mb-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {plan.lecture_quota} دقيقة ذكية ({isGoldPlan ? "75 ساعة" : isMidPlan ? "37 ساعة" : "13.5 ساعة"})
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          صلاحية {plan.duration_days || 30} يوم
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Mic className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          <span>{isGoldPlan ? "تكفي حتى 100 محاضرة" : isMidPlan ? "تكفي حتى 50 محاضرة" : "تكفي حتى 18 محاضرة"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <FileText className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <span>{isGoldPlan ? "أو 300 ملف سلايدات" : isMidPlan ? "أو 150 ملف سلايدات" : "أو 50 ملف سلايدات"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-6 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug"><strong>تخطيط وتظليل السلايدات</strong> وكتابة كل ما قاله الدكتور</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug"><strong>صيد ما ركز عليه الدكتور</strong> وتحديد أسئلة الامتحان المتوقعة</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug"><strong>شرح عربي مخلط إنجليزي</strong> لتبسيط المصطلحات المعقدة</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug"><strong>تنزيل ملفات PDF</strong> عالية الجودة للطباعة أو المذاكرة من الجوال</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug"><strong>الحزمة التفاعلية:</strong> فلاش كاردز + كويزات + شات ذكي ({isGoldPlan ? "100 سؤال" : isMidPlan ? "35 سؤال" : "15 سؤال"})</span>
                      </div>

                      {/* Points 7 & 8: Notebooks & Marketplace Seller (Only for 100 NIS plan, locked on others) */}
                      {isGoldPlan ? (
                        <>
                          <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                            <div className="mt-0.5 w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                            <span className="leading-snug">⭐ <strong>دفتر الإنقاذ الشامل:</strong> مخصص لزنقة الامتحان وجاهز للطباعة فوراً</span>
                          </div>

                          <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                            <div className="mt-0.5 w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                            <span className="leading-snug">⭐ <strong>رخصة بائع معتمد:</strong> نشر وبيع ملخصاتك بالمتجر وتحقيق أرباح عبر ريفلكت</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 text-[11px]">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>دفتر الإنقاذ الشامل ورخصة بيع الملخصات (خاصة بباقة النخبة 100 ₪)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedPlanForModal(plan);
                      setShowContactModal(true);
                    }}
                    className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 mt-auto flex items-center justify-center gap-2 relative overflow-hidden cursor-pointer ${
                      isGoldPlan 
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 hover:-translate-y-0.5 font-black" 
                        : isMidPlan
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:-translate-y-0.5"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 hover:-translate-y-0.5"
                    }`}
                  >
                    <span>{isGoldPlan ? "اشترك في باقة النخبة (100 ₪)" : isMidPlan ? "اشترك في باقة التفوق (60 ₪)" : "شحن باقة الإنقاذ (25 ₪)"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Subscription Contact Modal */}
      <SubscriptionContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        plan={selectedPlanForModal}
        initialFullName={user?.user_metadata?.full_name || ""}
        initialPhone={user?.phone || ""}
        sessionToken={session?.access_token}
      />
    </section>
  );
}

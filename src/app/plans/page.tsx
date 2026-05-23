"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Loader2, BookOpen, Zap, Crown, Star, Clock, Check, 
  ArrowLeft, Sparkles, ShieldCheck, ShoppingCart, Store, Lock
} from "lucide-react";

export default function PlansPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any>({ weekly: [], monthly: [] });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribing, setSubscribing] = useState("");
  const [message, setMessage] = useState("");
  const [userPlanName, setUserPlanName] = useState("free");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/plans`)
      .then(r => r.json())
      .then(data => { setPlans(data); setLoadingPlans(false); })
      .catch(() => setLoadingPlans(false));
      
    if (session) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.plan_name) setUserPlanName(data.plan_name);
      })
      .catch(e => console.error("Failed to fetch user plan:", e));
    }
  }, [session]);

  const handleSubscribe = (planId: string) => {
    if (!session) return;
    router.push(`/checkout/${planId}`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

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
    <main className="min-h-screen bg-[#070b13] text-slate-100 p-6 md:p-12 font-sans relative overflow-hidden" dir="rtl">
      {/* Visual glowing design elements */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[700px] h-[700px] bg-purple-500/[0.04] rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Elegant Header & Go Back */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <button 
            onClick={() => router.push("/dashboard")} 
            className="group flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80 px-5 py-3 rounded-2xl transition duration-300 font-bold text-sm shadow-lg w-fit"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-1" />
            العودة للوحة التحكم
          </button>
          
          <div className="bg-slate-900/80 border border-amber-500/20 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-slate-400 font-bold">
              باقتك النشطة حالياً: <span className="text-amber-400 font-black">{getFriendlyPlanName(userPlanName || "مجاني")}</span>
            </p>
          </div>
        </div>

        {/* Overwhelming Premium Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight">
            باقات شحن الدقائق ⏱️
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium">
            اختر الباقة المناسبة لتفريغ محاضراتك وتوليد ملازمك الذكية بسهولة وسرعة.
          </p>
        </div>

        {message && (
          <div className={`max-w-md mx-auto text-center mb-8 p-4 rounded-2xl border ${message.includes("✅") || message.includes("🎉") ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
            {message}
          </div>
        )}

        {loadingPlans ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {activePlans.map((plan: any, idx: number) => {
              const isGoldPlan = plan.price_ils === 100 || plan.name.includes("الذهبية");
              const isMidPlan = plan.price_ils === 60 || plan.name.includes("الميدتيرم");
              const isRescuePlan = plan.price_ils === 25 || plan.name.includes("الإنقاذ");
              
              // Custom descriptive subtitles for premium feeling
              let subtitle = "لتصفح المتجر والمذاكرة السريعة.";
              if (isGoldPlan) {
                subtitle = "باقة البائع الكاملة! توليد غير محدود لدفاتر البيع مع طباعة حقوق ملكيتك.";
              } else if (isMidPlan) {
                subtitle = "شحنة دقائق متكاملة للمذاكرة الفائقة وتصفح المتجر طوال الفصل الدراسي.";
              } else if (isRescuePlan) {
                subtitle = "مثالية لشحن دقائقك سريعاً عند اقتراب الامتحانات وتصفح المتجر.";
              }

              const Icon = isGoldPlan ? Crown : isMidPlan ? Zap : isRescuePlan ? Sparkles : Star;
              const isActive = userPlanName === plan.name;

              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className={`relative bg-slate-900/30 backdrop-blur-xl border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 group h-full ${
                    isGoldPlan 
                      ? "border-amber-500/40 shadow-xl bg-gradient-to-b from-slate-900/40 to-amber-950/10 scale-100 lg:scale-[1.02]" 
                      : isMidPlan
                        ? "border-purple-500/20 hover:border-purple-500/40 shadow-lg"
                        : "border-slate-800 hover:border-slate-700 shadow-md"
                  }`}
                >
                  
                  {/* Top Popularity Badges */}
                  {isGoldPlan && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                      ⭐ باقة البائعين المتكاملة
                    </div>
                  )}

                  {isMidPlan && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                      🔥 الأكثر اختياراً
                    </div>
                  )}

                  {/* Card Body */}
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">{getFriendlyPlanName(plan.name)}</h3>
                    <p className="text-xs text-slate-400 font-bold mb-6 leading-relaxed">{subtitle}</p>

                    {/* Pricing */}
                    <div className="flex items-baseline mb-6">
                      <span className="text-4xl font-black text-white">₪{plan.price_ils}</span>
                      <span className="text-slate-500 text-xs font-bold mr-2">/ دفعة لمرة واحدة</span>
                    </div>

                    <div className="w-full h-[1px] bg-slate-800/80 mb-6" />

                    {/* Simple 5-Bullet Features List */}
                    <div className="space-y-4 mb-8">
                      {/* Bullet 1 */}
                      <div className="flex items-start text-xs font-bold text-slate-200 gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>⏱️ {plan.lecture_quota} دقيقة تفريغ ومعالجة ذكية</span>
                      </div>

                      {/* Bullet 2 */}
                      <div className="flex items-start text-xs font-bold text-slate-200 gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>📚 تصفح كامل المتجر وشراء الملازم</span>
                      </div>

                      {/* Bullet 3 */}
                      <div className="flex items-start text-xs font-bold text-slate-200 gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>✨ توليد تلقائي: بطاقات استذكار، امتحان ذاتي، نقاط التركيز، ومخطط المادة</span>
                      </div>

                      {/* Bullet 4 */}
                      <div className="flex items-start text-xs font-bold text-slate-200 gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          {isGoldPlan ? (
                            "💬 محادثة ذكية (بحد أقصى 100 رسالة إجمالاً لكافة محاضراتك)"
                          ) : isMidPlan ? (
                            "💬 محادثة ذكية (بحد أقصى 25 رسالة إجمالاً لكافة محاضراتك)"
                          ) : (
                            "💬 محادثة ذكية (بحد أقصى 5 رسائل إجمالاً لكافة محاضراتك)"
                          )}
                        </span>
                      </div>

                      {/* Bullet 5 */}
                      <div className="flex items-start text-xs font-bold text-slate-200 gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          {isGoldPlan 
                            ? "💰 نشر وبيع ملازمك لجني أرباح حقيقية 🔓" 
                            : "🔒 شراء الملازم فقط (ميزة البيع مغلقة)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  {(() => {
                    const btnClass = isActive 
                      ? "w-full py-3.5 rounded-xl font-black text-xs transition-all bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 cursor-default flex items-center justify-center gap-1.5" 
                      : `w-full py-3.5 rounded-xl font-black text-xs transition-all duration-300 mt-auto flex items-center justify-center gap-1.5 shadow-md ${
                          isGoldPlan 
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950" 
                            : isMidPlan
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                              : "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750"
                        }`;

                    return (
                      <button 
                        onClick={() => !isActive && handleSubscribe(plan.id)} 
                        disabled={!!subscribing || isActive}
                        className={btnClass}
                      >
                        {subscribing === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isActive ? (
                          <>
                            <ShieldCheck className="w-4 h-4" /> باقتك المفعلة حالياً
                          </>
                        ) : isGoldPlan ? (
                          "ابدأ كبائع الآن 💰"
                        ) : (
                          "اشحن رصيدك الآن ⏱️"
                        )}
                      </button>
                    );
                  })()}
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Marketplace Notice Footer Card */}
        <div className="max-w-4xl mx-auto mt-20 bg-slate-900/30 border border-slate-850 p-8 rounded-[2rem] text-center space-y-4">
          <Store className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-black text-white">هل ترغب بتصفح وشراء الملازم فقط؟ 🛒</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            حتى الطلاب أصحاب الحسابات المجانية أو الباقات البسيطة يمكنهم تصفح كامل **متجر الملازم الذكية**، شراء الملخصات الفخمة التي أعدها زملائهم، وتحميلها فوراً بصيغة PDF عالية الجودة!
          </p>
          <button 
            onClick={() => router.push("/marketplace")}
            className="bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-emerald-350 border border-slate-800 hover:border-emerald-500/30 px-6 py-3 rounded-xl font-bold text-xs transition duration-300"
          >
            🛍️ اذهب وتصفح المتجر الآن
          </button>
        </div>
      </div>
    </main>
  );
}

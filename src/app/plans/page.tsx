"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Loader2, BookOpen, Zap, Crown, Check, 
  ArrowLeft, Sparkles, ShieldCheck, ShoppingBag, Store, Lock,
  LayoutDashboard, History, User, Sun, Moon, LogOut, Clock, Star,
  Mic, FileText
} from "lucide-react";

import AppHeader from "@/components/AppHeader";

export default function PlansPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any>({ weekly: [], monthly: [] });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscribing, setSubscribing] = useState("");
  const [userPlanName, setUserPlanName] = useState("free");
  const [userQuota, setUserQuota] = useState<number | null>(null);

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
        if (data.quota_remaining !== undefined) setUserQuota(data.quota_remaining);
      })
      .catch(e => console.error("Failed to fetch user plan:", e));
    }
  }, [session]);

  const handleSubscribe = (planId: string) => {
    if (!session) {
      router.push(`/auth?redirect=/checkout/${planId}`);
      return;
    }
    setSubscribing(planId);
    router.push(`/checkout/${planId}`);
  };

  const getFriendlyPlanName = (name: string) => {
    if (!name || name === "free" || name === "مجاني") return "الباقة المجانية";
    if (name.includes("الذهبية") || name === "الباقة الذهبية" || name.toLowerCase().includes("elite")) return "باقة النخبة (Elite)";
    if (name.includes("الميدتيرم") || name === "باقة الميدتيرم" || name.toLowerCase().includes("premium")) return "باقة التفوق (Premium)";
    if (name.includes("الإنقاذ") || name === "باقة الإنقاذ" || name.toLowerCase().includes("essential")) return "الباقة الأساسية (Essential)";
    return name;
  };

  // Accurate Active Plan Matcher
  const isUserSubscribedToPlan = (userPlan: string, plan: any) => {
    if (!userPlan || userPlan === "free" || userPlan === "مجاني") return false;
    const up = userPlan.toLowerCase();
    const pn = (plan.name || "").toLowerCase();
    
    if (up === pn) return true;
    if ((up.includes("الذهبية") || up.includes("النخبة") || up.includes("elite")) && 
        (pn.includes("الذهبية") || pn.includes("النخبة") || pn.includes("elite") || plan.price_ils === 100)) return true;
    if ((up.includes("الميدتيرم") || up.includes("التفوق") || up.includes("premium")) && 
        (pn.includes("الميدتيرم") || pn.includes("التفوق") || pn.includes("premium") || plan.price_ils === 60)) return true;
    if ((up.includes("الإنقاذ") || up.includes("الأساسية") || up.includes("أساسي") || up.includes("essential")) && 
        (pn.includes("الإنقاذ") || pn.includes("الأساسية") || pn.includes("essential") || plan.price_ils === 25)) return true;
    
    return false;
  };

  const activePlans = [
    ...[...(plans.weekly || []), ...(plans.monthly || [])].filter((p: any) => p.name.includes("باقة"))
  ].sort((a: any, b: any) => a.price_ils - b.price_ils);

  return (
    <main 
      className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300" 
      dir="rtl"
    >
      {/* Unified App Header */}
      <AppHeader quota={userQuota} activePage="plans" />

      {/* Main Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10 space-y-12">
        
        {/* Clean Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-black shadow-xs">
            اشتراكات شهرية وباقات مرنة
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            باقات واشتراكات لمّاح
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
            اختر الخطة المناسبة لدراستك: تفريغ فوري للمحاضرات الصوتية، تلخيص السلايدات، توليد دفاتر دراسية وبطاقات حفظ وأسئلة امتحانات متوقعة.
          </p>

          {/* Active Plan Subtle Status Pill */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#0b0f19] border border-emerald-200 dark:border-emerald-500/30 px-4 py-2 rounded-full shadow-xs text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>باقتك الحالية:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">{getFriendlyPlanName(userPlanName)}</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loadingPlans ? (
          <div className="text-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-3">جاري تحميل الباقات...</p>
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-5xl mx-auto overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-6 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {activePlans.map((plan: any, idx: number) => {
              const isGoldPlan = plan.price_ils === 100 || plan.name.includes("الذهبية") || plan.name.toLowerCase().includes("elite");
              const isMidPlan = plan.price_ils === 60 || plan.name.includes("الميدتيرم") || plan.name.toLowerCase().includes("premium");
              const isRescuePlan = plan.price_ils === 25 || plan.name.includes("الإنقاذ") || plan.name.toLowerCase().includes("essential");
              
              const planTitle = isGoldPlan ? "باقة النخبة (الفصل الكامل)" : isMidPlan ? "باقة التفوق (الاشتراك الشهري)" : "باقة إنقاذ الكويزات (شحن سريع)";
              const planDesc = isGoldPlan 
                ? "الباقة الأقوى لأوائل الدفعات وصنّاع الدفاتر! رصيد عملاق للفصل كاملاً، مع ميزة حصرية لتوليد أفخم الدفاتر وبيعها بالمتجر لتحقيق أرباح خيالية."
                : isMidPlan 
                  ? "الاشتراك الشهري الأكثر طلباً لتوديع تراكم المحاضرات! رصيد متجدد يغطي جميع مساقاتك لتفريغ الصوت وتلخيص السلايدات بذكاء."
                  : "شحنة دقائق سريعة لإنقاذ ليلة الامتحان! فرّغ ولخّص الشابترات الصعبة في دقائق واضمن أعلى الدرجات بدون سهر وتعب.";

              const periodLabel = isMidPlan ? "شيكل / شهرياً" : isGoldPlan ? "شيكل / للفصل كاملاً" : "شيكل / دفعة واحدة";
              const capacityHint = isGoldPlan 
                ? "تكفي حتى 40 محاضرة كاملة طوال الفصل" 
                : isMidPlan 
                  ? "تغطي 15 إلى 18 محاضرة كاملة شهرياً" 
                  : "تكفي لتلخيص 5 إلى 6 محاضرات كاملة";

              const isActive = isUserSubscribedToPlan(userPlanName, plan);

              return (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.35 }}
                  className={`relative shrink-0 w-[290px] sm:w-[320px] md:w-auto snap-center rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 bg-white dark:bg-[#0b0f19] ${
                    isActive
                      ? "border-2 border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-500/10"
                      : isMidPlan
                        ? "border-2 border-indigo-600 shadow-xl shadow-indigo-500/10 lg:-translate-y-2"
                        : isGoldPlan
                          ? "border-2 border-amber-400 shadow-lg shadow-amber-500/10"
                          : "border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Top Badges */}
                  {isActive && (
                    <div className="absolute -top-3.5 right-6 bg-emerald-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                      <ShieldCheck className="w-3.5 h-3.5" /> باقتك الحالية
                    </div>
                  )}

                  {!isActive && isMidPlan && (
                    <div className="absolute -top-3.5 right-6 bg-indigo-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                      <Zap className="w-3.5 h-3.5 fill-current" /> الأكثر طلباً • اشتراك شهري
                    </div>
                  )}

                  {!isActive && isGoldPlan && (
                    <div className="absolute -top-3.5 right-6 bg-amber-500 text-slate-950 text-[10px] font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                      <Star className="w-3.5 h-3.5 fill-current" /> باقة النخبة • الفصل الكامل
                    </div>
                  )}

                  {!isActive && isRescuePlan && (
                    <div className="absolute -top-3.5 right-6 bg-slate-800 text-slate-200 text-[10px] font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                      <Zap className="w-3.5 h-3.5" /> شحن سريع للكويزات
                    </div>
                  )}

                  {/* Header Info */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1.5">{planTitle}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium min-h-[34px]">{planDesc}</p>

                    {/* Clean Price Display in Arabic */}
                    <div className="my-6 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{plan.price_ils}</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{periodLabel}</span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3.5 mb-8 text-xs font-medium text-slate-700 dark:text-slate-300">
                      
                      {/* Point 1: Detailed Transparent Capacity Box */}
                      <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              {plan.lecture_quota} دقيقة ذكية
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10">
                            رصيد استخدام
                          </span>
                        </div>

                        {/* Breakdown 1: Audio / Lecture hours */}
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                          <Mic className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-bold text-slate-800 dark:text-slate-100">إذا رفعت تسجيلات صوتية:</span>{" "}
                            {isGoldPlan 
                              ? "تكفي حتى 40 محاضرة كاملة طوال الفصل (محسوبة على أساس ساعة كاملة 60 دقيقة لكل محاضرة)."
                              : isMidPlan 
                                ? "تغطي 15 إلى 18 محاضرة كاملة شهرياً (محسوبة على أساس ساعة كاملة 60 دقيقة لكل محاضرة)."
                                : "تكفي 5 إلى 6 محاضرات كاملة (محسوبة على أساس ساعة كاملة 60 دقيقة لكل محاضرة)."
                            }
                          </div>
                        </div>

                        {/* Breakdown 2: Files / Slides Only */}
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80">
                          <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <span className="font-bold text-slate-800 dark:text-slate-100">إذا رفعت سلايدات وملفات فقط:</span>{" "}
                            {isGoldPlan 
                              ? "تكفي حتى 4,800 شريحة سلايدات (تغطي 120 إلى 150 ملف سلايدات كامل - كافية لكل مواد وشباتر الفصل)."
                              : isMidPlan 
                                ? "تكفي حتى 1,800 شريحة سلايدات شهرياً (تغطي 45 إلى 60 ملف سلايدات أو شابتر كامل)."
                                : "تكفي حتى 600 شريحة سلايدات (تغطي 15 إلى 20 ملف سلايدات وشابتر كامل لإنقاذ الامتحان)."
                            }
                          </div>
                        </div>
                      </div>

                      {/* Point 2: Academic Summary (Active on all) */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-relaxed">تلخيص أكاديمي مهيكل وشامل يدمج السلايدات والصوت بدقة</span>
                      </div>

                      {/* Point 3: Exams & Flashcards (Active on all) */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-relaxed">بنك أسئلة متوقعة للاختبارات (MCQs) وبطاقات استذكار ذكية</span>
                      </div>

                      {/* Point 4: Lecture Assistant Chat (Active on all) */}
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-relaxed">
                          مساعد المحاضرة الذكي ({isGoldPlan ? "100 سؤال لكل محاضرة" : isMidPlan ? "35 سؤال لكل محاضرة" : "15 سؤال لكل محاضرة"})
                        </span>
                      </div>

                      {/* Points 5 & 6:
                          For Gold Plan: Active Notebooks & Marketplace Seller
                          For Other Plans: Locked items strictly at the bottom */}
                      {isGoldPlan ? (
                        <>
                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="leading-relaxed">
                              <strong className="text-slate-900 dark:text-white font-bold">توليد الدفاتر الأكاديمية</strong> فائقة التنسيق (جاهزة للطباعة PDF بهوامش ورسومات)
                            </span>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="leading-relaxed">
                              <strong className="text-slate-900 dark:text-white font-bold">رخصة بائع معتمد:</strong> نشر وبيع الدفاتر في المتجر وجني الأرباح
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2.5 text-slate-400 dark:text-slate-500">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 dark:border-white/5">
                              <Lock className="w-3 h-3" />
                            </div>
                            <span className="leading-relaxed">
                              توليد الدفاتر الأكاديمية{" "}
                              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">(خاص بباقة النخبة)</span>
                            </span>
                          </div>

                          <div className="flex items-start gap-2.5 text-slate-400 dark:text-slate-500">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 dark:border-white/5">
                              <Lock className="w-3 h-3" />
                            </div>
                            <span className="leading-relaxed">
                              رخصة بائع معتمد ونشر الدفاتر بالمتجر{" "}
                              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">(خاص بباقة النخبة)</span>
                            </span>
                          </div>
                        </>
                      )}

                    </div>
                  </div>

                  {/* Clean CTA Button */}
                  <div className="pt-2 mt-auto">
                    {isActive ? (
                      <div className="w-full py-3.5 rounded-2xl font-bold text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center gap-2 cursor-default">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        باقتك الحالية المفعلة
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSubscribe(plan.id)} 
                        disabled={!!subscribing}
                        className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm transform active:scale-[0.98] ${
                          isMidPlan
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                            : isGoldPlan
                              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20"
                              : "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white"
                        }`}
                      >
                        {subscribing === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "اختر هذه الباقة"
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Clean Marketplace Link Box */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-right">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">هل ترغب بشراء وتصفح الدفاتر الجاهزة فقط؟</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">يمكنك تصفح متجر الدفاتر وتحميل الملخصات مباشرة دون الحاجة لشحن دقائق.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/marketplace")}
            className="shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            تصفح المتجر
          </button>
        </div>

      </div>
    </main>
  );
}

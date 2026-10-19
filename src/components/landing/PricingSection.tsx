"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Crown, Zap, Sparkles, Check, ArrowRight, Star, Lock, Mic, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const DEFAULT_PLANS = {
  weekly: [
    { id: "1", name: "باقة الإنقاذ", price_ils: 25, duration_days: 7, minutes: 300, lecture_quota: 300 },
    { id: "2", name: "باقة الميدتيرم", price_ils: 60, duration_days: 30, minutes: 900, lecture_quota: 900 },
    { id: "3", name: "الباقة الذهبية", price_ils: 100, duration_days: 90, minutes: 2400, lecture_quota: 2400 }
  ],
  monthly: []
};

export default function PricingSection() {
  const router = useRouter();
  const [plans, setPlans] = useState<any>(DEFAULT_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/plans`)
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
    if (name.includes("الذهبية") || name === "الباقة الذهبية") return "باقة النخبة (Elite)";
    if (name.includes("الميدتيرم") || name === "باقة الميدتيرم") return "باقة التفوق (Premium)";
    if (name.includes("الإنقاذ") || name === "باقة الإنقاذ") return "باقة إنقاذ الكويزات (Essential)";
    return name;
  };

  const activePlans = [
    ...[...(plans.weekly || []), ...(plans.monthly || [])].filter((p: any) => p.name.includes("باقة"))
  ].sort((a: any, b: any) => a.price_ils - b.price_ils);

  return (
    <section id="pricing" className="relative z-10 py-20 sm:py-24 px-4 sm:px-6 overflow-hidden">
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
          <div className="flex md:grid md:grid-cols-3 gap-5 lg:gap-6 items-stretch max-w-6xl mx-auto overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-6 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {activePlans.map((plan: any) => {
              const isGoldPlan = plan.price_ils === 100 || plan.name.includes("الذهبية");
              const isMidPlan = plan.price_ils === 60 || plan.name.includes("الميدتيرم");
              const isRescuePlan = plan.price_ils === 25 || plan.name.includes("الإنقاذ");

              let subtitle = "لتصفح المتجر والمذاكرة السريعة.";
              if (isGoldPlan) {
                subtitle = "الباقة الشاملة لأوائل الدفعات! رصيد عملاق للفصل كاملاً مع توليد الدفاتر الجمالية وبيعها بالمتجر للأرباح.";
              } else if (isMidPlan) {
                subtitle = "الاشتراك الشهري الأكثر طلباً لتوديع تراكم المحاضرات! رصيد متجدد يغطي كافة مساقاتك بذكاء.";
              } else if (isRescuePlan) {
                subtitle = "شحنة إنقاذ فورية قبل الكويزات! تفريغ وتلخيص مركز للشابترات الصعبة تكفي 5 إلى 6 محاضرات كاملة.";
              }

              const Icon = isGoldPlan ? Crown : isMidPlan ? Zap : Sparkles;
              const periodText = isMidPlan ? "شهرياً" : isGoldPlan ? "للفصل كاملاً" : "دفعة واحدة";
              const capacityHint = isGoldPlan ? "(تكفي حتى 40 محاضرة طوال الفصل)" : isMidPlan ? "(تغطي 15 إلى 18 محاضرة شهرياً)" : "(تكفي 5 إلى 6 محاضرات)";

              return (
                <div 
                  key={plan.id}
                  className={`relative shrink-0 w-[275px] sm:w-[320px] md:w-auto snap-center bg-white/80 dark:bg-[#070b16]/85 backdrop-blur-2xl rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-6 md:p-7 flex flex-col justify-between transition-all duration-300 group shadow-lg ${
                    isGoldPlan 
                      ? "border-2 border-amber-400 dark:border-amber-500 shadow-amber-900/10 dark:shadow-[0_10px_35px_rgba(245,158,11,0.2)] bg-gradient-to-b from-amber-50/60 to-transparent dark:from-amber-950/20 dark:to-transparent md:-translate-y-2" 
                      : isMidPlan
                        ? "border-2 border-indigo-400/80 dark:border-indigo-500/60 shadow-indigo-900/10 dark:shadow-[0_10px_35px_rgba(99,102,241,0.15)] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/15 dark:to-transparent"
                        : "border border-slate-200/80 dark:border-white/10 shadow-slate-900/5 dark:shadow-[0_10px_35px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  {/* Badge */}
                  {isGoldPlan && (
                    <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full shadow-md shadow-amber-500/25 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap uppercase tracking-wider border border-amber-200">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950" /> باقة النخبة • الفصل الكامل
                    </div>
                  )}

                  {isMidPlan && (
                    <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full shadow-md flex items-center gap-1 sm:gap-1.5 whitespace-nowrap uppercase tracking-wider border border-slate-700 dark:border-white/20">
                      <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> الأكثر طلباً • اشتراك شهري
                    </div>
                  )}

                  {isRescuePlan && (
                    <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      شحن سريع للكويزات
                    </div>
                  )}

                  <div>
                    {/* Header: Icon + Price */}
                    <div className="flex justify-between items-start mb-2.5 sm:mb-4 pt-0.5 sm:pt-1">
                      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner border transition-transform duration-300 group-hover:scale-105 ${
                        isGoldPlan ? 'bg-amber-100/90 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-500/30' :
                        isMidPlan ? 'bg-indigo-100/90 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30' :
                        'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                      }`}>
                        <Icon className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
                      </div>
                      
                      <div className="text-left" dir="ltr">
                        <div className="flex items-baseline">
                          <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">₪{plan.price_ils}</span>
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block text-right mt-0.5">{periodText}</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{getFriendlyPlanName(plan.name)}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium mb-2.5 sm:mb-4 leading-snug sm:leading-relaxed min-h-0 sm:min-h-[2.5rem] line-clamp-2 md:line-clamp-none">{subtitle}</p>

                    <div className="w-full h-px bg-slate-200 dark:bg-white/10 mb-2.5 sm:mb-4" />

                    {/* Features List */}
                    <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-6 text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-200">
                      {/* Point 1: Capacity & Duration Box */}
                      <div className="rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800 space-y-2 text-right">
                        {/* Header badge */}
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/80">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </div>
                            <span className="font-black text-[12px] sm:text-xs text-slate-900 dark:text-white">
                              {plan.lecture_quota} دقيقة ذكية
                            </span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            صلاحية {plan.duration_days} يوم
                          </span>
                        </div>

                        {/* Visual Pill 1: Audio / Lectures */}
                        <div className="rounded-lg p-2 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2">
                          <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Mic className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-[10px] sm:text-[11px] leading-tight">
                            <div className="font-black text-slate-900 dark:text-white">
                              {isGoldPlan ? "40 إلى 45 محاضرة طوال الفصل" : isMidPlan ? "15 إلى 18 محاضرة شهرياً" : "5 إلى 6 محاضرات كاملة"}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {isGoldPlan ? "تفريغ وتخطيط متواصل طوال 90 يوم" : isMidPlan ? "تجدد شهري لتغطية كافة المواد" : "إنقاذ سريع للكويزات الصعبة"}
                            </div>
                          </div>
                        </div>

                        {/* Visual Pill 2: Slides / Files */}
                        <div className="rounded-lg p-2 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2">
                          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-[10px] sm:text-[11px] leading-tight">
                            <div className="font-black text-slate-900 dark:text-white">
                              {isGoldPlan ? "تغطية كافة سلايدات وشباتر الفصل" : isMidPlan ? "حتى 60 شابتر أو ملف سلايدات" : "حتى 20 شابتر أو ملف سلايدات"}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              بملف ريكورد أو برفع السلايدات فقط
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Point 2: Highlighting & White Explanatory Slides */}
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="leading-snug sm:leading-relaxed">
                          <strong>تخطيط وتظليل السلايدات</strong> وإدراج شرائح شرح بيضاء ذكية
                        </span>
                      </div>

                      {/* Point 3: Arabic/English + Doctor Focus vs Lammah explanation */}
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="leading-snug sm:leading-relaxed">
                          شرح عربي مخلط إنجليزي + تحديد دقيق لكلام الدكتور وشرح لمّاح
                        </span>
                      </div>

                      {/* Point 4: Examples, Expected Questions & Vocabulary */}
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="leading-snug sm:leading-relaxed">
                          أمثلة إضافية + أسئلة الامتحان المتوقعة + مصطلحات الحفظ
                        </span>
                      </div>

                      {/* Point 5: Download PDF */}
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="leading-snug sm:leading-relaxed">
                          تنزيل الملف PDF عالي الجودة للطباعة الورقية أو للمذاكرة من الجوال
                        </span>
                      </div>

                      {/* Point 6: Interactive Bundle */}
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="leading-snug sm:leading-relaxed">
                          تفريغ صوتي + فلاش كاردز مقلوبة + كويزات + شات ذكي ({isGoldPlan ? "100 سؤال" : isMidPlan ? "35 سؤال" : "15 سؤال"})
                        </span>
                      </div>

                      {/* Points 7 & 8: Notebooks & Marketplace Seller (Only for 100 NIS plan, locked on others) */}
                      {isGoldPlan ? (
                        <>
                          <div className="flex items-start gap-1.5 sm:gap-2 bg-amber-500/10 dark:bg-amber-500/15 p-2 rounded-xl border border-amber-500/30">
                            <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/40">
                              <Check className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="leading-snug sm:leading-relaxed text-amber-900 dark:text-amber-200">
                              ⭐ <strong>توليد الدفاتر الذكية الشاملة:</strong> ملف PDF فخم يغنيك عن المراجعة للطباعة الفورية
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5 sm:gap-2 bg-amber-500/10 dark:bg-amber-500/15 p-2 rounded-xl border border-amber-500/30">
                            <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/40">
                              <Check className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="leading-snug sm:leading-relaxed text-amber-900 dark:text-amber-200">
                              ⭐ <strong>رخصة بائع معتمد:</strong> نشر وبيع دفاترك في متجر لمّاح وتحقيق أرباح
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-1.5 sm:gap-2 text-slate-400 dark:text-slate-500 p-1.5 rounded-lg bg-slate-100/60 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
                            <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                            </div>
                            <span className="leading-snug sm:leading-relaxed">
                              توليد الدفاتر الذكية الشاملة <strong className="text-slate-500 dark:text-slate-400 font-bold">(خاصة بالباقة الذهبية 100 ₪)</strong>
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5 sm:gap-2 text-slate-400 dark:text-slate-500 p-1.5 rounded-lg bg-slate-100/60 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
                            <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                            </div>
                            <span className="leading-snug sm:leading-relaxed">
                              رخصة بائع وبيع الدفاتر بالمتجر <strong className="text-slate-500 dark:text-slate-400 font-bold">(خاصة بالباقة الذهبية 100 ₪)</strong>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push("/auth")}
                    className={`w-full py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 mt-auto flex items-center justify-center gap-2 relative overflow-hidden cursor-pointer ${
                      isGoldPlan 
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 border border-amber-300 font-black" 
                        : isMidPlan
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 hover:-translate-y-0.5"
                          : "bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-0.5"
                    }`}
                  >
                    <span>{isGoldPlan ? "ابدأ كبائع وتميز الآن" : isMidPlan ? "اشترك في باقة التفوق" : "شحن 300 دقيقة الآن"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

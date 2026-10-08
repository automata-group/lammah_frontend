"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  MessageSquare,
  FileText,
  User,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Star,
  Play,
  Check,
  X,
  FileCheck,
  TrendingUp,
  Cpu,
  Brain,
  HelpCircle,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PricingSection from "@/components/landing/PricingSection";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import HeroSimulation from "@/components/landing/HeroSimulation";
import FeaturesSection from "@/components/landing/FeaturesSection";

export default function Home() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, isLocalDev } = useAuth();
  const router = useRouter();

  // Auth States
  const [mounted, setMounted] = useState(false);

  // FAQ States
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading]);



  const faqs = [
    {
      q: "كيف يضمن لمّاح دقة تفريغ الصوت وربطه بشرائح السلايدات؟",
      a: "يدمج لمّاح بين تسجيل صوت المحاضر وشرائح السلايدات (PDF أو PPTX). يتعرف على كلام الدكتور بدقة ويربط كل شرح وتفصيلة جانبية برقم الشريحة المقابلة لها، لينتج ملخصاً أكاديمياً شاملاً ومترابطاً لا يفوّت أي معلومة هامة."
    },
    {
      q: "ماذا يحدث لدقائقي ورصيدي إذا كان الملف طويلاً أو حدث انقطاع أثناء المعالجة؟",
      a: "رصيدك في أمان تام؛ يطبق لمّاح نظام «الاسترجاع التلقائي العادل». لا يتم خصم أي دقيقة من باقتك إلا بعد اكتمال المعالجة وتوليد الملخص بنجاح 100%. وفي حال واجهت أي مشكلة تقنية أو انقطاع، يُعاد الرصيد لمحفظتك فوراً وتلقائياً دون الحاجة لطلب الدعم."
    },
    {
      q: "ما هي وسائل وطرق الدفع والشحن المتاحة للاشتراك؟",
      a: "الدفع متاح وميسر لجميع الطلاب حصرياً عبر تطبيق ريفلكت (Reflect)، حسابات البنك العربي، وحسابات بنك فلسطين. بعد إتمام التحويل، يتم تفعيل باقتك ورصيدك فوراً لتبدأ دراستك دون أي تأخير."
    },
    {
      q: "هل يدعم لمّاح اللهجات العامية والمصطلحات الإنجليزية المتداخلة؟",
      a: "نعم 100%! تم تدريب وتطوير محرك لمّاح ليفهم الشرح الجامعي العربي بكافة اللهجات، ويتعامل ببراعة مع التداخل اللغوي (عربي وإنجليزي)، فيلتقط المصطلحات الطبية، القانونية، والهندسية المعقدة ويكتبها بلغة سليمة ومفهومة."
    },
    {
      q: "هل يمكنني رفع عدة تسجيلات صوتية (فويسات) مجزأة لنفس المحاضرة؟",
      a: "نعم بكل سهولة! إذا كانت المحاضرة مسجلة على أجزاء أو فويسات متفرقة، يمكنك رفعها جميعاً دفعة واحدة مع السلايدات (PDF أو PPTX)، وسيقوم لمّاح بدمجها بالترتيب الزمني ومطابقتها مع كل شريحة بدقة متناهية."
    },
    {
      q: "ما هو \"دفتر التلخيص الملون\"؟ وهل هو جاهز للطباعة الورقية مباشرة؟",
      a: "هو دفتر ملخص متكامل (A4 PDF) مصمم بأعلى معايير التنسيق البصري: خطوط مريحة للعين، هوامش لكتابة الملاحظات، جداول مقارنة ذكية، ورسومات توضيحية. يمكنك طباعته ورقياً أو مذاكرته على جهازك ليغنيك تماماً عن السلايدات والفويسات الطويلة (متاح حصرياً لمشتركي باقة النخبة 100 ₪)."
    },
    {
      q: "ماذا لو كان التسجيل الصوتي به تشويش أو صدى في قاعة المحاضرة؟",
      a: "يمتلك لمّاح فلاتر صوتية متطورة لتنقية الصوت وعزل الضوضاء وصوت المراوح وتشويش القاعة، والتركيز على صوت الدكتور مع مطابقة الكلمات المسموعة بنصوص السلايدات لضمان أعلى درجات الدقة حتى في التسجيلات البعيدة."
    },
    {
      q: "كيف يعمل متجر الدفاتر؟ وكيف يمكنني استرداد قيمة اشتراكي وتحقيق أرباح؟",
      a: "عند اشتراكك في باقة النخبة (100 ₪)، ستحصل على رخصة بائع معتمد. بمجرد توليد دفترك الملون عبر لمّاح، انشرها في المتجر بضغطة زر وحدد السعر الذي يناسبك. كل عملية شراء من زملائك تنزل أرباحها في محفظتك ويمكنك سحبها مباشرة."
    },
    {
      q: "هل أستطيع مناقشة لمّاح وسؤاله عن المسائل المعقدة بعد التلخيص؟",
      a: "نعم! لكل محاضرة شات أكاديمي ذكي خاص بها؛ يعمل كمعيد خصوصي يفهم أدق تفاصيل المحاضرة وما قاله الدكتور بالضبط، فيشرح لك المسائل والتمارين الغامضة بدقة دون أي تشتيت."
    },
    {
      q: "هل يمكنني معاينة نماذج من مخرجات لمّاح قبل أن أشترك؟",
      a: "بالطبع! يوفر لمّاح قسماً تفاعلياً ونماذج حية فورية على الموقع، لتشاهد بنفسك سرعة ودقة التحويل وجودة المخرجات قبل الانضمام."
    }
  ];

  const displayedFaqs = faqs.slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300" dir="rtl">

      {/* Decorative Grids and Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/50 dark:from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-500/5 dark:bg-indigo-600/10 blur-3xl rounded-full" />
        <div className="absolute top-[20%] left-[-5%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-purple-600/10 blur-3xl rounded-full" />
      </div>

      {/* Floating Glassmorphic Header */}
      <Header user={user} />
      {/* Cinematic Interactive Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Free Trial / Simulation Section */}
      <HeroSimulation />

      {/* Pricing Section Component */}
      <PricingSection />


      {/* Sleek FAQ Section */}
      <section id="faq" className="relative z-10 py-32 px-6 overflow-hidden">
        {/* Background glow for FAQ */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute w-[800px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-[100%] blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16 relative">
            {/* Decorative icons floating near title */}
            <div className="absolute -top-7 sm:-top-9 right-8 md:right-28 text-indigo-400/50 dark:text-indigo-500/40 animate-pulse pointer-events-none">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-10 left-10 md:left-32 text-purple-400/50 dark:text-purple-500/40 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}>
              <MessageSquare className="w-6 h-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 pb-4 pt-1 text-slate-900 dark:text-white tracking-tight leading-[1.3] overflow-visible">
              كل ما تود معرفته عن <span className="text-indigo-600 dark:text-indigo-400">لمّاح</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              إجابات واضحة ومباشرة عن كل ما يدور في ذهنك حول دقة التفريغ، حماية رصيدك، طرق الدفع، وتوليد الدفاتر الجمالية.
            </p>
          </div>

          <div className="space-y-4 relative z-20">
            {displayedFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`group bg-white/60 dark:bg-[#0A0D14]/60 backdrop-blur-xl border rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-[0_10px_40px_rgba(99,102,241,0.1)] relative ${
                    isOpen 
                      ? "border-indigo-500/50 dark:border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-[1.02]" 
                      : "border-slate-200/60 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30"
                  }`}
                >
                  <div className={`absolute top-0 right-0 bottom-0 w-1.5 transition-colors duration-500 ${isOpen ? "bg-gradient-to-b from-indigo-500 to-purple-500" : "bg-transparent group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900"}`} />
                  
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-6 md:p-8 text-right flex items-center justify-between gap-6 relative z-10 cursor-pointer"
                  >
                    <span className={`font-black text-base md:text-lg transition-colors duration-300 ${isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"}`}>
                      {faq.q}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner ${isOpen ? "bg-gradient-to-br from-indigo-500 to-purple-500 rotate-180" : "bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 border border-slate-200 dark:border-white/10"}`}>
                      <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${isOpen ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500"}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-6 md:px-8 pb-8 text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100/50 dark:border-white/[0.02] pt-6 relative z-10">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Action Area: Visit Dedicated FAQ page */}
          <div className="mt-10 flex items-center justify-center relative z-20">
            <Link
              href="/faq"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-lg shadow-indigo-600/25 dark:shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <span>فتح صفحة الأسئلة الشائعة الكاملة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

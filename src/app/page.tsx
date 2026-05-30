"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Loader2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Zap,
  MessageSquare,
  FileText,
  User,
  ChevronDown,
  ArrowRight,
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
import FeaturesShowcase from "@/components/landing/FeaturesShowcase";
import PricingSection from "@/components/landing/PricingSection";

export default function Home() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, isLocalDev } = useAuth();
  const router = useRouter();

  // Auth States
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [localSuccess, setLocalSuccess] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"video" | "dashboard">("dashboard");
  const videoRef = useRef<HTMLVideoElement>(null);

  // FAQ States
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  const handlePlayDemo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError("");
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message || "فشل تسجيل الدخول عبر جوجل.");
      setSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setLocalSuccess("");

    if (!email || !password) {
      setError("يرجى ملء جميع الحقول.");
      setSubmitting(false);
      return;
    }

    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        setError(error.message);
      } else {
        setLocalSuccess("✅ تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message);
      }
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin relative z-10" />
      </div>
    </div>
  );

  const faqs = [
    {
      q: "كيف تقوم المنصة بتلخيص المحاضرات الطويلة؟",
      a: "تعتمد منصة لمّاح على نماذج ذكاء اصطناعي متطورة مخصصة للغة العربية، تقوم بتحليل الملفات الصوتية، الـ PDFs، أو السلايدات، ثم تحولها فوراً لملخصات مهيكلة بدقة متناهية تشمل تعليقات المحاضر الشفوية."
    },
    {
      q: "هل تدعم المنصة اللهجات العربية العامية؟",
      a: "نعم! لمّاح تم تدريبه خصيصاً ليفهم شرح المحاضرين الجامعيين بكافة اللهجات العربية بالإضافة للمصطلحات الإنجليزية الطبية والهندسية والعلمية المتداخلة."
    },
    {
      q: "ما هي صيغ الملفات المدعومة؟",
      a: "ندعم كافة صيغ الصوت (MP3, M4A, WAV)، وصيغ الفيديو، بالإضافة لملفات PDF، ملفات PowerPoint، وروابط محاضرات YouTube."
    },
    {
      q: "كيف يمكنني الربح من المنصة؟",
      a: "عند شحن باقة النخبة (Elite)، يمكنك توليد ملازم وملخصات احترافية خالية من الأخطاء ونشرها مباشرة على متجر لمّاح الذكي لبيعها لآلاف الطلاب وجني أرباح حقيقية تسحبها لمحفظتك."
    }
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden relative" dir="rtl">
      
      {/* Decorative Grids and Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617]/0 to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] left-[-5%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 sticky top-0 bg-[#020617]/70 backdrop-blur-xl border-b border-white/[0.05] transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/lammah-logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-glow" />
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-l from-indigo-300 to-white tracking-tight">لمّاح</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">المميزات</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">كيف يعمل</a>
            <a href="#pricing" className="hover:text-white transition-colors">الأسعار</a>
            <a href="#faq" className="hover:text-white transition-colors">الأسئلة الشائعة</a>
          </div>
          <a
            href="#get-started"
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-black text-white rounded-full group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-800"
          >
            <span className="relative px-6 py-2.5 transition-all ease-in duration-75 bg-[#020617] rounded-full group-hover:bg-opacity-0">
              ابدأ الآن
            </span>
          </a>
        </div>
      </nav>

      {/* Cinematic Centered Hero Section */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Animated Announcement Pill */}
          <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.08] px-4 py-2 rounded-full backdrop-blur-md shadow-2xl">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 animate-pulse">
              <Sparkles className="w-3 h-3" />
            </span>
            <span className="text-xs font-bold text-slate-300">حقبة جديدة من التفوق الأكاديمي والمالي 🎓</span>
          </div>

          {/* Huge Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.1] text-white">
            حوّل محاضراتك الجامعية <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
              إلى ملازم ذكية فوراً
            </span>
          </h1>

          {/* Elegant Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            لمّاح هي منصة مبتكرة تعتمد على الذكاء الاصطناعي لتفريغ محاضراتك وتلخيصها بدقة، مع توليد أسئلة متوقعة للاختبارات وخرائط ذهنية تفاعلية تسهّل عليك المذاكرة. انضم لزملائك وابدأ الدراسة بذكاء وكفاءة.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#get-started"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm px-8 py-4.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              ابدأ دراستك الآن 🚀
            </a>
            <a
              href="#demo-section"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-8 py-4.5 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              شاهد كيف نعمل 🎬
            </a>
          </div>

        </motion.div>
      </section>

      {/* High-Fidelity Interactive Preview Section */}
      <section id="demo-section" className="relative z-10 px-6 max-w-xl mx-auto mb-32">
        
        <motion.div
          layout
          className="relative max-w-[340px] mx-auto rounded-[3rem] overflow-hidden bg-[#0A0D14] border-[10px] border-slate-900 shadow-[0_25px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
        >
          {/* Smartphone Camera Notch / Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-30 flex items-center justify-center border border-white/5">
            <div className="w-3 h-3 rounded-full bg-[#121620] mr-2"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40"></div>
          </div>

          <div className="relative aspect-[9/16] w-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls={isPlaying}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              preload="metadata"
            >
              <source src="/demo/0530.mp4" type="video/mp4" />
            </video>
            {!isPlaying && (
              <div
                onClick={handlePlayDemo}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 bg-[#0A0D14]/75 backdrop-blur-sm cursor-pointer"
              >
                <div className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105">
                  <Play className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 text-center">شاهد طريقة التوليد المذهلة ⏱️</h3>
                <p className="text-slate-400 text-xs max-w-[240px] text-center leading-relaxed">فيديو توضيحي يكشف سر تميز ملازم لمّاح.</p>
              </div>
            )}
          </div>
        </motion.div>
      </section>


      {/* Traditional Study vs Lammah (Before/After) */}
      <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4">وداعاً لطرق الدراسة التقليدية المرهقة</h2>
          <p className="text-slate-400 font-medium max-w-xl mx-auto">مقارنة بسيطة توضح لك كيف سيغير لمّاح نمط حياتك الأكاديمي بالكامل.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Way */}
          <div className="bg-red-500/[0.01] border border-red-500/10 p-8 md:p-12 rounded-[2.5rem] flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-red-500/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-24 h-24 bg-red-500/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <X className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">طريقة الدراسة التقليدية</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">تستهلك وقتك وجهدك في تدوين الملاحظات وتفريغ التسجيلات الطويلة يدوياً مع تشتت دائم.</p>
              
              <div className="w-full h-px bg-white/5" />
              
              <div className="space-y-4">
                {[
                  "كتابة وتدوين يدوي يستغرق ساعات طويلة بعد كل محاضرة.",
                  "فقدان التعليقات الشفهية والأسئلة الجانبية التي يطرحها الدكتور.",
                  "صعوبة البحث عن مصطلح معين داخل تسجيل مدته ساعتين.",
                  "توتر مستمر عند اقتراب الامتحان لعدم وجود ملخصات واضحة."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs font-bold text-slate-500">
                    <span className="text-red-500 shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs font-black text-red-500/60 pt-4">❌ تضيع 80% من وقتك الثمين في التحضير بدلاً من المذاكرة الفعالة.</p>
          </div>

          {/* Lammah Way */}
          <div className="bg-indigo-500/[0.01] border border-indigo-500/20 p-8 md:p-12 rounded-[2.5rem] flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 ring-1 ring-indigo-500/10">
            <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/[0.05] rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">الدراسة الذكية مع "لمّاح"</h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">تفريغ فوري، ملازم مهيكلة بكبسة زر، واختبارات مولدة خصيصاً لقياس مستوى فهمك الحقيقي.</p>
              
              <div className="w-full h-px bg-white/5" />
              
              <div className="space-y-4">
                {[
                  "توليد فوري للملازم والملخصات من ملفات الصوت أو الـ PDFs.",
                  "التقاط وتسليط الضوء على كافة التنبيهات والتعليقات الشفوية تلقائياً.",
                  "مساعد ذكي مدمج يجيبك فوراً على أي سؤال متعلق بالمحاضرة.",
                  "امتحانات ذكية مولدة ومصطلحات علمية مترجمة لتسهيل حفظ المادة."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs font-bold text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs font-black text-indigo-400 pt-4">✅ توفير 90% من الوقت للتركيز على الفهم والتحضير للامتحانات بثقة كاملة.</p>
          </div>
        </div>
      </section>

      {/* Features Showcase Component */}
      <FeaturesShowcase />

      {/* Pricing Section Component */}
      <PricingSection />

      {/* Instant Onboarding Gate & Auth Box */}
      <section id="get-started" className="relative z-10 py-32 px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-b from-slate-900/60 to-[#0A0D14]/80 border border-white/[0.08] p-8 sm:p-16 rounded-[3rem] text-center relative overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 z-0 pointer-events-none" />
          
          <div className="relative z-10 max-w-lg mx-auto space-y-6">
            <Cpu className="w-12 h-12 text-indigo-400 mx-auto animate-spin" style={{ animationDuration: '8s' }} />
            <h2 className="text-3xl sm:text-4xl font-black text-white">انضم لعالم المذاكرة الذكية اليوم</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              سجل حسابك الآن وابدأ بتحويل محاضراتك الجامعية إلى ملخصات ذكية في ثوانٍ معدودة.
            </p>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-2xl p-4 font-bold"
                >
                  {error}
                </motion.div>
              )}
              {localSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-2xl p-4 font-bold"
                >
                  {localSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 pt-4">
              <button
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-white/5 text-sm"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-1.97 0-3.66.84-4.93 2.18L3.66 2.84C5.47 1.18 8.47 0 12 0c2.97 0 5.46.98 7.28 2.66l-3.57 2.77c-.98-.66-2.23-1.06-3.71-1.06z" fill="#EA4335" />
                    </svg>
                    التسجيل السريع عبر Google
                  </>
                )}
              </button>

              {isLocalDev && (
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#020617] border border-white/10 rounded-xl py-3.5 px-4 text-xs focus:outline-none focus:border-indigo-500 text-white"
                      dir="ltr"
                    />
                    <input
                      type="password"
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#020617] border border-white/10 rounded-xl py-3.5 px-4 text-xs focus:outline-none focus:border-indigo-500 text-white"
                      dir="ltr"
                    />
                  </div>
                  <button
                    onClick={handleEmailLogin}
                    disabled={submitting}
                    className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all text-xs"
                  >
                    {isSignUp ? "إنشاء حساب بالبريد" : "تسجيل بالبريد الإلكتروني"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-slate-500 hover:text-slate-300 font-bold transition-colors underline"
                  >
                    {isSignUp ? "لديك حساب؟ سجل دخول" : "جديد هنا؟ أنشئ حساباً بالبريد"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sleek FAQ Section */}
      <section id="faq" className="relative z-10 py-24 px-6 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <HelpCircle className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black text-white">الأسئلة الشائعة حول لمّاح</h2>
          <p className="text-slate-400 text-sm mt-2">كل ما تود معرفته عن دقة التلخيص وطرق التعامل مع المنصة.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#0A0D14]/80 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-6 text-right flex items-center justify-between gap-4 font-black text-sm sm:text-base text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaq === i ? "rotate-180 text-indigo-400" : ""}`} />
              </button>
              
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-xs sm:text-sm font-medium text-slate-400 leading-relaxed border-t border-white/[0.03] pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/5 bg-[#02050e]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src="/lammah-logo.png" alt="Logo" className="w-10 h-10 object-contain opacity-70" />
            <div>
              <span className="text-lg font-black text-white block">منصة لمّاح الذكية</span>
              <span className="text-[10px] font-bold text-slate-600">حقوق الطبع محفوظة &copy; {new Date().getFullYear()}</span>
            </div>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-500">
            <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
            <a href="mailto:support@lammah.site" className="hover:text-white transition-colors">تواصل معنا</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

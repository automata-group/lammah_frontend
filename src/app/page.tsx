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
  Play
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
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden" dir="rtl">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/lammah-logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-glow" />
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-l from-indigo-300 to-white">لمّاح</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
          <a href="#features" className="hover:text-indigo-300 transition-colors">المميزات</a>
          <a href="#how-it-works" className="hover:text-indigo-300 transition-colors">كيف يعمل</a>
          <a href="#pricing" className="hover:text-indigo-300 transition-colors">الأسعار</a>
        </div>
        <a
          href="#auth"
          className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 px-6 py-2.5 rounded-full text-sm font-bold transition-all backdrop-blur-md"
        >
          ابدأ الآن
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 text-center lg:text-right">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">مستقبل الدراسة الذكي هنا</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              لا تكتفِ بالحضور، <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-l from-indigo-400 via-purple-400 to-indigo-200">
                كُن لمّاحاً
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed font-medium">
              حوّل محاضراتك الطويلة وساعات التسجيل المملة إلى ملخصات ذكية، خرائط ذهنية، وجلسات دردشة تفاعلية في ثوانٍ. المنصة العربية الأولى لدعم الطالب الجامعي.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>أكثر من 10,000 طالب يثقون بنا</span>
              </div>
              <div className="flex -space-x-3 space-x-reverse items-center pr-4">
                {[
                  { color: "bg-indigo-500/20", text: "text-indigo-400" },
                  { color: "bg-purple-500/20", text: "text-purple-400" },
                  { color: "bg-blue-500/20", text: "text-blue-400" },
                  { color: "bg-emerald-500/20", text: "text-emerald-400" }
                ].map((item, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#020617] ${item.color} flex items-center justify-center overflow-hidden transition-transform hover:scale-110`}>
                    <User className={`w-4 h-4 ${item.text}`} />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#020617] bg-indigo-600 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-600/20">
                  +5k
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Auth Integrated Card */}
        <div id="auth" className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900/40 border border-slate-700/50 p-8 md:p-10 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />

            <div className="relative z-10 text-center mb-8">
              <h2 className="text-2xl font-black mb-2">ابدأ رحلتك مجاناً</h2>
              <p className="text-slate-400 text-sm">سجل دخولك الآن واستلم تلخيصك الأول هدية</p>
            </div>

            <div className="space-y-6 relative z-10">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center font-bold"
                  >
                    {error}
                  </motion.div>
                )}
                {localSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center font-bold"
                  >
                    {localSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black py-4 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
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
                    المتابعة عبر Google
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">أو عبر البريد</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              {/* Local Dev Auth */}
              {isLocalDev && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pr-12 pl-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      dir="ltr"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="password"
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pr-12 pl-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      dir="ltr"
                    />
                  </div>
                  <button
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-xs text-slate-500 hover:text-indigo-400 font-bold transition-colors"
                  >
                    {isSignUp ? "لديك حساب؟ سجل دخول" : "جديد هنا؟ أنشئ حساباً"}
                  </button>
                </form>
              )}

              <p className="text-[10px] text-slate-600 text-center leading-relaxed font-bold uppercase">
                بالتسجيل، أنت توافق على <Link href="/terms" className="underline hover:text-indigo-400 transition-colors">شروط الاستخدام</Link> و <Link href="/privacy" className="underline hover:text-indigo-400 transition-colors">سياسة الخصوصية</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Video Section */}
      <section className="relative z-10 px-6 max-w-5xl mx-auto -mt-10 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-700/50 shadow-[0_0_50px_rgba(99,102,241,0.15)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-purple-500/20 z-0 pointer-events-none"></div>

          <video
            ref={videoRef}
            className="w-full h-full object-cover relative z-10"
            controls={isPlaying}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            preload="metadata"
          >
            <source src="/demo/DemoLammah.mp4" type="video/mp4" />
            متصفحك لا يدعم تشغيل الفيديو.
          </video>

          {/* Custom Play Overlay */}
          {!isPlaying && (
            <div
              onClick={handlePlayDemo}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 bg-slate-950/40 backdrop-blur-[2px] cursor-pointer group-hover:bg-slate-950/30 transition-all"
            >
              <div className="w-20 h-20 bg-white/10 hover:bg-indigo-500/80 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all transform group-hover:scale-110 duration-300">
                <Play className="w-8 h-8 text-white translate-x-1" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 drop-shadow-lg">شاهد كيف يعمل "لمّاح"</h3>
              <p className="text-slate-200 font-medium max-w-md mx-auto drop-shadow-md">انقر لتشغيل الفيديو التعريفي القصير واكتشف كيف ستغير المنصة طريقتك في المذاكرة للأبد.</p>
            </div>
          )}
        </motion.div>
      </section>


      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">لماذا يختار الطلاب "لمّاح"؟</h2>
          <p className="text-slate-500 font-medium">نحن لا نقدم مجرد تلخيص، نحن نعيد بناء علاقتك بالمذاكرة.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Zap className="w-6 h-6 text-amber-400" />,
              title: "تلخيص فائق السرعة",
              desc: "حوّل ساعة من التسجيل إلى ملخص خلال 15 دقيقة."
            },
            {
              icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
              title: "دردش مع محاضراتك",
              desc: "اسأل أي سؤال عن محتوى المحاضرة واحصل على إجابة دقيقة فوراً."
            },
            {
              icon: <FileText className="w-6 h-6 text-emerald-400" />,
              title: "دعم جميع التنسيقات",
              desc: "سواء كان ملفك PDF، صوت، أو فيديو، لمّاح يفهمه جيداً."
            },
            {
              icon: <Star className="w-6 h-6 text-purple-400" />,
              title: "دقة استثنائية",
              desc: "نستخدم أقوى نماذج الذكاء الاصطناعي لضمان عدم ضياع أي معلومة."
            },
          ].map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-lg font-black mb-3">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <FeaturesShowcase />

      <PricingSection />

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src="/lammah-logo.png" alt="Logo" className="w-8 h-8 opacity-50" />
            <span className="text-sm font-black text-slate-600">منصة لمّاح الذكية &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-600">
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">سياسة الخصوصية</Link>
            <a href="mailto:support@lammah.site" className="hover:text-indigo-400 transition-colors">تواصل معنا</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

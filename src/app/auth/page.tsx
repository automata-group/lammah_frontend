"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import {
  Loader2,
  Mail,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/landing/Header";

function AuthForm() {
  const { user, session, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, isLocalDev } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next") || searchParams.get("redirect");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [localSuccess, setLocalSuccess] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && user) {
      const dest = nextParam || "/dashboard";
      router.replace(dest);
    }
  }, [user, loading, router, nextParam]);

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError("");
    const destination = nextParam || "/dashboard";
    const { error } = await signInWithGoogle(destination);
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

    const destination = nextParam || "/dashboard";

    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password, destination);
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
      } else {
        router.push(destination);
      }
    }
    setSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300 flex flex-col" dir="rtl">
      
      {/* Decorative Grids and Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/50 dark:from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] left-[-5%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <Header user={user} />

      <section className="relative z-10 flex-1 flex items-center justify-center py-4 sm:py-6 px-4">
        {/* Abstract Background Decorations */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,transparent_70%)]" />
          <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:to-purple-500/15 blur-3xl rounded-full opacity-70" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/85 dark:bg-[#0A0D14]/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 p-5 sm:p-7 rounded-3xl text-center shadow-[0_16px_50px_rgba(99,102,241,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Internal Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30 dark:opacity-50" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-[70px] pointer-events-none" />

            {/* Corner Ornaments */}
            <div className="absolute top-5 right-5 text-indigo-300/40 dark:text-indigo-500/30 hidden sm:block">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute bottom-5 left-5 text-purple-300/40 dark:text-purple-500/30 hidden sm:block">
              <Zap className="w-5 h-5" />
            </div>
            
            <div className="relative z-10 max-w-xs sm:max-w-sm mx-auto space-y-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-center pt-1"
              >
                <Image src="/lammah-logo.png" alt="لمّاح" width={60} height={60} className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md" />
              </motion.div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-400 tracking-tight leading-snug mb-1">
                  أهلاً بك في لمّاح
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                  قم بتسجيل الدخول للاستفادة من كافة المميزات الذكية وتحويل كافة محاضراتك إلى ملخصات وأسئلة ودفاتر.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 dark:text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 font-bold"
                  >
                    {error}
                  </motion.div>
                )}
                {localSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-500 dark:text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl p-2.5 font-bold"
                  >
                    {localSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={submitting}
                  className="w-full bg-white dark:bg-white border border-slate-200 dark:border-transparent hover:border-indigo-100 hover:bg-slate-50 dark:hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm text-xs sm:text-sm group"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <div className="bg-slate-50 dark:bg-slate-100 p-1 rounded-full group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-1.97 0-3.66.84-4.93 2.18L3.66 2.84C5.47 1.18 8.47 0 12 0c2.97 0 5.46.98 7.28 2.66l-3.57 2.77c-.98-.66-2.23-1.06-3.71-1.06z" fill="#EA4335" />
                        </svg>
                      </div>
                      <span>التسجيل السريع عبر Google</span>
                    </>
                  )}
                </button>

                {mounted && isLocalDev && (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <div className="flex items-center gap-3 w-full py-1">
                      <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">أو</span>
                      <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                      <div className="relative group flex flex-col gap-1 text-right">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 pr-1">البريد الإلكتروني</label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-[#020617]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 pr-8 pl-3 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400/70 transition-all font-sans"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div className="relative group flex flex-col gap-1 text-right">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 pr-1">كلمة المرور</label>
                        <div className="relative">
                          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white dark:bg-[#020617]/50 border border-slate-200 dark:border-white/10 rounded-xl py-2 pr-8 pl-3 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400/70 transition-all font-sans"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleEmailLogin}
                      disabled={submitting}
                      className="w-full bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl transition-all text-xs sm:text-sm shadow-md active:scale-[0.98]"
                    >
                      {isSignUp ? "إنشاء حساب بالبريد" : "تسجيل بالبريد الإلكتروني"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition-colors pt-0.5"
                    >
                      {isSignUp ? "لديك حساب؟ سجل دخول" : "جديد هنا؟ أنشئ حساباً بالبريد"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}

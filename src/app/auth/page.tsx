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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300 flex flex-col" dir="rtl">
      
      {/* Decorative Grids and Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/50 dark:from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] left-[-5%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <Header user={user} />

      <section className="relative z-10 flex-1 flex items-center justify-center py-8 sm:py-12 px-4">
        {/* Abstract Background Decorations */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,transparent_70%)]" />
          <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/15 dark:to-purple-500/15 blur-3xl rounded-full opacity-70" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/90 dark:bg-[#0A0D14]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-6 sm:p-8 rounded-3xl text-center shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-40 dark:opacity-60" />
            
            <div className="relative z-10 max-w-xs sm:max-w-sm mx-auto space-y-5">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-center pt-1"
              >
                <Image src="/lammah-logo.png" alt="لمّاح" width={64} height={64} className="w-14 h-14 object-contain drop-shadow-md" />
              </motion.div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-1.5">
                  أهلاً بك في منصة لمّاح
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                  سجّل دخولك للوصول إلى أدوات التفريغ الأكاديمي، شات المادة، وتوليد الدفاتر الذكية.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 dark:text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl p-3 font-bold"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={submitting}
                  className="w-full bg-white hover:bg-slate-50 dark:bg-white dark:hover:bg-slate-100 text-slate-900 font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md hover:shadow-lg text-sm border border-slate-200 dark:border-transparent group cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  ) : (
                    <>
                      <div className="bg-slate-50 p-1 rounded-full group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-1.97 0-3.66.84-4.93 2.18L3.66 2.84C5.47 1.18 8.47 0 12 0c2.97 0 5.46.98 7.28 2.66l-3.57 2.77c-.98-.66-2.23-1.06-3.71-1.06z" fill="#EA4335" />
                        </svg>
                      </div>
                      <span>المتابعة بحساب Google</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  سواء كنت مستخدماً جديداً أو لديك حساب سابق، اضغط للمتابعة مباشرة
                </p>
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

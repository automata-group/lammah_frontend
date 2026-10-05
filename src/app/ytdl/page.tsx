"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, CheckCircle, AlertCircle, Sparkles, ArrowRight, Music, Link2, MessageCircle } from "lucide-react";
import AppHeader from "@/components/AppHeader";

export default function YouTubeToMP3Page() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [quota, setQuota] = useState<number | null>(null);

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  useEffect(() => {
    if (session) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.quota_remaining !== undefined) setQuota(data.quota_remaining);
      })
      .catch(e => console.error("Failed to fetch quota:", e));
    }
  }, [session]);

  // Simulate progress step messages to keep user engaged during conversion
  useEffect(() => {
    if (!isConverting) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        
        const next = prev + Math.floor(Math.random() * 8) + 2;
        
        if (next < 25) {
          setProgressStep("🔗 جاري الاتصال بالخادم والتحقق من الرابط...");
        } else if (next < 55) {
          setProgressStep("⚡ جاري استخراج الصوت وتجاوز حظر يوتيوب الأمنّي...");
        } else if (next < 80) {
          setProgressStep("🎵 جاري معالجة الصوت وتحويل الصيغة إلى MP3 (128kbps)...");
        } else {
          setProgressStep("✨ جاري إعداد الملف النهائي وتجهيزه للتحميل...");
        }
        
        return next > 95 ? 95 : next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isConverting]);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth?redirect=/ytdl");
      return;
    }
    if (!url.trim()) {
      setError("يرجى إدخال رابط يوتيوب أولاً.");
      return;
    }

    const lowerUrl = url.toLowerCase();
    if (!lowerUrl.includes("youtube.com") && !lowerUrl.includes("youtu.be")) {
      setError("🚫 يرجى إدخال رابط يوتيوب (YouTube) صالح فقط!");
      return;
    }

    setIsConverting(true);
    setProgress(5);
    setProgressStep("🔗 جاري بدء عملية التحويل...");
    setError(null);
    setSuccess(false);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("url", url.trim());

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
      const response = await fetch(`${apiUrl}/api/v1/summarize/youtube-to-mp3`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.user_message || "فشل تحويل الفيديو. قد يكون الرابط محمياً أو محظوراً.");
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const generatedName = `Lammah_Audio_${new Date().getTime()}.mp3`;

      setProgress(100);
      setProgressStep("🎉 تم التحويل بنجاح! جاري بدء التحميل تلقائياً...");
      setDownloadUrl(fileUrl);
      setFileName(generatedName);
      setSuccess(true);

      // Trigger auto-download
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = generatedName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع أثناء عملية التحويل.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setSuccess(false);
    setDownloadUrl(null);
    setError(null);
    setProgress(0);
    setProgressStep("");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300" dir="rtl">
      {/* Unified App Header */}
      <AppHeader quota={quota} activePage="ytdl" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative w-full max-w-4xl mx-auto z-10">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl bg-white dark:bg-[#070b16] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3.5 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl mb-4 text-emerald-600 dark:text-emerald-400">
              <Music className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">أداة تحميل الـ MP3 المستقلة 🎵</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-medium">
              قم بتحويل أي مقطع يوتيوب إلى ملف صوتي MP3 عالي الجودة وتنزيله مباشرة لجهازك بكل سهولة للاستماع أو رفعه لاحقاً.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isConverting && !success ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleConvert}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">رابط مقطع اليوتيوب (YouTube URL)</label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 pl-4 pr-12 py-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
                      dir="ltr"
                    />
                    <Link2 className="w-5 h-5 text-slate-400 absolute right-4 pointer-events-none" />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 px-5 py-4 rounded-2xl text-xs flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <p className="font-bold leading-relaxed">{error}</p>
                    </div>

                    {/* Fallback recommendation banner */}
                    <div className="bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl space-y-2 text-right">
                      <p className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        💡 حل بديل وسريع لتجاوز حظر يوتيوب:
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        نظراً لأن يوتيوب يفرض قيوداً أمنية مشددة أحياناً على السيرفرات، يمكنك نسخ رابط الفيديو وتنزيله كملف MP3 مباشرة عبر الموقع الخارجي المجاني والخالي من الإعلانات 
                        <a href="https://cobalt.tools" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-black mx-1 hover:text-emerald-700">cobalt.tools</a> 
                        ثم رفعه كملف مسجل في لوحة التحكم بلمّاح.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `مرحباً بكِ مهندسة، أواجه مشكلة في أداة تحميل MP3.\nالخطأ الذي ظهر لي:\n"${error}"\nأرجو المساعدة.`;
                        window.open(`https://wa.me/972598298930?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="text-[11px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-bold self-end cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      إبلاغ الإدارة بالمشكلة
                    </button>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black py-4.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-200 transform active:scale-[0.98] text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ابدأ التحويل والتنزيل الآن ✨</span>
                </button>
              </motion.form>
            ) : isConverting ? (
              <motion.div
                key="converting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 text-center space-y-6"
              >
                <div className="relative w-32 h-32 rounded-3xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-slate-950/40 flex items-center justify-center p-6 shadow-lg shadow-emerald-500/10">
                  <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin z-10" />
                  <div className="absolute -bottom-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 rounded-full shadow-xs">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{progress}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">جاري تحضير ملف الـ MP3</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold max-w-md leading-relaxed animate-pulse">
                    {progressStep}
                  </p>
                </div>

                <div className="w-full max-w-md h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6 text-center space-y-6"
              >
                <div className="p-4 bg-emerald-100 dark:bg-emerald-500/15 rounded-full border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-md">
                  <CheckCircle className="w-16 h-16 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">اكتمل التحويل بنجاح! 🎉</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    إذا لم يبدأ التحميل تلقائياً، يمكنك النقر على الزر أدناه لتنزيل ملف الصوت مباشرة إلى جهازك.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center pt-2">
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={fileName}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm flex-1 transition-all duration-200 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تنزيل ملف الـ MP3</span>
                    </a>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-1.5 text-xs transition-all duration-200 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>تحويل مقطع آخر</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

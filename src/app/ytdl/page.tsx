"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, CheckCircle, AlertCircle, Sparkles, Home, ArrowRight, Music, Link2, MessageCircle } from "lucide-react";

export default function YouTubeToMP3Page() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading]);

  // Simulate progress step messages to keep user engaged during conversion
  useEffect(() => {
    if (!isConverting) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        
        // Add random progress increment
        const next = prev + Math.floor(Math.random() * 8) + 2;
        
        // Update steps based on progress
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col" dir="rtl">
      {/* Top Floating Navbar */}
      <div className="sticky top-0 z-50 w-full px-4 pt-4 pb-2">
        <nav className="bg-slate-950/60 backdrop-blur-xl border border-indigo-500/15 rounded-[2rem] px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center cursor-pointer group" onClick={() => router.push("/dashboard")}>
            <img src="/lammah-logo.png" alt="Lammah" className="w-8 h-8 ml-2 object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] group-hover:scale-110 transition-transform duration-300" />
            <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">لمّاح</span>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-white transition-all duration-300 px-4 py-2 hover:bg-slate-900/60 rounded-xl flex items-center gap-1.5 font-bold text-xs border border-slate-800/80"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>لوحة التحكم</span>
          </button>
        </nav>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative w-full max-w-4xl mx-auto">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-650/15 blur-[120px] rounded-full pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-slate-950/40 backdrop-blur-3xl border border-indigo-500/15 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(99,102,241,0.12)] relative overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl mb-4 shadow-inner">
              <Music className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">أداة تحميل الـ MP3 المستقلة 🎵</h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
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
                  <label className="text-xs font-black text-indigo-300 block">رابط مقطع اليوتيوب (YouTube URL)</label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 pl-4 pr-12 py-4 rounded-2xl focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300 text-sm font-medium"
                      dir="ltr"
                    />
                    <Link2 className="w-5 h-5 text-slate-500 absolute right-4 pointer-events-none" />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-200 px-5 py-4 rounded-2xl text-xs flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="font-bold leading-relaxed">{error}</p>
                    </div>

                    {/* Fallback recommendation banner */}
                    <div className="bg-slate-950/80 border border-emerald-500/20 p-4 rounded-xl space-y-2 text-right">
                      <p className="font-black text-emerald-400 flex items-center gap-1">
                        💡 حل بديل وسريع لتجاوز حظر يوتيوب:
                      </p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        نظراً لأن يوتيوب يفرض قيوداً أمنية مشددة أحياناً على السيرفرات، يمكنك نسخ رابط الفيديو وتنزيله كملف MP3 مباشرة عبر الموقع الخارجي المجاني والخالي من الإعلانات 
                        <a href="https://cobalt.tools" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-black mx-1 hover:text-emerald-350">cobalt.tools</a> 
                        ثم رفعه كملف مسجل في لوحة التحكم بلمّاح.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `مرحباً بكِ مهندسة، أواجه مشكلة في أداة تحميل MP3.\nالخطأ الذي ظهر لي:\n"${error}"\nأرجو المساعدة.`;
                        window.open(`https://wa.me/972598298930?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="text-[11px] bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-bold self-end"
                    >
                      <MessageCircle className="w-4 h-4 text-green-455" />
                      إبلاغ الإدارة بالمشكلة
                    </button>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-indigo-950/40 hover:shadow-indigo-500/25 transition-all duration-300 transform active:scale-[0.98] text-sm flex items-center justify-center gap-2"
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
                {/* Custom glowing radar animation */}
                <div className="relative w-36 h-36 rounded-[2rem] border border-indigo-500/20 bg-slate-950/40 flex items-center justify-center p-6 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
                  <div className="absolute inset-2 rounded-[1.7rem] border border-dashed border-indigo-500/30 animate-[spin_30s_linear_infinite]"></div>
                  <div className="absolute inset-4 rounded-[1.3rem] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 animate-pulse"></div>
                  <Loader2 className="w-12 h-12 text-indigo-400 animate-spin z-10" />
                  <div className="absolute -bottom-3 bg-slate-950 border border-indigo-500/30 px-3 py-1 rounded-lg">
                    <span className="text-xs font-black text-indigo-300 tabular-nums">{progress}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">جاري تحضير ملف الـ MP3</h3>
                  <p className="text-indigo-200/70 text-xs sm:text-sm font-semibold max-w-md leading-relaxed animate-pulse">
                    {progressStep}
                  </p>
                </div>

                {/* Simulated continuous progress bar */}
                <div className="w-full max-w-md h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
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
                <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-16 h-16 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white">اكتمل التحويل بنجاح! 🎉</h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    إذا لم يبدأ التحميل تلقائياً، يمكنك النقر على الزر أدناه لتنزيل ملف الصوت مباشرة إلى جهازك.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center pt-2">
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={fileName}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 text-sm flex-1 transition-all duration-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>تنزيل ملف الـ MP3</span>
                    </a>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-1.5 text-xs transition-all duration-300"
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

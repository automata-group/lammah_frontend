"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  BookOpen, Sparkles, Lock, ArrowLeft, Upload, FileText, 
  User, CheckCircle, Download, AlertTriangle, PlayCircle, Loader2,
  Plus, X
} from "lucide-react";

function NotebookCreatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get("history_id");
  const { session, loading: authLoading } = useAuth();
  const [planName, setPlanName] = useState<string>("free");
  const [quota, setQuota] = useState<number>(0);
  const [fullName, setFullName] = useState<string>("طالب متميز");
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Form states
  const [lectureTitle, setLectureTitle] = useState<string>("");
  const [customStudentName, setCustomStudentName] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [lectureUrls, setLectureUrls] = useState<string[]>([""]);
  const [lectureUrl, setLectureUrl] = useState<string>("");
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  interface UploadedAudio {
    id: string;
    file: File;
    tempId?: string;
    progress: number;
    isUploading: boolean;
  }
  const [multiAudioFiles, setMultiAudioFiles] = useState<UploadedAudio[]>([]);
  
  // Upload IDs
  const [audioTempId, setAudioTempId] = useState<string>("");
  const [pdfTempId, setPdfTempId] = useState<string>("");
  const [isAudioUploading, setIsAudioUploading] = useState<boolean>(false);
  const [isPdfUploading, setIsPdfUploading] = useState<boolean>(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState<number>(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState<number>(0);

  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ downloadUrl: string; previewUrl?: string; title: string } | null>(null);

  // Fetch current user quota and plan name when authLoading changes or session changes
  useEffect(() => {
    if (authLoading) return;
    
    if (session) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
      fetch(`${apiUrl}/api/v1/subscription/quota`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })
      .then(async r => {
        const data = await r.json();
        if (r.ok) {
          setPlanName(data.plan_name || "free");
          setQuota(data.quota_remaining || 0);
          setFullName(data.full_name || "طالب متميز");
          setCustomStudentName(data.full_name || "طالب متميز");
        }
      })
      .catch(e => console.error("Failed to load quota info:", e))
      .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, [session, authLoading]);

  // Load saved notebook from history_id if present
  useEffect(() => {
    const fetchNotebookHistory = async () => {
      if (session && historyId) {
        setIsProcessing(true);
        setProgressStep("الأرشيف");
        setProgressMessage("جاري استرجاع دفترك الدراسي الفاخر من الأرشيف... 📚");
        
        // Remove query param to prevent loop on subsequent re-renders
        window.history.replaceState({}, document.title, window.location.pathname);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
        try {
          const response = await fetch(`${apiUrl}/api/v1/subscription/history/${historyId}`, {
            headers: {
              "Authorization": `Bearer ${session.access_token}`
            }
          });
          
          if (!response.ok) throw new Error("الملزمة غير موجودة أو تم حذفها");
          
          const data = await response.json();
          if (data?.metadata?.job_id) {
            setLectureTitle(data.metadata.title || "دفتر دراسي");
            setCustomStudentName(data.metadata.student_name || fullName);
            setResult({
              downloadUrl: `/api/v1/notebook/download/${data.metadata.job_id}.pdf`,
              previewUrl: data.metadata.preview_url || "",
              title: data.metadata.title || "دفتر دراسي"
            });
          } else {
            throw new Error("هذا الأرشيف لا يحتوي على ملف ملزمة جاهز.");
          }
        } catch (err: any) {
          setError(err.message || "حدث خطأ أثناء تحميل تفاصيل الملزمة.");
        } finally {
          setIsProcessing(false);
          setProgressStep("");
          setProgressMessage("");
        }
      }
    };
    fetchNotebookHistory();
  }, [session, historyId, fullName]);

  // Handle file uploads
  const uploadTempFile = (file: File, isAudio: boolean) => {
    if (isAudio) {
      setIsAudioUploading(true);
      setAudioUploadProgress(0);
    } else {
      setIsPdfUploading(true);
      setPdfUploadProgress(0);
    }

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
    const uploaderUrl = process.env.NEXT_PUBLIC_UPLOADER_URL || apiUrl;

    xhr.open("POST", `${uploaderUrl}/api/v1/summarize/upload-temp`, true);
    if (session?.access_token) {
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        if (isAudio) setAudioUploadProgress(percent);
        else setPdfUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (isAudio) {
          setAudioTempId(data.temp_id);
          setIsAudioUploading(false);
        } else {
          setPdfTempId(data.temp_id);
          setIsPdfUploading(false);
        }
      } else {
        setError(`فشل رفع الملف: ${xhr.statusText}`);
        if (isAudio) setIsAudioUploading(false);
        else setIsPdfUploading(false);
      }
    };

    xhr.onerror = () => {
      setError("حدث خطأ أثناء الاتصال بالسيرفر لرفع الملف.");
      if (isAudio) setIsAudioUploading(false);
      else setIsPdfUploading(false);
    };

    xhr.send(formData);
  };

  const uploadSingleMultiAudio = (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const uploaderUrl = process.env.NEXT_PUBLIC_UPLOADER_URL || apiUrl;

    xhr.open('POST', `${uploaderUrl}/api/v1/summarize/upload-temp`, true);
    if (session?.access_token) {
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setMultiAudioFiles(prev => prev.map(item => item.id === id ? { ...item, progress: percent } : item));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        setMultiAudioFiles(prev => prev.map(item => item.id === id ? { ...item, tempId: data.temp_id, isUploading: false, progress: 100 } : item));
      } else {
        setError(`فشل رفع الملف ${file.name}: ${xhr.statusText}`);
        setMultiAudioFiles(prev => prev.filter(item => item.id !== id));
      }
    };

    xhr.onerror = () => {
      setError(`حدث خطأ أثناء رفع الملف ${file.name}`);
      setMultiAudioFiles(prev => prev.filter(item => item.id !== id));
    };

    xhr.send(formData);
  };

  const startNotebookProcessing = async () => {
    if (!session) {
      setError("لم يتم العثور على جلسة تسجيل دخول نشطة.");
      return;
    }
    
    const hasAudioFile = !!audioFile || multiAudioFiles.length > 0;
    const hasLectureUrl = (uploadMode === "url" && lectureUrl.trim().length > 0) || (uploadMode === "url" && lectureUrls.filter(u => u.trim()).length > 0);
    if (!hasAudioFile && !hasLectureUrl) {
      setError(uploadMode === "url" ? "يرجى إدخال رابط المحاضرة أولاً." : "يرجى إرفاق الملف الصوتي أولاً.");
      return;
    }

    if (uploadMode === "url") {
      const urls = lectureUrls.filter(u => u.trim());
      for (const url of urls) {
        const lowerUrl = url.toLowerCase();
        if (!lowerUrl.includes("youtube.com") && !lowerUrl.includes("youtu.be")) {
          setError("🚫 عذراً، يُسمح بروابط يوتيوب (YouTube) فقط! 🎥");
          return;
        }
      }
    }
    
    setIsProcessing(true);
    setProgressStep("0/5");
    setProgressMessage("🚀 جاري تهيئة الاتصال بالمحرك الخاص بالبائعين... ");
    setError(null);
    setResult(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
    const formData = new FormData();
    
    if (uploadMode === "url") {
      const urls = lectureUrls.filter(u => u.trim());
      formData.append("lecture_urls", urls.join(","));
    } else {
      const tempIds = multiAudioFiles.map(item => item.tempId).filter(Boolean);
      const activeTempId = audioTempId || tempIds[0] || null;
      if (tempIds.length > 1) {
        formData.append("audio_temp_ids", tempIds.join(","));
      } else if (activeTempId) {
        formData.append("audio_temp_id", activeTempId);
      } else if (audioFile) {
        formData.append("audio_file", audioFile);
      }
    }

    if (pdfTempId) formData.append("pdf_temp_id", pdfTempId);
    else if (pdfFile) formData.append("pdf_file", pdfFile);

    if (lectureTitle) formData.append("lecture_title", lectureTitle);
    formData.append("student_name", customStudentName || fullName);

    try {
      const response = await fetch(`${apiUrl}/api/v1/notebook/process-notebook`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.user_message || "فشلت عملية تهيئة المحرك.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("فشل إنشاء قناة القراءة الفورية.");

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith("data: ")) {
            try {
              const payload = JSON.parse(cleanLine.slice(6));
              
              if (payload.type === "progress") {
                setProgressStep(payload.step);
                setProgressMessage(payload.message);
              } else if (payload.type === "done") {
                setResult({
                  downloadUrl: payload.download_url,
                  previewUrl: payload.preview_url,
                  title: payload.title
                });
                setIsProcessing(false);
                setProgressStep("");
                setProgressMessage("");
              } else if (payload.type === "error") {
                setError(payload.message || "حدث خطأ أثناء المعالجة الذكية.");
                setIsProcessing(false);
              }
            } catch (e) {
              console.error("Failed to parse stream JSON:", e);
            }
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "فشلت عملية المعالجة.");
      setIsProcessing(false);
    }
  };

  const getFriendlyPlanName = (name: string) => {
    if (!name || name === "free" || name === "مجاني") return "الباقة المجانية (Free)";
    if (name.includes("الذهبية") || name === "الباقة الذهبية") return "باقة النخبة (Elite)";
    if (name.includes("الميدتيرم") || name === "باقة الميدتيرم") return "باقة التفوق (Premium)";
    if (name.includes("الإنقاذ") || name === "باقة الإنقاذ") return "الباقة الأساسية (Essential)";
    return name;
  };

  // If loading session details
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0d131f] flex flex-col justify-center items-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
        <p className="text-slate-400 font-medium">جاري التحقق من الصلاحيات والميزات الحصرية...</p>
      </div>
    );
  }

  const isPremiumUser = session && planName && planName !== "free";

  // PREMIUM PAYWALL
  if (!session || !isPremiumUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-2xl w-full text-center space-y-8 z-10">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-[2rem] flex items-center justify-center shadow-2xl mx-auto border border-amber-400/30">
              <Lock className="w-12 h-12 text-slate-900" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-slate-900 border-2 border-amber-400 p-2 rounded-full shadow-lg">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent leading-tight">
              صانع دفاتر البائعين الذكية
            </h1>
            <p className="text-lg md:text-xl text-amber-100/80 font-bold max-w-xl mx-auto leading-relaxed">
              انتقل من مجرد طالب إلى ناشر وصاحب متجر دراسي! ولّد ملازمك الفخمة بخط يد ربيعي وطابع كلاسيكي لتبعتها لزملائك داخل المنصة.
            </p>
          </div>

          {/* Premium Features Highlight */}
          <div className="grid md:grid-cols-3 gap-6 text-right my-8 max-w-xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition duration-300">
              <BookOpen className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-bold text-amber-200 mb-1 text-base">ورق مسطر كلاسيكي</h3>
              <p className="text-xs text-slate-400">توليد تلقائي على خلفية تحاكي الدفتر المدرسي المسطر.</p>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition duration-300">
              <Sparkles className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-bold text-amber-200 mb-1 text-base">قلم خط عربي يدوي</h3>
              <p className="text-xs text-slate-400">كتابة عربية بخط رقعي جذاب يحاكي الخط اليدوي للطلاب المتفوقين.</p>
            </div>
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition duration-300">
              <User className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-bold text-amber-200 mb-1 text-base">حقوق ملكية مطبوعة</h3>
              <p className="text-xs text-slate-400">تضمين اسمك كبائع معتمد وتوقيعك تلقائياً في أسفل الصفحات.</p>
            </div>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <button 
              onClick={() => router.push("/plans")}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-lg py-4 px-8 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] transition transform hover:scale-[1.02] flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" /> ترقية الباقة الآن للاستفادة
            </button>
            
            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 px-8 rounded-2xl transition border border-slate-800 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 ml-1" /> العودة للوحة التحكم
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!checkingAuth && !planName.toLowerCase().includes("الذهبية") && !planName.toLowerCase().includes("ذهبية")) {
    return (
      <div className="min-h-screen bg-[#070b13] text-white p-6 relative overflow-hidden flex flex-col justify-center items-center font-sans" dir="rtl">
        {/* Background Gradients */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-2xl text-center space-y-8 bg-slate-900/60 backdrop-blur-2xl border border-amber-500/30 p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.15)] relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30 border border-amber-300/40">
            <Lock className="w-12 h-12 text-slate-950" />
          </div>

          <div className="pt-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" /> ميزة حصرية للبائعين المتفوقين
            </div>
            <h2 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-350">
              صانع دفاتر البائعين مغلق 🔒
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-lg mx-auto">
              عذراً! ميزة توليد ملازم البائعين الفاخرة المطبوع عليها اسمك وحقوقك وعرضها للبيع في المتجر متاحة حصرياً لأعضاء **باقة النخبة (Elite - 100 شيكل)** فقط.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right py-4 border-t border-b border-slate-800/80 my-6">
            <div className="flex items-start gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
              <span className="text-xl shrink-0">💰</span>
              <div>
                <h4 className="font-bold text-amber-200 text-sm">اربح من مبيعاتك</h4>
                <p className="text-xs text-slate-400 mt-0.5">اصنع دفترك الدراسي وعالجه بدقائقك الذهبية وعين سعرك واربح 100%.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
              <span className="text-xl shrink-0">📝</span>
              <div>
                <h4 className="font-bold text-amber-200 text-sm">أوراق مسطرة وحقوق مطبوعة</h4>
                <p className="text-xs text-slate-400 mt-0.5">خط يدوي رقعي جذاب يحاكي خط المتفوقين مع طباعة اسمك لحفظ ملكيتك.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push("/plans")}
              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 px-8 py-4 rounded-2xl font-black text-base transition-all transform hover:scale-[1.03] shadow-lg shadow-amber-500/20"
            >
              👑 ترقية حسابك لباقة النخبة (Elite) الآن
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-slate-950 hover:bg-slate-855 text-slate-300 border border-slate-855 px-8 py-4 rounded-2xl font-bold text-base transition-all"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-6 relative overflow-hidden">
      {/* Visual backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.08] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.08] rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-12 h-12 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition flex items-center justify-center border border-slate-800/60 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white bg-clip-text">صانع دفاتر الطلاب الذكية</h1>
            <p className="text-xs text-slate-400 font-bold">حوّل محاضراتك وتوقعاتك إلى دفاتر دراسية فخمة مطبوعة باسمك</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-4 backdrop-blur-xl shadow-lg">
          <div className="text-right">
            <p className="text-[10px] text-slate-450 font-bold">باقة اشتراكك</p>
            <p className="text-xs font-black text-indigo-400">{getFriendlyPlanName(planName)}</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="text-right">
            <p className="text-[10px] text-slate-450 font-bold">الحصة المتبقية</p>
            <p className="text-xs font-black text-slate-100">{quota} دقيقة <span className="text-[9px] text-indigo-450 font-normal mr-1">(الخصم: دقيقة لكل دقيقة صوتية)</span></p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Form Settings Panel: 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-[2rem] space-y-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-black text-slate-200 border-b border-slate-800/80 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> إنشاء الملزمة ✍️
            </h2>

            {/* Student Name Watermark Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-350 block">اسم الكاتب / البائع:</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  value={customStudentName} 
                  onChange={(e) => setCustomStudentName(e.target.value)}
                  placeholder="مثال: أحمد الطالب المتفوق" 
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl py-3 pr-11 pl-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition font-bold text-xs"
                />
              </div>
            </div>

            {/* Custom Lecture Title Override */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-355 block">عنوان الملزمة (اختياري):</label>
              <input 
                type="text" 
                value={lectureTitle} 
                onChange={(e) => setLectureTitle(e.target.value)}
                placeholder="اتركه فارغاً ليقوم الذكاء الاصطناعي بتوليده" 
                className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition font-bold text-xs"
              />
            </div>

            {/* File Upload Fields */}
            <div className="space-y-4">
              {/* Tab Selector for Upload Mode */}
              <div className="flex gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode("file");
                    setLectureUrls([""]);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${uploadMode === "file" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-400 hover:text-slate-200"}`}
                >
                  📁 رفع ملفات صوتية
                </button>
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed bg-slate-900/40 opacity-50"
                  title="ميزة روابط اليوتيوب غير متاحة حالياً - ستتوفر قريباً"
                >
                  🔗 روابط يوتيوب (قريباً)
                </button>
              </div>

              {/* Lecture URL Inputs */}
              {uploadMode === "url" && (
                <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
                  <label className="text-xs font-bold text-slate-300 block">روابط المحاضرات المراد دمجها بالملزمة:</label>
                  {lectureUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...lectureUrls];
                          newUrls[idx] = e.target.value;
                          setLectureUrls(newUrls);
                          if (idx === 0) setLectureUrl(e.target.value);
                        }}
                        placeholder={idx === 0 ? "ألصق رابط يوتيوب (YouTube) هنا" : `رابط محاضرة إضافي #${idx + 1}`}
                        className="flex-1 bg-slate-950 border border-slate-850 text-slate-100 p-3.5 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                        dir="ltr"
                      />
                      {lectureUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = lectureUrls.filter((_, i) => i !== idx);
                            setLectureUrls(newUrls);
                            if (idx === 0) setLectureUrl(newUrls[0] || "");
                          }}
                          className="text-slate-500 hover:text-red-400 p-2 shrink-0 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLectureUrls(prev => [...prev, ""])}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mt-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة رابط محاضرة آخر 🔗
                  </button>
                </div>
              )}

              {/* Audio Source Upload */}
              {uploadMode === "file" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 block">صوت أو تسجيل المحاضرة (يمكن اختيار عدة ملفات للدمج):</label>
                  <div className={`border-2 border-dashed rounded-2xl p-6 text-center hover:border-indigo-500/50 transition cursor-pointer relative bg-slate-950/40 ${audioFile || multiAudioFiles.length > 0 ? "border-indigo-500 bg-indigo-500/5" : "border-slate-850"}`}>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          if (files.length === 1 && multiAudioFiles.length === 0) {
                            setAudioFile(files[0]);
                            setAudioUploadProgress(0);
                            setAudioTempId("");
                            uploadTempFile(files[0], true);
                          }
                          
                          const newFiles = Array.from(files).map(file => ({
                             id: Math.random().toString(36).substring(7),
                             file,
                             progress: 0,
                             isUploading: true
                          }));
                          setMultiAudioFiles(prev => [...prev, ...newFiles]);
                          newFiles.forEach(item => {
                            uploadSingleMultiAudio(item.id, item.file);
                          });
                        }
                      }} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    {audioFile || multiAudioFiles.length > 0 ? (
                      <div className="text-center w-full z-20 relative select-text">
                        {multiAudioFiles.length > 1 ? (
                          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                            <p className="text-[10px] font-bold text-indigo-300 mb-1">الملفات المحددة للدمج بالملزمة ({multiAudioFiles.length})</p>
                            {multiAudioFiles.map((item) => (
                              <div key={item.id} className="flex items-center justify-between bg-slate-900/80 border border-slate-850 p-2 rounded-xl text-[10px]">
                                <span className="font-semibold text-indigo-100 truncate max-w-[150px] text-right" dir="ltr">{item.file.name}</span>
                                <div className="flex items-center gap-2">
                                  {item.isUploading ? (
                                    <span className="text-[10px] text-indigo-400 font-bold">{item.progress}%</span>
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setMultiAudioFiles(prev => prev.filter(x => x.id !== item.id));
                                    }}
                                    className="text-slate-500 hover:text-red-400 p-0.5"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-right">
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-8 h-8 text-indigo-500 animate-pulse" />
                              <div>
                                <p className="text-xs font-bold text-slate-200 max-w-[180px] truncate">{(audioFile || multiAudioFiles[0]?.file)?.name}</p>
                                <p className="text-[10px] text-slate-500">{((audioFile || multiAudioFiles[0]?.file)?.size / 1024 / 1024).toFixed(1)} MB</p>
                              </div>
                            </div>
                            {(isAudioUploading || multiAudioFiles[0]?.isUploading) ? (
                              <div className="text-xs text-indigo-400 font-bold">{audioUploadProgress || multiAudioFiles[0]?.progress}%</div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setAudioFile(null);
                                    setAudioTempId("");
                                    setMultiAudioFiles([]);
                                  }}
                                  className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-400">اسحب أو اختر ملفات صوت المحاضرات</p>
                        <p className="text-[10px] text-slate-600">يمكنك اختيار عدة أجزاء لدمجها بملزمة واحدة فخمة</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PDF/PPT Slide Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">ملف السلايدات PowerPoint أو PDF (اختياري):</label>
                <div className="border-2 border-dashed border-slate-850 rounded-2xl p-4 text-center hover:border-indigo-500/50 transition cursor-pointer relative bg-slate-950/40">
                  <input 
                    type="file" 
                    accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPdfFile(e.target.files[0]);
                        uploadTempFile(e.target.files[0], false);
                      }
                    }} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  {pdfFile ? (
                    <div className="flex items-center justify-between text-right">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-xs font-bold text-slate-200 max-w-[180px] truncate">{pdfFile.name}</p>
                          <p className="text-[10px] text-slate-500">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      {isPdfUploading ? (
                        <div className="text-xs text-indigo-400 font-bold">{pdfUploadProgress}%</div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setPdfFile(null);
                              setPdfTempId("");
                            }}
                            className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-400">اسحب أو اختر ملف PowerPoint أو PDF</p>
                      <p className="text-[10px] text-slate-600">لتوليد شروحات الشرائح مباشرة داخل الدفتر</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-950/50 border border-rose-500/50 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-rose-200 leading-relaxed text-right">{error}</p>
              </div>
            )}

            {/* Submit Action Button */}
            {!isProcessing ? (
              <button 
                onClick={startNotebookProcessing}
                disabled={isAudioUploading || isPdfUploading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-sm py-4 rounded-2xl transition shadow-[0_0_20px_rgba(99,102,241,0.15)] flex items-center justify-center gap-2"
              >
                ✨ ابدأ صياغة ملزمتك الذكية ✨
              </button>
            ) : (
              <div className="space-y-4">
                {/* Live Processing Indicator */}
                <div className="bg-slate-950 border border-indigo-500/20 p-4 rounded-2xl text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs text-indigo-400 font-black">الخطوة {progressStep}</p>
                    <p className="text-xs text-slate-200 font-bold leading-relaxed">{progressMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview/Result Mockup Notebook Canvas: 7 columns */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            // Success & PDF View Frame
            <div className="bg-slate-900/30 border border-indigo-500/35 p-6 rounded-[2rem] shadow-2xl relative space-y-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-xl font-black text-indigo-300">تم توليد دفترك الدراسي المتميز!</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      // Navigate to publish page with query params
                      const params = new URLSearchParams({
                        pdfUrl: result.downloadUrl,
                        previewUrl: result.previewUrl || "",
                        title: result.title,
                        studentName: customStudentName || fullName
                      });
                      router.push(`/marketplace/publish?${params.toString()}`);
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 px-5 py-2 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-lg border border-emerald-400/20"
                  >
                    🛒 انشر للبيع في المتجر
                  </button>
                  <a 
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}${result.downloadUrl}`}
                    download
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-lg border border-indigo-400/20"
                  >
                    <Download className="w-4 h-4" /> تنزيل الملزمة (PDF)
                  </a>
                </div>
              </div>

              {/* PDF Preview Iframe */}
              <div className="w-full h-[650px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 relative">
                <iframe 
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}${result.downloadUrl}`}
                  className="w-full h-full border-none"
                  title="Aesthetic Notebook Preview"
                />
              </div>
            </div>
          ) : (
            // Beautiful Notebook ruled mock page preview
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-[2rem] shadow-2xl space-y-4 backdrop-blur-xl">
              <h3 className="text-base font-black text-slate-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> معاينة شكل ورق ملزمتك الكلاسيكية
              </h3>

              {/* Luxurious Leather/Bronze notebook cover binder around the paper sheet */}
              <div className="w-full bg-gradient-to-br from-[#2b170c] via-[#1b0e07] to-[#0c0603] rounded-[2.2rem] p-5 border-2 border-[#8C6D4F]/30 shadow-2xl relative overflow-hidden">
                {/* Spiral/Ring binder rings simulated on the left edge */}
                <div className="absolute top-0 bottom-0 left-6 w-[2px] bg-slate-950/80 z-20" />
                <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-6 z-25">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-6 h-2.5 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 rounded-full border border-slate-950 shadow-md transform -rotate-12" />
                  ))}
                </div>
                
                {/* Lined Paper Canvas Simulated Notebook Page */}
                <div className="w-full bg-[#FAF8F5] rounded-[1.6rem] p-8 border border-[#e4d5c9] shadow-2xl min-h-[620px] text-right font-serif relative overflow-hidden">
                  {/* RTL Standard Red Vertical Margin line */}
                  <div className="absolute right-[65px] top-0 bottom-0 w-[1.5px] bg-rose-200" />

                  {/* Horizontal Ruled Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-16 pointer-events-none px-[15px]">
                    {Array.from({ length: 18 }).map((_, idx) => (
                      <div key={idx} className="w-full border-b border-dashed border-amber-200/50 h-[28px]" />
                    ))}
                  </div>

                  {/* Simulated Handwritten Notebook Content */}
                  <div className="relative z-10 space-y-8 pr-12 pl-6 pb-16">
                    {/* Notebook Header */}
                    <div className="flex justify-between items-center border-b-2 border-amber-900/20 pb-2 text-[10px] text-amber-900/60 font-mono font-bold">
                      <span>التاريخ: {new Date().toLocaleDateString("ar-EG")}</span>
                      <span>المادة: محاضرة الطالب المتميزة</span>
                    </div>

                    {/* Handwritten Title */}
                    <h4 className="text-amber-900 font-extrabold text-2xl tracking-wide font-sans mt-4">
                      كيف يظهر دفترك للطلاب؟ 📝✨
                    </h4>

                    {/* Bullet Handwritten Points with soft highlighter highlights */}
                    <div className="space-y-6 text-slate-800 text-sm font-medium leading-relaxed">
                      <p className="flex items-start gap-2">
                        <span className="text-amber-700 font-black shrink-0">📍</span>
                        <span>
                          سيتم صياغة ملخصك بلغة عربية دراسية شيقة ومرتبة على شكل فقرات وملاحظات منظمة جداً كأنها مكتوبة بـ <span className="bg-[#EFE7DA] px-1.5 py-0.5 rounded text-amber-950 font-bold border border-amber-200">قلم تظليل كلاسيكي</span>.
                        </span>
                      </p>

                      <p className="flex items-start gap-2">
                        <span className="text-amber-700 font-black shrink-0">📍</span>
                        <span>
                          يستخرج النظام تلقائياً جميع المصطلحات الصعبة بالإنجليزية مثل <span className="bg-[#EFE7DA] px-1 rounded border border-amber-200 font-bold text-amber-950">Gene Therapy</span> ويقوم بتظليلها لتظهر بأبهى حلة.
                        </span>
                      </p>

                      {/* Lined callout preview */}
                      <div className="bg-[#F5EFEB] border border-[#D3C2B5] p-4 rounded-xl space-y-2 text-slate-800">
                        <span className="bg-amber-800 text-amber-50 text-[10px] font-black px-2 py-0.5 rounded">💡 تنبيه المذاكرة</span>
                        <p className="text-xs font-bold leading-relaxed">
                          الدفاتر المنسقة بطريقة بصرية وأسهم ملونة ترفع نسبة استذكار الطلاب وتزيد مبيعات ملزمتك بنسبة 200%! 📈🚀
                        </p>
                      </div>

                      <p className="flex items-start gap-2">
                        <span className="text-amber-700 font-black shrink-0">📍</span>
                        <span>
                          يمكنك تعديل اسمك كطالب بائع وسيقوم النظام بطباعة جملة **"تم إعداد هذا التلخيص بواسطة الطالب: [اسمك]"** في ذيل كل صفحة لحماية حقوقك.
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Notebook Footer Watermark */}
                  <div className="absolute bottom-6 left-8 right-8 border-t border-amber-900/10 pt-4 flex justify-between text-[9px] text-amber-900/60 font-bold z-15">
                    <span>متجر لمّاح للملازم</span>
                    <span>تم إعداد هذا التفريغ بواسطة: {customStudentName || fullName}</span>
                    <span>صفحة المعاينة</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotebookCreatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white">جاري التحميل...</div></div>}>
      <NotebookCreatorContent />
    </Suspense>
  );
}

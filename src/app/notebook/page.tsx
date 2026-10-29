"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getFingerprint as getThumbmark } from '@thumbmarkjs/thumbmarkjs';
import { 
  BookOpen, Sparkles, Lock, ArrowLeft, Upload, FileText, 
  User, CheckCircle, Download, AlertTriangle, PlayCircle, Loader2,
  Plus, X, Crown, History, LogOut, Sun, Moon, LayoutDashboard, ShoppingBag,
  ExternalLink, Eye, GraduationCap
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import SmartGenerateButton from "@/components/SmartGenerateButton";
import { createClient } from "@/lib/supabase";
import { getApiBaseUrl } from "@/lib/apiConfig";

const StudyFocusTimer = dynamic(() => import("@/components/dashboard/StudyFocusTimer"), {
  ssr: false,
});

function NotebookSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden" dir="rtl">
      <AppHeader activePage="notebook" />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative z-10">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm animate-pulse">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span>جاري فتح وتجهيز الدفتر الأكاديمي...</span>
        </div>
      </div>
    </div>
  );
}

function NotebookCreatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get("history_id");
  const jobIdParam = searchParams.get("job_id");
  const titleParam = searchParams.get("title");
  const studentNameParam = searchParams.get("student_name");
  const { session, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [quotaFetched, setQuotaFetched] = useState<boolean>(false);
  const [planName, setPlanName] = useState<string>("");
  const [canGenerateNotebook, setCanGenerateNotebook] = useState<boolean>(false);
  const [quota, setQuota] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const cachedPlan = localStorage.getItem("cached_user_plan") || "";
      if (cachedPlan) setPlanName(cachedPlan);
      const cachedQuota = localStorage.getItem("cached_user_quota");
      if (cachedQuota !== null && !isNaN(Number(cachedQuota))) setQuota(Number(cachedQuota));
      const cachedFlag = localStorage.getItem("cached_can_generate_notebook");
      if (cachedFlag !== null) {
        setCanGenerateNotebook(cachedFlag === "true");
      } else if (cachedPlan) {
        const cp = cachedPlan.toLowerCase();
        setCanGenerateNotebook(
          Boolean(
            (cp.includes("الذهبية") || cp.includes("النخبة") || cp.includes("elite") || cp.includes("100") || cp.includes("full term")) &&
            !cp.includes("الإنقاذ") && !cp.includes("الميدتيرم") && !cp.includes("التفوق") && !cp.includes("الأساسية") && !cp.includes("مجاني") && cp !== "free"
          )
        );
      }
    } catch {}
  }, []);
  const [fullName, setFullName] = useState<string>("");

  // -- FINGERPRINTING LOGIC --
  const getFingerprint = async () => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("device_id_v3");
      if (existing) return existing;
    }
    try {
      const fp = await Promise.race([
        getThumbmark(),
        new Promise<string>((resolve) => setTimeout(() => resolve(`device_${Date.now().toString(36)}`), 600))
      ]);
      if (typeof window !== "undefined" && fp) {
        localStorage.setItem("device_id_v3", fp);
      }
      return fp;
    } catch (e) {
      return `fallback_${Math.random().toString(36).substring(7)}`;
    }
  };

  const getDeviceMetadata = async () => {
    if (typeof window === "undefined") return "";
    const fp = await getFingerprint();
    const metadata = {
      fingerprint: fp,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      battery: null as any
    };

    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        metadata.battery = {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        };
      } catch (e) { }
    }
    return JSON.stringify(metadata);
  };

  // Form states
  const [lectureTitle, setLectureTitle] = useState<string>(() => titleParam || "");
  const [customStudentName, setCustomStudentName] = useState<string>(() => studentNameParam || "");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [lectureUrls, setLectureUrls] = useState<string[]>([""]);
  const [lectureUrl, setLectureUrl] = useState<string>("");
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState<string>("");
  const [endPage, setEndPage] = useState<string>("");
  const [notebookType, setNotebookType] = useState<"university" | "course_podcast">("university");
  const [languageMode, setLanguageMode] = useState<"bilingual" | "english" | "arabic">("bilingual");
  const [paperStyle, setPaperStyle] = useState<"ruled" | "grid" | "dotted">("ruled");
  
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

  // Multi-Audio Upload Computations
  const isMultiAudioUploading = multiAudioFiles.length > 0 && multiAudioFiles.some(f => f.isUploading || !f.tempId);
  const isAnyAudioUploading = isAudioUploading || isMultiAudioUploading;
  const completedAudioCount = multiAudioFiles.filter(f => !f.isUploading && Boolean(f.tempId)).length;
  const totalAudioCount = multiAudioFiles.length;
  const avgMultiProgress = totalAudioCount > 0
    ? Math.round(multiAudioFiles.reduce((acc, f) => acc + (f.progress || 0), 0) / totalAudioCount)
    : 0;

  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ downloadUrl: string; previewUrl?: string; title: string; isPrep?: boolean } | null>(() => {
    if (jobIdParam) {
      return {
        downloadUrl: `/api/v1/notebook/download/${jobIdParam}.pdf`,
        previewUrl: "",
        title: titleParam || "دفتر دراسي"
      };
    }
    return null;
  });

  // Fetch current user quota and plan name when authLoading changes or session changes
  useEffect(() => {
    if (authLoading) return;
    
    if (session) {
      const fetchQuota = async () => {
        const fp = await getFingerprint();
        const meta = await getDeviceMetadata();
        const apiUrl = getApiBaseUrl();
        fetch(`${apiUrl}/api/v1/subscription/quota`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "X-Fingerprint": fp,
            "X-Device-Metadata": meta
          }
        })
        .then(async r => {
          const data = await r.json();
          if (r.ok) {
            const rawPlan = data.plan_name || "free";
            setPlanName(rawPlan);
            setQuota(data.quota_remaining ?? 0);
            setFullName(data.full_name || "");
            setCustomStudentName(data.full_name || "");

            const p = rawPlan.toLowerCase();
            const isEligible = Boolean(
              data.can_generate_notebook ||
              ((p.includes("الذهبية") || p.includes("النخبة") || p.includes("elite") || p.includes("100") || p.includes("full term")) &&
              !p.includes("الإنقاذ") && !p.includes("الميدتيرم") && !p.includes("التفوق") && !p.includes("الأساسية") && !p.includes("مجاني") && p !== "free")
            );
            setCanGenerateNotebook(isEligible);
            setQuotaFetched(true);

            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("cached_user_quota", String(data.quota_remaining ?? 0));
                localStorage.setItem("cached_user_plan", rawPlan);
                localStorage.setItem("cached_can_generate_notebook", String(isEligible));
              } catch {}
            }
          } else {
            // Direct Supabase Fallback if API returns error
            if (session?.user?.id) {
              try {
                const supabase = createClient();
                const { data: subData } = await supabase
                  .from("user_subscriptions")
                  .select("*, subscription_plans(*)")
                  .eq("user_id", session.user.id)
                  .eq("status", "active")
                  .gte("expires_at", new Date().toISOString())
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (subData?.subscription_plans?.name) {
                  const spName = subData.subscription_plans.name;
                  const remaining = Math.max(0, (subData.subscription_plans.lecture_quota || 0) - (subData.lectures_used || 0));
                  setPlanName(spName);
                  setQuota(remaining);
                  const p = spName.toLowerCase();
                  const isEligible = Boolean(
                    (p.includes("الذهبية") || p.includes("النخبة") || p.includes("elite") || p.includes("100") || p.includes("full term")) &&
                    !p.includes("الإنقاذ") && !p.includes("الميدتيرم") && !p.includes("التفوق") && !p.includes("الأساسية") && !p.includes("مجاني") && p !== "free"
                  );
                  setCanGenerateNotebook(isEligible);
                }
              } catch (sbErr) {
                console.warn("Direct Supabase fallback error:", sbErr);
              }
            }
            setQuotaFetched(true);
          }
        })
        .catch(async (e) => {
          console.error("Failed to load quota info from API, checking Supabase directly:", e);
          if (session?.user?.id) {
            try {
              const supabase = createClient();
              const { data: subData } = await supabase
                .from("user_subscriptions")
                .select("*, subscription_plans(*)")
                .eq("user_id", session.user.id)
                .eq("status", "active")
                .gte("expires_at", new Date().toISOString())
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (subData?.subscription_plans?.name) {
                const spName = subData.subscription_plans.name;
                const remaining = Math.max(0, (subData.subscription_plans.lecture_quota || 0) - (subData.lectures_used || 0));
                setPlanName(spName);
                setQuota(remaining);
                const p = spName.toLowerCase();
                const isEligible = Boolean(
                  (p.includes("الذهبية") || p.includes("النخبة") || p.includes("elite") || p.includes("100") || p.includes("full term")) &&
                  !p.includes("الإنقاذ") && !p.includes("الميدتيرم") && !p.includes("التفوق") && !p.includes("الأساسية") && !p.includes("مجاني") && p !== "free"
                );
                setCanGenerateNotebook(isEligible);
              }
            } catch (sbErr) {
              console.warn("Direct Supabase fallback error:", sbErr);
            }
          }
          setQuotaFetched(true);
        });
      };
      fetchQuota();
    }
  }, [session, authLoading]);

  // Sync from query params if navigated
  useEffect(() => {
    if (jobIdParam) {
      setResult({
        downloadUrl: `/api/v1/notebook/download/${jobIdParam}.pdf`,
        previewUrl: "",
        title: titleParam || "دفتر دراسي"
      });
      if (titleParam) setLectureTitle(titleParam);
      if (studentNameParam) setCustomStudentName(studentNameParam);
    }
  }, [jobIdParam, titleParam, studentNameParam]);

  // Load saved notebook from history_id if job_id was not provided
  useEffect(() => {
    const fetchNotebookHistory = async () => {
      if (session && historyId && !jobIdParam) {
        setIsProcessing(true);
        const apiUrl = getApiBaseUrl();
        try {
          const response = await fetch(`${apiUrl}/api/v1/subscription/history/${historyId}`, {
            headers: {
              "Authorization": `Bearer ${session.access_token}`
            }
          });
          
          if (!response.ok) throw new Error("الدفتر غير موجود أو تم حذفه");
          
          const data = await response.json();
          if (data?.metadata?.job_id) {
            const isDocOnly = data.metadata.is_prep !== undefined
              ? !!data.metadata.is_prep
              : (data.metadata.has_audio !== undefined ? !data.metadata.has_audio : !data.metadata.transcript?.trim());

            setLectureTitle(data.metadata.title || "دفتر دراسي");
            setCustomStudentName(data.metadata.student_name || "");
            setResult({
              downloadUrl: `/api/v1/notebook/download/${data.metadata.job_id}.pdf`,
              previewUrl: data.metadata.preview_url || "",
              title: data.metadata.title || "دفتر دراسي",
              isPrep: isDocOnly
            });
          } else {
            throw new Error("هذا الأرشيف لا يحتوي على ملف جاهز.");
          }
        } catch (err: any) {
          setError(err.message || "حدث خطأ أثناء تحميل تفاصيل الدفتر.");
        } finally {
          setIsProcessing(false);
          setProgressStep("");
          setProgressMessage("");
        }
      }
    };
    fetchNotebookHistory();
  }, [session, historyId, jobIdParam]);

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
    const apiUrl = getApiBaseUrl();
    let uploaderUrl = process.env.NEXT_PUBLIC_UPLOADER_URL || apiUrl;
    if (uploaderUrl.includes("8080") || uploaderUrl.includes(":8000")) {
      uploaderUrl = apiUrl;
    }

    xhr.open("POST", `${uploaderUrl}/api/v1/summarize/upload-temp`, true);
    if (session?.access_token) {
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    }

    xhr.upload.onprogress = (event: ProgressEvent) => {
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
    const apiUrl = getApiBaseUrl();
    let uploaderUrl = process.env.NEXT_PUBLIC_UPLOADER_URL || apiUrl;
    if (uploaderUrl.includes("8080") || uploaderUrl.includes(":8000")) {
      uploaderUrl = apiUrl;
    }

    xhr.open('POST', `${uploaderUrl}/api/v1/summarize/upload-temp`, true);
    if (session?.access_token) {
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    }

    xhr.upload.onprogress = (event: ProgressEvent) => {
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
    const hasPdfFile = !!pdfFile || !!pdfTempId;

    if (uploadMode === "file") {
      if (isAudioUploading) {
        setError("⏳ يرجى الانتظار حتى يكتمل رفع الملف الصوتي إلى السيرفر.");
        return;
      }
      if (isPdfUploading) {
        setError("⏳ يرجى الانتظار حتى يكتمل رفع ملف السلايدات إلى السيرفر.");
        return;
      }
      if (multiAudioFiles.length > 0) {
        const incomplete = multiAudioFiles.filter(item => item.isUploading || !item.tempId);
        if (incomplete.length > 0) {
          const completed = multiAudioFiles.length - incomplete.length;
          setError(`⏳ يرجى الانتظار، جاري رفع التسجيلات الصوتية للسيرفر (تم اكتمال ${completed} من أصل ${multiAudioFiles.length} ملفات).`);
          return;
        }
      }
    }

    if (!hasAudioFile && !hasPdfFile) {
      setError("يرجى إرفاق ملف صوتي أو ملف عرض (PDF/PPTX) أولاً.");
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

    const apiUrl = getApiBaseUrl();
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

    if (startPage.trim()) formData.append("start_page", startPage.trim());
    if (endPage.trim()) formData.append("end_page", endPage.trim());

    if (lectureTitle) formData.append("lecture_title", lectureTitle);
    formData.append("student_name", customStudentName || fullName);
    formData.append("notebook_type", notebookType);
    formData.append("language_mode", languageMode);

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
                const currentIsDocOnly = !(audioFile || multiAudioFiles.length > 0);
                setResult({
                  downloadUrl: payload.download_url,
                  previewUrl: payload.preview_url,
                  title: payload.title,
                  isPrep: currentIsDocOnly
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
    if (!name || name === "free" || name === "مجاني" || name.includes("بدون")) return "لا يوجد اشتراك نشط";
    if (name.includes("الذهبية") || name === "الباقة الذهبية" || name.toLowerCase().includes("elite") || name.toLowerCase().includes("full term")) return "باقة النخبة (Elite - 100 ₪)";
    if (name.includes("الميدتيرم") || name.includes("التفوق") || name.toLowerCase().includes("premium")) return "باقة التفوق (Premium - 60 ₪)";
    if (name.includes("الإنقاذ") || name.includes("الأساسية") || name.toLowerCase().includes("essential")) return "الباقة الأساسية (Essential - 25 ₪)";
    return name;
  };

  const is100Plan = Boolean(
    canGenerateNotebook ||
    (planName && (
      planName.includes("الذهبية") ||
      planName.includes("النخبة") ||
      planName.toLowerCase().includes("elite") ||
      planName.includes("100") ||
      planName.toLowerCase().includes("full term")
    ) &&
    !planName.includes("الإنقاذ") &&
    !planName.includes("الميدتيرم") &&
    !planName.includes("التفوق") &&
    !planName.includes("الأساسية") &&
    !planName.includes("مجاني") &&
    planName !== "free")
  );

  // 1. Initial hydration and auth check skeleton
  if (!isMounted || authLoading) {
    return <NotebookSkeleton />;
  }

  // 2. GUEST PAYWALL (FOR NOT LOGGED IN USERS)
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white flex flex-col font-sans relative overflow-x-hidden" dir="rtl">
        <AppHeader activePage="notebook" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="max-w-xl w-full text-center space-y-6 bg-white dark:bg-[#0b0f19] p-7 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-xs mb-1">
              <BookOpen className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <span>خاصة بمشتركي باقة النخبة (100 ₪)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                توليد الدفاتر الأكاديمية الذكية
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                حوّل تفريغ محاضراتك وسلايداتك إلى دفاتر دراسية منسقة (A4 PDF) جاهزة للطباعة الورقية وللنشر في المتجر. هذه الميزة متاحة لمشتركي باقة النخبة.
              </p>
            </div>

            {/* Premium Features Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right my-4 max-w-lg mx-auto">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">دفاتر تلخيص جاهزة</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">توليد دفاتر A4 منسقة أكاديمياً بجودة عالية للطباعة.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">رخصة النشر بالمتجر</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">طرح وتداول الدفاتر في متجر المنصة للطلاب الآخرين.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1">تغطية كاملة للفصل</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">رصيد 4,500 دقيقة ذكية (75 ساعة كاملة) يكفي كافة مساقات الفصل.</p>
              </div>
            </div>

            <div className="space-y-2.5 max-w-xs sm:max-w-sm mx-auto pt-1">
              <Link 
                href="/auth?redirect=/notebook"
                prefetch={true}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3 px-6 rounded-xl shadow-md shadow-indigo-600/20 transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>تسجيل الدخول للاشتراك</span>
                <ArrowLeft className="w-4 h-4 ml-1" />
              </Link>
              
              <Link 
                href="/plans"
                prefetch={true}
                className="w-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-2.5 px-6 rounded-xl transition border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>استعراض الباقات والأسعار</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. SUBSCRIBED USERS ON LOWER TIERS (FREE, 25 ILS, 60 ILS) PAYWALL
  if (session && !is100Plan && !result) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden" dir="rtl">
        <AppHeader quota={quota} activePage="notebook" />

        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
          <div className="max-w-md w-full text-center space-y-7 bg-white dark:bg-[#0b0f19] p-8 sm:p-11 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none">
            
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center mx-auto text-slate-800 dark:text-slate-200">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                <span>خاص بمشتركي باقة النخبة (100 ₪)</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                توليد الدفاتر الأكاديمية
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                إنشاء وتوليد دفاتر المذاكرة A4 القابلة للطباعة ورخصة النشر بالمتجر متاحة حصرياً لمشتركي باقة النخبة.
              </p>
            </div>

            {/* Current Plan Pill */}
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className={`w-2 h-2 rounded-full ${(!planName || planName === 'free' || planName === 'مجاني' || planName.includes('بدون')) ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                <span>{(!planName || planName === 'free' || planName === 'مجاني' || planName.includes('بدون')) ? "حالة الاشتراك:" : "باقتك الحالية:"}</span>
                <span className="font-bold text-slate-900 dark:text-white">{getFriendlyPlanName(planName)}</span>
                {quota !== null && quota > 0 && <span className="text-slate-400">({quota} دقيقة)</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Link 
                href="/plans"
                prefetch={true}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>الترقية إلى باقة النخبة (100 ₪)</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              
              <Link 
                href="/plans"
                prefetch={true}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-6 rounded-xl transition border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>استعراض الباقات والأسعار</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300">
      {/* Floating Header */}
      <AppHeader quota={quota} activePage="notebook" />

      {/* Main Content Area - Generous, beautiful spacing */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        
        {result ? (
          // Dedicated Full-Width Notebook Viewer (When opened from history or after generation)
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-indigo-500/35 p-5 sm:p-7 rounded-3xl sm:rounded-[2.5rem] shadow-xs relative space-y-6 transition-all">
              {/* Header: Title + Navigation / Creation Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {result.title || "دفترك الملخص جاهز"}
                    </h1>
                    {(customStudentName || fullName) && (
                      <span className="text-xs text-slate-500 font-medium block mt-0.5">
                        إعداد: {customStudentName || fullName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                  <StudyFocusTimer currentHistoryId={historyId} lectureTitle={result.title || lectureTitle} />

                  <button
                    onClick={() => {
                      setResult(null);
                      router.push("/notebook");
                    }}
                    className="h-9 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200/80 dark:border-indigo-500/30 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء دفتر جديد</span>
                  </button>

                  <Link
                    href="/history"
                    prefetch={true}
                    className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200/80 dark:border-white/10 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>سجل الدفاتر</span>
                  </Link>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* 1. Primary Action: Download PDF */}
                {(() => {
                  const cleanTitle = (result.title || lectureTitle || "المادة الدراسية")
                    .replace(/^دفتر\s+/, "")
                    .replace(/^محاضرة\s+/, "")
                    .replace(/[\\/*?:"<>|]/g, " ")
                    .trim() || "المادة الدراسية";
                  const isPrep = result.isPrep ?? !(audioFile || multiAudioFiles.length > 0);
                  const notebookFilename = `${cleanTitle} - ${isPrep ? "دفتر تحضير سلايدات" : "دفتر مخطط فويسات"} - لمّاح.pdf`;
                  const sep = result.downloadUrl.includes("?") ? "&" : "?";
                  const finalDownloadUrl = `${getApiBaseUrl()}${result.downloadUrl}${sep}download=true&title=${encodeURIComponent(cleanTitle)}&is_prep=${isPrep}`;

                  return (
                    <a 
                      href={finalDownloadUrl}
                      download={notebookFilename}
                      className="sm:col-span-6 h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>تحميل الدفتر (PDF)</span>
                    </a>
                  );
                })()}

                {/* 2. Secondary Action: Fullscreen Preview */}
                <a 
                  href={`${getApiBaseUrl()}${result.downloadUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:col-span-3 h-11 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-white/10 cursor-pointer"
                  title="معاينة في نافذة كاملة"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>ملء الشاشة</span>
                </a>

                {/* 3. Monetization Action: Publish to Marketplace */}
                <Link 
                  href={`/marketplace/publish?pdfUrl=${encodeURIComponent(result.downloadUrl || "")}&previewUrl=${encodeURIComponent(result.previewUrl || "")}&title=${encodeURIComponent(result.title || "")}&studentName=${encodeURIComponent(customStudentName || fullName || "")}`}
                  className="sm:col-span-3 h-11 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-white/10 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>نشر بالمتجر</span>
                </Link>
              </div>

              {/* PDF Preview Iframe */}
              <div className="w-full h-[650px] sm:h-[820px] bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-850 relative shadow-inner">
                <iframe 
                  src={`${getApiBaseUrl()}${result.downloadUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-none"
                  title="Notebook Preview"
                />
              </div>
            </div>
          </div>
        ) : historyId && isProcessing ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        ) : (
          /* Main Grid Content: 2 Balanced Columns */
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Form Settings Panel: 6 columns */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm transition-all">
              {/* Form Header: Clean, modern, focused */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-500/20 shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                      إنشاء دفتر ملخص جامعي ذكي
                    </h2>
                  </div>
                </div>
              </div>

              {/* 1. Lecture Files Upload */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  ملفات المحاضرة
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Audio File Box */}
                  <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer relative flex flex-col justify-center min-h-[115px] ${
                    audioFile || multiAudioFiles.length > 0 
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20" 
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-violet-400 hover:bg-violet-50/20 dark:hover:bg-violet-950/20"
                  }`}>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setError(null);
                          if (files.length === 1 && multiAudioFiles.length === 0) {
                            setAudioFile(files[0]);
                            setAudioUploadProgress(0);
                            setAudioTempId("");
                            uploadTempFile(files[0], true);
                          } else {
                            setAudioFile(null);
                            setAudioTempId("");
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
                        }
                      }} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    {audioFile || multiAudioFiles.length > 0 ? (
                      <div className="w-full z-20 relative flex items-center justify-between text-right gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isAnyAudioUploading
                              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                              : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {isAnyAudioUploading ? (
                              audioFile ? (
                                <span className="text-[10px] font-bold">{audioUploadProgress}%</span>
                              ) : (
                                <span className="text-[10px] font-bold">{avgMultiProgress}%</span>
                              )
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 text-right">
                            <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                              {audioFile ? audioFile.name : `${multiAudioFiles.length} تسجيلات صوتية`}
                            </p>
                            <p className="text-[10px] font-bold mt-0.5">
                              {isAnyAudioUploading ? (
                                audioFile ? (
                                  <span className="text-indigo-600 dark:text-indigo-400">جاري الرفع... ({audioUploadProgress}%)</span>
                                ) : (
                                  <span className="text-indigo-600 dark:text-indigo-400">جاري الرفع... ({completedAudioCount} من {totalAudioCount} جاهزة)</span>
                                )
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400">جاهز للتحليل ✔️</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setAudioFile(null);
                            setAudioTempId("");
                            setMultiAudioFiles([]);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                          title="إلغاء الملف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 pointer-events-none">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          ملف الصوت
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          MP3, M4A, WAV
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PDF / Slides Box */}
                  <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer relative flex flex-col justify-center min-h-[115px] ${
                    pdfFile 
                      ? "border-violet-500 bg-violet-50/40 dark:bg-violet-950/20" 
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-violet-400 hover:bg-violet-50/20 dark:hover:bg-violet-950/20"
                  }`}>
                    <input 
                      type="file" 
                      accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setPdfFile(e.target.files[0]);
                          uploadTempFile(e.target.files[0], false);
                        }
                      }} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    {pdfFile ? (
                      <div className="w-full z-20 relative flex flex-col gap-2.5 text-right">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 text-right">
                              <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate max-w-[130px]">{pdfFile.name}</p>
                              <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold mt-0.5">{isPdfUploading ? `${pdfUploadProgress}%` : "جاهز للربط"}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setPdfFile(null);
                              setPdfTempId("");
                              setStartPage("");
                              setEndPage("");
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                            title="إلغاء الملف"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Page / Slide Range Selector */}
                        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              📖 تحديد صفحات معينة (اختياري)
                            </span>
                            {(startPage || endPage) && (
                              <button
                                type="button"
                                onClick={() => { setStartPage(""); setEndPage(""); }}
                                className="text-[9px] text-rose-500 hover:text-rose-600 font-bold"
                              >
                                الكل
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <input
                                type="number"
                                min="1"
                                placeholder="من صفحة"
                                value={startPage}
                                onChange={(e) => setStartPage(e.target.value)}
                                className="w-full text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                min="1"
                                placeholder="إلى صفحة"
                                value={endPage}
                                onChange={(e) => setEndPage(e.target.value)}
                                className="w-full text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
                              />
                            </div>
                          </div>
                          <p className="text-[9px] text-violet-600 dark:text-violet-400 font-medium mt-1">
                            {startPage || endPage
                              ? `سيتم تحضير الدفتر من صفحة ${startPage || 1} إلى ${endPage || "النهاية"}.`
                              : "💡 حدد نطاقاً معيناً لتلخيص شابتر بدلاً من الكتاب كاملاً."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 pointer-events-none">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mx-auto">
                          <FileText className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          السلايدات (اختياري)
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          PDF أو PowerPoint
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Booklet Metadata: Author & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    اسم الطالب (اختياري)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={customStudentName} 
                      onChange={(e) => setCustomStudentName(e.target.value)}
                      placeholder="اسمك على الغلاف" 
                      className="w-full bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pr-10 pl-3.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-violet-500/20 shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    عنوان الدفتر (اختياري)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <FileText className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={lectureTitle} 
                      onChange={(e) => setLectureTitle(e.target.value)}
                      placeholder="اسم المادة أو المحاضرة" 
                      className="w-full bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pr-10 pl-3.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-violet-500/20 shadow-2xs transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Language Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  لغة الصياغة والشرح
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLanguageMode("bilingual")}
                    className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer text-xs font-bold flex items-center justify-center overflow-visible min-h-[42px] ${
                      languageMode === "bilingual"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black border border-slate-200/80 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="whitespace-nowrap overflow-visible leading-relaxed">ثنائي اللغة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageMode("arabic")}
                    className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer text-xs font-bold flex items-center justify-center overflow-visible min-h-[42px] ${
                      languageMode === "arabic"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black border border-slate-200/80 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="whitespace-nowrap overflow-visible leading-relaxed">عربي كامل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguageMode("english")}
                    className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer text-xs font-bold flex items-center justify-center overflow-visible min-h-[42px] ${
                      languageMode === "english"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black border border-slate-200/80 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="whitespace-nowrap overflow-visible leading-relaxed">English</span>
                  </button>
                </div>
              </div>

              {/* 4. Submit Button */}
              <div className="pt-2">
                <SmartGenerateButton
                  onClick={startNotebookProcessing}
                  disabled={
                    (!audioFile && multiAudioFiles.length === 0 && !pdfFile && !pdfTempId) ||
                    isAnyAudioUploading ||
                    isPdfUploading
                  }
                  isProcessing={isProcessing}
                  progressStep={progressStep}
                  progressMessage={progressMessage}
                  quota={quota}
                  text={
                    isAnyAudioUploading
                      ? (multiAudioFiles.length > 0
                          ? `جاري رفع التسجيلات (${completedAudioCount}/${totalAudioCount})...`
                          : `جاري رفع الملف الصوتي (${audioUploadProgress}%)...`)
                      : isPdfUploading
                      ? `جاري رفع السلايدات (${pdfUploadProgress}%)...`
                      : "توليد دفتر ملخص للمحاضرة للامتحان ✨"
                  }
                  variant="pill"
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Right Placeholder Mockup Canvas: 6 columns */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[460px] shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center mb-4 shadow-xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                مساحة عرض الدفتر
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-sm leading-relaxed">
                ارفع ملفات المحاضرة واضغط على زر التوليد ليظهر لك الدفتر كملف PDF جاهز للمعاينة والتحميل والطباعة فوراً هنا.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function NotebookCreatorPage() {
  return (
    <Suspense fallback={<NotebookSkeleton />}>
      <NotebookCreatorContent />
    </Suspense>
  );
}

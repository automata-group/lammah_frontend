"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getFingerprint as getThumbmark } from "@thumbmarkjs/thumbmarkjs";
import {
  Loader2,
  Upload,
  FileAudio,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lock,
  Clock,
  X,
  ArrowRight,
  ArrowLeft,
  BrainCircuit,
  Lightbulb,
  Award,
  MessageCircle,
  PenTool,
  CreditCard,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import SmartGenerateButton from "@/components/SmartGenerateButton";
import HeroSimulation from "@/components/landing/HeroSimulation";
import { createClient } from "@/lib/supabase";

function SummarizeContent() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Upload States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [lectureUrl, setLectureUrl] = useState("");
  
  interface UploadedAudio {
    id: string;
    file: File;
    tempId?: string;
    progress: number;
    isUploading: boolean;
  }
  const [multiAudioFiles, setMultiAudioFiles] = useState<UploadedAudio[]>([]);
  const [lectureUrls, setLectureUrls] = useState<string[]>([""]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [quota, setQuota] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const cachedQuota = localStorage.getItem("cached_user_quota");
      if (cachedQuota !== null && !isNaN(Number(cachedQuota))) {
        return Number(cachedQuota);
      }
    }
    return null;
  });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialEstimate, setInitialEstimate] = useState<number>(38);
  const [serverProgressPercent, setServerProgressPercent] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cached_user_plan") || "";
    }
    return "";
  });
  const [isQuotaChecking, setIsQuotaChecking] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cached_user_quota") === null;
    }
    return true;
  });
  // Pre-upload States
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [audioTempId, setAudioTempId] = useState<string | null>(null);
  const [pdfTempId, setPdfTempId] = useState<string | null>(null);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  const hasQuota = quota !== null ? quota > 0 : false;
  const hasPaidPlan = Boolean(
    hasQuota ||
    (planName &&
      planName !== "free" &&
      planName !== "مجاني" &&
      !planName.includes("مجاني") &&
      !planName.toLowerCase().includes("free"))
  );
  const isDemoMode = !hasPaidPlan && !hasQuota && (quota !== null && quota <= 0);

  // Multi-Audio Upload Computations
  const isMultiAudioUploading = multiAudioFiles.length > 0 && multiAudioFiles.some(f => f.isUploading || !f.tempId);
  const isAnyAudioUploading = isAudioUploading || isMultiAudioUploading;
  const completedAudioCount = multiAudioFiles.filter(f => !f.isUploading && Boolean(f.tempId)).length;
  const totalAudioCount = multiAudioFiles.length;
  const avgMultiProgress = totalAudioCount > 0
    ? Math.round(multiAudioFiles.reduce((acc, f) => acc + (f.progress || 0), 0) / totalAudioCount)
    : 0;

  // Dhikr Counter during processing
  const dhikrPhrases = [
    "أستغفر الله العظيم",
    "لا إله إلا الله",
    "الحمد لله",
    "سبحان الله وبحمده",
    "الله أكبر",
    "اللهم صلِّ على سيدنا محمد",
    "لا حول ولا قوة إلا بالله"
  ];
  const [dhikrTotal, setDhikrTotal] = useState(0);
  const [dhikrCurrentPhaseCount, setDhikrCurrentPhaseCount] = useState(0);
  const [currentDhikrIndex, setCurrentDhikrIndex] = useState(0);
  const [dhikrBurst, setDhikrBurst] = useState<number | null>(null);

  useEffect(() => {
    if (!dhikrBurst) return;
    const timer = setTimeout(() => setDhikrBurst(null), 600);
    return () => clearTimeout(timer);
  }, [dhikrBurst]);

  const handleDhikrClick = () => {
    setDhikrTotal(prev => prev + 1);
    setDhikrBurst(Date.now());
    const newPhaseCount = dhikrCurrentPhaseCount + 1;
    if (newPhaseCount >= 10) {
      setDhikrCurrentPhaseCount(0);
      setCurrentDhikrIndex(prev => (prev + 1) % dhikrPhrases.length);
    } else {
      setDhikrCurrentPhaseCount(newPhaseCount);
    }
  };

  const getFingerprint = async () => {
    if (typeof window === "undefined") return "";
    let fp = localStorage.getItem("device_id_v3");
    if (!fp) {
      try {
        fp = await getThumbmark();
        localStorage.setItem("device_id_v3", fp);
      } catch (e) {
        fp = `fallback_${Math.random().toString(36).substring(7)}`;
      }
    }
    return fp;
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
    return JSON.stringify(metadata);
  };

  // Progress Countdown Timer (Intelligent, asymptotic countdown)
  useEffect(() => {
    if (!isProcessing && !isStreaming) return;
    if (timeLeft === null) return;
    const intervalMs = timeLeft <= 10 ? 3000 : 1000;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 5) return 5; // Hold at 5s minimum grace period while awaiting server response
        return prev - 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isProcessing, isStreaming, timeLeft]);

  const uploadToTemp = (file: File, type: 'audio' | 'pdf') => {
    if (!hasPaidPlan || quota === null || quota <= 0) {
      setError("🔒 يلزم وجود اشتراك نشط لرفع ومعالجة المحاضرات. يرجى الاشتراك وتأكيد الدفع عبر واتساب لنفعّل حسابك.");
      return;
    }
    const isAudio = type === 'audio';
    if (isAudio) setIsAudioUploading(true);
    else setIsPdfUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
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
    if (!hasPaidPlan || quota === null || quota <= 0) {
      setError("🔒 يلزم وجود اشتراك نشط لرفع ومعالجة المحاضرات. يرجى الاشتراك وتأكيد الدفع عبر واتساب لنفعّل حسابك.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
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

  const fetchQuota = React.useCallback(async () => {
    if (!session?.access_token) return;
    let resolved = false;

    // 1. Try Backend API
    try {
      const fp = (typeof window !== "undefined" && localStorage.getItem("device_id_v3")) || await getFingerprint();
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "X-Fingerprint": String(fp || "")
        }
      });

      if (r.status === 401) {
        await signOut();
        router.replace("/login");
        return;
      }
      if (r.ok) {
        const data = await r.json();
        if (data.quota_remaining !== undefined) {
          setQuota(data.quota_remaining);
          setPlanName(data.plan_name || "");
          setIsQuotaChecking(false);
          resolved = true;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cached_user_quota", String(data.quota_remaining ?? 0));
              localStorage.setItem("cached_user_plan", data.plan_name || "");
            } catch {}
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Backend quota check failed, checking direct Supabase:", e);
    }

    // 2. Direct Supabase Fallback (Bulletproof)
    if (!resolved && session?.user?.id) {
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

        if (subData?.subscription_plans) {
          const spName = subData.subscription_plans.name;
          const remaining = Math.max(0, (subData.subscription_plans.lecture_quota || 0) - (subData.lectures_used || 0));
          setQuota(remaining);
          setPlanName(spName);
          setIsQuotaChecking(false);
          resolved = true;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cached_user_quota", String(remaining));
              localStorage.setItem("cached_user_plan", spName);
            } catch {}
          }
          return;
        }

        // Check profile quota
        const { data: prof } = await supabase
          .from("profiles")
          .select("quota_remaining, current_plan_id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (prof) {
          const pQuota = prof.quota_remaining ?? 0;
          setQuota(pQuota);
          if (pQuota > 0) {
            setPlanName("باقة إنقاذ الكويزات (Essential)");
          }
          setIsQuotaChecking(false);
          resolved = true;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cached_user_quota", String(pQuota));
              if (pQuota > 0) localStorage.setItem("cached_user_plan", "باقة إنقاذ الكويزات (Essential)");
            } catch {}
          }
          return;
        }
      } catch (sbErr) {
        console.error("Direct Supabase fallback failed in summarize:", sbErr);
      }
    }

    setIsQuotaChecking(false);
  }, [session, router, signOut]);

  useEffect(() => {
    fetchQuota();
  }, [session, fetchQuota]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const handleProcess = async (forceRawFiles: boolean = false) => {
    if (quota !== null && quota <= 0) {
      setError("🚫 رصيدك صفر دقيقة — لا يمكن رفع ومعالجة ملفات خاصة. يرجى شحن الرصيد للمتابعة.");
      return;
    }
    setError(null);

    // Validation: Enforce uploads to finish before processing
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

    const hasAudioFile = !!audioFile || multiAudioFiles.length > 0;
    const hasLectureUrl = (uploadMode === "url" && lectureUrl.trim().length > 0) || (uploadMode === "url" && lectureUrls.filter(u => u.trim()).length > 0);
    const hasPdfOnly = !hasAudioFile && !hasLectureUrl && (!!pdfFile || !!pdfTempId);
    if (!hasAudioFile && !hasLectureUrl && !hasPdfOnly) {
      setError(uploadMode === "url" ? "يرجى إدخال رابط المحاضرة أولاً." : "يرجى إرفاق ملف صوتي أو ملف PDF/PPTX للمعالجة.");
      return;
    }

    if (!hasPaidPlan || quota === null || quota <= 0) {
      setError("يلزم وجود اشتراك نشط لمعالجة المحاضرات. يرجى الاشتراك وتفعيل حسابك.");
      router.push("/plans");
      return;
    }

    if (!session) { router.replace("/login"); return; }

    if (uploadMode === "url") {
      const urlsToCheck = [];
      if (lectureUrl.trim()) urlsToCheck.push(lectureUrl.trim());
      lectureUrls.filter(u => u.trim()).forEach(u => urlsToCheck.push(u.trim()));

      for (const url of urlsToCheck) {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("drive.google.com") || lowerUrl.includes("google.com/drive") || lowerUrl.includes("zoom.us")) {
          setError("🚫 يرجى استخدام روابط يوتيوب فقط! 🎥");
          return;
        }
      }
    }

    setIsProcessing(true);
    setError(null);
    setIsStreaming(false);
    setQueuePosition(0);
    setProgressStep("جاري بدء المعالجة...");
    setServerProgressPercent(null);
    const isBatch = (uploadMode === "file" && multiAudioFiles.length > 1) || (uploadMode === "url" && lectureUrls.filter(u => u.trim()).length > 1);
    
    // حساب تقدير زمني دقيق وصادق بناءً على المدخلات الفعلية
    let estimatedSecs = 75;
    if (hasPdfOnly) {
      estimatedSecs = pdfFile ? Math.max(35, Math.min(85, Math.round(pdfFile.size / (1024 * 300)) * 5 + 30)) : 45;
    } else if (isBatch) {
      const audioCount = uploadMode === "file" ? multiAudioFiles.length : lectureUrls.filter(u => u.trim()).length;
      estimatedSecs = Math.max(120, audioCount * 50 + (pdfFile || pdfTempId ? 45 : 30));
    } else {
      estimatedSecs = (pdfFile || pdfTempId) ? 100 : 75;
    }

    setTimeLeft(estimatedSecs);
    setInitialEstimate(estimatedSecs);

    const endpoint = isBatch
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/summarize/process-batch-lectures`
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/summarize/process-lecture`;

    const formData = new FormData();
    formData.append("metadata", await getDeviceMetadata());

    if (isBatch) {
      if (uploadMode === "url") {
        const urls = lectureUrls.filter(u => u.trim());
        formData.append("lecture_urls", urls.join(","));
      } else {
        const tempIds = multiAudioFiles.map(item => item.tempId).filter(Boolean);
        if (tempIds.length === 0 && !hasPdfOnly) {
          setError("🚫 لم يتم استلام أي تسجيلات صوتية صالحة من السيرفر. يرجى الانتظار حتى اكتمال الرفع والمحاولة مجدداً.");
          setIsProcessing(false);
          return;
        }
        formData.append("audio_temp_ids", tempIds.join(","));
      }
    } else {
      if (uploadMode === "url") {
        const activeUrl = lectureUrl.trim() || lectureUrls.filter(u => u.trim())[0] || "";
        formData.append("lecture_url", activeUrl);
      } else {
        const activeTempId = audioTempId || multiAudioFiles[0]?.tempId || null;
        const activeFile = audioFile || multiAudioFiles[0]?.file || null;
        if (!forceRawFiles && activeTempId) {
          formData.append("audio_temp_id", activeTempId);
        } else if (activeFile) {
          formData.append("audio_file", activeFile);
        }
      }
    }

    if (!forceRawFiles && pdfTempId) formData.append("pdf_temp_id", pdfTempId);
    else if (pdfFile) formData.append("pdf_file", pdfFile);

    formData.append("auto_generate_past_exams", "true");

    try {
      const fp = await getFingerprint();
      const meta = await getDeviceMetadata();
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "X-Fingerprint": fp,
          "X-Device-Metadata": meta
        },
      });

      if (!response.ok) {
        try {
          const errData = await response.json();
          if (errData.detail === "temp_file_missing") {
            setAudioTempId(null);
            setPdfTempId(null);
            handleProcess(true);
            return;
          }
          const userMsg = errData.detail?.user_message;
          if (userMsg) {
            setError(userMsg);
            setIsProcessing(false);
            return;
          }
          throw new Error(typeof errData.detail === 'string' ? errData.detail : "فشلت المعالجة");
        } catch (e: any) {
          throw new Error(e.message || "حدث خطأ غير متوقع.");
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamBuffer = "";
      if (!reader) throw new Error("فشل فتح البث.");

      setIsStreaming(true);
      setIsProcessing(false);

      let hasReceivedDone = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        let boundary = streamBuffer.indexOf('\n\n');
        while (boundary !== -1) {
          const rawEvent = streamBuffer.slice(0, boundary);
          streamBuffer = streamBuffer.slice(boundary + 2);

          for (const line of rawEvent.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const p = JSON.parse(line.slice(6));
              switch (p.type) {
                case "error":
                  setError(p.message || "حدث خطأ أثناء معالجة المحاضرة.");
                  setIsProcessing(false);
                  setIsStreaming(false);
                  return;
                case "queued":
                case "queue_update":
                  setQueuePosition(p.position);
                  setProgressStep(`📋 الطابور: #${p.position}`);
                  break;
                case "processing":
                case "progress":
                  setQueuePosition(0);
                  if (p.message) setProgressStep(`${p.message}`);
                  if (typeof p.progress_percent === "number") {
                    setServerProgressPercent(p.progress_percent);
                  }
                  if (typeof p.time_estimate === "number") {
                    setTimeLeft(p.time_estimate);
                    setInitialEstimate(prev => Math.max(prev, p.time_estimate));
                  }
                  break;
                case "done":
                  hasReceivedDone = true;
                  setIsStreaming(false);
                  setIsProcessing(false);
                  if (p.history_id && typeof p.history_id === "string") {
                    // World-Class Instant Handoff Cache (0ms navigation)
                    try {
                      const instantPayload = {
                        metadata: {
                          job_id: p.job_id || p.history_id,
                          title: p.title || activeFileName || "محاضرة جامعية",
                          transcript: p.transcript || "",
                          annotations: p.annotations,
                          has_pdf: !!p.download_url,
                        },
                        downloadUrl: p.download_url || null,
                        cachedAt: Date.now(),
                      };
                      sessionStorage.setItem("lammah_instant_lecture_" + p.history_id, JSON.stringify(instantPayload));
                    } catch {}
                    router.push(`/dashboard?history_id=${p.history_id}`);
                  } else {
                    router.push(`/dashboard`);
                  }
                  return;
              }
            } catch {}
          }
          boundary = streamBuffer.indexOf('\n\n');
        }
      }

      if (!hasReceivedDone) {
        setIsStreaming(false);
        setIsProcessing(false);
        router.push(`/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء معالجة المحاضرة.");
      setIsProcessing(false);
      setIsStreaming(false);
    }
  };

  const isDocumentOnly = !audioFile && multiAudioFiles.length === 0 && uploadMode !== "url" && (!!pdfFile || !!pdfTempId);
  const activeFileName = useMemo(() => {
    if (uploadMode === "url") return lectureUrl.trim() || lectureUrls.find(u => u.trim()) || "رابط يوتيوب";
    if (multiAudioFiles.length > 1) return `${multiAudioFiles.length} ملفات صوتية`;
    if (audioFile) return audioFile.name;
    if (multiAudioFiles[0]) return multiAudioFiles[0].file.name;
    if (pdfFile) return pdfFile.name;
    return "محاضرة جامعية";
  }, [uploadMode, lectureUrl, lectureUrls, multiAudioFiles, audioFile, pdfFile]);

  const currentPipelineSteps = useMemo(() => {
    if (isDocumentOnly) {
      return [
        { id: "read", label: "قراءة السلايدات", icon: FileText },
        { id: "capsules", label: "استخراج الأفكار", icon: BrainCircuit },
        { id: "mindmap", label: "بنك الأسئلة والملخص", icon: Lightbulb },
        { id: "design", label: "ملف مخطط ومظلل", icon: Award }
      ];
    }
    return [
      { id: "audio", label: "تفريغ الصوت", icon: FileAudio },
      { id: "align", label: "مطابقة الشرائح", icon: FileText },
      { id: "mindmap", label: "استنتاج الأفكار", icon: BrainCircuit },
      { id: "design", label: "ملف مخطط ومظلل", icon: Award }
    ];
  }, [isDocumentOnly]);

  const progressPercent = useMemo(() => {
    // 1. الأولوية للنسبة المئوية الحقيقية القادمة من السيرفر
    if (serverProgressPercent !== null && typeof serverProgressPercent === "number") {
      return Math.min(100, Math.max(5, Math.round(serverProgressPercent)));
    }
    // 2. الحساب التدريجي المحسوب بدقة حسب مرحلة المعالجة الفعلية
    if (timeLeft === null || initialEstimate <= 0) return 8;
    const elapsed = Math.max(0, initialEstimate - timeLeft);
    const ratio = Math.min(1.0, elapsed / initialEstimate);

    // سقف منطقي بحسب المرحلة الفعلية حتى لا يقفز العداد إلى 98% أثناء تفريغ الصوت
    let ceiling = 85;
    if (progressStep) {
      if (progressStep.includes("5/5") || progressStep.includes("رسم") || progressStep.includes("تلوين") || progressStep.includes("المخطط") || progressStep.includes("تجهيز ملفك")) {
        ceiling = 96;
      } else if (progressStep.includes("4/5") || progressStep.includes("استنتاج") || progressStep.includes("يطابق") || progressStep.includes("يفكّر")) {
        ceiling = 82;
      } else if (progressStep.includes("2/5") || progressStep.includes("3/5") || progressStep.includes("قراءة") || progressStep.includes("الشرائح")) {
        ceiling = 65;
      } else if (progressStep.includes("1/5") || progressStep.includes("تفريغ") || progressStep.includes("يستمع") || progressStep.includes("المحاضرة #")) {
        ceiling = 55;
      } else if (progressStep.includes("0/5") || progressStep.includes("طابور") || progressStep.includes("بدء")) {
        ceiling = 20;
      }
    } else {
      ceiling = 60;
    }

    return Math.min(ceiling, Math.max(8, Math.round(ratio * ceiling)));
  }, [serverProgressPercent, timeLeft, initialEstimate, progressStep]);

  const activeStepIdx = useMemo(() => {
    if (progressStep) {
      if (progressStep.includes("5/5") || progressStep.includes("رسم") || progressStep.includes("تلوين") || progressStep.includes("المخطط") || progressStep.includes("تجهيز ملفك")) return 3;
      if (progressStep.includes("4/5") || progressStep.includes("استنتاج") || progressStep.includes("يطابق") || progressStep.includes("يفكّر")) return 2;
      if (progressStep.includes("2/5") || progressStep.includes("3/5") || progressStep.includes("قراءة") || progressStep.includes("الشرائح")) return 1;
      if (progressStep.includes("1/5") || progressStep.includes("تفريغ") || progressStep.includes("يستمع") || progressStep.includes("المحاضرة #")) return 0;
    }
    // عدم القفز للخطوة الأخيرة إلا إذا أكد السيرفر ذلك
    if (progressPercent >= 88) return 3;
    if (progressPercent >= 65) return 2;
    if (progressPercent >= 35) return 1;
    return 0;
  }, [progressStep, progressPercent]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300 selection:bg-indigo-500/20" dir="rtl">
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full dark:from-indigo-600/15 dark:via-purple-600/10 pointer-events-none" />
      </div>

      <AppHeader quota={quota} activePage="summarize" />

      <div className="flex-1 flex flex-col items-center px-4 pt-10 sm:pt-14 pb-16 w-full max-w-4xl mx-auto relative z-10">
        
        {/* Navigation / Header Bar */}
        <div className="w-full max-w-3xl mb-5 sm:mb-6 flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            prefetch={true}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
            title="العودة للرئيسية"
          >
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="text-right flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
              <span>لمّاح بخططلك</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-snug">
              {(!hasPaidPlan || (quota !== null && quota <= 0))
                ? "يلزم وجود اشتراك نشط لمعالجة المحاضرات"
                : "ارفع التسجيل الصوتي أو السلايدات لتجهيز ملفك وشرحك التفاعلي فوراً"}
            </p>
          </div>

                  </div>

        {/* Main Processing or Upload Section */}
        <AnimatePresence mode="wait">
          {isQuotaChecking && quota === null ? (
            <motion.div
              key="quota-checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-3xl flex flex-col items-center justify-center p-12 bg-white/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs text-center"
            >
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">جاري التحقق من الرصيد والاشتراك...</p>
            </motion.div>
          ) : (!hasPaidPlan || (quota !== null && quota <= 0)) ? (
            <motion.div
              key="paywall"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-lg mx-auto"
            >
              <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-white/10 shadow-xl shadow-slate-200/40 dark:shadow-none text-center space-y-6">
                
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex items-center justify-center mx-auto text-slate-800 dark:text-slate-200">
                  <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    <span>الخدمة تتطلب اشتراكاً نشطاً</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    معالجة المحاضرات مقفلة حالياً
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
                    رصيدك الحالي 0 دقيقة. رفع وتلخيص المحاضرات بواسطة الذكاء الاصطناعي يتطلب باقة نشطة. اختر باقتك وتواصل معنا عبر واتساب لتفعيل الحساب.
                  </p>
                </div>

                {/* Free Tool Callout: دوّن ملاحظاتك */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-right flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-right">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>مساحة «دوّن ملاحظاتك» متاحة مجاناً</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      بإمكانك فتح ملفات السلايدات وتخطيطها وتظليلها يدوياً بحرية تامة دون اشتراك.
                    </p>
                  </div>
                  <Link
                    href="/study"
                    prefetch={true}
                    className="w-full sm:w-auto shrink-0 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>فتح دوّن ملاحظاتك</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                  <Link
                    href="/plans"
                    prefetch={true}
                    className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>عرض الباقات والاشتراك</span>
                  </Link>
                  <a
                    href="https://wa.me/972598298930?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%AA%D9%81%D8%B9%D9%8A%D9%84%20%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%D9%8A%20%D9%81%D9%8A%20%D9%84%D9%85%D9%91%D8%A7%D8%AD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-bold px-5 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تواصل عبر واتساب للتفعيل</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ) : isProcessing || isStreaming ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-3xl"
            >
              <div className="w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-indigo-100/90 dark:border-indigo-500/20 rounded-3xl p-5 sm:p-7 shadow-xl shadow-indigo-500/5 relative overflow-hidden text-right">
                
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 px-3.5 py-1.5 rounded-xl max-w-xs truncate">
                    {isDocumentOnly ? (
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    ) : (
                      <FileAudio className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                      {activeFileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-indigo-50/80 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 px-3.5 py-1.5 rounded-xl">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">
                      الوقت المتبقي: {
                        timeLeft === null
                          ? "جاري الحساب..."
                          : timeLeft > 10
                          ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} د`
                          : "لحظات قليلة، جاري إنهاء وتدقيق الملف..."
                      }
                    </span>
                  </div>
                </div>

                {/* Progress message */}
                <div className="my-4 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{isDocumentOnly ? "جاري تحويل السلايدات إلى ملف مخطط ومظلل" : "جاري تفريغ وتلخيص المحاضرة عبر لمّاح"}</span>
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {progressStep || "تحليل الصوت والنصوص وصياغة الملخص والبطاقات الذكية..."}
                    </p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-500/20 px-2.5 py-1 rounded-lg">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 mb-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: "spring", stiffness: 45, damping: 15 }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                  {currentPipelineSteps.map((step, idx) => {
                    const isDone = idx < activeStepIdx;
                    const isActive = idx === activeStepIdx;
                    const IconComponent = step.icon;
                    return (
                      <div
                        key={step.id}
                        className={`flex flex-col p-2.5 rounded-2xl border transition-all ${
                          isActive
                            ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500/60 scale-[1.02]"
                            : isDone
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400/40 opacity-90"
                            : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-slate-600 dark:text-slate-300">
                          <IconComponent className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold truncate">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dhikr Counter */}
                <div
                  onClick={handleDhikrClick}
                  className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                      {dhikrPhrases[currentDhikrIndex]}
                    </span>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70">
                      انقر للتسبيح واستثمار الوقت أثناء المعالجة ✨
                    </span>
                  </div>
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-white/90 dark:bg-emerald-900/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-700">
                    {dhikrCurrentPhaseCount} / 10 (المجموع: {dhikrTotal})
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-3xl"
            >
              {error && (
                <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-between gap-3 text-right">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                  <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Upload Card */}
              <div className="w-full bg-white dark:bg-[#070b16]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.06)] relative overflow-hidden transition-all text-right">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Two File Upload Cards: Audio + Slides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Audio Upload */}
                    <div className={`relative group rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-center min-h-[155px] ${
                      audioFile || multiAudioFiles.length > 0
                        ? 'bg-slate-50/90 dark:bg-slate-900/60 border-indigo-500/60 dark:border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900/30 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30'
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
                              setAudioTempId(null);
                              uploadToTemp(files[0], 'audio');
                            } else {
                              setAudioFile(null);
                              setAudioTempId(null);
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
                        <div className="w-full z-20 relative flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                              isAnyAudioUploading
                                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                                : "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200/80 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            }`}>
                              {isAnyAudioUploading ? (
                                audioFile ? (
                                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{audioUploadProgress}%</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{avgMultiProgress}%</span>
                                )
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate" dir="ltr">
                                {audioFile ? audioFile.name : `${multiAudioFiles.length} ملفات صوتية`}
                              </p>
                              <p className="text-[11px] font-medium mt-0.5">
                                {isAnyAudioUploading ? (
                                  audioFile ? (
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">جاري الرفع... ({audioUploadProgress}%)</span>
                                  ) : (
                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                      جاري الرفع... ({completedAudioCount} من {totalAudioCount} جاهزة)
                                    </span>
                                  )
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">جاهز للمعالجة ✔️</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAudioFile(null);
                              setAudioTempId(null);
                              setMultiAudioFiles([]);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
                            title="إزالة"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2 group-hover:scale-105 transition-transform">
                            <FileAudio className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                            تسجيل المحاضرة
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            اسحب الصوت هنا أو <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">اختر ملفاً</span>
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 font-medium">MP3, WAV, M4A</span>
                        </div>
                      )}
                    </div>

                    {/* Slides Upload */}
                    <div className={`relative group rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-center min-h-[155px] ${
                      pdfFile
                        ? 'bg-slate-50/90 dark:bg-slate-900/60 border-indigo-500/60 dark:border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900/30 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                    }`}>
                      <input
                        type="file"
                        accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPdfFile(file);
                            setPdfUploadProgress(0);
                            setPdfTempId(null);
                            uploadToTemp(file, 'pdf');
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />

                      {pdfFile ? (
                        <div className="w-full z-20 relative flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                              {isPdfUploading ? (
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{pdfUploadProgress}%</span>
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate" dir="ltr">{pdfFile.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                {isPdfUploading ? "جاري الرفع..." : "جاهز للبدء"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPdfFile(null);
                              setPdfTempId(null);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
                            title="إزالة"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2 group-hover:scale-105 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                            سلايدات المحاضرة
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            اسحب السلايدات هنا أو <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">اختر ملفاً</span>
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 font-medium">PDF, PPTX</span>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Quota Lock Banner */}
                {quota !== null && quota <= 0 && !hasPaidPlan && (
                  <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/40 p-4 text-right">
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      🚫 رصيدك صفر دقيقة — يرجى شحن الرصيد للمتابعة.
                    </p>
                    <Link
                      href="/plans"
                      prefetch={true}
                      className="mt-2.5 inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> شحن الرصيد الآن
                    </Link>
                  </div>
                )}

                {/* Submit Action Button powered by SmartGenerateButton */}
                <div className="pt-2">
                  <SmartGenerateButton
                    onClick={() => handleProcess()}
                    disabled={
                      (!audioFile && multiAudioFiles.length === 0 && !pdfFile && !pdfTempId) ||
                      isAnyAudioUploading ||
                      isPdfUploading
                    }
                    isProcessing={isProcessing}
                    quota={quota}
                    text={
                      isAnyAudioUploading
                        ? (multiAudioFiles.length > 0
                            ? `جاري رفع التسجيلات (${completedAudioCount}/${totalAudioCount})...`
                            : `جاري رفع الملف الصوتي (${audioUploadProgress}%)...`)
                        : isPdfUploading
                        ? `جاري رفع السلايدات (${pdfUploadProgress}%)...`
                        : "ابدأ التلخيص الذكي وتوليد الملف المخطط"
                    }
                    loadingText="جاري التوليد والتلخيص..."
                    variant="pill"
                    size="md"
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}

export default function SummarizePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <SummarizeContent />
    </Suspense>
  );
}

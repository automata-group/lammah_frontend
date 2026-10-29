"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback, Suspense } from "react";
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
  HelpCircle,
  Layers,
  Calculator
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import SmartGenerateButton from "@/components/SmartGenerateButton";
import DashboardProcessingScreen from "@/components/dashboard/DashboardProcessingScreen";
import PdfRangeSelector from "@/components/summarize/PdfRangeSelector";
import { PipelineStep } from "@/types/dashboard";
import { createClient } from "@/lib/supabase";

// Monotonic Machine Phase
type ProcessingPhase =
  | "idle"
  | "uploading"
  | "queued"
  | "audio"
  | "slides"
  | "ai"
  | "pdf"
  | "done"
  | "error";

interface UploadedAudio {
  id: string;
  file: File;
  tempId?: string;
  progress: number;
  isUploading: boolean;
  duration?: number;
}

function SummarizeContent() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Upload States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [multiAudioFiles, setMultiAudioFiles] = useState<UploadedAudio[]>([]);
  const [lectureTitle, setLectureTitle] = useState("");

  // Real-time Duration & Page Count Detection States
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const [pdfDetectedPages, setPdfDetectedPages] = useState<number | null>(null);

  // Slide Range Selection States
  const [startPage, setStartPage] = useState<string>("");
  const [endPage, setEndPage] = useState<string>("");

  // Pre-upload Temporary IDs and Progress
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [audioTempId, setAudioTempId] = useState<string | null>(null);
  const [pdfTempId, setPdfTempId] = useState<string | null>(null);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  // Quota & Subscription States
  const [quota, setQuota] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const cachedQuota = localStorage.getItem("cached_user_quota");
      if (cachedQuota !== null && !isNaN(Number(cachedQuota))) {
        return Number(cachedQuota);
      }
    }
    return null;
  });
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

  // ==========================================
  // SINGLE MONOTONIC PROGRESS STATE MACHINE
  // ==========================================
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [phase, setPhase] = useState<ProcessingPhase>("idle");
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [queuePosition, setQueuePosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialEstimate, setInitialEstimate] = useState<number>(75);
  const [error, setError] = useState<string | null>(null);

  // Monotonic Progress Updater (Enforces Mathematical Invariant: displayed >= prev)
  const setMonotonicProgress = useCallback((incomingTarget: number) => {
    setDisplayedProgress(prev => {
      const clampedTarget = Math.min(100, Math.max(0, incomingTarget));
      return Math.max(prev, clampedTarget);
    });
  }, []);

  // Real-time Audio Duration Extractor (Instant client-side metadata decode in < 20ms)
  const getAudioDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(0);
        return;
      }
      try {
        const audio = document.createElement("audio");
        const objectUrl = URL.createObjectURL(file);
        audio.preload = "metadata";
        audio.src = objectUrl;
        audio.onloadedmetadata = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(Math.round(audio.duration || 0));
        };
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          // Fallback estimate: ~16KB/s for 128kbps audio
          resolve(Math.max(30, Math.round(file.size / 16000)));
        };
      } catch {
        resolve(Math.max(30, Math.round(file.size / 16000)));
      }
    });
  }, []);

  const formatDuration = useCallback((totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return "بضع ثوانٍ";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    if (secs === 0) return `${mins} دقيقة`;
    return `${mins}:${secs.toString().padStart(2, "0")} دقيقة`;
  }, []);

  // Pre-flight Quota Consumption Breakdown (حساب استهلاك الرصيد الدقيق والشفاف قبل البدء)
  const quotaCostBreakdown = useMemo(() => {
    const hasAudio = !!audioFile || multiAudioFiles.length > 0;
    const hasPdf = !!pdfFile || !!pdfTempId;

    // 1. Audio duration & cost
    let totalAudioSeconds = 0;
    if (audioFile && audioDuration !== null) {
      totalAudioSeconds = audioDuration;
    } else if (multiAudioFiles.length > 0) {
      totalAudioSeconds = multiAudioFiles.reduce((acc, f) => acc + (f.duration || 0), 0);
    }

    // 1 minute of quota per 1 minute of audio (minimum 1 minute if audio is attached)
    const audioCostMinutes = hasAudio ? Math.max(1, Math.ceil(totalAudioSeconds / 60)) : 0;

    // 2. Document page count & cost
    let selectedPages = 0;
    const s = parseInt(startPage, 10);
    const e = parseInt(endPage, 10);

    if (!isNaN(s) && !isNaN(e) && s >= 1 && e >= s) {
      selectedPages = e - s + 1;
    } else if (pdfDetectedPages) {
      selectedPages = pdfDetectedPages;
    } else if (hasPdf) {
      selectedPages = 10;
    }

    // If audio is attached, slides are aligned with the audio (no extra quota charge)
    // If document-only mode, 1 minute of quota per 2 slides/pages (minimum 3 minutes)
    const docCostMinutes = hasPdf && !hasAudio ? Math.max(3, Math.ceil(selectedPages / 2)) : 0;

    const totalCost = hasAudio ? audioCostMinutes : docCostMinutes;
    const currentQuota = quota ?? 0;
    const isSufficient = currentQuota >= totalCost;
    const remainingAfter = Math.max(0, currentQuota - totalCost);
    const missingMinutes = Math.max(0, totalCost - currentQuota);

    return {
      hasAudio,
      hasPdf,
      totalAudioSeconds,
      audioCostMinutes,
      selectedPages,
      docCostMinutes,
      totalCost,
      currentQuota,
      remainingAfter,
      isSufficient,
      missingMinutes,
    };
  }, [audioFile, audioDuration, multiAudioFiles, pdfFile, pdfTempId, startPage, endPage, pdfDetectedPages, quota]);

  // Multi-Audio Upload Computations
  const isMultiAudioUploading = multiAudioFiles.length > 0 && multiAudioFiles.some(f => f.isUploading || !f.tempId);
  const isAnyAudioUploading = isAudioUploading || isMultiAudioUploading;
  const completedAudioCount = multiAudioFiles.filter(f => !f.isUploading && Boolean(f.tempId)).length;
  const totalAudioCount = multiAudioFiles.length;
  const avgMultiProgress = totalAudioCount > 0
    ? Math.round(multiAudioFiles.reduce((acc, f) => acc + (f.progress || 0), 0) / totalAudioCount)
    : 0;

  const hasQuota = quota !== null ? quota > 0 : false;
  const hasPaidPlan = Boolean(
    hasQuota ||
    (planName &&
      planName !== "free" &&
      planName !== "مجاني" &&
      !planName.includes("مجاني") &&
      !planName.toLowerCase().includes("free"))
  );

  // Range validation check
  const isRangeInvalid = useMemo(() => {
    const s = parseInt(startPage, 10);
    const e = parseInt(endPage, 10);
    if (!isNaN(s) && !isNaN(e) && s > e) return true;
    if (!isNaN(s) && s < 1) return true;
    return false;
  }, [startPage, endPage]);

  // Fingerprint & Device Metadata Helpers
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

  // Continuous Asymptotic Creep Engine (Smooth, Living AI Feel with Zero Frozen State)
  useEffect(() => {
    if (!isProcessing && !isStreaming) return;
    if (phase === "idle" || phase === "done" || phase === "error") return;

    // Define phase target ceilings to ensure asymptotic deceleration
    let ceiling = 92;
    if (phase === "queued") ceiling = 15;
    else if (phase === "audio") ceiling = 52;
    else if (phase === "slides") ceiling = 64;
    else if (phase === "ai") ceiling = 88;
    else if (phase === "pdf") ceiling = 98;

    const interval = setInterval(() => {
      // 1. Monotonic Smooth Progress Creep
      setDisplayedProgress(prev => {
        if (prev >= ceiling) return prev;
        // Asymptotic increment
        const step = Math.max(0.12, (ceiling - prev) * 0.04);
        return Math.min(ceiling, Number((prev + step).toFixed(1)));
      });

      // 2. Truthful Countdown Tick
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) return null; // Transition to finishing message rather than freezing
        return prev - 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isProcessing, isStreaming, phase]);

  // Pre-upload Audio/PDF to Temp Directory via XMLHttpRequest for Real Progress
  const uploadToTemp = (file: File, type: 'audio' | 'pdf') => {
    if (!hasPaidPlan || quota === null || quota <= 0) {
      setError("🔒 يلزم وجود اشتراك نشط لرفع ومعالجة المحاضرات. يرجى الاشتراك وتأكيد الدفع لتفعيل حسابك.");
      return;
    }
    const isAudio = type === 'audio';
    if (isAudio) setIsAudioUploading(true);
    else setIsPdfUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
        try {
          const data = JSON.parse(xhr.responseText);
          if (isAudio) {
            setAudioTempId(data.temp_id);
            setIsAudioUploading(false);
          } else {
            setPdfTempId(data.temp_id);
            setIsPdfUploading(false);
          }
        } catch (e) {
          setError("فشل فك استجابة السيرفر بعد الرفع.");
          if (isAudio) setIsAudioUploading(false);
          else setIsPdfUploading(false);
        }
      } else {
        setError(`فشل رفع الملف: ${xhr.statusText || xhr.status}`);
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
      setError("🔒 يلزم وجود اشتراك نشط لرفع ومعالجة المحاضرات.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
        try {
          const data = JSON.parse(xhr.responseText);
          setMultiAudioFiles(prev => prev.map(item => item.id === id ? { ...item, tempId: data.temp_id, isUploading: false, progress: 100 } : item));
        } catch {
          setMultiAudioFiles(prev => prev.filter(item => item.id !== id));
        }
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

  // Fetch Quota with Backend + Direct Supabase Fallback
  const fetchQuota = useCallback(async () => {
    if (!session?.access_token) return;
    let resolved = false;

    // 1. Try Backend API
    try {
      const fp = (typeof window !== "undefined" && localStorage.getItem("device_id_v3")) || await getFingerprint();
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/quota`, {
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

        // Profile quota check
        const { data: prof } = await supabase
          .from("profiles")
          .select("quota_remaining, current_plan_id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (prof) {
          const pQuota = prof.quota_remaining ?? 0;
          setQuota(pQuota);
          if (pQuota > 0) setPlanName("باقة إنقاذ الكويزات (Essential)");
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
        console.error("Direct Supabase fallback error:", sbErr);
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

  // Main Processing Handler with Bulletproof SSE Stream
  const handleProcess = async (forceRawFiles: boolean = false) => {
    if (quota !== null && quota <= 0) {
      setError("🚫 رصيدك الحالي 0 دقيقة — يرجى شحن الرصيد للمتابعة.");
      return;
    }
    if (isRangeInvalid) {
      setError("🚫 نطاق الصفحات غير صالح. تأكد أن صفحة البداية أصغر من أو تساوي صفحة النهاية.");
      return;
    }
    setError(null);

    // Validate uploads finished
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

    const hasAudioFile = !!audioFile || multiAudioFiles.length > 0;
    const hasPdfOnly = !hasAudioFile && (!!pdfFile || !!pdfTempId);

    if (!hasAudioFile && !hasPdfOnly) {
      setError("يرجى إرفاق ملف صوتي أو ملف PDF/PPTX للمعالجة.");
      return;
    }

    if (!hasPaidPlan || quota === null || quota <= 0) {
      setError("يلزم وجود اشتراك نشط لمعالجة المحاضرات. يرجى الاشتراك وتفعيل حسابك.");
      router.push("/plans");
      return;
    }

    if (!session) {
      router.replace("/login");
      return;
    }

    // Initialize State Machine
    setIsProcessing(true);
    setIsStreaming(false);
    setPhase("uploading");
    setDisplayedProgress(5);
    setQueuePosition(0);
    setProgressMessage("جاري بدء المعالجة وتهيئة البيئة...");

    // Compute realistic initial time estimate
    const isBatch = multiAudioFiles.length > 1;
    let estimatedSecs = 65;
    if (hasPdfOnly) {
      estimatedSecs = pdfFile ? Math.max(30, Math.min(80, Math.round(pdfFile.size / (1024 * 300)) * 4 + 25)) : 40;
    } else if (isBatch) {
      estimatedSecs = Math.max(110, multiAudioFiles.length * 45 + (pdfFile || pdfTempId ? 40 : 25));
    } else {
      estimatedSecs = (pdfFile || pdfTempId) ? 85 : 65;
    }

    setTimeLeft(estimatedSecs);
    setInitialEstimate(estimatedSecs);

    const endpoint = isBatch
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/summarize/process-batch-lectures`
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/summarize/process-lecture`;

    const formData = new FormData();
    formData.append("metadata", await getDeviceMetadata());

    if (isBatch) {
      const tempIds = multiAudioFiles.map(item => item.tempId).filter(Boolean);
      if (tempIds.length === 0 && !hasPdfOnly) {
        setError("🚫 لم يتم استلام أي تسجيلات صوتية صالحة من السيرفر. يرجى المحاولة مجدداً.");
        setIsProcessing(false);
        setPhase("idle");
        return;
      }
      formData.append("audio_temp_ids", tempIds.join(","));
    } else {
      const activeTempId = audioTempId || multiAudioFiles[0]?.tempId || null;
      const activeFile = audioFile || multiAudioFiles[0]?.file || null;
      if (!forceRawFiles && activeTempId) {
        formData.append("audio_temp_id", activeTempId);
      } else if (activeFile) {
        formData.append("audio_file", activeFile);
      }
    }

    if (!forceRawFiles && pdfTempId) {
      formData.append("pdf_temp_id", pdfTempId);
    } else if (pdfFile) {
      formData.append("pdf_file", pdfFile);
    }

    if (startPage.trim()) formData.append("start_page", startPage.trim());
    if (endPage.trim()) formData.append("end_page", endPage.trim());
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
            setPhase("error");
            return;
          }
          throw new Error(typeof errData.detail === "string" ? errData.detail : "فشلت المعالجة على السيرفر");
        } catch (e: any) {
          throw new Error(e.message || "حدث خطأ غير متوقع.");
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamBuffer = "";
      if (!reader) throw new Error("فشل فتح بث البيانات من السيرفر.");

      setIsStreaming(true);
      setIsProcessing(false);

      let hasReceivedDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        let boundary = streamBuffer.indexOf("\n\n");

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
                  setPhase("error");
                  return;

                case "queued":
                case "queue_update":
                  setPhase("queued");
                  setQueuePosition(p.position || 1);
                  setProgressMessage(p.message || `📋 في طابور المعالجة: #${p.position || 1}`);
                  setMonotonicProgress(10);
                  break;

                case "processing":
                case "progress":
                  setQueuePosition(0);
                  if (p.message) setProgressMessage(p.message);

                  // Update phase based on step identifier
                  if (p.step) {
                    if (p.step.includes("5/5") || p.step.includes("رسم") || p.step.includes("تلوين")) {
                      setPhase("pdf");
                    } else if (p.step.includes("4/5") || p.step.includes("استنتاج") || p.step.includes("يفكّر")) {
                      setPhase("ai");
                    } else if (p.step.includes("2/5") || p.step.includes("3/5") || p.step.includes("الشرائح")) {
                      setPhase("slides");
                    } else if (p.step.includes("1/5") || p.step.includes("تفريغ") || p.step.includes("يستمع")) {
                      setPhase("audio");
                    }
                  }

                  // Monotonic progress update
                  if (typeof p.progress_percent === "number") {
                    setMonotonicProgress(p.progress_percent);
                  }

                  // Accurate time estimate update
                  if (typeof p.time_estimate === "number") {
                    setTimeLeft(p.time_estimate);
                    setInitialEstimate(prev => Math.max(prev, p.time_estimate));
                  }
                  break;

                case "done":
                  hasReceivedDone = true;
                  setMonotonicProgress(100);
                  setPhase("done");
                  setIsStreaming(false);
                  setIsProcessing(false);

                  if (p.history_id && typeof p.history_id === "string") {
                    // World-Class Instant Handoff Cache (0ms navigation lag)
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
                    router.push("/dashboard");
                  }
                  return;
              }
            } catch {}
          }
          boundary = streamBuffer.indexOf("\n\n");
        }
      }

      if (!hasReceivedDone) {
        setIsStreaming(false);
        setIsProcessing(false);
        setPhase("error");
        setError("⚠️ انقطع الاتصال بالخادم أثناء المعالجة. يرجى إعادة المحاولة.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء معالجة المحاضرة.");
      setIsProcessing(false);
      setIsStreaming(false);
      setPhase("error");
    }
  };

  const isDocumentOnly = !audioFile && multiAudioFiles.length === 0 && (!!pdfFile || !!pdfTempId);

  const activeFileName = useMemo(() => {
    if (multiAudioFiles.length > 1) return `${multiAudioFiles.length} ملفات صوتية`;
    if (audioFile) return audioFile.name;
    if (multiAudioFiles[0]) return multiAudioFiles[0].file.name;
    if (pdfFile) return pdfFile.name;
    return "محاضرة جامعية";
  }, [multiAudioFiles, audioFile, pdfFile]);

  const currentPipelineSteps: PipelineStep[] = useMemo(() => {
    if (isDocumentOnly) {
      return [
        {
          id: 1,
          title: "فحص الشرائح والصفحات",
          shortDesc: "قراءة النصوص والجداول والرسومات بدقة هندسية",
          icon: FileText,
        },
        {
          id: 2,
          title: "استيعاب المفاهيم والمصطلحات",
          shortDesc: "فصل الأفكار الرئيسية وتحليل المعادلات والتعاريف",
          icon: BrainCircuit,
        },
        {
          id: 3,
          title: "صياغة الشرح وفخاخ الامتحان",
          shortDesc: "كتابة الشرح بالعامية والكبسولات وبنك الأسئلة",
          icon: Lightbulb,
        },
        {
          id: 4,
          title: "التظليل وإخراج الملف المخطط",
          shortDesc: "تلوين الملاحظات وإعداد الملف المخطط والمظلل الفائق",
          icon: Sparkles,
        },
      ];
    }
    return [
      {
        id: 1,
        title: "تدقيق ومعالجة الصوت",
        shortDesc: "تصفية النقاء الصوتي وتهيئة المسار للمحرك الذكي",
        icon: FileAudio,
      },
      {
        id: 2,
        title: "التفريغ الذكي فائق الدقة",
        shortDesc: "تحويل كلام المحاضر لنص دقيق ومصحح لغوياً",
        icon: BrainCircuit,
      },
      {
        id: 3,
        title: "مطابقة الشرح بالسلايدات",
        shortDesc: "ربط كل دقيقة صوتية مع الشريحة الخاصة بها تلقائياً",
        icon: FileText,
      },
      {
        id: 4,
        title: "التظليل والامتحانات والكبسولات",
        shortDesc: "استخراج أسئلة الامتحانات وبطاقات الحفظ وتلوين السلايدات",
        icon: Sparkles,
      },
    ];
  }, [isDocumentOnly]);

  const activeStepIdx = useMemo(() => {
    if (phase === "done" || phase === "pdf") return 3;
    if (phase === "ai") return 2;
    if (phase === "slides") return 1;
    if (phase === "audio" || phase === "queued") return 0;
    if (displayedProgress >= 88) return 3;
    if (displayedProgress >= 65) return 2;
    if (displayedProgress >= 35) return 1;
    return 0;
  }, [phase, displayedProgress]);

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
                    رصيدك الحالي 0 دقيقة. رفع وتلخيص المحاضرات بواسطة الذكاء الاصطناعي يتطلب باقة نشطة. اختر باقتك للمتابعة.
                  </p>
                </div>

                {/* Free Tool Callout */}
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
            <DashboardProcessingScreen
              isDocumentOnly={isDocumentOnly}
              activeFileName={activeFileName}
              queuePosition={queuePosition}
              timeLeft={timeLeft}
              progressStep={progressMessage}
              progressPercent={Math.round(displayedProgress)}
              currentPipelineSteps={currentPipelineSteps}
              activeStepIdx={activeStepIdx}
            />
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
                  <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg cursor-pointer">
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
                    <div className={`relative group rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-center min-h-[160px] ${
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
                              getAudioDuration(files[0]).then(dur => setAudioDuration(dur));
                              uploadToTemp(files[0], 'audio');
                            } else {
                              setAudioFile(null);
                              setAudioTempId(null);
                              setAudioDuration(null);
                              const newFiles = Array.from(files).map(file => ({
                                id: Math.random().toString(36).substring(7),
                                file,
                                progress: 0,
                                isUploading: true
                              }));
                              setMultiAudioFiles(prev => [...prev, ...newFiles]);
                              newFiles.forEach(async item => {
                                uploadSingleMultiAudio(item.id, item.file);
                                const dur = await getAudioDuration(item.file);
                                setMultiAudioFiles(prev => prev.map(f => f.id === item.id ? { ...f, duration: dur } : f));
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
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {isAnyAudioUploading ? (
                                  <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                    جاري الرفع...
                                  </span>
                                ) : (
                                  <>
                                    {quotaCostBreakdown.totalAudioSeconds > 0 && (
                                      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 px-2 py-0.5 rounded-md tabular-nums">
                                        ⏱️ {formatDuration(quotaCostBreakdown.totalAudioSeconds)}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800 px-2 py-0.5 rounded-md tabular-nums">
                                      ⚡ خصم: {quotaCostBreakdown.audioCostMinutes} دقيقة
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAudioFile(null);
                              setAudioTempId(null);
                              setAudioDuration(null);
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

                    {/* Slides Upload with Smart Zero-Lag PdfRangeSelector */}
                    <div className={`relative group rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-center min-h-[160px] ${
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
                        <div className="w-full z-20 relative flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-3">
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
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {isPdfUploading ? (
                                    <span className="text-[11px] text-slate-400 font-medium">جاري الرفع...</span>
                                  ) : (
                                    <>
                                      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 px-2 py-0.5 rounded-md tabular-nums">
                                        📄 {quotaCostBreakdown.selectedPages} شريحة
                                      </span>
                                      {quotaCostBreakdown.hasAudio ? (
                                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                                          🎁 مجاني مع الصوت
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800 px-2 py-0.5 rounded-md tabular-nums">
                                          ⚡ سيخصم: {quotaCostBreakdown.docCostMinutes} دقائق
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPdfFile(null);
                                setPdfTempId(null);
                                setStartPage("");
                                setEndPage("");
                                setPdfDetectedPages(null);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
                              title="إزالة"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Zero-Lag PDF Range Selector Component */}
                          <PdfRangeSelector
                            file={pdfFile}
                            startPage={startPage}
                            endPage={endPage}
                            onRangeChange={(s, e) => {
                              setStartPage(s);
                              setEndPage(e);
                            }}
                            onTotalPagesDetected={(count) => {
                              setPdfDetectedPages(count);
                            }}
                            disabled={isProcessing || isStreaming}
                          />
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

                {/* Live Pre-Flight Quota Deduction Summary (شفافية كاملة قبل الموافقة على العملية) */}
                {(audioFile || multiAudioFiles.length > 0 || pdfFile || pdfTempId) && (
                  <div className={`mb-5 p-4 rounded-2xl border transition-all text-right ${
                    quotaCostBreakdown.isSufficient
                      ? "bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border-indigo-200/80 dark:border-indigo-800/60 shadow-xs"
                      : "bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80"
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-indigo-100 dark:border-indigo-900/40">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          quotaCostBreakdown.isSufficient
                            ? "bg-indigo-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}>
                          <Calculator className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">
                            ملخص خصم الرصيد قبل بدء المعالجة
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            حساب شفاف ودقيق للمدة والدقائق المستهلكة من رصيدك
                          </p>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block font-medium">رصيدك الحالي</span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {quota !== null ? `${quota} دقيقة` : "..."}
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                      {/* Audio Cost Badge */}
                      {quotaCostBreakdown.hasAudio ? (
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileAudio className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 block leading-tight">تسجيل المحاضرة:</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {formatDuration(quotaCostBreakdown.totalAudioSeconds)}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                            -{quotaCostBreakdown.audioCostMinutes} دقيقة
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-slate-400 text-xs">
                          <FileAudio className="w-4 h-4 shrink-0 opacity-50" />
                          <span>لم يتم إرفاق تسجيل صوتي</span>
                        </div>
                      )}

                      {/* PDF Cost Badge */}
                      {quotaCostBreakdown.hasPdf ? (
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 block leading-tight">سلايدات المحاضرة:</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {quotaCostBreakdown.selectedPages} شريحة مختارة
                              </span>
                            </div>
                          </div>
                          {quotaCostBreakdown.hasAudio ? (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                              مجاني مع الصوت 🎁
                            </span>
                          ) : (
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0 tabular-nums bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-md">
                              -{quotaCostBreakdown.docCostMinutes} دقيقة
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-slate-400 text-xs">
                          <FileText className="w-4 h-4 shrink-0 opacity-50" />
                          <span>لم يتم إرفاق سلايدات</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Summary Bar: Total to Deduct vs Remaining Balance */}
                    <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          إجمالي الخصم من الرصيد:
                        </span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs">
                          {quotaCostBreakdown.totalCost} دقيقة
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-bold">
                        {quotaCostBreakdown.isSufficient ? (
                          <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>رصيدك المتبقي بعد المعالجة: <strong className="font-black tabular-nums">{quotaCostBreakdown.remainingAfter} دقيقة</strong></span>
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>ينقصك {quotaCostBreakdown.missingMinutes} دقيقة لإتمام العملية!</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Insufficient Quota Action */}
                    {!quotaCostBreakdown.isSufficient && (
                      <div className="mt-3 pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                          ⚠️ رصيدك الحالي لا يكفي. يمكنك تقليل عدد الصفحات أو شحن باقتك للمتابعة.
                        </p>
                        <Link
                          href="/plans"
                          prefetch={true}
                          className="shrink-0 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>شحن الرصيد</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

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
                      isPdfUploading ||
                      isRangeInvalid ||
                      ((audioFile || multiAudioFiles.length > 0 || pdfFile || pdfTempId) && !quotaCostBreakdown.isSufficient)
                    }
                    isProcessing={isProcessing}
                    quota={quota}
                    text={
                      isRangeInvalid
                        ? "⚠️ نطاق الصفحات غير صحيح (البداية أكبر من النهاية)"
                        : isAnyAudioUploading
                        ? (multiAudioFiles.length > 0
                            ? `جاري رفع التسجيلات (${completedAudioCount}/${totalAudioCount})...`
                            : `جاري رفع الملف الصوتي (${audioUploadProgress}%)...`)
                        : isPdfUploading
                        ? `جاري رفع السلايدات (${pdfUploadProgress}%)...`
                        : !quotaCostBreakdown.isSufficient && (audioFile || multiAudioFiles.length > 0 || pdfFile || pdfTempId)
                        ? `🚫 رصيدك غير كافٍ (المطلوب: ${quotaCostBreakdown.totalCost} دقيقة | المتوفر: ${quotaCostBreakdown.currentQuota} دقيقة)`
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

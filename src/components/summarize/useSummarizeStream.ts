"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProcessingPhase, UploadedAudio } from "./types";
import { getFingerprint as getThumbmark } from "@thumbmarkjs/thumbmarkjs";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { createClient } from "@/lib/supabase";

interface StartProcessingParams {
  audioFile: File | null;
  multiAudioFiles: UploadedAudio[];
  pdfFile: File | null;
  audioTempId: string | null;
  pdfTempId: string | null;
  startPage: string;
  endPage: string;
  hasPaidPlan: boolean;
  quota: number | null;
  session: any;
  onQuotaDeducted?: (newQuota: number) => void;
}

export function useSummarizeStream() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [phase, setPhase] = useState<ProcessingPhase>("idle");
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [queuePosition, setQueuePosition] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialEstimate, setInitialEstimate] = useState<number>(75);
  const [error, setError] = useState<string | null>(null);

  const creepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Monotonic Progress Updater (Guarantees progress never regresses)
  const setMonotonicProgress = useCallback((incomingTarget: number) => {
    setDisplayedProgress((prev) => {
      const clamped = Math.min(100, Math.max(0, incomingTarget));
      return Math.max(prev, clamped);
    });
  }, []);

  // Reset function
  const resetProcessing = useCallback(() => {
    if (creepIntervalRef.current) {
      clearInterval(creepIntervalRef.current);
      creepIntervalRef.current = null;
    }
    setIsProcessing(false);
    setIsStreaming(false);
    setPhase("idle");
    setDisplayedProgress(0);
    setProgressMessage("");
    setQueuePosition(0);
    setTimeLeft(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (creepIntervalRef.current) {
        clearInterval(creepIntervalRef.current);
      }
    };
  }, []);

  // Device Fingerprint Helper
  const getDeviceHeaders = async () => {
    let fp = "";
    if (typeof window !== "undefined") {
      fp = localStorage.getItem("device_id_v3") || "";
      if (!fp) {
        try {
          fp = await getThumbmark();
          localStorage.setItem("device_id_v3", fp);
        } catch {
          fp = `fallback_${Math.random().toString(36).substring(7)}`;
        }
      }
    }
    const meta = {
      fingerprint: fp,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      language: typeof navigator !== "undefined" ? navigator.language : "",
      platform: typeof navigator !== "undefined" ? (navigator as any).userAgentData?.platform || navigator.platform || "" : "",
      hardwareConcurrency: typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4,
    };
    return { fp, metaJson: JSON.stringify(meta) };
  };

  const startProcessing = useCallback(async (params: StartProcessingParams) => {
    const {
      audioFile,
      multiAudioFiles,
      pdfFile,
      audioTempId,
      pdfTempId,
      startPage,
      endPage,
      hasPaidPlan,
      quota,
      session,
      onQuotaDeducted,
    } = params;

    setError(null);

    // Validation
    const hasAudio = !!audioFile || multiAudioFiles.length > 0;
    const hasPdf = !!pdfFile || !!pdfTempId;

    if (!hasAudio && !hasPdf) {
      setError("يرجى إرفاق ملف صوتي أو ملف PDF/PPTX للمعالجة.");
      return;
    }

    if (!hasPaidPlan || quota === null || quota <= 0) {
      setError("يلزم وجود اشتراك نشط لمعالجة المحاضرات. يرجى الاشتراك وتفعيل حسابك.");
      router.push("/plans");
      return;
    }

    // Get fresh token from Supabase client to guarantee freshness even in long-lived tabs
    let token = session?.access_token;
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        token = sessionData.session.access_token;
      }
    } catch {}

    if (!token) {
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

    const isBatch = multiAudioFiles.length > 1;
    const isDocOnly = !hasAudio && hasPdf;
    let estimatedSecs = isDocOnly ? 40 : isBatch ? 110 : 75;
    setTimeLeft(estimatedSecs);
    setInitialEstimate(estimatedSecs);

    // Start asymptotic creep engine
    if (creepIntervalRef.current) clearInterval(creepIntervalRef.current);
    creepIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 3 ? prev - 1 : prev));
      setDisplayedProgress((prev) => {
        if (prev < 20) return prev + 0.5;
        if (prev < 50) return prev + 0.3;
        if (prev < 85) return prev + 0.15;
        if (prev < 94) return prev + 0.08;
        if (prev < 98.5) return prev + 0.025;
        return prev;
      });
    }, 500);

    try {
      const { fp, metaJson } = await getDeviceHeaders();
      const formData = new FormData();

      if (audioTempId) formData.append("audio_temp_id", audioTempId);
      if (pdfTempId) formData.append("pdf_temp_id", pdfTempId);
      if (startPage) formData.append("start_page", startPage);
      if (endPage) formData.append("end_page", endPage);

      const isBatchMode = multiAudioFiles.length > 1;
      if (multiAudioFiles.length > 0) {
        const tempIds = multiAudioFiles
          .map((f) => f.tempId)
          .filter(Boolean)
          .join(",");
        if (tempIds) {
          formData.append("audio_temp_ids", tempIds);
        }
        // Also provide audio_temp_id if single file in multi-list
        if (!audioTempId && multiAudioFiles[0]?.tempId) {
          formData.append("audio_temp_id", multiAudioFiles[0].tempId);
        }
      }

      // If temp files are somehow not present, append original files
      if (!audioTempId && audioFile) formData.append("audio_file", audioFile);
      if (!pdfTempId && pdfFile) formData.append("pdf_file", pdfFile);

      const endpoint = isBatchMode
        ? `${getApiBaseUrl()}/api/v1/summarize/process-batch-lectures`
        : `${getApiBaseUrl()}/api/v1/summarize/process-lecture`;

      const response = await fetchWithRetry(
        endpoint,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Fingerprint": fp,
            "X-Device-Metadata": metaJson,
          },
          body: formData,
        },
        {
          retries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 4000,
          onRetry: (attempt) => {
            setProgressMessage(`جاري إعادة الاتصال بالسيرفر (محاولة ${attempt} من 3)...`);
          },
        }
      );

      if (!response.ok) {
        let errMsg = "حدث خطأ أثناء معالجة المحاضرة";
        try {
          const errData = await response.json();
          if (errData?.detail?.user_message) {
            errMsg = errData.detail.user_message;
          } else if (typeof errData?.detail === "string") {
            if (response.status === 404 || errData.detail === "Not Found") {
              errMsg = "تعذر الوصول إلى خدمة معالجة المحاضرات المتعددة. يرجى إعادة المحاولة.";
            } else {
              errMsg = errData.detail;
            }
          }
        } catch {}
        throw new Error(errMsg);
      }

      if (!response.body) {
        throw new Error("لم يتم استلام استجابة صالحة من السيرفر.");
      }

      setIsStreaming(true);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const lines = evt.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.type === "progress") {
                  setQueuePosition(0);
                  if (data.progress_percent !== undefined) {
                    setMonotonicProgress(data.progress_percent);
                  }
                  if (data.message) setProgressMessage(data.message);
                  if (data.time_estimate !== undefined) setTimeLeft(data.time_estimate);
                  if (data.step) {
                    if (data.step.includes("1/5")) setPhase("audio");
                    else if (data.step.includes("2/5")) setPhase("slides");
                    else if (data.step.includes("3/5") || data.step.includes("4/5")) setPhase("ai");
                    else if (data.step.includes("5/5")) setPhase("pdf");
                  }
                } else if (data.type === "queued") {
                  setPhase("uploading");
                  setQueuePosition(data.position || 1);
                  if (data.message) setProgressMessage(data.message);
                } else if (data.type === "done") {
                  setPhase("done");
                  setMonotonicProgress(100);
                  setProgressMessage("🎉 اكتملت المعالجة بنجاح! جاري تحويلك إلى لوحة التحكم...");

                  if (creepIntervalRef.current) {
                    clearInterval(creepIntervalRef.current);
                    creepIntervalRef.current = null;
                  }

                  const targetId = data.history_id || data.job_id;

                  // Instant lecture handoff cache (0ms rendering)
                  if (typeof window !== "undefined") {
                    try {
                      const payload = JSON.stringify({
                        title: data.title || "محاضرة جديدة",
                        transcript: data.transcript || "",
                        download_url: data.download_url,
                        annotations: data.annotations || {},
                        isDocumentOnly: isDocOnly,
                        job_id: data.job_id,
                        created_at: new Date().toISOString(),
                      });
                      if (data.job_id) sessionStorage.setItem(`lammah_instant_lecture_${data.job_id}`, payload);
                      if (targetId) sessionStorage.setItem(`lammah_instant_lecture_${targetId}`, payload);
                    } catch {}
                  }

                  setTimeout(() => {
                    router.push(`/dashboard?history_id=${targetId}&id=${targetId}&instant=true`);
                  }, 600);
                  return;
                } else if (data.type === "error") {
                  throw new Error(data.message || "حدث خطأ غير متوقع أثناء المعالجة");
                }
              } catch (parseErr: any) {
                if (parseErr.message && !parseErr.message.includes("JSON")) {
                  throw parseErr;
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (creepIntervalRef.current) {
        clearInterval(creepIntervalRef.current);
        creepIntervalRef.current = null;
      }
      setIsProcessing(false);
      setIsStreaming(false);
      setPhase("idle");
      let msg = err?.message || "تعذر إكمال المعالجة. يرجى المحاولة مرة أخرى.";
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("net::ERR_FAILED") ||
        msg.includes("Transient Server Error")
      ) {
        msg = "تعذّر الاتصال بخادم المعالجة. يرجى التحقق من اتصال الإنترنت أو المحاولة مرة أخرى بعد لحظات.";
      }
      setError(msg);
    }
  }, [router, setMonotonicProgress]);

  return {
    isProcessing,
    isStreaming,
    phase,
    displayedProgress,
    progressMessage,
    queuePosition,
    timeLeft,
    initialEstimate,
    error,
    setError,
    setMonotonicProgress,
    resetProcessing,
    startProcessing,
  };
}

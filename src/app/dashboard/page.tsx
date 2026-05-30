"use client";
// v2.1.0 — SSE done-event annotations fix

import { useState, useRef, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getFingerprint as getThumbmark } from '@thumbmarkjs/thumbmarkjs';
import { Loader2, Upload, FileAudio, FileText, CheckCircle, AlertCircle, Sparkles, ChevronLeft, History, User, Package, Crown, Lock, ChevronRight, Menu, X, Info, Download, Share2, Printer, Copy, Check, MessageCircle, Home, LogOut, Clock, Target, BrainCircuit, BookOpen, Lightbulb, ListTodo, Quote, Eye, Send, Plus, Search, Pencil, Store } from "lucide-react";
import ResultSkeleton from "@/components/ResultSkeleton";
import ReactMarkdown from 'react-markdown';

function DashboardContent() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyIdRaw = searchParams.get("history_id");
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(historyIdRaw);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [lectureUrl, setLectureUrl] = useState("");
  
  // For multi-upload
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
  const [isEditingDashboardTitle, setIsEditingDashboardTitle] = useState(false);
  const [dashboardTitleInput, setDashboardTitleInput] = useState("");
  const [transcriptSearchQuery, setTranscriptSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [quota, setQuota] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string>("مجاني");
  const [chatCount, setChatCount] = useState<number>(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const fetchChatUsage = async () => {
    if (!session) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/chat-usage`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChatCount(data.total_chat_count || 0);
      }
    } catch (e) {
      console.warn("Failed to fetch chat usage:", e);
    }
  };

  // Pre-upload States
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [audioTempId, setAudioTempId] = useState<string | null>(null);
  const [pdfTempId, setPdfTempId] = useState<string | null>(null);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  const isBasicPlan = planName.includes("طالب") || planName.includes("أساسي") || planName === "مجاني";

  const subscriptionLimit = (planName.includes("الذهبية") || planName.includes("النخبة") || planName.includes("Elite") || planName.includes("برو") || planName.includes("VIP")) ? 100 :
    (planName.includes("الميدتيرم") || planName.includes("التفوق") || planName.includes("متقدم") || planName.includes("Premium")) ? 25 :
      5; // Default for Basic/Rescue/Student (الإنقاذ/الأساسية)

  // UI States for Expansion
  const [activeTab, setActiveTab] = useState("notes");
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  // Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ role: string, content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const summaryRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dhikr / Istighfar Counter
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

  const handleDhikrClick = () => {
    setDhikrTotal(prev => prev + 1);
    const newPhaseCount = dhikrCurrentPhaseCount + 1;
    if (newPhaseCount >= 10) {
      setDhikrCurrentPhaseCount(0);
      setCurrentDhikrIndex(prev => (prev + 1) % dhikrPhrases.length);
    } else {
      setDhikrCurrentPhaseCount(newPhaseCount);
    }
  };

  // -- FINGERPRINTING LOGIC --
  const getFingerprint = async () => {
    if (typeof window === "undefined") return "";
    let fp = localStorage.getItem("device_id_v3");
    if (!fp) {
      try {
        fp = await getThumbmark();
        localStorage.setItem("device_id_v3", fp);
      } catch (e) {
        console.error("Device ID generation failed:", e);
        // Fallback
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

  // Progress Countdown Timer
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev && prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
  }, [timeLeft]);

  const uploadToTemp = (file: File, type: 'audio' | 'pdf') => {
    const isAudio = type === 'audio';
    if (isAudio) setIsAudioUploading(true);
    else setIsPdfUploading(true);

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

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (typeof window !== "undefined" && session) {
        const params = new URLSearchParams(window.location.search);
        const historyId = params.get("history_id");

        if (historyId) {
          setIsProcessing(true);
          setProgressStep("جاري استرجاع المحاضرة والتظليلات من الأرشيف...");

          // Remove query param to prevent loop on subsequent re-renders
          window.history.replaceState({}, document.title, window.location.pathname);
          setCurrentHistoryId(historyId);

          const fp = await getFingerprint();
          const meta = await getDeviceMetadata();
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/history/${historyId}`, {
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
              "X-Fingerprint": fp,
              "X-Device-Metadata": meta
            }
          })
            .then(async r => {
              if (!r.ok) throw new Error("التلخيص غير موجود أو محذوف");
              const data = await r.json();
              if (data?.metadata?.job_id) {
                setChatCount(data.total_chat_count !== undefined ? data.total_chat_count : (data.chat_count || 0));
                setLectureTitle(data.metadata.title || "محاضرة بدون عنوان");
                const hasPdf = data.metadata.has_pdf !== undefined
                  ? data.metadata.has_pdf
                  : (data.metadata.annotations?.slide_explanations?.length > 0);
                
                setResult({
                  transcript: data.metadata.transcript || "",
                  downloadUrl: hasPdf ? `/api/v1/summarize/download/${data.metadata.job_id}.pdf` : null,
                  annotations: data.metadata.annotations
                });
              } else {
                throw new Error("هذا التلخيص قديم جداً ولا يحتوي على أرشيف محفوظ.");
              }
            })
            .catch(err => setError(err.message))
            .finally(() => {
              setIsProcessing(false);
              setProgressStep("");
            });
        }
      }
    };
    fetchHistory();
  }, [session]);

  // Fetch quota on load - SHOW ERRORS
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [showNameOnboarding, setShowNameOnboarding] = useState(false);
  const [onboardNameInput, setOnboardNameInput] = useState("");
  const [isOnboardUpdating, setIsOnboardUpdating] = useState(false);
  const [onboardError, setOnboardError] = useState("");

  const handleSaveOnboardName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardNameInput.trim()) {
      setOnboardError("يرجى إدخال اسمك أولاً.");
      return;
    }
    setIsOnboardUpdating(true);
    setOnboardError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/transactions/update-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ full_name: onboardNameInput.trim() })
      });
      const resData = await response.json();
      if (response.ok) {
        setUserFullName(onboardNameInput.trim());
        setShowNameOnboarding(false);
      } else {
        setOnboardError(resData.detail?.user_message || "فشل حفظ الاسم.");
      }
    } catch (err) {
      setOnboardError("فشل الاتصال بالخادم لحفظ الاسم.");
    } finally {
      setIsOnboardUpdating(false);
    }
  };

  useEffect(() => {
    const fetchQuota = async () => {
      if (session) {
        const fp = await getFingerprint();
        const meta = await getDeviceMetadata();
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "X-Fingerprint": fp,
            "X-Device-Metadata": meta
          }
        }).then(async r => {
          const data = await r.json();
          if (!r.ok) {
            const msg = data.detail?.user_message || data.detail?.technical || JSON.stringify(data);
            setError(`⚠️ خطأ من الخادم: ${msg}`);
            console.error("Backend error:", data);
          } else {
            setQuota(data.quota_remaining);
            setPlanName(data.plan_name);
            setUserFullName(data.full_name || null);
            if (!data.full_name || data.full_name.trim() === "" || data.full_name === "طالب متميز") {
              setShowNameOnboarding(true);
            }
            setError(null);
          }
        }).catch(e => {
          setError(`❌ فشل الاتصال بالخادم: ${e.message}`);
          console.error("Network error:", e);
        });
      }
    };
    fetchQuota();
    fetchChatUsage();
  }, [session]);

  const handleProcess = async (forceRawFiles: boolean = false) => {
    const hasAudioFile = !!audioFile || multiAudioFiles.length > 0;
    const hasLectureUrl = (uploadMode === "url" && lectureUrl.trim().length > 0) || (uploadMode === "url" && lectureUrls.filter(u => u.trim()).length > 0);
    const hasPdfOnly = !hasAudioFile && !hasLectureUrl && (!!pdfFile || !!pdfTempId);
    if (!hasAudioFile && !hasLectureUrl && !hasPdfOnly) {
      setError(uploadMode === "url" ? "يرجى إدخال رابط المحاضرة أولاً." : "يرجى إرفاق ملف صوتي أو ملف PDF/PPTX للمعالجة.");
      return;
    }
    if (!session) { router.replace("/login"); return; }

    if (uploadMode === "url") {
      const urlsToCheck = [];
      if (lectureUrl.trim()) urlsToCheck.push(lectureUrl.trim());
      lectureUrls.filter(u => u.trim()).forEach(u => urlsToCheck.push(u.trim()));

      for (const url of urlsToCheck) {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("drive.google.com") || lowerUrl.includes("google.com/drive")) {
          setError("🚫 عذراً، روابط Google Drive غير مدعومة حالياً لأسباب أمنية. يرجى استخدام روابط يوتيوب فقط! 🎥");
          return;
        }
        if (lowerUrl.includes("zoom.us") || lowerUrl.includes("zoom.com")) {
          setError("🚫 عذراً، روابط Zoom غير مدعومة حالياً لأسباب أمنية. يرجى استخدام روابط يوتيوب فقط! 🎥");
          return;
        }
      }
    }

    setIsProcessing(true); setError(null); setResult(null);
    setIsStreaming(false); setQueuePosition(0); setProgressStep("جاري المعالجة...");

    const isBatch = (uploadMode === "file" && multiAudioFiles.length > 1) || (uploadMode === "url" && lectureUrls.filter(u => u.trim()).length > 1);
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

    try {
      const fp = await getFingerprint();
      const meta = await getDeviceMetadata();
      const response = await fetch(endpoint, {
        method: "POST", body: formData,
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
            console.warn("Temp file not found on server, retrying with raw file...");
            setAudioTempId(null);
            setPdfTempId(null);
            handleProcess(true); // Retry with raw files
            return;
          }
          const userMsg = errData.detail?.user_message;
          if (userMsg) {
            if (errData.detail?.type === "no_quota" || errData.detail?.type === "quota_exceeded") {
              setError(userMsg);
              setIsProcessing(false);
              return;
            }
            throw new Error(userMsg);
          }
          throw new Error(typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail));
        } catch (parseErr: any) { if (parseErr.message) throw parseErr; throw new Error("خطأ غير متوقع."); }
      }

      // -- Local fingerprint set moved to success stream event --

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      let streamBuffer = "";
      let metadata: any = null;
      if (!reader) throw new Error("فشل في فتح البث.");

      setIsStreaming(true); setIsProcessing(false);

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
                case "queued": setQueuePosition(p.position); setProgressStep(`📋 الطابور: #${p.position}`); break;
                case "queue_update": setQueuePosition(p.position); setProgressStep(`📋 الطابور: #${p.position}`); break;
                case "processing": case "progress":
                  setQueuePosition(0);
                  setProgressStep(`${p.message}`);
                  if (p.time_estimate) setTimeLeft(p.time_estimate);
                  break;
                case "transcript":
                  setResult((prev: any) => ({ ...prev, transcript: p.text }));
                  break;
                case "metadata":
                  metadata = p;
                  setActiveTab("notes");
                  setFlippedCards({});
                  setSelectedAnswers({});
                  setShowExplanation({});
                  break;
                case "done":
                  fetchChatUsage();
                  if (p.title && !lectureTitle.trim()) {
                    setLectureTitle(p.title);
                  }
                  if (p.history_id) {
                    setCurrentHistoryId(p.history_id);
                    // Save title if user typed one
                    if (lectureTitle.trim() && session) {
                      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/history/${p.history_id}/title`, {
                        method: "PATCH",
                        headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ title: lectureTitle.trim() })
                      }).catch(() => {});
                    }
                    // Fetch full annotations from Supabase — guaranteed to work because
                    // annotations are saved to DB BEFORE the done event is sent.
                    // This avoids relying on large SSE JSON parsing which fails silently.
                    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
                    console.log(`🌐 [LAMMAH] Fetching annotations from: ${apiBase}/api/v1/subscription/history/${p.history_id}`);
                    fetch(`${apiBase}/api/v1/subscription/history/${p.history_id}`, {
                      headers: {
                        "Authorization": `Bearer ${session.access_token}`,
                        "X-Fingerprint": fp,
                        "X-Device-Metadata": meta
                      }
                    }).then(async r => {
                      const fallbackAnnotations = p.annotations || metadata?.annotations;
                      if (!r.ok) {
                        console.warn("⚠️ [LAMMAH] Supabase fetch returned non-ok status. Using fallback annotations.");
                        const finalAnnos = fallbackAnnotations;
                        if (finalAnnos) {
                          if (finalAnnos.sticky_notes?.length > 0) setActiveTab("notes");
                          else if (finalAnnos.focus_points?.length > 0) setActiveTab("focus");
                          else if (finalAnnos.mcqs?.length > 0 || finalAnnos.flashcards?.length > 0) setActiveTab("quiz");
                        }
                        setResult((prev: any) => ({ ...prev, downloadUrl: p.download_url, annotations: fallbackAnnotations }));
                        return;
                      }
                      const data = await r.json();
                      const fetchedAnnotations = data?.metadata?.annotations;
                      const finalAnnos = fetchedAnnotations || fallbackAnnotations;
                      console.log("🎉 [LAMMAH] Deployed frontend fetch successful. Annotations loaded:", finalAnnos);
                      if (finalAnnos) {
                        if (finalAnnos.sticky_notes?.length > 0) setActiveTab("notes");
                        else if (finalAnnos.focus_points?.length > 0) setActiveTab("focus");
                        else if (finalAnnos.mcqs?.length > 0 || finalAnnos.flashcards?.length > 0) setActiveTab("quiz");
                        else setActiveTab("chat");
                      }
                      setResult((prev: any) => ({
                        ...prev,
                        downloadUrl: p.download_url,
                        annotations: finalAnnos || prev?.annotations
                      }));
                    }).catch((err) => {
                      console.error("❌ [LAMMAH] Fetch from Supabase history failed:", err);
                      const finalAnnos = p.annotations || metadata?.annotations;
                      if (finalAnnos) {
                        if (finalAnnos.sticky_notes?.length > 0) setActiveTab("notes");
                        else if (finalAnnos.focus_points?.length > 0) setActiveTab("focus");
                        else if (finalAnnos.mcqs?.length > 0 || finalAnnos.flashcards?.length > 0) setActiveTab("quiz");
                      }
                      setResult((prev: any) => ({
                        ...prev,
                        downloadUrl: p.download_url,
                        annotations: finalAnnos || prev?.annotations
                      }));
                    });
                  } else {
                    console.log("ℹ️ [LAMMAH] Done event parsed without history_id. Using fallback annotations.");
                    const finalAnnos = p.annotations || metadata?.annotations;
                    if (finalAnnos) {
                      if (finalAnnos.sticky_notes?.length > 0) setActiveTab("notes");
                      else if (finalAnnos.focus_points?.length > 0) setActiveTab("focus");
                      else if (finalAnnos.mcqs?.length > 0 || finalAnnos.flashcards?.length > 0) setActiveTab("quiz");
                    }
                    setResult((prev: any) => ({
                      ...prev,
                      downloadUrl: p.download_url,
                      annotations: finalAnnos || prev?.annotations
                    }));
                  }
                  setIsStreaming(false); setProgressStep(""); break;

                case "complete":
                  fetchChatUsage();
                  console.log("🎉 [LAMMAH] Complete event received. Annotations:", p.data.annotations);
                  if (p.data.annotations) {
                    const finalAnnos = p.data.annotations;
                    if (finalAnnos.sticky_notes?.length > 0) setActiveTab("notes");
                    else if (finalAnnos.focus_points?.length > 0) setActiveTab("focus");
                    else if (finalAnnos.mcqs?.length > 0 || finalAnnos.flashcards?.length > 0) setActiveTab("quiz");
                  }
                  setResult({ transcript: p.data.transcript || "", downloadUrl: p.data.downloadUrl, annotations: p.data.annotations });
                  setIsStreaming(false); setProgressStep(""); break;
                case "error": console.error("❌ [LAMMAH] Stream error received:", p.message); setError(p.message); setIsStreaming(false); break;
              }
            } catch { }
          }
          boundary = streamBuffer.indexOf('\n\n');
        }
      }
    } catch (err: any) { setError(err.message); setIsProcessing(false); setIsStreaming(false); }
  };

  const handleDownloadTranscriptPDF = async () => {
    if (!result?.transcript || !session) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/transcript/export-pdf`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transcript: result.transcript,
          title: "تفريغ محاضرة لمّاح"
        })
      });

      if (!response.ok) throw new Error("فشل تصدير ملف PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Lammah_Transcript_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(`❌ فشل تصدير PDF: ${err.message}`);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading || !currentHistoryId || !session) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const fp = await getFingerprint();
      const meta = await getDeviceMetadata();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/chat/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          "X-Fingerprint": fp,
          "X-Device-Metadata": meta
        },
        body: JSON.stringify({
          history_id: currentHistoryId,
          question: userMsg,
          chat_history: chatMessages
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        if (errData.detail?.type === "limit_reached") {
          setShowLimitModal(true);
          throw new Error(errData.detail.user_message);
        }
        throw new Error("فشل الاتصال بالخادم");
      }

      setChatCount(prev => prev + 1);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("فشل فتح البث");

      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = { ...newMessages[lastIndex], content: newMessages[lastIndex].content + chunk };
          return newMessages;
        });
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "❌ عذراً، حدث خطأ: " + err.message }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>;

  const showResults = !!result || isStreaming || isProcessing;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col" dir="rtl">
      {/* Top Floating Luxurious Nav */}
      <div className="sticky top-0 z-50 w-full px-1.5 sm:px-4 pt-2.5 sm:pt-4 pb-2">
        <nav className="bg-slate-950/60 backdrop-blur-xl border border-indigo-500/15 rounded-xl sm:rounded-[2rem] px-2 sm:px-6 py-2 sm:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-6xl mx-auto transition-all duration-300">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Logo & Home */}
            <div className="flex items-center cursor-pointer group shrink-0" onClick={() => router.push("/")} title="العودة للصفحة الرئيسية">
              <img src="/lammah-logo.png" alt="Lammah" className="w-6 h-6 sm:w-8 sm:h-8 ml-1 sm:ml-2 object-contain drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] group-hover:scale-110 transition-transform duration-300" />
              <span className="font-black text-sm sm:text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 hidden md:inline-block tracking-tight">لمّاح</span>
            </div>

            {/* Quota & Actions */}
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              {quota !== null && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-full px-1.5 sm:px-4 py-1 text-[8px] sm:text-xs flex items-center gap-0.5 sm:gap-1.5 shadow-inner">
                  <Package className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-400" />
                  <span className="text-slate-400 hidden lg:inline">رصيدك: </span>
                  <span className={`font-black ${quota > 0 ? "text-emerald-450" : "text-rose-500"}`}>{quota}</span>
                  <span className="text-slate-500 hidden sm:inline">دقيقة</span>
                </div>
              )}

              <div className="flex items-center gap-0 sm:gap-1.5 bg-slate-900/40 p-0.5 sm:p-1 rounded-lg sm:rounded-[1.2rem] border border-slate-800/80">
                <button onClick={() => router.push("/marketplace")} className="text-indigo-300 hover:text-white transition-all duration-300 p-1 sm:px-3 sm:py-2 bg-indigo-500/10 hover:bg-indigo-500/25 rounded-md sm:rounded-xl flex items-center gap-1 font-black text-[9px] sm:text-xs border border-indigo-500/20" title="متجر الملازم">
                  <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">المتجر</span>
                </button>
                <button onClick={() => router.push("/notebook")} className="text-purple-350 hover:text-white transition-all duration-300 p-1 sm:px-3 sm:py-2 bg-purple-500/10 hover:bg-purple-500/25 rounded-md sm:rounded-xl flex items-center gap-1 font-black text-[9px] sm:text-xs border border-purple-500/20" title="صانع الدفاتر الذكية">
                  <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">الدفتر</span>
                </button>
                
                <div className="w-px h-3.5 sm:h-5 bg-slate-800 mx-0.5 sm:mx-1"></div>
                
                <button onClick={() => router.push("/plans")} className="text-slate-450 hover:text-indigo-400 hover:bg-slate-900/60 transition-all p-1 rounded-md sm:rounded-xl" title="الباقات"><Crown className="w-3.5 h-3.5 sm:w-5 sm:h-5" /></button>
                <button onClick={() => router.push("/history")} className="text-slate-450 hover:text-indigo-400 hover:bg-slate-900/60 transition-all p-1 rounded-md sm:rounded-xl" title="السجل"><History className="w-3.5 h-3.5 sm:w-5 sm:h-5" /></button>
                <button onClick={() => router.push("/profile")} className="text-slate-450 hover:text-indigo-400 hover:bg-slate-900/60 transition-all p-1 rounded-md sm:rounded-xl" title="حسابي"><User className="w-3.5 h-3.5 sm:w-5 sm:h-5" /></button>
                <button onClick={async () => { await signOut(); router.replace("/login"); }} className="text-slate-500 hover:text-rose-455 hover:bg-rose-500/5 transition-all p-1 rounded-md sm:rounded-xl" title="تسجيل خروج"><LogOut className="w-3.5 h-3.5 sm:w-5 sm:h-5" /></button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="flex-1 flex flex-col items-center px-3 py-4 sm:p-8 overflow-x-hidden relative w-full">
        {/* Parallel Loading Progress Indicator & Dhikr */}
        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {(isStreaming || isProcessing) && !result?.annotations ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 py-12 px-6 mx-auto"
            >
              {/* Left Side: SaaS Stepper & Dynamic Pulse Scanner */}
              <div className="flex-1 flex flex-col items-center lg:items-start text-right w-full relative z-10">
                
                {/* Glowing AI Radar */}
                <div className="relative mb-10 flex justify-center w-full lg:justify-start">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="relative w-48 h-48 rounded-[2.5rem] border border-indigo-500/20 bg-slate-950/40 backdrop-blur-3xl flex items-center justify-center p-6 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
                    <div className="absolute inset-2 rounded-[2rem] border border-dashed border-indigo-500/30 animate-[spin_40s_linear_infinite]"></div>
                    <div className="absolute inset-4 rounded-[1.5rem] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 animate-pulse"></div>
                    <div className="flex flex-col items-center justify-center z-10">
                      <BrainCircuit className="w-14 h-14 text-indigo-400 animate-pulse mb-3 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                      <div className="bg-slate-950/80 px-4 py-1.5 rounded-xl border border-indigo-500/30 shadow-inner">
                        <span className="text-lg font-black text-indigo-300 tabular-nums tracking-[0.2em] drop-shadow-md">
                          {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : "جاري التجهيز"}
                        </span>
                      </div>
                    </div>
                    {/* Glowing pulse rings */}
                    <div className="absolute inset-0 rounded-[2.5rem] border border-indigo-500/30 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                  </div>

                  {/* Queue Position Floating Badge */}
                  {queuePosition > 0 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.6 }}
                      className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-[0_15px_30px_rgba(245,158,11,0.4)] border border-amber-200 z-20 flex flex-col items-center"
                    >
                      <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-80 mb-0.5">ترتيب الانتظار</span>
                      <span className="text-2xl leading-none drop-shadow-sm">#{queuePosition}</span>
                    </motion.div>
                  )}
                </div>

                {/* Progress Messages */}
                <div className="w-full text-center lg:text-right space-y-3 mb-10 relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
                    {queuePosition > 0 ? "أنت في قائمة الانتظار الذهبية" : "لمّاح يقوم بإعداد محاضرتك الآن"}
                  </h2>
                  <p className="text-indigo-300/80 text-base font-semibold max-w-lg leading-relaxed">
                    {queuePosition > 0
                      ? "سيصلك الدور قريباً، شكراً لصبرك. نحن نعالج الطلبات حسب الأولوية لضمان أعلى جودة."
                      : progressStep || "جاري استخراج الملاحظات والخرائط الذهنية وتنسيق الملزمة..."}
                  </p>
                </div>

                {/* Stepper Component */}
                <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-3xl border border-indigo-500/15 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 text-right space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10 transition-opacity opacity-50 group-hover:opacity-100"></div>
                  <h4 className="text-xs font-black text-indigo-400/60 mb-4 tracking-[0.3em] uppercase flex items-center gap-2 justify-start border-b border-slate-800/60 pb-4">
                    <Target className="w-4 h-4 text-indigo-500" />
                    مراحل المعالجة الفورية
                  </h4>
                  <div className="space-y-5">
                    {[
                      { title: "استلام وتدقيق المادة", desc: "تحليل وتصحيح المادة الصوتية أو الروابط السحابية بذكاء" },
                      { title: "التفريغ الذكي العالي الدقة", desc: "محرك فائق للتعرف على المصطلحات المعقدة بامتياز" },
                      { title: "استخراج الخرائط والشروحات", desc: "توليد ملخصات تفاعلية وهياكل دراسية منظمة بدقة" },
                      { title: "التنسيق والتدبيج النهائي", desc: "تطبيق الهوية البصرية المسطرة وأقلام التظليل الفاخرة" }
                    ].map((step, stepIdx) => {
                      let status: "waiting" | "active" | "completed" = "waiting";
                      const currentStepMsg = (progressStep || "").toLowerCase();
                      
                      let activeIdx = 0;
                      if (currentStepMsg.includes("أرشيف") || currentStepMsg.includes("استرجاع")) {
                        activeIdx = 0;
                      } else if (currentStepMsg.includes("طابور") || currentStepMsg.includes("انتظار") || currentStepMsg.includes("queue")) {
                        activeIdx = 1;
                      } else if (currentStepMsg.includes("تفريغ") || currentStepMsg.includes("تحويل") || currentStepMsg.includes("معالجة")) {
                        activeIdx = 1;
                      } else if (currentStepMsg.includes("ملخص") || currentStepMsg.includes("ملاحظات") || currentStepMsg.includes("تلخيص") || currentStepMsg.includes("ذهنية")) {
                        activeIdx = 2;
                      } else if (currentStepMsg.includes("تنسيق") || currentStepMsg.includes("حفظ") || currentStepMsg.includes("جاهز")) {
                        activeIdx = 3;
                      } else {
                        if (isStreaming || isProcessing) activeIdx = 1;
                      }

                      if (stepIdx < activeIdx) status = "completed";
                      else if (stepIdx === activeIdx) status = "active";

                      return (
                        <div key={stepIdx} className="flex gap-4 items-start relative z-10">
                          <div className="flex flex-col items-center shrink-0 mt-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-black transition-all duration-500 ${
                              status === "completed" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-110" :
                              status === "active" ? "bg-indigo-600/20 border-indigo-400 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse scale-110" :
                              "bg-slate-900 border-slate-700 text-slate-500 scale-100"
                            }`}>
                              {status === "completed" ? <Check className="w-3.5 h-3.5" /> : stepIdx + 1}
                            </div>
                            {stepIdx < 3 && (
                              <div className={`w-0.5 h-8 mt-2 transition-all duration-500 rounded-full ${
                                status === "completed" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-800"
                              }`} />
                            )}
                          </div>

                          <div>
                            <h5 className={`text-sm font-black transition-colors duration-300 ${
                              status === "completed" ? "text-slate-300" :
                              status === "active" ? "text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]" :
                              "text-slate-500"
                            }`}>
                              {step.title}
                            </h5>
                            <p className={`text-[11px] leading-relaxed mt-1 font-medium transition-colors duration-300 ${
                              status === "active" ? "text-indigo-200/70" : "text-slate-500/70"
                            }`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Side: High-End Spiritual Istighfar / Tasbeeh counter Widget */}
              <div className="flex-1 w-full flex flex-col items-center justify-center lg:items-end relative z-10">
                <motion.button
                  onClick={handleDhikrClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-md bg-slate-950/40 backdrop-blur-3xl border border-emerald-500/20 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative group overflow-hidden flex flex-col items-center hover:border-emerald-400/50 transition-all duration-500"
                >
                  {/* Floating particles background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Liquid Phase progress bar */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-emerald-950/50">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(dhikrCurrentPhaseCount / 10) * 100}%` }}
                      transition={{ type: "spring", stiffness: 60 }}
                    />
                  </div>

                  {/* Pulsing indicator */}
                  <div className="mb-8 flex items-center justify-center gap-3 relative z-10">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 duration-1000"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-black text-emerald-400 tracking-[0.2em] uppercase drop-shadow-md">رطّب لسانك بذكر الله</span>
                  </div>

                  {/* Large Calligraphic Remembrance Text */}
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-8 group-hover:text-emerald-300 text-center transition-colors min-h-[60px] leading-relaxed drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] relative z-10">
                    {dhikrPhrases[currentDhikrIndex]}
                  </h3>

                  {/* Spiritual benefits note */}
                  <div className="mb-8 text-center text-xs text-emerald-300/90 font-bold bg-slate-900/60 backdrop-blur-md border border-emerald-500/20 px-5 py-3 rounded-2xl w-full relative z-10 shadow-inner group-hover:bg-slate-900/80 transition-colors">
                    {currentDhikrIndex === 0 ? "الاستغفار: يفتح الأقفال، يجلب الرزق، ويمحو الخطايا 🔑✨" :
                     currentDhikrIndex === 1 ? "التوحيد: أعظم كلمة، تجدد الإيمان وتشرح الصدور 🕊️✨" :
                     currentDhikrIndex === 2 ? "الحمد لله: تملأ الميزان بالخير والبركة وتزيد النعم 🌾✨" :
                     currentDhikrIndex === 3 ? "التسبيح: خفيفتان على اللسان، ثقيلتان في الميزان ⚖️✨" :
                     currentDhikrIndex === 4 ? "التكبير: تعلو بها فوق كل همّ وغمّ في الحياة ⛰️✨" :
                     currentDhikrIndex === 5 ? "الصلاة على النبي: يُكفى بها همّك ويُغفر بها ذنبك 🌸✨" :
                     "الحوقلة: كنز عظيم من تحت عرش الرحمن وقوة للمرء 💎✨"}
                  </div>

                  {/* Interactive Tasbeeh stats display */}
                  <div className="w-full flex items-center justify-between gap-2 sm:gap-6 bg-slate-900/60 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl sm:rounded-[1.5rem] border border-emerald-500/20 shadow-inner relative z-10 group-hover:border-emerald-500/40 transition-colors">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest mb-1">المجموعة الحالية</span>
                      <span className="text-2xl font-black text-emerald-400 tabular-nums drop-shadow-md">{dhikrCurrentPhaseCount} / 10</span>
                    </div>
                    <div className="w-px h-10 bg-emerald-500/20"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest mb-1">إجمالي التسبيحات</span>
                      <span className="text-2xl font-black text-emerald-400 tabular-nums drop-shadow-md">{dhikrTotal}</span>
                    </div>
                  </div>
                </motion.button>

                <div className="mt-10 flex items-center gap-3 text-amber-400/80 text-[11px] font-black bg-amber-500/10 backdrop-blur-sm px-5 py-3 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] animate-pulse relative z-10">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>الوقت المتوقع للاستخراج: 11 - 15 دقيقة</span>
                </div>
              </div>
            </motion.div>
          ) : !showResults ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center"
            >
              {/* Ultra-Premium Glassmorphic Upload Card */}
              <div className="w-full max-w-3xl bg-slate-950/40 backdrop-blur-3xl border border-indigo-500/15 rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(99,102,241,0.12)] relative overflow-hidden">
                <div className="mb-8">
                  <div className="inline-flex bg-slate-950/80 border border-slate-800 rounded-2xl p-1.5 gap-1.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode("file");
                        setLectureUrl("");
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all duration-300 flex items-center gap-1.5 ${uploadMode === "file" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-950/60" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"}`}
                    >
                      <FileAudio className="w-3.5 h-3.5" /> رفع ملف مسجل
                    </button>
                    <button
                      type="button"
                      disabled
                      className="px-5 py-2.5 rounded-xl text-xs font-black tracking-wide text-slate-500 cursor-not-allowed bg-slate-950/20 opacity-50 flex items-center gap-1.5"
                      title="ميزة روابط المحاضرات غير متاحة حالياً - ستتوفر قريباً"
                    >
                      <Share2 className="w-3.5 h-3.5" /> رابط محاضرة (قريباً)
                    </button>
                  </div>
                  
                  {uploadMode === "url" && (
                    <div className="mt-6 space-y-4">
                      {lectureUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...lectureUrls];
                              newUrls[idx] = e.target.value;
                              setLectureUrls(newUrls);
                              if (idx === 0) setLectureUrl(e.target.value);
                            }}
                            placeholder={idx === 0 ? "ألصق رابط YouTube أو Zoom أو Google Drive هنا" : `رابط محاضرة إضافي #${idx + 1}`}
                            className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300 text-sm font-medium"
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
                              className="text-slate-500 hover:text-rose-400 p-2 shrink-0 transition-colors bg-slate-950/40 rounded-xl border border-slate-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setLectureUrls(prev => [...prev, ""])}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-extrabold flex items-center gap-1 mt-2 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> إضافة رابط محاضرة آخر 🔗
                      </button>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        * يرجى التأكد من أن الرابط عام تماماً لضمان المعالجة بنجاح.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Audio File Dropzone */}
                  <div className={`relative group border-2 border-dashed rounded-2xl sm:rounded-[2rem] p-4 sm:p-10 flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-[1.01] ${audioFile || multiAudioFiles.length > 0 ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_8px_32px_rgba(99,102,241,0.08)]' : 'border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/10 cursor-pointer'} ${uploadMode === "url" ? "opacity-30 pointer-events-none" : ""}`}>
                    <input type="file" accept="audio/*" multiple onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        if (files.length === 1 && multiAudioFiles.length === 0) {
                          setAudioFile(files[0]);
                          setAudioUploadProgress(0);
                          setAudioTempId(null);
                          uploadToTemp(files[0], 'audio');
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
                    }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    
                    {audioFile || multiAudioFiles.length > 0 ? (
                      <div className="text-center w-full z-20 relative">
                        {multiAudioFiles.length > 1 ? (
                          <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1 select-text">
                            <p className="text-xs font-black text-indigo-300 mb-1">الملفات الصوتية المحددة للدمج ({multiAudioFiles.length})</p>
                            {multiAudioFiles.map((item) => (
                              <div key={item.id} className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl text-xs">
                                <span className="font-semibold text-indigo-200 truncate max-w-[130px] text-right" dir="ltr">{item.file.name}</span>
                                <div className="flex items-center gap-2">
                                  {item.isUploading ? (
                                    <span className="text-[10px] text-indigo-400 font-bold">{item.progress}%</span>
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setMultiAudioFiles(prev => prev.filter(x => x.id !== item.id));
                                    }}
                                    className="text-slate-500 hover:text-rose-400 p-0.5"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {isAudioUploading || (multiAudioFiles[0] && multiAudioFiles[0].isUploading) ? (
                              <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4"
                                    strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * (audioUploadProgress || multiAudioFiles[0]?.progress || 0)) / 100}
                                    className="text-indigo-500 transition-all duration-300" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-300">{audioUploadProgress || multiAudioFiles[0]?.progress}%</span>
                              </div>
                            ) : (
                              <CheckCircle className="w-14 h-14 text-indigo-400 mb-4 mx-auto animate-bounce" />
                            )}
                            <p className="font-extrabold text-indigo-200 text-xs truncate w-full" dir="ltr">{(audioFile || multiAudioFiles[0]?.file)?.name}</p>
                            {(isAudioUploading || (multiAudioFiles[0] && multiAudioFiles[0].isUploading)) && <p className="text-[10px] text-indigo-450 mt-1 animate-pulse">جاري الرفع المسبق للـ Audio...</p>}
                            {(audioFile || multiAudioFiles.length === 1) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setAudioFile(null);
                                  setAudioTempId(null);
                                  setMultiAudioFiles([]);
                                }}
                                className="text-[10px] text-rose-455 font-bold mt-3 hover:underline cursor-pointer bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20"
                              >
                                إزالة الملف 🗑️
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-indigo-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                          <FileAudio className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-slate-200 font-bold text-sm">تسجيل المحاضرة الصوتية</p>
                        <p className="text-[10px] text-slate-500 mt-1 text-center leading-relaxed">اسحب الملف هنا أو انقر لاختياره<br />(MP3, WAV, M4A .. يمكنك دمج عدة ملفات)</p>
                      </>
                    )}
                  </div>

                  {/* PDF Slide Dropzone */}
                  <div className={`relative group border-2 border-dashed rounded-2xl sm:rounded-[2rem] p-4 sm:p-10 flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-[1.01] ${pdfFile ? 'border-purple-500 bg-purple-500/5 shadow-[0_8px_32px_rgba(168,85,247,0.08)]' : 'border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/10 cursor-pointer'}`}>
                    <input type="file" accept={isBasicPlan ? "application/pdf" : "application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx"} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && isBasicPlan && file.name.endsWith('.pptx')) {
                        setError("رفع وتحويل ملفات الباوربوينت (PPTX) حصري للباقات المتقدمة و VIP 🎉 يرجى ترقية باقتك من صفحة الباقات.");
                        setPdfFile(null);
                        e.target.value = "";
                      } else if (file) {
                        setPdfFile(file);
                        setPdfUploadProgress(0);
                        setPdfTempId(null);
                        uploadToTemp(file, 'pdf');
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    
                    {pdfFile ? (
                      <div className="text-center w-full z-20 relative">
                        {isPdfUploading ? (
                          <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4"
                                strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * pdfUploadProgress) / 100}
                                className="text-purple-500 transition-all duration-300" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-purple-300">{pdfUploadProgress}%</span>
                          </div>
                        ) : (
                          <CheckCircle className="w-14 h-14 text-purple-400 mb-4 mx-auto animate-bounce" />
                        )}
                        <p className="font-extrabold text-purple-200 text-xs truncate w-full" dir="ltr">{pdfFile.name}</p>
                        {isPdfUploading && <p className="text-[10px] text-purple-450 mt-1 animate-pulse">جاري الرفع المسبق للـ PDF...</p>}
                        {!isPdfUploading && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setPdfFile(null);
                              setPdfTempId(null);
                            }}
                            className="text-[10px] text-rose-455 font-bold mt-3 hover:underline cursor-pointer bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20"
                          >
                            إزالة الملف 🗑️
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-purple-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                          <FileText className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-slate-200 font-bold text-sm">شرائح العرض (PDF)</p>
                        
                        {isBasicPlan ? (
                          <div className="flex flex-col items-center mt-2.5">
                            <span className="text-[10px] text-slate-500">اسحب الـ PDF هنا لربط الشرح شفوياً</span>
                            <div className="flex items-center text-[9px] font-black text-amber-400 mt-2 bg-amber-450/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              <Lock className="w-2.5 h-2.5 ml-1" /> رفع الـ PPTX المباشر متاح للباقة المتقدمة
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-500 mt-1 text-center leading-relaxed">اسحب ملف PDF أو PPTX هنا<br />(لإنشاء ملزمة تفاعلية ذكية ومظللة)</p>
                        )}
                      </>
                    )}
                  </div>

                {/* PDF-Only Info Banner — shown when only PDF is uploaded without audio */}
                {pdfFile && !audioFile && multiAudioFiles.length === 0 && uploadMode === "file" && (
                  <div className="mb-4 flex items-start gap-3 bg-blue-500/10 border border-blue-500/25 px-4 py-3.5 rounded-2xl text-right">
                    <div className="p-1.5 bg-blue-500/15 rounded-lg shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-blue-300 mb-0.5">وضع الملف فقط (بدون صوت)</p>
                      <p className="text-[10px] text-blue-200/70 leading-relaxed">
                        سيتم تحليل ملفك مباشرة وتوليد: ملخص ذكي + نقاط التركيز + أسئلة MCQ + فلاش كاردز. لن يتم تفريغ صوتي لأنه لا يوجد ملف صوتي مرفق.
                      </p>
                    </div>
                  </div>
                )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                      <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold leading-relaxed">{error}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          {error.includes("اشتراك") || error.includes("حصت") ? (
                            <button onClick={() => router.push("/plans")} className="text-xs bg-indigo-650 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-black transition-all shadow-md">ترقية الباقة</button>
                          ) : null}

                          <button
                            onClick={() => {
                              const msg = `مرحباً بكِ مهندسة، أواجه مشكلة تقنية في المنصة.\nحسابي: ${user?.user_metadata?.full_name || user?.email || 'غير معروف'}\nالخطأ الذي ظهر لي:\n"${error}"\nأرجو المساعدة.`;
                              window.open(`https://wa.me/972598298930?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-bold"
                            title="إرسال سجل الخطأ للدعم الفني عبر واتساب"
                          >
                            <MessageCircle className="w-4 h-4 text-green-455" />
                            إرسال الخطأ للإدارة
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ultimate Futuristic Action Trigger Button */}
                <button 
                  onClick={() => handleProcess()} 
                  disabled={isProcessing || (uploadMode === "file" ? (!audioFile && multiAudioFiles.length === 0 && !pdfFile && !pdfTempId) : (!lectureUrl.trim() && lectureUrls.filter(u => u.trim()).length === 0)) || isAudioUploading || (uploadMode === "file" && multiAudioFiles.some(item => item.isUploading)) || isPdfUploading}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black py-5.5 rounded-2xl shadow-xl shadow-indigo-950/40 hover:shadow-indigo-500/25 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center text-sm font-black"><Loader2 className="w-5 h-5 ml-2.5 animate-spin" />جاري التوليد والتلخيص...</span>
                  ) : (isAudioUploading || isPdfUploading || (uploadMode === "file" && multiAudioFiles.some(item => item.isUploading))) ? (
                    <span className="flex items-center justify-center text-sm font-black"><Loader2 className="w-5 h-5 ml-2.5 animate-spin" />جاري رفع المحاضرة والملفات بأمان...</span>
                  ) : (
                    <span className="flex items-center justify-center text-sm font-black"><Upload className="w-5 h-5 ml-2.5" />ابدأ التلخيص الذكي وتوليد الملزمة ✨</span>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">


                {/* Title Display & Edit / Back to Home Banner */}
                <div className="lg:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-950/40 backdrop-blur-3xl border border-indigo-500/15 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,102,241,0.08)] relative overflow-hidden mb-2 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500/20 transition-colors shrink-0">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                    </div>
                    {isEditingDashboardTitle ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={dashboardTitleInput}
                          onChange={e => setDashboardTitleInput(e.target.value)}
                          onKeyDown={async e => {
                            if (e.key === "Enter") {
                              if (dashboardTitleInput.trim() && currentHistoryId && session) {
                                setLectureTitle(dashboardTitleInput.trim());
                                setIsEditingDashboardTitle(false);
                                await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/history/${currentHistoryId}/title`, {
                                  method: "PATCH",
                                  headers: {
                                    "Authorization": `Bearer ${session.access_token}`,
                                    "Content-Type": "application/json"
                                  },
                                  body: JSON.stringify({ title: dashboardTitleInput.trim() })
                                }).catch(() => {});
                              }
                            }
                            if (e.key === "Escape") setIsEditingDashboardTitle(false);
                          }}
                          className="bg-slate-950/80 backdrop-blur-md border border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/50 w-full max-w-md shadow-inner"
                          placeholder="عنوان المحاضرة..."
                          maxLength={120}
                        />
                        <button
                          onClick={async () => {
                            if (dashboardTitleInput.trim() && currentHistoryId && session) {
                              setLectureTitle(dashboardTitleInput.trim());
                              setIsEditingDashboardTitle(false);
                              await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/history/${currentHistoryId}/title`, {
                                method: "PATCH",
                                headers: {
                                  "Authorization": `Bearer ${session.access_token}`,
                                  "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ title: dashboardTitleInput.trim() })
                              }).catch(() => {});
                            }
                          }}
                          className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditingDashboardTitle(false)} className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-450 hover:bg-slate-700 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <h1 className="text-base sm:text-lg md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm line-clamp-2 md:line-clamp-none">
                          {lectureTitle || "محاضرة بدون عنوان"}
                        </h1>
                        {currentHistoryId && (
                          <button
                            onClick={() => {
                              setIsEditingDashboardTitle(true);
                              setDashboardTitleInput(lectureTitle || "");
                            }}
                            className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 shrink-0"
                            title="تعديل العنوان"
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        setResult(null);
                        setAudioFile(null);
                        setPdfFile(null);
                        setError(null);
                        setCurrentHistoryId(null);
                        setLectureTitle("");
                        router.push("/dashboard");
                      }}
                      className="relative z-10 flex items-center gap-2 text-slate-300 hover:text-white font-black transition-all bg-slate-950/50 hover:bg-indigo-600/20 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] w-full md:w-auto text-center justify-center text-xs sm:text-sm"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                      العودة للرئيسية (رفع جديد)
                    </button>
                  </div>
                </div>

                {/* WARNING BANNER FOR TRIMMED AUDIO */}
                {result?.annotations?.is_audio_trimmed && planName === "مجاني" && (
                  <div className="lg:col-span-3 bg-amber-500/10 border border-amber-500/50 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-lg text-center sm:text-right">
                    <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-amber-400 font-bold text-base sm:text-lg mb-1">تنبيه: تم تحليل جزء من المحاضرة فقط</h4>
                      <p className="text-amber-200/90 text-xs sm:text-sm leading-relaxed">أنت تستخدم التجربة المجانية، لذلك تم استخراج وتحليل أول 15 دقيقة فقط من المحاضرة بدلاً من كامل المحتوى. للوصول إلى تفريغ وتلخيص كامل لأي محاضرة مهما كان طولها، اشترك الآن.</p>
                    </div>
                    <button onClick={() => router.push("/plans")} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm shrink-0 transition-colors">
                      الترقية الآن
                    </button>
                  </div>
                )}

                <div className="lg:col-span-2 space-y-8 relative">
                  {/* Backdrop glowing sphere */}
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                  
                  {result?.downloadUrl && (
                    <div className="bg-slate-950/40 backdrop-blur-3xl border border-indigo-500/15 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group z-10">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-500/10 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center border border-indigo-500/20 shadow-inner shrink-0">
                            <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-400" />
                          </div>
                          <div>
                            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">الملزمة الذكية</h2>
                            <p className="text-[9px] sm:text-[10px] text-indigo-300/70 font-black tracking-[0.2em] mt-1 uppercase">Smart Annotated Notebook</p>
                          </div>
                        </div>
                        {isBasicPlan ? (
                          <button onClick={() => router.push("/plans")}
                            className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all flex items-center shadow-lg hover:shadow-indigo-500/10 w-full sm:w-auto text-center justify-center whitespace-normal text-xs sm:text-sm">
                            <Lock className="w-4 h-4 ml-2 text-amber-400" /> تنزيل الملزمة (للمشتركين)
                          </button>
                        ) : (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}${result.downloadUrl}`} download target="_blank"
                            className="bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl font-black transition-all duration-500 flex items-center shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 border border-white/10 w-full sm:w-auto text-center justify-center whitespace-normal text-xs sm:text-sm">
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                            تحميل الملف المخطط الذكي
                          </a>
                        )}
                      </div>
                      <div className="relative rounded-xl sm:rounded-[1.5rem] p-1 bg-gradient-to-b from-slate-800/80 to-slate-950/80 border border-slate-800/60 shadow-inner">
                        <iframe
                          key={pdfPage || 'default'}
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}${result.downloadUrl}${pdfPage ? `#page=${pdfPage}` : ''}#toolbar=0`}
                          className="w-full h-[350px] sm:h-[500px] lg:h-[650px] rounded-lg sm:rounded-[1.25rem] bg-slate-900 transition-all border border-slate-950/50"
                        />
                      </div>
                    </div>
                  )}

                  {result?.transcript && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-950/20 backdrop-blur-3xl border border-indigo-500/10 rounded-2xl sm:rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden relative group"
                    >
                      {/* Header Section */}
                      <div className="p-4 sm:p-8 pb-4 sm:pb-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-3 sm:gap-5">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] shrink-0">
                              <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-400" />
                            </div>
                            <div>
                              <h2 className="text-lg sm:text-2xl font-black text-white mb-1 drop-shadow-md">تفريغ لمّاح السريع</h2>
                              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                نص المحاضرة مفرغ بدقة بواسطة الذكاء الاصطناعي
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(result.transcript);
                                setIsCopied(true);
                                setTimeout(() => setIsCopied(false), 2000);
                              }}
                              className={`flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-[1.25rem] font-bold transition-all border text-xs sm:text-sm w-full md:w-auto justify-center ${isCopied ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-900/60 backdrop-blur-md border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-indigo-500/50 hover:text-indigo-300 shadow-sm'}`}
                            >
                              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {isCopied ? 'تم النسخ!' : 'نسخ النص'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="px-3 sm:px-8 pb-4 sm:pb-8">
                        <div className="bg-slate-950/50 backdrop-blur-md p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-800/80 shadow-inner relative overflow-hidden max-h-[700px] overflow-y-auto custom-scrollbar group-hover:border-indigo-500/20 transition-colors duration-500">
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -mr-40 -mt-40"></div>
                          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -ml-40 -mb-40"></div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6 text-indigo-400/60 text-xs font-black uppercase tracking-[0.3em] border-b border-slate-800/60 pb-4">
                              <Clock className="w-3.5 h-3.5" />
                              بداية المحاضرة
                            </div>

                            {/* Transcript Search */}
                            <div className="relative mb-8">
                              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <input
                                type="text"
                                value={transcriptSearchQuery}
                                onChange={e => setTranscriptSearchQuery(e.target.value)}
                                placeholder="ابحث في التفريغ عن معلومة محددة..."
                                className="w-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl py-3.5 pr-12 pl-4 text-sm font-semibold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner"
                              />
                              {transcriptSearchQuery && (
                                <button onClick={() => setTranscriptSearchQuery("")} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 bg-slate-800 rounded-full transition-colors">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            {transcriptSearchQuery && (
                              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold px-4 py-2 rounded-xl mb-6 inline-block">
                                {result.transcript.split('\n').filter((l: string) => l.toLowerCase().includes(transcriptSearchQuery.toLowerCase())).length} سطر يحتوي على "{transcriptSearchQuery}"
                              </div>
                            )}

                            <div
                              className="text-slate-300 leading-[2.4] text-sm sm:text-lg md:text-[1.35rem] text-justify font-tajawal selection:bg-indigo-500/40 selection:text-white"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {result.transcript.split('\n')
                                .filter((line: string) => !transcriptSearchQuery || line.toLowerCase().includes(transcriptSearchQuery.toLowerCase()))
                                .map((line: string, i: number) => {
                                  if (!line.trim()) return null;
                                  if (transcriptSearchQuery) {
                                    const parts = line.split(new RegExp(`(${transcriptSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
                                    return (
                                      <p key={i} className="mb-6 last:mb-0">
                                        {parts.map((part, j) =>
                                          part.toLowerCase() === transcriptSearchQuery.toLowerCase()
                                            ? <mark key={j} className="bg-amber-400/20 text-amber-300 border-b border-amber-500/50 rounded-sm px-1 font-bold not-italic shadow-[0_0_10px_rgba(245,158,11,0.2)]">{part}</mark>
                                            : part
                                        )}
                                      </p>
                                    );
                                  }
                                  return <p key={i} className="mb-6 last:mb-0">{line}</p>;
                                })}
                              {transcriptSearchQuery && result.transcript.split('\n').filter((l: string) => l.toLowerCase().includes(transcriptSearchQuery.toLowerCase())).length === 0 && (
                                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
                                  <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                  <p className="text-base font-semibold">لا توجد نتائج بحث لـ "{transcriptSearchQuery}"</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-12 text-indigo-400/40 text-xs font-black uppercase tracking-[0.3em] border-t border-slate-800/60 pt-6 justify-center">
                              <CheckCircle className="w-3.5 h-3.5" />
                              نهاية التفريغ
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="space-y-6">

                  {/* TABS HEADERS */}
                  {(result?.annotations?.sticky_notes?.length > 0 || result?.annotations?.focus_points?.length > 0 || result?.annotations?.mcqs?.length > 0 || currentHistoryId) && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 bg-slate-950/60 p-1.5 sm:p-2 rounded-2xl border border-slate-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-3xl relative z-20">
                      <button onClick={() => setActiveTab("notes")} className={`flex-1 min-w-[65px] sm:min-w-[100px] flex flex-col sm:flex-row items-center justify-center py-2.5 sm:py-3.5 rounded-xl sm:rounded-[1.1rem] text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 gap-1 ${activeTab === "notes" ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-[0.98]" : "text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50 border border-transparent"}`}>
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>الشروحات</span>
                      </button>
                      {(result?.annotations?.focus_points?.length > 0) && (
                        <button onClick={() => setActiveTab("focus")} className={`flex-1 min-w-[65px] sm:min-w-[100px] flex flex-col sm:flex-row items-center justify-center py-2.5 sm:py-3.5 rounded-xl sm:rounded-[1.1rem] text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 gap-1 ${activeTab === "focus" ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[0.98]" : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 border border-transparent"}`}>
                          <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>التركيز</span>
                        </button>
                      )}
                      {(result?.annotations?.mcqs?.length > 0 || result?.annotations?.flashcards?.length > 0) && (
                        <button onClick={() => setActiveTab("quiz")} className={`flex-1 min-w-[65px] sm:min-w-[100px] flex flex-col sm:flex-row items-center justify-center py-2.5 sm:py-3.5 rounded-xl sm:rounded-[1.1rem] text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 gap-1 ${activeTab === "quiz" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-[0.98]" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50 border border-transparent"}`}>
                          <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>الأسئلة</span>
                        </button>
                      )}
                      {currentHistoryId && (
                        <button onClick={() => setActiveTab("chat")} className={`flex-1 min-w-[65px] sm:min-w-[100px] flex flex-col sm:flex-row items-center justify-center py-2.5 sm:py-3.5 rounded-xl sm:rounded-[1.1rem] text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 gap-1 ${activeTab === "chat" ? "bg-blue-500/15 border border-blue-500/30 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-[0.98]" : "text-slate-400 hover:text-blue-300 hover:bg-slate-800/50 border border-transparent"}`}>
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>تحدث</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: NOTES */}
                  <AnimatePresence mode="wait">
                    {activeTab === "notes" && (
                      <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 relative z-10">
                        {result?.annotations?.sticky_notes?.length > 0 && (
                          <div className="bg-slate-950/30 backdrop-blur-3xl border border-indigo-500/15 p-6 md:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                            <h3 className="text-xl font-black flex items-center mb-6 text-indigo-300 relative z-10 drop-shadow-md">
                              ملاحظات المحاضر السريعة
                            </h3>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                              {result.annotations.sticky_notes.map((note: any, i: number) => (
                                <div key={i} onClick={() => note.page_number && setPdfPage(note.page_number)} className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/80 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300 transform hover:scale-[1.01]">
                                  <span className="text-[10px] font-black bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full mb-3 inline-block tracking-wider">شريحة {note.page_number}</span>
                                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{note.note_text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* TAB CONTENT: FOCUS */}
                    {activeTab === "focus" && (
                      <motion.div key="focus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 relative z-10">
                        {result?.annotations?.focus_points?.length > 0 && (
                          <div className="bg-slate-950/30 backdrop-blur-3xl border border-amber-500/15 p-6 md:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                            <h3 className="text-xl font-black flex items-center mb-6 text-amber-400 relative z-10 drop-shadow-md">
                              <Target className="w-6 h-6 ml-2 text-amber-500" />
                              مواضع الأسئلة والتركيز
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                              {result.annotations.focus_points.map((fp: any, i: number) => (
                                <div key={i} onClick={() => fp.page_number && setPdfPage(fp.page_number)} className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 border-r-4 border-r-amber-500 cursor-pointer hover:bg-slate-900/80 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 transform hover:scale-[1.01]">
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-base font-black text-amber-300">{fp.point}</h4>
                                    {fp.page_number && <span className="text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full tracking-wider shrink-0 mr-2">شريحة {fp.page_number}</span>}
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{fp.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* TAB CONTENT: QUIZ */}
                    {activeTab === "quiz" && (
                      <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 relative z-10">
                        {isBasicPlan && (
                          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl rounded-[2.5rem] p-4 sm:p-8 text-center border border-emerald-500/20 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] border border-emerald-500/30">
                              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-l from-emerald-200 to-teal-400 mb-4 drop-shadow-lg">طوّر دراستك واختبر نفسك!</h3>
                            <p className="text-sm sm:text-lg text-slate-300 max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium">
                              ميزة <strong>البطاقات التفاعلية (Flashcards)</strong> و <strong>الأسئلة المتوقعة (MCQs)</strong> حصرية لاشتراكات الباقات المتقدمة و الـ VIP. <br /><span className="text-slate-400 text-sm mt-2 block">رقي باقتك الآن لتفجير طاقتك الدراسية بأقوى أدوات الاسترجاع المتباعد!</span>
                            </p>
                            <button onClick={() => router.push("/plans")} className="bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center text-base sm:text-lg transform hover:-translate-y-1">
                              <Crown className="w-5 h-5 sm:w-6 sm:h-6 ml-2" /> ترقية الباقة الآن لفك القفل
                            </button>
                          </div>
                        )}

                        <div className={isBasicPlan ? "opacity-20 pointer-events-none select-none blur-[10px] transition-all" : ""}>
                          {/* FLASHCARDS */}
                          {result?.annotations?.flashcards?.length > 0 && (
                            <div className="bg-slate-950/30 backdrop-blur-3xl border border-emerald-500/15 p-4 sm:p-6 md:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group mb-6">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                              <h3 className="text-lg sm:text-xl font-black flex items-center mb-6 text-emerald-400 relative z-10 drop-shadow-md">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 ml-2 text-emerald-500" />بطاقات الحفظ (Flashcards)
                              </h3>
                              <div className="grid grid-cols-1 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                {result.annotations.flashcards.map((fc: any, i: number) => (
                                  <div key={i}
                                    onClick={() => setFlippedCards(prev => ({ ...prev, [i]: !prev[i] }))}
                                    className="cursor-pointer min-h-[150px] sm:min-h-[170px] relative group/card"
                                    style={{ perspective: "1000px" }}
                                  >
                                    <motion.div
                                      initial={false}
                                      animate={{ rotateY: flippedCards[i] ? 180 : 0 }}
                                      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                                      className="w-full h-full relative"
                                      style={{ transformStyle: "preserve-3d" }}
                                    >
                                      {/* FRONT */}
                                      <div className="absolute inset-0 w-full flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-lg group-hover/card:border-emerald-400 group-hover/card:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all" style={{ backfaceVisibility: "hidden" }}>
                                        <h4 className="text-xs sm:text-base md:text-lg font-black text-emerald-300 text-center px-2" dir="ltr">{fc.front}</h4>
                                        <div className="absolute bottom-3 text-[10px] font-black text-emerald-500/50 flex items-center tracking-widest uppercase"><ChevronLeft className="w-2.5 h-2.5 ml-1" /> انقر للقلب</div>
                                      </div>
                                      {/* BACK */}
                                      <div className="absolute inset-0 w-full flex items-center justify-center p-4 bg-emerald-950/90 backdrop-blur-md border border-emerald-400 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
                                        <p className="text-xs sm:text-sm text-emerald-50 text-center leading-relaxed font-bold px-2" dir="rtl">{fc.back}</p>
                                      </div>
                                    </motion.div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* MCQs */}
                          {result?.annotations?.mcqs?.length > 0 && (
                            <div className="bg-slate-950/30 backdrop-blur-3xl border border-teal-500/15 p-4 sm:p-6 md:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                              <h3 className="text-lg sm:text-xl font-black flex items-center mb-6 text-teal-400 relative z-10 drop-shadow-md">
                                <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 ml-2 text-teal-500" />اختبر نفسك (MCQs)
                              </h3>
                              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                {result.annotations.mcqs.map((q: any, i: number) => {
                                  const isAnswered = !!selectedAnswers[i];
                                  const isCorrect = selectedAnswers[i] === q.correct_answer;

                                  return (
                                    <div key={i} className="bg-slate-900/40 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 shadow-inner">
                                      <h4 className="text-sm sm:text-base font-black text-slate-200 mb-5 leading-relaxed">{i + 1}. {q.question}</h4>
                                      <div className="space-y-3">
                                        {q.options.map((opt: string, j: number) => {
                                          let btnClass = "bg-slate-950/50 border border-slate-700/50 hover:border-teal-500/40 hover:bg-slate-900/80 text-slate-300 font-semibold shadow-sm hover:shadow-md";
                                          if (isAnswered) {
                                            if (opt === q.correct_answer) btnClass = "bg-emerald-900/40 border-2 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-black";
                                            else if (opt === selectedAnswers[i]) btnClass = "bg-rose-900/40 border-2 border-rose-500 text-rose-200 font-bold opacity-80";
                                            else btnClass = "bg-slate-950/30 border border-slate-800 text-slate-500 opacity-40";
                                          }
                                          return (
                                            <button
                                              key={j}
                                              disabled={isAnswered}
                                              onClick={() => {
                                                setSelectedAnswers(prev => ({ ...prev, [i]: opt }));
                                                setShowExplanation(prev => ({ ...prev, [i]: true }));
                                              }}
                                              className={`w-full text-right p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-between ${btnClass}`}
                                            >
                                              <span className="leading-relaxed">{opt}</span>
                                              {isAnswered && opt === q.correct_answer && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
                                              {isAnswered && opt === selectedAnswers[i] && opt !== q.correct_answer && <X className="w-5 h-5 text-rose-400 shrink-0" />}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <AnimatePresence>
                                        {showExplanation[i] && (
                                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 overflow-hidden">
                                            <div className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-900/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-amber-900/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]'}`}>
                                              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                                <span className={`font-black ml-2 px-2 py-1 rounded-md text-[10px] uppercase tracking-wider ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>السبب</span>
                                                {q.explanation}
                                              </p>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* TAB CONTENT: CHAT */}
                    {activeTab === "chat" && (
                      <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col h-[500px] sm:h-[650px] lg:h-[700px] bg-slate-950/40 backdrop-blur-3xl border border-blue-500/15 rounded-2xl sm:rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 group">

                        {isBasicPlan && (
                          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 sm:p-8 text-center border border-blue-500/20">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-blue-500/30">
                              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                            </div>
                            <h3 className="text-xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-l from-blue-200 to-cyan-400 mb-4 drop-shadow-md">تحدث مع المحاضرة بذكاء!</h3>
                            <p className="text-sm sm:text-lg text-slate-300 max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium">
                              ميزة <strong>المحادثة الذكية (Chat)</strong> حصرية لاشتراكات الباقات المتقدمة والـ VIP. <br /><span className="text-slate-400 text-sm mt-2 block">رقي باقتك الآن لتتمكن من طرح أي سؤال على المحاضرة وسيجيبك النظام بدقة!</span>
                            </p>
                            <button onClick={() => router.push("/plans")} className="bg-gradient-to-l from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-slate-950 font-black px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all flex items-center text-base sm:text-lg transform hover:-translate-y-1">
                              <Crown className="w-5 h-5 sm:w-6 sm:h-6 ml-2" /> ترقية الباقة الآن لفك القفل
                            </button>
                          </div>
                        )}

                        <div className={`flex flex-col h-full relative z-10 ${isBasicPlan ? "opacity-20 pointer-events-none select-none blur-[10px] transition-all" : ""}`}>
                          <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 border-b border-slate-800/80 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                            <h3 className="text-lg sm:text-xl font-black flex items-center text-blue-400 relative z-10 drop-shadow-md">
                              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 ml-2 text-blue-500" /> تحدث مع المحاضرة
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400 pr-0 sm:pr-8 mt-1 font-medium relative z-10">يستند الرد لمعالجة سؤالك باحترافية، مع توضيح ما ذكره الدكتور في المحاضرة.</p>
                          </div>

                          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar bg-transparent">
                            {chatMessages.length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-60">
                                <BrainCircuit className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600" />
                                <p className="text-base sm:text-lg text-center font-bold">اطرح سؤالاً يخص جزئية معينة من المحاضرة وسيجيبك النظام فوراً!</p>
                              </div>
                            )}
                            {chatMessages.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}>
                                <div className={`max-w-[85%] p-3.5 sm:p-5 rounded-2xl sm:rounded-[1.5rem] ${msg.role === "user" ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tl-sm shadow-[0_10px_20px_rgba(59,130,246,0.2)]" : "bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-tr-sm shadow-inner"}`}>
                                  {msg.role === "user" ? (
                                    <p className="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm md:text-base font-medium">{msg.content}</p>
                                  ) : (
                                    <div className="max-w-none text-xs sm:text-sm md:text-base font-medium leading-relaxed text-right">
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                                          ul: ({ children }) => <ul className="list-disc pr-6 mb-4 space-y-2">{children}</ul>,
                                          ol: ({ children }) => <ol className="list-decimal pr-6 mb-4 space-y-2">{children}</ol>,
                                          li: ({ children }) => <li className="list-item mr-1">{children}</li>,
                                          h1: ({ children }) => <h1 className="text-lg font-black text-blue-400 mt-5 mb-3">{children}</h1>,
                                          h2: ({ children }) => <h2 className="text-base font-black text-blue-400 mt-4 mb-2">{children}</h2>,
                                          h3: ({ children }) => <h3 className="text-sm font-black text-blue-400 mt-3 mb-2">{children}</h3>,
                                          strong: ({ children }) => <strong className="font-bold text-white bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{children}</strong>,
                                          em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                                          table: ({ children }) => (
                                            <div className="overflow-x-auto my-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
                                              <table className="min-w-full divide-y divide-slate-800 text-right">{children}</table>
                                            </div>
                                          ),
                                          thead: ({ children }) => <thead className="bg-slate-900/80 text-xs font-bold text-slate-300 border-b border-slate-800">{children}</thead>,
                                          tbody: ({ children }) => <tbody className="divide-y divide-slate-800/50 text-sm">{children}</tbody>,
                                          tr: ({ children }) => <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
                                          th: ({ children }) => <th className="px-4 py-3 text-right font-black text-slate-200">{children}</th>,
                                          td: ({ children }) => <td className="px-4 py-3 text-slate-300 font-medium">{children}</td>,
                                          code: ({ children }) => <code className="bg-slate-950/60 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-300 border border-slate-800/80">{children}</code>,
                                          pre: ({ children }) => <pre className="bg-slate-950/60 p-4 rounded-xl font-mono text-xs text-indigo-300 border border-slate-800/80 my-4 overflow-x-auto whitespace-pre">{children}</pre>,
                                        }}
                                      >
                                        {msg.content}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isChatLoading && (
                              <div className="flex justify-start w-full">
                                <div className="max-w-[75%] p-3.5 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-450 rounded-tr-sm flex items-center gap-2 shadow-inner">
                                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-400" />
                                  <span className="text-xs sm:text-sm font-bold">يقرأ الشرائح والصوت...</span>
                                </div>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </div>

                          <div className="p-3.5 sm:p-6 bg-slate-900/60 backdrop-blur-md border-t border-slate-800/80">
                            {/* Chat Usage Indicator */}
                            {subscriptionLimit > 0 && (
                              <div className="flex justify-between items-center mb-3 px-2">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">
                                  {chatCount >= subscriptionLimit ? "⚠️ انتهى رصيد" : `متبقي ${subscriptionLimit - chatCount} من ${subscriptionLimit}`}
                                </span>
                                <div className="flex-1 mx-2 sm:mx-4 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className={`h-full transition-all duration-500 ease-out ${chatCount >= subscriptionLimit ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"}`}
                                    style={{ width: `${Math.min(100, (chatCount / subscriptionLimit) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <form onSubmit={handleChatSubmit} className="flex gap-2 sm:gap-3 relative">
                              <input
                                type="text"
                                maxLength={500}
                                className="flex-1 bg-slate-950/50 backdrop-blur-sm border border-slate-700/80 text-slate-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-500 shadow-inner font-semibold text-xs sm:text-sm md:text-base"
                                placeholder="مثال: كيف شرح الدكتور الفرق بين DOS و DDOS؟"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isChatLoading || (subscriptionLimit > 0 && chatCount >= subscriptionLimit)}
                              />
                              <button
                                type="submit"
                                disabled={isChatLoading || !chatInput.trim() || (subscriptionLimit > 0 && chatCount >= subscriptionLimit)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 text-white w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-black flex items-center justify-center transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 flex-shrink-0"
                              >
                                <Send className="w-4 h-4 sm:w-5 sm:h-5 rtl:-scale-x-100" />
                              </button>
                            </form>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {result && (
                    <button onClick={() => { setResult(null); setProgressStep(""); }}
                      className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-600/50 rounded-2xl text-slate-300 font-semibold transition-all shadow-xl">
                      محاضرة جديدة
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
          <p className="text-slate-500 text-sm font-medium">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - تم التطوير والتصميم بواسطة <span className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors cursor-default">فريق لمّاح</span>
          </p>
        </div>
      </footer>
      {/* Limit Reached Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 border border-amber-500/30 rounded-[2rem] p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-amber-400 mb-4">انتهى رصيد المحادثة! 🔒</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                لقد استهلكت جميع الرسائل المتاحة لهذه المحاضرة بناءً على باقتك الحالية. رقية باقتك الآن للحصول على حدود أعلى والدردشة دون قيود!
              </p>
              <div className="space-y-3">
                <button onClick={() => { setShowLimitModal(false); router.push("/plans"); }} className="w-full py-4 bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-900 font-bold rounded-xl shadow-lg transition-all">
                  ترقية الباقة الآن
                </button>
                <button onClick={() => setShowLimitModal(false)} className="w-full py-3 bg-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-xl transition-all">
                  سأكتفي بالملخص حالياً
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Name Modal */}
      <AnimatePresence>
        {showNameOnboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                <Sparkles className="w-8 h-8 text-indigo-400 fill-indigo-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">أهلاً بك في عائلة لمّاح! 🌟</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                يسعدنا انضمامك إلينا! يرجى تحديد اسمك المعتمد الذي ترغب في أن يطبع على دفاتر ملازمك في المتجر ويظهر لزملائك الطلاب.
              </p>
              
              <form onSubmit={handleSaveOnboardName} className="space-y-4">
                <div className="space-y-2">
                  <input
                    required
                    type="text"
                    placeholder="اكتب اسمك الكامل (مثال: يوسف أحمد)..."
                    value={onboardNameInput}
                    onChange={(e) => setOnboardNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition text-center font-bold"
                  />
                </div>

                {onboardError && (
                  <p className="text-rose-400 text-xs font-semibold">{onboardError}</p>
                )}

                <button
                  type="submit"
                  disabled={isOnboardUpdating || !onboardNameInput.trim()}
                  className="w-full py-4 bg-gradient-to-l from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  {isOnboardUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ الاسم وتأكيد الحساب 🚀"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white">جاري التحميل...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}

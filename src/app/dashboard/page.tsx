"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileText, BrainCircuit, Lightbulb, Sparkles, FileAudio, Target } from "lucide-react";

// Components
import AppHeader from "@/components/AppHeader";
import DashboardAnnouncementNotice from "@/components/DashboardAnnouncementNotice";
import StudentProfileModal from "@/components/StudentProfileModal";
import DashboardProcessingScreen from "@/components/dashboard/DashboardProcessingScreen";
import DashboardHeroBanner from "@/components/dashboard/DashboardHeroBanner";
import RecentLecturesSection from "@/components/dashboard/RecentLecturesSection";
import DashboardTitleBar from "@/components/dashboard/DashboardTitleBar";
import DashboardPdfViewer from "@/components/dashboard/DashboardPdfViewer";
import DashboardTranscriptViewer from "@/components/dashboard/DashboardTranscriptViewer";
import DashboardTabsNav from "@/components/dashboard/DashboardTabsNav";
import NotesTabContent from "@/components/dashboard/NotesTabContent";
import FocusPointsTabContent from "@/components/dashboard/FocusPointsTabContent";
import FlashcardsTabContent from "@/components/dashboard/FlashcardsTabContent";
import QuizTabContent from "@/components/dashboard/QuizTabContent";
import PastExamsTabContent from "@/components/dashboard/PastExamsTabContent";
import SmartChatTabContent from "@/components/dashboard/SmartChatTabContent";
import {
  LimitReachedModal,
  OnboardingNameModal,
  VirtualDemoModal,
} from "@/components/dashboard/DashboardModals";

// Types & Utils
import {
  UploadedAudio,
  DashboardResult,
  PipelineStep,
  StudentProfileData,
  ChatMessage,
  RecentLectureLog,
} from "@/types/dashboard";
import {
  getFingerprint,
  getDeviceMetadata,
  filterFocusPoints,
  generatePastExamQuestions,
  parseTranscriptLines,
} from "@/lib/dashboardUtils";
import { createClient } from "@/lib/supabase";
import { getApiBaseUrl } from "@/lib/apiConfig";

function DashboardContent() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyIdRaw = searchParams.get("history_id") || searchParams.get("id");

  // Core History & Lecture States
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(historyIdRaw);
  const [lectureTitle, setLectureTitle] = useState("");
  const [result, setResult] = useState<DashboardResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Upload States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pastExamsFile, setPastExamsFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [lectureUrl, setLectureUrl] = useState("");
  const [lectureUrls, setLectureUrls] = useState<string[]>([""]);
  const [multiAudioFiles, setMultiAudioFiles] = useState<UploadedAudio[]>([]);
  const [audioTempId, setAudioTempId] = useState<string | null>(null);
  const [pdfTempId, setPdfTempId] = useState<string | null>(null);
  const [pastExamsTempId, setPastExamsTempId] = useState<string | null>(null);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [isPastExamsUploading, setIsPastExamsUploading] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [pastExamsUploadProgress, setPastExamsUploadProgress] = useState(0);
  const [autoGeneratePastExams, setAutoGeneratePastExams] = useState(true);

  // Processing & Pipeline States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [progressStep, setProgressStep] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [initialEstimate, setInitialEstimate] = useState<number>(38);
  const [serverProgressPercent, setServerProgressPercent] = useState<number | null>(null);

  // Quota & Plan States
  const [quota, setQuota] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string>("");
  const [chatCount, setChatCount] = useState<number>(0);

  // Student Profile & Onboarding
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [studentProfileData, setStudentProfileData] = useState<StudentProfileData | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [showNameOnboarding, setShowNameOnboarding] = useState(false);
  const [onboardNameInput, setOnboardNameInput] = useState("");
  const [isOnboardUpdating, setIsOnboardUpdating] = useState(false);
  const [onboardError, setOnboardError] = useState("");

  // Modals & Navigation
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState<"audio" | "pdf" | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLectureLog[]>([]);
  const [loadingRecentLogs, setLoadingRecentLogs] = useState(true);

  // Active Tab & Sub-States
  const [activeTab, setActiveTab] = useState("notes");
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [transcriptSearchQuery, setTranscriptSearchQuery] = useState("");

  // PDF Viewer Navigation States
  const [pdfPage, setPdfPage] = useState(1);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdfFlash, setPdfFlash] = useState<number | null>(null);

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Cached Quota / Plan Loading
  useEffect(() => {
    try {
      const cachedQuota = localStorage.getItem("cached_user_quota");
      if (cachedQuota !== null && !isNaN(Number(cachedQuota))) {
        setQuota(Number(cachedQuota));
      }
      const cachedPlan = localStorage.getItem("cached_user_plan");
      if (cachedPlan) {
        setPlanName(cachedPlan);
      }
    } catch {}
  }, []);

  // Fetch Chat Usage
  const fetchChatUsage = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/chat-usage`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setChatCount(data.total_chat_count || 0);
      }
    } catch (e) {
      console.warn("Failed to fetch chat usage:", e);
    }
  }, [session]);

  // Student Profile Fetch & Instant Cache Hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const isCompleted = localStorage.getItem("lammah_student_profile_completed") === "true";
        const cached = localStorage.getItem("lammah_student_profile_data");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.university) setStudentProfileData(parsed);
        } else if (isCompleted) {
          setStudentProfileData({ university: "completed", college: "", major: "", academic_year: "" });
        }
      } catch {}
    }

    if (!session?.access_token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/student-profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.academic_profile && data.academic_profile.university) {
          setStudentProfileData(data.academic_profile);
          try {
            localStorage.setItem("lammah_student_profile_completed", "true");
            localStorage.setItem("lammah_student_profile_data", JSON.stringify(data.academic_profile));
          } catch {}
        }
      })
      .catch(() => {});
  }, [session]);

  // Plan Calculations
  const isDemoLecture = currentHistoryId === "4198557f-5b1b-48ac-91a8-d8129de8ca0b";
  const hasQuota = quota !== null ? quota > 0 : false;
  const hasPaidPlan = Boolean(
    hasQuota ||
    (planName &&
      planName !== "free" &&
      planName !== "مجاني" &&
      !planName.includes("مجاني") &&
      !planName.toLowerCase().includes("free"))
  );
  const isBasicPlan = !hasPaidPlan && !isDemoLecture;
  const isDemoMode = !hasPaidPlan && !hasQuota && quota !== null && quota <= 0;

  // Saved Lecture in History Protection:
  // If a student is viewing any lecture already saved in their history (currentHistoryId exists),
  // they own its generated assets permanently (Flashcards, Quiz, Download, Notes) without lockouts!
  const isSavedLecture = Boolean(currentHistoryId && !isDemoLecture);
  const shouldLockStudyTools = isBasicPlan && !isSavedLecture;

  const subscriptionLimit = isDemoLecture
    ? 25
    : planName.includes("الذهبية") ||
      planName.includes("النخبة") ||
      planName.includes("Elite") ||
      planName.includes("برو") ||
      planName.includes("VIP")
    ? 100
    : planName.includes("الميدتيرم") ||
      planName.includes("التفوق") ||
      planName.includes("متقدم") ||
      planName.includes("Premium")
    ? 35
    : planName.includes("الإنقاذ") ||
      planName.includes("الأساسية") ||
      planName.includes("أساسي") ||
      planName.includes("طالب")
    ? 15
    : 5;

  // User manual tab selection tracker - prevents background async fetches from forcibly switching tabs
  const hasUserSelectedTabRef = useRef(false);

  const handleTabChange = useCallback((tab: string) => {
    hasUserSelectedTabRef.current = true;
    setActiveTab(tab);
  }, []);

  // Helper to select the most appropriate tab on load or stream completion
  const selectInitialTab = useCallback((annos: any, hasFile: boolean) => {
    if (!annos) return;
    if (hasUserSelectedTabRef.current) return;
    if (!hasFile && (annos.slide_explanations?.length > 0 || annos.sticky_notes?.length > 0)) {
      setActiveTab("notes");
    } else if (annos.focus_points?.length > 0) {
      setActiveTab("focus");
    } else if (annos.mcqs?.length > 0) {
      setActiveTab("quiz");
    } else if (annos.flashcards?.length > 0) {
      setActiveTab("flashcards");
    } else {
      setActiveTab("chat");
    }
  }, []);

  // Synchronize activeTab once when a new PDF result is loaded
  const initialTabSelectedForUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (result?.downloadUrl && initialTabSelectedForUrlRef.current !== result.downloadUrl) {
      initialTabSelectedForUrlRef.current = result.downloadUrl;
      if (!hasUserSelectedTabRef.current && activeTab === "notes") {
        if (result.annotations?.focus_points && result.annotations.focus_points.length > 0) {
          setActiveTab("focus");
        } else if (result.annotations?.mcqs && result.annotations.mcqs.length > 0) {
          setActiveTab("quiz");
        } else if (result.annotations?.flashcards && result.annotations.flashcards.length > 0) {
          setActiveTab("flashcards");
        } else {
          setActiveTab("chat");
        }
      }
    }
  }, [result?.downloadUrl, result?.annotations, activeTab]);

  // Jump to PDF slide helper
  const jumpToPdfSlide = (
    pageOrSlideNum: number,
    targetType: "slide" | "comp1" | "comp2" | number = "slide"
  ) => {
    if (!pageOrSlideNum) return;

    let targetPage = pageOrSlideNum;
    const slideMap = result?.annotations?.slide_page_map;
    const compMap = result?.annotations?.companion_page_map;

    if (typeof targetType === "number") {
      targetPage = targetType;
    } else if (targetType === "comp1") {
      const comp = compMap?.[pageOrSlideNum];
      if (Array.isArray(comp) && comp[0]) targetPage = comp[0];
      else if (typeof comp === "number") targetPage = comp;
    } else if (targetType === "comp2") {
      const comp = compMap?.[pageOrSlideNum];
      if (Array.isArray(comp) && comp[1]) targetPage = comp[1];
    } else {
      if (slideMap?.[pageOrSlideNum]) {
        targetPage = slideMap[pageOrSlideNum];
      }
    }

    setPdfPage(targetPage);

    if (pdfContainerRef.current) {
      pdfContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setPdfFlash(targetPage);
      setTimeout(() => {
        setPdfFlash(null);
      }, 2500);
    }
  };

  // Memoized Transforms
  const parsedTranscriptLines = useMemo(() => {
    return parseTranscriptLines(result?.transcript, transcriptSearchQuery);
  }, [result?.transcript, transcriptSearchQuery]);

  const filteredFocusPoints = useMemo(() => {
    return filterFocusPoints(result?.annotations?.focus_points || []);
  }, [result?.annotations?.focus_points]);

  const pastExamQuestions = useMemo(() => {
    return generatePastExamQuestions(result?.annotations, filteredFocusPoints);
  }, [result?.annotations, filteredFocusPoints]);

  // Tri-State Pipeline Architecture (Slides Only | Audio Only | Hybrid)
  const processingMode = useMemo<"slides_only" | "slides_and_audio" | "audio_only">(() => {
    if (result?.isDocumentOnly !== undefined) {
      return result.isDocumentOnly ? "slides_only" : (result.hasAudio ? "slides_and_audio" : "audio_only");
    }
    const hasAudio = !!audioFile || !!audioTempId || multiAudioFiles.length > 0;
    const hasUrl =
      uploadMode === "url" &&
      (lectureUrl.trim().length > 0 || lectureUrls.some((u) => u.trim().length > 0));
    const hasDoc = !!pdfFile || !!pdfTempId;

    if (hasDoc && !hasAudio && !hasUrl) return "slides_only";
    if (hasDoc && (hasAudio || hasUrl)) return "slides_and_audio";
    return "audio_only";
  }, [result?.isDocumentOnly, result?.hasAudio, audioFile, audioTempId, multiAudioFiles, uploadMode, lectureUrl, lectureUrls, pdfFile, pdfTempId]);

  const isDocumentOnly = processingMode === "slides_only";
  const isAudioOnly = processingMode === "audio_only";

  const activeFileName = useMemo(() => {
    if (isDocumentOnly) {
      if (pdfFile?.name) return pdfFile.name;
      if (pdfTempId) return "ملف المستند (PDF/PPTX)";
      return "ملف السلايدات المرفق";
    }
    if (audioFile?.name) return audioFile.name;
    if (multiAudioFiles.length > 0) return `${multiAudioFiles.length} تسجيلات صوتية`;
    if (uploadMode === "url" && lectureUrl.trim()) return "رابط المحاضرة السحابي";
    return isAudioOnly ? "التسجيل الصوتي للمحاضرة" : "المحاضرة قيد المعالجة";
  }, [isDocumentOnly, isAudioOnly, pdfFile, pdfTempId, audioFile, multiAudioFiles, uploadMode, lectureUrl]);

  const currentPipelineSteps: PipelineStep[] = useMemo(() => {
    if (processingMode === "slides_only") {
      return [
        {
          id: 1,
          title: "فحص وتدقيق الشرائح",
          shortDesc: "قراءة النصوص والجداول بدقة",
          icon: FileText,
        },
        {
          id: 2,
          title: "استيعاب المفاهيم",
          shortDesc: "تحليل الأفكار والمعادلات والتعاريف",
          icon: BrainCircuit,
        },
        {
          id: 3,
          title: "الشرح وفخاخ الاختبار",
          shortDesc: "صياغة الشرح والكبسولات والأسئلة",
          icon: Lightbulb,
        },
        {
          id: 4,
          title: "إخراج الملف المخطط",
          shortDesc: "تجهيز وتلوين الملف المخطط والمظلل",
          icon: Sparkles,
        },
      ];
    } else if (processingMode === "audio_only") {
      return [
        {
          id: 1,
          title: "معالجة وتصفية الصوت",
          shortDesc: "تنقية التسجيل للمحرك الذكي",
          icon: FileAudio,
        },
        {
          id: 2,
          title: "التفريغ الصوتي الذكي",
          shortDesc: "تحويل الصوت لنص دقيق ومصحح",
          icon: BrainCircuit,
        },
        {
          id: 3,
          title: "استخلاص المحاور والقواعد",
          shortDesc: "تفكيك الشرح واستخراج فخاخ الدكتور",
          icon: Target,
        },
        {
          id: 4,
          title: "إخراج الدفتر الأكاديمي",
          shortDesc: "صياغة كبسولات الفهم وبنك الأسئلة",
          icon: Sparkles,
        },
      ];
    } else {
      return [
        {
          id: 1,
          title: "معالجة وتصفية الصوت",
          shortDesc: "تنقية التسجيل للمحرك الذكي",
          icon: FileAudio,
        },
        {
          id: 2,
          title: "التفريغ الصوتي الذكي",
          shortDesc: "تحويل الصوت لنص دقيق ومصحح",
          icon: BrainCircuit,
        },
        {
          id: 3,
          title: "مطابقة الصوت بالشرائح",
          shortDesc: "ربط الدقائق الصوتية بالشرائح",
          icon: Target,
        },
        {
          id: 4,
          title: "إخراج الملف المخطط",
          shortDesc: "توليد الأسئلة وتلوين الملف المخطط",
          icon: Sparkles,
        },
      ];
    }
  }, [processingMode]);

  const activeStepIdx = useMemo(() => {
    const msg = (progressStep || "").toLowerCase();
    if (processingMode === "slides_only") {
      if (
        msg.includes("5/5") ||
        msg.includes("تلوين") ||
        msg.includes("اللمسات الأخيرة") ||
        msg.includes("حفظ") ||
        msg.includes("جاهز")
      )
        return 3;
      if (
        msg.includes("4/5") ||
        msg.includes("يفكّر") ||
        msg.includes("استنتاج") ||
        msg.includes("أسئلة") ||
        msg.includes("تلخيص") ||
        msg.includes("كبسول")
      ) {
        if (timeLeft !== null && initialEstimate > 0 && timeLeft / initialEstimate < 0.45) return 2;
        return 1;
      }
      if (
        msg.includes("2/5") ||
        msg.includes("قراءة") ||
        msg.includes("بوربوينت") ||
        msg.includes("شرائح")
      )
        return 0;

      if (timeLeft !== null && initialEstimate > 0) {
        const elapsedRatio = Math.max(0, 1 - timeLeft / initialEstimate);
        if (elapsedRatio >= 0.8) return 3;
        if (elapsedRatio >= 0.5) return 2;
        if (elapsedRatio >= 0.2) return 1;
        return 0;
      }
      return 0;
    } else if (processingMode === "audio_only") {
      if (
        msg.includes("5/5") ||
        msg.includes("دفتر") ||
        msg.includes("تجهيز") ||
        msg.includes("جاهز") ||
        msg.includes("اللمسات الأخيرة")
      )
        return 3;
      if (
        msg.includes("4/5") ||
        msg.includes("محاور") ||
        msg.includes("قواعد") ||
        msg.includes("يفكّر") ||
        msg.includes("استنتاج") ||
        msg.includes("أسئلة")
      )
        return 2;
      if (
        msg.includes("1/5") ||
        msg.includes("تفريغ") ||
        msg.includes("يستمع") ||
        msg.includes("صوت")
      )
        return 1;

      if (timeLeft !== null && initialEstimate > 0) {
        const elapsedRatio = Math.max(0, 1 - timeLeft / initialEstimate);
        if (elapsedRatio >= 0.85) return 3;
        if (elapsedRatio >= 0.55) return 2;
        if (elapsedRatio >= 0.25) return 1;
        return 0;
      }
      return 0;
    } else {
      if (
        msg.includes("5/5") ||
        msg.includes("تلوين") ||
        msg.includes("اللمسات الأخيرة") ||
        msg.includes("جاهز")
      )
        return 3;
      if (msg.includes("4/5") || msg.includes("يفكّر") || msg.includes("استنتاج")) return 2;
      if (msg.includes("2/5") || msg.includes("شرائح") || msg.includes("قراءة")) return 2;
      if (msg.includes("1/5") || msg.includes("تفريغ") || msg.includes("يستمع") || msg.includes("صوت"))
        return 1;

      if (timeLeft !== null && initialEstimate > 0) {
        const elapsedRatio = Math.max(0, 1 - timeLeft / initialEstimate);
        if (elapsedRatio >= 0.85) return 3;
        if (elapsedRatio >= 0.6) return 2;
        if (elapsedRatio >= 0.25) return 1;
        return 0;
      }
      return 0;
    }
  }, [progressStep, processingMode, timeLeft, initialEstimate]);

  const progressPercent = useMemo(() => {
    // 1. الأولوية للنسبة المئوية الحقيقية القادمة من السيرفر
    if (serverProgressPercent !== null && typeof serverProgressPercent === "number") {
      return Math.min(100, Math.max(5, Math.round(serverProgressPercent)));
    }
    // 2. الحساب التدريجي المحسوب بدقة حسب مرحلة المعالجة الفعلية
    if (timeLeft === null || initialEstimate <= 0) return 8;
    const elapsed = Math.max(0, initialEstimate - timeLeft);
    const ratio = Math.min(1.0, elapsed / initialEstimate);

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

  // Progress Countdown Timer (Intelligent, asymptotic countdown)
  useEffect(() => {
    if (!isProcessing && !isStreaming) return;
    if (timeLeft === null) return;
    const intervalMs = timeLeft <= 10 ? 3000 : 1000;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 5) return 5;
        return prev - 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isProcessing, isStreaming, timeLeft]);

  // Save Onboard Name
  const handleSaveOnboardName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardNameInput.trim()) {
      setOnboardError("يرجى إدخال اسمك أولاً.");
      return;
    }
    setIsOnboardUpdating(true);
    setOnboardError("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/transactions/update-name`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ full_name: onboardNameInput.trim() }),
        }
      );
      const resData = await response.json();
      if (response.ok) {
        setUserFullName(onboardNameInput.trim());
        setShowNameOnboarding(false);
      } else {
        setOnboardError(resData.detail?.user_message || "فشل حفظ الاسم.");
      }
    } catch {
      setOnboardError("فشل الاتصال بالخادم لحفظ الاسم.");
    } finally {
      setIsOnboardUpdating(false);
    }
  };

  // Quota Fetch
  const fetchQuota = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const fp = (typeof window !== "undefined" && localStorage.getItem("device_id_v3")) || (await getFingerprint());
      const meta = typeof window !== "undefined" ? await getDeviceMetadata() : "";

      const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`,
        "X-Fingerprint": String(fp || ""),
      };
      if (meta) {
        try {
          headers["X-Device-Metadata"] = encodeURIComponent(meta);
        } catch {}
      }

      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/quota`,
        { headers }
      );

      if (r.status === 401) {
        await signOut();
        router.replace("/login");
        return;
      }
      const data = await r.json();
      if (!r.ok) {
        // Direct Supabase Fallback when API returns error (e.g. 502 Bad Gateway)
        let resolved = false;
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
              const remaining = Math.max(0, (subData.subscription_plans.lecture_quota || 0) - (subData.lectures_used || 0));
              setQuota(remaining);
              setPlanName(subData.subscription_plans.name);
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem("cached_user_quota", String(remaining));
                  localStorage.setItem("cached_user_plan", subData.subscription_plans.name);
                } catch {}
              }
              setError(null);
              resolved = true;
            }
          } catch (sbErr) {
            console.warn("Direct Supabase fallback failed in !r.ok:", sbErr);
          }
        }
        if (!resolved) {
          const msg = data.detail?.user_message || data.detail?.technical || JSON.stringify(data);
          setError(`⚠️ خطأ من الخادم: ${msg}`);
        }
      } else {
        setQuota(data.quota_remaining);
        setPlanName(data.plan_name);
        setUserFullName(data.full_name || null);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("cached_user_quota", String(data.quota_remaining ?? 0));
            localStorage.setItem("cached_user_plan", data.plan_name || "");
          } catch {}
        }
        setError(null);
      }
    } catch (e: any) {
      console.warn("Failed to fetch quota from API, trying direct Supabase:", e);
      let resolved = false;
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
            const remaining = Math.max(0, (subData.subscription_plans.lecture_quota || 0) - (subData.lectures_used || 0));
            setQuota(remaining);
            setPlanName(subData.subscription_plans.name);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("cached_user_quota", String(remaining));
                localStorage.setItem("cached_user_plan", subData.subscription_plans.name);
              } catch {}
            }
            setError(null);
            resolved = true;
          }
        } catch (sbErr) {
          console.warn("Direct Supabase fallback error:", sbErr);
        }
      }

      if (!resolved && typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("cached_user_quota");
          if (cached !== null) setQuota(Number(cached));
          const plan = localStorage.getItem("cached_user_plan");
          if (plan) setPlanName(plan);
        } catch {}
      }
    }
  }, [session, router, signOut]);

  useEffect(() => {
    fetchQuota();
    fetchChatUsage();
  }, [session, fetchQuota, fetchChatUsage]);

  // Auth Guard
  useEffect(() => {
    const historyId = searchParams.get("history_id");
    const isDemo =
      historyId === "4198557f-5b1b-48ac-91a8-d8129de8ca0b" ||
      currentHistoryId === "4198557f-5b1b-48ac-91a8-d8129de8ca0b";
    if (!loading && !user && !isDemo) {
      router.replace("/login");
    }
  }, [user, loading, searchParams, currentHistoryId, router]);

  // Tutor Guard
  useEffect(() => {
    if (!loading && user && session?.access_token) {
      const checkTutorAccess = async () => {
        try {
          const res = await fetch(
            `${getApiBaseUrl()}/api/v1/tutoring/my-status`,
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.is_tutor || data.status === "approved") {
              router.replace("/tutor/dashboard");
            }
          }
        } catch (e) {
          console.warn("Tutor guard check error:", e);
        }
      };
      checkTutorAccess();
    }
  }, [user, loading, session, router]);

  // Unified Instant Lecture Loader (Direct Handoff & SWR Cache)
  const loadLectureById = useCallback(async (historyId: string, preloadedMeta?: any) => {
    if (!historyId) return;
    setCurrentHistoryId(historyId);

    // 1. Check instant cache or preloaded data for 0ms rendering
    let hasRenderedInstantly = false;
    let cachedMeta = preloadedMeta;

    if (!cachedMeta && typeof window !== "undefined") {
      try {
        const cachedStr = sessionStorage.getItem("lammah_instant_lecture_" + historyId);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          cachedMeta = parsed.metadata || parsed;
        }
      } catch {}
    }

    if (cachedMeta?.annotations) {
      hasRenderedInstantly = true;
      setLectureTitle(cachedMeta.title || "محاضرة جامعية");
      const hasPdf = cachedMeta.has_pdf !== undefined
        ? cachedMeta.has_pdf
        : cachedMeta.annotations?.slide_explanations?.length > 0;
      selectInitialTab(cachedMeta.annotations, !!hasPdf);
      const cachedDirectUrl = cachedMeta?.downloadUrl || cachedMeta?.download_url;
      setResult({
        transcript: cachedMeta.transcript || "",
        downloadUrl: hasPdf
          ? (cachedDirectUrl || `/api/v1/summarize/download/${cachedMeta.job_id || historyId}.pdf`)
          : null,
        annotations: cachedMeta.annotations,
        isDocumentOnly: !cachedMeta.transcript?.trim(),
      });
      setIsProcessing(false);
      setProgressStep("");
    }

    if (!hasRenderedInstantly) {
      setIsProcessing(true);
      setProgressStep("جاري استرجاع المحاضرة والتظليلات من الأرشيف...");
    }

    // 2. Fetch fresh revalidated data from server
    try {
      const token = session?.access_token;
      if (token) {
        const res = await fetch(
          `${getApiBaseUrl()}/api/v1/subscription/history/${historyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.metadata?.job_id) {
            if (data.metadata?.is_notebook || data.metadata.job_id.startsWith("notebook_")) {
              const jId = data.metadata.job_id;
              const t = data.metadata.title || "دفتر دراسي";
              const sName = data.metadata.student_name || "طالب متميز";
              router.replace(`/notebook?job_id=${jId}&title=${encodeURIComponent(t)}&student_name=${encodeURIComponent(sName)}&history_id=${historyId}`);
              return;
            }

            setChatCount(data.total_chat_count !== undefined ? data.total_chat_count : data.chat_count || 0);
            setLectureTitle(data.metadata.title || "محاضرة بدون عنوان");
            const hasPdf = data.metadata.has_pdf !== undefined
              ? data.metadata.has_pdf
              : data.metadata.annotations?.slide_explanations?.length > 0;

            selectInitialTab(data.metadata.annotations, !!hasPdf);
            const isDocOnly = data.metadata.is_prep !== undefined
              ? !!data.metadata.is_prep
              : (data.metadata.has_audio !== undefined ? !data.metadata.has_audio : !data.metadata.transcript?.trim());

            const serverDirectUrl = data.metadata.downloadUrl || data.metadata.download_url;
            setResult({
              transcript: data.metadata.transcript || "",
              downloadUrl: hasPdf
                ? (serverDirectUrl || (data.metadata.job_id ? `/api/v1/summarize/download/${data.metadata.job_id}.pdf` : `/api/v1/summarize/download/${historyId}.pdf`))
                : null,
              annotations: data.metadata.annotations,
              isDocumentOnly: isDocOnly,
            });

            try {
              sessionStorage.setItem("lammah_instant_lecture_" + historyId, JSON.stringify(data));
              if (data.metadata.job_id) {
                sessionStorage.setItem("lammah_instant_lecture_" + data.metadata.job_id, JSON.stringify(data));
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      if (!hasRenderedInstantly) {
        setError(err.message || "فشل استرجاع المحاضرة");
      }
    } finally {
      setIsProcessing(false);
      setProgressStep("");
    }
  }, [session, router, selectInitialTab]);

  // Load lecture when history_id search param is present
  useEffect(() => {
    const historyId = searchParams.get("history_id") || searchParams.get("id");
    if (historyId) {
      loadLectureById(historyId);
    }
  }, [searchParams, loadLectureById]);

  // Load Recent Lectures
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lammah_cached_history");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleanCached = parsed.filter(
              (item: any) =>
                item.id !== "4198557f-5b1b-48ac-91a8-d8129de8ca0b" &&
                !item.metadata?.is_demo &&
                !item.metadata?.title?.includes("تشفير البلوك")
            );
            setRecentLogs(cleanCached.slice(0, 6));
            setLoadingRecentLogs(false);
          }
        }
      } catch {}
    }

    if (session?.access_token) {
      fetch(`${getApiBaseUrl()}/api/v1/subscription/history?limit=6`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          const rawFresh = data.logs || [];
          const fresh = Array.isArray(rawFresh)
            ? rawFresh.filter(
                (item: any) =>
                  item.id !== "4198557f-5b1b-48ac-91a8-d8129de8ca0b" &&
                  !item.metadata?.is_demo &&
                  !item.metadata?.title?.includes("تشفير البلوك")
              )
            : [];
          setRecentLogs(fresh.slice(0, 6));
          try {
            localStorage.setItem("lammah_cached_history", JSON.stringify(fresh));
          } catch {}
          setLoadingRecentLogs(false);
        })
        .catch(() => setLoadingRecentLogs(false));
    }
  }, [session]);

  // Handle ?upload=true
  useEffect(() => {
    if (searchParams.get("upload") === "true") {
      router.push("/summarize");
    }
  }, [searchParams, router]);

  // Process Lecture (Streaming SSE Loop)
  const handleProcess = async (forceRawFiles: boolean = false) => {
    hasUserSelectedTabRef.current = false;
    const hasAudioFile = !!audioFile || multiAudioFiles.length > 0;
    const hasLectureUrl =
      (uploadMode === "url" && lectureUrl.trim().length > 0) ||
      (uploadMode === "url" && lectureUrls.filter((u) => u.trim()).length > 0);
    const hasPdfOnly = !hasAudioFile && !hasLectureUrl && (!!pdfFile || !!pdfTempId);

    if (!hasAudioFile && !hasLectureUrl && !hasPdfOnly) {
      setError(
        uploadMode === "url"
          ? "يرجى إدخال رابط المحاضرة أولاً."
          : "يرجى إرفاق ملف صوتي أو ملف PDF/PPTX للمعالجة."
      );
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

    if (uploadMode === "url") {
      const urlsToCheck: string[] = [];
      if (lectureUrl.trim()) urlsToCheck.push(lectureUrl.trim());
      lectureUrls.filter((u) => u.trim()).forEach((u) => urlsToCheck.push(u.trim()));

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

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setIsStreaming(false);
    setQueuePosition(0);
    setProgressStep("جاري المعالجة...");
    setServerProgressPercent(null);
    const isBatch =
      (uploadMode === "file" && multiAudioFiles.length > 1) ||
      (uploadMode === "url" && lectureUrls.filter((u) => u.trim()).length > 1);
    
    // حساب تقدير زمني دقيق وصادق بناءً على المدخلات الفعلية
    let estimatedSecs = 75;
    if (hasPdfOnly) {
      estimatedSecs = pdfFile ? Math.max(35, Math.min(85, Math.round(pdfFile.size / (1024 * 300)) * 5 + 30)) : 45;
    } else if (isBatch) {
      const audioCount = uploadMode === "file" ? multiAudioFiles.length : lectureUrls.filter((u) => u.trim()).length;
      estimatedSecs = Math.max(120, audioCount * 50 + (pdfFile || pdfTempId ? 45 : 30));
    } else {
      estimatedSecs = (pdfFile || pdfTempId) ? 100 : 75;
    }

    setTimeLeft(estimatedSecs);
    setInitialEstimate(estimatedSecs);

    const endpoint = isBatch
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/summarize/process-batch-lectures`
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/summarize/process-lecture`;

    const formData = new FormData();
    formData.append("metadata", await getDeviceMetadata());

    if (isBatch) {
      if (uploadMode === "url") {
        const urls = lectureUrls.filter((u) => u.trim());
        formData.append("lecture_urls", urls.join(","));
      } else {
        const tempIds = multiAudioFiles.map((item) => item.tempId).filter(Boolean);
        formData.append("audio_temp_ids", tempIds.join(","));
      }
    } else {
      if (uploadMode === "url") {
        const activeUrl = lectureUrl.trim() || lectureUrls.filter((u) => u.trim())[0] || "";
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

    if (!forceRawFiles && pastExamsTempId) formData.append("past_exams_temp_id", pastExamsTempId);
    else if (pastExamsFile) formData.append("past_exams_file", pastExamsFile);
    formData.append("auto_generate_past_exams", autoGeneratePastExams ? "true" : "false");

    try {
      const fp = await getFingerprint();
      const meta = await getDeviceMetadata();
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "X-Fingerprint": fp,
          "X-Device-Metadata": meta,
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
            if (errData.detail?.type === "no_quota" || errData.detail?.type === "quota_exceeded") {
              setError(userMsg);
              setIsProcessing(false);
              return;
            }
            throw new Error(userMsg);
          }
          throw new Error(typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail));
        } catch (parseErr: any) {
          if (parseErr.message) throw parseErr;
          throw new Error("خطأ غير متوقع.");
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamBuffer = "";
      let metadata: any = null;
      if (!reader) throw new Error("فشل في فتح البث.");

      setIsStreaming(true);
      setIsProcessing(false);

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
                    setInitialEstimate((prev) => Math.max(prev, p.time_estimate));
                  }
                  break;
                case "transcript":
                  setResult((prev) => ({ ...prev, transcript: p.text }));
                  break;
                case "metadata":
                  metadata = p;
                  setActiveTab("notes");
                  break;
                case "done":
                  fetchChatUsage();
                  if (p.title && !lectureTitle.trim()) {
                    setLectureTitle(p.title);
                  }
                  if (p.history_id) {
                    setCurrentHistoryId(p.history_id);
                    if (lectureTitle.trim() && session) {
                      fetch(
                        `${getApiBaseUrl()}/api/v1/subscription/history/${p.history_id}/title`,
                        {
                          method: "PATCH",
                          headers: {
                            Authorization: `Bearer ${session.access_token}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ title: lectureTitle.trim() }),
                        }
                      ).catch(() => {});
                    }
                    const apiBase = getApiBaseUrl();
                    fetch(`${apiBase}/api/v1/subscription/history/${p.history_id}`, {
                      headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "X-Fingerprint": fp,
                        "X-Device-Metadata": meta,
                      },
                    })
                      .then(async (r) => {
                        const fallbackAnnotations = p.annotations || metadata?.annotations;
                        if (!r.ok) {
                          selectInitialTab(fallbackAnnotations, !!p.download_url);
                          setResult((prev) => ({
                            ...prev,
                            downloadUrl: p.download_url,
                            annotations: fallbackAnnotations,
                          }));
                          return;
                        }
                        const data = await r.json();
                        const finalAnnos = data?.metadata?.annotations || fallbackAnnotations;
                        selectInitialTab(finalAnnos, !!p.download_url);
                        setResult((prev) => ({
                          ...prev,
                          downloadUrl: p.download_url,
                          annotations: finalAnnos || prev?.annotations,
                        }));
                      })
                      .catch(() => {
                        const finalAnnos = p.annotations || metadata?.annotations;
                        selectInitialTab(finalAnnos, !!p.download_url);
                        setResult((prev) => ({
                          ...prev,
                          downloadUrl: p.download_url,
                          annotations: finalAnnos || prev?.annotations,
                        }));
                      });
                  } else {
                    const finalAnnos = p.annotations || metadata?.annotations;
                    selectInitialTab(finalAnnos, !!p.download_url);
                    setResult((prev) => ({
                      ...prev,
                      downloadUrl: p.download_url,
                      annotations: finalAnnos || prev?.annotations,
                    }));
                  }
                  fetchQuota();
                  setTimeLeft(0);
                  setIsStreaming(false);
                  setProgressStep("");
                  break;

                case "complete":
                  fetchChatUsage();
                  fetchQuota();
                  selectInitialTab(p.data.annotations, !!p.data.downloadUrl);
                  setResult({
                    transcript: p.data.transcript || "",
                    downloadUrl: p.data.downloadUrl,
                    annotations: p.data.annotations,
                    isDocumentOnly: hasPdfOnly,
                  });
                  setTimeLeft(0);
                  setIsStreaming(false);
                  setProgressStep("");
                  break;
                case "error":
                  setError(p.message);
                  setTimeLeft(null);
                  setIsStreaming(false);
                  break;
              }
            } catch {}
          }
          boundary = streamBuffer.indexOf("\n\n");
        }
      }
    } catch (err: any) {
      setError(err.message);
      setTimeLeft(null);
      setIsProcessing(false);
      setIsStreaming(false);
    }
  };

  // Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading || !currentHistoryId || !session) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);

    try {
      const fp = await getFingerprint();
      const meta = await getDeviceMetadata();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/chat/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          "X-Fingerprint": fp,
          "X-Device-Metadata": meta,
        },
        body: JSON.stringify({
          history_id: currentHistoryId,
          question: userMsg,
          chat_history: chatMessages,
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

      setChatCount((prev) => prev + 1);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("فشل فتح البث");

      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setChatMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunk,
          };
          return newMessages;
        });
      }
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "❌ عذراً، حدث خطأ: " + err.message }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const showResults = !!result || isStreaming || isProcessing;

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100"
      dir="rtl"
    >
      {/* Ambient Background Aura */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full dark:from-indigo-600/15 dark:via-purple-600/10 pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-500/5 blur-3xl rounded-full pointer-events-none dark:bg-indigo-500/5" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-purple-500/5 blur-3xl rounded-full pointer-events-none dark:bg-purple-500/5" />
      </div>

      {/* Top Floating App Header */}
      <AppHeader quota={quota} activePage="dashboard" />

      <div
        className={`flex-1 flex flex-col items-center overflow-x-hidden relative w-full z-10 ${
          (isStreaming || isProcessing) && !result?.annotations
            ? "justify-center py-2 sm:py-3 px-2 sm:px-4"
            : "px-4 pt-20 sm:pt-20 pb-16 max-w-6xl mx-auto"
        }`}
      >
        <AnimatePresence mode="wait">
          {(isStreaming || isProcessing) && !result?.annotations ? (
            <DashboardProcessingScreen
              isDocumentOnly={isDocumentOnly}
              activeFileName={activeFileName}
              queuePosition={queuePosition}
              timeLeft={timeLeft}
              progressStep={progressStep}
              progressPercent={progressPercent}
              currentPipelineSteps={currentPipelineSteps}
              activeStepIdx={activeStepIdx}
            />
          ) : !showResults ? (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-5xl flex flex-col space-y-4 sm:space-y-7 py-2 sm:py-4"
            >
              {/* Announcement Notice */}
              <DashboardAnnouncementNotice />

              {/* Master Hero Banner & Academic Gift Hook */}
              <DashboardHeroBanner
                userFullName={userFullName}
                userEmail={user?.email}
                studentProfileData={studentProfileData}
                onOpenStudentProfileModal={() => setShowStudentProfileModal(true)}
              />

              {/* Recent Lectures Carousel & Quick Access */}
              <RecentLecturesSection
                recentLogs={recentLogs}
                loadingRecentLogs={loadingRecentLogs}
                onSelectLecture={(log) => loadLectureById(log.id, log.metadata)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Title & Edit Toolbar */}
                <DashboardTitleBar
                  lectureTitle={lectureTitle}
                  setLectureTitle={setLectureTitle}
                  currentHistoryId={currentHistoryId}
                  sessionToken={session?.access_token}
                  onBackToHome={() => {
                    setResult(null);
                    setAudioFile(null);
                    setPdfFile(null);
                    setError(null);
                    setCurrentHistoryId(null);
                    setLectureTitle("");
                    router.push("/dashboard");
                  }}
                />

                {/* Warning Banner for Trimmed Audio */}
                {result?.annotations?.is_audio_trimmed && (!hasPaidPlan || planName === "مجاني" || planName.includes("بدون")) && (
                  <div className="lg:col-span-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/50 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-3 shadow-xs text-center sm:text-right">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-amber-900 dark:text-amber-400 font-bold text-xs sm:text-sm mb-0.5">
                        تنبيه: تم تحليل جزء من المحاضرة فقط
                      </h4>
                      <p className="text-amber-800/90 dark:text-amber-200/90 text-xs leading-relaxed">
                        تم استخراج وتحليل جزء من المحاضرة وفق الرصيد المتاح. للوصول إلى تفريغ وتلخيص كامل لأي محاضرة مهما كان طولها، اشترك في إحدى باقات لمّاح الآن.
                      </p>
                    </div>
                    <Link
                      href="/plans"
                      prefetch={true}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-black text-xs shrink-0 transition-colors shadow-xs cursor-pointer text-center"
                    >
                      الترقية الآن
                    </Link>
                  </div>
                )}

                {/* Left/Center Column: PDF Viewer and Transcript */}
                <div className="lg:col-span-2 space-y-6 relative">
                  {result?.downloadUrl && (
                    <DashboardPdfViewer
                      pdfContainerRef={pdfContainerRef}
                      pdfFlash={pdfFlash}
                      downloadUrl={result.downloadUrl}
                      pdfPage={pdfPage}
                      isBasicPlan={isBasicPlan}
                      lectureTitle={lectureTitle}
                      isDocumentOnly={result?.isDocumentOnly}
                    />
                  )}

                  {result?.transcript && (
                    <DashboardTranscriptViewer
                      transcript={result.transcript}
                      parsedTranscriptLines={parsedTranscriptLines}
                      transcriptSearchQuery={transcriptSearchQuery}
                    />
                  )}
                </div>

                {/* Right Column: Dynamic Tabs & Study Tools */}
                <div className="space-y-6">
                  <DashboardTabsNav
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    annotations={result?.annotations}
                    hasPdfDownload={!!result?.downloadUrl}
                    filteredFocusPoints={filteredFocusPoints}
                    pastExamQuestions={pastExamQuestions}
                    currentHistoryId={currentHistoryId}
                    onSelectQuizTab={() => setIsQuizCompleted(false)}
                  />

                  {/* TAB 1: Notes & Explanations (only if no PDF) */}
                  {activeTab === "notes" && !result?.downloadUrl && (
                    <NotesTabContent
                      annotations={result?.annotations}
                      jumpToPdfSlide={jumpToPdfSlide}
                    />
                  )}

                  {/* TAB 2: Focus Points */}
                  {activeTab === "focus" && (
                    <FocusPointsTabContent
                      filteredFocusPoints={filteredFocusPoints}
                      slidePageMap={result?.annotations?.slide_page_map}
                      companionPageMap={result?.annotations?.companion_page_map}
                      jumpToPdfSlide={jumpToPdfSlide}
                    />
                  )}

                  {/* TAB 3: Flashcards */}
                  {activeTab === "flashcards" && (
                    <FlashcardsTabContent
                      flashcards={result?.annotations?.flashcards || []}
                      isBasicPlan={shouldLockStudyTools}
                    />
                  )}

                  {/* TAB 4: MCQs Quiz */}
                  {activeTab === "quiz" && (
                    <QuizTabContent
                      mcqs={result?.annotations?.mcqs || []}
                      isBasicPlan={shouldLockStudyTools}
                      slidePageMap={result?.annotations?.slide_page_map}
                      companionPageMap={result?.annotations?.companion_page_map}
                      jumpToPdfSlide={jumpToPdfSlide}
                      isQuizCompleted={isQuizCompleted}
                      setIsQuizCompleted={setIsQuizCompleted}
                    />
                  )}

                  {/* TAB 5: Past Exams */}
                  {activeTab === "past_exams" && (
                    <PastExamsTabContent
                      pastExamQuestions={pastExamQuestions}
                      isBasicPlan={shouldLockStudyTools}
                      slidePageMap={result?.annotations?.slide_page_map}
                      jumpToPdfSlide={jumpToPdfSlide}
                    />
                  )}

                  {/* TAB 6: AI Tutor Chat */}
                  {activeTab === "chat" && (
                    <SmartChatTabContent
                      chatMessages={chatMessages}
                      chatInput={chatInput}
                      setChatInput={setChatInput}
                      isChatLoading={isChatLoading}
                      handleChatSubmit={handleChatSubmit}
                      chatCount={chatCount}
                      subscriptionLimit={subscriptionLimit}
                      isBasicPlan={isBasicPlan}
                      isDemoLecture={isDemoLecture}
                      isDocumentOnly={isDocumentOnly}
                      isAudioOnly={isAudioOnly}
                    />
                  )}

                  {result && (
                    <button
                      onClick={() => {
                        setResult(null);
                        setProgressStep("");
                      }}
                      className="w-full py-4 bg-white hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-600/50 rounded-2xl text-slate-700 dark:text-slate-300 font-bold transition-all shadow-sm cursor-pointer"
                    >
                      محاضرة جديدة
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Modals */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />

      <OnboardingNameModal
        isOpen={showNameOnboarding}
        onboardNameInput={onboardNameInput}
        setOnboardNameInput={setOnboardNameInput}
        handleSaveOnboardName={handleSaveOnboardName}
        isOnboardUpdating={isOnboardUpdating}
        onboardError={onboardError}
      />

      <VirtualDemoModal
        showDemoModal={showDemoModal}
        onClose={() => setShowDemoModal(null)}
        onImportDemoAudio={() => {
          setShowDemoModal(null);
          const mockFile = new File(["demo_audio"], "محاضرة_تشفير_البلوك_والستريم_سايفر.mp3", {
            type: "audio/mp3",
          });
          setAudioFile(mockFile);
          setAudioUploadProgress(0);
          setIsAudioUploading(true);

          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setAudioUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              setIsAudioUploading(false);
              setAudioTempId("demo_temp_audio_id");
            }
          }, 100);
        }}
        onImportDemoPdf={() => {
          setShowDemoModal(null);
          const mockFile = new File(["demo_pdf"], "سلايدات_تشفير_البلوك_والستريم_سايفر.pdf", {
            type: "application/pdf",
          });
          setPdfFile(mockFile);
          setPdfUploadProgress(0);
          setIsPdfUploading(true);

          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setPdfUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              setIsPdfUploading(false);
              setPdfTempId("demo_temp_pdf_id");
            }
          }, 100);
        }}
      />

      <StudentProfileModal
        isOpen={showStudentProfileModal}
        onClose={() => setShowStudentProfileModal(false)}
        session={session}
        initialData={studentProfileData}
        onSuccess={(updated: any, resData?: any) => {
          setStudentProfileData(updated);
          if (resData?.new_quota !== undefined) {
            setQuota(resData.new_quota);
          }
          fetchQuota();
        }}
      />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#030712] animate-pulse" />}>
      <DashboardContent />
    </Suspense>
  );
}

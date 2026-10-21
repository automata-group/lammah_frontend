"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Clock, CheckCircle, XCircle, AlertCircle, Search,
  Pencil, Check, X, FileText, ChevronLeft, BookOpen, MessageCircle,
  Download, Sparkles, Calendar, Layers, FileDown, ArrowRight
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import SmartGenerateButton from "@/components/SmartGenerateButton";
import StudyFocusTimer from "@/components/dashboard/StudyFocusTimer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";

export default function HistoryPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transcriptSearch, setTranscriptSearch] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"lectures" | "notebooks">("lectures");
  const editInputRef = useRef<HTMLInputElement>(null);
  const [publishedMap, setPublishedMap] = useState<Record<string, any>>({});
  const [userQuota, setUserQuota] = useState<number | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("cached_user_quota");
      if (cached !== null && !isNaN(Number(cached))) setUserQuota(Number(cached));
    } catch {}
  }, []);

  const lecturesCount = logs.filter(l => !l.metadata?.is_notebook).length;
  const notebooksCount = logs.filter(l => l.metadata?.is_notebook).length;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  useEffect(() => {
    // 1. Instant Cache: Load cached logs immediately for 0-second perceived latency
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("lammah_cached_history");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLogs(parsed);
            setLoadingLogs(false);
          }
        }
      } catch {}
    }

    if (session) {
      fetch(`${API}/api/v1/subscription/history`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(r => r.json())
        .then(data => {
          const fresh = data.logs || [];
          setLogs(fresh);
          setLoadingLogs(false);
          try {
            localStorage.setItem("lammah_cached_history", JSON.stringify(fresh));
          } catch {}
        })
        .catch(() => setLoadingLogs(false));

      fetch(`${API}/api/v1/subscription/quota`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.quota_remaining !== undefined) {
            setUserQuota(data.quota_remaining);
            try { localStorage.setItem("cached_user_quota", String(data.quota_remaining)); } catch {}
          }
        })
        .catch(() => {});

      fetch(`${API}/api/v1/marketplace/my-notebooks`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.status === "success" && Array.isArray(data.notebooks)) {
            const map: Record<string, any> = {};
            data.notebooks.forEach((nb: any) => {
              if (nb.pdf_url) {
                const lowerUrl = nb.pdf_url.trim().toLowerCase();
                map[lowerUrl] = nb;
                const cleanPath = lowerUrl.replace(/^https?:\/\/[^\/]+/, "");
                map[cleanPath] = nb;
                const match = lowerUrl.match(/notebook_[a-zA-Z0-9_-]+/);
                if (match) {
                  map[match[0].toLowerCase()] = nb;
                }
              }
              if (nb.title) {
                map[nb.title.trim().toLowerCase()] = nb;
              }
              if (nb.id) {
                map[nb.id] = nb;
              }
            });
            setPublishedMap(map);
          }
        })
        .catch(e => console.error("Failed to fetch my published notebooks:", e));
    }
  }, [session]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const handleSaveTitle = async (logId: string) => {
    if (!editingTitle.trim() || !session) return;
    const prevLogs = [...logs];
    // Optimistic update
    setLogs(prev => prev.map(l => l.id === logId
      ? { ...l, metadata: { ...(l.metadata || {}), title: editingTitle.trim() } }
      : l
    ));
    setEditingId(null);
    try {
      await fetch(`${API}/api/v1/subscription/history/${logId}/title`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: editingTitle.trim() })
      });
    } catch {
      setLogs(prevLogs); // revert on failure
    }
  };

  const getTitle = (log: any) => {
    return log.metadata?.title || null;
  };

  const getTranscript = (log: any): string => {
    return log.metadata?.transcript || "";
  };

  const getHighlighted = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="bg-amber-200 text-amber-900 dark:bg-yellow-400/30 dark:text-yellow-200 rounded px-1">{part}</mark>
            : part
        )}
      </>
    );
  };

  // Filtered logs by tab and query
  const filtered = logs.filter(log => {
    const isNotebook = !!log.metadata?.is_notebook;
    if (activeTab === "notebooks" && !isNotebook) return false;
    if (activeTab === "lectures" && isNotebook) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const title = (getTitle(log) || "محاضرة").toLowerCase();
    const transcript = getTranscript(log).toLowerCase();
    const date = new Date(log.created_at).toLocaleString("ar").toLowerCase();
    return title.includes(q) || transcript.includes(q) || date.includes(q);
  });

  const statusIcon = (s: string) => {
    if (s === "success") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (s === "failed") return <XCircle className="w-4 h-4 text-rose-500" />;
    return <AlertCircle className="w-4 h-4 text-amber-500" />;
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300" dir="rtl">
      
      {/* Unified App Header */}
      <AppHeader quota={userQuota} activePage="history" />

      {/* Background Soft Mesh Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 space-y-8">

        {/* Modern Unified Hero Header Card */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
          {/* Subtle Ambient Background Accents */}
          <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-30 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top Bar: Back Action */}
          <div className="flex items-center justify-end mb-4 relative z-10">
            <button 
              onClick={() => router.push("/dashboard")} 
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-black transition-all shadow-2xs cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>العودة للرئيسية</span>
            </button>
          </div>

          {/* Center Info Row: Title + Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10 mb-6">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  سجل الاستخدام
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  عرض وإدارة محاضراتك ودفاترك السابقة والوصول السريع إليها.
                </p>
              </div>
            </div>

            {/* Quick Stat Chips & Study Focus Timer */}
            <div className="flex items-center gap-2 self-start lg:self-center flex-wrap">
              <StudyFocusTimer />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>محاضرات:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{lecturesCount}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span>دفاتر ملخصة:</span>
                <span className="font-black text-violet-600 dark:text-violet-400">{notebooksCount}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>الإجمالي:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{logs.length}</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Seamless Tabs Switcher & Search Bar */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
            {/* Tabs Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab("lectures"); setSearchQuery(""); }}
                className={`py-2 px-3 sm:px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "lectures" 
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>محاضراتي المفرغة</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === "lectures" 
                    ? "bg-indigo-50 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100" 
                    : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {lecturesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("notebooks"); setSearchQuery(""); }}
                className={`py-2 px-3 sm:px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "notebooks" 
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>دفاتر التلخيص والملاحظات</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  activeTab === "notebooks" 
                    ? "bg-indigo-50 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100" 
                    : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {notebooksCount}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={activeTab === "notebooks" ? "ابحث عن دفترك السابق بالاسم..." : "ابحث بالعنوان أو النص المفرّغ أو التاريخ..."}
                className="w-full bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700/60 rounded-xl py-2.5 pr-10 pl-9 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-850 focus:ring-2 focus:ring-indigo-500/10 transition-all text-xs sm:text-sm font-medium shadow-2xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results count when filtering */}
          {searchQuery && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold px-1 mt-3">
              تم العثور على {filtered.length} نتيجة من أصل {logs.filter(l => activeTab === "notebooks" ? l.metadata?.is_notebook : !l.metadata?.is_notebook).length} عناصر
            </p>
          )}
        </div>

        {/* Logs Rendering */}
        {loadingLogs ? (
          activeTab === "notebooks" ? (
            /* Sleek Skeleton Grid for Notebooks */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
                        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  </div>
                  <div className="space-y-2 border-y border-slate-100 dark:border-slate-800 py-3.5">
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                    <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                  </div>
                  <div className="flex gap-2.5">
                    <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Sleek Skeleton Rows for Lectures */
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 sm:w-72 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-3 w-28 sm:w-40 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl hidden sm:block" />
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filtered.length > 0 ? (
          activeTab === "notebooks" ? (
            /* Notebooks PDF Cards Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filtered.map((log, idx) => {
                const title = getTitle(log) || "دفتر دراسي متميز";
                const studentName = log.metadata?.student_name || "طالب متميز";
                const jobId = log.metadata?.job_id;
                const downloadPath = jobId ? `/api/v1/notebook/download/${jobId}.pdf` : "";
                
                // Enhanced matching logic for owner's published status
                const publishedItem = (jobId && publishedMap[jobId.toLowerCase()]) ||
                  (downloadPath && publishedMap[downloadPath.toLowerCase()]) ||
                  (title && publishedMap[title.trim().toLowerCase()]) ||
                  null;
                const isPublished = !!publishedItem;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Card Header & Notebook Icon */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300 shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {searchQuery ? getHighlighted(title, searchQuery) : title}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium block mt-0.5">إعداد الطالب: {studentName}</span>
                        </div>
                      </div>
                      
                      {isPublished ? (
                        <span className="text-[11px] bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          أنت ناشرها بالمتجر 🟢
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-black px-3 py-1 rounded-full shrink-0">
                          دفتر ملخص 📚
                        </span>
                      )}
                    </div>

                    {/* Info Details */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 border-y border-slate-100 dark:border-slate-800 py-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-500">تاريخ التوليد:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{new Date(log.created_at).toLocaleDateString("ar")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-slate-500">حالة الملف:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> جاهز للتحميل
                        </span>
                      </div>
                      {isPublished && publishedItem?.price && (
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 dark:text-slate-500">معروضة للبيع بسعر:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">
                            {publishedItem.price} ₪
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => {
                          if (jobId) {
                            router.push(`/notebook?job_id=${jobId}&title=${encodeURIComponent(title)}&student_name=${encodeURIComponent(studentName)}&history_id=${log.id}`);
                          } else {
                            router.push(`/notebook?history_id=${log.id}`);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all text-center cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 shrink-0" />
                        فتح وتصفح الدفتر 📖
                      </button>

                      {jobId && (() => {
                        const isPrep = log.metadata?.is_prep !== undefined
                          ? !!log.metadata.is_prep
                          : (log.metadata?.has_audio !== undefined ? !log.metadata.has_audio : !log.metadata?.transcript?.trim());
                        const cleanTitle = (title || "المادة الدراسية").replace(/^دفتر\s+/, "").replace(/^محاضرة\s+/, "").replace(/[\\/*?:"<>|]/g, " ").trim() || "المادة الدراسية";
                        const filename = `${cleanTitle} - ${isPrep ? "دفتر تحضير سلايدات" : "دفتر مخطط فويسات"} - لمّاح.pdf`;
                        const dlUrl = `${API}/api/v1/notebook/download/${jobId}.pdf?download=true&title=${encodeURIComponent(cleanTitle)}&is_prep=${isPrep}`;

                        return (
                          <a
                            href={dlUrl}
                            download={filename}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all text-center cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                            تحميل PDF 📥
                          </a>
                        );
                      })()}
                      
                      {isPublished ? (
                        <button
                          onClick={() => router.push(`/marketplace`)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 transition-all text-center cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>معروضة في المتجر ✅ (معاينة)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!jobId) return;
                            const params = new URLSearchParams({
                              pdfUrl: downloadPath,
                              previewUrl: `/api/v1/notebook/download/preview_${jobId.replace("notebook_", "")}.pdf`,
                              title: title,
                              studentName: studentName
                            });
                            router.push(`/marketplace/publish?${params.toString()}`);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 transition-all text-center cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          نشر في المتجر 🛒
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Traditional Lectures Rows Layout */
            <div className="space-y-3 sm:space-y-4">
              {filtered.map((log, idx) => {
                const hasData = log.metadata && (log.metadata.job_id || log.metadata.transcript);
                const title = getTitle(log);
                const transcript = getTranscript(log);
                const tSearch = transcriptSearch[log.id] || "";
                const isExpanded = expandedId === log.id;
                const isEditing = editingId === log.id;

                const tLines = transcript.split("\n").filter((l: string) => l.trim());
                const matchedLines = tSearch.trim()
                  ? tLines.filter((l: string) => l.toLowerCase().includes(tSearch.toLowerCase()))
                  : tLines.slice(0, 5);

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`border rounded-2xl overflow-hidden transition-all bg-white dark:bg-slate-900/60 shadow-xs hover:shadow-md ${
                      hasData
                        ? "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30"
                        : "border-slate-200/60 dark:border-slate-800/40 opacity-70"
                    }`}
                  >
                    {/* Log Header Row */}
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {statusIcon(log.status)}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                ref={editInputRef}
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") handleSaveTitle(log.id);
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-indigo-400 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none"
                                placeholder="أدخل عنوان المحاضرة..."
                              />
                              <button onClick={() => handleSaveTitle(log.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors cursor-pointer">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group flex-wrap">
                              <p className={`font-bold text-sm sm:text-base truncate ${title ? "text-slate-900 dark:text-white" : "text-slate-400 italic"}`}>
                                {title
                                  ? (searchQuery ? getHighlighted(title, searchQuery) : title)
                                  : "محاضرة بدون عنوان"}
                              </p>
                              {log.id === "4198557f-5b1b-48ac-91a8-d8129de8ca0b" && (
                                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/35 select-none mr-2">
                                  محاضرة نموذجية 🧪
                                </span>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); setEditingId(log.id); setEditingTitle(title || ""); }}
                                className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer"
                                title="تعديل العنوان"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(log.created_at).toLocaleString("ar")}
                            </span>
                            {transcript && (
                              <span className="text-xs text-slate-400 font-medium">
                                • {Math.round(transcript.length / 5)} كلمة تقريباً
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {transcript && (
                          <button
                            onClick={() => {
                              setExpandedId(isExpanded ? null : log.id);
                              if (!isExpanded) setTranscriptSearch(prev => ({ ...prev, [log.id]: "" }));
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              isExpanded
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/30 dark:border-indigo-500/50 dark:text-indigo-300"
                                : "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {isExpanded ? "إخفاء" : "التفريغ"}
                          </button>
                        )}
                        {hasData && (
                          <button
                            onClick={() => {
                              if (log.metadata?.is_notebook || log.metadata?.job_id?.startsWith("notebook_")) {
                                const jId = log.metadata?.job_id;
                                const t = getTitle(log) || log.feature_name || "دفتر دراسي";
                                const sName = log.metadata?.student_name || "طالب متميز";
                                if (jId) {
                                  router.push(`/notebook?job_id=${jId}&title=${encodeURIComponent(t)}&student_name=${encodeURIComponent(sName)}&history_id=${log.id}`);
                                } else {
                                  router.push(`/notebook?history_id=${log.id}`);
                                }
                              } else {
                                router.push(`/dashboard?history_id=${log.id}`);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            فتح
                          </button>
                        )}
                        {log.metadata?.job_id && (() => {
                          const isPrep = log.metadata?.is_prep !== undefined
                            ? !!log.metadata.is_prep
                            : (log.metadata?.has_audio !== undefined ? !log.metadata.has_audio : !log.metadata?.transcript?.trim());
                          const cleanTitle = (getTitle(log) || "المادة الدراسية").replace(/^محاضرة\s+/, "").replace(/^دفتر\s+/, "").replace(/[\\/*?:"<>|]/g, " ").trim() || "المادة الدراسية";
                          const filename = `${cleanTitle} - ${isPrep ? "تحضير سلايدات" : "مخططة فويسات"} - لمّاح.pdf`;
                          const dlUrl = `${API}/api/v1/summarize/download/${log.metadata.job_id}.pdf?title=${encodeURIComponent(cleanTitle)}&is_prep=${isPrep}`;

                          return (
                            <a
                              href={dlUrl}
                              download={filename}
                              target="_blank"
                              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                              title="تحميل الملف (PDF)"
                              onClick={e => e.stopPropagation()}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Expanded Transcript Section */}
                    <AnimatePresence>
                      {isExpanded && transcript && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-4 border-t border-slate-100 dark:border-slate-800 pt-3 bg-slate-50/50 dark:bg-slate-950/40">
                            {/* Transcript Search */}
                            <div className="relative mb-3">
                              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                              <input
                                type="text"
                                value={tSearch}
                                onChange={e => setTranscriptSearch(prev => ({ ...prev, [log.id]: e.target.value }))}
                                placeholder="ابحث في التفريغ..."
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pr-9 pl-4 text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                              />
                              {tSearch && (
                                <button
                                  onClick={() => setTranscriptSearch(prev => ({ ...prev, [log.id]: "" }))}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Transcript results info */}
                            {tSearch && (
                              <p className="text-xs text-slate-500 mb-2 font-bold">
                                تم العثور على {matchedLines.length} سطر يحتوي على "{tSearch}"
                              </p>
                            )}

                            {/* Transcript text */}
                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-h-[320px] overflow-y-auto space-y-2.5">
                              {(tSearch ? matchedLines : tLines.slice(0, 20)).map((line: string, i: number) => (
                                <p key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-b border-slate-100 dark:border-slate-900 pb-2 last:border-0 last:pb-0 font-medium">
                                  {tSearch ? getHighlighted(line, tSearch) : (searchQuery ? getHighlighted(line, searchQuery) : line)}
                                </p>
                              ))}
                              {!tSearch && tLines.length > 20 && (
                                <p className="text-xs text-slate-500 text-center pt-2 font-bold">
                                  ... و {tLines.length - 20} سطر آخر — افتح المحاضرة لرؤية التفريغ كاملاً
                                </p>
                              )}
                              {tSearch && matchedLines.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4 font-bold">لا توجد نتائج مطابقة</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-12 sm:p-16 text-center shadow-sm">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-300 mb-2">لا توجد نتائج مطابقة</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">لم نجد أي محاضرة أو دفتر مطابق لعبارة "{searchQuery}"</p>
                <button onClick={() => setSearchQuery("")} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-white font-bold rounded-xl transition-all text-xs cursor-pointer">
                  مسح البحث
                </button>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-indigo-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-300 mb-2">السجل فارغ حتى الآن</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm mx-auto font-medium leading-relaxed">
                  {activeTab === "notebooks" 
                    ? "لم تقم بإنشاء أي دفاتر ملخصة بعد. يمكنك البدء بإنشاء دفترك الأول الآن!" 
                    : "ابدأ بتلخيص محاضرتك الأولى وسيظهر سجل المحاضرات المفرغة هنا تلقائياً."
                  }
                </p>
                <div className="flex justify-center mt-2">
                  <SmartGenerateButton 
                    onClick={() => router.push(activeTab === "notebooks" ? "/notebook" : "/dashboard")} 
                    text={activeTab === "notebooks" ? "إنشاء دفتر ملخص الآن" : "ابدأ التلخيص الآن"}
                    variant="pill"
                    fullWidth={false}
                    size="sm"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Clock, CheckCircle, XCircle, AlertCircle, Search,
  Pencil, Check, X, FileText, ChevronLeft, BookOpen, MessageCircle,
  Download, Sparkles, Calendar, Layers, FileDown
} from "lucide-react";

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
  const [publishedUrls, setPublishedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  useEffect(() => {
    if (session) {
      fetch(`${API}/api/v1/subscription/history`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(r => r.json())
        .then(data => { setLogs(data.logs || []); setLoadingLogs(false); })
        .catch(() => setLoadingLogs(false));

      fetch(`${API}/api/v1/marketplace/my-notebooks`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.status === "success" && Array.isArray(data.notebooks)) {
            const urls = new Set<string>();
            data.notebooks.forEach((nb: any) => {
              if (nb.pdf_url) {
                urls.add(nb.pdf_url.trim().toLowerCase());
              }
            });
            setPublishedUrls(urls);
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
            ? <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{part}</mark>
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
    if (s === "success") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (s === "failed") return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertCircle className="w-4 h-4 text-amber-400" />;
  };

  if (loading || !user) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-10 relative overflow-hidden" dir="rtl">
      
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-slate-400 hover:text-indigo-300 text-sm transition-colors font-bold">
            <ChevronLeft className="w-4 h-4" />
            العودة للداشبورد
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/30">
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-l from-white to-slate-400">سجل الاستخدام</h1>
              <p className="text-xs text-slate-500">عرض وإدارة محاضراتك وملازمك السابقة</p>
            </div>
          </div>
        </div>

        {/* Elegant Tabs Switcher */}
        <div className="flex border-b border-white/5 mb-8 p-1 bg-white/[0.02] border border-white/[0.05] rounded-2xl max-w-md mx-auto">
          <button
            onClick={() => { setActiveTab("lectures"); setSearchQuery(""); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "lectures" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            🎙️ محاضراتي المفرغة
          </button>
          <button
            onClick={() => { setActiveTab("notebooks"); setSearchQuery(""); }}
            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "notebooks" 
                ? "bg-amber-500 text-[#0c0f17] shadow-lg shadow-amber-500/10" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            📚 الملازم والدفاتر الفاخرة
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === "notebooks" ? "ابحث عن ملزمتك السابقة بالاسم..." : "ابحث بالعنوان أو النص المفرّغ أو التاريخ..."}
            className="w-full bg-slate-900/60 border border-white/5 rounded-2xl py-4 pr-12 pl-5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-900 transition-all text-sm backdrop-blur-xl"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results count when filtering */}
        {searchQuery && (
          <p className="text-xs text-slate-500 mb-4 px-1">
            {filtered.length} نتيجة من أصل {logs.filter(l => activeTab === "notebooks" ? l.metadata?.is_notebook : !l.metadata?.is_notebook).length} عناصر
          </p>
        )}

        {/* Logs Rendering */}
        {loadingLogs ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" /></div>
        ) : filtered.length > 0 ? (
          activeTab === "notebooks" ? (
            /* Notebooks PDF Cards Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((log, idx) => {
                const title = getTitle(log) || "دفتر دراسي متميز";
                const studentName = log.metadata?.student_name || "طالب متميز";
                const jobId = log.metadata?.job_id;
                const downloadPath = jobId ? `/api/v1/notebook/download/${jobId}.pdf` : "";
                const isPublished = jobId ? publishedUrls.has(downloadPath.trim().toLowerCase()) : false;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-slate-900/50 border border-amber-500/10 hover:border-amber-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-6 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all"
                  >
                    {/* Card Header & Notebook Icon */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-300">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-black text-white text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                            {searchQuery ? getHighlighted(title, searchQuery) : title}
                          </h3>
                          <span className="text-xs text-slate-500 block mt-0.5">إعداد الطالب: {studentName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black px-2.5 py-1 rounded-full shrink-0">
                        ملزمة فاخرة 👑
                      </span>
                    </div>

                    {/* Info Details */}
                    <div className="text-xs text-slate-400 space-y-2 border-y border-white/5 py-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">تاريخ التوليد:</span>
                        <span className="font-medium text-slate-300">{new Date(log.created_at).toLocaleDateString("ar")}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">حالة الملف:</span>
                        <span className="text-green-400 font-black flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> جاهز للتحميل
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5">
                      {jobId && (
                        <a
                          href={`${API}/api/v1/notebook/download/${jobId}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-[#0c0f17] shadow-lg shadow-amber-500/10 transition-all text-center"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          تحميل PDF 📥
                        </a>
                      )}
                      
                      {isPublished ? (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-not-allowed text-center"
                        >
                          <span>تم النشر في المتجر ✅</span>
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
                          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/40 text-indigo-300 transition-all text-center"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
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
            <div className="space-y-3">
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
                    className={`border rounded-2xl overflow-hidden backdrop-blur-md transition-all ${hasData
                      ? "bg-slate-900/50 border-indigo-500/10 hover:border-indigo-500/30"
                      : "bg-slate-900/20 border-slate-700/20 opacity-70"
                      }`}
                  >
                    {/* Log Header Row */}
                    <div className="p-4 flex items-center justify-between gap-3">
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
                                className="flex-1 bg-slate-950 border border-indigo-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                                placeholder="أدخل عنوان المحاضرة..."
                              />
                              <button onClick={() => handleSaveTitle(log.id)} className="p-1.5 bg-green-500/20 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-700 rounded-lg text-slate-400 hover:bg-slate-600 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <p className={`font-semibold text-sm truncate ${title ? "text-white" : "text-slate-400 italic"}`}>
                                {title
                                  ? (searchQuery ? getHighlighted(title, searchQuery) : title)
                                  : "محاضرة بدون عنوان"}
                              </p>
                              <button
                                onClick={e => { e.stopPropagation(); setEditingId(log.id); setEditingTitle(title || ""); }}
                                className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-slate-800"
                                title="تعديل العنوان"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(log.created_at).toLocaleString("ar")}
                            </span>
                            {transcript && (
                              <span className="text-xs text-slate-600">
                                {Math.round(transcript.length / 5)} كلمة تقريباً
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
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isExpanded
                              ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40"
                              }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {isExpanded ? "إخفاء" : "التفريغ"}
                          </button>
                        )}
                        {hasData && (
                          <button
                            onClick={() => router.push(`/dashboard?history_id=${log.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            فتح
                          </button>
                        )}
                        {log.metadata?.job_id && (
                          <a
                            href={`${API}/api/v1/summarize/download/${log.metadata.job_id}.pdf`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-all"
                            title="تحميل الملزمة"
                            onClick={e => e.stopPropagation()}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
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
                          <div className="px-4 pb-4 border-t border-slate-800/50 pt-3">
                            {/* Transcript Search */}
                            <div className="relative mb-3">
                              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                              <input
                                type="text"
                                value={tSearch}
                                onChange={e => setTranscriptSearch(prev => ({ ...prev, [log.id]: e.target.value }))}
                                placeholder="ابحث في التفريغ..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-9 pl-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                              />
                              {tSearch && (
                                <button
                                  onClick={() => setTranscriptSearch(prev => ({ ...prev, [log.id]: "" }))}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Transcript results info */}
                            {tSearch && (
                              <p className="text-xs text-slate-500 mb-2">
                                {matchedLines.length} سطر يحتوي على "{tSearch}"
                              </p>
                            )}

                            {/* Transcript text */}
                            <div className="bg-slate-950 rounded-xl p-4 max-h-[320px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                              {(tSearch ? matchedLines : tLines.slice(0, 20)).map((line: string, i: number) => (
                                <p key={i} className="text-sm text-slate-300 leading-relaxed border-b border-slate-900/60 pb-2 last:border-0 last:pb-0">
                                  {tSearch ? getHighlighted(line, tSearch) : (searchQuery ? getHighlighted(line, searchQuery) : line)}
                                </p>
                              ))}
                              {!tSearch && tLines.length > 20 && (
                                <p className="text-xs text-slate-600 text-center pt-2">
                                  ... و {tLines.length - 20} سطر آخر — افتح المحاضرة لرؤية الكل
                                </p>
                              )}
                              {tSearch && matchedLines.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4">لا توجد نتائج</p>
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
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-16 text-center backdrop-blur-xl">
            {searchQuery ? (
              <>
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-400 mb-3">لا توجد نتائج</h3>
                <p className="text-slate-500 mb-6">لم نجد أي تطابق لـ "{searchQuery}"</p>
                <button onClick={() => setSearchQuery("")} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-sm">
                  مسح البحث
                </button>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-400 mb-3">السجل فارغ</h3>
                <p className="text-slate-500 mb-6">
                  {activeTab === "notebooks" 
                    ? "لم تقم بتوليد أي ملازم دراسية فاخرة بعد" 
                    : "ابدأ بتلخيص محاضرتك الأولى وسيظهر سجل المحاضرات المفرغة هنا"
                  }
                </p>
                <button onClick={() => router.push("/dashboard")} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all">
                  {activeTab === "notebooks" ? "توليد ملزمة فاخرة الآن" : "ابدأ التلخيص"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

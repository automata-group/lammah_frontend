"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  MapPin, 
  Smartphone, 
  Monitor, 
  AlertTriangle, 
  Eye, 
  RefreshCw, 
  Flame, 
  Clock, 
  Compass, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Trash2,
  Globe2,
  Navigation,
  ArrowDown,
  Search,
  X,
  Zap,
  MousePointer,
  AlertOctagon,
  FileText,
  ChevronDown,
  ShieldAlert,
  ChevronLeft,
  MousePointerClick
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserBehaviorAnalyticsProps {
  sessionToken?: string;
}

export default function UserBehaviorAnalytics({ sessionToken }: UserBehaviorAnalyticsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Search & Journey Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyData, setJourneyData] = useState<any>(null);
  const [journeyError, setJourneyError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchOverview = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch(`${API}/api/v1/analytics/admin/overview`, {
        headers: {
          "Authorization": `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview(true);
  }, [sessionToken]);

  // Live Auto-refresh timer every 15 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOverview(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, sessionToken]);

  // Fetch full student journey when selected
  useEffect(() => {
    if (!selectedSessionId) {
      setJourneyData(null);
      setJourneyError("");
      return;
    }
    const fetchJourney = async () => {
      setJourneyLoading(true);
      setJourneyError("");
      try {
        const res = await fetch(`${API}/api/v1/analytics/admin/session/${selectedSessionId}`, {
          headers: { "Authorization": `Bearer ${sessionToken}` }
        });
        if (!res.ok) throw new Error("تعذر جلب تفاصيل الجلسة وخط السير");
        const json = await res.json();
        setJourneyData(json);
      } catch (err: any) {
        setJourneyError(err.message || "حدث خطأ أثناء تحميل خط السير");
      } finally {
        setJourneyLoading(false);
      }
    };
    fetchJourney();
  }, [selectedSessionId, sessionToken]);

  const handleClearData = async () => {
    if (!confirm("هل أنت متأكد من تفريغ كافة سجلات التتبع والجلسات القديمة؟")) return;
    setClearing(true);
    try {
      const res = await fetch(`${API}/api/v1/analytics/admin/clear`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        alert("✅ تم تفريغ سجلات التتبع بنجاح.");
        fetchOverview(true);
      }
    } catch (e: any) {
      alert("حدث خطأ أثناء التفريغ.");
    } finally {
      setClearing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs font-bold text-slate-500">جاري مسح وتحليل رادار الزوار...</span>
      </div>
    );
  }

  const liveCount = data?.live_visitors || 0;
  const todayCount = data?.today_sessions || 0;
  const dropOffs = data?.drop_off_count || 0;
  const rageClicksCount = (data?.rage_clicks || []).reduce((acc: number, curr: any) => acc + (curr.count || 0), 0);

  // Filter sessions by search query
  const filteredSessions = (data?.recent_sessions || []).filter((s: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.user_email && s.user_email.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.country && s.country.toLowerCase().includes(q)) ||
      (s.current_path && s.current_path.toLowerCase().includes(q)) ||
      (s.device_type && s.device_type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 select-none text-right" dir="rtl">
      
      {/* ── 1. Top Header & Control Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              رادار الزوار والنشاط المباشر 📡
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            متابعة فورية للطلاب المتصلين، الزيارات اليومية، والتوزيع الجغرافي ونوع الأجهزة بكل وضوح وبدون تعقيد.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOverview(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            title="تحديث البيانات الآن"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleClearData}
            disabled={clearing}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 text-xs font-bold transition cursor-pointer"
            title="تفريغ السجلات"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. Clean Executive Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Live Visitors */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الطلاب المتصلون الآن</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{liveCount}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">طالب متصل</span>
          </div>
        </div>

        {/* Metric 2: Today Sessions */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">زيارات اليوم</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{todayCount}</span>
            <span className="text-[11px] text-slate-400 font-bold">جلسة اليوم</span>
          </div>
        </div>

        {/* Metric 3: Top City */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المدينة الأكثر نشاطاً</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block truncate">
              {data?.cities?.[0]?.city || "فلسطين"}
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold font-mono">
              {data?.cities?.[0]?.count ? `${data.cities[0].count} زيارات` : "جاري الرصد"}
            </span>
          </div>
        </div>

        {/* Metric 4: Dominant Device */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الجهاز الأبرز</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block truncate">
              {data?.devices?.[0]?.device || "كمبيوتر مكتبي"}
            </span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold font-mono">
              {data?.devices?.[0]?.count ? `${data.devices[0].count} زيارات` : "جاري الرصد"}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Geo Distribution & Devices Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Palestinian & Arab Cities */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">المدن والبلدات الأكثر نشاطاً</h3>
                <span className="text-[11px] text-slate-400 block">توزيع طلاب فلسطين والدول العربية</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {(data?.cities || []).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold">
                جاري رصد الزيارات الواردة...
              </div>
            ) : (
              data?.cities.map((city: any, idx: number) => {
                const total = data?.total_sessions || 1;
                const percent = Math.min(Math.round((city.count / total) * 100), 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {city.city} ({city.country})
                      </span>
                      <span className="text-slate-500 font-mono">{city.count} زيارة</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Devices Breakdown */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">الأجهزة والمتصفحات المستخدمة</h3>
                <span className="text-[11px] text-slate-400 block">الهواتف، الأجهزة اللوحية والكمبيوتر</span>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">تحليل الأجهزة 💻</span>
          </div>

          <div className="space-y-3 pt-2">
            {(data?.devices || []).map((dev: any, idx: number) => {
              const total = data?.total_sessions || 1;
              const percent = Math.min(Math.round((dev.count / total) * 100), 100);
              return (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="text-base">{dev.device.includes("هاتف") ? "📱" : dev.device.includes("آيباد") ? "📟" : "💻"}</div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{dev.device}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{percent}% من إجمالي الطلاب</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">{dev.count}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── 5. Live Student Journey Stream (مسار الطلاب لحظة بلحظة) ── */}
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
        
        {/* Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">بث الجلسات وخطوط سير الطلاب 🧭</h3>
              <span className="text-[11px] text-slate-400 block">انقر على أي طالب لعرض مساره الكامل، أخطائه، والتحليل الذكي لرحلته</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالبريد، المدينة، أو الصفحة..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-8 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3 pt-1">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              {searchQuery ? "لا توجد نتائج مطابقة لبحثك." : "لا توجد جلسات مسجلة بعد؛ سيظهر الطلاب هنا فور دخولهم وتصفحهم للمنصة."}
            </div>
          ) : (
            filteredSessions.map((session: any, idx: number) => {
              return (
                <div 
                  key={session.session_id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-3 transition hover:border-indigo-300 dark:hover:border-indigo-800"
                >
                  {/* Top Bar of Session */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5 text-xs font-bold">
                      <span className="text-base">{session.country}</span>
                      <span className="text-slate-900 dark:text-white font-black">{session.city}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{session.device_type}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 font-medium text-[11px]">{session.os_browser}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {session.is_drop_off ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-black text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          نقطة تردد وانسحاب ⚠️
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-black text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          تصفح مكتمل
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium font-mono">
                        {session.updated_at}
                      </span>
                    </div>
                  </div>

                  {/* Journey Metrics & Recent Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>المدة: <strong className="text-slate-800 dark:text-slate-200">{session.duration_seconds} ثانية</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDown className="w-3.5 h-3.5 text-indigo-500" />
                        <span>التمرير: <strong className="text-indigo-600 dark:text-indigo-400">{session.scroll_depth}%</strong></span>
                      </div>
                      <div>
                        <span>آخر مسار: <code className="bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-slate-800 dark:text-slate-200">{session.current_path}</code></span>
                      </div>
                    </div>

                    {/* Student Identity */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                        👤 {session.user_email || "طالب زائر"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Chips Preview */}
                  {(session.recent_actions || []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-black text-slate-400 ml-1">آخر الحركات:</span>
                      {session.recent_actions.map((act: any, aIdx: number) => (
                        <span 
                          key={aIdx}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            act.type === "error"
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300"
                              : act.type === "drop_off"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300"
                              : act.type === "rage_click"
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {act.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Primary Action Button: Open Full Journey & AI Analysis */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionId(session.session_id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>فحص خط السير والتحليل الذكي للرحلة 🔍</span>
                    </button>

                    <span className="text-[10px] text-slate-400 font-mono">
                      معرف الجلسة: ...{session.session_id.slice(-8)}
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 6. Interactive Student Full Journey & AI Intelligence Modal ── */}
      <AnimatePresence>
        {selectedSessionId && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/40">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                      تقرير خط السير والتحليل السلوكي للرحلة 🧭
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      تتبع دقيق لكل خطوة، نقرة، خطأ، وتحليل ذكي لمستوى التفاعل والرضا
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSessionId(null)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
                {journeyLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-500">جاري تجميع خط سير الطالب والتحليل الذكي...</span>
                  </div>
                ) : journeyError ? (
                  <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold text-center">
                    {journeyError}
                  </div>
                ) : journeyData ? (
                  <>
                    {/* Student Identity Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">الطالب</span>
                        <strong className="text-slate-900 dark:text-white">{journeyData.session?.user_email || "طالب زائر"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">الموقع</span>
                        <strong className="text-slate-900 dark:text-white">{journeyData.session?.city} ({journeyData.session?.country})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">الجهاز والمتصفح</span>
                        <strong className="text-slate-900 dark:text-white">{journeyData.session?.device_type} • {journeyData.session?.os_browser}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold">مدة الجلسة وعمق القراءة</span>
                        <strong className="text-slate-900 dark:text-white">{journeyData.session?.duration_seconds} ثانية • {journeyData.session?.max_scroll_depth}%</strong>
                      </div>
                    </div>

                    {/* AI Behavioral Intelligence Box */}
                    {journeyData.analysis && (
                      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-slate-900/80 dark:via-slate-900/40 dark:to-[#0b0f19] border border-indigo-200/70 dark:border-slate-800 space-y-4">
                        
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h4 className="font-black text-sm text-slate-900 dark:text-white">
                              التحليل الذكي للرحلة (AI Behavioral Diagnosis)
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                              journeyData.analysis.status_color === "rose"
                                ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300"
                                : journeyData.analysis.status_color === "amber"
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                            }`}>
                              {journeyData.analysis.overall_status}
                            </span>
                          </div>
                        </div>

                        {/* Narrative Story */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                          <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 block mb-1">
                            سرد قصة رحلة الطالب بالتفصيل:
                          </span>
                          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {journeyData.analysis.narrative_summary}
                          </p>
                        </div>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-slate-500 font-bold">درجة الاندماج والتفاعل:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${journeyData.analysis.engagement_score}%` }} />
                              </div>
                              <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{journeyData.analysis.engagement_score}%</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-slate-500 font-bold">مستوى الرضا المتوقع:</span>
                            <strong className="text-slate-800 dark:text-slate-200">{journeyData.analysis.sentiment}</strong>
                          </div>
                        </div>

                        {/* Detected Bottlenecks & Errors */}
                        {journeyData.analysis.detected_issues?.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="text-xs font-black text-rose-600 dark:text-rose-400 block">
                              العقبات والأخطاء المكتشفة التي واجهت الطالب ({journeyData.analysis.detected_issues.length}):
                            </span>
                            <div className="space-y-2">
                              {journeyData.analysis.detected_issues.map((iss: any, iIdx: number) => (
                                <div key={iIdx} className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs flex items-start gap-2.5">
                                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <strong className="text-rose-800 dark:text-rose-300">{iss.title}</strong>
                                      <code className="text-[10px] text-slate-500 font-mono">{iss.page}</code>
                                    </div>
                                    <p className="text-rose-700 dark:text-rose-400 mt-0.5 font-medium leading-relaxed">
                                      {iss.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Admin Actionable Recommendation */}
                        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs flex items-start gap-2.5">
                          <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-indigo-900 dark:text-indigo-300 block mb-0.5">توصية مقترحة لمالك المنصة:</strong>
                            <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed font-medium">
                              {journeyData.analysis.admin_recommendation}
                            </p>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Full Chronological Action Timeline */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          خط السير الزمني خطوة بخطوة ({journeyData.timeline?.length || 0} خطوة مسجلة)
                        </h4>
                        <span className="text-[11px] text-slate-400">مرتبة من أول لحظة دخول حتى الخروج</span>
                      </div>

                      <div className="space-y-3 relative before:absolute before:top-3 before:bottom-3 before:right-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pr-2">
                        {(journeyData.timeline || []).length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs font-bold">
                            لا توجد أحداث تفصيلية مسجلة لهذه الجلسة.
                          </div>
                        ) : (
                          journeyData.timeline.map((event: any, eIdx: number) => {
                            const isError = event.event_type === "error";
                            const isRage = event.event_type === "rage_click";
                            const isDropOff = event.event_type === "drop_off";
                            const isClick = event.event_type === "click";
                            const isPage = event.event_type === "pageview";

                            return (
                              <div key={event.id || eIdx} className="relative flex items-start gap-3.5 group">
                                {/* Timeline Node Icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 shadow-xs transition-transform group-hover:scale-110 ${
                                  isError
                                    ? "bg-rose-500 text-white border-rose-200"
                                    : isRage
                                    ? "bg-amber-500 text-white border-amber-200"
                                    : isDropOff
                                    ? "bg-rose-600 text-white border-rose-300"
                                    : isClick
                                    ? "bg-sky-500 text-white border-sky-200"
                                    : isPage
                                    ? "bg-indigo-600 text-white border-indigo-200"
                                    : "bg-slate-700 text-white border-slate-300"
                                }`}>
                                  {isError ? (
                                    <AlertOctagon className="w-4 h-4" />
                                  ) : isRage ? (
                                    <Flame className="w-4 h-4" />
                                  ) : isClick ? (
                                    <MousePointerClick className="w-4 h-4" />
                                  ) : isPage ? (
                                    <FileText className="w-4 h-4" />
                                  ) : (
                                    <Compass className="w-4 h-4" />
                                  )}
                                </div>

                                {/* Step Content Card */}
                                <div className={`flex-1 p-3.5 sm:p-4 rounded-2xl border transition-all text-xs ${
                                  isError
                                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900"
                                    : isRage
                                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900"
                                    : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800"
                                }`}>
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                    <strong className={`text-xs ${
                                      isError ? "text-rose-700 dark:text-rose-300 font-black" : "text-slate-900 dark:text-white font-bold"
                                    }`}>
                                      {event.arabic_title}
                                    </strong>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {event.created_at}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                                    <span>المسار: <code className="bg-slate-200/60 dark:bg-slate-800 px-1 py-0.2 rounded font-mono text-slate-700 dark:text-slate-300">{event.page_path}</code></span>
                                  </div>

                                  {/* Error or Click Details */}
                                  {event.details && Object.keys(event.details).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300">
                                      {event.details.message && (
                                        <div className="text-rose-600 dark:text-rose-400 font-mono bg-rose-100/50 dark:bg-rose-950/50 p-2 rounded-lg">
                                          <strong>الرسالة:</strong> {event.details.message}
                                        </div>
                                      )}
                                      {event.details.element && (
                                        <div>
                                          <strong>العنصر:</strong> {event.details.element}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => setSelectedSessionId(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs transition cursor-pointer"
                >
                  إغلاق التقرير
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

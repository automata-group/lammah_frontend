"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Loader2, 
  Check, 
  AlertCircle, 
  X, 
  MessageCircle, 
  Users, 
  Zap, 
  BarChart3, 
  LayoutDashboard, 
  Megaphone, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  CheckCheck, 
  XCircle,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  Store,
  Compass
} from "lucide-react";
import Link from "next/link";
import UserManagement from "@/components/admin/UserManagement";
import FinancialAnalytics from "@/components/admin/FinancialAnalytics";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import UserBehaviorAnalytics from "@/components/admin/UserBehaviorAnalytics";
import AdminKioskTab from "@/components/admin/AdminKioskTab";
import AssignSubscriptionModal from "@/components/admin/AssignSubscriptionModal";

// Helper: Arabic relative time
function getArabicRelativeTime(dateStr: string): { label: string; isOld: boolean } {
  if (!dateStr) return { label: "غير محدد", isOld: false };
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const isOld = diffHours >= 24;

  let label = "";
  if (diffMins < 1) label = "الآن";
  else if (diffMins < 60) label = `منذ ${diffMins} دقيقة`;
  else if (diffHours < 24) label = `منذ ${diffHours} ساعة`;
  else if (diffDays === 1) label = "منذ يوم";
  else label = `منذ ${diffDays} أيام`;

  return { label, isOld };
}

function getApiBase() {
  if (typeof window !== "undefined") {
    if (window.location.port === "8888" || window.location.port === "9090") {
      return window.location.origin;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://api.lammah.site";
}

const API = getApiBase();

export default function AdminPage() {
  const { user, session, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");

  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (session) fetchOverview();
  }, [user, loading, session]);
  
  const fetchOverview = async () => {
    try {
      setFetching(true);
      setError("");
      const res = await fetch(`${API}/api/v1/transactions/admin/pending`, {
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("🚫 هذا الحساب لا يملك صلاحيات الأدمن.");
        }
        if (res.status === 401) {
          throw new Error("🔒 انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول.");
        }
        let errMsg = `خطأ من الخادم (${res.status})`;
        try {
          const errData = await res.json();
          errMsg = errData.detail?.user_message || (typeof errData.detail === "string" ? errData.detail : errMsg);
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);

      try {
        const usageRes = await fetch(`${API}/api/v1/admin/stats`, {
           headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsageStats(usageData);
        }
      } catch (err) {
        console.warn("Could not load usage stats:", err);
      }

    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async (txId: string) => {
    setProcessing(txId);
    try {
      const res = await fetch(`${API}/api/v1/transactions/admin/approve/${txId}`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل تأكيد العملية");
      setTransactions(transactions.filter(t => t.id !== txId));
      fetchOverview();
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (txId: string) => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
    setProcessing(txId);
    try {
      const res = await fetch(`${API}/api/v1/transactions/admin/reject/${txId}`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل رفض العملية");
      setTransactions(transactions.filter(t => t.id !== txId));
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  };

  // ── Bulk transaction actions ──────────────────────────────
  const toggleTxSelection = (id: string) => {
    setSelectedTxIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleAllTx = () => {
    if (selectedTxIds.size === transactions.length) {
      setSelectedTxIds(new Set());
    } else {
      setSelectedTxIds(new Set(transactions.map(t => t.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTxIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من تأكيد ${selectedTxIds.size} طلب وتفعيل الاشتراكات؟`)) return;
    setBulkProcessing(true);
    try {
      const res = await fetch(`${API}/api/v1/transactions/admin/bulk-approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_ids: Array.from(selectedTxIds) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل التأكيد الجماعي");
      const approved: string[] = data.results?.approved || [];
      setTransactions(prev => prev.filter(t => !approved.includes(t.id)));
      setSelectedTxIds(new Set());
      fetchOverview();
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedTxIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من رفض ${selectedTxIds.size} طلب؟`)) return;
    setBulkProcessing(true);
    try {
      const res = await fetch(`${API}/api/v1/transactions/admin/bulk-reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_ids: Array.from(selectedTxIds) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل الرفض الجماعي");
      const rejectedIds = Array.from(selectedTxIds);
      setTransactions(prev => prev.filter(t => !rejectedIds.includes(t.id)));
      setSelectedTxIds(new Set());
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const isAdminEmail = user?.email?.toLowerCase().trim() === "lamaszero@gmail.com";

  if (error && !isAdminEmail) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-8 flex flex-col items-center justify-center text-center font-sans" dir="rtl">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-500/20">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">تسجيل دخول غير مصرح</h1>
        
        <div className="my-4 p-4 rounded-xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 max-w-sm w-full text-right text-xs space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">الحساب الحالي:</span>
            <span className="font-mono text-[11px] dir-ltr text-slate-800 dark:text-slate-200">{user?.email || "غير مسجل"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">الأدمن المعتمد:</span>
            <span className="font-mono text-[11px] dir-ltr text-indigo-600 dark:text-indigo-400">lamaszero@gmail.com</span>
          </div>
        </div>

        <p className="text-slate-500 text-xs max-w-sm mb-6">{error}</p>
        
        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={async () => {
              if (signOut) await signOut();
              router.push("/login?redirect=/admin");
            }} 
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer transition-colors"
          >
            تسجيل الدخول كأدمن
          </button>
          <button 
            onClick={() => router.push("/")} 
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
          >
            الرئيسية
          </button>
        </div>
      </div>
    );
  }

  const allTxSelected = transactions.length > 0 && selectedTxIds.size === transactions.length;
  const someTxSelected = selectedTxIds.size > 0;
  const activeSubsCount = usageStats?.active_subscriptions?.length || (usageStats?.total_users ? (usageStats.total_users - (usageStats.free_users_count || 0)) : 0);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans transition-colors" dir="rtl">
      
      {/* Top Header Bar (Executive Clean) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-8 py-3 flex justify-between items-center">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-sm">
              L
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight block leading-tight">
                لوحة تحكم لمّاح
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                الإدارة والعمليات المركزية
              </span>
            </div>
          </Link>

          {/* Admin Tag */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-mono dir-ltr">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{user?.email || "Admin"}</span>
          </div>
        </div>

        {/* Actions & Controls */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="تفعيل باقة ودقائق لحساب بالبريد الإلكتروني"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>شحن بالبريد</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Student Dashboard Link */}
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
          >
            <span>لوحة الطالب</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {error && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => { setError(""); setFetching(true); fetchOverview(); }}
              className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 text-amber-900 dark:text-white text-[11px] cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
        
          {/* Sidebar Navigation (Monochrome Minimalist) */}
          <aside className="w-full md:w-60 shrink-0">
            <nav className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 shadow-2xs space-y-1">
              
              <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overview" 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>نظرة عامة والطلبات</span>
                </div>
                {transactions.length > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    activeTab === "overview" 
                      ? "bg-rose-500 text-white" 
                      : "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                  }`}>
                    {transactions.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "users" 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>إدارة المستخدمين</span>
              </button>

              <button 
                onClick={() => setActiveTab("financial")}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "financial" 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>التحليلات المالية</span>
              </button>

              <button 
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "analytics" 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4" />
                  <span>رادار الزوار والنشاط</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              <button 
                onClick={() => setActiveTab("announcements")}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "announcements" 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>الإشعارات العامة</span>
              </button>

              <button 
                onClick={() => setActiveTab("kiosk")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "kiosk" 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4" />
                  <span>كشك المشاريع</span>
                </div>
              </button>

            </nav>
          </aside>

          {/* Content Panel */}
          <div className="flex-1 min-w-0">
            
            {activeTab === "overview" && (
              <div className="space-y-5">

                {/* 3 Quiet Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">طلبات بانتظار التأكيد</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black font-mono ${transactions.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
                        {transactions.length}
                      </span>
                      <span className="text-[10px] text-slate-400">تحويلة معلقة</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">المشتركون النشطون</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {activeSubsCount}
                      </span>
                      <span className="text-[10px] text-slate-400">طالب مفعل</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">المحاضرات المعالجة</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {usageStats?.total_lecture_usage || 0}
                      </span>
                      <span className="text-[10px] text-slate-400">ملف ملخص</span>
                    </div>
                  </div>
                </div>

                {/* ── Pending Transactions Table (Action-First Inbox) ── */}
                <div className="bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
                  
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          طلبات المدفوعات والاشتراكات المعلقة
                        </h2>
                        {transactions.length > 0 && (
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            {transactions.length} طلب
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        اعتماد أو رفض طلبات تحويل الاشتراكات بضغطة واحدة.
                      </p>
                    </div>

                    {/* Bulk Selection Controls */}
                    {transactions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleAllTx}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {allTxSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{allTxSelected ? "إلغاء تحديد الكل" : "تحديد الكل"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bulk Actions Floating Bar */}
                  {someTxSelected && (
                    <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-2xs">
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-xs flex-1">
                        تم تحديد {selectedTxIds.size} طلب
                      </span>
                      <button
                        onClick={handleBulkApprove}
                        disabled={bulkProcessing}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        {bulkProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                        تأكيد المحدد ({selectedTxIds.size})
                      </button>
                      <button
                        onClick={handleBulkReject}
                        disabled={bulkProcessing}
                        className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        {bulkProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        رفض المحدد ({selectedTxIds.size})
                      </button>
                      <button
                        onClick={() => setSelectedTxIds(new Set())}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Transactions List */}
                  {transactions.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-10 text-center text-slate-400 text-xs font-medium border border-slate-200/60 dark:border-slate-800">
                      لا توجد طلبات معلقة حالياً. جميع التحويلات معتمدة بنجاح!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map(tx => {
                        const { label: timeLabel } = getArabicRelativeTime(tx.created_at);
                        const isSelected = selectedTxIds.has(tx.id);
                        const studentName = tx.profiles?.full_name || "طالب غير معروف";
                        const phone = tx.profiles?.phone_number;

                        return (
                          <div
                            key={tx.id}
                            onClick={() => toggleTxSelection(tx.id)}
                            className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              isSelected 
                                ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-500/40" 
                                : "bg-white dark:bg-[#0b0f19] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            {/* Right: Checkbox, Name, Order, Phone */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="shrink-0 text-slate-400">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                    {studentName}
                                  </span>
                                  {phone ? (
                                    <a
                                      href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً ${studentName}، بخصوص طلبك للاشتراك في باقة (${tx.subscription_plans?.name || 'لمّاح'}) رقم #${tx.short_order_id}...`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono transition"
                                      title="مراسلة واتساب"
                                    >
                                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                                      <span dir="ltr">{phone}</span>
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">بدون هاتف</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                  <span className="font-mono text-slate-600 dark:text-slate-400">
                                    #{tx.short_order_id}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3" />
                                    {timeLabel}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Plan & Amount */}
                            <div className="flex items-center gap-3 pr-7 md:pr-0">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded text-xs font-bold">
                                {tx.subscription_plans?.name || "باقة دراسية"}
                              </span>

                              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                {tx.amount} ₪
                              </span>
                            </div>

                            {/* Left: Approve / Reject Buttons */}
                            <div className="flex items-center gap-1.5 pr-7 md:pr-0 shrink-0" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleApprove(tx.id)}
                                disabled={processing === tx.id || bulkProcessing}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>تأكيد</span>
                              </button>

                              <button
                                onClick={() => handleReject(tx.id)}
                                disabled={processing === tx.id || bulkProcessing}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                title="رفض الطلب"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

              </div>
            )}

            {activeTab === "users" && <UserManagement session={session} />}
            {activeTab === "financial" && <FinancialAnalytics session={session} />}
            {activeTab === "analytics" && <UserBehaviorAnalytics sessionToken={session?.access_token} />}
            {activeTab === "announcements" && <AnnouncementsManager session={session} />}
            {activeTab === "kiosk" && <AdminKioskTab token={session?.access_token || ""} />}

          </div>

        </div>

      </div>

      {/* Assign Subscription & Minutes Modal */}
      <AssignSubscriptionModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        sessionToken={session?.access_token}
        onSuccess={fetchOverview}
        apiUrl={API}
      />

    </main>
  );
}

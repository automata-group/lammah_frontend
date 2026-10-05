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
  Activity, 
  Package, 
  LayoutDashboard, 
  Megaphone, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  Trash2, 
  CheckCheck, 
  XCircle,
  GraduationCap,
  Sun,
  Moon,
  Crown,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronLeft,
  Sparkles,
  Copy,
  CheckCircle2,
  Phone,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UserManagement from "@/components/admin/UserManagement";
import FinancialAnalytics from "@/components/admin/FinancialAnalytics";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import TutoringManager from "@/components/admin/TutoringManager";
import UserBehaviorAnalytics from "@/components/admin/UserBehaviorAnalytics";

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

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";

export default function AdminPage() {
  const { user, session, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");

  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [pendingTutorsCount, setPendingTutorsCount] = useState<number>(0);

  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [copiedFingerprint, setCopiedFingerprint] = useState<string | null>(null);

  const handleCopyFingerprint = (fp: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fp);
    setCopiedFingerprint(fp);
    setTimeout(() => setCopiedFingerprint(null), 2000);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (session) fetchOverview();
  }, [user, loading, session]);
  
  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API}/api/v1/transactions/admin/pending`, {
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل الجلب - ربما لست أدمن");
      setTransactions(data);

      try {
        const usageRes = await fetch(`${API}/api/v1/admin/stats`, {
           headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        const usageData = await usageRes.json();
        if (usageRes.ok) {
          setUsageStats(usageData);
          setStats({ system_health: usageData.system_health, errors: usageData.errors });
        }
      } catch (err) {
        console.error("Failed to fetch usage stats:", err);
      }

      // Fetch tutor applications count
      try {
        const tutorsRes = await fetch(`${API}/api/v1/tutoring/admin/applications`, {
          headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        if (tutorsRes.ok) {
          const tutorsData = await tutorsRes.json();
          const pending = (tutorsData.applications || []).filter((a: any) => a.status === "pending").length;
          setPendingTutorsCount(pending);
        }
      } catch (err) {
        console.error("Failed to fetch tutor applications count:", err);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };
  
  // ── Individual actions ────────────────────────────────────
  const handleApprove = async (txId: string) => {
    if (!confirm("هل أنت متأكد من تأكيد هذا الدفع وتفعيل الاشتراك؟")) return;
    setProcessing(txId);
    try {
      const res = await fetch(`${API}/api/v1/transactions/admin/${txId}/approve`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل التأكيد");
      setTransactions(prev => prev.filter(t => t.id !== txId));
      setSelectedTxIds(prev => { const s = new Set(prev); s.delete(txId); return s; });
      alert("تمت الموافقة بنجاح وتفعيل الباقة!");
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (txId: string) => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setProcessing(txId);
    try {
      const res = await fetch(`${API}/api/v1/transactions/admin/${txId}/reject`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل الرفض");
      setTransactions(prev => prev.filter(t => t.id !== txId));
      setSelectedTxIds(prev => { const s = new Set(prev); s.delete(txId); return s; });
      alert("تم رفض الطلب وإزالته بنجاح.");
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelPlan = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء خطة المستخدم (${userName})؟ سيتم تصفير حصته وإعادته للتجربة المجانية.`)) return;
    setProcessing(userId);
    try {
      const res = await fetch(`${API}/api/v1/admin/users/${userId}/cancel-plan`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "فشل إلغاء الخطة");
      alert(data.message || "تم إلغاء الخطة بنجاح!");
      fetchOverview();
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
      const failed: any[] = data.results?.failed || [];
      setTransactions(prev => prev.filter(t => !approved.includes(t.id)));
      setSelectedTxIds(new Set());
      let msg = `✅ تم تأكيد ${approved.length} طلب بنجاح.`;
      if (failed.length > 0) msg += `\n⚠️ فشل ${failed.length} طلب.`;
      alert(msg);
      fetchOverview();
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedTxIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من رفض ${selectedTxIds.size} طلب؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
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
      alert(`✅ تم رفض ${rejectedIds.length} طلب بنجاح.`);
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };

  // ── Bulk plan cancellation ────────────────────────────────
  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleAllUsers = () => {
    const allIds = (usageStats?.active_subscriptions || []).map((s: any) => s.user_id);
    if (selectedUserIds.size === allIds.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(allIds));
    }
  };

  const handleBulkCancelPlans = async () => {
    if (selectedUserIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من إلغاء خطط ${selectedUserIds.size} مستخدم؟ سيتم تصفير حصصهم وإعادتهم للتجربة المجانية.`)) return;
    setBulkProcessing(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/users/bulk-cancel-plan`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: Array.from(selectedUserIds) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "فشل الإلغاء الجماعي");
      setSelectedUserIds(new Set());
      alert(data.message || `✅ تم إلغاء خطط ${selectedUserIds.size} مستخدم بنجاح.`);
      fetchOverview();
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setBulkProcessing(false);
    }
  };


  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] p-8 flex flex-col items-center justify-center text-center font-sans" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">تسجيل دخول غير مصرح</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">{error}</p>
        <button 
          onClick={() => router.push("/")} 
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const allTxSelected = transactions.length > 0 && selectedTxIds.size === transactions.length;
  const someTxSelected = selectedTxIds.size > 0;

  const activeSubs = usageStats?.active_subscriptions || [];
  const allUsersSelected = activeSubs.length > 0 && selectedUserIds.size === activeSubs.length;
  const someUsersSelected = selectedUserIds.size > 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans transition-colors" dir="rtl">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex justify-between items-center">
        
        {/* Brand & Admin Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
              L
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-slate-900 dark:text-white text-base tracking-tight block leading-tight">
                لوحة تحكم لمّاح
              </span>
              <span className="text-[10px] text-slate-400 font-bold block">
                Executive Control Hub
              </span>
            </div>
          </Link>

          <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-500" />
            مسؤول المنصة
          </span>
        </div>

        {/* Status, Theme Switcher & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Live Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>السيرفر متصل</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title={theme === "dark" ? "التحويل للوضع النهاري (Light)" : "التحويل للوضع الليلي (Dark)"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Back to Site */}
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1.5"
          >
            <span>لوحة الطالب</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          
          <nav className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-3 shadow-xs space-y-1">
            
            <button 
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === "overview" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>نظرة عامة والطلبات</span>
              </div>
              {transactions.length > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  activeTab === "overview" ? "bg-white text-indigo-700" : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                }`}>
                  {transactions.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === "users" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>إدارة المستخدمين والأدمن</span>
            </button>

            <button 
              onClick={() => setActiveTab("financial")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === "financial" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>التحليلات المالية</span>
            </button>

            <button 
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === "analytics" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4" />
                <span>رادار الزوار والتحليل الذكي</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </button>

            <div 
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 cursor-not-allowed select-none opacity-80"
              title="إدارة المعلمين والطلبات قادمة قريباً وغير متاحة حالياً"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>إدارة المعلمين والطلبات</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-white/10 px-2 py-0.5 rounded-full border border-slate-300/40 dark:border-white/5">
                قريباً
              </span>
            </div>

            <button 
              onClick={() => setActiveTab("announcements")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === "announcements" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>الإشعارات العامة</span>
            </button>

          </nav>

          {/* Quick Support Card */}
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white">أمان العمليات والنظام</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              كل التعديلات وترقيات الأدمن يتم توثيقها في سجلات الحماية المركزية.
            </p>
          </div>

        </aside>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* ── Pending Tutor Applications Alert Banner ── */}
              {pendingTutorsCount > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 via-white to-amber-50/50 dark:from-amber-950/40 dark:via-[#0b0f19] dark:to-slate-900/50 border border-amber-300/80 dark:border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                          يوجد {pendingTutorsCount} طلب انضمام معلم جديد بانتظار المراجعة!
                        </h3>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          جديد
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        قم بالاطلاع على كشوف العلامات ونماذج الشرح لاعتماد المعلمين وتفعيل صلاحياتهم.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("tutoring")}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
                  >
                    <span>استعراض الطلبات والاعتماد</span>
                  </button>
                </div>
              )}

              {/* ── Pending Transactions Section (Ultra-Clean & Eye-Friendly) ── */}
              <div className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
                
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">طلبات المدفوعات المعلقة 💳</h2>
                      {transactions.length > 0 && (
                        <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-0.5 rounded-full">
                          {transactions.length} طلب
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">مراجعة وتأكيد اشتراكات الطلاب بأسلوب منظم ومريح للعين.</p>
                  </div>

                  {/* Bulk Select All Checkbox */}
                  {transactions.length > 0 && (
                    <button
                      onClick={toggleAllTx}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:border-slate-300 transition flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      {allTxSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                      <span>{allTxSelected ? "إلغاء تحديد الكل" : "تحديد جميع الطلبات"}</span>
                    </button>
                  )}
                </div>

                {/* Bulk Actions Floating Bar */}
                {someTxSelected && (
                  <div className="flex items-center gap-3 bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl px-5 py-3 shadow-xs">
                    <span className="text-indigo-900 dark:text-indigo-200 font-black text-xs flex-1">
                      تم تحديد {selectedTxIds.size} طلب
                    </span>
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkProcessing}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
                    >
                      {bulkProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                      تأكيد المحدد ({selectedTxIds.size})
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={bulkProcessing}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black transition shadow-xs cursor-pointer"
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

                {transactions.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-12 text-center text-slate-400 text-xs font-bold border border-slate-100 dark:border-slate-800/80">
                    لا توجد طلبات مدفوعات معلقة حالياً. جميع الحوالات معتمدة!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {transactions.map(tx => {
                      const { label: timeLabel } = getArabicRelativeTime(tx.created_at);
                      const isSelected = selectedTxIds.has(tx.id);
                      const studentName = tx.profiles?.full_name || "طالب غير معروف";
                      const phone = tx.profiles?.phone_number;

                      return (
                        <div
                          key={tx.id}
                          onClick={() => toggleTxSelection(tx.id)}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            isSelected 
                              ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/50 shadow-xs" 
                              : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {/* Right: Checkbox, Avatar, Student Info */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="shrink-0 text-slate-400">
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                              )}
                            </div>

                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                              {studentName.charAt(0)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                  {studentName}
                                </span>
                                {phone && (
                                  <a
                                    href={`https://wa.me/${phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-emerald-600 hover:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 p-1 rounded-lg transition shrink-0"
                                    title="مراسلة الطالب على واتساب"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <span className="font-mono bg-white dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                                  #{tx.short_order_id}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {timeLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: Plan & Price */}
                          <div className="flex items-center gap-3 pr-8 md:pr-0">
                            <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/20 px-3 py-1 rounded-xl text-xs font-bold">
                              {tx.subscription_plans?.name || "باقة دراسية"}
                            </span>

                            <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                              {tx.amount} ₪
                            </span>
                          </div>

                          {/* Left: Actions */}
                          <div className="flex items-center gap-2 pr-8 md:pr-0 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleApprove(tx.id)}
                              disabled={processing === tx.id || bulkProcessing}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>تأكيد التفعيل</span>
                            </button>

                            <button
                              onClick={() => handleReject(tx.id)}
                              disabled={processing === tx.id || bulkProcessing}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
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

              {/* ── Active Subscriptions Section ──────────────────── */}
              {usageStats && (
                <div className="space-y-5">
                  
                  {/* Summary Metric Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                      <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي المسجلين</span>
                      <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{usageStats.total_users}</span>
                    </div>

                    <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">مستخدمو التجربة المجانية</span>
                      <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{usageStats.free_users_count}</span>
                    </div>

                    <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-5 border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs bg-indigo-50/20 dark:bg-indigo-950/20">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">إجمالي المحاضرات المعالجة</span>
                      <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{usageStats.total_lecture_usage}</span>
                    </div>
                  </div>

                  {/* Active Subscriptions Table */}
                  <div className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
                    
                    {/* Header & Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                              متابعة المشتركين النشطين
                            </h3>
                            {activeSubs.length > 0 && (
                              <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-500/20">
                                {activeSubs.length} مشترك نشط
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            مراقبة استهلاك الدقائق، البصمات الإلكترونية، وإدارة الخطط الفعّالة
                          </p>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="relative min-w-[240px] sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={subSearchTerm}
                          onChange={(e) => setSubSearchTerm(e.target.value)}
                          placeholder="بحث بالاسم، الهاتف، أو الباقة..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-10 pl-8 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                        />
                        {subSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setSubSearchTerm("")}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bulk Actions Bar - Plans */}
                    {someUsersSelected && (
                      <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 rounded-2xl px-5 py-3 shadow-xs">
                        <span className="text-rose-800 dark:text-rose-300 font-black text-xs flex-1">
                          تم تحديد {selectedUserIds.size} مشترك
                        </span>
                        <button
                          onClick={handleBulkCancelPlans}
                          disabled={bulkProcessing}
                          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-black transition shadow-md cursor-pointer"
                        >
                          {bulkProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          إلغاء الخطط المحددة ({selectedUserIds.size})
                        </button>
                        <button
                          onClick={() => setSelectedUserIds(new Set())}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Table Container */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0b0f19]">
                      <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                            <th className="py-3 px-3 w-10 text-center">
                              {activeSubs.length > 0 && (
                                <button onClick={toggleAllUsers} className="text-slate-400 hover:text-indigo-600 cursor-pointer">
                                  {allUsersSelected
                                    ? <CheckSquare className="w-4 h-4 text-indigo-600" />
                                    : someUsersSelected
                                      ? <CheckSquare className="w-4 h-4 text-indigo-400 opacity-60" />
                                      : <Square className="w-4 h-4" />}
                                </button>
                              )}
                            </th>
                            <th className="py-3 px-3 font-bold">المشترك</th>
                            <th className="py-3 px-3 font-bold">الباقة</th>
                            <th className="py-3 px-3 font-bold min-w-[200px]">الرصيد والاستهلاك</th>
                            <th className="py-3 px-3 font-bold text-center">بصمة الجهاز</th>
                            <th className="py-3 px-3 font-bold text-center w-24">إدارة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {activeSubs
                            .filter((sub: any) => {
                              if (!subSearchTerm.trim()) return true;
                              const term = subSearchTerm.toLowerCase();
                              return (
                                sub.user_name?.toLowerCase().includes(term) ||
                                sub.phone?.toLowerCase().includes(term) ||
                                sub.plan?.toLowerCase().includes(term) ||
                                sub.fingerprint?.toLowerCase().includes(term)
                              );
                            })
                            .map((sub: any, idx: number) => {
                              const isSelected = selectedUserIds.has(sub.user_id);
                              const totalQuota = sub.quota || 1;
                              const usedQuota = sub.used || 0;
                              const remaining = sub.remaining ?? (totalQuota - usedQuota);
                              const usagePercent = Math.min(100, Math.round((usedQuota / totalQuota) * 100));

                              // Format plan label nicely without multi-line wrapping
                              let planLabel = sub.plan || "باقة نشطة";
                              if (planLabel.includes("الذهبية")) planLabel = "باقة الفصل (الذهبية)";
                              else if (planLabel.includes("الإنقاذ")) planLabel = "باقة الإنقاذ";

                              // Clean phone for whatsapp
                              const rawPhone = (sub.phone || "").replace(/[^0-9]/g, "");
                              let whatsappUrl = "";
                              if (rawPhone.startsWith("05")) {
                                whatsappUrl = `https://wa.me/972${rawPhone.slice(1)}`;
                              } else if (rawPhone.startsWith("972") || rawPhone.startsWith("970")) {
                                whatsappUrl = `https://wa.me/${rawPhone}`;
                              }

                              return (
                                <tr
                                  key={idx}
                                  onClick={() => toggleUserSelection(sub.user_id)}
                                  className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer ${
                                    isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <td className="py-3 px-3 text-center">
                                    {isSelected
                                      ? <CheckSquare className="w-4 h-4 text-indigo-600" />
                                      : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                                  </td>

                                  {/* Student Name & Phone */}
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                                      {sub.user_name || "مستخدم بدون اسم"}
                                    </div>
                                    {sub.phone ? (
                                      <a
                                        href={whatsappUrl || "#"}
                                        target={whatsappUrl ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-emerald-600 flex items-center gap-1 mt-0.5"
                                      >
                                        <MessageCircle className="w-3 h-3 text-emerald-500" />
                                        <span>{sub.phone}</span>
                                      </a>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">بدون هاتف</span>
                                    )}
                                  </td>

                                  {/* Plan */}
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                      planLabel.includes("الذهبية")
                                        ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                        : planLabel.includes("الإنقاذ")
                                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                          : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        planLabel.includes("الذهبية") ? "bg-amber-500" :
                                        planLabel.includes("الإنقاذ") ? "bg-rose-500" : "bg-indigo-500"
                                      }`} />
                                      <span>{planLabel}</span>
                                    </span>
                                  </td>

                                  {/* Unified Remaining & Consumption */}
                                  <td className="py-3 px-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-xs font-mono">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                          {remaining} <span className="text-[10px] text-slate-400 font-sans">دقيقة متبقية</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                          ({usedQuota} / {totalQuota})
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full transition-all ${
                                            usagePercent > 85 ? "bg-rose-500" :
                                            usagePercent > 50 ? "bg-amber-500" : "bg-indigo-600"
                                          }`}
                                          style={{ width: `${usagePercent}%` }} 
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Device Fingerprint */}
                                  <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                                    {sub.fingerprint ? (
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyFingerprint(sub.fingerprint, e)}
                                        className="text-[11px] font-mono text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-0.5 rounded transition inline-flex items-center gap-1 cursor-pointer"
                                        title="انقر لنسخ البصمة"
                                      >
                                        <span>...{sub.fingerprint.slice(-8)}</span>
                                        {copiedFingerprint === sub.fingerprint ? (
                                          <Check className="w-3 h-3 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3 h-3 text-slate-400" />
                                        )}
                                      </button>
                                    ) : (
                                      <span className="text-slate-300 dark:text-slate-700 font-mono text-[10px]">---</span>
                                    )}
                                  </td>

                                  {/* Management Actions */}
                                  <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                                    <button 
                                      onClick={() => handleCancelPlan(sub.user_id, sub.user_name)} 
                                      disabled={processing === sub.user_id || bulkProcessing} 
                                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                                    >
                                      {processing === sub.user_id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        "إلغاء الخطة"
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {activeTab === "users" && <UserManagement session={session} />}
          {activeTab === "financial" && <FinancialAnalytics session={session} />}
          {activeTab === "analytics" && <UserBehaviorAnalytics sessionToken={session?.access_token} />}
          {activeTab === "tutoring" && <TutoringManager session={session} />}
          {activeTab === "announcements" && <AnnouncementsManager session={session} />}

        </div>

      </div>

    </main>
  );
}

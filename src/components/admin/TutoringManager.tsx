"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Loader2, 
  Video, 
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  Building2,
  BookOpen,
  Phone,
  CreditCard,
  UserCheck,
  UserX,
  Filter,
  Eye,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  session: any;
}

export default function TutoringManager({ session }: Props) {
  const [subTab, setSubTab] = useState<"applications" | "payouts">("applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Rejection Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetchData();
  }, [subTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${session?.access_token}` };
      if (subTab === "applications") {
        const res = await fetch(`${API}/api/v1/tutoring/admin/applications`, { headers });
        const data = await res.json();
        setApplications(data.applications || []);
      } else {
        const res = await fetch(`${API}/api/v1/tutoring/admin/payouts`, { headers });
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (e) {
      console.error(e);
      showToast("فشل في جلب البيانات من السيرفر", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (tutorId: string) => {
    if (!confirm("هل أنت متأكد من اعتماد هذا المعلم وتفعيل حسابه وصلاحياته للتدريس؟")) return;
    setProcessingId(tutorId);
    try {
      const res = await fetch(`${API}/api/v1/tutoring/admin/applications/${tutorId}/approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast("🎉 تم قبول واعتماد المعلم بنجاح! تم نقل الحساب إلى قائمة المعلمين المعتمدين.", "success");
        fetchData();
      } else {
        showToast(data.detail || "فشل في اعتماد المعلم", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (tutorId: string) => {
    setRejectTargetId(tutorId);
    setRejectReason("المستندات أو كشف العلامات المرفق غير كافٍ أو غير واضح.");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetId) return;
    setProcessingId(rejectTargetId);
    try {
      const res = await fetch(`${API}/api/v1/tutoring/admin/applications/${rejectTargetId}/reject`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (res.ok) {
        setRejectModalOpen(false);
        showToast("تم رفض الطلب وإلغاء صلاحية التدريس للمستخدم.", "success");
        fetchData();
      } else {
        showToast(data.detail || "فشل في رفض الطلب", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("حدث خطأ في الاتصال بالخادم", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFulfillPayout = async (payoutId: string) => {
    if (!confirm("هل تم تنفيذ التحويل الإلكتروني لمستحقات المعلم بنجاح؟")) return;
    setProcessingId(payoutId);
    try {
      const res = await fetch(`${API}/api/v1/tutoring/admin/payouts/${payoutId}/fulfill`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ admin_notes: "تم تنفيذ التحويل الإلكتروني بنجاح." })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "تم تأكيد السحب الإلكتروني!");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  // Metrics
  const pendingApps = applications.filter(a => a.status === "pending");
  const approvedApps = applications.filter(a => a.status === "approved");
  const rejectedApps = applications.filter(a => a.status === "rejected");
  const requestedPayouts = payouts.filter(p => p.status === "requested");
  const requestedPayoutsTotal = requestedPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Filtered Applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const name = (app.profiles?.full_name || app.payout_details?.full_name || app.payout_details?.academic_info?.full_name || "").toLowerCase();
    const uni = app.university?.toLowerCase() || "";
    const major = app.major?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchesQuery = !query || name.includes(query) || uni.includes(query) || major.includes(query);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* ── Toast Notification Banner ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg ${
              toast.type === "success"
                ? "bg-emerald-600 text-white shadow-emerald-600/20"
                : "bg-rose-600 text-white shadow-rose-600/20"
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold text-sm">
              {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Summary Metrics Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Pending Card */}
        <div 
          onClick={() => { setSubTab("applications"); setStatusFilter("pending"); }}
          className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">طلبات جديدة معلقة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{pendingApps.length}</span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">بانتظار المراجعة</span>
          </div>
        </div>

        {/* Approved Card */}
        <div 
          onClick={() => { setSubTab("applications"); setStatusFilter("approved"); }}
          className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">المعلمون المعتمدون</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{approvedApps.length}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">معلم نشط</span>
          </div>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => { setSubTab("applications"); setStatusFilter("rejected"); }}
          className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الطلبات المرفوضة</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{rejectedApps.length}</span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">طلب مرفوض</span>
          </div>
        </div>

        {/* Electronic Payouts Due */}
        <div 
          onClick={() => setSubTab("payouts")}
          className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">مستحقات سحب إلكترونية</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{requestedPayoutsTotal} <span className="text-xs font-bold text-slate-400">₪</span></span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">({requestedPayouts.length} طلب)</span>
          </div>
        </div>

      </div>

      {/* ── Sub Navigation & Search Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs">
        
        {/* Sub Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSubTab("applications")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              subTab === "applications"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>طلبات المعلمين الأكاديميين</span>
            {pendingApps.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                subTab === "applications" ? "bg-white text-indigo-700" : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
              }`}>
                {pendingApps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab("payouts")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${
              subTab === "payouts"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>حوالات السحب الإلكتروني (50%)</span>
            {requestedPayouts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                subTab === "payouts" ? "bg-white text-indigo-700" : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              }`}>
                {requestedPayouts.length}
              </span>
            )}
          </button>
        </div>

        {/* Search and Refresh */}
        <div className="flex items-center gap-2">
          {subTab === "applications" && (
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالاسم، الجامعة، التخصص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>
          )}

          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── Status Filter Pills (For Applications) ── */}
      {subTab === "applications" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="text-xs font-bold text-slate-500 shrink-0">التصفية:</span>
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                statusFilter === status
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              {status === "all" && `الكل (${applications.length})`}
              {status === "pending" && `بانتظار المراجعة (${pendingApps.length})`}
              {status === "approved" && `معتمد (${approvedApps.length})`}
              {status === "rejected" && `مرفوض (${rejectedApps.length})`}
            </button>
          ))}
        </div>
      )}

      {/* ── Main Content List ── */}
      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-xs font-bold text-slate-400">جاري تحميل البيانات الأكاديمية...</span>
        </div>
      ) : subTab === "applications" ? (
        /* ── APPLICATIONS LIST ── */
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">لا توجد طلبات معلمين مطابقة</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">عند تقديم أي معلم لاستمارة الانضمام عبر الموقع، ستظهر بياناته هنا فوراً.</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-7 transition shadow-xs space-y-5"
              >
                  {/* ── 1. Top Header Row (Applicant Info & Actions) ── */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                    {(() => {
                      const applicantName = app.profiles?.full_name || app.payout_details?.full_name || app.payout_details?.academic_info?.full_name || "معلم بدون اسم";
                      return (
                        <div className="flex items-center gap-3.5">
                          <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
                            {applicantName.charAt(0) || "م"}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-black text-slate-900 dark:text-white">
                                {applicantName}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                app.status === "approved" 
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                  : app.status === "rejected"
                                  ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                              }`}>
                                {app.status === "approved" ? "معتمد ✅" : app.status === "rejected" ? "مرفوض ❌" : "قيد المراجعة والتدقيق ⏳"}
                              </span>
                              {app.created_at && (
                                <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                  {new Date(app.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{app.headline || "طلب انضمام لمعلمي لمّاح"}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {app.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            disabled={processingId === app.id}
                            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>اعتماد فوري كمعلم</span>
                          </button>
                          <button
                            onClick={() => openRejectModal(app.id)}
                            disabled={processingId === app.id}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>رفض الطلب</span>
                          </button>
                        </>
                      )}

                      {app.status === "approved" && (
                        <>
                          <a
                            href={`/tutors/${app.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>عرض الصفحة العامة</span>
                          </a>
                          <button
                            onClick={() => openRejectModal(app.id)}
                            disabled={processingId === app.id}
                            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            title="إلغاء تفعيل صلاحية التدريس"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>إلغاء الاعتماد</span>
                          </button>
                        </>
                      )}

                      {app.status === "rejected" && (
                        <button
                          onClick={() => handleApproveApplication(app.id)}
                          disabled={processingId === app.id}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>إعادة النظر والاعتماد</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── 2. Full Academic Metrics & Contact Grid ── */}
                  {(() => {
                    const academicInfo = app.payout_details?.academic_info || {};
                    const studyYear = academicInfo.study_year || (app.academic_level === "student" ? "طالب بكالوريوس" : "خريج");
                    const gpa = academicInfo.gpa || (app as any).gpa || "غير محدد في الطلب السابق";
                    const teachingSubjects = academicInfo.teaching_subjects || (app as any).teaching_subjects || [];
                    const secondDoc = academicInfo.second_doc_url || (app as any).second_doc_url || "";
                    const contactPhone = app.profiles?.phone_number || app.payout_details?.identifier || app.payout_details?.reflect_phone || app.payout_details?.jawwal_pay || "غير مسجل";
                    const contactEmail = app.profiles?.email || "غير متوفر";

                    return (
                      <div className="space-y-4">
                        {/* 4-Box Key Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-bold">الجامعة</span>
                            <strong className="text-slate-900 dark:text-white font-bold block truncate">{app.university || "جامعة النجاح الوطنية"}</strong>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-bold">التخصص والمستوى</span>
                            <strong className="text-slate-900 dark:text-white font-bold block truncate">{app.major} <span className="text-slate-400 font-normal">({studyYear})</span></strong>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-bold">المعدل التراكمي الجامعي (GPA)</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm block">{gpa}</strong>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 block font-bold">الهاتف للتواصل</span>
                            <strong className="text-slate-900 dark:text-white font-mono font-bold block" dir="ltr">{contactPhone}</strong>
                            {contactEmail !== "غير متوفر" && (
                              <span className="text-[10px] text-slate-400 font-mono block truncate" dir="ltr">{contactEmail}</span>
                            )}
                          </div>
                        </div>

                        {/* Teaching Subjects & Grades */}
                        <div className="bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            <span>المواد والمساقات المراد تدريسها ودرجة المعلم في كل مساق:</span>
                          </span>
                          
                          {teachingSubjects.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {teachingSubjects.map((subj: any, sIdx: number) => {
                                const grade = subj.grade || "A";
                                const isTop = ["A+", "A", "A-"].includes(grade);
                                return (
                                  <div 
                                    key={sIdx}
                                    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs"
                                  >
                                    <span>{subj.name || subj}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                                      isTop 
                                        ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" 
                                        : "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                                    }`}>
                                      {grade}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic pt-1">لم يقم المعلم بتسجيل مواد مفصلة (طلب تم تقديمه قبل ترقية النموذج).</p>
                          )}
                        </div>

                        {/* Bio & Teaching Methodology */}
                        {app.bio && (
                          <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                            <span className="text-slate-400 font-bold block mb-1">النبذة التعريفية والأسلوب التدريسي:</span>
                            <p className="font-medium whitespace-pre-wrap">{app.bio}</p>
                          </div>
                        )}

                        {/* Rejection reason notice if rejected */}
                        {app.status === "rejected" && app.rejection_reason && (
                          <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 p-3.5 rounded-2xl">
                            <strong>سبب الرفض المسجل:</strong> {app.rejection_reason}
                          </div>
                        )}

                        {/* Attachments & Electronic Payouts Footer Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          
                          {/* Proof Attachments (Google Drive & YouTube Links) */}
                          <div className="flex flex-wrap items-center gap-2">
                            {app.verification_doc_url ? (
                              <a
                                href={app.verification_doc_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                              >
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>كشف العلامات الرسمي (Google Drive)</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">لا يوجد كشف علامات مرفق</span>
                            )}

                            {secondDoc && (
                              <a
                                href={secondDoc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                              >
                                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>إثبات الطالب / شهادة التخرج</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}

                            {app.intro_video_url && (
                              <a
                                href={app.intro_video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                              >
                                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span>فيديو الشرح التجريبي</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            )}
                          </div>

                          {/* Electronic Payout Destination Details */}
                          {app.payout_details && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>حساب تحويل الأرباح:</span>
                              <strong className="text-slate-900 dark:text-white font-mono font-bold">
                                {app.payout_details.identifier || app.payout_details.reflect_phone || app.payout_details.bank_iban || "غير محدد"}
                              </strong>
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black uppercase">
                                {app.payout_details.method || "Reflect"}
                              </span>
                              {app.payout_details.bank_name && (
                                <span className="text-[11px] text-slate-500">({app.payout_details.bank_name})</span>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })()}

                </motion.div>
              ))
          )}
        </div>
      ) : (
        /* ── ELECTRONIC PAYOUTS LIST ── */
        <div className="space-y-4">
          {payouts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">لا توجد طلبات سحب أرباح إلكترونية</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">عندما يطلب أي معلم معتمد سحب أرباحه الصافية (50%)، ستظهر تفاصيل التحويل هنا.</p>
            </div>
          ) : (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xs transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {payout.amount} ₪
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      payout.status === "completed" 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        : payout.status === "rejected"
                        ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                    }`}>
                      {payout.status === "completed" ? "تم التحويل الإلكتروني بنجاح ✅" : payout.status === "rejected" ? "مرفوض ❌" : "بانتظار التحويل الإلكتروني ⏳"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>👤 المعلم: <strong className="text-slate-800 dark:text-white font-bold">{payout.tutor_profiles?.profiles?.full_name || "معلم"}</strong></span>
                    <span>💳 الحساب: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{payout.account_info?.phone || payout.tutor_profiles?.profiles?.phone_number || "غير متوفر"}</strong></span>
                    <span>📅 التاريخ: <strong className="text-slate-700 dark:text-slate-300">{new Date(payout.created_at).toLocaleString("ar-EG")}</strong></span>
                  </div>
                </div>

                {payout.status === "requested" && (
                  <button
                    onClick={() => handleFulfillPayout(payout.id)}
                    disabled={processingId === payout.id}
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد إتمام التحويل الإلكتروني</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Rejection Modal ── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <span>رفض طلب المعلم</span>
              </h3>
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              يرجى توضيح سبب الرفض ليتم إرساله للمتقدم لكي يتمكن من تصحيح بياناته وإعادة التقديم:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض هنا..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 resize-none shadow-inner"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

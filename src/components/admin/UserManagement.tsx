"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Search, 
  Ban, 
  CheckCircle, 
  Shield, 
  ShieldAlert,
  ShieldCheck,
  UserPlus, 
  UserMinus, 
  Crown, 
  X, 
  Users, 
  GraduationCap, 
  User, 
  Sparkles,
  Phone,
  Calendar,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Mail,
  Copy,
  Check,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserManagement({ session }: { session: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "tutor" | "user" | "blocked">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Add Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminQuery, setAdminQuery] = useState("");
  const [adminSearchLoading, setAdminSearchLoading] = useState(false);
  const [adminSearchMessage, setAdminSearchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const res = await fetch(`${API}/api/v1/admin/export/users-excel`, {
        headers: {
          "Authorization": `Bearer ${session?.access_token}`
        }
      });
      if (!res.ok) {
        throw new Error("فشل تصدير ملف الإكسل");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().split("T")[0];
      a.download = `Lammah_Users_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء تصدير ملف الإكسل");
    } finally {
      setExportingExcel(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/users`, {
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    if (!confirm(`هل أنت متأكد من ${currentlyBanned ? 'فك الحظر عن' : 'حظر'} هذا المستخدم؟`)) return;
    setProcessing(userId);
    try {
      const endpoint = currentlyBanned ? "unban" : "ban";
      const res = await fetch(`${API}/api/v1/admin/users/${userId}/${endpoint}`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: !currentlyBanned } : u));
      }
    } catch (err) {
      alert("حدث خطأ أثناء تنفيذ العملية.");
    } finally {
      setProcessing(null);
    }
  };

  const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    const actionText = currentlyAdmin ? "سحب صلاحيات الأدمن من" : "ترقية هذا المستخدم إلى مسؤول (Admin)";
    if (!confirm(`هل أنت متأكد من ${actionText}؟`)) return;

    setProcessing(userId);
    try {
      const endpoint = currentlyAdmin ? "remove-admin" : "make-admin";
      const res = await fetch(`${API}/api/v1/admin/users/${userId}/${endpoint}`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "تم تحديث دور المستخدم بنجاح!");
        setUsers(users.map(u => u.id === userId ? { ...u, role: currentlyAdmin ? "user" : "admin" } : u));
      } else {
        alert(data.detail?.user_message || data.detail || "فشلت العملية");
      }
    } catch (err) {
      alert("حدث خطأ أثناء تنفيذ العملية.");
    } finally {
      setProcessing(null);
    }
  };

  const handleGrantAdminByQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminQuery.trim()) return;

    setAdminSearchLoading(true);
    setAdminSearchMessage(null);

    try {
      const res = await fetch(`${API}/api/v1/admin/users/grant-admin-by-query`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ query: adminQuery.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminSearchMessage({ type: "success", text: data.message || "تمت ترقية المستخدم كمسؤول بنجاح!" });
        setAdminQuery("");
        fetchUsers();
        setTimeout(() => {
          setShowAddAdminModal(false);
          setAdminSearchMessage(null);
        }, 1800);
      } else {
        setAdminSearchMessage({ type: "error", text: data.detail?.user_message || data.detail || "لم يتم العثور على المستخدم." });
      }
    } catch (err) {
      setAdminSearchMessage({ type: "error", text: "حدث خطأ أثناء الاتصال بالسيرفر." });
    } finally {
      setAdminSearchLoading(false);
    }
  };

  // Metrics
  const adminCount = users.filter(u => u.role === "admin").length;
  const tutorCount = users.filter(u => u.role === "tutor" || u.role === "teacher").length;
  const blockedCount = users.filter(u => u.is_blocked).length;

  const filteredUsers = users.filter(u => {
    const q = search.trim().toLowerCase();
    const matchesSearch = 
      !q ||
      (u.full_name || "").toLowerCase().includes(q) || 
      (u.email || "").toLowerCase().includes(q) || 
      (u.phone_number || "").includes(q) ||
      (u.id || "").toLowerCase().includes(q);
    
    if (roleFilter === "admin") return matchesSearch && u.role === "admin";
    if (roleFilter === "tutor") return matchesSearch && (u.role === "tutor" || u.role === "teacher");
    if (roleFilter === "user") return matchesSearch && (u.role === "user" || !u.role);
    if (roleFilter === "blocked") return matchesSearch && u.is_blocked;
    return matchesSearch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">إجمالي المستخدمين</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</span>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-amber-500/30 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">فريق الإدارة 👑</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{adminCount}</span>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">المعلمون</span>
            <GraduationCap className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{tutorCount}</span>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500">المحظورون</span>
            <Ban className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{blockedCount}</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Add Admin */}
      <div className="bg-white dark:bg-[#0b0f19] p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl py-3 pr-10 pl-4 text-xs font-bold focus:outline-none focus:border-indigo-500 transition shadow-inner"
          />
        </div>

        {/* Actions: Export Excel, Add Admin & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            title="تصدير جميع الطلاب والمستخدمين مع اهتماماتهم ومعلوماتهم الكاملة إلى ملف إكسل"
          >
            {exportingExcel ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>تصدير المستخدمين Excel 📥</span>
          </button>

          <button
            onClick={() => setShowAddAdminModal(true)}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>إضافة وتعيين مسؤول (Admin) جديد</span>
          </button>

          <button
            onClick={fetchUsers}
            className="p-3 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(["all", "admin", "tutor", "user", "blocked"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              roleFilter === r
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            {r === "all" && `جميع المستخدمين (${users.length})`}
            {r === "admin" && `المسؤولون والأدمنية 👑 (${adminCount})`}
            {r === "tutor" && `المعلمون 👨‍🏫 (${tutorCount})`}
            {r === "user" && `الطلاب والزوار (${users.filter(u => u.role !== 'admin' && u.role !== 'tutor').length})`}
            {r === "blocked" && `المحظورون 🚫 (${blockedCount})`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-400">جاري جلب سجل المستخدمين...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="p-4 pr-6">المستخدم</th>
                  <th className="p-4">البريد الإلكتروني</th>
                  <th className="p-4">الجامعة والتخصص</th>
                  <th className="p-4">الاهتمامات الأكاديمية</th>
                  <th className="p-4">رقم الهاتف</th>
                  <th className="p-4">الرتبة والدور</th>
                  <th className="p-4">الباقة والرصيد</th>
                  <th className="p-4">تاريخ التسجيل</th>
                  <th className="p-4 text-center pl-6">صلاحيات وإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isTutor = u.role === "tutor" || u.role === "teacher";
                  const avatarInitial = u.full_name?.charAt(0) || (u.email ? u.email.charAt(0).toUpperCase() : "U");
                  const displayName = u.full_name || (u.email ? u.email.split("@")[0] : "مستخدم بدون اسم");

                  return (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors ${
                        u.is_blocked ? "bg-rose-50/50 dark:bg-rose-950/20" : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isAdmin 
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30"
                              : isTutor
                              ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}>
                            {isAdmin ? <Crown className="w-4 h-4 text-amber-500" /> : avatarInitial}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 dark:text-white">
                                {displayName}
                              </span>
                              {u.is_blocked && (
                                <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                  محظور
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{u.id.substring(0, 12)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-mono text-slate-700 dark:text-slate-300 dir-ltr text-right">
                        {u.email ? (
                          <div className="inline-flex items-center justify-end gap-1.5 group bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                            <Mail className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                            <a 
                              href={`mailto:${u.email}`} 
                              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                              title={`إرسال بريد إلى: ${u.email}`}
                            >
                              {u.email}
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(u.email);
                                setCopiedEmailId(u.id);
                                setTimeout(() => setCopiedEmailId(null), 2000);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="نسخ البريد الإلكتروني"
                            >
                              {copiedEmailId === u.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-sans">غير متوفر</span>
                        )}
                      </td>

                      {/* University & Major */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                            {u.academic_profile?.university || <span className="text-slate-400 font-normal italic">غير محدد</span>}
                          </span>
                          {u.academic_profile?.major && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium block">
                              {u.academic_profile.major} {u.academic_profile.academic_year && `• ${u.academic_profile.academic_year}`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Interests */}
                      <td className="p-4 max-w-[180px]">
                        {Array.isArray(u.academic_profile?.interests) && u.academic_profile.interests.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.academic_profile.interests.slice(0, 2).map((item: string, i: number) => (
                              <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/20 truncate max-w-[120px]">
                                {item}
                              </span>
                            ))}
                            {u.academic_profile.interests.length > 2 && (
                              <span className="text-[9px] font-bold px-1 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                                +{u.academic_profile.interests.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-normal italic">لم تُحدد</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-300 dir-ltr text-right">
                        {u.phone_number || "غير متوفر"}
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-[11px] font-black px-2.5 py-1 rounded-xl">
                            <ShieldCheck className="w-3.5 h-3.5" /> مسؤول أدمن 👑
                          </span>
                        ) : isTutor ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 text-[11px] font-bold px-2.5 py-1 rounded-xl">
                            <GraduationCap className="w-3.5 h-3.5" /> معلم معتمد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold px-2.5 py-1 rounded-xl">
                            <User className="w-3.5 h-3.5" /> طالب
                          </span>
                        )}
                      </td>

                      {/* Plan & Quota */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {u.subscription_plans?.name || "بدون باقة"}
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                          ({u.quota_remaining || 0} رصيد متبقي)
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {new Date(u.created_at).toLocaleDateString("ar-EG")}
                      </td>

                      {/* Actions: Make Admin & Ban */}
                      <td className="p-4 pl-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Make / Remove Admin Button */}
                          <button
                            onClick={() => toggleAdminRole(u.id, isAdmin)}
                            disabled={processing === u.id}
                            className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                              isAdmin
                                ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-200 border border-amber-300 dark:border-amber-500/30"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-transparent"
                            }`}
                            title={isAdmin ? "سحب صلاحيات الأدمن" : "تعيين كمسؤول (Admin)"}
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>{isAdmin ? "سحب الأدمن" : "ترقية لأدمن"}</span>
                          </button>

                          {/* Ban / Unban Button */}
                          {!isAdmin && (
                            <button
                              onClick={() => toggleBan(u.id, u.is_blocked)}
                              disabled={processing === u.id}
                              className={`p-2 rounded-xl font-bold transition-all cursor-pointer ${
                                u.is_blocked
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                              }`}
                              title={u.is_blocked ? "فك الحظر" : "حظر المستخدم"}
                            >
                              {u.is_blocked ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold">لا يوجد مستخدمون مطابقون لمعايير البحث.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Admin Modal ── */}
      <AnimatePresence>
        {showAddAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-amber-500 font-black text-base">
                  <Crown className="w-5 h-5" />
                  <h3 className="text-slate-900 dark:text-white">تعيين مسؤول (Admin) جديد</h3>
                </div>
                <button
                  onClick={() => { setShowAddAdminModal(false); setAdminSearchMessage(null); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ابحث بالبريد الإلكتروني، أو رقم الهاتف، أو اسم المستخدم لمنحه صلاحيات كاملة لإدارة لوحة التحكم والطلبات والمعلمين.
              </p>

              <form onSubmit={handleGrantAdminByQuery} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    البريد الإلكتروني، رقم الهاتف أو الاسم الكامل:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: user@example.com أو 0598298930 أو أحمد علي"
                    value={adminQuery}
                    onChange={(e) => setAdminQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>

                {adminSearchMessage && (
                  <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    adminSearchMessage.type === "success" 
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                      : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                  }`}>
                    {adminSearchMessage.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{adminSearchMessage.text}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddAdminModal(false); setAdminSearchMessage(null); }}
                    className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={adminSearchLoading || !adminQuery.trim()}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {adminSearchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري البحث والترقية...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        <span>ترقية إلى أدمن فوراً</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  Search, 
  Ban, 
  CheckCircle, 
  ShieldCheck, 
  Crown, 
  Users, 
  GraduationCap, 
  User, 
  Sparkles,
  Phone,
  RefreshCw,
  Mail,
  Download,
  Zap,
  Package,
  Trash2
} from "lucide-react";
import AssignSubscriptionModal from "./AssignSubscriptionModal";

export default function UserManagement({ session }: { session: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "subscribed" | "admin" | "user" | "blocked">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Assign Subscription & Minutes Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  // Add Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminQuery, setAdminQuery] = useState("");
  const [adminSearchLoading, setAdminSearchLoading] = useState(false);
  const [adminSearchMessage, setAdminSearchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    const action = currentlyAdmin ? "سحب صلاحيات الأدمن من" : "ترقية إلى أدمن لـ";
    if (!confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) return;
    setProcessing(userId);
    try {
      const endpoint = currentlyAdmin ? "demote-admin" : "promote-admin";
      const res = await fetch(`${API}/api/v1/admin/users/${userId}/${endpoint}`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: currentlyAdmin ? "user" : "admin" } : u));
      }
    } catch (err) {
      alert("حدث خطأ أثناء تحديث الرتبة.");
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelPlan = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء خطة المستخدم (${userName})؟ سيتم تصفير حصته وإلغاء باقته.`)) return;
    setProcessing(userId);
    try {
      const res = await fetch(`${API}/api/v1/admin/users/${userId}/cancel-plan`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "فشل إلغاء الخطة");
      alert(data.message || "تم إلغاء الخطة بنجاح!");
      fetchUsers();
    } catch (e: any) {
      alert(`خطأ: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleSearchAndAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminQuery.trim()) return;
    setAdminSearchLoading(true);
    setAdminSearchMessage(null);
    try {
      const res = await fetch(`${API}/api/v1/admin/users/assign-admin-by-email`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: adminQuery.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminSearchMessage({ type: "success", text: `تم ترقية ${adminQuery} كمسؤول أدمن بنجاح!` });
        setAdminQuery("");
        fetchUsers();
      } else {
        setAdminSearchMessage({ type: "error", text: data.detail || "تعذر العثور على المستخدم بهذا البريد الإلكتروني" });
      }
    } catch (err: any) {
      setAdminSearchMessage({ type: "error", text: "حدث خطأ أثناء محاولة الترقية" });
    } finally {
      setAdminSearchLoading(false);
    }
  };

  const adminCount = users.filter(u => u.role === "admin").length;
  const activeSubsCount = users.filter(u => Boolean(u.subscription_plans || u.quota_remaining > 0)).length;
  const blockedCount = users.filter(u => u.is_blocked).length;

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch = 
      (u.full_name || "").toLowerCase().includes(q) || 
      (u.email || "").toLowerCase().includes(q) || 
      (u.phone_number || "").includes(q) ||
      (u.id || "").toLowerCase().includes(q);
    
    if (roleFilter === "admin") return matchesSearch && u.role === "admin";
    if (roleFilter === "subscribed") return matchesSearch && Boolean(u.subscription_plans || u.quota_remaining > 0);
    if (roleFilter === "user") return matchesSearch && (u.role === "user" || !u.role);
    if (roleFilter === "blocked") return matchesSearch && u.is_blocked;
    return matchesSearch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* 4 Quiet Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">إجمالي المسجلين</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{users.length}</span>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">المشتركون النشطون</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{activeSubsCount}</span>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">فريق الإدارة</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{adminCount}</span>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-500 block mb-1">المحظورون</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{blockedCount}</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Add Admin */}
      <div className="bg-white dark:bg-[#0b0f19] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shadow-2xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم، البريد الإلكتروني، أو الهاتف..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-2.5 pr-10 pl-4 text-xs font-medium focus:outline-none focus:border-slate-400 transition"
          />
        </div>

        {/* Actions: Assign Subscription, Export Excel, Add Admin & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedUserEmail("");
              setShowAssignModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="تفعيل باقة أو شحن رصيد بالبريد"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>شحن باقة بالبريد</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="تصدير كشف المستخدمين إلى ملف إكسل"
          >
            {exportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => setShowAddAdminModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>تعيين أدمن</span>
          </button>

          <button
            onClick={fetchUsers}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Role Filter Tabs (No Tutor) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {(["all", "subscribed", "admin", "user", "blocked"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              roleFilter === r
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            {r === "all" && `الكل (${users.length})`}
            {r === "subscribed" && `المشتركون النشطون (${activeSubsCount})`}
            {r === "admin" && `فريق الإدارة (${adminCount})`}
            {r === "user" && `الطلاب بدون باقة (${users.length - activeSubsCount - adminCount})`}
            {r === "blocked" && `المحظورون (${blockedCount})`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center gap-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs text-slate-400">جاري تحميل السجلات...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="p-3.5 pr-5">المستخدم</th>
                  <th className="p-3.5">البريد الإلكتروني</th>
                  <th className="p-3.5">رقم الهاتف</th>
                  <th className="p-3.5">الرتبة</th>
                  <th className="p-3.5">الباقة والرصيد</th>
                  <th className="p-3.5">تاريخ التسجيل</th>
                  <th className="p-3.5 text-center pl-5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  const hasPlan = Boolean(u.subscription_plans || u.quota_remaining > 0);
                  const displayName = u.full_name || (u.email ? u.email.split("@")[0] : "مستخدم");

                  return (
                    <tr 
                      key={u.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors ${
                        u.is_blocked ? "bg-rose-50/50 dark:bg-rose-950/20" : ""
                      }`}
                    >
                      {/* Name */}
                      <td className="p-3.5 pr-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdmin 
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}>
                            {isAdmin ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : displayName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {displayName}
                            </span>
                            {u.is_blocked && (
                              <span className="text-[10px] text-rose-600 font-bold">محظور</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 text-[11px] dir-ltr text-right">
                        {u.email || "---"}
                      </td>

                      {/* Phone */}
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300 text-[11px] dir-ltr text-right">
                        {u.phone_number || "---"}
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded">
                            مسؤول أدمن
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] px-2 py-0.5 rounded">
                            طالب
                          </span>
                        )}
                      </td>

                      {/* Plan & Quota */}
                      <td className="p-3.5">
                        {hasPlan ? (
                          <div>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-xs">
                              {u.subscription_plans?.name || "باقة مخصصة"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              متبقي: {u.quota_remaining || 0} دقيقة
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">بدون اشتراك</span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                        {new Date(u.created_at).toLocaleDateString("ar-EG")}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pl-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Quick Recharge */}
                          <button
                            onClick={() => {
                              setSelectedUserEmail(u.email || "");
                              setShowAssignModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition cursor-pointer"
                            title="شحن باقة ودقائق"
                          >
                            شحن
                          </button>

                          {/* Cancel Plan (if subscribed) */}
                          {hasPlan && (
                            <button
                              onClick={() => handleCancelPlan(u.id, displayName)}
                              disabled={processing === u.id}
                              className="px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title="إلغاء الخطة"
                            >
                              إلغاء
                            </button>
                          )}

                          {/* Make / Remove Admin */}
                          <button
                            onClick={() => toggleAdminRole(u.id, isAdmin)}
                            disabled={processing === u.id}
                            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                              isAdmin
                                ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                                : "text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title={isAdmin ? "سحب الأدمن" : "ترقية لأدمن"}
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>

                          {/* Ban / Unban */}
                          {!isAdmin && (
                            <button
                              onClick={() => toggleBan(u.id, u.is_blocked)}
                              disabled={processing === u.id}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                u.is_blocked
                                  ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              }`}
                              title={u.is_blocked ? "فك الحظر" : "حظر"}
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
              <div className="p-12 text-center text-slate-400 text-xs">
                لا يوجد مستخدمون مطابقون لمعايير البحث.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>تعيين مسؤول أدمن جديد</span>
              </h3>
              <button 
                onClick={() => { setShowAddAdminModal(false); setAdminSearchMessage(null); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSearchAndAddAdmin} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  البريد الإلكتروني لحساب المستخدم:
                </label>
                <input 
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={adminQuery}
                  onChange={(e) => setAdminQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                />
              </div>

              {adminSearchMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-bold ${
                  adminSearchMessage.type === "success" 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                }`}>
                  {adminSearchMessage.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddAdminModal(false); setAdminSearchMessage(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={adminSearchLoading}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {adminSearchLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>ترقية إلى أدمن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subscription & Minutes Modal */}
      <AssignSubscriptionModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        sessionToken={session?.access_token}
        onSuccess={fetchUsers}
        apiUrl={API}
        initialEmail={selectedUserEmail}
      />

    </div>
  );
}

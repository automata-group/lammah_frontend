"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Check, AlertCircle, X, MessageCircle, Users, Zap, BarChart3, Activity, Package, LayoutDashboard, Megaphone, Clock, AlertTriangle } from "lucide-react";

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
import UserManagement from "@/components/admin/UserManagement";
import FinancialAnalytics from "@/components/admin/FinancialAnalytics";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";

export default function AdminPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");

  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (session) fetchOverview();
  }, [user, loading, session]);
  
  const fetchOverview = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/transactions/admin/pending`, {
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل الجلب - ربما لست أدمن");
      setTransactions(data);

      try {
        const usageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/admin/stats`, {
           headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        const usageData = await usageRes.json();
        if (usageRes.ok) {
          setUsageStats(usageData);
          setStats({ system_health: usageData.system_health, errors: usageData.errors }); // Adjusting based on backend output
        }
      } catch (err) {
        console.error("Failed to fetch usage stats:", err);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };
  
  const handleApprove = async (txId: string) => {
    if (!confirm("هل أنت متأكد من تأكيد هذا الدفع وتفعيل الاشتراك؟")) return;
    setProcessing(txId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/transactions/admin/${txId}/approve`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل التأكيد");
      
      setTransactions(prev => prev.filter(t => t.id !== txId));
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/transactions/admin/${txId}/reject`, {
         method: "POST",
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "فشل الرفض");
      
      setTransactions(prev => prev.filter(t => t.id !== txId));
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/admin/users/${userId}/cancel-plan`, {
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

  if (loading || fetching) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 flex flex-col items-center justify-center text-center" dir="rtl">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">تسجيل دخول غير مصرح</h1>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => router.push("/")} className="mt-8 text-indigo-400">العودة للرئيسية</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-8 flex justify-center selection:bg-indigo-500/30 font-sans" dir="rtl">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl w-full relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex flex-col gap-2">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl mb-4">
             <h1 className="text-xl font-black text-white text-center">لوحة تحكم Lammah</h1>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "overview" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <LayoutDashboard className="w-5 h-5" /> نظرة عامة
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "users" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Users className="w-5 h-5" /> إدارة المستخدمين
            </button>
            <button 
              onClick={() => setActiveTab("financial")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "financial" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <BarChart3 className="w-5 h-5" /> التحليلات المالية
            </button>
            <button 
              onClick={() => setActiveTab("announcements")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "announcements" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Megaphone className="w-5 h-5" /> الإشعارات العامة
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-xl">
          {activeTab === "overview" && (
            <div className="space-y-12">
              <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">الطلبات المعلقة (Pending)</h2>
                </div>
                {transactions.length === 0 ? (
                  <div className="bg-slate-800/50 rounded-2xl p-12 text-center text-slate-400 border border-slate-700/50">
                    لا توجد طلبات مدفوعات معلقة حالياً.
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-sm">
                          <th className="p-4 font-semibold">رقم الطلب</th>
                          <th className="p-4 font-semibold">الطالب</th>
                          <th className="p-4 font-semibold">الهاتف</th>
                          <th className="p-4 font-semibold">الباقة</th>
                          <th className="p-4 font-semibold">المبلغ</th>
                          <th className="p-4 font-semibold">وقت الطلب</th>
                          <th className="p-4 font-semibold text-center w-48">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 text-sm">
                        {transactions.map(tx => {
                          const { label: timeLabel, isOld } = getArabicRelativeTime(tx.created_at);
                          return (
                            <tr key={tx.id} className={`hover:bg-slate-700/30 transition-colors ${isOld ? 'bg-red-950/10' : ''}`}>
                              <td className="p-4 font-mono text-indigo-300">{tx.short_order_id}</td>
                              <td className="p-4 font-medium text-white">{tx.profiles?.full_name || 'غير مجدول'}</td>
                              <td className="p-4 dir-ltr text-left text-slate-300">
                                <div className="flex items-center justify-end gap-3">
                                  {tx.profiles?.phone_number && (
                                    <a href={`https://wa.me/${tx.profiles.phone_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 transition-colors bg-green-500/10 p-1.5 rounded-full" title="مراسلة الطالب">
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                  )}
                                  <span>{tx.profiles?.phone_number || '---'}</span>
                                </div>
                              </td>
                              <td className="p-4">{tx.subscription_plans?.name || '---'}</td>
                              <td className="p-4 font-bold text-green-400">{tx.amount} ₪</td>
                              <td className="p-4">
                                <div className="flex flex-col gap-1">
                                  <div className={`flex items-center gap-1.5 text-xs font-bold ${isOld ? 'text-red-400' : 'text-slate-400'}`}>
                                    {isOld
                                      ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                      : <Clock className="w-3.5 h-3.5 shrink-0" />
                                    }
                                    {timeLabel}
                                  </div>
                                  {tx.created_at && (
                                    <div className="text-[10px] text-slate-600 font-mono" dir="ltr">
                                      {new Date(tx.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button onClick={() => handleApprove(tx.id)} disabled={processing === tx.id} className="bg-green-600/90 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium flex-1">تأكيد</button>
                                  <button onClick={() => handleReject(tx.id)} disabled={processing === tx.id} className="bg-slate-700 hover:bg-red-500 border border-slate-600 hover:border-red-500 text-white px-3 py-2 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {usageStats && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">إحصائيات النظام</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700">
                      <h3 className="text-slate-400 text-sm mb-2">إجمالي المسجلين</h3>
                      <p className="text-3xl font-extrabold text-white">{usageStats.total_users}</p>
                    </div>
                    <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700">
                      <h3 className="text-slate-400 text-sm mb-2">مستخدمي التجربة المجانية</h3>
                      <p className="text-3xl font-extrabold text-amber-400">{usageStats.free_users_count}</p>
                    </div>
                    <div className="bg-indigo-900/20 rounded-2xl p-6 border border-indigo-500/30">
                      <h3 className="text-indigo-300 text-sm mb-2">المحاضرات المعالجة</h3>
                      <p className="text-3xl font-extrabold text-indigo-400">{usageStats.total_lecture_usage}</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden mt-6">
                    <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                      <h3 className="text-lg font-bold text-white flex items-center"><Package className="w-5 h-5 ml-2 text-indigo-400" /> متابعة المشتركين النشطين</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-sm">
                            <th className="p-4 font-semibold">المشترك</th>
                            <th className="p-4 font-semibold">الباقة</th>
                            <th className="p-4 font-semibold">الاستهلاك</th>
                            <th className="p-4 font-semibold text-center">المتبقي</th>
                            <th className="p-4 font-semibold text-center">البصمة</th>
                            <th className="p-4 font-semibold text-center">إدارة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 text-sm">
                          {usageStats.active_subscriptions?.map((sub: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                              <td className="p-4"><div className="font-bold text-white">{sub.user_name}</div><div className="text-xs text-slate-500">{sub.phone}</div></td>
                              <td className="p-4"><span className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20">{sub.plan}</span></td>
                              <td className="p-4">
                                 <div className="flex flex-col gap-1">
                                    <div className="text-slate-300 font-medium">{sub.used} / {sub.quota}</div>
                                    <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                       <div className="bg-indigo-500 h-full" style={{ width: `${(sub.used / sub.quota) * 100}%` }}></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-4 text-center font-bold text-green-400">{sub.remaining}</td>
                              <td className="p-4 text-center"><div className="text-[10px] text-slate-500 truncate w-24 mx-auto" title={sub.fingerprint}>{sub.fingerprint || '---'}</div></td>
                              <td className="p-4 text-center">
                                <button onClick={() => handleCancelPlan(sub.user_id, sub.user_name)} disabled={processing === sub.user_id} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg text-xs font-bold border border-transparent hover:border-red-500/20">
                                  {processing === sub.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : "إلغاء الخطة"}
                                </button>
                              </td>
                            </tr>
                          ))}
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
          {activeTab === "announcements" && <AnnouncementsManager session={session} />}

        </div>
      </div>
    </main>
  );
}

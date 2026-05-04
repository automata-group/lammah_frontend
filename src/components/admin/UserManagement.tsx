"use client";
import { useEffect, useState } from "react";
import { Loader2, Search, Ban, CheckCircle, Shield } from "lucide-react";

export default function UserManagement({ session }: { session: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/admin/users`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/admin/users/${userId}/${endpoint}`, {
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

  const filteredUsers = users.filter(u => 
    (u.full_name || "").includes(search) || 
    (u.phone_number || "").includes(search)
  );

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">إدارة المستخدمين</h2>
          <p className="text-slate-400">إجمالي المسجلين: {users.length}</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو الهاتف..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-xl py-2 pr-10 pl-4 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-sm">
                <th className="p-4 font-semibold">المستخدم</th>
                <th className="p-4 font-semibold">رقم الهاتف</th>
                <th className="p-4 font-semibold">الباقة الحالية</th>
                <th className="p-4 font-semibold">تاريخ التسجيل</th>
                <th className="p-4 font-semibold">الدور</th>
                <th className="p-4 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {filteredUsers.map(u => (
                <tr key={u.id} className={`hover:bg-slate-700/30 transition-colors ${u.is_blocked ? 'bg-red-900/10' : ''}`}>
                  <td className="p-4 font-medium text-white flex items-center gap-2">
                    {u.full_name || 'غير معروف'}
                    {u.is_blocked && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20">محظور</span>}
                  </td>
                  <td className="p-4 text-slate-300 dir-ltr text-left">{u.phone_number || '---'}</td>
                  <td className="p-4 text-indigo-300">{u.subscription_plans?.name || 'تجربة مجانية'} ({u.quota_remaining} متبقي)</td>
                  <td className="p-4 text-slate-400 text-xs">{new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4">
                    {u.role === 'admin' ? 
                      <span className="flex items-center gap-1 text-amber-400 text-xs bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20 w-fit"><Shield className="w-3 h-3"/> أدمن</span> 
                      : <span className="text-slate-500 text-xs">طالب</span>}
                  </td>
                  <td className="p-4 text-center">
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => toggleBan(u.id, u.is_blocked)}
                        disabled={processing === u.id}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center gap-1 justify-center mx-auto ${u.is_blocked ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'}`}
                      >
                        {processing === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : (u.is_blocked ? <><CheckCircle className="w-3 h-3"/> فك الحظر</> : <><Ban className="w-3 h-3"/> حظر</>)}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500">لا يوجد مستخدمين مطابقين للبحث.</div>
          )}
        </div>
      </div>
    </div>
  );
}

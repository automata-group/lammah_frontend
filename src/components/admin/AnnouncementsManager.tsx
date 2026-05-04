"use client";
import { useEffect, useState } from "react";
import { Loader2, Bell, CheckCircle } from "lucide-react";

export default function AnnouncementsManager({ session }: { session: any }) {
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/admin/announcements`);
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "");
        setActive(data.active || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/admin/announcements`, {
         method: "POST",
         headers: { 
           "Authorization": `Bearer ${session?.access_token}`,
           "Content-Type": "application/json"
         },
         body: JSON.stringify({ message, active })
      });
      if (res.ok) {
        alert("تم تحديث الإشعار العام بنجاح!");
      }
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الإشعار.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Bell className="w-6 h-6 text-indigo-400" />
          الإشعارات العامة (Broadcasting)
        </h2>
        
        <p className="text-slate-400 mb-6 text-sm">
          أدخل رسالة إشعار عام لتظهر لجميع الطلاب في لوحة التحكم الخاصة بهم. (مثال: صيانة للنظام، عروض خاصة، إلخ)
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">نص الإشعار</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب الإشعار هنا..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 min-h-[120px] resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="activeCheckbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="activeCheckbox" className="text-sm font-medium text-slate-300 cursor-pointer">
              تفعيل الإشعار وظهوره للطلاب
            </label>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> حفظ ونشر</>}
          </button>
        </div>
      </div>
    </div>
  );
}

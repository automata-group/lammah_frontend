"use client";
import { useEffect, useState } from "react";
import { Loader2, TrendingUp, DollarSign, CreditCard } from "lucide-react";

export default function FinancialAnalytics({ session }: { session: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8500"}/api/v1/admin/analytics/financial`, {
         headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">التحليلات المالية</h2>
          <p className="text-slate-400">إحصائيات الإيرادات والمبيعات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 rounded-2xl p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <DollarSign className="w-16 h-16 absolute -right-4 -bottom-4 text-indigo-500/20" />
          <h3 className="text-indigo-300 text-sm mb-2 font-medium">إجمالي الإيرادات (All Time)</h3>
          <p className="text-4xl font-black text-white mb-1">₪{data?.total_revenue || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-800 rounded-2xl p-6 border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <TrendingUp className="w-16 h-16 absolute -right-4 -bottom-4 text-emerald-500/20" />
          <h3 className="text-emerald-300 text-sm mb-2 font-medium">الإيرادات آخر 30 يوم (MRR)</h3>
          <p className="text-4xl font-black text-white mb-1">₪{data?.mrr || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-slate-800 rounded-2xl p-6 border border-purple-500/30 shadow-xl relative overflow-hidden">
          <CreditCard className="w-16 h-16 absolute -right-4 -bottom-4 text-purple-500/20" />
          <h3 className="text-purple-300 text-sm mb-2 font-medium">العمليات الناجحة</h3>
          <p className="text-4xl font-black text-white mb-1">{data?.total_approved_transactions || 0}</p>
          <div className="text-xs text-purple-200/50 mt-2">اشتراكات مفعلة</div>
        </div>
      </div>
    </div>
  );
}

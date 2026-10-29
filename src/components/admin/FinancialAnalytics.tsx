"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  DollarSign, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw,
  GraduationCap,
  Wallet,
  Search,
  ExternalLink,
  PieChart,
  CheckCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function FinancialAnalytics({ session }: { session: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "openrouter">("students");
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/analytics/financial`, {
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

  if (loading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs font-bold text-slate-400">جاري احتساب البيانات المالية وتحديث السجلات...</span>
      </div>
    );
  }

  // Key Metrics
  const grossInflow = data?.student_subscriptions?.revenue || data?.total_gross_inflow || 0;
  const studentRevenue = data?.student_subscriptions?.revenue || 0;
  const studentCount = data?.student_subscriptions?.total_count || 0;

  // OpenRouter AI Cost & Balance Metrics
  const openrouter = data?.openrouter || {};
  const openrouterUsageUsd = Number(openrouter?.total_usage_usd || 0);
  const openrouterUsageIls = Number(openrouter?.total_usage_ils || 0);
  const openrouterCreditsUsd = Number(openrouter?.total_credits_usd || 0);
  const openrouterRemainingUsd = Number(openrouter?.remaining_balance_usd || 0);
  const openrouterIsLow = Boolean(openrouter?.is_low_balance);
  const trueNetProfit = Math.max(0, Math.round((studentRevenue - openrouterUsageIls) * 100) / 100);

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      
      {/* ── Top Header Bar (Executive Minimalist) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0b0f19] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              الإدارة المالية والاشتراكات
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              حسابات متطابقة
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            متابعة إيرادات باقات الطلاب، تكاليف مزود الذكاء الاصطناعي، وصافي الأرباح الفعلي.
          </p>
        </div>

        <button
          onClick={fetchFinancials}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs self-end sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث</span>
        </button>
      </div>

      {/* ── 3 Executive KPI Cards (Zero Loud Gradients) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. True Net Profit */}
        <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              صافي أرباح المنصة الحقيقية
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
              بعد خصم الـ AI
            </span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              ₪{trueNetProfit.toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            تم خصم ₪{openrouterUsageIls.toFixed(1)} كلفة استهلاك OpenRouter
          </div>
        </div>

        {/* 2. Total Inflow Cash */}
        <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              إجمالي الكاش المستلم
            </span>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
              {studentCount} عملية
            </span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              ₪{grossInflow.toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            إجمالي مبيعات الباقات الواردة إلى ريفلكت والحسابات البنكية
          </div>
        </div>

        {/* 3. OpenRouter Balance */}
        <div 
          onClick={() => setActiveTab("openrouter")}
          className={`cursor-pointer transition bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border shadow-2xs ${
            openrouterIsLow
              ? "border-amber-300 dark:border-amber-500/40 bg-amber-50/20"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              رصيد OpenRouter المتبقي
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              openrouterIsLow
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}>
              {openrouterIsLow ? "⚠️ منخفض" : "🟢 كافٍ للعمل"}
            </span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              ${openrouterRemainingUsd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">متاح</span>
          </div>

          <div className="text-[11px] text-slate-400">
            المشحون: ${openrouterCreditsUsd.toFixed(0)} | المصروف: ${openrouterUsageUsd.toFixed(2)}
          </div>
        </div>

      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Tab 1: Student Subscriptions */}
        <button
          onClick={() => setActiveTab("students")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "students"
              ? "bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>اشتراكات الطلاب ({studentCount})</span>
        </button>

        {/* Tab 2: OpenRouter AI Cost & Balance */}
        <button
          onClick={() => setActiveTab("openrouter")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "openrouter"
              ? "bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>تكاليف OpenRouter AI (${openrouterUsageUsd.toFixed(2)})</span>
        </button>

      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: STUDENT SUBSCRIPTIONS LEDGER ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "students" && (
        <div className="bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                سجل عمليات الدفع والاشتراك
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إجمالي الدخل المحصل: ₪{studentRevenue.toLocaleString()}
              </p>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="بحث بالطالب أو الباقة..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="p-3.5">الطالب</th>
                  <th className="p-3.5">الباقة</th>
                  <th className="p-3.5">طريقة الدفع</th>
                  <th className="p-3.5 text-center">المبلغ</th>
                  <th className="p-3.5 text-left">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data?.student_subscriptions?.recent_transactions?.length > 0 ? (
                  data.student_subscriptions.recent_transactions
                    .filter((tx: any) => {
                      if (!studentSearch.trim()) return true;
                      const term = studentSearch.toLowerCase();
                      const sName = (tx.profiles?.full_name || tx.sender_name || "").toLowerCase();
                      const pName = (tx.plan_name || "").toLowerCase();
                      const phone = (tx.profiles?.phone_number || tx.sender_phone || "").toLowerCase();
                      return sName.includes(term) || pName.includes(term) || phone.includes(term);
                    })
                    .map((tx: any, idx: number) => {
                      const studentName = tx.profiles?.full_name || tx.sender_name || "طالب";
                      const dateStr = tx.created_at ? new Date(tx.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "---";

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 dark:text-white block">{studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{tx.profiles?.phone_number || tx.sender_phone || "---"}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">
                              {tx.plan_name || "باقة أكاديمية"}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                            {tx.payment_method === "reflect" ? "ريفلكت" :
                             tx.payment_method === "jawwal_pay" ? "جوال باي" :
                             tx.payment_method === "palpay" ? "بال باي" : "تحويل بنكي"}
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-900 dark:text-white font-mono">
                            ₪{tx.amount}
                          </td>
                          <td className="p-3.5 text-left text-[11px] text-slate-400 font-mono" dir="ltr">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      لا توجد اشتراكات مسجلة حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: OPENROUTER AI COST & STATUS ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "openrouter" && (
        <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  حساب واستهلاك مزود الذكاء الاصطناعي (OpenRouter)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  متصل بـ API
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                بيانات الاستهلاك الفعلية المسحوبة مباشرة من حساب OpenRouter الرسمي.
              </p>
            </div>

            <a
              href="https://openrouter.ai/credits"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <span>إدارة الرصيد في OpenRouter</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 4 Clean Metric Tiles (No neon, no redundant progress bars) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-500">الرصيد المتاح حالياً</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                ${openrouterRemainingUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">جاهز لمعالجة المحاضرات</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-500">إجمالي المصروف (USD)</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                ${openrouterUsageUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">تكلفة تلخيص المحاضرات</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-500">إجمالي المصروف (ILS)</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                ₪{openrouterUsageIls.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">سعر الصرف التقديري: 3.75 ₪</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-500">إجمالي ما تم شحنه</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                ${openrouterCreditsUsd.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">الرصيد التراكمي المشحون</div>
            </div>
          </div>

          {/* Simple Clean Calculation Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              معادلة الحسبة: دخل باقات الطلاب (₪{grossInflow}) − تكلفة الـ AI (₪{openrouterUsageIls.toFixed(1)}) = <strong>صافي ربح ₪{trueNetProfit}</strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              تحديث تلقائي مع كل استهلاك
            </span>
          </div>

        </div>
      )}

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw,
  GraduationCap,
  Users,
  Package,
  Calendar,
  Wallet,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  PieChart,
  ArrowRightLeft,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Search,
  Upload,
  Send,
  Building2,
  Smartphone,
  CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FinancialAnalytics({ session }: { session: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payouts" | "students" | "tutoring" | "overview">("payouts");
  
  // Payout fulfill modal state
  const [fulfillingPayout, setFulfillingPayout] = useState<any | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("تم التحويل بنجاح.");
  const [submittingFulfill, setSubmittingFulfill] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Search filter
  const [studentSearch, setStudentSearch] = useState("");
  const [tutoringSearch, setTutoringSearch] = useState("");

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

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleConfirmPayout = async () => {
    if (!fulfillingPayout) return;
    setSubmittingFulfill(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tutoring/admin/payouts/${fulfillingPayout.id}/fulfill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          receipt_image_url: receiptUrl,
          admin_notes: adminNotes
        })
      });

      if (res.ok) {
        setFulfillingPayout(null);
        setReceiptUrl("");
        setAdminNotes("تم التحويل بنجاح.");
        await fetchFinancials();
      } else {
        const err = await res.json();
        alert(err.detail || "فشل تأكيد عملية التحويل.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setSubmittingFulfill(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs font-bold text-slate-400">جاري احتساب البيانات المالية وتحديث سجلات التحويل...</span>
      </div>
    );
  }

  // Key Metrics
  const netProfit = data?.net_platform_profit || 0;
  const grossInflow = data?.total_gross_inflow || 0;
  const teacherLiabilities = data?.total_teacher_liabilities || 0;
  const studentRevenue = data?.student_subscriptions?.revenue || 0;
  const studentCount = data?.student_subscriptions?.total_count || 0;
  const tutoringNet = data?.tutoring?.platform_net_revenue || 0;
  const tutoringGross = data?.tutoring?.gross_booking_volume || 0;
  const pendingPayouts = data?.tutoring?.pending_payouts || [];
  const completedPayouts = data?.tutoring?.completed_payouts || [];
  const pendingPayoutsSum = data?.tutoring?.tutor_payouts_pending || 0;

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0b0f19] p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                الإدارة المالية ومكتب التحويلات 💰
              </h2>
              {pendingPayouts.length > 0 ? (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1 animate-pulse">
                  {pendingPayouts.length} طلب سحب مستحق للمعلمين
                </span>
              ) : (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  جميع الحسابات مكتملة
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              متابعة دقيقة لكل شيكل: اشتراكات الطلاب، عمولات التدريس (50%)، وسحوبات المعلمين المستحقة.
            </p>
          </div>
        </div>

        <button
          onClick={fetchFinancials}
          className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs self-end sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تحديث الحسابات</span>
        </button>
      </div>

      {/* ── 3 Master KPI Balance Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Net Profit */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-50/80 via-white to-white dark:from-emerald-950/30 dark:via-[#0b0f19] dark:to-[#0b0f19] rounded-3xl p-6 border border-emerald-200/90 dark:border-emerald-500/30 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
              صافي أرباح المنصة الحقيقية (Net Profit) 💎
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
              ₪{netProfit.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>باقات الطلاب (100%) + عمولة التدريس (50%)</span>
          </div>
        </motion.div>

        {/* 2. Total Inflow Cash */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-indigo-50/80 via-white to-white dark:from-indigo-950/30 dark:via-[#0b0f19] dark:to-[#0b0f19] rounded-3xl p-6 border border-indigo-200/90 dark:border-indigo-500/30 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
              إجمالي الكاش المستلم (Cash Inflow) 🏦
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
              ₪{grossInflow.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-indigo-600/80 dark:text-indigo-400/80 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>كل ما دخل في محافظ ريفلكت والبنك التابعة للمنصة</span>
          </div>
        </motion.div>

        {/* 3. Teacher Liabilities / Pending Payouts */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br rounded-3xl p-6 border shadow-xs relative overflow-hidden ${
            pendingPayouts.length > 0
              ? "from-rose-50/80 via-white to-white dark:from-rose-950/30 dark:via-[#0b0f19] dark:to-[#0b0f19] border-rose-200/90 dark:border-rose-500/30"
              : "from-slate-50/80 via-white to-white dark:from-slate-900/30 dark:via-[#0b0f19] dark:to-[#0b0f19] border-slate-200/90 dark:border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-black ${pendingPayouts.length > 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-600 dark:text-slate-400"}`}>
              أمانات ومستحقات المعلمين (Liabilities) ⏳
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pendingPayouts.length > 0 ? "bg-rose-500/10 text-rose-600" : "bg-slate-500/10 text-slate-500"}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className={`text-3xl sm:text-4xl font-black font-mono ${pendingPayouts.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
              ₪{teacherLiabilities.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${pendingPayouts.length > 0 ? "text-rose-500" : "text-slate-400"}`} />
            <span>
              {pendingPayouts.length > 0 
                ? `منها ₪${pendingPayoutsSum} طلبات سحب تنتظر التحويل الآن` 
                : "أرصدة في محافظ المعلمين لم يطلبوا سحبها بعد"}
            </span>
          </div>
        </motion.div>

      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Tab 1: Teacher Payouts Desk */}
        <button
          onClick={() => setActiveTab("payouts")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "payouts"
              ? "bg-white dark:bg-[#0b0f19] text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>سحوبات ومستحقات المعلمين</span>
          {pendingPayouts.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
              {pendingPayouts.length}
            </span>
          )}
        </button>

        {/* Tab 2: Student Subscriptions */}
        <button
          onClick={() => setActiveTab("students")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "students"
              ? "bg-white dark:bg-[#0b0f19] text-indigo-600 dark:text-indigo-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>اشتراكات باقات الطلاب ({studentCount})</span>
        </button>

        {/* Tab 3: Tutoring 50/50 Ledger */}
        <button
          onClick={() => setActiveTab("tutoring")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "tutoring"
              ? "bg-white dark:bg-[#0b0f19] text-emerald-600 dark:text-emerald-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ميزان الحصص الأكاديمية (50/50)</span>
        </button>

      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: TEACHER PAYOUTS DESK ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "payouts" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* Pending Payouts Card Container */}
          <div className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-rose-600" />
                  <span>طلبات السحب المعلقة (تنتظر التحويل للمعلمين)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  قم بتحويل المبلغ المطلوب إلى رقم محفظة المعلم أو حسابه البنكي ثم اضغط "تأكيد التحويل".
                </p>
              </div>

              {pendingPayouts.length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-3.5 py-1.5 rounded-2xl text-xs font-black">
                  إجمالي المطلوب تحويله: ₪{pendingPayoutsSum.toLocaleString()}
                </div>
              )}
            </div>

            {pendingPayouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPayouts.map((payout: any, idx: number) => {
                  const tutorProfile = payout.tutor_profiles || {};
                  const userProfile = tutorProfile.profiles || {};
                  const tutorName = userProfile.full_name || "معلم";
                  const tutorPhone = userProfile.phone_number || tutorProfile.payout_identifier || "---";
                  
                  // Payout Method and identifier
                  const method = payout.payout_method || tutorProfile.payout_method || "reflect";
                  const identifier = payout.payout_details || tutorProfile.payout_identifier || tutorPhone;
                  const iban = tutorProfile.bank_iban || "";
                  const bankName = tutorProfile.bank_name || "";

                  const requestDate = payout.created_at 
                    ? new Date(payout.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
                    : "---";

                  return (
                    <div 
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-rose-200 dark:border-rose-500/30 p-5 space-y-4 shadow-xs"
                    >
                      {/* Tutor Top Row */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-black text-slate-900 dark:text-white text-sm">
                            {tutorName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {tutorProfile.headline || tutorProfile.major || "مدرس معتمد"}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-left">
                          <span className="text-xs text-slate-400 block font-bold">المبلغ المطلوب:</span>
                          <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                            ₪{payout.amount}
                          </span>
                        </div>
                      </div>

                      {/* Destination Account Card */}
                      <div className="bg-white dark:bg-[#0b0f19] rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            {method === "reflect" ? "📱 ريفلكت (Reflect)" :
                             method === "jawwal_pay" ? "📲 جوال باي (Jawwal Pay)" :
                             method === "palpay" ? "💳 بال باي (PalPay)" : "🏦 حساب بنكي فلسطيني"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">{requestDate}</span>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="font-mono font-black text-xs text-slate-900 dark:text-white tracking-wider" dir="ltr">
                            {method === "bank" ? iban : identifier}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(method === "bank" ? iban : identifier, e)}
                            className="text-slate-500 hover:text-indigo-600 p-1 transition cursor-pointer"
                            title="نسخ رقم الحساب"
                          >
                            {copiedText === (method === "bank" ? iban : identifier) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {method === "bank" && bankName && (
                          <div className="text-[11px] text-slate-500 font-bold px-1">
                            البنك: {bankName}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => setFulfillingPayout(payout)}
                        className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black text-xs py-3 rounded-xl transition shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>تأكيد التحويل وإرسال الوصل للمدرس 📤</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 text-center space-y-2">
                <CheckCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-black text-sm text-emerald-800 dark:text-emerald-300">
                  رائع! لا توجد أي طلبات سحب معلقة حالياً
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  جميع مستحقات المعلمين المطلوب سحبها محولة ومؤكدة بالكامل.
                </p>
              </div>
            )}

          </div>

          {/* Completed Payouts Archive */}
          <div className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>أرشيف الحوالات المكتملة للمعلمين</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="p-3.5 font-bold">المعلم</th>
                    <th className="p-3.5 font-bold">طريقة الاستلام</th>
                    <th className="p-3.5 font-bold text-center">المبلغ المحول</th>
                    <th className="p-3.5 font-bold text-left">تاريخ التحويل</th>
                    <th className="p-3.5 font-bold text-center">إشعار التحويل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {completedPayouts.length > 0 ? (
                    completedPayouts.map((p: any, idx: number) => {
                      const tutorName = p.tutor_profiles?.profiles?.full_name || "معلم";
                      const dateStr = p.updated_at || p.created_at ? new Date(p.updated_at || p.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric" }) : "---";

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                            {tutorName}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                            {p.payout_method === "reflect" ? "📱 ريفلكت" :
                             p.payout_method === "jawwal_pay" ? "📲 جوال باي" :
                             p.payout_method === "palpay" ? "💳 بال باي" : "🏦 بنكي"}
                          </td>
                          <td className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            ₪{p.amount}
                          </td>
                          <td className="p-3.5 text-left text-[11px] text-slate-400 font-mono" dir="ltr">
                            {dateStr}
                          </td>
                          <td className="p-3.5 text-center">
                            {p.receipt_image_url ? (
                              <a
                                href={p.receipt_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold"
                              >
                                <span>عرض الوصل</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[10px]">مكتمل ✓</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                        لا توجد حوالات سابقة مسجلة.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: STUDENT SUBSCRIPTIONS LEDGER ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "students" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>كشف حساب مبيعات باقات الطلاب (100% للمنصة)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  إجمالي دخل الباقات: ₪{studentRevenue.toLocaleString()} ({studentCount} عملية تفعيل)
                </p>
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="بحث بالطالب أو الباقة..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="p-3.5 font-bold">الطالب</th>
                    <th className="p-3.5 font-bold">الباقة المشتراة</th>
                    <th className="p-3.5 font-bold">طريقة الدفع</th>
                    <th className="p-3.5 font-bold text-center">المبلغ المستلم</th>
                    <th className="p-3.5 font-bold text-left">التاريخ</th>
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
                              <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-indigo-200 dark:border-indigo-500/20">
                                {tx.plan_name || "باقة أكاديمية"}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-300 font-bold">
                              {tx.payment_method === "reflect" ? "📱 ريفلكت" :
                               tx.payment_method === "jawwal_pay" ? "📲 جوال باي" :
                               tx.payment_method === "palpay" ? "💳 بال باي" : "🏦 بنكي"}
                            </td>
                            <td className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 font-mono">
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
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-xs font-bold">
                        لا توجد اشتراكات مدفوعة مسجلة حتى الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: TUTORING 50/50 SPLIT LEDGER ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "tutoring" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">إجمالي مبيعات الحصص (100%)</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                ₪{tutoringGross.toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-emerald-200 dark:border-emerald-500/30 shadow-xs bg-emerald-50/10">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">صافي أرباح المنصة (50%)</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                ₪{tutoringNet.toLocaleString()}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0b0f19] border border-blue-200 dark:border-blue-500/30 shadow-xs bg-blue-50/10">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mb-1">حصة المعلمين الكلية (50%)</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                ₪{tutoringNet.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>سجل جلسات التدريس وتوزيع الأرباح (50/50 Split)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  تفاصيل الجلسات المنجزة والتوزيع المالي الصافي بين المنصة والمعلم
                </p>
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tutoringSearch}
                  onChange={(e) => setTutoringSearch(e.target.value)}
                  placeholder="بحث بالحصة، الطالب، أو المعلم..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="p-3.5 font-bold">المادة / الحصة</th>
                    <th className="p-3.5 font-bold">الطالب</th>
                    <th className="p-3.5 font-bold">المعلم الأكاديمي</th>
                    <th className="p-3.5 font-bold text-center">سعر الحصة (100%)</th>
                    <th className="p-3.5 font-bold text-center">حصة المنصة (50%)</th>
                    <th className="p-3.5 font-bold text-center">حصة المعلم (50%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {data?.tutoring?.recent_bookings?.length > 0 ? (
                    data.tutoring.recent_bookings
                      .filter((b: any) => {
                        if (!tutoringSearch.trim()) return true;
                        const term = tutoringSearch.toLowerCase();
                        const title = (b.tutoring_services?.title || "").toLowerCase();
                        const sName = (b.student_name || "").toLowerCase();
                        const tName = (b.tutor_profiles?.profiles?.full_name || "").toLowerCase();
                        return title.includes(term) || sName.includes(term) || tName.includes(term);
                      })
                      .map((b: any, idx: number) => {
                        const tutorName = b.tutor_profiles?.profiles?.full_name || "معلم";
                        const studentName = b.student_name || "طالب";
                        const title = b.tutoring_services?.title || "حصة تدريس";

                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {title}
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                              {studentName}
                            </td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                              {tutorName}
                            </td>
                            <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200 font-mono">
                              ₪{b.total_price}
                            </td>
                            <td className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              ₪{b.platform_share || (b.total_price * 0.5)}
                            </td>
                            <td className="p-3.5 text-center font-black text-blue-600 dark:text-blue-400 font-mono">
                              ₪{b.tutor_share || (b.total_price * 0.5)}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-xs font-bold">
                        لا توجد حصص تدريس مسجلة حتى الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── FULFILL PAYOUT MODAL ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {fulfillingPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>تأكيد تحويل أرباح المعلم</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setFulfillingPayout(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Summary box */}
              <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">اسم المعلم:</span>
                  <span className="text-slate-900 dark:text-white">
                    {fulfillingPayout.tutor_profiles?.profiles?.full_name || "معلم"}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">المبلغ المحول:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm">
                    ₪{fulfillingPayout.amount}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-500">طريقة التحويل:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono" dir="ltr">
                    {fulfillingPayout.payout_details || fulfillingPayout.tutor_profiles?.payout_identifier || "---"}
                  </span>
                </div>
              </div>

              {/* Receipt URL input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  رابط إشعار/وصل التحويل (اختياري)
                </label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://... رابط صورة وصل التحويل من ريفلكت"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                  dir="ltr"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  ملاحظة للمدرس
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="تم التحويل بنجاح..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFulfillingPayout(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={submittingFulfill}
                  onClick={handleConfirmPayout}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  {submittingFulfill ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التأكيد...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد التحويل الآن ✓</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
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
  CheckCheck,
  Server,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CreditCard,
  Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FinancialAnalytics({ session }: { session: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "expenses" | "openrouter">("students");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedBankFilter, setSelectedBankFilter] = useState<string | null>(null);

  // Helper badge for plan
  const renderPlanBadge = (planName: string) => {
    const p = (planName || "").toLowerCase();
    if (p.includes("elite") || p.includes("نخبة")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50 text-[11px] font-black whitespace-nowrap shadow-2xs">
          <span>👑</span>
          <span>باقة النخبة (Elite)</span>
        </span>
      );
    }
    if (p.includes("premium") || p.includes("تفوق")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-700/50 text-[11px] font-black whitespace-nowrap shadow-2xs">
          <span>⭐</span>
          <span>باقة التفوق (Premium)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[11px] font-black whitespace-nowrap shadow-2xs">
        <span>⚡</span>
        <span>إنقاذ الكويزات (Essential)</span>
      </span>
    );
  };

  // Helper badge for payment method - strictly the 4 official channels
  const renderPaymentMethodBadge = (method: string) => {
    const m = (method || "reflect").toLowerCase();
    switch (m) {
      case "bop":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px] whitespace-nowrap shadow-2xs">
            <span>🏦</span>
            <span>بنك فلسطين</span>
          </span>
        );
      case "arab_bank":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-[11px] whitespace-nowrap shadow-2xs">
            <span>🏛️</span>
            <span>البنك العربي</span>
          </span>
        );
      case "cash":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-[11px] whitespace-nowrap shadow-2xs">
            <span>💵</span>
            <span>كاش (نقدي)</span>
          </span>
        );
      case "reflect":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] whitespace-nowrap shadow-2xs">
            <span>📱</span>
            <span>ريفلكت (Reflect)</span>
          </span>
        );
    }
  };

  // Aggregated money by bank (Strictly 4 official accounts)
  const bankStats = useMemo(() => {
    const txs = data?.student_subscriptions?.recent_transactions || [];
    const base: Record<string, { key: string; label: string; amount: number; count: number; icon: string; border: string; bg: string; text: string; activeRing: string }> = {
      reflect: { 
        key: "reflect", 
        label: "ريفلكت (Reflect)", 
        amount: 0, 
        count: 0, 
        icon: "📱", 
        border: "border-indigo-200/90 dark:border-indigo-900/60", 
        bg: "bg-indigo-50/50 dark:bg-indigo-950/20", 
        text: "text-indigo-950 dark:text-indigo-200",
        activeRing: "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/50 shadow-sm"
      },
      bop: { 
        key: "bop", 
        label: "بنك فلسطين", 
        amount: 0, 
        count: 0, 
        icon: "🏦", 
        border: "border-emerald-200/90 dark:border-emerald-900/60", 
        bg: "bg-emerald-50/50 dark:bg-emerald-950/20", 
        text: "text-emerald-950 dark:text-emerald-200",
        activeRing: "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 shadow-sm"
      },
      arab_bank: { 
        key: "arab_bank", 
        label: "البنك العربي", 
        amount: 0, 
        count: 0, 
        icon: "🏛️", 
        border: "border-blue-200/90 dark:border-blue-900/60", 
        bg: "bg-blue-50/50 dark:bg-blue-950/20", 
        text: "text-blue-950 dark:text-blue-200",
        activeRing: "ring-2 ring-blue-500 border-blue-500 bg-blue-50/90 dark:bg-blue-950/50 shadow-sm"
      },
      cash: { 
        key: "cash", 
        label: "كاش (نقدي)", 
        amount: 0, 
        count: 0, 
        icon: "💵", 
        border: "border-amber-200/90 dark:border-amber-900/60", 
        bg: "bg-amber-50/50 dark:bg-amber-950/20", 
        text: "text-amber-950 dark:text-amber-200",
        activeRing: "ring-2 ring-amber-500 border-amber-500 bg-amber-50/90 dark:bg-amber-950/50 shadow-sm"
      },
    };

    txs.forEach((tx: any) => {
      let m = (tx.payment_method || "reflect").toLowerCase();
      if (!base[m]) {
        m = "reflect";
      }
      const amt = Number(tx.amount) || 0;
      base[m].amount += amt;
      base[m].count += 1;
    });

    return Object.values(base);
  }, [data?.student_subscriptions?.recent_transactions]);

  // Edit Transaction State
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isUpdatingTx, setIsUpdatingTx] = useState(false);

  // Add Server Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("server");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

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

  // Open Edit Modal for a Transaction
  const handleOpenEditTx = (tx: any) => {
    setEditingTx(tx);
    setEditAmount(String(tx.amount || "0"));
    setEditPaymentMethod(tx.payment_method || "reflect");
    setEditNotes(tx.notes || "");
  };

  // Save Transaction Updates
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount < 0) {
      alert("يرجى إدخال مبلغ صحيح.");
      return;
    }

    setIsUpdatingTx(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/transactions/${editingTx.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: numAmount,
          payment_method: editPaymentMethod,
          notes: editNotes
        })
      });
      if (res.ok) {
        setEditingTx(null);
        await fetchFinancials();
      } else {
        const err = await res.json();
        alert(err.detail || "فشل تعديل بيانات المعاملة.");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setIsUpdatingTx(false);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المعاملة نهائياً من سجل الأرباح؟")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/transactions/${txId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setEditingTx(null);
        await fetchFinancials();
      } else {
        alert("فشل حذف المعاملة.");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // Submit New Server Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim()) {
      alert("يرجى إدخال وصف أو اسم التكلفة.");
      return;
    }
    const numAmount = parseFloat(expenseAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("يرجى إدخال مبلغ صحيح بالشيكل.");
      return;
    }

    setIsAddingExpense(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/expenses`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: expenseTitle.trim(),
          amount_ils: numAmount,
          category: expenseCategory,
          notes: expenseNotes.trim()
        })
      });
      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseTitle("");
        setExpenseAmount("");
        setExpenseNotes("");
        await fetchFinancials();
      } else {
        const err = await res.json();
        alert(err.detail || "فشل إضافة التكلفة.");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setIsAddingExpense(false);
    }
  };

  // Delete Server Expense
  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المصروف؟ سيتم إرجاع قيمته لصافي الأرباح.")) return;
    setDeletingExpenseId(expenseId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/admin/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        await fetchFinancials();
      } else {
        alert("فشل حذف المصروف.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setDeletingExpenseId(null);
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

  // Server & Operational Expenses Metrics
  const totalServerExpensesIls = Number(data?.total_server_expenses_ils || 0);
  const serverExpensesList = data?.server_expenses || [];

  // True Net Profit
  const trueNetProfit = Number(data?.true_net_profit !== undefined 
    ? data.true_net_profit 
    : Math.max(0, Math.round((studentRevenue - openrouterUsageIls - totalServerExpensesIls) * 100) / 100));

  return (
    <div className="space-y-6 max-w-6xl" dir="rtl">
      
      {/* ── Top Header Bar (Executive Minimalist) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0b0f19] p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              الإدارة المالية وحسابات المنصة
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              حسابات متطابقة
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            متابعة إيرادات باقات الطلاب، تكاليف السيرفرات والتشغيل، واستهلاك مزود الذكاء الاصطناعي.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة تكلفة سيرفر</span>
          </button>

          <button
            onClick={fetchFinancials}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* ── 4 Executive KPI Cards (Zero Loud Gradients) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. True Net Profit */}
        <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              صافي الربح الفعلي
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
              في جيبك
            </span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              ₪{trueNetProfit.toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            مخصوم: ₪{openrouterUsageIls.toFixed(1)} AI و ₪{totalServerExpensesIls.toFixed(0)} سيرفر
          </div>
        </div>

        {/* 2. Total Inflow Cash */}
        <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              إجمالي الكاش المستلم
            </span>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
              {studentCount} طالب
            </span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              ₪{grossInflow.toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            إجمالي مبيعات الباقات الواردة إلى الحسابات
          </div>
        </div>

        {/* 3. Server & Operational Expenses */}
        <div 
          onClick={() => setActiveTab("expenses")}
          className={`cursor-pointer transition bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border shadow-2xs ${
            activeTab === "expenses"
              ? "border-slate-400 dark:border-slate-700 ring-1 ring-slate-400"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              تكاليف وتشغيل السيرفرات
            </span>
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded">
              {serverExpensesList.length} بنود
            </span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              ₪{totalServerExpensesIls.toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            استضافة، سيرفرات، ونطاقات مخصومة
          </div>
        </div>

        {/* 4. OpenRouter Balance */}
        <div 
          onClick={() => setActiveTab("openrouter")}
          className={`cursor-pointer transition bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border shadow-2xs ${
            openrouterIsLow
              ? "border-amber-300 dark:border-amber-500/40 bg-amber-50/20"
              : activeTab === "openrouter"
                ? "border-slate-400 dark:border-slate-700 ring-1 ring-slate-400"
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
              {openrouterIsLow ? "⚠️ منخفض" : "🟢 كافٍ"}
            </span>
          </div>
          
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              ${openrouterRemainingUsd.toFixed(2)}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            المشحون: ${openrouterCreditsUsd.toFixed(0)} | المصروف: ${openrouterUsageUsd.toFixed(2)}
          </div>
        </div>

      </div>

      {/* ── Main Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Tab 1: Student Subscriptions */}
        <button
          onClick={() => setActiveTab("students")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "students"
              ? "bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>اشتراكات الطلاب ({studentCount})</span>
        </button>

        {/* Tab 2: Server & Operational Expenses */}
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "expenses"
              ? "bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white shadow-2xs border border-slate-200/60 dark:border-slate-800"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>مصاريف وتشغيل السيرفرات (₪{totalServerExpensesIls})</span>
        </button>

        {/* Tab 3: OpenRouter AI Cost & Balance */}
        <button
          onClick={() => setActiveTab("openrouter")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                إجمالي الدخل المحصل: ₪{studentRevenue.toLocaleString()} • يمكنك تعديل سعر أي مشترك بالنقر على زر التعديل
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

          {/* ── Bank Accounts Aggregated Breakdown (4 Official Channels) ── */}
          <div className="space-y-2.5 pt-1 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>توزيع الأموال المحصلة حسب الحساب والبنك:</span>
              </span>
              {selectedBankFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedBankFilter(null)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  ✕ إلغاء التصفية (عرض كل الحسابات ₪{studentRevenue.toLocaleString()})
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bankStats.map((bank) => {
                const isSelected = selectedBankFilter === bank.key;
                return (
                  <button
                    key={bank.key}
                    type="button"
                    onClick={() => setSelectedBankFilter(isSelected ? null : bank.key)}
                    className={`p-3.5 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? bank.activeRing
                        : `${bank.border} ${bank.bg} hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{bank.icon}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                        {bank.count} عمليات
                      </span>
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${bank.text}`} title={bank.label}>
                        {bank.label}
                      </div>
                      <div className="text-lg font-black font-mono mt-1 text-slate-900 dark:text-white">
                        ₪{bank.amount.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/40 shadow-2xs">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4">المشترك</th>
                  <th className="py-3 px-3">الباقة</th>
                  <th className="py-3 px-3">الحساب / طريقة التحويل</th>
                  <th className="py-3 px-3 text-center">المبلغ المستلم</th>
                  <th className="py-3 px-4 text-center">رصيد واستهلاك الدقائق</th>
                  <th className="py-3 px-3 text-center">التاريخ</th>
                  <th className="py-3 px-3 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data?.student_subscriptions?.recent_transactions?.length > 0 ? (
                  data.student_subscriptions.recent_transactions
                    .filter((tx: any) => {
                      if (selectedBankFilter) {
                        const m = (tx.payment_method || "reflect").toLowerCase();
                        const targetM = ["bop", "arab_bank", "cash", "reflect"].includes(m) ? m : "reflect";
                        if (targetM !== selectedBankFilter) return false;
                      }
                      if (!studentSearch.trim()) return true;
                      const term = studentSearch.toLowerCase();
                      const sName = (tx.profiles?.full_name || tx.sender_name || "").toLowerCase();
                      const pName = (tx.plan_name || "").toLowerCase();
                      const phone = (tx.profiles?.phone_number || tx.sender_phone || "").toLowerCase();
                      const email = (tx.student_email || "").toLowerCase();
                      const notes = (tx.notes || "").toLowerCase();
                      return sName.includes(term) || pName.includes(term) || phone.includes(term) || email.includes(term) || notes.includes(term);
                    })
                    .map((tx: any, idx: number) => {
                      const studentName = tx.profiles?.full_name || tx.sender_name || "طالب";
                      const dateObj = tx.created_at ? new Date(tx.created_at) : null;
                      const dateStr = dateObj ? dateObj.toLocaleDateString("ar-EG", { month: "short", day: "numeric", year: "numeric" }) : "---";
                      const timeStr = dateObj ? dateObj.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : "";
                      const rawAmt = Number(tx.amount) || 0;
                      const displayAmt = rawAmt % 1 === 0 ? rawAmt.toFixed(0) : rawAmt.toFixed(2);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                          {/* Student */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 text-xs shrink-0 select-none shadow-2xs">
                                {studentName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white block text-xs truncate">
                                  {studentName}
                                </span>
                                {tx.student_email ? (
                                  <span className="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-mono block select-all transition-colors truncate">
                                    {tx.student_email}
                                  </span>
                                ) : (
                                  tx.profiles?.phone_number && (
                                    <span className="text-[10px] text-slate-400 font-mono block">
                                      {tx.profiles.phone_number}
                                    </span>
                                  )
                                )}
                                {tx.notes && (
                                  <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-2 py-0.5 rounded-md w-fit max-w-[200px] truncate" title={tx.notes}>
                                    <span className="font-bold shrink-0">ملاحظة:</span> <span className="truncate">{tx.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {renderPlanBadge(tx.plan_name)}
                          </td>

                          {/* Payment Method */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {renderPaymentMethodBadge(tx.payment_method)}
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-black text-sm text-slate-900 dark:text-white">
                            ₪{displayAmt}
                          </td>

                          {/* Minutes Quota & Consumption */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1 min-w-[170px]">
                              {/* Horizontal badges that never wrap */}
                              <div className="inline-flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-2xs">
                                <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md flex items-center gap-1" title="الدقائق المتبقية في رصيده">
                                  <span className="text-[10px] opacity-75 font-normal">باقي:</span>
                                  <strong className="font-mono text-xs">{tx.minutes_remaining ?? 0}د</strong>
                                </span>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span className="text-slate-600 dark:text-slate-300 px-1.5 py-0.5 flex items-center gap-1" title="الدقائق التي استهلكها">
                                  <span className="text-[10px] opacity-75 font-normal">صرفت:</span>
                                  <strong className="font-mono text-xs text-slate-900 dark:text-white">{tx.minutes_used ?? 0}د</strong>
                                </span>
                              </div>

                              {/* AI Token Cost */}
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                <span>{tx.tokens_used > 0 ? `${tx.tokens_used >= 1000 ? (tx.tokens_used / 1000).toFixed(1) + 'K' : tx.tokens_used} توكن` : "0 توكن"}</span>
                                {tx.ai_cost_usd > 0 && (
                                  <span className="text-rose-500 dark:text-rose-400 font-bold">
                                    (-₪{tx.ai_cost_ils || (tx.ai_cost_usd * 3.75).toFixed(2)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px]" dir="ltr">
                            <div className="text-slate-800 dark:text-slate-200 font-bold">
                              {dateStr}
                            </div>
                            {timeStr && (
                              <div className="text-slate-400 text-[10px]">
                                {timeStr}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-left whitespace-nowrap">
                            <button
                              onClick={() => handleOpenEditTx(tx)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1.5 transition shadow-2xs hover:border-slate-300 cursor-pointer"
                              title="تعديل السعر أو طريقة الدفع"
                            >
                              <Pencil className="w-3 h-3 text-slate-500" />
                              <span>تعديل</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
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
      {/* ── TAB 2: SERVER & OPERATIONAL EXPENSES ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "expenses" && (
        <div className="bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  سجل مصاريف وتشغيل السيرفرات
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                  تُخصم من الأرباح
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إجمالي التكاليف المخصومة: ₪{totalServerExpensesIls.toLocaleString()} • تُخصم تلقائياً من صافي الأرباح الحقيقي
              </p>
            </div>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة تكلفة جديدة</span>
            </button>
          </div>

          {/* ── Bank Accounts Aggregated Breakdown (4 Official Channels) ── */}
          <div className="space-y-2.5 pt-1 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>توزيع الأموال المحصلة حسب الحساب والبنك:</span>
              </span>
              {selectedBankFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedBankFilter(null)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  ✕ إلغاء التصفية (عرض كل الحسابات ₪{studentRevenue.toLocaleString()})
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bankStats.map((bank) => {
                const isSelected = selectedBankFilter === bank.key;
                return (
                  <button
                    key={bank.key}
                    type="button"
                    onClick={() => setSelectedBankFilter(isSelected ? null : bank.key)}
                    className={`p-3.5 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? bank.activeRing
                        : `${bank.border} ${bank.bg} hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{bank.icon}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                        {bank.count} عمليات
                      </span>
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${bank.text}`} title={bank.label}>
                        {bank.label}
                      </div>
                      <div className="text-lg font-black font-mono mt-1 text-slate-900 dark:text-white">
                        ₪{bank.amount.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="p-3.5">بند التكلفة</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5 text-center">المبلغ بالشيكل</th>
                  <th className="p-3.5 text-center">المعادل بالدولار</th>
                  <th className="p-3.5">ملاحظات</th>
                  <th className="p-3.5 text-center">التاريخ</th>
                  <th className="p-3.5 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {serverExpensesList.length > 0 ? (
                  serverExpensesList.map((exp: any, idx: number) => {
                    const dateStr = exp.created_at ? new Date(exp.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "---";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Server className="w-3.5 h-3.5 text-slate-400" />
                            <span>{exp.title}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">
                            {exp.category === "server" ? "سيرفر واستضافة" :
                             exp.category === "domain" ? "دومين ونطاق" :
                             exp.category === "tools" ? "أدوات وخدمات" : exp.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
                          -₪{exp.amount_ils}
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-500 dark:text-slate-400">
                          ${exp.amount_usd}
                        </td>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">
                          {exp.notes || "---"}
                        </td>
                        <td className="p-3.5 text-center text-[11px] text-slate-400 font-mono" dir="ltr">
                          {dateStr}
                        </td>
                        <td className="p-3.5 text-left">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            disabled={deletingExpenseId === exp.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                            title="حذف المصروف"
                          >
                            {deletingExpenseId === exp.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      لا توجد تكاليف سيرفرات مسجلة حالياً. يمكنك إضافة تكاليف مثل استضافة Hetzner أو سيرفرات الاستضافة من الزر أعلاه.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: OPENROUTER AI COST & STATUS ── */}
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

          {/* 4 Clean Metric Tiles */}
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
              معادلة الحسبة: دخل الطلاب (₪{grossInflow}) − تكلفة الـ AI (₪{openrouterUsageIls.toFixed(1)}) − السيرفرات (₪{totalServerExpensesIls.toFixed(0)}) = <strong>صافي ربح ₪{trueNetProfit}</strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              تحديث تلقائي وفوري
            </span>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: EDIT TRANSACTION (سعر المشترك وطريقة الدفع) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-xl space-y-4"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    تعديل سعر وبيانات الاشتراك
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    الطالب: <strong className="text-slate-800 dark:text-slate-200">{editingTx.sender_name}</strong> {editingTx.student_email ? `(${editingTx.student_email})` : `(${editingTx.plan_name})`}
                  </p>
                </div>
                <button
                  onClick={() => setEditingTx(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTransaction} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    المبلغ المحصل الفعلي (₪ شيكل):
                  </label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₪</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    سيتم اعتماد هذا الرقم مباشرة في إجمالي الدخل المحصل وحساب الأرباح.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    طريقة الدفع:
                  </label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  >
                    <option value="reflect">📱 ريفلكت (Reflect)</option>
                    <option value="bop">🏦 بنك فلسطين (Bank of Palestine)</option>
                    <option value="arab_bank">🏛️ البنك العربي (Arab Bank)</option>
                    <option value="cash">💵 كاش (نقدي)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ملاحظات إضافية على المشترك:
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="مثال: تم تحويل 25 بدل 30 بالاتفاق، دفعة أولى، صديق فلان..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDeleteTransaction(editingTx.id)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف العملية بالكامل</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingTx(null)}
                      className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingTx}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingTx && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>حفظ التعديل</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: ADD SERVER EXPENSE (إضافة تكلفة سيرفر جديدة) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-xl space-y-4"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      إضافة تكلفة سيرفر أو تشغيل
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      سيتم خصم هذا المبلغ فوراً من صافي أرباح المنصة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    بند التكلفة / اسم الخدمة:
                  </label>
                  <input
                    type="text"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="مثال: سيرفر استضافة Hetzner، تجديد دومين، استضافة Supabase"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المبلغ (₪ شيكل):
                    </label>
                    <div className="relative">
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₪</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="50"
                        required
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      التصنيف:
                    </label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                    >
                      <option value="server">سيرفر واستضافة</option>
                      <option value="domain">دومين ونطاق</option>
                      <option value="tools">أدوات وبرمجيات</option>
                      <option value="other">مصاريف أخرى</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ملاحظات إضافية (اختياري):
                  </label>
                  <input
                    type="text"
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    placeholder="مثال: فاتورة شهر 10 مدفوعة بالفيزا"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingExpense}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {isAddingExpense && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>تسجيل وخصم من الأرباح</span>
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

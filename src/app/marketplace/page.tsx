"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Store, BookOpen, Search, Loader2, Eye, ShoppingCart, 
  User, Coins, Copy, Check, Info, ArrowLeft, Calendar, 
  Sparkles, CheckCircle2, ShieldCheck, Package, Crown, History, LogOut, Share2
} from "lucide-react";

export default function MarketplacePage() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [quota, setQuota] = useState<number | null>(null);
  
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedNotebook, setSelectedNotebook] = useState<any | null>(null);
  const [interactivePreviewNotebook, setInteractivePreviewNotebook] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedNotebookId, setCopiedNotebookId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);

  useEffect(() => {
    fetchNotebooks();
    // Read shared search param on deep link
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("search");
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, []);

  useEffect(() => {
    const fetchQuota = async () => {
      if (session) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
            headers: {
              "Authorization": `Bearer ${session.access_token}`
            }
          });
          const data = await res.json();
          if (res.ok) {
            setQuota(data.quota_remaining !== undefined ? data.quota_remaining : (data.quota_minutes !== undefined ? data.quota_minutes : data.remaining_minutes));
          }
        } catch (e) {
          console.error("Failed to fetch quota:", e);
        }
      }
    };
    fetchQuota();
  }, [session]);

  const fetchNotebooks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/notebooks`);
      const data = await res.json();
      if (data.status === "success") {
        setNotebooks(data.notebooks);
      }
    } catch (e) {
      console.error("Failed to fetch marketplace:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getLeaderboard = () => {
    const counts: Record<string, { count: number; name: string; id: string }> = {};
    notebooks.forEach((nb) => {
      const pubId = nb.publisher_id || "unknown";
      
      let name = nb.profiles?.full_name || nb.student_name || "طالب متميز";
      name = name.trim();
      if (!name || name.toLowerCase() === "free" || name.toLowerCase() === "مجاني") {
        name = "طالب متميز";
      }

      if (!counts[pubId]) {
        counts[pubId] = { count: 0, name, id: pubId };
      } else {
        if (nb.profiles?.full_name && nb.profiles.full_name.trim()) {
          counts[pubId].name = nb.profiles.full_name.trim();
        }
      }
      counts[pubId].count += 1;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const leaderboard = getLeaderboard();

  const handlePreview = async (notebookId: string, previewUrl: string) => {
    // Open preview in new tab
    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}${previewUrl}`, '_blank');
    
    // Increment view count quietly
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/${notebookId}/view`, {
        method: "POST"
      });
      fetchNotebooks(); // Refresh to update view counts
    } catch (e) {}
  };

  const handleShareNotebook = (nb: any) => {
    const cleanName = (nb.student_name || "").split("(")[0].trim() || nb.profiles?.full_name || "طالب متميز";
    const shareUrl = `${window.location.origin}/marketplace?search=${encodeURIComponent(nb.title)}`;
    const shareText = `يا هلا! 👋 شوف هالملزمة الفخمة والذكية على منصة لمّاح: 📚 *${nb.title}* \nتفريغ احترافي ومساق مع الدكتور *${nb.teacher_name}* إعداد الطالب المتميز *${cleanName}*. \nافتح الرابط وشوف المعاينة مجاناً واطلبها بثواني: ${shareUrl} 🚀✨`;
    
    navigator.clipboard.writeText(shareText);
    setCopiedNotebookId(nb.id);
    setTimeout(() => setCopiedNotebookId(null), 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) return;

    setIsSubmittingPurchase(true);
    setTimeout(() => {
      setIsSubmittingPurchase(false);
      setPurchaseSuccess(true);
      fetchNotebooks(); // Refresh view count
    }, 1500);
  };

  const closePurchaseModal = () => {
    setSelectedNotebook(null);
    setPurchaseSuccess(false);
    setSenderName("");
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (!session) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الملزمة من المتجر؟")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/${notebookId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        alert("تم حذف الملزمة من المتجر بنجاح.");
        fetchNotebooks();
      } else {
        const err = await res.json();
        alert(err.detail || "فشل حذف الملزمة.");
      }
    } catch (e) {
      console.error("Failed to delete notebook:", e);
      alert("حدث خطأ أثناء محاولة حذف الملزمة.");
    }
  };

  const filteredNotebooks = notebooks.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.teacher_name.toLowerCase().includes(search.toLowerCase()) ||
    (n.description && n.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 md:p-12 font-sans relative overflow-hidden" dir="rtl">
      {/* Radiant Background Blur elements */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Modern Premium Navigation Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 px-6 py-4 rounded-3xl mb-8 relative z-50">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-wide block">سوق لَمّاح</span>
              <span className="text-[10px] text-slate-500 font-bold block -mt-1">للملازم الجامعية الذكية</span>
            </div>
          </div>

          {/* Quick Links Menu */}
          <nav className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
              className="text-xs md:text-sm font-bold text-slate-350 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/50 transition"
            >
              مساحة العمل
            </button>
            <button 
              onClick={() => router.push("/notebook")}
              className="text-xs md:text-sm font-bold text-slate-350 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/50 transition"
            >
              توليد ملزمة
            </button>
            <button 
              onClick={() => router.push("/plans")}
              className="text-xs md:text-sm font-bold text-slate-350 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800/50 transition"
            >
              شحن الدقائق
            </button>
          </nav>

          {/* User Status / Action Block */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/60 border border-emerald-500/20 px-3.5 py-2 rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-300 font-bold">
                رصيدك: <span className="text-emerald-400 font-black">{quota !== null ? `${quota} دقيقة` : "جاري الجلب..."}</span>
              </span>
            </div>
            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition"
            >
              العودة للرئيسية
            </button>
          </div>
        </header>

        {/* Luxury Digital Storefront Hero Section */}
        <div className="relative bg-gradient-to-br from-[#0c0d23] via-[#090b1e] to-[#040410] border border-indigo-500/15 rounded-[3rem] p-8 md:p-12 mb-12 shadow-3xl overflow-hidden group">
          
          {/* Neon gradient background orbs */}
          <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/15 transition-all duration-700" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-700" />
          
          {/* Subtle line layout */}
          <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/30 to-transparent" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
            <div className="flex-1 space-y-6 text-right">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/35 text-indigo-350 text-xs font-black shadow-inner uppercase tracking-wider animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-400" /> سوق دفاتر لَمّاح الحصري 🌟
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                استكشف واقتنِ <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  أفخر الملازم والملخصات
                </span>
              </h1>
              
              <p className="text-slate-350 text-base md:text-lg max-w-2xl leading-relaxed">
                مرحباً بك في سوق لَمّاح! الوجهة الأولى لطلاب فلسطين للحصول على أفضل الملازم والملخصات الأكاديمية الذكية والمفرغة بالذكاء الاصطناعي بدقة متناهية.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => router.push("/notebook")}
                  className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black px-8 py-4 rounded-2xl transition duration-300 shadow-xl shadow-indigo-950/40 transform active:scale-95 flex items-center gap-2"
                >
                  <Store className="w-5 h-5" /> أنشئ ملزمتك وابدأ جني الأرباح 💸
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-6 py-4 rounded-2xl transition duration-300 font-bold transform active:scale-95 flex items-center gap-2 shadow-md"
                >
                  الذهاب لمساحة العمل
                </button>
              </div>
            </div>

            {/* Stunning Floating Showcase Badge */}
            <div className="w-full lg:w-auto shrink-0 flex items-center justify-center">
              <div className="relative bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 backdrop-blur-md shadow-2xl max-w-xs w-full text-center hover:border-indigo-500/30 transition duration-500">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                  <span className="text-2xl">✍️</span>
                </div>
                
                <h3 className="text-lg font-black text-white mb-2">دفاتر أصلية 100%</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  جميع الملازم المعروضة تم إنشاؤها وتوليدها بواسطة محرك "لمّاح" الذكي من ملفات صوتية وشروح حقيقية للدكاترة.
                </p>
                
                <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-right">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-500">الملازم المتاحة:</span>
                    <span className="text-indigo-400 font-black">{notebooks.length} ملازم</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">معاملات الشراء:</span>
                    <span className="text-purple-400 font-black">آمنة ومحمية 🛡️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creative Top Creators Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-gradient-to-r from-slate-950 via-[#0a0c1a] to-slate-950 border border-indigo-500/10 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl relative overflow-hidden">
            {/* Glow effects */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-350 text-[10px] font-black uppercase tracking-wider">
                  🏆 قائمة المتصدرين
                </span>
                <h3 className="text-lg md:text-xl font-black text-white">
                  نخبة صناع الملازم الأكثر نشاطاً
                </h3>
                <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                  الطلاب الأكثر مساهمة ونشراً للملازم الحصرية والأعلى تقييماً لمساعدة زملائهم في التفوق الدراسي.
                </p>
              </div>

              {/* Sleek Leaderboard Podium Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full lg:w-auto">
                {leaderboard.map((lead, idx) => {
                  const rankColor = idx === 0 ? "from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/20 scale-[1.03]" :
                                    idx === 1 ? "from-slate-200 to-slate-400 text-slate-950 shadow-slate-300/10" :
                                    idx === 2 ? "from-orange-600 to-amber-800 text-white shadow-orange-700/10" :
                                    "from-slate-800 to-slate-900 text-slate-350";
                  
                  const borderStyles = idx === 0 ? "border-amber-400/30 bg-amber-500/[0.03] shadow-amber-500/5" :
                                       idx === 1 ? "border-slate-300/20 bg-slate-300/[0.02]" :
                                       idx === 2 ? "border-orange-600/20 bg-orange-600/[0.01]" :
                                       "border-slate-800/80 bg-slate-900/10";

                  return (
                    <div 
                      key={lead.id}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border ${borderStyles} backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-indigo-500/30`}
                    >
                      {/* Rank Avatar/Badge */}
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${rankColor} flex items-center justify-center text-xs font-black shrink-0 shadow-lg`}>
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-xs text-white block truncate max-w-[110px]" title={lead.name}>
                          {lead.name}
                        </span>
                        <span className="text-[10px] text-slate-450 block mt-0.5 font-bold">
                          {lead.count} {lead.count === 1 ? "ملزمة" : lead.count === 2 ? "ملزمتين" : "ملازم"} ✨
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Custom Search Box */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-2.5 flex items-center gap-3 mb-10 shadow-2xl focus-within:border-indigo-500/40 transition duration-300">
          <div className="p-3 bg-slate-950 rounded-xl">
            <Search className="w-6 h-6 text-indigo-400" />
          </div>
          <input 
            type="text" 
            placeholder="ابحث عن ملزمة، مادة، اسم دكتور، أو موضوع محدد..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-white w-full outline-none text-base md:text-lg placeholder-slate-500 px-2"
          />
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-14 h-14 text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">جاري جلب الملازم وتنسيق العرض الفاخر...</p>
          </div>
        ) : filteredNotebooks.length === 0 ? (

          <div className="text-center py-20 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-850/80 max-w-2xl mx-auto shadow-2xl">
            <BookOpen className="w-16 h-16 text-slate-650 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-black text-slate-350 mb-2">لا توجد ملازم مطابقة لبحثك</h3>
            <p className="text-slate-450 text-sm max-w-md mx-auto leading-relaxed">
              تأكد من كتابة الكلمات المفتاحية بشكل صحيح أو كن أول من يرفع وينشر ملزمته الدراسية لتبدأ في جني الأرباح!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotebooks.map((nb) => {
              const publisherName = nb.student_name || nb.profiles?.full_name || 'طالب متميز';
              const cleanStudentName = publisherName.replace(/\s*\([^)]*\)\s*/g, '');
              
              const uniMatch = nb.student_name?.match(/\(([^)]+)\)/);
              const university = uniMatch ? uniMatch[1] : (nb.description?.match(/الجامعة:\s*([^\n]+)/)?.[1] || 'جامعة فلسطينية');
              
              const titleParts = nb.title?.split(" - ");
              const courseName = titleParts && titleParts.length > 1 ? titleParts[0] : (nb.description?.match(/المساق:\s*([^\n]+)/)?.[1] || 'مساق عام');
              const actualTitle = titleParts && titleParts.length > 1 ? titleParts.slice(1).join(" - ") : nb.title;

              return (
                <div 
                  key={nb.id} 
                  className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/40 transition-all duration-300 group flex flex-col justify-between h-full relative"
                >
                  <div>
                    {/* Top Row: Badges & Price */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {university}
                        </span>
                        <span className="bg-purple-500/10 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          {courseName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-amber-400 font-black text-base flex items-baseline gap-0.5">
                          <span>{nb.price}</span>
                          <span className="text-[10px] text-amber-500/80 font-bold">شيكل</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareNotebook(nb);
                          }}
                          title="مشاركة الملزمة"
                          className="w-8 h-8 rounded-full bg-slate-950/80 hover:bg-indigo-600 border border-slate-800/80 hover:border-indigo-500 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 relative shadow-md"
                        >
                          {copiedNotebookId === nb.id ? (
                            <span className="text-[9px] font-black text-emerald-400">✓ نسخ</span>
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-black text-white leading-snug group-hover:text-indigo-400 transition-colors duration-300 line-clamp-2 mb-3">
                      {actualTitle}
                    </h3>

                    {/* Description */}
                    {nb.description && (
                      <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        {nb.description}
                      </p>
                    )}

                    {/* Covered Topics */}
                    {nb.covered_topics && (
                      <div className="mb-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3">
                        <p className="text-[10px] font-black text-indigo-400 mb-1 tracking-wide uppercase">📖 المادة المشروحة</p>
                        <p className="text-xs text-indigo-200/80 leading-relaxed line-clamp-3">{nb.covered_topics}</p>
                      </div>
                    )}


                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-x-2 gap-y-1.5 text-xs text-slate-400 mb-6 font-medium">
                      <span>📄 {nb.page_count} صفحات</span>
                      <span className="text-slate-700">•</span>
                      <span>👁️ {nb.views_count || 0} معاينة</span>
                      <span className="text-slate-700">•</span>
                      <span>👨‍🏫 د. {nb.teacher_name}</span>
                      <span className="text-slate-700">•</span>
                      <span>👤 {cleanStudentName}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/40">
                    {user && nb.publisher_id === user.id ? (
                      <>
                        <button 
                          onClick={() => {
                            window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}${nb.pdf_url}`, '_blank');
                          }}
                          className="bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/20 font-bold py-2.5 px-2 rounded-xl text-xs flex justify-center items-center gap-1.5 transition-all duration-300"
                        >
                          تحميل ملزمتي 📥
                        </button>
                        <button 
                          onClick={() => handleDeleteNotebook(nb.id)}
                          className="bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white font-bold py-2.5 px-2 rounded-xl text-xs flex justify-center items-center gap-1.5 transition-all duration-300"
                        >
                          حذف من المتجر 🗑️
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handlePreview(nb.id, nb.preview_pdf_url)}
                          className="bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-indigo-400 font-bold py-2.5 px-2 rounded-xl text-xs flex justify-center items-center gap-1.5 border border-slate-850 hover:border-indigo-500/20 transition-all duration-300"
                        >
                          معاينة 📄
                        </button>
                        <button 
                          onClick={() => setSelectedNotebook(nb)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-2 rounded-xl text-xs flex justify-center items-center gap-1.5 shadow-lg hover:shadow-indigo-600/10 transition-all duration-300"
                        >
                          شراء الملزمة
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* STUNNING CUSTOM BUY MODAL */}
        {selectedNotebook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark glass backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={closePurchaseModal}
            />

            {/* Modal Body */}
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">إجراءات شراء ملزمة</h3>
                    <p className="text-xs text-slate-400 mt-0.5">آمن، ومضمون مباشرة للبائعين</p>
                  </div>
                </div>
                <button 
                  onClick={closePurchaseModal}
                  className="bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>

              {purchaseSuccess ? (
                /* Success Layout */
                <div className="text-center py-8 space-y-5">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white">تم إرسال طلب الشراء! 🎉</h4>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                      لقد تم تسجيل حوالتك بنجاح. سيقوم زميلك **({selectedNotebook.profiles?.full_name || 'طالب متميز'})** بالتحقق منها وإرسال النسخة الكاملة لملفاتك فوراً.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 text-xs text-indigo-400/90 font-bold inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> معاملتك آمنة ومحفوظة لدى لمّاح
                  </div>
                  <button 
                    onClick={closePurchaseModal}
                    className="w-full bg-slate-950 hover:bg-slate-850 text-white font-bold py-3.5 rounded-xl transition"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              ) : (
                /* Form/Interactive details */
                <div className="space-y-6">
                  
                  {/* Notebook overview card */}
                  <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-black text-white text-base leading-snug">{selectedNotebook.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">بإشراف الدكتور: <span className="font-bold text-slate-200">{selectedNotebook.teacher_name}</span></p>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 block">السعر المطلوب</span>
                      <span className="text-xl font-black text-indigo-400">₪{selectedNotebook.price}</span>
                    </div>
                  </div>

                  {/* Description segment inside modal */}
                  {selectedNotebook.description && (
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-850 text-xs text-slate-400">
                      <span className="font-bold text-indigo-400 block mb-1">📦 محتوى الملزمة بالتفصيل:</span>
                      {selectedNotebook.description}
                    </div>
                  )}

                  {/* Payment Details Container */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 block">1. حوّل المبلغ إلى محفظة البائع التالية:</label>
                    <div className="bg-gradient-to-r from-indigo-950/20 to-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] text-indigo-400 block font-bold">تفاصيل المحفظة والدفع 💳</span>
                        <code className="text-sm font-mono text-white tracking-wide block">{selectedNotebook.reflect_details}</code>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(selectedNotebook.reflect_details)}
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-indigo-400 animate-bounce" /> تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> نسخ الحساب
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reference input form */}
                  <form onSubmit={handleConfirmPurchase} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 block">2. اكتب اسمك الكامل أو الرقم المرجعي للحوالة للتأكيد:</label>
                      <input 
                        required
                        type="text" 
                        placeholder="مثال: يوسف أحمد - تم التحويل من محفظة كليك..."
                        value={senderName}
                        onChange={e => setSenderName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm transition outline-none"
                      />
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-[10px] text-amber-300 leading-relaxed">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                      <p>
                        بمجرد تأكيد الدفع، سيقوم النظام بإخطار البائع للتحقق من وصول المبلغ. سيتم فتح ملف الـ PDF الأصلي للملزمة بالكامل لتحميلها فور المراجعة!
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingPurchase || !senderName.trim()}
                      className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black py-4 rounded-xl transition shadow-xl shadow-indigo-950/40 flex justify-center items-center gap-2"
                    >
                      {isSubmittingPurchase ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" /> تأكيد الدفع وإشعار البائع
                        </>
                      )}
                    </button>
                  </form>

                </div>
              )}

            </div>
          </div>
        )}

        {/* 3D INTERACTIVE NOTEBOOK SIMULATOR OVERLAY */}
        {interactivePreviewNotebook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            
            {/* Dark glass backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setInteractivePreviewNotebook(null)}
            />

            {/* Modal Container */}
            <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6 border-b border-slate-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                    <Sparkles className="w-6 h-6 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">المحاكي التفاعلي لدفاتر لمّاح الذكية 📝✨</h3>
                    <p className="text-xs text-slate-400 mt-0.5">شاهد كيف يقرأ لمّاح كلام الدكتور الشفوي ويصنع منه دفتراً فاخراً مقارنةً بالشرائح الجافة!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setInteractivePreviewNotebook(null)}
                  className="bg-slate-950/80 text-slate-455 hover:text-white border border-slate-855 w-8 h-8 rounded-full flex items-center justify-center transition font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Simulated Open Physical Book */}
              <div className="grid lg:grid-cols-2 gap-0.5 bg-slate-950/60 p-4 rounded-[2rem] border border-slate-850 shadow-inner relative">
                
                {/* Center Spine Ring Binder simulation */}
                <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 flex-col justify-between py-12 pointer-events-none z-30">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-6 h-3 bg-gradient-to-r from-slate-700 via-amber-600 to-slate-700 rounded-full border border-slate-950 shadow-md transform rotate-12" />
                  ))}
                </div>

                {/* LEFT PAGE: Dry boring Lecture Slide */}
                <div className="bg-slate-100 text-slate-800 rounded-r-[1.5rem] lg:rounded-r-[1.5rem] rounded-l-none p-6 md:p-8 min-h-[460px] flex flex-col justify-between border-l border-slate-300 relative shadow-md">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2 text-[10px] text-slate-500 font-bold">
                      <span>شريحة المحاضرة رقم 3</span>
                      <span className="bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded font-black">جافة ومختصرة ❌</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-slate-900">Topic: Artificial Intelligence (AI)</h4>
                      <ul className="space-y-3 text-slate-700 text-sm list-disc pl-4 pr-1 leading-relaxed">
                        <li>AI definition: Simulation of human intelligence by machines.</li>
                        <li>Key subfields: Machine Learning (ML), Deep Learning, Natural Language Processing (NLP).</li>
                        <li>Applications: Robotics, autonomous vehicles, healthcare imaging systems, decision making models.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 bg-rose-500/5 border border-rose-300/40 p-4 rounded-xl text-slate-700 text-xs leading-relaxed text-right">
                    <span className="font-black text-rose-600 block mb-1">⚠️ مشكلة الشرائح:</span>
                    الشرائح تحتوي فقط على عناوين عامة ولا تذكر كلام الدكتور المهم، وتأتي باللغة الإنجليزية كاملة، مما يجعل دراستها صعبة جداً للامتحان!
                  </div>
                </div>

                {/* RIGHT PAGE: Glowing rule classic annotated handwriting notebook */}
                <div className="bg-[#FAF8F5] text-slate-800 rounded-l-[1.5rem] lg:rounded-l-[1.5rem] rounded-r-none p-6 md:p-8 min-h-[460px] flex flex-col justify-between relative shadow-md overflow-hidden">
                  
                  {/* RTL Double Margin line for classic notebook */}
                  <div className="absolute right-[50px] top-0 bottom-0 w-[1.5px] bg-rose-200/80" />

                  {/* Rule Line Grid */}
                  <div className="absolute inset-0 flex flex-col justify-between py-14 pointer-events-none px-4">
                    {Array.from({ length: 14 }).map((_, idx) => (
                      <div key={idx} className="w-full border-b border-dashed border-amber-200/40 h-[30px]" />
                    ))}
                  </div>

                  {/* Simulated Handwritten Notebook Content */}
                  <div className="relative z-10 space-y-6 pr-10 pl-2">
                    <div className="flex justify-between items-center border-b border-amber-900/10 pb-2 text-[10px] text-amber-900/60 font-bold font-mono">
                      <span>التاريخ: {new Date().toLocaleDateString("ar-EG")}</span>
                      <span className="bg-indigo-500/10 text-indigo-700 px-2 py-0.5 rounded font-black">دفتر لمّاح الذكي بالخط اليدوي العربي 📝✨</span>
                    </div>

                    <div className="space-y-4 font-serif">
                      <h4 className="text-amber-950 font-black text-lg">مفهوم الذكاء الاصطناعي (AI) 🧠</h4>
                      
                      <p className="text-xs md:text-sm font-medium leading-relaxed text-slate-800">
                        الذكاء الاصطناعي هو محاكاة الأنظمة للحاسوب والتفكير البشري. ركّز الدكتور على <span className="bg-yellow-200/80 px-1 py-0.5 rounded border border-yellow-350 font-bold text-amber-950">Machine Learning</span> بأنه الفرع الأهم لأنه يتيح للآلة التعلم التلقائي من البيانات دون برمجة صريحة.
                      </p>

                      {/* Sticky handwritten note for teacher explanations */}
                      <div className="bg-[#FFF9E6] border border-amber-300 p-4 rounded-xl space-y-2 text-slate-800 relative shadow-sm rotate-[-1deg]">
                        <div className="absolute -top-3 -left-2 bg-rose-450 text-[8px] text-white font-black px-2 py-0.5 rounded shadow">
                          🎙️ كلام الدكتور الشفوي المهم!
                        </div>
                        <p className="text-[11px] font-bold leading-relaxed text-amber-950 pt-1">
                          "يا طلاب، ركزوا تماماً: في الامتحان سأسأل عن الفرق الجوهري بين الذكاء الاصطناعي العام والخاص. الخاص هو الموجود حالياً كتحليل صور الرنين بالمستشفيات، أما العام الذي يطابق عقل الإنسان غير موجود بعد!"
                        </p>
                      </div>

                      <p className="text-xs md:text-sm font-medium leading-relaxed text-slate-800">
                        كذلك أشار الدكتور إلى فئة <span className="bg-yellow-200/80 px-1 py-0.5 rounded border border-yellow-350 font-bold text-amber-950">NLP</span> لتفسير اللغات، وأكد أن التطبيقات الحالية في السيارات ذاتية القيادة تجمع كل هذه التخصصات.
                      </p>
                    </div>
                  </div>

                  {/* Footer Signature */}
                  <div className="relative z-10 pt-4 border-t border-amber-900/10 text-[9px] text-amber-900/60 font-bold font-mono flex justify-between items-center mt-6">
                    <span>عدد الصفحات المطبوع: {interactivePreviewNotebook.page_count} صفحات</span>
                    <span className="text-indigo-700">✍️ إعداد الطالب المتفوق: {interactivePreviewNotebook.student_name || interactivePreviewNotebook.profiles?.full_name || "طالب متميز"}</span>
                  </div>
                </div>

              </div>

              {/* Call to Actions inside simulator */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
                <div className="text-right">
                  <p className="text-xs text-slate-400">ملزمة: <span className="font-bold text-white">{interactivePreviewNotebook.title}</span></p>
                  <p className="text-xs text-amber-400 font-black mt-0.5">💰 سعر الشراء: ₪{interactivePreviewNotebook.price}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setInteractivePreviewNotebook(null);
                      setSelectedNotebook(interactivePreviewNotebook);
                    }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black px-6 py-3 rounded-xl text-sm transition shadow-lg hover:shadow-indigo-500/20"
                  >
                    🛒 شراء هذه الملزمة الفخمة الآن
                  </button>
                  <button 
                    onClick={() => setInteractivePreviewNotebook(null)}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white px-6 py-3 rounded-xl text-sm font-bold transition"
                  >
                    إغلاق المعاينة التفاعلية
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

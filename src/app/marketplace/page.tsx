"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Store, BookOpen, Search, Loader2, Eye, ShoppingCart, 
  User, Coins, Copy, Check, Info, ArrowLeft, ArrowRight, Calendar, 
  Sparkles, CheckCircle2, ShieldCheck, Package, Crown, History, Trash2, GraduationCap, Share2, FileText,
  Plus, LayoutDashboard, Lock, Clock, CheckCircle, XCircle, Bell, Download, RefreshCw, X,
  Laptop, Stethoscope, TrendingUp, Scale, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Layers
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

interface AcademicCategory {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  badgeBg: string;
  badgeText: string;
  subtitle: string;
  matcher: RegExp;
}

const ACADEMIC_CATEGORIES: AcademicCategory[] = [
  {
    id: "tech_engineering",
    name: "الهندسة وتكنولوجيا المعلومات",
    shortName: "هندسة وتكنولوجيا",
    icon: Laptop,
    badgeBg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200/80 dark:border-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
    subtitle: "برمجة، شبكات، ذكاء اصطناعي، وتحليل بيانات",
    matcher: /بيانات|data|برمج|حاسوب|computer|هندس|خوارزم|software|ai|ذكاء|شبكات|network|ويب|web|تقني|tech|اتصالات|كهربا|ميكانيك|معمار|مدني|سحابي|cloud|كود|code|python|java|sql/i
  },
  {
    id: "health_medical",
    name: "العلوم الطبية والصحية والصيدلة",
    shortName: "طب وصيدلة",
    icon: Stethoscope,
    badgeBg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    subtitle: "طب بشري، أسنان، صيدلة، تمريض، ومختبرات",
    matcher: /طب|صيدل|تمريض|تشريح|أدوية|فارما|pharma|med|علاج|مخبر|biolog|أحياء|كيمياء حيوية|فسيولوجي|جراحة|باثولوجي|pathology|anatomy|وراثة/i
  },
  {
    id: "business_economics",
    name: "الأعمال والعلوم المالية والإدارية",
    shortName: "إدارة وأعمال",
    icon: TrendingUp,
    badgeBg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300",
    subtitle: "إدارة أعمال، محاسبة، تسويق، واقتصاد",
    matcher: /إدار|محاسب|تسويق|اقتصاد|مالي|business|finance|accounting|ماركت|مصارف|استثمار|ريادة|تجارة|إحصاء|تمويل/i
  },
  {
    id: "humanities_law",
    name: "القانون واللغات والعلوم الإنسانية",
    shortName: "قانون ولغات",
    icon: Scale,
    badgeBg: "bg-purple-50 dark:bg-purple-500/10 border-purple-200/80 dark:border-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-300",
    subtitle: "شريعة وقانون، لغات وترجمة، إعلام وعلم نفس",
    matcher: /قانون|حقوق|شريع|فقه|عرب|انجليز|english|إعلام|صحاف|ترجم|نفس|اجتماع|تربية|فلسفة|أدب/i
  },
  {
    id: "general",
    name: "المتطلبات والمساقات العامة",
    shortName: "مساقات عامة",
    icon: BookOpen,
    badgeBg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/20",
    badgeText: "text-rose-700 dark:text-rose-300",
    subtitle: "متطلبات الجامعة الإجبارية والاختيارية، ثقافة وتاريخ",
    matcher: /متطلب|عام|ثقاف|تاريخ|حضار|وطني|ريادة مجتمعية|مهارات/i
  }
];

const getNotebookCategory = (nb: any): string => {
  if (nb.category && ACADEMIC_CATEGORIES.some(c => c.id === nb.category)) {
    return nb.category;
  }
  const textToScan = `${nb.title || ""} ${nb.description || ""} ${nb.covered_topics || ""} ${nb.teacher_name || ""}`;
  for (const cat of ACADEMIC_CATEGORIES) {
    if (cat.matcher.test(textToScan)) {
      return cat.id;
    }
  }
  return "general";
};

interface NotebookCardProps {
  nb: any;
  user: any;
  isMyNotebook: boolean;
  copiedNotebookId: string | null;
  onShare: (nb: any) => void;
  onPreview: (id: string, url: string) => void;
  onPurchase: (nb: any) => void;
  onDelete: (id: string) => void;
  className?: string;
}

function NotebookCard({
  nb,
  user,
  isMyNotebook,
  copiedNotebookId,
  onShare,
  onPreview,
  onPurchase,
  onDelete,
  className = ""
}: NotebookCardProps) {
  const publisherName = nb.student_name || nb.profiles?.full_name || 'طالب متميز';
  const cleanStudentName = publisherName.replace(/\s*\([^)]*\)\s*/g, '').replace(/@\w+/g, '').trim() || 'طالب متميز';
  const authorName = nb.author_name || cleanStudentName;
  
  let authorUsername = nb.author_username || nb.publisher_username || "";
  if (!authorUsername && nb.student_name && nb.student_name.includes("@")) {
    const match = nb.student_name.match(/@([a-zA-Z0-9_]+)/);
    if (match) authorUsername = match[1];
  }
  
  const uniMatch = nb.student_name?.match(/\(([^)]+)\)/);
  const university = uniMatch ? uniMatch[1] : (nb.description?.match(/الجامعة:\s*([^\n]+)/)?.[1] || 'جامعة فلسطينية');
  
  const titleParts = nb.title?.split(" - ");
  const hasPrefix = titleParts && titleParts.length > 1;
  const rawCourse = hasPrefix ? titleParts[0].trim() : (nb.description?.match(/المساق:\s*([^\n]+)/)?.[1] || '');
  const courseName = isNaN(Number(rawCourse)) ? rawCourse : '';
  const actualTitle = hasPrefix 
    ? (isNaN(Number(rawCourse)) ? titleParts.slice(1).join(" - ").trim() : nb.title)
    : nb.title;

  const rawDesc = nb.covered_topics || nb.description || "";
  const cleanDescription = rawDesc
    .replace(/🏫\s*الجامعة:[^\n]*\n?/g, "")
    .replace(/📚\s*المساق:[^\n]*\n?/g, "")
    .trim();

  return (
    <div 
      className={`bg-white dark:bg-[#0c111d] rounded-2xl border transition-all duration-200 flex flex-col justify-between h-full relative group overflow-hidden ${
        isMyNotebook 
          ? "border-r-4 border-r-amber-500 border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md" 
          : "border-r-4 border-r-indigo-500 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md"
      } ${className}`}
    >
      <div className="relative z-10 flex flex-col h-full p-4 sm:p-5">
        
        {/* Header Row: University Name & Price Ticket */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {isMyNotebook ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200/80 dark:border-amber-500/20">
                <span>دفتري المنشور</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[170px]" title={university}>
                {university}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Price Badge */}
            <div className="flex items-center gap-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-2.5 py-0.5 rounded-lg font-bold text-xs shadow-2xs">
              <span className="text-xs sm:text-sm font-black">{nb.price}</span>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">₪</span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(nb);
              }}
              title="مشاركة الدفتر"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              {copiedNotebookId === nb.id ? (
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">✓</span>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Course Code / Tag */}
        {courseName && courseName !== "مساق عام" && (
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 truncate">
              {courseName}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {actualTitle}
        </h3>

        {/* Description */}
        {cleanDescription && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mt-1.5">
            {cleanDescription}
          </p>
        )}

        {/* Academic Docket: Student Note-taker & Supervising Professor */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-slate-400">تدوين:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {authorName}
            </span>
            {authorUsername && (
              <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                @{authorUsername}
              </span>
            )}
          </div>

          {nb.teacher_name && (
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/60 shrink-0">
              د. {nb.teacher_name}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: Metadata & Actions */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <span>{nb.page_count} صفحة • {nb.views_count || 0} قراءة</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              A4 • موثق
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {isMyNotebook ? (
              <>
                <button 
                  onClick={() => {
                    window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}${nb.pdf_url}`, '_blank');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل نسختي</span>
                </button>
                <button 
                  onClick={() => onDelete(nb.id)}
                  className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-bold py-2 px-2.5 rounded-xl text-xs flex justify-center items-center gap-1 transition cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الدفتر</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onPreview(nb.id, nb.preview_pdf_url)}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 px-2.5 rounded-xl text-xs flex justify-center items-center gap-1 border border-slate-200/80 dark:border-slate-700/80 transition cursor-pointer active:scale-95"
                >
                  <span>معاينة الدفتر</span>
                </button>
                <button 
                  onClick={() => onPurchase(nb)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 shadow-2xs transition cursor-pointer active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>اقتناء ({nb.price} ₪)</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function HorizontalCategoryTrack({
  category,
  notebooks,
  user,
  copiedNotebookId,
  onShare,
  onPreview,
  onPurchase,
  onDelete,
  onViewAll
}: {
  category: AcademicCategory;
  notebooks: any[];
  user: any;
  copiedNotebookId: string | null;
  onShare: (nb: any) => void;
  onPreview: (id: string, url: string) => void;
  onPurchase: (nb: any) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "next" | "prev") => {
    if (!rowRef.current) return;
    const offset = direction === "next" ? -340 : 340;
    rowRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="space-y-3">
      {/* Clean Category Shelf Header (No cluttered icon box) */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              <span className="sm:hidden">{category.shortName}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold shrink-0">
              {notebooks.length} {notebooks.length === 1 ? "دفتر" : notebooks.length === 2 ? "دفترين" : "دفاتر"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block mt-0.5">
            {category.subtitle}
          </p>
        </div>

        {/* Action & Desktop Scroll Navigation */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded transition cursor-pointer flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Desktop Arrow Buttons */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => handleScroll("prev")}
              title="السابق"
              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("next")}
              title="التالي"
              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={rowRef}
        className="flex gap-3.5 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-3 pt-1 snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {notebooks.map((nb) => (
          <div key={nb.id} className="w-[285px] sm:w-[325px] shrink-0 snap-start">
            <NotebookCard
              nb={nb}
              user={user}
              isMyNotebook={Boolean(user && nb.publisher_id === user.id)}
              copiedNotebookId={copiedNotebookId}
              onShare={onShare}
              onPreview={onPreview}
              onPurchase={onPurchase}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MarketplacePage() {
  const router = useRouter();
  const { session, user, loading, signOut } = useAuth();
  const [quota, setQuota] = useState<number | null>(null);
  
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMineOnly, setFilterMineOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showMobileLeaderboard, setShowMobileLeaderboard] = useState<boolean>(false);
  const [selectedNotebook, setSelectedNotebook] = useState<any | null>(null);
  const [interactivePreviewNotebook, setInteractivePreviewNotebook] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedNotebookId, setCopiedNotebookId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);

  // P2P Order Tabs & Data
  const [activeTab, setActiveTab] = useState<"browse" | "my_purchases" | "seller_orders">("browse");
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [sellerMetrics, setSellerMetrics] = useState<{ pending_count: number; approved_count: number; total_earnings: number }>({
    pending_count: 0,
    approved_count: 0,
    total_earnings: 0
  });
  const [loadingSellerOrders, setLoadingSellerOrders] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

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
    if (session) {
      fetchPurchases();
      fetchSellerOrders();
    }
  }, [session]);

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
    const counts: Record<string, { count: number; name: string; username: string; id: string }> = {};
    notebooks.forEach((nb) => {
      const pubId = nb.publisher_id || "unknown";
      
      let name = nb.author_name || nb.profiles?.full_name || nb.student_name || "طالب متميز";
      name = name.trim();
      if (!name || name.toLowerCase() === "free" || name.toLowerCase() === "مجاني") {
        name = "طالب متميز";
      }

      let username = nb.author_username || nb.publisher_username || "";
      if (!username && nb.student_name && nb.student_name.includes("@")) {
        const match = nb.student_name.match(/@([a-zA-Z0-9_]+)/);
        if (match) username = match[1];
      }

      if (!counts[pubId]) {
        counts[pubId] = { count: 0, name, username, id: pubId };
      } else {
        if (name && name !== "طالب متميز") {
          counts[pubId].name = name;
        }
        if (username) {
          counts[pubId].username = username;
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
    const cleanName = nb.author_name || (nb.student_name || "").split("(")[0].trim() || nb.profiles?.full_name || "طالب متميز";
    const usernameTag = (nb.author_username || nb.publisher_username) ? ` (@${nb.author_username || nb.publisher_username})` : "";
    const shareUrl = `${window.location.origin}/marketplace?search=${encodeURIComponent(nb.title)}`;
    const shareText = `يا هلا! 👋 شوف هاد الدفتر الفخم والذكي على منصة لمّاح: 📚 *${nb.title}* \nتفريغ احترافي ومساق مع الدكتور *${nb.teacher_name}* إعداد صاحب الدفتر *${cleanName}*${usernameTag}. \nافتح الرابط وشوف المعاينة مجاناً واطلبها بثواني: ${shareUrl} 🚀✨`;
    
    navigator.clipboard.writeText(shareText);
    setCopiedNotebookId(nb.id);
    setTimeout(() => setCopiedNotebookId(null), 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fetchPurchases = async () => {
    if (!session) return;
    setLoadingPurchases(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/my-purchases`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setMyPurchases(data.purchases || []);
      }
    } catch (e) {
      console.error("Failed to fetch purchases:", e);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const fetchSellerOrders = async () => {
    if (!session) return;
    setLoadingSellerOrders(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/seller-orders`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (data.status === "success") {
        setSellerOrders(data.orders || []);
        setSellerMetrics({
          pending_count: data.pending_count || 0,
          approved_count: data.approved_count || 0,
          total_earnings: data.total_earnings || 0
        });
      }
    } catch (e) {
      console.error("Failed to fetch seller orders:", e);
    } finally {
      setLoadingSellerOrders(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!session) return;
    if (!confirm("هل تأكدت من وصول الحوالة لحسابك وتريد فتح الدفتر المرخص للطالب فوراً؟")) return;
    setActionInProgress(orderId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/order/${orderId}/approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        alert(data.message || "تم تأكيد الحوالة بنجاح!");
        fetchSellerOrders();
        fetchNotebooks();
      } else {
        alert(data.detail || "تعذر تأكيد الطلب.");
      }
    } catch (e) {
      alert("حدث خطأ أثناء تأكيد الطلب.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!session) return;
    if (!confirm("هل أنت متأكد من رغبتك في رفض هذا الطلب؟")) return;
    setActionInProgress(orderId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/order/${orderId}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        alert(data.message || "تم رفض الطلب.");
        fetchSellerOrders();
      } else {
        alert(data.detail || "تعذر رفض الطلب.");
      }
    } catch (e) {
      alert("حدث خطأ أثناء رفض الطلب.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !selectedNotebook) return;
    if (!session) {
      alert("يرجى تسجيل الدخول أولاً لتتمكن من إتمام عملية الشراء وحفظ الدفتر المرخص في حسابك.");
      return;
    }

    setIsSubmittingPurchase(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/purchase-request`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          notebook_id: selectedNotebook.id,
          sender_name: senderName.trim(),
          reference_code: referenceCode.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setPurchaseSuccess(true);
        fetchPurchases();
        fetchSellerOrders();
      } else {
        alert(data.detail || "تعذر إرسال طلب الشراء، يرجى المحاولة مجدداً.");
      }
    } catch (err) {
      console.error("Purchase submit failed:", err);
      alert("حدث خطأ أثناء إرسال طلب الشراء.");
    } finally {
      setIsSubmittingPurchase(false);
    }
  };

  const openPurchaseModal = (nb: any) => {
    setSelectedNotebook(nb);
    setPurchaseSuccess(false);
    const defaultName = (user as any)?.user_metadata?.full_name || (user as any)?.user_metadata?.name || "";
    if (defaultName && !senderName) {
      setSenderName(defaultName);
    }
  };

  const closePurchaseModal = () => {
    setSelectedNotebook(null);
    setPurchaseSuccess(false);
    setSenderName("");
    setReferenceCode("");
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (!session) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الدفتر من المتجر؟")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/${notebookId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        alert("تم حذف الدفتر من المتجر بنجاح.");
        fetchNotebooks();
      } else {
        const err = await res.json();
        alert(err.detail || "فشل حذف الدفتر.");
      }
    } catch (e) {
      console.error("Failed to delete notebook:", e);
      alert("حدث خطأ أثناء محاولة حذف الدفتر.");
    }
  };

  const searchedNotebooks = useMemo(() => {
    return notebooks.filter(n => {
      return (
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        (n.teacher_name && n.teacher_name.toLowerCase().includes(search.toLowerCase())) ||
        (n.description && n.description.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [notebooks, search]);

  const filteredNotebooks = useMemo(() => {
    if ((selectedCategory === "my_notebooks" || filterMineOnly) && user) {
      return searchedNotebooks.filter(n => n.publisher_id === user.id);
    }
    return searchedNotebooks;
  }, [searchedNotebooks, selectedCategory, filterMineOnly, user]);

  const notebooksByCategory = useMemo(() => {
    const mapping: Record<string, any[]> = {};
    ACADEMIC_CATEGORIES.forEach(cat => {
      mapping[cat.id] = [];
    });
    
    searchedNotebooks.forEach(nb => {
      const catId = getNotebookCategory(nb);
      if (!mapping[catId]) {
        mapping[catId] = [];
      }
      mapping[catId].push(nb);
    });
    
    return mapping;
  }, [searchedNotebooks]);

  const categoriesWithNotebooks = useMemo(() => {
    return ACADEMIC_CATEGORIES.filter(
      cat => (notebooksByCategory[cat.id]?.length || 0) > 0
    );
  }, [notebooksByCategory]);

  const activeCategoryObject = useMemo(() => {
    return ACADEMIC_CATEGORIES.find(c => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const myNotebooksCount = user ? notebooks.filter(n => n.publisher_id === user.id).length : 0;

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300 font-sans"
      dir="rtl"
    >
      {/* Main Inner Tab App Header */}
      <AppHeader quota={quota} activePage="marketplace" />

      <div className="flex-1 px-4 sm:px-6 pt-4 sm:pt-6 pb-16 max-w-7xl mx-auto w-full relative z-10 space-y-5 sm:space-y-6">

        {/* Cohesive Editorial Header & Ledger */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5 p-5 lg:p-6 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
          {/* Masthead Left: Title & Value Proposition */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">
                سوق دفاتر لَمّاح الجامعية
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                دفاتر ومذكرات دراسية موثوقة من إعداد الطلبة
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                تصفح واقتنِ أفضل التلخيصات لمساقاتك الدراسية، مع إمكانية نشر وتجارة دفاترك الذكية وجني الأرباح.
              </p>
            </div>

            {/* Harmonious Ledger Ticker */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">الدفاتر المتاحة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{notebooks.length} دفتر معتمد</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">الجودة:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">A4 موثق ومُدقق</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">الترخيص:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">تحويل فوري عبر ريفلكت</span>
              </div>
            </div>
          </div>

          {/* Fast Action Box */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                هل تملك تفريغات لمادتك؟
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                انشر دفترك الخاص الآن في السوق وابدأ بجني الأرباح عبر محفظتك مباشرة.
              </p>
            </div>

            <div className="pt-3 flex items-center gap-2">
              <Link
                href="/notebook"
                prefetch={true}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition active:scale-95 shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>نشر دفتر جديد</span>
              </Link>
              <Link
                href="/dashboard"
                prefetch={true}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer flex items-center gap-1"
                title="العودة للوحة المذاكرة"
              >
                <span className="text-xs font-bold">لوحة المذاكرة</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Clean Search & Navigation Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-2xs focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition duration-150">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="ابحث عن دفتر، مساق، دكتور..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (activeTab !== "browse") setActiveTab("browse");
              }}
              className="bg-transparent border-none text-slate-900 dark:text-white w-full outline-none text-xs sm:text-sm placeholder-slate-400 dark:placeholder-slate-500 font-medium"
            />
            {search && (
              <button 
                type="button" 
                onClick={() => setSearch("")}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Sub-tabs Segmented Control + Publish CTA (Hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("browse")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "browse"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>تصفح المتجر</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {notebooks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("my_purchases");
                  fetchPurchases();
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "my_purchases"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>مشترياتي</span>
                {myPurchases.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    {myPurchases.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("seller_orders");
                  fetchSellerOrders();
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer relative ${
                  activeTab === "seller_orders"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>طلبات البيع</span>
                {sellerMetrics.pending_count > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black animate-pulse">
                    {sellerMetrics.pending_count} جديد
                  </span>
                ) : sellerOrders.length > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                    {sellerOrders.length}
                  </span>
                ) : null}
              </button>
            </div>

            {/* Desktop Publish Action CTA */}
            <Link
              href="/notebook"
              prefetch={true}
              className="hidden lg:flex items-center gap-1.5 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>نشر دفتر ₪</span>
            </Link>
          </div>
        </div>

        {/* Tab 1: Browse Marketplace */}
        {activeTab === "browse" && (
          <>
            <div className="space-y-4">

              {/* Clean Typography-Led Category Tabs (No visual icon clutter) */}
              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-slate-200 dark:border-slate-800">
                {/* Publish Notebook Button (Mobile Only) */}
                <Link
                  href="/notebook"
                  prefetch={true}
                  className="lg:hidden px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer bg-indigo-600 text-white shadow-2xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>نشر دفتر ₪</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-2 text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer border-b-2 -mb-[1px] ${
                    selectedCategory === "all"
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>كافة الأقسام</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    selectedCategory === "all" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {notebooks.length}
                  </span>
                </button>

                {ACADEMIC_CATEGORIES.map(cat => {
                  const count = notebooksByCategory[cat.id]?.length || 0;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-2 text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer border-b-2 -mb-[1px] ${
                        isSelected
                          ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-black"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>{cat.shortName}</span>
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isSelected ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {user && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === "my_notebooks" ? "all" : "my_notebooks")}
                      className={`px-3.5 py-2 text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer border-b-2 -mb-[1px] ${
                        selectedCategory === "my_notebooks"
                          ? "border-amber-500 text-amber-600 dark:text-amber-400 font-black"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>دفاتري المنشورة</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        selectedCategory === "my_notebooks" ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {myNotebooksCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("my_purchases");
                        fetchPurchases();
                      }}
                      className="lg:hidden px-3 py-2 text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900"
                    >
                      <span>مشترياتي</span>
                      {myPurchases.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                          {myPurchases.length}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("seller_orders");
                        fetchSellerOrders();
                      }}
                      className="lg:hidden px-3 py-2 text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 relative"
                    >
                      <span>طلبات البيع</span>
                      {sellerMetrics.pending_count > 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black animate-pulse">
                          {sellerMetrics.pending_count}
                        </span>
                      ) : sellerOrders.length > 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {sellerOrders.length}
                        </span>
                      ) : null}
                    </button>
                  </>
                )}
              </div>
            </div>


            {/* Content Section */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 h-[340px] animate-pulse flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
                    </div>
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/40 rounded" />
                      <div className="h-9 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotebooks.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#0c111d] rounded-3xl border border-slate-200/90 dark:border-slate-800 max-w-xl mx-auto shadow-xs p-8">
                <BookOpen className="w-14 h-14 text-indigo-500/40 mx-auto mb-3" />
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-2">
                  {filterMineOnly ? "لم تقم بنشر أي دفتر حتى الآن" : "لا توجد دفاتر مطابقة لبحثك"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-4">
                  {filterMineOnly 
                    ? "شارك دفاتر دراستك مع زملائك في الجامعات وابدأ بجني الأرباح عبر محفظتك!"
                    : "تأكد من كتابة الكلمات المفتاحية بشكل صحيح أو تصفح باقي الدفاتر."}
                </p>
                {filterMineOnly && (
                  <Link
                    href="/notebook"
                    prefetch={true}
                    className="inline-block px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                  >
                    أنشئ دفترك الآن
                  </Link>
                )}
              </div>
            ) : selectedCategory === "my_notebooks" ? (
              /* User's Published Notebooks Grid View */
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0c111d] border border-amber-200/80 dark:border-amber-500/20 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-amber-50 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20 text-amber-700 dark:text-amber-300">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                          دفاتري المنشورة في المتجر
                        </h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 text-amber-700 dark:text-amber-400">
                          {filteredNotebooks.length} دفتر
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        الدفاتر والملخصات التي قمت بنشرها لمساعدة زملائك وجني الأرباح
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>عرض جميع الدفاتر</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredNotebooks.map(nb => (
                    <NotebookCard
                      key={nb.id}
                      nb={nb}
                      user={user}
                      isMyNotebook={true}
                      copiedNotebookId={copiedNotebookId}
                      onShare={handleShareNotebook}
                      onPreview={handlePreview}
                      onPurchase={openPurchaseModal}
                      onDelete={handleDeleteNotebook}
                    />
                  ))}
                </div>
              </div>
            ) : selectedCategory !== "all" ? (
              /* Focused Single Category Grid View */
              <div className="space-y-4">
                {activeCategoryObject && (
                  <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${activeCategoryObject.badgeBg} ${activeCategoryObject.badgeText}`}>
                        {React.createElement(activeCategoryObject.icon, { className: "w-5 h-5" })}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-black text-slate-900 dark:text-white">
                            {activeCategoryObject.name}
                          </h2>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${activeCategoryObject.badgeBg} ${activeCategoryObject.badgeText}`}>
                            {notebooksByCategory[activeCategoryObject.id]?.length || 0} دفتر
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {activeCategoryObject.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>عرض جميع الفئات</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {(notebooksByCategory[selectedCategory] || []).length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#0c111d] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6">
                    <BookOpen className="w-12 h-12 text-slate-400/40 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      لا توجد دفاتر في هذه الفئة حالياً.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {(notebooksByCategory[selectedCategory] || []).map(nb => (
                      <NotebookCard
                        key={nb.id}
                        nb={nb}
                        user={user}
                        isMyNotebook={Boolean(user && nb.publisher_id === user.id)}
                        copiedNotebookId={copiedNotebookId}
                        onShare={handleShareNotebook}
                        onPreview={handlePreview}
                        onPurchase={openPurchaseModal}
                        onDelete={handleDeleteNotebook}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (search.trim() !== "" || filterMineOnly) ? (
              /* Search / Mine Filter Grid View */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {search ? `نتائج البحث عن "${search}":` : "دفاتري المنشورة في المتجر:"} ({filteredNotebooks.length} دفتر)
                  </span>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      إلغاء البحث
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredNotebooks.map(nb => (
                    <NotebookCard
                      key={nb.id}
                      nb={nb}
                      user={user}
                      isMyNotebook={Boolean(user && nb.publisher_id === user.id)}
                      copiedNotebookId={copiedNotebookId}
                      onShare={handleShareNotebook}
                      onPreview={handlePreview}
                      onPurchase={openPurchaseModal}
                      onDelete={handleDeleteNotebook}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Default Categorized Horizontal Rows */
              <div className="space-y-8 sm:space-y-10">
                {categoriesWithNotebooks.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#0c111d] rounded-3xl border border-slate-200/90 dark:border-slate-800 max-w-xl mx-auto shadow-xs p-8">
                    <BookOpen className="w-14 h-14 text-indigo-500/40 mx-auto mb-3" />
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2">
                      لا توجد دفاتر منشورة حالياً في المتجر
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      كن أول من ينشر دفتره الدراسي واكسب أرباحاً حقيقية!
                    </p>
                  </div>
                ) : (
                  categoriesWithNotebooks.map(cat => (
                    <HorizontalCategoryTrack
                      key={cat.id}
                      category={cat}
                      notebooks={notebooksByCategory[cat.id] || []}
                      user={user}
                      copiedNotebookId={copiedNotebookId}
                      onShare={handleShareNotebook}
                      onPreview={handlePreview}
                      onPurchase={openPurchaseModal}
                      onDelete={handleDeleteNotebook}
                      onViewAll={() => setSelectedCategory(cat.id)}
                    />
                  ))
                )}

                {/* Desktop Hall of Fame Leaderboard (At the bottom of browsing experience) */}
                {leaderboard.length > 0 && (
                  <div className="hidden lg:block pt-8 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="rounded-xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs relative overflow-hidden">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        <div className="space-y-1 max-w-md">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            أكثر صناع الدفاتر نشاطاً في الجامعات
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            الطلبة الأكثر تدويناً للمذكرات المعتمدة لمساندة زملائهم في الدراسة.
                          </p>
                        </div>

                        {/* Precision Honors Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full lg:w-auto">
                          {leaderboard.map((lead, idx) => {
                            const isTop = idx === 0;
                            return (
                              <div
                                key={lead.id}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                                  isTop 
                                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-2xs" 
                                    : "bg-slate-50 dark:bg-slate-850/60 border-slate-200/80 dark:border-slate-750 text-slate-900 dark:text-slate-100"
                                }`}
                              >
                                <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                                  isTop ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-950" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                }`}>
                                  #{idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs block truncate max-w-[95px]" title={lead.name}>
                                    {lead.name}
                                  </span>
                                  <span className={`text-[10px] font-mono block ${isTop ? "text-slate-300 dark:text-slate-600" : "text-slate-400"}`}>
                                    {lead.count} {lead.count === 1 ? "دفتر" : lead.count === 2 ? "دفترين" : "دفاتر"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab 2: My Purchased Notebooks */}
        {activeTab === "my_purchases" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("browse")}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="العودة للمتجر"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    مشترياتي ودفاتري المرخصة 📚
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    الدفاتر التي قمت بطلبها من زملائك، مع روابط التحميل والنسخ الموسومة بعلامتك المائية المانعة للتسريب.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("browse")}
                  className="hidden lg:flex px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 items-center gap-1.5 transition cursor-pointer"
                >
                  <span>تصفح المتجر</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={fetchPurchases}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPurchases ? "animate-spin" : ""}`} />
                  تحديث
                </button>
              </div>
            </div>

            {loadingPurchases ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : myPurchases.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto">
                <BookOpen className="w-14 h-14 text-indigo-500/40 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">لم تقم بشراء أي دفتر بعد</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  تصفح الدفاتر المميزة المعروضة من زملائك في المتجر واطلب ما يناسب دراستك الآن.
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  استكشف المتجر الآن 🛍️
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myPurchases.map((purchase) => {
                  const isApproved = purchase.status === "approved";
                  const isPending = purchase.status === "pending";
                  const isRejected = purchase.status === "rejected";

                  return (
                    <div
                      key={purchase.id}
                      className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-lg transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            isApproved
                              ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                              : isPending
                              ? "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                              : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                          }`}>
                            {isApproved && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                            {isPending && <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
                            {isRejected && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                            <span>
                              {isApproved ? "تم تأكيد الشراء والترخيص ✅" : isPending ? "قيد تأكيد البائع ⏳" : "تم رفض الطلب ❌"}
                            </span>
                          </span>

                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {purchase.price} ₪
                          </span>
                        </div>

                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white text-base line-clamp-1">
                            {purchase.notebook_title}
                          </h3>
                          {purchase.teacher_name && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              المساق بإشراف: <span className="font-semibold text-slate-700 dark:text-slate-300">{purchase.teacher_name}</span>
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">
                            البائع: <span className="font-semibold text-slate-700 dark:text-slate-300">{purchase.seller_name}</span>
                          </p>
                        </div>

                        {/* Security anti-leak notice */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>
                            {isApproved
                              ? "نسخة مرخصة ومحمية بعلامتك المائية الشخصية لمنع التسريب."
                              : "سيتم طباعة علامتك المائية فور تأكيد البائع للحوالة."}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        {isApproved ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/order/${purchase.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all text-center cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            تحميل نسختي المرخصة 📥
                          </a>
                        ) : isPending ? (
                          <div className="text-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                            بانتظار مراجعة البائع لحساب ريفلكت ⏳
                          </div>
                        ) : (
                          <div className="text-center p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs font-bold text-red-600 dark:text-red-400">
                            لم يؤكد البائع وصول الحوالة
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Seller Incoming Orders */}
        {activeTab === "seller_orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("browse")}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="العودة للمتجر"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    طلبات البيع والحوالات الواردة 🔔
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    الطلاب الذين قاموا بالتحويل إلى محفظتك بانتظار تأكيدك لفتح النسخة المرخصة لهم.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("browse")}
                  className="hidden lg:flex px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 items-center gap-1.5 transition cursor-pointer"
                >
                  <span>تصفح المتجر</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={fetchSellerOrders}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSellerOrders ? "animate-spin" : ""}`} />
                  تحديث
                </button>
              </div>
            </div>

            {/* Seller Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">طلبات بانتظار التأكيد</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{sellerMetrics.pending_count} طلب</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">مبيعات مكتملة</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{sellerMetrics.approved_count} عملية</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-bold block">إجمالي أرباحك</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{sellerMetrics.total_earnings} ₪</span>
                </div>
              </div>
            </div>

            {loadingSellerOrders ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : sellerOrders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-xl mx-auto">
                <Coins className="w-14 h-14 text-indigo-500/40 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">لا توجد طلبات شراء واردة بعد</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  عندما يقوم زميل لك في الجامعة بشراء دفترك والتحويل إلى حسابك، ستظهر طلباته هنا لتأكيدها بضغطة زر.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellerOrders.map((order) => {
                  const isPending = order.status === "pending";
                  const isApproved = order.status === "approved";
                  const isProcessing = actionInProgress === order.id;

                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {order.notebook_title}
                          </span>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                            {order.price} ₪
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : isPending
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}>
                            {isApproved ? "تم التأكيد والتسليم ✅" : isPending ? "بانتظار مراجعتك ⏳" : "مرفوض ❌"}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                          <span>طالب الشراء: <strong className="text-slate-700 dark:text-slate-200">{order.buyer_name}</strong></span>
                          <span>الاسم عند التحويل: <strong className="text-indigo-600 dark:text-indigo-400">{order.sender_name}</strong></span>
                          {order.reference_code && (
                            <span>رقم المرجع: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">{order.reference_code}</code></span>
                          )}
                          <span>التاريخ: {new Date(order.created_at).toLocaleString("ar")}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPending ? (
                          <>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleApproveOrder(order.id)}
                              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>تأكيد استلام المبلغ وفتح الدفتر ✅</span>
                            </button>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleRejectOrder(order.id)}
                              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          </>
                        ) : isApproved ? (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> تم إرسال النسخة المرخصة
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-500">
                            طلب مرفوض
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SLEEK BENTO PURCHASE MODAL */}
        {selectedNotebook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <style>{`
              footer { display: none !important; }
              body { overflow: hidden !important; }
            `}</style>
            
            {/* Dark backdrop */}
            <div 
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
              onClick={closePurchaseModal}
            />

            {/* Modal Dialog */}
            <div className="bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 my-auto overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
              
              {/* Sticky Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0c111d] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">طلب شراء الدفتر</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">تحويل مباشر إلى محفظة البائع</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={closePurchaseModal}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {purchaseSuccess ? (
                /* Success Layout */
                <div className="p-6 text-center space-y-4 my-auto">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">تم إرسال طلب الشراء! 🎉</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                      تم تسجيل طلبك وإشعار البائع لمراجعة حسابه وتأكيد وصول الحوالة. ستجد الدفتر مباشرة في تبويب "مشترياتي".
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        closePurchaseModal();
                        setActiveTab("my_purchases");
                        fetchPurchases();
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                    >
                      متابعة طلبي في "مشترياتي" 📚
                    </button>
                    <button 
                      onClick={closePurchaseModal}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ) : (
                /* Scrollable Form Body */
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
                  
                  {/* Compact Notebook summary */}
                  {(() => {
                    const modalAuthorName = selectedNotebook.author_name || selectedNotebook.student_name?.replace(/\s*\([^)]*\)\s*/g, '').replace(/@\w+/g, '').trim() || selectedNotebook.profiles?.full_name || 'طالب متميز';
                    return (
                      <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm truncate" title={selectedNotebook.title}>
                            {selectedNotebook.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span>د. {selectedNotebook.teacher_name}</span>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate">
                              البائع: {modalAuthorName}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-left">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/20 font-black text-xs">
                            <span className="text-sm font-black">{selectedNotebook.price}</span>
                            <span className="text-[10px]">₪</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment Details Container */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      1. حوّل المبلغ إلى محفظة ريفلكت للدفع:
                    </label>
                    <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-bold">تفاصيل المحفظة والدفع 💳</span>
                        <code className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white tracking-wide block truncate">
                          {selectedNotebook.reflect_details}
                        </code>
                      </div>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(selectedNotebook.reflect_details)}
                        className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-2xs"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الحساب</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Buyer input form */}
                  <form onSubmit={handleConfirmPurchase} className="space-y-3.5 pt-1">
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          2. اسمك كما يظهر في حوالة ريفلكت أو البنك:
                        </label>
                        <input 
                          required
                          type="text" 
                          placeholder="مثال: يوسف أحمد قاسم"
                          value={senderName}
                          onChange={e => setSenderName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm transition outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          3. رقم المرجع أو ملاحظة إضافية (اختياري):
                        </label>
                        <input 
                          type="text" 
                          placeholder="مثال: حوالة الساعة 4:30 أو رقم المعاملة..."
                          value={referenceCode}
                          onChange={e => setReferenceCode(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs sm:text-sm transition outline-none font-medium"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmittingPurchase || !senderName.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-xs flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isSubmittingPurchase ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>تأكيد التحويل وإشعار البائع</span>
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-6xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">المحاكي التفاعلي لدفاتر لمّاح الذكية 📝</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">شاهد كيف يقرأ لمّاح كلام الدكتور الشفوي ويصنع منه دفتراً ملخصاً منظماً مقارنةً بالشرائح الجافة!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setInteractivePreviewNotebook(null)}
                  className="bg-slate-100 dark:bg-slate-950/80 text-slate-500 dark:text-slate-455 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-855 w-8 h-8 rounded-full flex items-center justify-center transition font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Simulated Open Physical Book */}
              <div className="grid lg:grid-cols-2 gap-0.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-850 shadow-inner relative">
                
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
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850">
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">دفتر: <span className="font-bold text-slate-900 dark:text-white">{interactivePreviewNotebook.title}</span></p>
                  <p className="text-xs text-amber-500 dark:text-amber-400 font-black mt-0.5">💰 سعر الشراء: ₪{interactivePreviewNotebook.price}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setInteractivePreviewNotebook(null);
                      setSelectedNotebook(interactivePreviewNotebook);
                    }}
                    className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black px-6 py-3 rounded-xl text-sm transition shadow-lg hover:shadow-indigo-500/20"
                  >
                    🛒 شراء هذا الدفتر الفخم الآن
                  </button>
                  <button 
                    onClick={() => setInteractivePreviewNotebook(null)}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white px-6 py-3 rounded-xl text-sm font-bold transition"
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

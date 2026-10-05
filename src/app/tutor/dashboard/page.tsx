"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  GraduationCap, 
  DollarSign, 
  Clock, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Trash2, 
  ExternalLink, 
  Video, 
  AlertCircle, 
  Wallet, 
  ArrowUpRight, 
  Loader2,
  Sparkles,
  RefreshCw,
  X,
  Sun,
  Moon,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  BookOpen,
  Award,
  Phone,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  Share2,
  Send,
  Edit3,
  UserX,
  CalendarClock,
  AlertTriangle,
  CalendarCheck
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function TutorDashboardPage() {
  const { user, session, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"bookings" | "services" | "wallet" | "profile">("bookings");
  const [loading, setLoading] = useState<boolean>(false);
  const [tutorData, setTutorData] = useState<any>(null);
  const [wallet, setWallet] = useState<any>({ available_balance: 0, pending_balance: 0, total_earned: 0, total_withdrawn: 0 });
  const [metrics, setMetrics] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Modals
  const [showAddServiceModal, setShowAddServiceModal] = useState<boolean>(false);
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<"text" | "link" | null>(null);

  // Meeting Link & Booking Action Management
  const [editingMeetingBookingId, setEditingMeetingBookingId] = useState<string | null>(null);
  const [meetingInputLink, setMeetingInputLink] = useState<string>("");
  const [savingMeetingId, setSavingMeetingId] = useState<string | null>(null);

  // Booking Flow & Modals State
  const [bookingSubTab, setBookingSubTab] = useState<"pending" | "confirmed" | "past">("pending");
  const [acceptModalBooking, setAcceptModalBooking] = useState<any | null>(null);
  const [acceptDate, setAcceptDate] = useState<string>("");
  const [acceptMeetLink, setAcceptMeetLink] = useState<string>("");
  const [acceptNotes, setAcceptNotes] = useState<string>("");
  const [rejectModalBooking, setRejectModalBooking] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [bookingActionLoading, setBookingActionLoading] = useState<boolean>(false);

  // New Service Form
  const [newTitle, setNewTitle] = useState<string>("");
  const [newSubject, setNewSubject] = useState<string>("");
  const [newType, setNewType] = useState<string>("one_on_one");
  const [newPrice, setNewPrice] = useState<number>(50);
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newDesc, setNewDesc] = useState<string>("");

  // Payout Form
  const [payoutAmount, setPayoutAmount] = useState<number>(50);
  const [payoutPhone, setPayoutPhone] = useState<string>("");
  const [payoutMethod, setPayoutMethod] = useState<string>("reflect");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/tutor/dashboard");
      return;
    }
    if (session) {
      loadDashboardData();
    }
  }, [user, session, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${session?.access_token}` };
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";

      // 1. Tutor status
      const statusRes = await fetch(`${api}/api/v1/tutoring/my-status`, { headers });
      const statusData = await statusRes.json();
      setTutorData(statusData.tutor);

      if (!statusData.is_tutor && user?.email !== "admin@lammah.site") {
        if (statusData.status === "pending") {
          setLoading(false);
          return;
        }
      }

      // 2. Summary & Wallet
      const summaryRes = await fetch(`${api}/api/v1/tutoring/tutor/dashboard/summary`, { headers });
      const summaryData = await summaryRes.json();
      if (summaryData.wallet) setWallet(summaryData.wallet);
      if (summaryData.metrics) setMetrics(summaryData.metrics);

      // 3. Services
      const servicesRes = await fetch(`${api}/api/v1/tutoring/tutor/services`, { headers });
      const servicesData = await servicesRes.json();
      setServices(servicesData.services || []);

      // 4. Bookings
      const bookingsRes = await fetch(`${api}/api/v1/tutoring/tutor/bookings`, { headers });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings || []);

    } catch (e) {
      console.error("Dashboard load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/tutor/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          subject_name: newSubject.trim(),
          service_type: newType,
          price: Number(newPrice),
          duration_minutes: Number(newDuration),
          description: newDesc.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل إضافة الخدمة.");

      setShowAddServiceModal(false);
      setNewTitle("");
      setNewSubject("");
      setNewDesc("");
      loadDashboardData();
    } catch (err: any) {
      setActionMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الخدمة؟")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/tutor/services/${serviceId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        setServices(services.filter(s => s.id !== serviceId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteSession = async (bookingId: string) => {
    if (!confirm("هل ترغب في توثيق تقديم الحصة؟\nسيتم إشعار الطالب لتأكيد الاستلام والتقييم، وستُحرر أرباحك فور تأكيده أو تلقائياً بعد مرور 24 ساعة من موعد الجلسة.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/bookings/${bookingId}/complete`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "تم توثيق تقديم الحصة بنجاح وإشعار الطالب!");
        loadDashboardData();
      } else {
        alert(data.detail?.user_message || data.detail || "حدث خطأ أثناء توثيق الحصة.");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "حدث خطأ أثناء توثيق الحصة.");
    }
  };

  const handleSaveMeetingLink = async (bookingId: string) => {
    if (meetingInputLink.trim().endsWith("/new")) {
      alert("⚠️ تنبيه: الرابط meet.google.com/new ينشئ غرفة مختلفة لكل شخص يدخل عليها!\n\nيرجى إنشاء الغرفة في Google Meet ونسخ رابط الغرفة الفعلي (مثل meet.google.com/abc-defg-hij) أو اترك الحقل فارغاً ليقوم لمّاح بإنشاء غرفة موحدة تلقائياً.");
      return;
    }
    setSavingMeetingId(bookingId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/bookings/${bookingId}/meeting-link`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ meeting_link: meetingInputLink.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, meeting_link: data.meeting_link } : b));
        setEditingMeetingBookingId(null);
        setMeetingInputLink("");
      } else {
        alert(data.detail?.user_message || data.detail || "فشل في حفظ الرابط");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء حفظ الرابط");
    } finally {
      setSavingMeetingId(null);
    }
  };

  const handleOpenAcceptModal = (booking: any) => {
    setAcceptModalBooking(booking);
    if (booking.session_date) {
      try {
        const d = new Date(booking.session_date);
        const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setAcceptDate(localIso);
      } catch {
        setAcceptDate("");
      }
    } else {
      const nowPlus1Hr = new Date(Date.now() + 3600000);
      const localIso = new Date(nowPlus1Hr.getTime() - nowPlus1Hr.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setAcceptDate(localIso);
    }
    setAcceptMeetLink(booking.meeting_link || "");
    setAcceptNotes("");
  };

  const handleSubmitAcceptBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptModalBooking) return;
    if (acceptMeetLink.trim().endsWith("/new")) {
      alert("⚠️ تنبيه: الرابط meet.google.com/new ينشئ غرفة مختلفة لكل شخص يدخل عليها!\n\nيرجى إنشاء الغرفة في Google Meet ونسخ كود/رابط الغرفة الفعلي (مثل meet.google.com/abc-defg-hij)، أو اترك الحقل فارغاً وسيقوم لمّاح بتوليد غرفة فيديو موحدة تلقائياً لك وللطالب بنقرة واحدة.");
      return;
    }
    setBookingActionLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/bookings/${acceptModalBooking.id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          session_date: acceptDate ? new Date(acceptDate).toISOString() : acceptModalBooking.session_date,
          meeting_link: acceptMeetLink.trim(),
          tutor_notes: acceptNotes.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل في قبول الطلب.");
      alert(data.message || "تم قبول الحجز وتأكيد الموعد وإشعار الطالب بنجاح!");
      setAcceptModalBooking(null);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء قبول الحجز");
    } finally {
      setBookingActionLoading(false);
    }
  };

  const handleSubmitRejectBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalBooking) return;
    setBookingActionLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/bookings/${rejectModalBooking.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          reason: rejectReason.trim() || "المعلم غير متفرغ في هذا الموعد."
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل في رفض الطلب.");
      alert(data.message || "تم رفض طلب الحجز وإشعار الطالب.");
      setRejectModalBooking(null);
      setRejectReason("");
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء رفض الحجز");
    } finally {
      setBookingActionLoading(false);
    }
  };

  const handleReportNoShow = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من توثيق عدم حضور الطالب بعد انتظارك 15 دقيقة؟\nسيتم توثيق الغياب وصرف 50% من قيمة الحصة لك كتعويض مباشر عن وقتك المحجوز.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/bookings/${bookingId}/report-no-show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          reason: "عدم حضور الطالب بعد انتظار 15 دقيقة"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل توثيق عدم الحضور.");
      alert(data.message || "تم توثيق عدم الحضور وصرف أرباح الحصة لك بنجاح!");
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/tutor/wallet/payout-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          payout_method: payoutMethod,
          account_info: { phone: payoutPhone.trim() || user?.phone || "" }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل تقديم طلب السحب.");

      alert(data.message);
      setShowPayoutModal(false);
      loadDashboardData();
    } catch (err: any) {
      setActionMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getShareText = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const profileUrl = `${origin}/tutors/${user?.id}`;
    const name = user?.user_metadata?.full_name || "معلم معتمد";
    const uni = tutorData?.university || "جامعة النجاح الوطنية";
    const maj = tutorData?.major || "الهندسة وتكنولوجيا المعلومات";

    const subjects = Array.from(new Set(services.map((s: any) => s.subject_name).filter(Boolean)));
    const subjectsLine = subjects.length > 0 ? `\n📚 المساقات والشروحات: ${subjects.join(" • ")}` : "";

    return `🎓 مرحباً بكم جميعاً!
يسعدني دعوتكم لحجز حصص دراسية خصوصية ومراجعات امتحانات معي عبر منصة «لمّاح»:

👨‍🏫 المعلم/ة: ${name}
🏛️ الجامعة: ${uni}
🎯 التخصص: ${maj}
⭐ معلم معتمد وموثق 100%${subjectsLine}

💡 لمعاينة الكورسات المتاحة وحجز موعد جلستك مباشرة:
🔗 ${profileUrl}

أتمنى لكم كل التوفيق والدرجات العالية! 🚀✨`;
  };

  const handleCopyFormattedText = () => {
    navigator.clipboard.writeText(getShareText());
    setCopiedType("text");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyDirectLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    navigator.clipboard.writeText(`${origin}/tutors/${user?.id}`);
    setCopiedType("link");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyServiceCard = (service: any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const serviceUrl = `${origin}/tutors/${user?.id}?service=${service.id}`;
    const name = user?.user_metadata?.full_name || "معلم معتمد";
    const msg = `📚 حصة دراسية: ${service.title} (${service.subject_name})
👨‍🏫 مع الأستاذ/ة: ${name}
⏱️ المدة: ${service.duration_minutes || 60} دقيقة • 💰 الرسوم: ${service.price} ₪

🔗 احجز موعدك الآن عبر منصة لمّاح:
${serviceUrl}`;
    navigator.clipboard.writeText(msg);
    setCopiedId(service.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // If pending approval
  if (tutorData && tutorData.status === "pending") {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 p-8 flex items-center justify-center font-sans" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-[#0b0f19] border border-amber-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
            ⏳
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">طلبك قيد التدقيق الأكاديمي</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
              شكراً لانضمامك إلى شبكة معلمين «لمّاح». يقوم فريقنا حالياً بتدقيق كشف العلامات والأوراق الثبوتية، وسيتم تفعيل حسابك بالكامل خلال 24 ساعة.
            </p>
          </div>
          <button 
            onClick={() => router.push("/")} 
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-95 transition cursor-pointer"
          >
            العودة للرئيسية
          </button>
        </div>
      </main>
    );
  }

  const academicInfo = tutorData?.payout_details?.academic_info || {};

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300 font-sans" dir="rtl">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[140px]" />
      </div>

      {/* ── 1. Top Executive Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Logo + Teacher Portal Badge */}
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2 group">
              <img 
                src="/lammah-logo.png" 
                alt="Logo" 
                className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" 
              />
              <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">لمّاح</span>
            </Link>

            <span className="text-slate-300 dark:text-slate-700">/</span>

            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">لوحة المعلم</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* In-App Notifications */}
            <NotificationBell />

            {/* Share Public Link */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200/80 dark:border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              title="مشاركة رابط صفحتك العامة"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مشاركة الرابط</span>
            </button>

            {/* Public Profile View */}
            <a
              href={`/tutors/${user?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200/80 dark:border-slate-800 transition flex items-center gap-1.5"
              title="معاينة صفحتي للطلاب"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">صفحتي للطلاب</span>
            </a>

            {/* Add Service CTA */}
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة حصة</span>
            </button>

            {/* Light / Dark Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center transition cursor-pointer"
              title={theme === "dark" ? "الوضع الفاتح ☀️" : "الوضع الليلي 🌙"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Main Studio Container ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        
        {/* ── 2.1 Minimal Profile Greeting ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {user?.user_metadata?.full_name?.charAt(0) || "م"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  أهلاً بك، {user?.user_metadata?.full_name || "أستاذنا"}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  معتمد
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tutorData?.university || "جامعة النجاح الوطنية"} • {tutorData?.major || "الهندسة وتكنولوجيا المعلومات"}
              </p>
            </div>
          </div>
        </div>

        {/* ── 2.2 Unified Metric Bar (Linear / Apple style) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100 dark:divide-slate-800/80 shadow-2xs">
          
          {/* 1. Available to withdraw */}
          <div className="p-4 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>الرصيد المتاح للسحب</span>
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {Number(wallet.available_balance || 0).toLocaleString()} ₪
              </span>
              {Number(wallet.available_balance || 0) >= 50 && (
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>سحب</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              محصّل ومحرر بعد اعتماد الطلاب
            </span>
          </div>

          {/* 2. Pending Balance */}
          <div className="p-4 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>أرباح معلقة (بالضمان)</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {Number(wallet.pending_balance || 0).toLocaleString()} ₪
            </span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">
              تُحرر بعد تأكيد الطالب أو بعد 24 ساعة
            </span>
          </div>

          {/* 3. Bookings Count */}
          <div className="p-4 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>حصص قادمة</span>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {bookings.filter(b => b.status === "confirmed" || b.status === "pending_approval" || b.status === "pending_payment").length}
            </span>
          </div>

          {/* 4. Total Earned */}
          <div className="p-4 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>إجمالي الأرباح</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {Number(wallet.total_earned || 0).toLocaleString()} ₪
            </span>
          </div>

        </div>

        {/* ── 2.3 Calm Segmented Tabs ── */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto scrollbar-hide">
          {[
            { 
              id: "bookings", 
              label: "الحجوزات والطلاب", 
              icon: Calendar,
              badge: bookings.filter(b => b.status === "pending_approval" || b.status === "pending_payment").length
            },
            { 
              id: "services", 
              label: `حصصي (${services.length})`, 
              icon: BookOpen 
            },
            { 
              id: "wallet", 
              label: "المحفظة والسحب", 
              icon: Wallet 
            },
            { 
              id: "profile", 
              label: "الملف الأكاديمي", 
              icon: Award 
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-white dark:bg-[#0b0f19] text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── 5. Tab 1: Services List ── */}
        {activeTab === "services" && (
          <div className="space-y-4">
            
            {/* Header / Add Button Row */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">الحصص والخدمات المنشورة للطلاب</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">يمكن للطلاب حجز هذه الحصص مباشرة عبر صفحتك العامة.</p>
              </div>

              <button
                onClick={() => setShowAddServiceModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة حصة جديدة</span>
              </button>
            </div>

            {services.length === 0 ? (
              <div className="bg-white dark:bg-[#0b0f19] border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">لم تقم بإضافة أي حصص أو خدمات بعد</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
                    أضف جلستك الفردية الأولى (1:1) أو مراجعة امتحان أو شرح مشروع وحدد السعر المناسب لك لتحصل على 50% أرباح صافية من كل حجز.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition cursor-pointer"
                >
                  + إضافة حصتي الأولى الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {services.map((service) => {
                  const tutorEarn = (Number(service.price) * 0.5).toFixed(2);
                  const platEarn = (Number(service.price) * 0.5).toFixed(2);
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-3xl p-5 sm:p-6 transition shadow-xs flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-black">
                            {service.subject_name}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyServiceCard(service)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                              title="نسخ بطاقة ورابط حجز هذه الحصة لنشرها"
                            >
                              {copiedId === service.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                              title="حذف الحصة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">{service.title}</h3>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{service.duration_minutes || 60} دقيقة</span>
                            </span>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400">جلسة خاصة (1:1)</span>
                          </div>
                        </div>

                        {service.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            {service.description}
                          </p>
                        )}
                      </div>

                      {/* Financial Split Box */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-bold">سعر الحصة للطالب:</span>
                          <strong className="text-base font-black text-slate-900 dark:text-white font-mono">{service.price} ₪</strong>
                        </div>

                        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl flex justify-between items-center text-xs font-black border border-emerald-200/80 dark:border-emerald-500/20">
                          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <span>أرباحك الصافية:</span>
                            <strong className="font-mono">{tutorEarn} ₪</strong>
                          </span>
                          <span className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 uppercase">(50%)</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 6. Tab 2: Bookings & Sessions ── */}
        {activeTab === "bookings" && (() => {
          const pendingBookings = bookings.filter(b => b.status === "pending_approval" || b.status === "pending_payment");
          const confirmedBookings = bookings.filter(b => b.status === "confirmed");
          const pastBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled" || b.status === "no_show");

          return (
            <div className="space-y-4">
              {/* Clean Subtab Segmented Navigation */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl max-w-lg border border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => setBookingSubTab("pending")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    bookingSubTab === "pending"
                      ? "bg-white dark:bg-[#0b0f19] text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>طلبات بانتظار موافقتك</span>
                  {pendingBookings.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                      {pendingBookings.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setBookingSubTab("confirmed")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    bookingSubTab === "confirmed"
                      ? "bg-white dark:bg-[#0b0f19] text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>الحصص المؤكدة</span>
                  {confirmedBookings.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-black">
                      {confirmedBookings.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setBookingSubTab("past")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    bookingSubTab === "past"
                      ? "bg-white dark:bg-[#0b0f19] text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>الحصص السابقة</span>
                  <span className="text-[10px] text-slate-400 font-mono">({pastBookings.length})</span>
                </button>
              </div>

              {/* ── Subtab 1: Pending Approval Requests ── */}
              {bookingSubTab === "pending" && (
                <div className="space-y-4">
                  {pendingBookings.length === 0 ? (
                    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">لا توجد طلبات جديدة بانتظار موافقتك</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        عندما يحجز طالب جلسة معك، ستصلك هنا مباشرة لمراجعة وتأكيد الموعد.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingBookings.map((booking) => {
                        const studentName = booking.student_name || booking.student_profiles?.full_name || booking.profiles?.full_name || "طالب لمّاح";
                        const price = Number(booking.price || booking.total_price || 0);
                        const tutorEarn = booking.tutor_share || (price * 0.5);

                        return (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 transition"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                                    بانتظار موافقتك
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono" dir="ltr">
                                    {new Date(booking.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>

                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                  طلب من الطالب: <span className="text-indigo-600 dark:text-indigo-400">{studentName}</span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                  المساق: {booking.tutoring_services?.subject_name || "حصة خاصة"} • الخدمة: {booking.tutoring_services?.title || "جلسة تعليمية"}
                                </p>
                              </div>

                              <div className="text-right sm:text-left bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800 shrink-0">
                                <span className="text-[10px] text-slate-400 block font-medium">أرباحك المحجوزة</span>
                                <strong className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                  {tutorEarn} ₪
                                </strong>
                              </div>
                            </div>

                            {/* Proposed Date & Notes */}
                            <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-xs">
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                <span>الموعد المقترح:</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold" dir="ltr">
                                  {booking.session_date 
                                    ? new Date(booking.session_date).toLocaleString("ar-EG", { dateStyle: "full", timeStyle: "short" })
                                    : "بأقرب وقت يحدده المعلم"}
                                </span>
                              </div>

                              {booking.notes_from_student && (
                                <p className="text-slate-600 dark:text-slate-400 text-xs italic pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                                  💬 ملاحظات الطالب: {booking.notes_from_student}
                                </p>
                              )}
                            </div>

                            {/* Approval Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                              <button
                                onClick={() => {
                                  setRejectModalBooking(booking);
                                  setRejectReason("");
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                              >
                                اعتذار
                              </button>

                              <button
                                onClick={() => handleOpenAcceptModal(booking)}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <CalendarCheck className="w-3.5 h-3.5" />
                                <span>قبول وتأكيد الموعد</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Subtab 2: Confirmed Scheduled Sessions ── */}
              {bookingSubTab === "confirmed" && (
                <div className="space-y-4">
                  {confirmedBookings.length === 0 ? (
                    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">لا توجد حصص مؤكدة مجدولة حالياً</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        الحصص التي توافق عليها ستظهر هنا مع روابط Google Meet وميزة إثبات عدم حضور الطالب لحماية أرباحك.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {confirmedBookings.map((booking) => {
                        const studentName = booking.student_name || booking.student_profiles?.full_name || booking.profiles?.full_name || "طالب لمّاح";
                        const price = Number(booking.price || booking.total_price || 0);
                        const tutorEarn = booking.tutor_share || (price * 0.5);

                        const sessionTimeMs = booking.session_date ? new Date(booking.session_date).getTime() : 0;
                        const nowMs = Date.now();
                        const isPastSession = sessionTimeMs > 0 && nowMs > sessionTimeMs;
                        const is15MinPast = sessionTimeMs > 0 && (nowMs - sessionTimeMs) >= 15 * 60 * 1000;
                        const isDeliveryClaimed = Boolean(booking.notes_from_student?.includes("[توثيق المعلم]: تم إعطاء الحصة"));

                        return (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 transition"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 w-full">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                                    حجز مؤكد ومجدول 📅
                                  </span>
                                  {isPastSession ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                                      حان وقت الحصة 🟢
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-500 font-bold">
                                      موعد الحصة المعتمد
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                  جلسة مع الطالب: <span className="text-indigo-600 dark:text-indigo-400">{studentName}</span>
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                                  المساق: {booking.tutoring_services?.subject_name || "حصة دراسية"} • الخدمة: {booking.tutoring_services?.title || "جلسة خاصة"}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 pt-0.5">
                                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                  <span dir="ltr" className="font-mono text-indigo-600 dark:text-indigo-400">
                                    {booking.session_date ? new Date(booking.session_date).toLocaleString("ar-EG", { dateStyle: "full", timeStyle: "short" }) : "غير محدد"}
                                  </span>
                                </div>
                              </div>

                              {/* Right Financial Column */}
                              <div className="text-right sm:text-left bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
                                <span className="text-[10px] text-slate-400 block font-bold">صافي أرباحك:</span>
                                <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                  {tutorEarn} ₪
                                </strong>
                              </div>
                            </div>

                            {/* Google Meet Studio Section */}
                            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                                  <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  <span>رابط غرفة الحصة:</span>
                                </div>

                                <a
                                  href="https://meet.google.com/new"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200/80 dark:border-indigo-500/30 transition"
                                  title="فتح Google Meet لإنشاء غرفة ونسخ كودها الفعلي"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>إنشاء كود Google Meet ↗</span>
                                </a>
                              </div>

                              {editingMeetingBookingId === booking.id ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <input
                                    type="url"
                                    value={meetingInputLink}
                                    onChange={(e) => setMeetingInputLink(e.target.value)}
                                    placeholder="ألصق رابط الاجتماع (مثال: meet.google.com/abc-defg-hij أو اتركه فارغاً لغرفة لمّاح)"
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none"
                                    dir="ltr"
                                    autoFocus
                                  />
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => handleSaveMeetingLink(booking.id)}
                                      disabled={savingMeetingId === booking.id}
                                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer disabled:opacity-50 transition shadow-xs"
                                    >
                                      {savingMeetingId === booking.id ? "جاري الحفظ..." : "حفظ الرابط ✅"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingMeetingBookingId(null);
                                        setMeetingInputLink("");
                                      }}
                                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 transition"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50/90 dark:bg-slate-900/50 p-2.5 sm:p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/80">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${booking.meeting_link ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-sm" dir="ltr">
                                      {booking.meeting_link 
                                        ? (booking.meeting_link.includes("meet.jit.si") 
                                            ? "🎥 غرفة لمّاح الموحدة المباشرة (جاهزة لك وللطالب)" 
                                            : booking.meeting_link)
                                        : "لم يتم تعيين رابط الاجتماع بعد"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                                    {booking.meeting_link && (
                                      <>
                                        <a
                                          href={booking.meeting_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={() => {
                                            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/bookings/${booking.id}/log-attendance`, {
                                              method: "POST",
                                              headers: { "Authorization": `Bearer ${session?.access_token}` }
                                            }).catch(() => {});
                                          }}
                                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                                        >
                                          <Video className="w-3.5 h-3.5" />
                                          <span>دخول الحصة</span>
                                        </a>

                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(booking.meeting_link);
                                            setCopiedId(`meet-${booking.id}`);
                                            setTimeout(() => setCopiedId(null), 2000);
                                          }}
                                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                                          title="نسخ الرابط"
                                        >
                                          {copiedId === `meet-${booking.id}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                      </>
                                    )}

                                    <button
                                      onClick={() => {
                                        setEditingMeetingBookingId(booking.id);
                                        setMeetingInputLink(booking.meeting_link || "");
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>{booking.meeting_link ? "تعديل" : "إضافة الرابط"}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions: Complete Session & No-Show Guarantee */}
                            <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {booking.status === "disputed" ? (
                                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>الجلسة قيد المراجعة الإدارية (نزاع). أموالك محفوظة في الضمان وسيقوم المشرف بمتابعة الأمر.</span>
                                  </span>
                                ) : isDeliveryClaimed ? (
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                    <span>تم إشعار الطالب لتأكيد الاستلام. تُحرر أرباحك ({tutorEarn} ₪) فور تأكيده أو تلقائياً بعد 24 ساعة.</span>
                                  </span>
                                ) : is15MinPast ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>مضت 15 دقيقة على بدء الحصة. في حال لم يحضر الطالب يمكنك توثيق عدم الحضور وصرف أرباحك.</span>
                                  </span>
                                ) : (
                                  <span>⏳ عند انتهائك من شرح الحصة، اضغط أدناه لتوثيق تقديم الحصة وإشعار الطالب.</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                {is15MinPast && booking.status !== "completed" && booking.status !== "disputed" && !isDeliveryClaimed && (
                                  <button
                                    onClick={() => handleReportNoShow(booking.id)}
                                    className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                                    title="حماية أرباحك: صرف حصتك في حال عدم حضور الطالب"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>إثبات غياب الطالب (صرف الأرباح 🛡️)</span>
                                  </button>
                                )}

                                {booking.status !== "completed" && booking.status !== "disputed" && (
                                  isDeliveryClaimed ? (
                                    <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>بانتظار تأكيد الطالب (يُحرر خلال 24 ساعة)</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleCompleteSession(booking.id)}
                                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>توثيق تقديم الحصة وإشعار الطالب 📨</span>
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Subtab 3: Past / Completed / Cancelled Sessions ── */}
              {bookingSubTab === "past" && (
                <div className="space-y-3.5">
                  {pastBookings.length === 0 ? (
                    <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">لا توجد حصص سابقة بعد</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        جميع الجلسات المكتملة والمحررة أرباحها ستُسجل هنا في سجلك الأكاديمي.
                      </p>
                    </div>
                  ) : (
                    pastBookings.map((booking) => {
                      const isCompleted = booking.status === "completed";
                      const isNoShow = booking.status === "no_show";
                      const isCancelled = booking.status === "cancelled";
                      const studentName = booking.student_name || booking.student_profiles?.full_name || booking.profiles?.full_name || "طالب لمّاح";
                      const tutorEarn = booking.tutor_share || (Number(booking.price || booking.total_price || 0) * 0.5);

                      return (
                        <div
                          key={booking.id}
                          className="bg-white dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isCompleted && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                  مكتملة ومحررة الأرباح ✅
                                </span>
                              )}
                              {isNoShow && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                  إثبات غياب الطالب (تم التعويض) 🛡️
                                </span>
                              )}
                              {isCancelled && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                                  معتذر عنها / ملغاة ❌
                                </span>
                              )}
                              <span className="text-xs text-slate-400 font-mono" dir="ltr">
                                {new Date(booking.session_date || booking.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              جلسة مع: <span className="text-indigo-600 dark:text-indigo-400">{studentName}</span>
                            </h4>
                            <p className="text-xs text-slate-500">
                              {booking.tutoring_services?.subject_name || "المساق"} • {booking.tutoring_services?.title || "جلسة خاصة"}
                            </p>
                          </div>

                          <div className="text-right sm:text-left bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shrink-0">
                            <span className="text-[10px] text-slate-400 block font-bold">الحصة المحولة:</span>
                            <strong className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              {isCancelled ? "0 ₪" : `${tutorEarn} ₪`}
                            </strong>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── 7. Tab 3: Wallet & Financial Operations ── */}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">المحفظة وسحب الأرباح الإلكترونية</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">سحب فوري لأرباحك الصافية بنسبة 50% عبر المحافظ الإلكترونية المعتمدة في فلسطين.</p>
            </div>

            {/* Financial Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#0b0f19] border border-emerald-200/80 dark:border-emerald-500/30 rounded-3xl p-6 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الرصيد المتاح للسحب الآن</span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {wallet.available_balance || 0} ₪
                </div>
                <p className="text-[11px] text-slate-500">جاهز للتحويل الفوري إلى محفظتك الإلكترونية.</p>
              </div>

              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الأرباح في الانتظار (جلسات معلقة)</span>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {wallet.pending_balance || 0} ₪
                </div>
                <p className="text-[11px] text-slate-500">تتحرر تلقائياً فور تأكيد إنهاء الحصص مع الطلاب.</p>
              </div>

              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">إجمالي المبالغ المسحوبة</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                  {wallet.total_withdrawn || 0} ₪
                </div>
                <p className="text-[11px] text-slate-500">تم تحويلها بنجاح لحسابك البنكي أو ريفلكت.</p>
              </div>
            </div>

            {/* Quick Request Payout Box */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">هل ترغب بسحب أرباحك الآن؟</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  الحد الأدنى للسحب هو 50 شيكل. يتم تحويل المستحقات عبر محفظة ريفلكت (Reflect) أو جوال باي خلال 24 ساعة.
                </p>
              </div>

              <button
                onClick={() => {
                  setPayoutAmount(Math.max(50, Number(wallet.available_balance || 0)));
                  setShowPayoutModal(true);
                }}
                disabled={Number(wallet.available_balance || 0) < 50}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
              >
                طلب سحب الأرباح الآن 💸
              </button>
            </div>
          </div>
        )}

        {/* ── 8. Tab 4: Academic Profile Details ── */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">الملف الأكاديمي والوثائق المعتمدة</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">بياناتك المسجلة لدى إدارة منصة لمّاح والتي تظهر للطلاب.</p>
            </div>

            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">الجامعة</span>
                  <strong className="text-slate-900 dark:text-white block font-bold">{tutorData?.university || "غير محدد"}</strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">التخصص والمستوى</span>
                  <strong className="text-slate-900 dark:text-white block font-bold">{tutorData?.major} ({academicInfo.study_year || "طالب"})</strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">المعدل التراكمي (GPA)</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-black block">{academicInfo.gpa || "3.8 / 4.0"}</strong>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-bold block">النبذة التعريفية وأسلوب الشرح:</span>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {tutorData?.bio || "معلم أكاديمي في منصة لمّاح"}
                </p>
              </div>

              {/* Verified Documents */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">الوثائق الثبوتية والروابط:</span>
                
                <div className="flex flex-wrap gap-2.5">
                  {tutorData?.verification_doc_url && (
                    <a
                      href={tutorData.verification_doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>كشف العلامات الرسمي (Google Drive)</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {tutorData?.intro_video_url && (
                    <a
                      href={tutorData.intro_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5 text-purple-600" />
                      <span>فيديو الشرح التعريفي</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Modal: Add New Service / Course ── */}
      <AnimatePresence>
        {showAddServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">إضافة حصة أو خدمة تدريس جديدة</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">حدد تفاصيل الحصة والمادة وسعر الحجز للطالب.</p>
              </div>

              {actionMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {actionMessage}
                </div>
              )}

              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الحصة / الجلسة</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: مراجعة شاملة للامتحان النصفي في البرمجة"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المساق</label>
                    <input
                      type="text"
                      required
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="مثال: Algorithms 101"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المدة (بالدقائق)</label>
                    <input
                      type="number"
                      required
                      min={30}
                      max={180}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سعر الحصة للطالب (شيكل)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={500}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* 50/50 Live Split Box */}
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/20 flex justify-between items-center text-xs font-black">
                  <span className="text-emerald-700 dark:text-emerald-400">💰 أرباحك الصافية: {(newPrice * 0.5).toFixed(2)} ₪ (50%)</span>
                  <span className="text-slate-500">رسوم المنصة: {(newPrice * 0.5).toFixed(2)} ₪</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">وصف الحصة والمحاور (اختياري)</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="ما الذي سيتعلمه الطالب في هذه الجلسة؟"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    {actionLoading ? "جاري الحفظ..." : "حفظ ونشر الحصة"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Request Payout ── */}
      <AnimatePresence>
        {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setShowPayoutModal(false)}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">طلب سحب أرباح إلكترونية</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  الرصيد المتاح للسحب: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{wallet.available_balance || 0} شيكل</strong>
                </p>
              </div>

              {actionMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  {actionMessage}
                </div>
              )}

              <form onSubmit={handleRequestPayout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">المبلغ المطلوب سحبه (شيكل)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={Number(wallet.available_balance || 50)}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">الحد الأدنى للسحب هو 50 شيكل.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">طريقة الاستلام المفضلة</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="reflect">محفظة ريفلكت (Reflect)</option>
                    <option value="jawwal_pay">جوال باي (Jawwal Pay)</option>
                    <option value="palpay">بال باي (PalPay)</option>
                    <option value="bank">حساب بنكي محلي (Bank IBAN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف / الحساب / الآيبان</label>
                  <input
                    type="text"
                    required
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    placeholder="059XXXXXXX أو 056XXXXXXX أو رقم الحساب"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    {actionLoading ? "جاري الإرسال..." : "تأكيد طلب السحب"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Share Profile With Beautiful Friendly Message ── */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-black border border-indigo-200/80 dark:border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>بطاقة ورابط المشاركة الذكية</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">مشاركة صفحتك الأكاديمية 🚀</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  رسالة دعوة مميزة وجاهزة للنشر الفوري على جروبات الدفعة وواتساب وتيليجرام.
                </p>
              </div>

              {/* Message Live Preview Card */}
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                  <span>نص رسالة الدعوة:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">جاهز للنسخ والإرسال</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed whitespace-pre-line bg-white dark:bg-[#030712] p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 select-all max-h-52 overflow-y-auto">
                  {getShareText()}
                </div>
              </div>

              {/* Instant Social Share Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
                  className="py-3 px-4 rounded-xl hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white shrink-0" />
                  <span className="text-white font-black">إرسال عبر واتساب</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/tutors/${user?.id}` : "")}&text=${encodeURIComponent(getShareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: "#0284c7", color: "#ffffff" }}
                  className="py-3 px-4 rounded-xl hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white shrink-0" />
                  <span className="text-white font-black">مشاركة تيليجرام</span>
                </a>
              </div>

              {/* Copy Full Message vs Link Only */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleCopyFormattedText}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copiedType === "text" ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedType === "text" ? "تم نسخ الرسالة بالكامل! 🎉" : "نسخ الرسالة"}</span>
                </button>

                <button
                  onClick={handleCopyDirectLink}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedType === "link" ? <Check className="w-4 h-4 text-emerald-500" /> : <ExternalLink className="w-4 h-4" />}
                  <span>{copiedType === "link" ? "تم نسخ الرابط! 🔗" : "نسخ الرابط فقط"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Accept Booking Request ── */}
      <AnimatePresence>
        {acceptModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setAcceptModalBooking(null)}
                className="absolute top-5 left-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">قبول وتأكيد موعد الحصة</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  حدد الموعد الدقيق ورابط Google Meet ليتم إشعار الطالب وإغلاق الجلسة حتى يحين وقتها.
                </p>
              </div>

              {/* Summary Brief */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block">الطالب:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {acceptModalBooking.student_name || acceptModalBooking.student_profiles?.full_name || "طالب لمّاح"}
                  </strong>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 block">أرباحك المحجوزة:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black font-mono">
                    {acceptModalBooking.tutor_share || (Number(acceptModalBooking.price || acceptModalBooking.total_price || 0) * 0.5)} ₪
                  </strong>
                </div>
              </div>

              <form onSubmit={handleSubmitAcceptBooking} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الموعد النهائي الدقيق للحصة (تاريخ ووقت) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={acceptDate}
                    onChange={(e) => setAcceptDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    🔒 سيُقفل زر دخول الطالب حتى يحين هذا الموعد بـ 5 دقائق لحماية وقتك.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      رابط الغرفة (Google Meet أو اتركه فارغاً)
                    </label>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      title="يفتح Google Meet لإنشاء غرفة ونسخ كودها"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>فتح Google Meet لإنشاء كود ↗</span>
                    </a>
                  </div>
                  <input
                    type="url"
                    value={acceptMeetLink}
                    onChange={(e) => setAcceptMeetLink(e.target.value)}
                    placeholder="meet.google.com/xxx-yyyy-zzz (أو اتركه فارغاً لغرفة لمّاح التلقائية)"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block leading-relaxed">
                    💡 <strong>ملاحظة هامة:</strong> إذا تركت الحقل فارغاً، سينشئ لكما نظام لمّاح غرفة فيديو خاصة وموحدة تلقائياً بنقرة واحدة. إذا أردت Google Meet، افتحه وانسخ رابط الغرفة الفعلي الدائم (وليس /new).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ملاحظات أو توجيهات للطالب (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={acceptNotes}
                    onChange={(e) => setAcceptNotes(e.target.value)}
                    placeholder="مثال: يرجى تجهيز أسئلة الواجب ومراجعة الشابتر الثاني قبل البدء..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAcceptModalBooking(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={bookingActionLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {bookingActionLoading ? "جاري التأكيد..." : "تأكيد الموعد وإشعار الطالب 🚀"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Reject Booking Request ── */}
      <AnimatePresence>
        {rejectModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setRejectModalBooking(null)}
                className="absolute top-5 left-5 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">الاعتذار عن طلب الحجز</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يرجى توضيح سبب الاعتذار للطالب ليتمكن من اختيار موعد بديل أو معلم آخر.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "تعارض مع موعد محاضرة أو عمل",
                  "المساق خارج نطاق تخصصي",
                  "أرجو حجز موعد في عطلة نهاية الأسبوع",
                  "غير متاح في هذا التوقيت"
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmitRejectBooking} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سبب الاعتذار الموجه للطالب
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="اكتب سبب الاعتذار بلطف هنا..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRejectModalBooking(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={bookingActionLoading}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {bookingActionLoading ? "جاري الإلغاء..." : "إرسال الاعتذار للطالب"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

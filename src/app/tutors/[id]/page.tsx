"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, use, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Video, 
  Loader2, 
  X, 
  Copy, 
  Check,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Share2,
  Send,
  MessageCircle,
  Sun,
  Moon,
  ExternalLink,
  Sparkles,
  Building2,
  Award
} from "lucide-react";

function TutorProfileContent({ tutorId }: { tutorId: string }) {
  const { user, session, loading: authLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tutor, setTutor] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Booking Modal State
  const [selectedService, setSelectedService] = useState<any>(null);
  const [sessionDate, setSessionDate] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [studentPhone, setStudentPhone] = useState<string>("");
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string>("");

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<"text" | "link" | null>(null);

  // إذا طلب الزائر الحجز مباشرة وهو غير مسجل دخول، وجهه لصفحة الدخول ثم أعده لنفس الفورم
  useEffect(() => {
    const isBookingRequested = searchParams.get("book") === "true" || !!searchParams.get("service");
    if (!authLoading && !user && isBookingRequested) {
      const fullPath = `/tutors/${tutorId}?${searchParams.toString()}`;
      router.push(`/auth?next=${encodeURIComponent(fullPath)}`);
    }
  }, [authLoading, user, searchParams, tutorId, router]);

  useEffect(() => {
    fetchTutorProfile();
  }, [tutorId]);

  useEffect(() => {
    if (user) {
      if (!studentName && user.user_metadata?.full_name) {
        setStudentName(user.user_metadata.full_name);
      }
      if (!studentPhone && (user.phone || user.user_metadata?.phone_number)) {
        setStudentPhone(user.phone || user.user_metadata?.phone_number);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedService && !sessionDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(16, 0, 0, 0);
      const tzOffset = tomorrow.getTimezoneOffset() * 60000;
      const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
      setSessionDate(localISOTime);
    }
  }, [selectedService]);

  const fetchTutorProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tutoring/tutors/${tutorId}`);
      const data = await res.json();
      if (data.status === "success") {
        setTutor(data.tutor);
        setServices(data.services || []);
        setReviews(data.reviews || []);

        // Auto-open service if present in query params or ?book=true
        const targetServiceId = searchParams.get("service");
        const shouldBook = searchParams.get("book") === "true";
        if (targetServiceId && data.services) {
          const target = data.services.find((s: any) => s.id === targetServiceId);
          if (target) setSelectedService(target);
        } else if (shouldBook && data.services && data.services.length > 0) {
          setSelectedService(data.services[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getShareText = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const profileUrl = `${origin}/tutors/${tutorId}`;
    const name = tutor?.profiles?.full_name || "معلم معتمد";
    const uni = tutor?.university || "جامعة النجاح الوطنية";
    const maj = tutor?.major || "الهندسة وتكنولوجيا المعلومات";

    const subjects = Array.from(new Set(services.map((s: any) => s.subject_name).filter(Boolean)));
    const subjectsLine = subjects.length > 0 ? `\n📚 المساقات والشروحات: ${subjects.join(" • ")}` : "";

    return `🎓 مرحباً بكم جميعاً!
يسعدني دعوتكم لحجز حصص دراسية ومراجعات امتحانات مع الأستاذ/ة «${name}» عبر منصة «لمّاح»:

👨‍🏫 المعلم/ة: ${name}
🏛️ الجامعة: ${uni}
🎯 التخصص: ${maj}
⭐ تقييم 5.0 • معتمد وموثق 100%${subjectsLine}

💡 لمعاينة الكورسات المتاحة وحجز موعد جلستك مباشرة:
🔗 ${profileUrl}

منصة لمّاح - شروحات أكاديمية موثوقة بضمان وحجز فوري! 🚀✨`;
  };

  const handleCopyFormattedText = () => {
    navigator.clipboard.writeText(getShareText());
    setCopiedType("text");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyDirectLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    navigator.clipboard.writeText(`${origin}/tutors/${tutorId}`);
    setCopiedType("link");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !session) {
      const nextUrl = `/tutors/${tutorId}?book=true${selectedService ? `&service=${selectedService.id}` : ""}`;
      router.push(`/auth?next=${encodeURIComponent(nextUrl)}`);
      return;
    }

    if (!sessionDate) {
      setBookingError("يرجى تحديد موعد وتاريخ الجلسة.");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tutoring/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          service_id: selectedService.id,
          session_date: new Date(sessionDate).toISOString(),
          student_name: studentName.trim() || user?.user_metadata?.full_name || "طالب لمّاح",
          student_phone: studentPhone.trim() || user?.phone || "",
          notes_from_student: studentNotes.trim()
        })
      });

      if (res.status === 401) {
        await signOut();
        const nextUrl = `/tutors/${tutorId}?book=true${selectedService ? `&service=${selectedService.id}` : ""}`;
        router.push(`/auth?next=${encodeURIComponent(nextUrl)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || data.detail || "فشل في إتمام الحجز.");

      setBookingSuccess(data);
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4" dir="rtl">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">جاري تحميل ملف المعلم والحصص المتاحة...</p>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto shadow-inner">
          ❌
        </div>
        <h1 className="text-2xl font-black">المعلم غير موجود أو قيد المراجعة</h1>
        <button 
          onClick={() => router.push("/tutors")} 
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          العودة لقائمة المدرسين
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300 font-sans" dir="rtl">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-10 w-[450px] h-[450px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[140px]" />
      </div>

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          <button
            onClick={() => router.push("/tutors")}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer bg-slate-100 dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة لدليل المدرسين</span>
          </button>

          <div className="flex items-center gap-2.5">
            {/* Share Profile Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-500/20"
              title="مشاركة بروفايل المعلم"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة الصفحة</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition cursor-pointer shadow-2xs"
              title={theme === "dark" ? "الوضع الفاتح ☀️" : "الوضع الليلي 🌙"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        
        {/* ── Tutor Profile Executive Card ── */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-xl shadow-indigo-600/20 shrink-0">
                {tutor?.profiles?.full_name?.charAt(0) || "م"}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {tutor?.profiles?.full_name || "معلم متميز"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>معلم معتمد وموثق</span>
                  </span>
                </div>

                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{tutor?.headline}</p>

                <div className="flex flex-wrap gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{tutor?.university}</span>
                  </span>
                  <span className="bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    التخصص: <strong className="text-slate-700 dark:text-slate-200">{tutor?.major}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Rating & Share Column */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-4 sm:pt-0">
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3.5 py-1.5 rounded-2xl text-amber-700 dark:text-amber-400 font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{tutor?.rating_avg || "5.0"}</span>
                <span className="text-slate-400 text-xs font-normal">({tutor?.rating_count || 0} تقييم)</span>
              </div>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>مشاركة الصفحة</span>
              </button>
            </div>

          </div>

          {/* Bio */}
          {tutor?.bio && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-300">نبذة عن أسلوب الشرح والتدريس:</h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {tutor?.bio}
              </p>
            </div>
          )}
        </div>

        {/* ── Services / Available Sessions ── */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span>الحصص والكورسات المتاحة للحجز ({services.length})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">اختر الحصة المناسبة لحجز موعد مباشر مع المعلم.</p>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="bg-white dark:bg-[#0b0f19] border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm shadow-xs">
              لا توجد حصص منشورة من قبل المعلم في الوقت الحالي.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-3xl p-5 sm:p-6 transition shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-black">
                        {service.subject_name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{service.duration_minutes} دقيقة</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">{service.title}</h3>
                    
                    {service.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-bold">رسوم الجلسة</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{service.price} <span className="text-xs font-normal text-slate-400">شيكل</span></span>
                    </div>

                    <button
                      onClick={() => {
                        if (!user) {
                          const nextUrl = `/tutors/${tutorId}?book=true&service=${service.id}`;
                          router.push(`/auth?next=${encodeURIComponent(nextUrl)}`);
                          return;
                        }
                        setSelectedService(service);
                        setBookingSuccess(null);
                        setBookingError("");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>احجز موعداً</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── Student Reviews & Feedback ── */}
        <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">تقييمات وآراء الطلاب ⭐</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تجارب حقيقية من الطلاب الذين أتموا جلسات دراسية خصوصية مع هذا المعلم.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3.5 py-1.5 rounded-2xl text-amber-700 dark:text-amber-400 font-black text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{tutor?.rating_avg || "5.0"} من 5</span>
              <span className="text-slate-400 text-xs font-normal">({reviews.length} تقييم مسجل)</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 space-y-2 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <Star className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">لا توجد تقييمات منشورة بعد لهذا المعلم.</p>
              <p className="text-[11px] text-slate-400">كن أول من يحجز حصة ويترك تقييماً ورأياً في أسلوب الشرح!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev, idx) => {
                const studentName = rev.profiles?.full_name || "طالب جامعي";
                const dateStr = rev.created_at
                  ? new Date(rev.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric", year: "numeric" })
                  : "";

                return (
                  <div
                    key={rev.id || idx}
                    className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                          {studentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{studentName}</h4>
                          {dateStr && <span className="text-[10px] text-slate-400 block font-mono" dir="ltr">{dateStr}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className={`w-3.5 h-3.5 ${
                              sIdx < (rev.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-white dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80 whitespace-pre-line">
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Modal: Booking Modal ── */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {bookingSuccess ? (
                <div className="text-center py-6 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">تم إرسال طلب الحجز للمعلم بنجاح! ⏳</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                      تم إشعار المعلم بطلبك وموعدك المقترح. سيقوم المعلم بتأكيد الموعد الدقيق وتجهيز رابط Google Meet. ستتلقى إشعاراً فورياً، ويُفتح زر الدخول قبل الحصة بـ 5 دقائق.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => router.push("/sessions")}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer"
                    >
                      متابعة حالة الحجز في صفحة حصصي 📅
                    </button>
                    <button
                      onClick={() => {
                        setSelectedService(null);
                        setBookingSuccess(null);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 transition"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">حجز حصة: {selectedService.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      المساق: <strong className="text-indigo-600">{selectedService.subject_name}</strong> • المدة: {selectedService.duration_minutes} دقيقة
                    </p>
                  </div>

                  {bookingError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleBookSession} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">حدد تاريخ وموعد الجلسة المفضل</label>
                      <input
                        type="datetime-local"
                        required
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسمك الكامل</label>
                        <input
                          type="text"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder={user?.user_metadata?.full_name || "اسم الطالب"}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف / واتساب</label>
                        <input
                          type="text"
                          required
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value)}
                          placeholder="059XXXXXXX"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظاتك ومواضيع التركيز (اختياري)</label>
                      <textarea
                        rows={2}
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder="مثال: مراجعة الشباتر 3 و 4 وحل أسئلة سنوات سابقة..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-500/20 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">المبلغ الإجمالي للحجز:</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">{selectedService.price} ₪</span>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedService(null)}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      {!user ? (
                        <button
                          type="button"
                          onClick={() => {
                            const nextUrl = `/tutors/${tutorId}?book=true${selectedService ? `&service=${selectedService.id}` : ""}`;
                            router.push(`/auth?next=${encodeURIComponent(nextUrl)}`);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>تسجيل الدخول لتأكيد الحجز والدفع 🚀</span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={bookingLoading}
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد الحجز والدفع 🚀"}
                        </button>
                      )}
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Share Profile Modal ── */}
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
                <h2 className="text-xl font-black text-slate-900 dark:text-white">مشاركة صفحة المعلم 🚀</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  شارك بطاقة ورسالة الدعوة مع زملائك على واتساب وتيليجرام لحجز الحصص فوراً.
                </p>
              </div>

              {/* Message Live Preview Card */}
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                  <span>معاينة نص الدعوة:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">جاهز للنشر</span>
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
                  href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/tutors/${tutorId}` : "")}&text=${encodeURIComponent(getShareText())}`}
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

    </main>
  );
}

export default function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tutorId } = use(params);
  return (
    <Suspense fallback={null}>
      <TutorProfileContent tutorId={tutorId} />
    </Suspense>
  );
}

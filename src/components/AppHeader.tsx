"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { 
  Package, Store, BookOpen, Download, Crown, 
  History, User, Sun, Moon, LogOut, LayoutDashboard,
  GraduationCap, Video, PenTool, ChevronDown, Menu, X,
  Sparkles, CheckCircle2, Shield, HelpCircle, Zap, Palette, Layers
} from "lucide-react";
import StudentProfileModal from "@/components/StudentProfileModal";
import { createClient } from "@/lib/supabase";

interface AppHeaderProps {
  quota?: number | null;
  activePage?: "dashboard" | "summarize" | "tasks" | "notebook" | "plans" | "ytdl" | "marketplace" | "history" | "profile" | "tutor" | "sessions" | "study" | "kiosk";
}

export default function AppHeader({ quota = null, activePage }: AppHeaderProps) {
  const { user, session, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isTutor, setIsTutor] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [studyMenuOpen, setStudyMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const studyMenuRef = useRef<HTMLDivElement>(null);
  const servicesMenuRef = useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [fetchedQuota, setFetchedQuota] = useState<number | null>(() => {
    if (quota !== null && quota !== undefined) return quota;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("cached_user_quota");
      if (cached !== null && !isNaN(Number(cached))) return Number(cached);
    }
    return null;
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (quota !== null && quota !== undefined) {
      setFetchedQuota(quota);
    }
  }, [quota]);

  // Robust Quota Synchronization (API + Direct Supabase Fallback)
  useEffect(() => {
    if (!session?.user?.id) return;

    let isSubscribed = true;

    const syncQuota = async () => {
      // 1. Try Backend API
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.quota_remaining !== undefined && isSubscribed) {
            setFetchedQuota(data.quota_remaining);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("cached_user_quota", String(data.quota_remaining));
                if (data.plan_name) localStorage.setItem("cached_user_plan", data.plan_name);
              } catch {}
            }
            return;
          }
        }
      } catch {}

      // 2. Direct Supabase Fallback (Bulletproof if API returns 502/down)
      try {
        const supabase = createClient();
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("*, subscription_plans(*)")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .gte("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subData?.subscription_plans && isSubscribed) {
          const remaining = Math.max(0, (subData.subscription_plans.lecture_quota || 0) - (subData.lectures_used || 0));
          setFetchedQuota(remaining);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cached_user_quota", String(remaining));
              localStorage.setItem("cached_user_plan", subData.subscription_plans.name);
            } catch {}
          }
          return;
        }

        // 3. Direct Profiles Fallback
        const { data: prof } = await supabase
          .from("profiles")
          .select("quota_remaining")
          .eq("id", session.user.id)
          .maybeSingle();

        if (prof && prof.quota_remaining !== undefined && isSubscribed) {
          setFetchedQuota(prof.quota_remaining);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cached_user_quota", String(prof.quota_remaining));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Direct Supabase quota sync in AppHeader:", err);
      }
    };

    syncQuota();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "cached_user_quota" && e.newValue !== null) {
        setFetchedQuota(Number(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      isSubscribed = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [session]);

  const effectiveQuota = useMemo(() => {
    if (quota !== null && quota !== undefined) return quota;
    if (fetchedQuota !== null) return fetchedQuota;
    if (isMounted && typeof window !== "undefined") {
      const cached = localStorage.getItem("cached_user_quota");
      if (cached !== null && !isNaN(Number(cached))) {
        return Number(cached);
      }
    }
    return null;
  }, [quota, fetchedQuota, isMounted]);

  useEffect(() => {
    if (session?.access_token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/tutoring/my-status`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.is_tutor || data.status === "approved") {
            setIsTutor(true);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // Close user menu & mobile menu on outside click
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (studyMenuRef.current && !studyMenuRef.current.contains(event.target as Node)) {
        setStudyMenuOpen(false);
      }
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(event.target as Node)) {
        setServicesMenuOpen(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    {
      id: "dashboard",
      label: "الرئيسية",
      icon: LayoutDashboard,
      path: isTutor ? "/tutor/dashboard" : "/dashboard",
      show: true,
    },
    {
      id: "summarize",
      label: "لمّاح بخططلك",
      icon: Sparkles,
      path: "/summarize",
      show: !isTutor,
    },
    {
      id: "tutor",
      label: "لوحة المعلم",
      icon: GraduationCap,
      path: "/tutor/dashboard",
      show: isTutor,
      highlight: true,
    },
    {
      id: "notebook",
      label: "الدفتر",
      icon: BookOpen,
      path: "/notebook",
      show: true,
    },
    {
      id: "study",
      label: "دوّن ملاحظاتك",
      icon: PenTool,
      path: "/study",
      show: true,
    },
    {
      id: "marketplace",
      label: "المتجر",
      icon: Package,
      path: "/marketplace",
      show: true,
    },
    {
      id: "kiosk",
      label: "كشك المشاريع",
      icon: Store,
      path: "/kiosk",
      show: true,
      badge: "جديد",
    },
    {
      id: "sessions",
      label: "حصصي",
      icon: Video,
      path: "/sessions",
      show: false,
      badge: "قريباً",
    },
    {
      id: "ytdl",
      label: "تحميل MP3",
      icon: Download,
      path: "/ytdl",
      show: false,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 sm:pt-4 pb-2" dir="rtl">
      <nav 
        ref={navRef}
        className={`bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 max-w-7xl mx-auto transition-all duration-300 relative ${
          mobileMenuOpen
            ? "rounded-3xl shadow-xl border-slate-300 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/10"
            : "rounded-full shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* ── ZONE 1: Logo & Brand ── */}
          <div 
            className="flex items-center cursor-pointer group shrink-0 gap-2.5" 
            onClick={() => router.push(isTutor ? "/tutor/dashboard" : "/dashboard")} 
            title={isTutor ? "لوحة المعلم" : "العودة للوحة التحكم"}
          >
            <div className="relative">
              <img 
                src="/lammah-logo.png" 
                alt="Lammah" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">لمّاح</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white tracking-wider shadow-2xs">AI</span>
            </div>
          </div>

          {/* ── ZONE 2: Primary Clean Navigation Tabs (Desktop & Laptop) ── */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-2xs">
            
            {/* 1. الرئيسية */}
            <button
              onClick={() => router.push(isTutor ? "/tutor/dashboard" : "/dashboard")}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activePage === "dashboard"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 ${activePage === "dashboard" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} />
              <span>الرئيسية</span>
            </button>

            {/* 2. لمّاح بخططلك (Hero Action) */}
            {!isTutor && (
              <button
                onClick={() => router.push("/summarize")}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activePage === "summarize"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${activePage === "summarize" ? "text-white" : "text-indigo-500"}`} />
                <span>لمّاح بخططلك</span>
              </button>
            )}

            {/* 3. مسار الهايلايتر (New Aesthetic Tasks Feature) */}
            <button
              onClick={() => router.push("/tasks")}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activePage === "tasks"
                  ? "bg-gradient-to-r from-amber-400/20 to-pink-400/20 text-slate-900 dark:text-white border border-amber-400/50 dark:border-pink-500/40 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <Palette className={`w-3.5 h-3.5 ${activePage === "tasks" ? "text-amber-500" : "text-pink-500"}`} />
              <span>مسار الهايلايتر</span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white shadow-2xs">
                جديد 🎨
              </span>
            </button>

            {/* 4. Dropdown: استوديو الدراسة (الدفاتر + الملاحظات) */}
            <div className="relative" ref={studyMenuRef}>
              <button
                onClick={() => {
                  setStudyMenuOpen(!studyMenuOpen);
                  setServicesMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activePage === "notebook" || activePage === "study" || studyMenuOpen
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>استوديو الدراسة</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${studyMenuOpen ? "rotate-180 text-indigo-600" : ""}`} />
              </button>

              {studyMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#0c111d]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => { setStudyMenuOpen(false); router.push("/notebook"); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-right ${
                      activePage === "notebook"
                        ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <div>دفاتر المحاضرات</div>
                      <div className="text-[10px] text-slate-400 font-normal">المحاضرات والملخصات المحفوظة</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setStudyMenuOpen(false); router.push("/study"); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer mt-1 text-right ${
                      activePage === "study"
                        ? "bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <PenTool className="w-4 h-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <div>دوّن ملاحظاتك</div>
                      <div className="text-[10px] text-slate-400 font-normal">مساحة المذاكرة والتركيز الذكية</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Dropdown: خدمات الجامعة (كشك المشاريع + المتجر + المعلمون) */}
            <div className="relative" ref={servicesMenuRef}>
              <button
                onClick={() => {
                  setServicesMenuOpen(!servicesMenuOpen);
                  setStudyMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activePage === "kiosk" || activePage === "marketplace" || activePage === "sessions" || servicesMenuOpen
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10"
                }`}
              >
                <Store className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>خدمات الجامعة</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${servicesMenuOpen ? "rotate-180 text-indigo-600" : ""}`} />
              </button>

              {servicesMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white/95 dark:bg-[#0c111d]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <button
                    onClick={() => { setServicesMenuOpen(false); router.push("/kiosk"); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-right ${
                      activePage === "kiosk"
                        ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Store className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="min-w-0">
                        <div>كشك المشاريع</div>
                        <div className="text-[10px] text-slate-400 font-normal">مشاريع وأفكار تخرج جاهزة</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      جديد
                    </span>
                  </button>

                  <button
                    onClick={() => { setServicesMenuOpen(false); router.push("/marketplace"); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer mt-1 text-right ${
                      activePage === "marketplace"
                        ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <Package className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <div>سوق الملخصات</div>
                      <div className="text-[10px] text-slate-400 font-normal">متجر بيع وشراء الدوسيات</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setServicesMenuOpen(false); router.push("/tutors"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer mt-1 text-right"
                  >
                    <GraduationCap className="w-4 h-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <div>المعلمون الخصوصيون</div>
                      <div className="text-[10px] text-slate-400 font-normal">حصص ومساعدة من نخبة المعلمين</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ── ZONE 3: Quota, Quick Tools & User Profile Menu ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quota Badge (Always Visible for logged-in users on all screen sizes) */}
            {user && (
              <div 
                suppressHydrationWarning
                className={`border rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all duration-200 ${
                  (effectiveQuota ?? 0) > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-emerald-500/10"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 hover:border-amber-300"
                }`}
                onClick={() => router.push("/plans")}
                title="رصيد الدقائق المشحونة - اضغط لعرض الباقات والشحن"
              >
                <Zap className={`w-3.5 h-3.5 shrink-0 fill-current ${(effectiveQuota ?? 0) > 0 ? "text-amber-500 animate-pulse" : "text-amber-500"}`} />
                <span className="font-bold text-slate-500 dark:text-slate-400 hidden md:inline">الرصيد:</span>
                <span className={`font-black ${(effectiveQuota ?? 0) > 0 ? "text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm" : "text-amber-600 dark:text-amber-400 text-xs sm:text-sm"}`}>
                  {effectiveQuota !== null ? effectiveQuota : "..."}
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">دقيقة</span>
              </div>
            )}


            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer" 
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* User Profile Dropdown Menu or Sign In */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 p-1.5 pr-2 pl-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
                    userMenuOpen || activePage === "profile"
                      ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/50 shadow-xs ring-2 ring-indigo-500/20"
                      : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
                  }`}
                  title="قائمة الحساب"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs ring-1 ring-white/20 shrink-0">
                    {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""}`} />
                </button>

                {/* Floating Dropdown Card */}
                {userMenuOpen && (
                  <div className="absolute left-0 mt-2.5 w-72 sm:w-80 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-950/15 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* User Profile Header Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/15 dark:via-purple-500/10 dark:to-transparent border border-indigo-100/80 dark:border-indigo-500/20 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-base font-black shadow-md shadow-indigo-500/25 ring-2 ring-white dark:ring-slate-800 shrink-0">
                          {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "حسابي"}
                            </h4>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shrink-0">
                              {isTutor ? "معلم" : "طالب"}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5 text-right" dir="ltr">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>

                      {/* Explicit Balance in Header Card */}
                      <div className="mt-2.5 pt-2 border-t border-indigo-100/60 dark:border-indigo-500/20 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الرصيد المشحون:</span>
                        <span className={`font-black px-2.5 py-0.5 rounded-full border text-[11px] flex items-center gap-1 ${
                          (effectiveQuota ?? 0) > 0
                            ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/40"
                            : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/40"
                        }`}>
                          <Zap className="w-3 h-3 fill-current text-amber-500" />
                          <span>{effectiveQuota !== null ? `${effectiveQuota} دقيقة` : "..."}</span>
                        </span>
                      </div>
                    </div>

                    {/* Menu Items List */}
                    <div className="space-y-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/profile"); }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                          activePage === "profile" 
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="whitespace-nowrap">الملف الشخصي والإعدادات</span>
                        </div>
                      </button>

                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/plans"); }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                          activePage === "plans" 
                            ? "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-2xs" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                            <Crown className="w-4 h-4" />
                          </div>
                          <span className="whitespace-nowrap">باقات الاشتراك والرصيد</span>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-2xs shrink-0">ترقية</span>
                      </button>

                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/history"); }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                          activePage === "history" 
                            ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-2xs" 
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                            <History className="w-4 h-4" />
                          </div>
                          <span className="whitespace-nowrap">سجل العمليات والمحاضرات</span>
                        </div>
                      </button>

                      {isTutor && (
                        <button
                          onClick={() => { setUserMenuOpen(false); router.push("/tutor/dashboard"); }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                            activePage === "tutor" 
                              ? "bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-2xs" 
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <span className="whitespace-nowrap">لوحة تحكم المعلم</span>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => { setUserMenuOpen(false); router.push("/faq"); }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-2xs">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <span className="whitespace-nowrap">الأسئلة الشائعة والمساعدة</span>
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 my-2 mx-1"></div>

                    {/* Sign Out Button */}
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut();
                        router.replace("/login");
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span>تسجيل الخروج</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                تسجيل الدخول
              </button>
            )}


            {/* Mobile Menu Toggle Button (Visible on screens < lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer"
              title="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* ── MOBILE ACCORDION MENU (Screens < lg) ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="lg:hidden mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 overflow-hidden space-y-3"
            >
              {/* Category 1: Quick Access */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">
                  الروابط السريعة
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push(isTutor ? "/tutor/dashboard" : "/dashboard"); }}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                      activePage === "dashboard"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200 dark:border-indigo-800"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                    <span className="text-[11px] font-bold">الرئيسية</span>
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/summarize"); }}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                      activePage === "summarize"
                        ? "bg-indigo-600 text-white font-black shadow-xs"
                        : "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold">لمّاح بخططلك</span>
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/tasks"); }}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                      activePage === "tasks"
                        ? "bg-amber-100/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 font-black border border-amber-300"
                        : "bg-amber-50/70 dark:bg-white/5 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    <Palette className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold">الهايلايتر 🎨</span>
                  </button>
                </div>
              </div>

              {/* Category 2: Study Studio */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">
                  استوديو الدراسة
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/notebook"); }}
                    className={`p-2.5 rounded-xl flex items-center gap-2.5 text-right transition cursor-pointer ${
                      activePage === "notebook"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200 dark:border-indigo-800"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">الدفاتر والملازم</div>
                      <div className="text-[10px] text-slate-400 truncate">محاضراتك المحفوظة</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/study"); }}
                    className={`p-2.5 rounded-xl flex items-center gap-2.5 text-right transition cursor-pointer ${
                      activePage === "study"
                        ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black border border-purple-200 dark:border-purple-800"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <PenTool className="w-4 h-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">دوّن ملاحظاتك</div>
                      <div className="text-[10px] text-slate-400 truncate">مساحة التركيز</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Category 3: Campus Services */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">
                  خدمات الجامعة
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/kiosk"); }}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                      activePage === "kiosk"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-200"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Store className="w-4 h-4 text-emerald-500" />
                    <span className="text-[11px] font-bold">كشك المشاريع</span>
                    <span className="text-[8px] font-black px-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      جديد
                    </span>
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/marketplace"); }}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition cursor-pointer ${
                      activePage === "marketplace"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200"
                        : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Package className="w-4 h-4 text-indigo-500" />
                    <span className="text-[11px] font-bold">متجر الملخصات</span>
                  </button>

                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push("/tutors"); }}
                    className="p-2 rounded-xl flex flex-col items-center gap-1 text-center transition cursor-pointer bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                  >
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                    <span className="text-[11px] font-bold">المعلمون</span>
                  </button>
                </div>
              </div>

              {/* Clean Quick Footer Bar inside Mobile Menu */}
              <div className="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs px-2 text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-600 dark:text-slate-300">
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>الرصيد المشحون: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{effectiveQuota ?? 0} دقيقة</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>الملف الشخصي</span>
                  <span>←</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>

      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        session={session}
      />
    </header>
  );
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Package, Store, BookOpen, Download, Crown, 
  History, User, Sun, Moon, LogOut, LayoutDashboard,
  GraduationCap, Video, PenTool, ChevronDown, Menu, X,
  Sparkles, CheckCircle2, Shield, HelpCircle, Zap, Clock, Palette, Layers, CheckSquare
} from "lucide-react";
import { createClient } from "@/lib/supabase";

interface AppHeaderProps {
  quota?: number | null;
  activePage?: "dashboard" | "summarize" | "tasks" | "notebook" | "plans" | "ytdl" | "marketplace" | "history" | "profile" | "tutor" | "sessions" | "study" | "kiosk";
}

export default function AppHeader({ quota = null, activePage: propActivePage }: AppHeaderProps) {
  const { user, session, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Self-reliant Active Page deduction from current URL
  const activePage = useMemo(() => {
    if (propActivePage) return propActivePage;
    if (!pathname) return "dashboard";
    if (pathname.startsWith("/tutor")) return "tutor";
    if (pathname.startsWith("/summarize")) return "summarize";
    if (pathname.startsWith("/study")) return "study";
    if (pathname.startsWith("/notebook")) return "notebook";
    if (pathname.startsWith("/tasks")) return "tasks";
    if (pathname.startsWith("/kiosk")) return "kiosk";
    if (pathname.startsWith("/marketplace")) return "marketplace";
    if (pathname.startsWith("/plans")) return "plans";
    if (pathname.startsWith("/history")) return "history";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/sessions")) return "sessions";
    if (pathname.startsWith("/ytdl")) return "ytdl";
    if (pathname.startsWith("/dashboard")) return "dashboard";
    return undefined;
  }, [pathname, propActivePage]);
  const [isTutor, setIsTutor] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [optimisticTab, setOptimisticTab] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync optimistic tab whenever pathname or activePage changes
  useEffect(() => {
    setOptimisticTab(null);
  }, [pathname, activePage]);

  const currentTab = optimisticTab || activePage || "dashboard";

  const [isMounted, setIsMounted] = useState(false);
  const [fetchedQuota, setFetchedQuota] = useState<number | null>(() => {
    if (quota !== null && quota !== undefined) return quota;
    return null;
  });

  useEffect(() => {
    setIsMounted(true);
    if (quota === null || quota === undefined) {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("cached_user_quota");
        if (cached !== null && !isNaN(Number(cached))) {
          setFetchedQuota(Number(cached));
        }
      }
    }
  }, [quota]);

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/subscription/quota`, {
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tutoring/my-status`, {
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
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Proactive background prefetching for instantaneous 0ms perceived latency
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/summarize");
    router.prefetch("/notebook");
    router.prefetch("/tasks");
    router.prefetch("/study");
    router.prefetch("/kiosk");
    router.prefetch("/marketplace");
    if (userMenuOpen) {
      router.prefetch("/profile");
      router.prefetch("/plans");
      router.prefetch("/history");
      router.prefetch("/faq");
      if (isTutor) router.prefetch("/tutor/dashboard");
    }
  }, [userMenuOpen, router, isTutor]);

  const navItems = useMemo(() => {
    if (isTutor) {
      return [
        { id: "tutor", label: "لوحة المعلم", icon: GraduationCap, path: "/tutor/dashboard", highlight: true },
        { id: "dashboard", label: "الرئيسية", icon: LayoutDashboard, path: "/dashboard" },
        { id: "notebook", label: "دفاتري", icon: BookOpen, path: "/notebook" },
        { id: "marketplace", label: "المتجر", icon: Package, path: "/marketplace" },
      ];
    }
    return [
      { id: "dashboard", label: "الرئيسية", icon: LayoutDashboard, path: "/dashboard" },
      { id: "summarize", label: "لمّاح بخططلك", icon: Sparkles, path: "/summarize", highlight: true },
      { id: "notebook", label: "دفاتري", icon: BookOpen, path: "/notebook" },
      { id: "tasks", label: "مهامي", icon: CheckSquare, path: "/tasks" },
      { id: "study", label: "الملاحظات", icon: PenTool, path: "/study" },
      { id: "kiosk", label: "كشك المشاريع", icon: Store, path: "/kiosk", badge: "جديد" },
      { id: "marketplace", label: "المتجر", icon: Package, path: "/marketplace" },
    ];
  }, [isTutor]);

  return (
    <header className="sticky top-0 z-50 w-full px-2 sm:px-6 pt-2.5 sm:pt-4 pb-2" dir="rtl">
      <nav 
        ref={navRef}
        className={`w-full bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 px-2.5 sm:px-6 py-1.5 sm:py-2.5 max-w-7xl mx-auto transition-all duration-300 relative ${
          mobileMenuOpen
            ? "rounded-3xl shadow-xl border-slate-300 dark:border-slate-700/80 ring-1 ring-black/5 dark:ring-white/10"
            : "rounded-full shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between gap-1.5 sm:gap-4 w-full">
          
          {/* ── ZONE 1: Logo & Brand ── */}
          <Link 
            href={isTutor ? "/tutor/dashboard" : "/dashboard"}
            prefetch={true}
            className="flex items-center cursor-pointer group shrink-0 gap-1.5 sm:gap-2.5" 
            title={isTutor ? "لوحة المعلم" : "العودة للوحة التحكم"}
          >
            <div className="relative shrink-0">
              <img 
                src="/lammah-logo.png" 
                alt="Lammah" 
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-black text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">لمّاح</span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white tracking-wider shadow-2xs">AI</span>
            </div>
          </Link>

          {/* ── ZONE 2: Clean Direct Single-Click Navigation Tabs (Desktop & Laptop) ── */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-2xs">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  prefetch={true}
                  onClick={() => setOptimisticTab(item.id)}
                  onMouseEnter={() => router.prefetch(item.path)}
                  onTouchStart={() => router.prefetch(item.path)}
                  className={`relative px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-transform duration-100 cursor-pointer active:scale-95 whitespace-nowrap select-none ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-300"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="appheader-active-pill"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200/70 dark:border-slate-700 -z-10"
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : item.highlight ? "text-indigo-500 animate-pulse" : "text-slate-500 dark:text-slate-400"
                  }`} />
                  <span className="relative z-10">{item.label}</span>
                  {item.badge && (
                    <span className="relative z-10 text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── ZONE 3: Quota, Quick Tools & User Profile Menu ── */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            
            {/* Quota Badge (Always Visible for logged-in users on all screen sizes) */}
            {user && (
              <Link 
                href="/plans"
                prefetch={true}
                suppressHydrationWarning
                className={`border rounded-full px-2 sm:px-3.5 py-1 sm:py-1.5 text-xs flex items-center gap-1 sm:gap-1.5 shadow-xs cursor-pointer transition-all duration-200 shrink-0 ${
                  (effectiveQuota ?? 0) > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-emerald-500/10"
                    : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 hover:border-amber-300"
                }`}
                title="رصيد الدقائق المشحونة - اضغط لعرض الباقات والشحن"
              >
                <Zap className={`w-3.5 h-3.5 shrink-0 fill-current ${(effectiveQuota ?? 0) > 0 ? "text-amber-500 animate-pulse" : "text-amber-500"}`} />
                <span className="font-bold text-slate-500 dark:text-slate-400 hidden md:inline">الرصيد:</span>
                <span suppressHydrationWarning className={`font-black ${(effectiveQuota ?? 0) > 0 ? "text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm" : "text-amber-600 dark:text-amber-400 text-xs sm:text-sm"}`}>
                  {effectiveQuota !== null ? effectiveQuota.toLocaleString("en-US") : "..."}
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs hidden sm:inline">دقيقة</span>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/10 p-1.5 sm:p-2 rounded-full transition-all cursor-pointer shrink-0 active:scale-95 duration-100" 
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />}
            </button>

            {/* User Profile Dropdown Menu or Sign In */}
            {user ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 sm:pr-2 sm:pl-2.5 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 ${
                    userMenuOpen || activePage === "profile"
                      ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/50 shadow-xs ring-2 ring-indigo-500/20"
                      : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
                  }`}
                  title="قائمة الحساب"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs ring-1 ring-white/20 shrink-0">
                    {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${userMenuOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""}`} />
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
                          <span suppressHydrationWarning>{effectiveQuota !== null ? `${effectiveQuota} دقيقة` : "..."}</span>
                        </span>
                      </div>
                    </div>

                    {/* Menu Items List */}
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        prefetch={true}
                        onClick={() => setUserMenuOpen(false)}
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
                      </Link>

                      <Link
                        href="/plans"
                        prefetch={true}
                        onClick={() => setUserMenuOpen(false)}
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
                      </Link>

                      <Link
                        href="/history"
                        prefetch={true}
                        onClick={() => setUserMenuOpen(false)}
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
                      </Link>

                      {isTutor && (
                        <Link
                          href="/tutor/dashboard"
                          prefetch={true}
                          onClick={() => setUserMenuOpen(false)}
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
                        </Link>
                      )}

                      <Link
                        href="/faq"
                        prefetch={true}
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-2xs">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <span className="whitespace-nowrap">الأسئلة الشائعة والمساعدة</span>
                        </div>
                      </Link>
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
              <Link
                href="/login"
                prefetch={true}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                تسجيل الدخول
              </Link>
            )}


            {/* Mobile Menu Toggle Button (Visible on screens < lg) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 p-1.5 sm:p-2 rounded-full transition-all cursor-pointer shrink-0"
              title="القائمة"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
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
              {/* Direct Single-Click Student Tools */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 px-2 uppercase tracking-wider">
                  الأقسام والخدمات الأكاديمية
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {navItems.map((item) => {
                    const isActive = currentTab === item.id;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        prefetch={true}
                        onClick={() => {
                          setOptimisticTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`p-2.5 rounded-xl flex items-center gap-2 text-right transition-transform active:scale-95 cursor-pointer ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                            : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? "bg-indigo-600 text-white" : "bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate flex items-center gap-1">
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[8px] font-black px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Clean Quick Footer Bar inside Mobile Menu */}
              <div className="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs px-2 text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-600 dark:text-slate-300">
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>الرصيد المشحون: <strong className="text-emerald-600 dark:text-emerald-400 font-black">{effectiveQuota ?? 0} دقيقة</strong></span>
                </div>
                <Link
                  href="/profile"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>الملف الشخصي</span>
                  <span>←</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </header>
  );
}

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
  Sparkles, CheckCircle2, Shield, HelpCircle
} from "lucide-react";
import StudentProfileModal from "@/components/StudentProfileModal";

interface AppHeaderProps {
  quota?: number | null;
  activePage?: "dashboard" | "summarize" | "notebook" | "plans" | "ytdl" | "marketplace" | "history" | "profile" | "tutor" | "sessions" | "study" | "kiosk";
}

export default function AppHeader({ quota = null, activePage }: AppHeaderProps) {
  const { user, session, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isTutor, setIsTutor] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Optimistic Instant Quota from localStorage cache (hydrates cleanly on mount)
  const effectiveQuota = useMemo(() => {
    if (quota !== null && quota !== undefined) {
      if (typeof window !== "undefined") {
        try { localStorage.setItem("cached_user_quota", String(quota)); } catch {}
      }
      return quota;
    }
    if (isMounted && typeof window !== "undefined") {
      const cached = localStorage.getItem("cached_user_quota");
      if (cached !== null && !isNaN(Number(cached))) {
        return Number(cached);
      }
    }
    return null;
  }, [quota, isMounted]);

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
      badge: "جديد 🔥",
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

          {/* ── ZONE 2: Primary Navigation Tabs (Desktop & Laptop) ── */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-2xs">
            {navItems.filter(item => item.show).map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              const isComingSoon = item.id === "sessions";
              return (
                <button
                  key={item.id}
                  disabled={isComingSoon}
                  onClick={() => {
                    if (isComingSoon) return;
                    router.push(item.path);
                  }}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 ${
                    isComingSoon
                      ? "opacity-60 cursor-default"
                      : "cursor-pointer"
                  } ${
                    isActive
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10"
                  }`}
                  title={isComingSoon ? "الحصص الخاصة قادمة قريباً" : item.label}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/10">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── ZONE 3: Quota, Quick Tools & User Profile Menu ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quota Badge */}
            {effectiveQuota !== null && (
              <div 
                suppressHydrationWarning
                className="bg-indigo-50/90 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
                onClick={() => router.push("/plans")}
                title="اضغط لشحن أو ترقية رصيد الدقائق"
              >
                <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-500 dark:text-slate-400 hidden xl:inline font-bold">رصيدك:</span>
                <span className={`font-black ${effectiveQuota > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{effectiveQuota}</span>
                <span className="text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">دقيقة</span>
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

            {/* User Profile Dropdown Menu */}
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
              className="lg:hidden mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 p-1 pb-1">
                {navItems.filter(item => item.show).map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  const isComingSoon = item.id === "sessions";
                  return (
                    <button
                      key={item.id}
                      disabled={isComingSoon}
                      onClick={() => {
                        if (isComingSoon) return;
                        setMobileMenuOpen(false);
                        router.push(item.path);
                      }}
                      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 relative overflow-hidden ${
                        isComingSoon
                          ? "opacity-50 cursor-default"
                          : "cursor-pointer active:scale-[0.98]"
                      } ${
                        isActive
                          ? "bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs font-black"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex flex-col items-start min-w-0 flex-1 text-right">
                        <span className="truncate w-full font-bold text-xs">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 mt-0.5">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Clean Quick Footer Bar inside Mobile Menu */}
              <div className="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs px-2 text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-600 dark:text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>رصيد التلخيص: <strong className="text-indigo-600 dark:text-indigo-400">{effectiveQuota ?? 0}</strong></span>
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

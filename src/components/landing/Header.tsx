"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Sun, Moon, ArrowLeft, Menu, X, GraduationCap, ChevronDown, Users, LayoutDashboard, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function Header({ user }: { user?: any }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isTutor, setIsTutor] = useState(false);
  const [tutorsDropdownOpen, setTutorsDropdownOpen] = useState(false);
  const [isNavigatingAuth, setIsNavigatingAuth] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    router.prefetch("/auth");
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    if (user) {
      // Check if user is an approved tutor
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tutoring/my-status`, {
        headers: { "Authorization": `Bearer ${user.access_token || ""}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.is_tutor || data.status === "approved") {
            setIsTutor(true);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled((prev) => {
            const next = window.scrollY > 15;
            return prev !== next ? next : prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnterTutors = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTutorsDropdownOpen(true);
  };

  const handleMouseLeaveTutors = () => {
    timeoutRef.current = setTimeout(() => {
      setTutorsDropdownOpen(false);
    }, 180);
  };

  const navItems = [
    { label: "المميزات", href: "/#features", isTutorsTab: false, badge: "" },
    { label: "الأسعار", href: "/#pricing", isTutorsTab: false, badge: "" },
    { label: "كشك المشاريع", href: "/kiosk", isTutorsTab: false, badge: "جديد" },
    { label: "المتجر", href: "/marketplace", isTutorsTab: false, badge: "" },
    { label: "دوّن ملاحظاتك", href: "/study", isTutorsTab: false, badge: "" },
    { label: "الأسئلة الشائعة", href: "/faq", isTutorsTab: false, badge: "" },
  ];

  return (
    <header className="sticky top-5 z-50 max-w-5xl mx-auto px-4 w-full" dir="rtl">
      {/* ── Floating Glass Bar ─────────────────────────────────── */}
      <div
        className={`w-full h-14 rounded-full border transition-all duration-300 px-4 sm:px-5 flex items-center justify-between backdrop-blur-xl relative ${
          scrolled
            ? "bg-white/95 dark:bg-[#0B0F19]/95 border-indigo-200/60 dark:border-indigo-500/30 shadow-[0_12px_40px_rgba(99,102,241,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            : "bg-white/90 dark:bg-[#0B0F19]/85 border-slate-200/90 dark:border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Top Radiant Sheen (Clipped to rounded-full) */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-indigo-400/40 to-transparent pointer-events-none" />
        </div>

        {/* ── 1. Right: Logo + Star Accent ──────────────────────── */}
        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/lammah-logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                ل<span className="text-yellow-500">مّ</span>اح
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold border border-indigo-100 dark:border-indigo-500/30">
                AI
              </span>
            </div>
          </Link>

          {/* Star Accent next to Logo */}
          <svg
            className="hidden sm:block w-3.5 h-3.5 text-indigo-500/45 dark:text-indigo-400/55 animate-pulse"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        {/* ── 2. Center: Elegant Segmented Pill Nav ─────────────── */}
        <nav className="hidden md:flex relative z-10 items-center p-1 rounded-full bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shadow-2xs">
          {navItems.map((item, idx) => (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => {
                setHoveredIdx(idx);
                if (item.isTutorsTab) handleMouseEnterTutors();
              }}
              onMouseLeave={() => {
                setHoveredIdx(null);
                if (item.isTutorsTab) handleMouseLeaveTutors();
              }}
            >
              {(hoveredIdx === idx || (item.isTutorsTab && tutorsDropdownOpen)) && (
                <motion.div
                  layoutId="hover-pill"
                  className="absolute inset-0 bg-white dark:bg-white/[0.1] rounded-full shadow-xs border border-slate-200/60 dark:border-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Link
                href={item.isTutorsTab ? "#" : item.href}
                onClick={(e) => {
                  if (item.isTutorsTab) {
                    e.preventDefault();
                    setTutorsDropdownOpen((prev) => !prev);
                  }
                }}
                className={`relative z-10 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  item.isTutorsTab && tutorsDropdownOpen
                    ? "text-indigo-600 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {item.badge}
                  </span>
                )}
                {item.isTutorsTab && (
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${
                      tutorsDropdownOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                    }`}
                  />
                )}
              </Link>

              {/* Tutors Dropdown Menu with Teach Button inside */}
              {item.isTutorsTab && (
                <AnimatePresence>
                  {tutorsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute top-full mt-2.5 right-1/2 translate-x-1/2 w-72 sm:w-80 p-2.5 rounded-3xl bg-white/95 dark:bg-[#0E1322]/95 border border-slate-200/90 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl z-50 text-right"
                      onMouseEnter={handleMouseEnterTutors}
                      onMouseLeave={handleMouseLeaveTutors}
                    >
                      {/* Top subtle glow line */}
                      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/15 to-transparent pointer-events-none" />

                      {/* Option 1: Browse Tutors (Non-clickable Informative Preview) */}
                      <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 cursor-default select-none">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              دليل المعلمين
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/10">
                              قريباً
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                            احجز شروحات ومراجعات خاصة مع متفوقين
                          </p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="my-1.5 h-[1px] bg-slate-100 dark:bg-white/[0.06]" />

                      {/* Option 2: Teach With Us (Non-clickable Informative Preview) */}
                      <div className="block p-3 rounded-2xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 cursor-default select-none">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                  درّس معنا كمعلم
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                  قريباً
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                انضم لنخبة المعلمين وابدأ التدريس وجني الأرباح
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* ── 3. Left: Star Accent + Theme + CTA ────────────────── */}
        <div className="hidden md:flex relative z-10 items-center gap-2.5 shrink-0">
          {/* Star Accent before CTA buttons */}
          <svg
            className="w-3.5 h-3.5 text-purple-500/40 dark:text-purple-300/50 animate-pulse"
            style={{ animationDelay: "1s" }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>


          {/* Light / Dark Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            title={theme === "dark" ? "تفعيل الوضع الفاتح ☀️" : "تفعيل الوضع الليلي 🌙"}
            aria-label="تبديل الثيم"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Auth / CTA Button */}
          {user ? (
            <div className="flex items-center gap-2">
              {isTutor ? (
                <Link
                  href="/tutor/dashboard"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>لوحة المعلم</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>لوحة التحكم</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth"
                prefetch={true}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer"
              >
                دخول
              </Link>
              <Link
                href="/auth"
                prefetch={true}
                onClick={() => setIsNavigatingAuth(true)}
                className={`px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isNavigatingAuth
                    ? "bg-indigo-700 text-white opacity-90 scale-95 pointer-events-none"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white hover:shadow-indigo-500/20"
                }`}
              >
                {isNavigatingAuth ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التحويل...</span>
                  </>
                ) : (
                  <>
                    <span>ابدأ مجاناً</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </Link>
            </>
          )}
        </div>

        {/* ── 4. Mobile Menu Toggle (STRICTLY HIDDEN ON DESKTOP) ── */}
        <div className="hidden max-md:flex md:hidden mobile-only relative z-10 items-center gap-1.5">

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 cursor-pointer"
            title={theme === "dark" ? "تفعيل الوضع الفاتح ☀️" : "تفعيل الوضع الليلي 🌙"}
            aria-label="تبديل الثيم"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── 5. Mobile Drawer (STRICTLY HIDDEN ON DESKTOP) ─────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden max-md:block md:hidden mobile-only mt-2 bg-white/95 dark:bg-[#0B0F19]/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-right space-y-3"
          >
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {navItems.map((item, idx) => {
                if (item.isTutorsTab) {
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 space-y-2.5 my-1"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          المعلمين
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            قريباً
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-0.5">
                        <div
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-default select-none"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>دليل المعلمين</span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full">قريباً</span>
                        </div>

                        {/* Featured Preview: درّس معنا */}
                        <div
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-default select-none"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-slate-400" />
                            <span>درّس معنا كمعلم</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-white/10 px-1.5 py-0.5 rounded-full">قريباً</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-center text-xs shadow-md"
              >
                ابدأ دراستك الآن مجاناً
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

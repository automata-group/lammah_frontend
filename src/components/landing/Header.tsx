"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Sun, Moon, ArrowLeft, Menu, X, GraduationCap, LayoutDashboard, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  user?: any;
}

export default function Header({ user: propUser }: HeaderProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser, session } = useAuth();
  const user = propUser !== undefined ? propUser : authUser;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeHash, setActiveHash] = useState<string>("");
  const [isTutor, setIsTutor] = useState(false);
  const [isNavigatingAuth, setIsNavigatingAuth] = useState(false);

  // 1. Proactive Route Prefetching (0ms Network Latency)
  useEffect(() => {
    router.prefetch("/auth");
    router.prefetch("/dashboard");
    router.prefetch("/faq");
    if (isTutor) router.prefetch("/tutor/dashboard");
  }, [router, isTutor]);

  // 2. Fetch Tutor Role for CTA routing
  useEffect(() => {
    if (session?.access_token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tutoring/my-status`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && (data.is_tutor || data.status === "approved")) {
            setIsTutor(true);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // 3. Scroll Header Elevation State
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 15);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 4. Section Observer on Landing Page for Active Hash
  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    // Initialize from window location hash
    if (window.location.hash) {
      setActiveHash(window.location.hash.replace("#", ""));
    }

    const sections = ["features", "pricing"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHash(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleHashChange = () => {
      setActiveHash(window.location.hash.replace("#", ""));
    };
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);

  // Navigation Items (Pure and Clean - Guest Conversion Focused)
  const navItems = [
    { label: "المميزات", href: "/#features", badge: "" },
    { label: "الأسعار", href: "/#pricing", badge: "" },
    { label: "الأسئلة الشائعة", href: "/faq", badge: "" },
  ];

  // Calculate Active Tab Index
  const activeIdx = navItems.findIndex((item) => {
    if (item.href.startsWith("/#")) {
      return pathname === "/" && activeHash === item.href.replace("/#", "");
    }
    return pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
  });

  const currentPillIdx = hoveredIdx !== null ? hoveredIdx : activeIdx;

  // Smart Smooth Scroll for Hash Navigation on the Home Route
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("/#") && pathname === "/") {
        e.preventDefault();
        const targetId = href.replace("/#", "");
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const headerOffset = 100;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
          window.history.pushState(null, "", `#${targetId}`);
          setActiveHash(targetId);
        }
      }
      setMobileMenuOpen(false);
    },
    [pathname]
  );

  return (
    <header className="sticky top-5 z-50 max-w-5xl mx-auto px-4 w-full select-none mb-6 sm:mb-8" dir="rtl">
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
          <Link
            href="/"
            className="flex items-center gap-2 group active:scale-95 transition-transform duration-100"
          >
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

        {/* ── 2. Center: Persistent Floating Pill Nav ───────────── */}
        <nav
          className="hidden md:flex relative z-10 items-center p-1 rounded-full bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shadow-2xs"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {navItems.map((item, idx) => {
            const isTabActive = activeIdx === idx;
            const isTabHovered = hoveredIdx === idx;
            const hasPill = currentPillIdx === idx;

            return (
              <div
                key={idx}
                className="relative"
                onMouseEnter={() => setHoveredIdx(idx)}
              >
                {/* Hardware-Accelerated Floating Spring Pill */}
                {hasPill && (
                  <motion.div
                    layoutId="header-active-nav-pill"
                    className="absolute inset-0 bg-white dark:bg-white/[0.12] rounded-full shadow-xs border border-slate-200/80 dark:border-white/15 pointer-events-none"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                )}

                <Link
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative z-10 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 active:scale-95 duration-100 ${
                    isTabActive
                      ? "text-indigo-600 dark:text-white font-bold"
                      : isTabHovered
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* ── 3. Left: Star Accent + Theme + CTA ────────────────── */}
        <div className="hidden md:flex relative z-10 items-center gap-2.5 shrink-0">
          {/* Star Accent */}
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
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
            title={theme === "dark" ? "تفعيل الوضع الفاتح ☀️" : "تفعيل الوضع الليلي 🌙"}
            aria-label="تبديل الثيم"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Auth / CTA Button with 0ms Tactile Physics */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={isTutor ? "/tutor/dashboard" : "/dashboard"}
                prefetch={true}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                {isTutor ? <GraduationCap className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                <span>{isTutor ? "لوحة المعلم" : "لوحة التحكم"}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/auth"
                prefetch={true}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer active:scale-95"
              >
                دخول
              </Link>
              <Link
                href="/auth"
                prefetch={true}
                onClick={() => setIsNavigatingAuth(true)}
                className={`px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95 ${
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
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 cursor-pointer active:scale-95 transition-transform"
            title={theme === "dark" ? "تفعيل الوضع الفاتح ☀️" : "تفعيل الوضع الليلي 🌙"}
            aria-label="تبديل الثيم"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 active:scale-95 transition-transform"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── 5. Mobile Drawer with Instant Feedback & Auth Awareness ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="hidden max-md:block md:hidden mobile-only mt-2 bg-white/95 dark:bg-[#0B0F19]/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl text-right space-y-3"
          >
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {navItems.map((item, idx) => {
                const isTabActive = activeIdx === idx;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    prefetch={true}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all active:scale-[0.98] ${
                      isTabActive
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60"
                        : "hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Auth Amnesia Resolution: Logged-in Dashboard vs Guest Links */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              {user ? (
                <Link
                  href={isTutor ? "/tutor/dashboard" : "/dashboard"}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  {isTutor ? <GraduationCap className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  <span>{isTutor ? "لوحة المعلم" : "لوحة التحكم"}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth"
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-center text-xs border border-slate-200/80 dark:border-white/10 active:scale-95 transition-transform"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/auth"
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <span>ابدأ مجاناً</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

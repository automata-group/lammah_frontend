"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { 
  initSession, 
  trackPageView, 
  trackScrollDepth, 
  handleRageClickCheck, 
  flushTelemetry,
  trackEvent,
  trackError
} from "@/lib/analytics";

const ARABIC_PAGE_NAMES: Record<string, string> = {
  "/": "الرئيسية (Landing)",
  "/dashboard": "لوحة الطالب الرئيسية",
  "/study": "بيئة المذاكرة التفاعلية",
  "/notebook": "الدفاتر والملخصات الذكية",
  "/plans": "صفحة الباقات والأسعار",
  "/marketplace": "متجر الدفاتر",
  "/login": "تسجيل الدخول",
  "/profile": "الملف الشخصي",
  "/terms": "الشروط والأحكام",
  "/privacy": "سياسة الخصوصية",
  "/sessions": "جلسات التدريس",
  "/admin": "لوحة تحكم الإدارة"
};

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastScrollSample = useRef(0);

  useEffect(() => {
    initSession();

    // Map path to Arabic name
    let pageArabic = ARABIC_PAGE_NAMES[pathname] || pathname;
    if (pathname.startsWith("/checkout")) {
      pageArabic = "بوابة الدفع وتأكيد التحويل (Checkout)";
    } else if (pathname.startsWith("/marketplace/")) {
      pageArabic = "استعراض ملزمة بالمتجر";
    }

    trackPageView(pathname, pageArabic);

    // If student enters checkout, we track initial entry
    if (pathname.startsWith("/checkout")) {
      trackEvent("checkout_entered", "بدأ في إجراءات تحويل الباقة", "feature", { path: pathname });
    }

    // Flush when unmounting or navigating
    return () => {
      flushTelemetry(true);
    };
  }, [pathname]);

  // Global listeners (Scroll, Rage clicks, Exit tracking)
  useEffect(() => {
    // 1. Throttled scroll listener
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollSample.current < 400) return; // 400ms throttle
      lastScrollSample.current = now;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const percent = Math.round((scrollTop / docHeight) * 100);
        trackScrollDepth(percent);
      }
    };

    // 2. Click listener for rage clicks and meaningful actions
    const handleClick = (e: MouseEvent) => {
      handleRageClickCheck(e);

      const target = e.target as HTMLElement;
      if (!target) return;
      const clickable = target.closest('button, a, [role="button"]') as HTMLElement;
      if (clickable) {
        const rawText = (clickable.innerText || clickable.getAttribute("title") || clickable.getAttribute("aria-label") || "").trim().replace(/\s+/g, ' ');
        const text = rawText.slice(0, 45);
        if (text && text.length >= 2) {
          trackEvent("click_action", `كبس على: "${text}"`, "click", {
            element: text,
            tag: clickable.tagName,
            href: (clickable as HTMLAnchorElement).href || undefined
          });
        }
      }
    };

    // 3. Global Error Capture (runtime JS errors)
    const handleGlobalError = (event: ErrorEvent) => {
      trackError(event.message || "خطأ تقني في الواجهة", {
        filename: event.filename,
        lineno: event.lineno
      });
    };

    // 4. Unhandled Promise Rejections (failed fetch, async errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || (typeof event.reason === "string" ? event.reason : "فشل اتصال أو طلب غير متوقع");
      trackError(msg, {
        type: "unhandled_rejection"
      });
    };

    // 5. Page exit & visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (window.location.pathname.startsWith("/checkout")) {
          trackEvent("checkout_abandoned", "توقف عند صفحة التحويل وخرج قبل إتمام الواتساب ⚠️", "drop_off", {
            path: window.location.pathname
          });
        }
        flushTelemetry(true);
      }
    };

    const handleBeforeUnload = () => {
      if (window.location.pathname.startsWith("/checkout")) {
        trackEvent("checkout_abandoned", "أغلق الصفحة عند التحويل ⚠️", "drop_off", {
          path: window.location.pathname
        });
      }
      flushTelemetry(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null; // Invisible component
}

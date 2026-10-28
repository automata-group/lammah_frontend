"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "finishing">("idle");
  const [progress, setProgress] = useState(0);
  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete and fade out progress bar when URL/search changes
  useEffect(() => {
    if (state === "loading") {
      if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
      setState("finishing");
      setProgress(100);

      finishTimerRef.current = setTimeout(() => {
        setState("idle");
        setProgress(0);
      }, 300);
    }
    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [pathname, searchParams]);

  const startProgress = () => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);

    setState("loading");
    setProgress(25); // 0ms Instant Tactile Launch

    // Smooth trickle to prevent visual freeze on large bundles
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) {
          if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
          return 88;
        }
        // Asymptotic deceleration
        const remaining = 90 - prev;
        const step = Math.max(1, remaining * 0.15);
        return Math.min(88, prev + step);
      });
    }, 200);
  };

  useEffect(() => {
    // Intercept navigation link clicks globally with 0ms delay
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      // Ignore external, download, tel, mailto, javascript, new tab
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) {
        return;
      }

      // Ignore modifier clicks (Ctrl, Cmd, Shift, Alt, middle-click)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      try {
        const dest = new URL(anchor.href, window.location.href);
        const curr = new URL(window.location.href);

        // Different domain
        if (dest.origin !== curr.origin) return;

        // Same page and query (e.g. hash jumps on the same page)
        if (dest.pathname === curr.pathname && dest.search === curr.search) {
          return;
        }

        // Trigger instant progress bar!
        startProgress();
      } catch {
        // Fallback or relative parsing failure
      }
    };

    const handleCustomStart = () => startProgress();
    const handleCustomStop = () => {
      if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
      setState("finishing");
      setProgress(100);
      finishTimerRef.current = setTimeout(() => {
        setState("idle");
        setProgress(0);
      }, 300);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("lammah:navigation-start", handleCustomStart);
    window.addEventListener("lammah:navigation-stop", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("lammah:navigation-start", handleCustomStart);
      window.removeEventListener("lammah:navigation-stop", handleCustomStop);
      if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  if (state === "idle" && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="مؤشر تحميل الصفحة"
      aria-valuenow={Math.round(progress)}
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] overflow-visible"
      style={{
        opacity: state === "finishing" ? 0 : 1,
        transition: state === "finishing" ? "opacity 250ms ease-out 100ms" : "none",
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 relative"
        style={{
          width: `${progress}%`,
          transform: "translateZ(0)",
          transition:
            progress === 100
              ? "width 180ms ease-out"
              : "width 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 0 10px rgba(99, 102, 241, 0.8), 0 0 5px rgba(245, 158, 11, 0.6)",
        }}
      >
        {/* Glowing Head Particle */}
        <div className="absolute top-[-2px] right-0 bottom-[-2px] w-12 bg-gradient-to-l from-white via-indigo-200 to-transparent opacity-90 blur-[1px]" />
      </div>
    </div>
  );
}

export default function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}

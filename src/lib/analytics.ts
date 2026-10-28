// ── Lammah In-House Lightweight Analytics & Behavioral Intelligence Client ──
// Zero dependencies, zero lag, asynchronous beacon dispatch

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface QueuedEvent {
  name: string;
  arabic_title: string;
  type: "pageview" | "click" | "rage_click" | "scroll" | "drop_off" | "feature" | "error";
  path: string;
  details?: Record<string, any>;
  timestamp?: number;
}

let sessionId = "";
let maxScrollDepth = 0;
let pageStartTime = Date.now();
let eventQueue: QueuedEvent[] = [];
let flushTimer: any = null;
let currentPath = "/";

// Rage click detection variables
let lastClickTarget: EventTarget | null = null;
let clickCountOnTarget = 0;
let lastClickTime = 0;

export function initSession(): string {
  if (typeof window === "undefined") return "";
  try {
    let s = sessionStorage.getItem("lammah_session_id");
    if (!s) {
      s = `lms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("lammah_session_id", s);
    }
    sessionId = s;
    return s;
  } catch {
    sessionId = `lms_${Date.now()}`;
    return sessionId;
  }
}

export function detectDevice(): { deviceType: string; osBrowser: string; screenSize: string } {
  if (typeof window === "undefined") {
    return { deviceType: "غير محدد", osBrowser: "متصفح", screenSize: "" };
  }

  const ua = navigator.userAgent || "";
  const width = window.innerWidth;
  const height = window.innerHeight;
  const screenSize = `${width}x${height}`;

  let deviceType = "كمبيوتر مكتبي / لابتوب 💻";
  if (/Android/i.test(ua)) {
    deviceType = width < 768 ? "هاتف أندرويد 📱" : "تابلت أندرويد 📟";
  } else if (/iPhone/i.test(ua)) {
    deviceType = "آيفون (iPhone) 📱";
  } else if (/iPad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    deviceType = "آيباد (iPad) 📟";
  } else if (width < 640) {
    deviceType = "هاتف محمول 📱";
  } else if (width < 1024) {
    deviceType = "جهاز لوحي 📟";
  }

  let os = "ويندوز";
  if (/Windows/i.test(ua)) os = "ويندوز";
  else if (/Macintosh|Mac OS/i.test(ua)) os = "ماك macOS";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "أندرويد";
  else if (/Linux/i.test(ua)) os = "لينكس";

  let browser = "كروم";
  if (/Edg/i.test(ua)) browser = "إيدج (Edge)";
  else if (/Chrome/i.test(ua)) browser = "كروم (Chrome)";
  else if (/Safari/i.test(ua)) browser = "سفاري (Safari)";
  else if (/Firefox/i.test(ua)) browser = "فايرفوكس (Firefox)";

  return {
    deviceType,
    osBrowser: `${os} • ${browser}`,
    screenSize
  };
}

export function trackEvent(
  name: string,
  arabicTitle: string,
  type: "pageview" | "click" | "rage_click" | "scroll" | "drop_off" | "feature" | "error" = "click",
  details: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;
  if (!sessionId) initSession();

  eventQueue.push({
    name,
    arabic_title: arabicTitle,
    type,
    path: currentPath,
    details,
    timestamp: Date.now()
  });

  // Critical events flush immediately (e.g. error, drop_off, rage_click)
  if (type === "error" || type === "drop_off" || type === "rage_click") {
    flushTelemetry(false);
  } else {
    scheduleFlush();
  }
}

export function trackError(errorMessage: string, details: Record<string, any> = {}) {
  if (!errorMessage) return;
  const cleanMsg = typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage);
  trackEvent(
    "error_occurred",
    `⚠️ ظهر له خطأ: ${cleanMsg.slice(0, 80)}`,
    "error",
    {
      message: cleanMsg,
      ...details
    }
  );
}

export function trackPageView(path: string, arabicPageName: string) {
  if (typeof window === "undefined") return;
  currentPath = path;
  pageStartTime = Date.now();
  maxScrollDepth = 0;

  trackEvent("page_view", `تصفح: ${arabicPageName}`, "pageview", { path });
}

export function trackScrollDepth(scrollPercent: number) {
  if (scrollPercent > maxScrollDepth) {
    maxScrollDepth = scrollPercent;
    // Log milestone scrolls (25, 50, 75, 90, 100)
    if (scrollPercent >= 50 && scrollPercent < 75 && maxScrollDepth < 50) {
      trackEvent("scroll_50", "قرأ 50% من محتوى الصفحة", "scroll", { depth: 50 });
    } else if (scrollPercent >= 75 && scrollPercent < 90) {
      trackEvent("scroll_75", "قرأ 75% من محتوى الصفحة (وصل للأسعار)", "scroll", { depth: 75 });
    } else if (scrollPercent >= 90) {
      trackEvent("scroll_100", "قرأ كامل الصفحة حتى النهاية 🎯", "scroll", { depth: 100 });
    }
  }
}

export function handleRageClickCheck(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target) return;

  const now = Date.now();
  const timeDiff = now - lastClickTime;

  if (lastClickTarget === target && timeDiff < 900) {
    clickCountOnTarget += 1;
    if (clickCountOnTarget === 4) {
      // Trigger Rage Click Alert!
      const btnText = target.innerText?.slice(0, 30)?.trim() || target.getAttribute("title") || target.tagName;
      trackEvent(
        "rage_click_detected",
        `نقرات غضب متكررة على: "${btnText}"`,
        "rage_click",
        {
          element: btnText,
          tag: target.tagName,
          className: target.className
        }
      );
    }
  } else {
    lastClickTarget = target;
    clickCountOnTarget = 1;
  }
  lastClickTime = now;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushTelemetry(true);
  }, 10000); // Batch every 10 seconds
}

export function flushTelemetry(asyncBeacon = true) {
  if (typeof window === "undefined" || !sessionId) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  const { deviceType, osBrowser, screenSize } = detectDevice();
  const duration = Math.round((Date.now() - pageStartTime) / 1000);

  let userEmail: string | undefined = undefined;
  let userId: string | undefined = undefined;
  try {
    const rawAuth = localStorage.getItem("sb-puxyrcdsmoxlvhsqtqeo-auth-token");
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      userEmail = parsed?.user?.email;
      userId = parsed?.user?.id;
    }
  } catch {}

  const payload = {
    session_id: sessionId,
    user_id: userId,
    user_email: userEmail,
    path: currentPath,
    device_type: deviceType,
    os_browser: osBrowser,
    screen_size: screenSize,
    referrer: document.referrer ? new URL(document.referrer, window.location.href).hostname : "مباشر",
    scroll_depth: maxScrollDepth,
    duration,
    events: eventsToSend
  };

  const endpoint = `${API_BASE}/api/v1/analytics/collect`;
  const body = JSON.stringify(payload);

  if (asyncBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }
}

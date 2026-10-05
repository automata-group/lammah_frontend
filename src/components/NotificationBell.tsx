"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Check, 
  Clock, 
  GraduationCap, 
  Calendar, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { session } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.access_token) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // 30s auto-refresh
      return () => clearInterval(interval);
    }
  }, [session]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!session?.access_token) return;
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
      const res = await fetch(`${api}/api/v1/tutoring/notifications`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleMarkAllRead = async () => {
    if (!session?.access_token) return;
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
      await fetch(`${api}/api/v1/tutoring/notifications/read-all`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Ignored
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read && session?.access_token) {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
        fetch(`${api}/api/v1/tutoring/notifications/${notif.id}/read`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
      } catch {}
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  if (!session) return null;

  return (
    <div className="relative z-40" ref={menuRef} dir="rtl">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
        title="التنبيهات والإشعارات"
        aria-label="الإشعارات"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "+9" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full mt-2.5 left-0 sm:-left-12 w-80 sm:w-96 rounded-3xl bg-white/95 dark:bg-[#0E1322]/95 border border-slate-200/90 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-4 text-right overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">مركز الإشعارات</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "لا توجد إشعارات جديدة"}
                  </span>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-slate-100 dark:divide-white/[0.06] max-h-80 overflow-y-auto my-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">لا توجد إشعارات حالياً</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">ستصلك هنا تنبيهات الحجوزات والمواعيد فور حدوثها.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  let Icon = Bell;
                  let iconBg = "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/30";

                  if (n.type.includes("booking_request")) {
                    Icon = GraduationCap;
                    iconBg = "bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/30";
                  } else if (n.type.includes("booking_confirmed")) {
                    Icon = Calendar;
                    iconBg = "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/30";
                  } else if (n.type.includes("no_show") || n.type.includes("rejected")) {
                    Icon = AlertCircle;
                    iconBg = "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/30";
                  }

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                        !n.is_read
                          ? "bg-indigo-50/60 dark:bg-indigo-500/10 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {n.title}
                          </span>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2 mt-0.5">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400 dark:text-slate-500 font-mono" dir="ltr">
                          <span>
                            {new Date(n.created_at).toLocaleDateString("ar-EG", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          {n.link && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                              <span>فتح</span>
                              <ArrowLeft className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

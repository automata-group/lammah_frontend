"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, User, Package, Calendar, LogOut, Shield, 
  Edit3, Check, X, BookOpen, Trash2, Pencil, 
  Eye, Sparkles, ChevronLeft, ArrowRight, ShieldCheck, Mail, GraduationCap
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import StudentProfileModal from "@/components/StudentProfileModal";

function ProfileSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse" dir="rtl">
      {/* 1. Account / Profile Identity Skeleton */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-5 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl sm:rounded-3xl shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>

      {/* 2. Academic Profile Skeleton */}
      <div className="bg-white dark:bg-slate-900/60 border border-purple-200/60 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40" />
            <div className="space-y-1.5">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
          <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="h-16 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
          <div className="h-16 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
          <div className="h-16 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
        </div>
      </div>

      {/* 3. Subscription & Quota Skeleton */}
      <div className="bg-white dark:bg-slate-900/60 border border-indigo-200/60 dark:border-indigo-500/20 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40" />
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-14 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
          <div className="h-14 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();

  // Optimistic initial state from localStorage for instantaneous 0ms rendering
  const [info, setInfo] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cached_profile_info");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loadingInfo, setLoadingInfo] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("cached_profile_info");
    }
    return true;
  });
  const [academicProfile, setAcademicProfile] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cached_academic_profile");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loadingAcademic, setLoadingAcademic] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("cached_academic_profile");
    }
    return true;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Notebooks state with optimistic local cache
  const [myNotebooks, setMyNotebooks] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cached_my_notebooks");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [loadingNotebooks, setLoadingNotebooks] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("cached_my_notebooks");
    }
    return true;
  });
  const [editingNotebook, setEditingNotebook] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editDescription, setEditDescription] = useState("");
  const [editStudentName, setEditStudentName] = useState("");
  const [editUniversity, setEditUniversity] = useState("");
  const [showEditCustomUni, setShowEditCustomUni] = useState(false);
  const [editReflectPrefix, setEditReflectPrefix] = useState("+972");
  const [editReflectPhone, setEditReflectPhone] = useState("");
  const [editReflectAccount, setEditReflectAccount] = useState("");
  const [isSavingNotebook, setIsSavingNotebook] = useState(false);
  const [editError, setEditError] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // Parallel resilient data fetching with background cache synchronization
  const refreshInfo = useCallback(async () => {
    if (!session?.access_token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
    const headers = { "Authorization": `Bearer ${session.access_token}` };

    try {
      const [subRes, acadRes, nbRes] = await Promise.allSettled([
        fetch(`${apiUrl}/api/v1/subscription/me`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/api/v1/subscription/student-profile`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/api/v1/marketplace/my-notebooks`, { headers }).then(r => r.json()),
      ]);

      if (subRes.status === "fulfilled" && subRes.value) {
        setInfo(subRes.value);
        try {
          localStorage.setItem("cached_profile_info", JSON.stringify(subRes.value));
          if (subRes.value.quota_remaining !== undefined) {
            localStorage.setItem("cached_user_quota", String(subRes.value.quota_remaining));
          }
        } catch {}
      }

      if (acadRes.status === "fulfilled" && acadRes.value?.academic_profile) {
        setAcademicProfile(acadRes.value.academic_profile);
        try {
          localStorage.setItem("cached_academic_profile", JSON.stringify(acadRes.value.academic_profile));
        } catch {}
      }

      if (nbRes.status === "fulfilled" && nbRes.value?.status === "success") {
        const nbs = nbRes.value.notebooks || [];
        setMyNotebooks(nbs);
        try {
          localStorage.setItem("cached_my_notebooks", JSON.stringify(nbs));
        } catch {}
      }
    } catch (err) {
      console.error("Error refreshing profile data:", err);
    } finally {
      setLoadingInfo(false);
      setLoadingAcademic(false);
      setLoadingNotebooks(false);
    }
  }, [session]);

  const fetchMyNotebooks = useCallback(async () => {
    if (!session?.access_token) return;
    setLoadingNotebooks(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
      const res = await fetch(`${apiUrl}/api/v1/marketplace/my-notebooks`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (data?.status === "success") {
        const nbs = data.notebooks || [];
        setMyNotebooks(nbs);
        try { localStorage.setItem("cached_my_notebooks", JSON.stringify(nbs)); } catch {}
      }
    } catch {} finally {
      setLoadingNotebooks(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      refreshInfo();
    }
  }, [session, refreshInfo]);

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setNameError("الاسم لا يمكن أن يكون فارغاً");
      return;
    }
    setIsUpdatingName(true);
    setNameError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/transactions/update-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ full_name: newName.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setIsEditingName(false);
        refreshInfo();
      } else {
        setNameError(data.detail?.user_message || "فشل تحديث الاسم");
      }
    } catch (e) {
      setNameError("فشل الاتصال بالخادم لتحديث الاسم");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الدفتر نهائياً من المتجر؟")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/${notebookId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchMyNotebooks();
      } else {
        alert(data.detail || "فشل حذف الدفتر.");
      }
    } catch (e) {
      alert("فشل الاتصال بالخادم لحذف الدفتر.");
    }
  };

  const handleSaveEditNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError("يرجى إدخال عنوان الدفتر.");
      return;
    }
    setIsSavingNotebook(true);
    setEditError("");
    try {
      const finalStudentName = editUniversity.trim() ? `${editStudentName.trim()} (${editUniversity.trim()})` : editStudentName.trim();
      
      let finalDescription = editDescription.trim();
      if (finalDescription.includes("🏫 الجامعة:")) {
        finalDescription = finalDescription.replace(/🏫 الجامعة:\s*[^\n]+/, `🏫 الجامعة: ${editUniversity.trim()}`);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/${editingNotebook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          price: editPrice,
          description: finalDescription,
          student_name: finalStudentName,
          reflect_details: `Reflect: ${editReflectPrefix} ${editReflectPhone.trim()} (الاسم: ${editReflectAccount.trim()})`
        })
      });
      const data = await response.json();
      if (response.ok) {
        setEditingNotebook(null);
        fetchMyNotebooks();
      } else {
        setEditError(data.detail || "فشل تعديل الدفتر.");
      }
    } catch (err) {
      setEditError("فشل الاتصال بالخادم لتعديل الدفتر.");
    } finally {
      setIsSavingNotebook(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth");
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?redirect=/profile");
    }
  }, [loading, user, router]);

  const profile = info?.profile;
  const sub = info?.active_subscription;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300" dir="rtl">
      
      {/* Unified App Header */}
      <AppHeader quota={info?.quota_remaining} activePage="profile" />

      {/* Background Soft Mesh Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 space-y-8">
        
        {/* Header Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <User className="w-3.5 h-3.5" />
              الملف الشخصي والاشتراك
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">إعدادات الحساب 👤</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">إدارة معلوماتك الشخصية، رصيد الدقائق، ودفاترك في المتجر</p>
          </div>

          <button 
            onClick={() => router.push("/dashboard")} 
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة للرئيسية
          </button>
        </div>

        {(!info && loadingInfo) ? (
          <ProfileSkeleton />
        ) : (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Profile Info Card */}
            <motion.div 
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center mb-8 gap-5 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl sm:rounded-3xl flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 shadow-inner">
                  <User className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                
                <div className="flex-1 space-y-2">
                  {isEditingName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""))}
                          placeholder="اكتب اسمك الجديد هنا (أحرف فقط)..."
                          className="bg-slate-50 dark:bg-slate-950 border border-indigo-400 focus:border-indigo-600 rounded-xl px-4 py-2 text-slate-900 dark:text-white text-sm outline-none transition font-medium"
                        />
                        <button
                          onClick={handleUpdateName}
                          disabled={isUpdatingName}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                          title="حفظ"
                        >
                          {isUpdatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setIsEditingName(false); setNameError(""); }}
                          className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-2.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
                          title="إلغاء"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {nameError && <p className="text-rose-600 text-xs font-bold">{nameError}</p>}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{profile?.full_name || user?.email?.split('@')[0] || "مستخدم لمّاح"}</h2>
                        <button
                          onClick={() => {
                            setNewName(profile?.full_name || user?.email?.split('@')[0] || "");
                            setIsEditingName(true);
                            setNameError("");
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="تعديل الاسم"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-mono tracking-wider mt-0.5" dir="ltr">{user?.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Verified Account Status (No device fingerprint) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
                    <Mail className="w-4 h-4 ml-2 text-indigo-600 dark:text-indigo-400" />
                    البريد الإلكتروني المعتمد
                  </div>
                  <p className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate" dir="ltr">
                    {user?.email || "—"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
                    <ShieldCheck className="w-4 h-4 ml-2 text-emerald-600 dark:text-emerald-400" />
                    حالة الحساب الجامعي
                  </div>
                  <div>
                    <div className="inline-flex items-center text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 text-xs">
                      <Check className="w-3.5 h-3.5 ml-1" /> نشط ومفعل ✓
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Academic Profile & Interests Card */}
            <motion.div 
              initial={false}
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white dark:bg-slate-900/60 border border-purple-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-500/15 rounded-2xl text-purple-600 dark:text-purple-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      الملف الأكاديمي والاهتمامات 🎓
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      بيانات جامعتك وتخصصك واهتماماتك الدراسية المخصصة
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تعديل الاهتمامات والبيانات ✏️</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">الجامعة أو الكلية</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {loadingAcademic && !academicProfile ? (
                      <span className="inline-block h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    ) : (
                      academicProfile?.university || <span className="text-slate-400 italic font-normal">لم تُحدد بعد</span>
                    )}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">التخصص الجامعي</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {loadingAcademic && !academicProfile ? (
                      <span className="inline-block h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    ) : (
                      academicProfile?.major || <span className="text-slate-400 italic font-normal">لم تُحدد بعد</span>
                    )}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">المستوى الدراسي</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {loadingAcademic && !academicProfile ? (
                      <span className="inline-block h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    ) : (
                      academicProfile?.academic_year || <span className="text-slate-400 italic font-normal">غير محدد</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Interests & Study Style */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">مجالات الاهتمام:</span>
                  {Array.isArray(academicProfile?.interests) && academicProfile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {academicProfile.interests.map((interest: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">لا توجد اهتمامات محددة حالياً. انقر على تعديل لاختيار اهتماماتك.</span>
                  )}
                </div>

                {academicProfile?.study_preference && (
                  <div className="pt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">النمط المفضل:</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                      {academicProfile.study_preference}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Subscription Card */}
            <motion.div 
              initial={false}
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white dark:bg-slate-900/60 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-xs"
            >
              <h3 className="text-lg sm:text-xl font-black flex items-center mb-6 text-slate-900 dark:text-white">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/15 rounded-xl ml-3 text-indigo-600 dark:text-indigo-400">
                  <Package className="w-5 h-5" />
                </div>
                نظام الاشتراك والحصص 👑
              </h3>

              {loadingInfo && !info ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-bold">الباقة الحالية</span>
                    <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-bold">الرصيد المتبقي (دقائق معالجة)</span>
                    <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                      <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                      <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : sub ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-bold">الباقة الحالية</span>
                    <span className="font-black text-base sm:text-lg text-indigo-600 dark:text-indigo-400">{sub.subscription_plans?.name || "باقة مخصصة"}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-bold">الرصيد المتبقي (دقائق معالجة)</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400 tabular-nums">{info?.quota_remaining || 0}</span>
                      <span className="text-xs text-slate-500 font-bold">دقيقة</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mb-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 ml-1.5 text-indigo-600 dark:text-indigo-400" />
                        ينتهي في
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs mb-1 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 ml-1.5 text-indigo-600 dark:text-indigo-400" />
                        حالة الباقة
                      </div>
                      <span className={`font-black text-xs sm:text-sm ${sub.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                        {sub.status === "active" ? "نشطة وموثقة ✓" : "منتهية"}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push("/plans")}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all mt-4 transform active:scale-[0.98] text-sm cursor-pointer"
                  >
                    شحن رصيد أو ترقية الباقة ✨
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                    <Package className="w-7 h-7" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-5 font-bold text-xs sm:text-sm">أنت تستخدم النسخة التجريبية المجانية حالياً</p>
                  <button 
                    onClick={() => router.push("/plans")}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-xs sm:text-sm cursor-pointer"
                  >
                    اشترك الآن في إحدى باقات الشحن ✨
                  </button>
                </div>
              )}
            </motion.div>

            {/* Published Notebooks Card */}
            <motion.div 
              initial={false}
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs"
            >
              <h3 className="text-lg sm:text-xl font-black flex items-center mb-6 text-slate-900 dark:text-white">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/15 rounded-xl ml-3 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                دفاتري المعروضة للبيع بالمتجر 🛒
              </h3>

              {loadingNotebooks ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-bold mt-2">جاري تحميل الدفاتر...</p>
                </div>
              ) : myNotebooks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-medium text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                  لم تقم بنشر أي دفتر للبيع حتى الآن. دفاترك الإبداعية يمكنها أن تدر عليك أرباحاً بمجرد نشرها في متجر المنصة! 💸
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {myNotebooks.map((nb) => (
                    <div key={nb.id} className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">{nb.title}</h4>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {nb.views_count || 0} معاينات</span>
                          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">💰 السعر: {nb.price} شيكل</span>
                          <span className="flex items-center gap-1">📄 {nb.page_count} صفحات</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingNotebook(nb);
                            setEditTitle(nb.title);
                            setEditPrice(nb.price);
                            setEditDescription(nb.description || "");
                            
                            const nameMatch = (nb.student_name || "").match(/^([^\(]+)(?:\(([^\)]+)\))?/);
                            const parsedName = nameMatch ? nameMatch[1].trim() : nb.student_name || "";
                            const parsedUni = nameMatch && nameMatch[2] ? nameMatch[2].trim() : "";
                            
                            setEditStudentName(parsedName);
                            setEditUniversity(parsedUni);
                            
                            const standardUnis = [
                              "جامعة النجاح الوطنية",
                              "جامعة بيرزيت",
                              "جامعة القدس (أبو ديس)",
                              "الجامعة العربية الأمريكية",
                              "جامعة بوليتكنك فلسطين",
                              "جامعة الخليل",
                              "جامعة بيت لحم",
                              "جامعة غزة",
                              "الجامعة الإسلامية بغزة",
                              "جامعة الأزهر بغزة",
                              "جامعة فلسطين التقنية (خضوري)",
                              "جامعة القدس المفتوحة",
                              "جامعة الاستقلال"
                            ];
                            
                            if (parsedUni && !standardUnis.includes(parsedUni)) {
                              setShowEditCustomUni(true);
                            } else {
                              setShowEditCustomUni(false);
                            }

                            const reflectStr = nb.reflect_details || "";
                            const prefixMatch = reflectStr.match(new RegExp("(?:\\+972|\\+970)"));
                            const parsedPrefix = prefixMatch ? prefixMatch[0] : "+972";
                            
                            const phoneMatch = reflectStr.match(new RegExp("(?:\\+972|\\+970)\\s*(\\d+)"));
                            const parsedPhone = phoneMatch ? phoneMatch[1] : "";
                            
                            const accMatch = reflectStr.match(new RegExp("\\(الاسم:\\s*([^\\)]+)\\)"));
                            const parsedAcc = accMatch ? accMatch[1].trim() : "";
                            
                            setEditReflectPrefix(parsedPrefix);
                            setEditReflectPhone(parsedPhone);
                            setEditReflectAccount(parsedAcc);

                            setEditError("");
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" /> تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteNotebook(nb.id)}
                          className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Edit Notebook Modal */}
            <AnimatePresence>
              {editingNotebook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                  >
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> تعديل تفاصيل الدفتر
                    </h3>

                    <form onSubmit={handleSaveEditNotebook} className="flex flex-col flex-1 min-h-0">
                      {/* Scrollable form fields */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 py-1 mb-2">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">عنوان الدفتر</label>
                          <input
                            required
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            placeholder="اكتب العنوان..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">سعر الدفتر (بالشيكل)</label>
                          <input
                            required
                            type="number"
                            min="1"
                            value={editPrice}
                            onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">اسم كاتب الدفتر (يطبع بخط اليد)</label>
                          <input
                            type="text"
                            value={editStudentName}
                            onChange={e => setEditStudentName(e.target.value)}
                            placeholder="اسمك الكامل..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none transition"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">الجامعة التي تدرس بها</label>
                          <select 
                            required 
                            value={showEditCustomUni ? "other" : editUniversity} 
                            onChange={e => {
                              const val = e.target.value;
                              if (val === "other") {
                                setShowEditCustomUni(true);
                                setEditUniversity("");
                              } else {
                                setShowEditCustomUni(false);
                                setEditUniversity(val);
                              }
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none transition cursor-pointer font-medium"
                          >
                            <option value="" disabled>اختر جامعتك...</option>
                            <option value="جامعة النجاح الوطنية">جامعة النجاح الوطنية</option>
                            <option value="جامعة بيرزيت">جامعة بيرزيت</option>
                            <option value="جامعة القدس (أبو ديس)">جامعة القدس (أبو ديس)</option>
                            <option value="الجامعة العربية الأمريكية">الجامعة العربية الأمريكية</option>
                            <option value="جامعة بوليتكنك فلسطين">جامعة بوليتكنك فلسطين</option>
                            <option value="جامعة الخليل">جامعة الخليل</option>
                            <option value="جامعة بيت لحم">جامعة بيت لحم</option>
                            <option value="جامعة غزة">جامعة غزة</option>
                            <option value="الجامعة الإسلامية بغزة">الجامعة الإسلامية بغزة</option>
                            <option value="جامعة الأزهر بغزة">جامعة الأزهر بغزة</option>
                            <option value="جامعة فلسطين التقنية (خضوري)">جامعة فلسطين التقنية (خضوري)</option>
                            <option value="جامعة القدس المفتوحة">جامعة القدس المفتوحة</option>
                            <option value="جامعة الاستقلال">جامعة الاستقلال</option>
                            <option value="other">جامعة أخرى...</option>
                          </select>
                        </div>

                        {showEditCustomUni && (
                          <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/60">
                            <label className="text-[10px] text-slate-500 font-bold block">اكتب اسم الجامعة المخصص 🏫</label>
                            <input 
                              required 
                              type="text" 
                              value={editUniversity} 
                              onChange={e => setEditUniversity(e.target.value)} 
                              placeholder="مثال: جامعة القاهرة..."
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-slate-900 dark:text-white text-sm outline-none transition" 
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold block">نبذة أو وصف عن الدفتر</label>
                          <textarea
                            rows={3}
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            placeholder="وصف محتوى الدفتر..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm outline-none transition resize-none font-medium"
                          />
                        </div>

                        {/* Electronic Payment details editing */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                          <label className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block">بيانات الدفع والتحصيل الإلكتروني 💳</label>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-bold block">رقم هاتف حساب الدفع الإلكتروني / الآيبان <span className="text-rose-500 font-black">*</span></label>
                            <div className="flex gap-2">
                              <select 
                                value={editReflectPrefix} 
                                onChange={e => setEditReflectPrefix(e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white text-xs focus:border-indigo-500 outline-none font-bold cursor-pointer"
                              >
                                <option value="+972">+972</option>
                                <option value="+970">+970</option>
                              </select>
                              <input 
                                required 
                                type="tel" 
                                pattern="[0-9]*"
                                placeholder="مثال: 598298930" 
                                value={editReflectPhone} 
                                onChange={e => setEditReflectPhone(e.target.value.replace(/\D/g, ""))}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:border-indigo-500 outline-none font-mono" 
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold block">اسم صاحب الحساب الكامل <span className="text-rose-500 font-black">*</span></label>
                            <input 
                              required 
                              type="text" 
                              placeholder="مثال: أحمد يوسف علي" 
                              value={editReflectAccount} 
                              onChange={e => setEditReflectAccount(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:border-indigo-500 outline-none font-medium" 
                            />
                          </div>
                        </div>

                        {editError && <p className="text-rose-600 text-xs font-bold">{editError}</p>}
                      </div>

                      {/* Fixed actions at bottom */}
                      <div className="flex gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 mt-2">
                        <button
                          type="submit"
                          disabled={isSavingNotebook}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
                        >
                          {isSavingNotebook ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "حفظ التعديلات"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNotebook(null)}
                          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs sm:text-sm cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Sign Out Button */}
            <button 
              onClick={handleSignOut}
              className="w-full py-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 font-black rounded-2xl transition-all flex items-center justify-center group cursor-pointer text-sm"
            >
              <LogOut className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              تسجيل الخروج من الحساب
            </button>

          </div>
        )}
      </div>

      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        session={session}
        initialData={academicProfile}
        onSuccess={(updated) => {
          setAcademicProfile(updated);
          refreshInfo();
        }}
      />
    </main>
  );
}

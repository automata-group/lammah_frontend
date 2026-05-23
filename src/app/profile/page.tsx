"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, User, Package, Calendar, LogOut, Shield, Fingerprint, Edit3, Check, X, BookOpen, Trash2, Pencil, Eye, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [info, setInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const refreshInfo = () => {
    if (session) {
      setLoadingInfo(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/me`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      }).then(r => r.json()).then(data => {
        setInfo(data);
        setLoadingInfo(false);
      }).catch(() => setLoadingInfo(false));
    }
  };

  useEffect(() => {
    refreshInfo();
  }, [session]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState("");

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

  const [myNotebooks, setMyNotebooks] = useState<any[]>([]);
  const [loadingNotebooks, setLoadingNotebooks] = useState(true);
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

  const fetchMyNotebooks = () => {
    if (session) {
      setLoadingNotebooks(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/my-notebooks`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.status === "success") {
            setMyNotebooks(data.notebooks || []);
          }
          setLoadingNotebooks(false);
        })
        .catch(() => setLoadingNotebooks(false));
    }
  };

  useEffect(() => {
    fetchMyNotebooks();
  }, [session]);

  const handleDeleteNotebook = async (notebookId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه الملزمة نهائياً من المتجر؟")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/${notebookId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchMyNotebooks();
      } else {
        alert(data.detail || "فشل حذف الملزمة.");
      }
    } catch (e) {
      alert("فشل الاتصال بالخادم لحذف الملزمة.");
    }
  };

  const handleSaveEditNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditError("يرجى إدخال عنوان الملزمة.");
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
        setEditError(data.detail || "فشل تعديل الملزمة.");
      }
    } catch (err) {
      setEditError("فشل الاتصال بالخادم لتعديل الملزمة.");
    } finally {
      setIsSavingNotebook(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  if (loading || !user) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin" /></div>;

  const profile = info?.profile;
  const sub = info?.active_subscription;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-8 pb-20" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/dashboard")} className="text-slate-400 hover:text-indigo-300 text-sm mb-8 block transition-colors">← العودة للوحة التحكم</button>

        <div className="flex justify-between items-end mb-8">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-l from-indigo-300 via-purple-300 to-indigo-400">حسابي</h1>
          <div className="text-slate-400 text-sm font-medium">معرف المستخدم: <span className="font-mono text-indigo-400/70">{user.id.slice(0, 8)}...</span></div>
        </div>

        {loadingInfo ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" /></div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-indigo-500/20 transition-colors" />

              <div className="flex flex-col sm:flex-row sm:items-center mb-8 relative z-10 gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-3xl flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-inner">
                  <User className="w-10 h-10 text-indigo-300" />
                </div>
                
                <div className="flex-1 space-y-2">
                  {isEditingName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="اكتب اسمك الجديد هنا..."
                          className="bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2 text-white text-sm outline-none transition"
                        />
                        <button
                          onClick={handleUpdateName}
                          disabled={isUpdatingName}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition flex items-center justify-center shrink-0"
                          title="حفظ"
                        >
                          {isUpdatingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setIsEditingName(false); setNameError(""); }}
                          className="bg-slate-700 hover:bg-slate-650 text-slate-350 p-2 rounded-xl transition flex items-center justify-center shrink-0"
                          title="إلغاء"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {nameError && <p className="text-rose-450 text-[10px] font-bold">{nameError}</p>}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{profile?.full_name || user.email?.split('@')[0] || "مستخدم لمّاح"}</h2>
                        <button
                          onClick={() => {
                            setNewName(profile?.full_name || user.email?.split('@')[0] || "");
                            setIsEditingName(true);
                            setNameError("");
                          }}
                          className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-800/40 transition"
                          title="تعديل الاسم"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-indigo-300/70 text-sm font-mono tracking-wider" dir="ltr">{user.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Device Fingerprint Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                    <Fingerprint className="w-4 h-4 ml-2 text-indigo-400" />البصمة الرقمية
                  </div>
                  <p className="font-mono text-sm text-slate-300 truncate dir-ltr">
                    {profile?.device_fingerprint
                      ? profile.device_fingerprint.slice(0, 20) + "..."
                      : "—"}
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">
                    <Shield className="w-4 h-4 ml-2 text-indigo-400" />حالة الحساب
                  </div>
                  <div className="flex items-center">
                    {profile?.device_fingerprint ? (
                      <div className="flex items-center text-green-400 font-bold bg-green-400/10 px-4 py-1 rounded-full border border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                        <span className="ml-2">✓</span> موثق بالبصمة
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-400 font-bold bg-amber-400/10 px-4 py-1 rounded-full border border-amber-400/20">
                        <span className="ml-2">⚠</span> في انتظار البصمة
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subscription Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-slate-800/40 border border-indigo-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />

              <h3 className="text-xl font-bold flex items-center mb-8 text-indigo-300 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-lg ml-3"><Package className="w-5 h-5" /></div>
                نظام الاشتراك والحصص
              </h3>

              {sub ? (
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center bg-slate-900/60 rounded-2xl p-5 border border-slate-700/30 group/item hover:bg-indigo-500/5 transition-all">
                    <span className="text-slate-400 text-sm font-medium">الباقة الحالية</span>
                    <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{sub.subscription_plans?.name || "باقة مخصصة"}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 rounded-2xl p-5 border border-slate-700/30 hover:bg-indigo-500/5 transition-all">
                    <span className="text-slate-400 text-sm font-medium">الرصيد المتبقي (دقائق معالجة)</span>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-2xl text-green-400">{info?.quota_remaining || 0}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">من أصل {sub.subscription_plans?.lecture_quota || "—"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/30">
                      <div className="flex items-center text-slate-400 text-xs mb-2"><Calendar className="w-4 h-4 ml-2" />ينتهي في</div>
                      <span className="font-mono text-sm text-slate-200">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' }) : "—"}</span>
                    </div>
                    <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/30">
                      <div className="flex items-center text-slate-400 text-xs mb-2"><Shield className="w-4 h-4 ml-2" />حالة الباقة</div>
                      <span className={`font-bold ${sub.status === "active" ? "text-green-400" : "text-red-400"}`}>{sub.status === "active" ? "نشطة وموثقة" : "منتهية"}</span>
                    </div>
                  </div>
                  <button onClick={() => router.push("/plans")}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-900/20 transition-all mt-4 transform active:scale-[0.98]">
                    تطوير الاشتراك للحصول على ميزات أكبر
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 relative z-10">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <Package className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 mb-6 font-medium italic">أنت تستخدم النسخة المجانية المحدودة حالياً</p>
                  <button onClick={() => router.push("/plans")}
                    className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-1">
                    اشترك الآن في إحدى الباقات
                  </button>
                </div>
              )}
            </motion.div>

            {/* Published Notebooks Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full" />
              
              <h3 className="text-xl font-bold flex items-center mb-8 text-emerald-450 relative z-10">
                <div className="p-2 bg-emerald-500/10 rounded-lg ml-3"><BookOpen className="w-5 h-5 text-emerald-400" /></div>
                ملازمي المعروضة للبيع بالمتجر 🛒
              </h3>

              {loadingNotebooks ? (
                <div className="text-center py-10"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" /></div>
              ) : myNotebooks.length === 0 ? (
                <div className="text-center py-10 text-slate-500 italic relative z-10">
                  لم تقم بنشر أي ملزمة للبيع حتى الآن. ملازمك الإبداعية يمكنها أن تدر عليك أرباحاً بمجرد نشرها! 💸
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {myNotebooks.map((nb) => (
                    <div key={nb.id} className="bg-slate-900/60 rounded-2xl p-5 border border-slate-700/30 hover:border-slate-650 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-200 text-base mb-1">{nb.title}</h4>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-400" /> {nb.views_count || 0} معاينات</span>
                          <span className="flex items-center gap-1">💰 السعر: ₪{nb.price}</span>
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
                            
                            // Parse name and university
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

                            // Parse Reflect details safely using new RegExp to keep TSX compiler happy
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
                          className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Pencil className="w-3.5 h-3.5" /> تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteNotebook(nb.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
                    
                    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2 flex-shrink-0 relative z-10">
                      <Sparkles className="w-5 h-5 text-indigo-400" /> تعديل تفاصيل الملزمة
                    </h3>

                    <form onSubmit={handleSaveEditNotebook} className="flex flex-col flex-1 min-h-0 relative z-10">
                      {/* Scrollable form fields */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pl-0.5 py-1 mb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">عنوان الملزمة</label>
                          <input
                            required
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            placeholder="اكتب العنوان..."
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">سعر الملزمة (بالشيكل)</label>
                          <input
                            required
                            type="number"
                            min="1"
                            value={editPrice}
                            onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition animate-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">اسم كاتب الملزمة (يطبع بخط اليد)</label>
                          <input
                            type="text"
                            value={editStudentName}
                            onChange={e => setEditStudentName(e.target.value)}
                            placeholder="اسمك الكامل..."
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">الجامعة التي تدرس بها</label>
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
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition cursor-pointer font-semibold"
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
                          <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                            <label className="text-[10px] text-slate-400 font-bold block">اكتب اسم الجامعة المخصص 🏫</label>
                            <input 
                              required 
                              type="text" 
                              value={editUniversity} 
                              onChange={e => setEditUniversity(e.target.value)} 
                              placeholder="مثال: جامعة القاهرة..."
                              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition" 
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-bold block">نبذة أو وصف عن الملزمة</label>
                          <textarea
                            rows={3}
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            placeholder="وصف محتوى الملزمة..."
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition resize-none"
                          />
                        </div>

                        {/* Reflect details editing */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                          <label className="text-[10px] text-indigo-400 font-bold block">تفاصيل محفظة ريفلكت لاستلام الأرباح 💳</label>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 font-bold block">رقم هاتف محفظة ريفلكت (مع تحديد البادئة) <span className="text-rose-500 font-black">*</span></label>
                            <div className="flex gap-2">
                              <select 
                                value={editReflectPrefix} 
                                onChange={e => setEditReflectPrefix(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2.5 text-white text-xs focus:border-indigo-500 outline-none font-bold cursor-pointer"
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
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:border-indigo-500 outline-none font-mono tracking-wider" 
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">اسم صاحب الحساب الكامل في تطبيق ريفلكت <span className="text-rose-500 font-black">*</span></label>
                            <input 
                              required 
                              type="text" 
                              placeholder="مثال: أحمد يوسف علي" 
                              value={editReflectAccount} 
                              onChange={e => setEditReflectAccount(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:border-indigo-500 outline-none font-medium" 
                            />
                          </div>
                        </div>

                        {editError && <p className="text-rose-450 text-xs font-bold">{editError}</p>}
                      </div>

                      {/* Fixed actions at bottom */}
                      <div className="flex gap-3 pt-4 border-t border-slate-800/60 flex-shrink-0 mt-2">
                        <button
                          type="submit"
                          disabled={isSavingNotebook}
                          className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
                        >
                          {isSavingNotebook ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "حفظ التعديلات"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNotebook(null)}
                          className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold rounded-xl transition"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Sign Out */}
            <button onClick={handleSignOut}
              className="w-full py-5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-black rounded-2xl transition-all flex items-center justify-center group">
              <LogOut className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />تسجيل الخروج من النظام
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

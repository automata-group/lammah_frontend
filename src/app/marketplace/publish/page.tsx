"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Store, BookOpen, User, Coins, CreditCard, CheckCircle, Loader2 } from "lucide-react";

export default function PublishToMarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d131f] flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>}>
      <PublishToMarketplaceContent />
    </Suspense>
  );
}

function PublishToMarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, loading } = useAuth();
  
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [teacherName, setTeacherName] = useState("");
  const [pageCount, setPageCount] = useState(10);
  const [price, setPrice] = useState(5);
  const [reflectPhonePrefix, setReflectPhonePrefix] = useState("+972");
  const [reflectPhoneNumber, setReflectPhoneNumber] = useState("");
  const [reflectAccountName, setReflectAccountName] = useState("");
  const [description, setDescription] = useState("");
  const [university, setUniversity] = useState("");
  const [showCustomUni, setShowCustomUni] = useState(false);
  const [courseName, setCourseName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const pdfUrl = searchParams.get("pdfUrl") || "";
  const previewUrl = searchParams.get("previewUrl") || "";

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSubmitting(true);
    setError("");

    try {
      const formattedDescription = `🏫 الجامعة: ${university.trim()}\n📚 المساق: ${courseName.trim()}\n\n${description.trim()}`;
      const originalStudentName = searchParams.get("studentName") || user?.email?.split('@')[0] || "طالب متميز";
      const formattedStudentName = `${originalStudentName} (${university.trim()})`;
      const fullReflectDetails = `Reflect: ${reflectPhonePrefix} ${reflectPhoneNumber.trim()} (الاسم: ${reflectAccountName.trim()})`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: `${courseName.trim()} - ${title.trim()}`,
          teacher_name: teacherName,
          page_count: Number(pageCount),
          price: Number(price),
          reflect_details: fullReflectDetails,
          pdf_url: pdfUrl,
          preview_pdf_url: previewUrl,
          description: formattedDescription,
          student_name: formattedStudentName
        })
      });

      if (!res.ok) throw new Error("حدث خطأ أثناء النشر.");
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/marketplace");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen bg-slate-950 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-6 md:p-12 font-sans relative overflow-hidden" dir="rtl">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-indigo-400 text-sm mb-8 flex items-center transition font-bold">
          <ArrowLeft className="w-4 h-4 ml-1" /> العودة
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">نشر الملزمة في المتجر 🛒</h1>
              <p className="text-slate-400 text-sm mt-1">دع زملائك يستفيدون من دفترك واربح من مبيعاته!</p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-white">تم النشر بنجاح! 🎉</h2>
              <p className="text-slate-400 text-sm">ستظهر ملزمتك في متجر لَمّاح فوراً لجميع الطلاب.</p>
            </div>
          ) : (
            <form onSubmit={handlePublish} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> عنوان الملزمة / المادة <span className="text-rose-500 font-black">*</span></label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><Store className="w-4 h-4 text-indigo-400" /> الجامعة التي تدرس بها <span className="text-rose-500 font-black">*</span></label>
                  <select 
                    required 
                    value={showCustomUni ? "other" : university} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "other") {
                        setShowCustomUni(true);
                        setUniversity("");
                      } else {
                        setShowCustomUni(false);
                        setUniversity(val);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition outline-none cursor-pointer text-sm font-semibold"
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
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> اسم المساق الدراسي <span className="text-rose-500 font-black">*</span></label>
                  <input required type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="مثال: فيزياء 1، برمجة مرئية..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition outline-none" />
                </div>
              </div>

              {showCustomUni && (
                <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 animate-fadeIn">
                  <label className="text-xs font-bold text-slate-300 block">اكتب اسم الجامعة المخصص <span className="text-rose-500 font-black">*</span> 🏫</label>
                  <input 
                    required 
                    type="text" 
                    value={university} 
                    onChange={e => setUniversity(e.target.value)} 
                    placeholder="مثال: جامعة عمّان الأهلية، جامعة القاهرة..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition outline-none text-sm font-semibold" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" /> اسم الدكتور <span className="text-rose-500 font-black">*</span></label>
                  <input required type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="د. أحمد محمود..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> عدد الصفحات <span className="text-rose-500 font-black">*</span></label>
                  <input required type="number" min="1" value={pageCount} onChange={e => setPageCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><Coins className="w-4 h-4 text-amber-400" /> السعر المطلوب بالملزمة (شيكل) <span className="text-rose-500 font-black">*</span></label>
                <input required type="number" min="0" step="0.5" value={price} onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-3 text-amber-400 font-bold focus:border-amber-500 transition outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> ماذا يوجد داخل هذه الملزمة؟ (وصف الملزمة) <span className="text-rose-500 font-black">*</span></label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="تحتوي هذه الملزمة على شرح كامل لجميع الفصول وجداول مقارنة ومصطلحات هامة مع التركيز على كلام الدكتور الشفوي..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 transition outline-none resize-none" />
              </div>

              {/* PAYMENT DETAILS: Strictly Reflect ONLY & requires prefix selector */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-black text-sm">
                  <Store className="w-4 h-4" />
                  <span>تفاصيل محفظة ريفلكت (Reflect) لاستلام أرباحك <span className="text-rose-500 font-black">*</span> 💳</span>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  * تدعم المنصة حالياً استقبال الحوالات من خلال <strong>محفظة ريفلكت فقط</strong>. يرجى كتابة اسمك الثلاثي ورقم المحفظة مع تحديد بادئتك (+970 / +972) بدقة لضمان تحويل مستحقاتك بنجاح.
                </p>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 block">رقم هاتف محفظة ريفلكت (مع تحديد البادئة إجبارياً) <span className="text-rose-500 font-black">*</span> 📱</label>
                  <div className="flex gap-2">
                    {/* Prefix Selector */}
                    <select 
                      value={reflectPhonePrefix} 
                      onChange={e => setReflectPhonePrefix(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-white text-sm focus:border-indigo-500 outline-none font-bold cursor-pointer"
                    >
                      <option value="+972">+972</option>
                      <option value="+970">+970</option>
                    </select>
                    
                    {/* Phone Number Field */}
                    <input 
                      required 
                      type="tel" 
                      pattern="[0-9]*"
                      placeholder="مثال: 598298930" 
                      value={reflectPhoneNumber} 
                      onChange={e => setReflectPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none font-mono tracking-wider" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">اسم صاحب الحساب الكامل في تطبيق ريفلكت <span className="text-rose-500 font-black">*</span> 👤</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="مثال: أحمد يوسف علي" 
                    value={reflectAccountName} 
                    onChange={e => setReflectAccountName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none font-medium" 
                  />
                </div>
              </div>

              {error && <p className="text-rose-400 text-sm font-bold">{error}</p>}

              <button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black py-4 rounded-xl transition shadow-xl shadow-indigo-950/40 flex justify-center items-center gap-2 transform active:scale-[0.98]">
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "نشر الملزمة الفخمة الآن 🚀"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

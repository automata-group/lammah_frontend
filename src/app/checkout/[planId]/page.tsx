"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, Copy, CheckCircle2, MessageCircle, Crown, XCircle, User, Sparkles } from "lucide-react";

export default function CheckoutPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const { user, session, loading } = useAuth();
  const router = useRouter();
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean | null; message: string }>({ available: null, message: "" });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    
    if (session) {
      createOrder();
      // Fetch existing profile name and username if any
      const fetchProfile = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/subscription/quota`, {
            headers: { "Authorization": `Bearer ${session.access_token}` }
          });
          const data = await res.json();
          if (data.full_name) setFullName(data.full_name);
          if (data.username) setUsername(data.username);
        } catch {}
      };
      fetchProfile();
    }
  }, [user, loading, session]);
  
  const createOrder = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/transactions/checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify({ plan_id: planId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail?.user_message || "حدث خطأ أثناء إنشاء الطلب");
      
      setOrderDetails(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const is100Plan = orderDetails && (
    orderDetails.amount === 100 ||
    orderDetails.plan_name?.includes("الذهبية") ||
    orderDetails.plan_name?.includes("النخبة") ||
    orderDetails.plan_name?.toLowerCase().includes("elite")
  );

  // Live debounced check for unique username
  useEffect(() => {
    if (!is100Plan) return;
    const cleanUser = username.trim().replace(/^@+/, "").toLowerCase();
    if (!cleanUser) {
      setUsernameStatus({ available: null, message: "" });
      return;
    }
    if (cleanUser.length < 3) {
      setUsernameStatus({ available: false, message: "يجب أن يتكون اسم المستخدم من 3 أحرف على الأقل" });
      return;
    }
    if (!/^[a-z0-9_]+$/.test(cleanUser)) {
      setUsernameStatus({ available: false, message: "يُسمح فقط بالأحرف الإنجليزية، الأرقام والشرطة السفلية (_) بدون مسافات" });
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/check-username?username=${encodeURIComponent(cleanUser)}${user?.id ? `&exclude_user_id=${user.id}` : ""}`);
        const data = await res.json();
        setUsernameStatus({ available: data.available, message: data.message });
      } catch (err) {
        setUsernameStatus({ available: true, message: "اسم المستخدم متاح للاستخدام ✅" });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [username, is100Plan, user]);
  
  const handleCopy = () => {
    if (orderDetails) {
      navigator.clipboard.writeText(orderDetails.payment_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleWhatsApp = async () => {
    if (!orderDetails) return;
    if (!fullName.trim()) {
      alert("الرجاء إدخال اسمك لتسهيل المطابقة.");
      return;
    }
    if (is100Plan && (!usernameStatus.available || isCheckingUsername)) {
      alert("الرجاء اختيار اسم مستخدم (يوزر نيم) فريد ومتاح للبائع.");
      return;
    }

    const cleanUser = username.trim().replace(/^@+/, "").toLowerCase();

    try {
      if (session) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/marketplace/set-seller-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            username: is100Plan ? cleanUser : ""
          })
        });
      }
      if (user) {
        const supabase = createClient();
        await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id);
      }
    } catch(e) {}
    
    const phone = "972598298930"; // Formatted internationally with +972 prefix
    let message = `مرحباً، أود تأكيد الدفع الإلكتروني لباقة (${orderDetails.plan_name}).\nالاسم الثلاثي: ${fullName}`;
    if (is100Plan && cleanUser) {
      message += `\nيوزر نيم البائع: @${cleanUser}`;
    }
    message += `\nرقم الطلب الخاص بي هو: ${orderDetails.order_id}\nمرفق إشعار التحويل الإلكتروني.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 p-4 sm:p-8 flex justify-center items-center font-sans transition-colors" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white dark:bg-[#0b0f19] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        {loading || checkoutLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-400">جاري تجهيز بيانات الطلب...</span>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-rose-500 mb-4 text-sm font-bold">{error}</div>
            <button onClick={() => router.push("/plans")} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">العودة للباقات</button>
          </div>
        ) : orderDetails ? (
           <div className="text-center space-y-5">
             <div>
               <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">بوابة الدفع والتحويل</h1>
               <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-black border border-indigo-200 dark:border-indigo-500/20 mt-2">
                 <span>ريفلكت (Reflect) • البنك العربي • بنك فلسطين</span>
               </div>
               <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
                 يرجى تحويل مبلغ <strong className="text-emerald-600 dark:text-emerald-400 font-black">{orderDetails.amount} شيكل</strong> عبر الحساب المعتمد:
               </p>
             </div>
             
             <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 flex justify-between items-center border border-slate-200 dark:border-slate-800">
               <span className="text-xl sm:text-2xl font-mono font-black tracking-widest text-slate-900 dark:text-white" dir="ltr">{orderDetails.payment_number}</span>
               <button onClick={handleCopy} className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer p-1">
                 {copied ? <CheckCircle2 className="text-emerald-500 w-5 h-5" /> : <Copy className="w-5 h-5" />}
               </button>
             </div>
             
             <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-4 text-center">
               <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold mb-1">رقم الطلب الخاص بك</p>
               <p className="text-lg sm:text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">{orderDetails.order_id}</p>
             </div>

             {/* Seller Profile Setup for 100 NIS Plan */}
             {is100Plan ? (
               <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-500/30 rounded-2xl p-4 text-right space-y-3.5">
                 <div className="flex items-center gap-2">
                   <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                   <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                     إعداد حساب البائع المعتمد (خاص بباقة النخبة 100 ₪)
                   </span>
                 </div>
                 <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                   بصفتك مشتركاً في باقة النخبة، ستحصل على رخصة بائع لنشر دفاترك بالمتجر. يرجى كتابة اسمك واختيار يوزر نيم فريد لا يتكرر لتمييز هويتك.
                 </p>

                 <div className="space-y-1.5">
                   <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                     اسم البائع (الاسم المعروض):
                   </label>
                   <input 
                     type="text" 
                     required
                     placeholder="الاسم الثلاثي أو المستعار (مثال: أحمد خليل)" 
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""))}
                     className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-bold outline-none transition-all shadow-2xs"
                   />
                 </div>

                 <div className="space-y-1.5">
                   <div className="flex items-center justify-between">
                     <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                       اسم المستخدم الفريد (يوزر نيم البائع):
                     </label>
                     <span className="text-[10px] text-slate-400 font-mono">
                       أحرف إنجليزية، أرقام و (_)
                     </span>
                   </div>
                   
                   <div className="relative">
                     <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-mono font-bold text-xs">
                       @
                     </span>
                     <input 
                       type="text" 
                       dir="ltr"
                       required
                       placeholder="username" 
                       value={username}
                       onChange={(e) => {
                         const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                         setUsername(val);
                       }}
                       className={`w-full bg-white dark:bg-slate-900 border ${
                         usernameStatus.available === true
                           ? "border-emerald-500 focus:border-emerald-500"
                           : usernameStatus.available === false
                             ? "border-rose-500 focus:border-rose-500"
                             : "border-slate-200 dark:border-slate-800 focus:border-amber-500"
                       } rounded-xl py-2.5 pr-8 pl-3 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-mono font-bold outline-none transition-all shadow-2xs`}
                     />
                     {isCheckingUsername && (
                       <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                       </span>
                     )}
                   </div>

                   {/* Live validation feedback */}
                   {usernameStatus.message && (
                     <div className={`flex items-center gap-1.5 text-[11px] font-bold mt-1 ${
                       usernameStatus.available === true ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                     }`}>
                       {usernameStatus.available === true ? (
                         <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                       ) : (
                         <XCircle className="w-3.5 h-3.5 shrink-0" />
                       )}
                       <span>{usernameStatus.message}</span>
                     </div>
                   )}
                 </div>
               </div>
             ) : (
               <div className="text-right space-y-1.5">
                 <label className="block text-xs font-black text-slate-700 dark:text-slate-300">اسمك الثلاثي (أحرف فقط لمطابقة الحوالة):</label>
                 <input 
                   type="text" 
                   required
                   placeholder="الرجاء إدخال اسمك الثلاثي (نص فقط)" 
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, ""))}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs outline-none transition-all"
                 />
               </div>
             )}
             
             <button 
               onClick={handleWhatsApp} 
               disabled={
                 !fullName.trim() || 
                 fullName.trim().length < 3 || 
                 (is100Plan && (!usernameStatus.available || isCheckingUsername))
               }
               className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
               title={
                 !fullName.trim() 
                   ? "الرجاء كتابة اسمك أولاً" 
                   : (is100Plan && !usernameStatus.available) 
                     ? "الرجاء اختيار يوزر نيم متاح أولاً" 
                     : ""
               }
             >
               <MessageCircle className="w-4 h-4" />
               إرسال إشعار الدفع الإلكتروني عبر واتساب
             </button>

             <div className="pt-2">
                <button onClick={() => router.push("/dashboard")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold transition">سأقوم بالدفع لاحقاً (العودة للوحة التحكم)</button>
             </div>
           </div>
        ) : null}
      </motion.div>
    </main>
  );
}

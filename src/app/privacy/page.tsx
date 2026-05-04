"use client";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronLeft, Lock, Eye, Database, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-12 selection:bg-indigo-500/30" dir="rtl">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group font-bold text-sm"
        >
          <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
          العودة للرئيسية
        </button>

        <div className="mb-16 text-center md:text-right">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">خصوصيتك أولويتنا القصوى</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6">سياسة الخصوصية وحماية البيانات</h1>
          <p className="text-slate-400 font-medium">نلتزم بحماية بياناتك وفقاً لأفضل المعايير القانونية والتقنية.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="space-y-8 text-slate-300 leading-relaxed font-medium"
        >
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/40 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl hover:border-indigo-500/30 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-indigo-500/10 transition-colors" />
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-indigo-400" />
              </div>
              1. البيانات التي نجمعها
            </h2>
            <p className="mb-4 text-lg">نجمع فقط الحد الأدنى من البيانات اللازمة لتقديم الخدمة لك:</p>
            <ul className="list-disc space-y-4 mr-6 text-slate-400 marker:text-indigo-400">
              <li><strong className="text-slate-200">معلومات الحساب:</strong> الاسم، البريد الإلكتروني، وصورة البروفايل (عبر Google).</li>
              <li><strong className="text-slate-200">محتوى المستخدم:</strong> الملفات، النصوص، والتسجيلات الصوتية التي ترفعها للمعالجة.</li>
              <li><strong className="text-slate-200">بيانات الاستخدام:</strong> معلومات تقنية حول كيفية تفاعلك مع المنصة لتحسين الأداء.</li>
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/20 border-r-4 border-emerald-500/30 p-8 md:p-10 rounded-l-[2.5rem] hover:bg-slate-900/40 hover:border-emerald-500/60 transition-all"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              2. كيف نستخدم بياناتك
            </h2>
            <p className="text-lg">يتم استخدام بياناتك للأغراض التالية فقط:</p>
            <ul className="list-disc space-y-4 mr-6 mt-6 text-slate-400 marker:text-emerald-400">
              <li>توفير عمليات التلخيص والدردشة عبر الذكاء الاصطناعي.</li>
              <li>إدارة اشتراكك ومعالجة عمليات الدفع.</li>
              <li>تخصيص تجربتك التعليمية وحفظ أرشيفك الخاص.</li>
              <li>الامتثال للمتطلبات القانونية الفلسطينية.</li>
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/40 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl hover:border-blue-500/30 transition-colors"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              3. حماية وأمن البيانات
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              نحن نطبق إجراءات أمنية صارمة، بما في ذلك التشفير الكامل أثناء نقل البيانات وحفظها. نلتزم بالمبادئ العامة لـ <strong className="text-white">قانون الاتصالات وتكنولوجيا المعلومات رقم (37) لسنة 2021</strong> لضمان عدم الوصول غير المصرح به لبيانات المشتركين.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/20 border-r-4 border-amber-500/30 p-8 md:p-10 rounded-l-[2.5rem] hover:bg-slate-900/40 hover:border-amber-500/60 transition-all"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-amber-400" />
              </div>
              4. مشاركة البيانات مع أطراف ثالثة
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              لمّاح <strong className="text-amber-400 font-black">لا يبيع</strong> بياناتك لأي جهة. يتم مشاركة محتوى الملفات (بشكل مجهول) فقط مع مزودي نماذج الذكاء الاصطناعي (مثل OpenRouter أو Google) لغرض المعالجة التقنية فقط، ولا يُسمح لهم باستخدام بياناتك لتدريب نماذجهم الخاصة.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/40 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl hover:border-purple-500/30 transition-colors"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              5. حقوقك كمستخدم
            </h2>
            <p className="text-lg">لديك الحق الكامل في:</p>
            <ul className="list-disc space-y-4 mr-6 mt-6 text-slate-400 marker:text-purple-400">
              <li>الوصول إلى جميع بياناتك المحفوظة لدينا.</li>
              <li>طلب حذف حسابك وجميع الملفات المرتبطة به نهائياً.</li>
              <li>الاعتراض على معالجة بياناتك لأغراض معينة.</li>
            </ul>
          </motion.section>
        </motion.div>

        <footer className="mt-24 pt-12 border-t border-slate-800/50 text-center pb-12">
          <p className="text-slate-500 text-sm">بياناتك هي أمانة نعتز بحفظها. فريق لمّاح التقني.</p>
        </footer>
      </div>
    </main>
  );
}

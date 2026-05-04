"use client";
import { motion } from "framer-motion";
import { Shield, ChevronLeft, FileText, Gavel, Scale } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6">
            <Gavel className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">الإطار القانوني الفلسطيني</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6">شروط الخدمة والاستخدام</h1>
          <p className="text-slate-400 font-medium">آخر تحديث: {new Date().toLocaleDateString('ar-PS')}</p>
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
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              1. مقدمة وقبول الشروط
            </h2>
            <p className="text-lg">
              أهلاً بك في منصة <strong className="text-white">لمّاح (Lammah)</strong>. باستخدامك لهذه المنصة، أنت توافق على الالتزام بشروط الخدمة هذه. تخضع هذه الشروط للقوانين السارية في فلسطين، بما في ذلك <strong className="text-white">قانون المعاملات الإلكترونية رقم (17) لسنة 2024</strong>.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/20 border-r-4 border-emerald-500/30 p-8 md:p-10 rounded-l-[2.5rem] hover:bg-slate-900/40 hover:border-emerald-500/60 transition-all"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              2. وصف الخدمة
            </h2>
            <p className="text-lg">
              لمّاح هي منصة "برمجيات كخدمة" (SaaS) توفر أدوات تعتمد على الذكاء الاصطناعي لتلخيص المحاضرات، الدردشة مع المستندات، والتفريغ الصوتي. يتم تقديم هذه الخدمات سحابياً عبر اشتراكات مدفوعة أو تجريبية.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/40 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl hover:border-blue-500/30 transition-colors"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              3. حسابات المستخدمين
            </h2>
            <ul className="list-disc space-y-4 mr-6 text-slate-400 marker:text-blue-400 text-lg">
              <li>يجب أن تكون المعلومات المقدمة عند التسجيل دقيقة ومحدثة.</li>
              <li>أنت مسؤول عن حماية كلمة المرور الخاصة بك وعن أي نشاط يتم عبر حسابك.</li>
              <li>وفقاً لـ <strong className="text-white">قانون الاتصالات وتكنولوجيا المعلومات رقم (37) لسنة 2021</strong>، يحظر استخدام الحساب في أي أنشطة احتيالية أو تلاعب تقني.</li>
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/20 border-r-4 border-amber-500/30 p-8 md:p-10 rounded-l-[2.5rem] hover:bg-slate-900/40 hover:border-amber-500/60 transition-all"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              4. الدفع والاشتراكات
            </h2>
            <p className="mb-6 text-lg">
              تتم عمليات الدفع عبر بوابات دفع مرخصة من قبل <strong className="text-amber-400">سلطة النقد الفلسطينية (PMA)</strong>.
            </p>
            <ul className="list-disc space-y-4 mr-6 text-slate-400 marker:text-amber-400 text-lg">
              <li>تجدد الاشتراكات تلقائياً ما لم يتم الإلغاء قبل موعد التجديد.</li>
              <li>الأسعار المعلنة تشمل الضرائب المعمول بها في فلسطين ما لم يذكر غير ذلك.</li>
              <li>لا يتم استرداد المبالغ المدفوعة للاشتراكات النشطة إلا في حالات خاصة يقررها الدعم الفني.</li>
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/40 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl hover:border-purple-500/30 transition-colors"
          >
            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Scale className="w-6 h-6 text-purple-400" />
              </div>
              5. إخلاء المسؤولية والقانون
            </h2>
            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl text-amber-200/90 mb-6">
              <p className="leading-relaxed">
                تعتمد نتائج التلخيص والدردشة على نماذج ذكاء اصطناعي. لمّاح لا يضمن دقة النتائج 100%. يجب مراجعة المعلومات الحساسة، ولا نتحمل مسؤولية القرارات المتخذة بناءً على المخرجات.
              </p>
            </div>
            <p className="text-lg text-slate-400">
              جميع حقوق الملكية الفكرية للمنصة مملوكة لـ <strong>لمّاح</strong>. تخضع هذه الشروط للقوانين السارية في فلسطين. أي نزاع يُحل ودياً، أو يُحال لمحاكم رام الله/القدس.
            </p>
          </motion.section>
        </motion.div>

        <footer className="mt-24 pt-12 border-t border-slate-800/50 text-center pb-12">
          <p className="text-slate-500 text-sm">شكراً لثقتك بمنصة لمّاح. نحن هنا لدعم مسيرتك التعليمية.</p>
        </footer>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, MessageSquare, ChevronDown, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANDING_FAQS = [
  {
    q: "هل يمكنني استخدام لمّاح لو ما كان معي تسجيل صوتي (فويس) للمحاضرة؟",
    a: "نعم بكل تأكيد! يمكنك رفع ملف السلايدات أو الكتاب (PDF أو PPTX) فقط بدون أي صوت، وسيقوم لمّاح بقراءتها وتخطيطها وتلخيص كل شابتر واستخراج أهم المفاهيم والأسئلة المتوقعة كأنك حضرت في القاعة تماماً."
  },
  {
    q: "كيف يكتب لمّاح كلام الدكتور ويصيد ما ركز عليه للامتحان؟",
    a: "يدمج لمّاح بين تسجيل صوت المحاضر وشرائح السلايدات بدقة فائقة؛ فيلتقط ما شدد عليه الدكتور أثناء الشرح وقال عنه «مهم وجاي بالامتحان»، ويفرز كلام الدكتور بوضوح عن الشرح الإضافي لتركز وقتك ليلة الامتحان."
  },
  {
    q: "كيف يتعامل لمّاح مع اللهجات العامية والمصطلحات الطبية والهندسية بالإنجليزية؟",
    a: "محرك لمّاح مدرب خصيصاً على طريقة الشرح في الجامعات العربية؛ يفهم الشرح بالعامية بسلاسة، ويلتقط المصطلحات العلمية باللغة الإنجليزية ويكتبها بصيغتها المعتمدة في الامتحان مع شرحها بالعربية لضمان الفهم التام."
  },
  {
    q: "ما هو «دفتر الإنقاذ»؟ وكيف يفيدني لو ما عندي وقت أدرس؟",
    a: "هو ملخص شامل ومكثف بصيغة A4 PDF مصمم كصفحات دفاتر مسطرة مع هوامش مريحة؛ يجمع لك زبدة المادة وجداول المقارنة والأسئلة الأساسية، ليغنيك عن مئات السلايدات والفويسات التائهة وجاهز للطباعة الورقية فوراً."
  },
  {
    q: "لو عندي عدة فويسات مجزأة أو تسجيل طويل للمحاضرة، هل يقبلها لمّاح؟",
    a: "نعم بكل سهولة! يمكنك رفع عدة تسجيلات صوتية لنفس المحاضرة دفعة واحدة مع السلايدات، وسيقوم لمّاح بدمجها بالترتيب الزمني ومطابقتها مع كل شريحة بدقة متناهية دون ضياع أي معلومة."
  },
  {
    q: "كيف أضمن أمان رصيدي ودقائقي في حال انقطع النت أثناء المعالجة؟",
    a: "رصيدك في أمان تام؛ يطبق لمّاح نظام «الاسترجاع التلقائي العادل». لا يتم خصم أي دقيقة من باقتك إلا بعد اكتمال المعالجة وتوليد الملخص بنجاح 100%. وفي حال حدوث أي انقطاع، يُعاد الرصيد لمحفظتك فوراً وتلقائياً دون الحاجة لطلب الدعم."
  },
  {
    q: "ما هي طرق الدفع والشحن المتوفرة لتفعيل الباقة؟",
    a: "الدفع متاح وميسر لجميع الطلاب حصرياً وآمناً عبر تطبيق ريفلكت (Reflect)، حسابات البنك العربي، وحسابات بنك فلسطين. بعد إتمام التحويل، يتم تفعيل باقتك ورصيدك فوراً لتبدأ دراستك دون أي تأخير."
  }
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="relative z-10 py-28 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Background glow for FAQ */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-[800px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-[100%] blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 relative">
          {/* Decorative icons floating near title */}
          <div className="absolute -top-7 sm:-top-9 right-8 md:right-28 text-indigo-400/50 dark:text-indigo-500/40 animate-pulse pointer-events-none">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-10 left-10 md:left-32 text-purple-400/50 dark:text-purple-500/40 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}>
            <MessageSquare className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 pb-4 pt-1 text-slate-900 dark:text-white tracking-tight leading-[1.3] overflow-visible">
            كل ما تود معرفته عن <span className="text-indigo-600 dark:text-indigo-400">لمّاح</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            إجابات واضحة ومباشرة عن كل ما يدور في ذهنك حول دقة التفريغ، حماية رصيدك، طرق الدفع، وتوليد الدفاتر الجمالية.
          </p>
        </div>

        <div className="space-y-4 relative z-20">
          {LANDING_FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className={`group bg-white/70 dark:bg-[#0A0D14]/70 backdrop-blur-md border rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-[0_10px_40px_rgba(99,102,241,0.1)] relative ${
                  isOpen 
                    ? "border-indigo-500/50 dark:border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-[1.01]" 
                    : "border-slate-200/70 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30"
                }`}
              >
                <div className={`absolute top-0 right-0 bottom-0 w-1.5 transition-colors duration-500 ${isOpen ? "bg-gradient-to-b from-indigo-500 to-purple-500" : "bg-transparent group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900"}`} />
                
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 sm:p-7 md:p-8 text-right flex items-center justify-between gap-4 sm:gap-6 relative z-10 cursor-pointer"
                >
                  <span className={`font-black text-sm sm:text-base md:text-lg transition-colors duration-300 ${isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"}`}>
                    {faq.q}
                  </span>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner ${isOpen ? "bg-gradient-to-br from-indigo-500 to-purple-500 rotate-180" : "bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 border border-slate-200 dark:border-white/10"}`}>
                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${isOpen ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500"}`} />
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-5 sm:px-7 md:px-8 pb-6 sm:pb-8 text-xs sm:text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100/50 dark:border-white/[0.02] pt-5 sm:pt-6 relative z-10">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Action Area: Visit Dedicated FAQ page */}
        <div className="mt-10 flex items-center justify-center relative z-20">
          <Link
            href="/faq"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-black text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 shadow-lg shadow-indigo-600/25 dark:shadow-[0_0_30px_rgba(99,102,241,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <span>فتح صفحة الأسئلة الشائعة الكاملة</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

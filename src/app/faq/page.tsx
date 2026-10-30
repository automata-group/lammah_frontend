"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ArrowRight,
  Search,
  MessageSquare,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  BookOpen,
  Headphones,
  CheckCircle2,
  X
} from "lucide-react";
import Header from "@/components/landing/Header";
import { useAuth } from "@/context/AuthContext";

interface FAQItem {
  q: string;
  a: string;
  category: "accuracy" | "payments" | "notebooks" | "general";
}

const allFaqs: FAQItem[] = [
  {
    category: "general",
    q: "لو مش دارس المادة من بداية الفصل وبادئ من الصفر، هل لمّاح بيساعدني أجيب علامة عالية؟",
    a: "نعم بكل تأكيد! لمّاح صُمم خصيصاً لإنقاذك في زنقة الامتحانات. بدل أن تضيع ساعات طويلة في سماع تسجيلات متراكمة وسلايدات غامضة، يقوم لمّاح بتفكيك المادة وتبسيطها من الصفر: يحدد لك ما ركز عليه الدكتور في القاعة، يشرح المصطلحات المعقدة بالعربي، ويدربك على أسئلة الامتحانات المتوقعة (MCQs) لتضمن أعلى العلامات في أقصر وقت ممكن."
  },
  {
    category: "accuracy",
    q: "كيف يضمن لمّاح دقة تفريغ الصوت وربطه بشرائح السلايدات؟",
    a: "يدمج لمّاح بين تسجيل صوت المحاضر وشرائح السلايدات (PDF أو PPTX). يتعرف على كلام الدكتور بدقة متناهية ويربط كل شرح وتفصيلة جانبية برقم الشريحة المقابلة لها مباشرة، لينتج ملخصاً أكاديمياً شاملاً ومترابطاً لا يفوّت أي معلومة هامة."
  },
  {
    category: "payments",
    q: "ماذا يحدث لدقائقي ورصيدي إذا كان الملف طويلاً أو حدث انقطاع أثناء المعالجة؟",
    a: "رصيدك في أمان تام؛ يطبق لمّاح نظام «الاسترجاع التلقائي العادل». لا يتم خصم أي دقيقة من باقتك إلا بعد اكتمال المعالجة وتوليد الملخص بنجاح 100%. وفي حال واجهت أي مشكلة تقنية أو انقطاع، يُعاد الرصيد لمحفظتك فوراً وتلقائياً دون الحاجة لطلب الدعم."
  },
  {
    category: "payments",
    q: "ما هي وسائل وطرق الدفع والشحن المتاحة للاشتراك؟",
    a: "الدفع متاح وميسر لجميع الطلاب حصرياً وآمناً عبر تطبيق ريفلكت (Reflect)، حسابات البنك العربي، وحسابات بنك فلسطين. بعد إتمام التحويل، يتم تفعيل باقتك ورصيدك فوراً لتبدأ دراستك دون أي تأخير."
  },
  {
    category: "accuracy",
    q: "هل يدعم لمّاح اللهجات العامية والمصطلحات الإنجليزية المتداخلة؟",
    a: "نعم 100%! تم تدريب وتطوير محرك لمّاح ليفهم الشرح الجامعي العربي بكافة اللهجات، ويتعامل ببراعة مع التداخل اللغوي (عربي وإنجليزي)، فيلتقط المصطلحات الطبية، القانونية، والهندسية المعقدة ويكتبها بلغة سليمة ومفهومة."
  },
  {
    category: "accuracy",
    q: "هل يمكنني رفع عدة تسجيلات صوتية (فويسات) مجزأة لنفس المحاضرة؟",
    a: "نعم بكل سهولة! إذا كانت المحاضرة مسجلة على أجزاء أو فويسات متفرقة، يمكنك رفعها جميعاً دفعة واحدة مع السلايدات (PDF أو PPTX)، وسيقوم لمّاح بدمجها بالترتيب الزمني ومطابقتها مع كل شريحة بدقة متناهية."
  },
  {
    category: "notebooks",
    q: "ما هو \"دفتر التلخيص الملون\"؟ وهل هو جاهز للطباعة الورقية مباشرة؟",
    a: "هو دفتر ملخص متكامل (A4 PDF) مصمم بأعلى معايير التنسيق البصري: خطوط مريحة للعين، هوامش لكتابة الملاحظات، جداول مقارنة ذكية، ورسومات توضيحية. يمكنك طباعته ورقياً أو مذاكرته على جهازك ليغنيك تماماً عن السلايدات والفويسات الطويلة (متاح حصرياً لمشتركي باقة النخبة 100 ₪)."
  },
  {
    category: "accuracy",
    q: "ماذا لو كان التسجيل الصوتي به تشويش أو صدى في قاعة المحاضرة؟",
    a: "يمتلك لمّاح فلاتر صوتية متطورة لتنقية الصوت وعزل الضوضاء وصوت المراوح وتشويش القاعة، والتركيز على صوت الدكتور مع مطابقة الكلمات المسموعة بنصوص السلايدات لضمان أعلى درجات الدقة حتى في التسجيلات البعيدة."
  },
  {
    category: "notebooks",
    q: "كيف يعمل متجر الدفاتر؟ وكيف يمكنني استرداد قيمة اشتراكي وتحقيق أرباح؟",
    a: "عند اشتراكك في باقة النخبة (100 ₪)، ستحصل على رخصة بائع معتمد. بمجرد توليد دفترك الملون عبر لمّاح، انشرها في المتجر بضغطة زر وحدد السعر الذي يناسبك. كل عملية شراء من زملائك تنزل أرباحها في محفظتك ويمكنك سحبها مباشرة."
  },
  {
    category: "general",
    q: "هل أستطيع مناقشة لمّاح وسؤاله عن المسائل المعقدة بعد التلخيص؟",
    a: "نعم! لكل محاضرة شات أكاديمي ذكي خاص بها؛ يعمل كمعيد خصوصي يفهم أدق تفاصيل المحاضرة وما قاله الدكتور بالضبط، فيشرح لك المسائل والتمارين الغامضة بدقة دون أي تشتيت."
  },
  {
    category: "general",
    q: "هل يمكنني معاينة نماذج من مخرجات لمّاح قبل أن أشترك؟",
    a: "بالطبع! يوفر لمّاح قسماً تفاعلياً ونماذج حية فورية على الموقع، لتشاهد بنفسك سرعة ودقة التحويل وجودة المخرجات قبل الانضمام."
  }
];

const categories = [
  { id: "all", label: "جميع الأسئلة" },
  { id: "accuracy", label: "الدقة والتفريغ" },
  { id: "payments", label: "الرصيد والدفع" },
  { id: "notebooks", label: "الدفاتر والمتجر" },
  { id: "general", label: "أسئلة عامة" }
];

export default function FAQPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300 flex flex-col justify-between"
      dir="rtl"
    >
      {/* Decorative Grids and Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/40 dark:from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[25%] left-[-5%] w-[50%] h-[50%] bg-purple-500/5 dark:bg-purple-600/10 blur-[130px] rounded-full" />
      </div>

      <div>
        <Header user={user} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-24 relative z-10">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>

          {/* Page Hero */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-black mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مركز المساعدة والإجابات الشاملة</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 pb-2 pt-1 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 tracking-tight leading-normal">
              الأسئلة الشائعة
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
              كل ما تحتاج معرفته عن كيفية عمل منصة لمّاح، دقة دمج الصوت والسلايدات، ضمان أمان رصيدك، وتفعيل باقتك.
            </p>

            {/* Live Search Bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute right-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الأسئلة الشائعة (مثلاً: رصيد، دقة، سلايدات، ريفلكت)..."
                  className="w-full pr-12 pl-10 py-3.5 rounded-2xl bg-white dark:bg-[#0A0D14] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-hidden focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-md shadow-slate-200/50 dark:shadow-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                        : "bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQs Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white/40 dark:bg-[#0A0D14]/40 rounded-3xl border border-slate-200/60 dark:border-white/5 p-8">
                <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-bold text-base mb-1">
                  لم نجد نتائج مطابقة لبحثك
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">
                  جرب استخدام كلمات بحث مختلفة أو تصفح الأقسام أعلاه
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    className={`group bg-white/70 dark:bg-[#0A0D14]/70 backdrop-blur-xl border rounded-[1.75rem] overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_10px_35px_rgba(99,102,241,0.08)] relative ${
                      isOpen
                        ? "border-indigo-500/50 dark:border-indigo-500/50 shadow-md shadow-indigo-500/10 scale-[1.01]"
                        : "border-slate-200/70 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30"
                    }`}
                  >
                    <div
                      className={`absolute top-0 right-0 bottom-0 w-1.5 transition-colors duration-500 ${
                        isOpen
                          ? "bg-gradient-to-b from-indigo-500 to-purple-500"
                          : "bg-transparent group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900"
                      }`}
                    />

                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full p-5 sm:p-7 text-right flex items-center justify-between gap-4 relative z-10"
                    >
                      <span
                        className={`font-black text-sm sm:text-base transition-colors duration-300 ${
                          isOpen
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
                        }`}
                      >
                        {faq.q}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner ${
                          isOpen
                            ? "bg-gradient-to-br from-indigo-500 to-purple-500 rotate-180"
                            : "bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 border border-slate-200 dark:border-white/10"
                        }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-colors duration-300 ${
                            isOpen ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500"
                          }`}
                        />
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
                          <div className="px-5 sm:px-7 pb-6 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100/50 dark:border-white/[0.02] pt-5 relative z-10">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Need More Help Card */}
          <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-500/20 text-center relative overflow-hidden">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">
              هل ما زال لديك أي استفسار آخر؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto mb-5 leading-relaxed">
              فريق دعم لمّاح متواجد دائماً لمساعدتك عبر رسائل إنستغرام لضمان تجربة دراسية استثنائية.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://instagram.com/lammah.site"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full font-black text-xs sm:text-sm text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 shadow-md shadow-pink-600/20 transition-all hover:scale-105 active:scale-95"
              >
                تواصل معنا عبر إنستغرام @lammah.site
              </a>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full font-black text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-white/10 transition-all"
              >
                سجل حساب جديد الآن
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

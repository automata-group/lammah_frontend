"use client";
import { useState, useEffect } from "react";
import { Shield, ChevronLeft, FileText, Gavel, Scale, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const sections = [
  { id: "intro", title: "مقدمة وقبول الشروط", icon: FileText },
  { id: "service", title: "وصف الخدمة", icon: Shield },
  { id: "accounts", title: "حسابات المستخدمين", icon: Gavel },
  { id: "payments", title: "الدفع والاشتراكات", icon: CheckCircle2 },
  { id: "ip", title: "حقوق الملكية الفكرية", icon: Shield },
  { id: "disclaimer", title: "إخلاء المسؤولية", icon: Scale },
  { id: "law", title: "القانون الواجب التطبيق", icon: Gavel },
];

export default function TermsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("intro");

  // Lightweight Intersection Observer for scroll spy without layout blocking
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const rafId = requestAnimationFrame(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px" }
      );

      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) observer?.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-indigo-500/20 font-sans transition-colors duration-200 relative" dir="rtl">
      {/* Lightweight background accents (No heavy fixed GPU blurs) */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 pb-24 relative z-10">
        {/* Header Section */}
        <div className="mb-12 sm:mb-16">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 sm:mb-8 group font-bold text-xs sm:text-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            العودة للرئيسية
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3.5 py-1.5 rounded-full mb-4 sm:mb-6">
                <Gavel className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">الإطار القانوني</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight text-slate-900 dark:text-white">شروط الخدمة</h1>
              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                تحكم هذه الشروط استخدامك لمنصة لمّاح. نرجو قراءتها بعناية لضمان تجربة آمنة وشفافة.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">آخر تحديث</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-300">{new Date().toLocaleDateString('ar-PS', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block w-1/4 sticky top-12">
            <nav className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 rounded-[2rem] shadow-sm">
              <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-widest">المحتويات</h3>
              <ul className="space-y-1.5">
                {sections.map((s) => {
                  const isActive = activeSection === s.id;
                  const Icon = s.icon;
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => scrollTo(s.id)}
                        className={`w-full text-right flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? "bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/25 shadow-xs" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                        <span>{s.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="w-full lg:w-3/4 space-y-12 sm:space-y-16 text-slate-700 dark:text-slate-300 leading-relaxed sm:leading-loose text-base sm:text-lg font-medium">
            <section id="intro" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">1. مقدمة وقبول الشروط</h2>
              <p className="mb-4 sm:mb-6">
                أهلاً بك في منصة <strong className="text-slate-900 dark:text-white font-black bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">لمّاح (Lammah)</strong>. باستخدامك لهذه المنصة، أنت توافق بشكل كامل على الالتزام بشروط الخدمة الماثلة.
              </p>
              <p>
                تخضع هذه الشروط وتُفسر وفقاً للقوانين السارية في دولة فلسطين، بما في ذلك <span className="text-indigo-600 dark:text-indigo-400 font-bold">قانون المعاملات الإلكترونية رقم (17) لسنة 2024</span>، وتعتبر ملزمة قانونياً بمجرد تسجيلك في المنصة.
              </p>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="service" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">2. وصف الخدمة</h2>
              <p>
                لمّاح هي منصة تعليمية ذكية متكاملة توفر حلولاً دراسية قائمة على تقنيات الذكاء الاصطناعي الأكاديمي لخدمة الطلاب الجامعيين:
              </p>
              <ul className="list-disc space-y-3 mr-6 mt-4 text-slate-600 dark:text-slate-300 marker:text-indigo-500">
                <li><strong className="text-slate-900 dark:text-white">بيئة المذاكرة التفاعلية (Focus Study):</strong> استعراض وتخطيط شرائح المحاضرات (PDF وPowerPoint)، تدوين الملاحظات الصوتية والمكتوبة، وتفعيل أدوات الحفظ النشط وشريط الإخفاء ودبابيس أولويات الامتحان.</li>
                <li><strong className="text-slate-900 dark:text-white">تلخيص وتفريغ المحاضرات:</strong> تحويل التسجيلات الصوتية ومقاطع يوتيوب إلى تفريغ دقيق وملخصات تفاعلية مرتبطة بشرائح المادة.</li>
                <li><strong className="text-slate-900 dark:text-white">توليد الدفاتر الذكية (Smart Notebook):</strong> إعداد وتنسيق دفاتر ملونة وجداول مقارنة وأسئلة امتحانات متوقعة جاهزة للطباعة والدراسة.</li>
                <li><strong className="text-slate-900 dark:text-white">متجر الدفاتر والملخصات (Marketplace):</strong> بيئة آمنة لتبادل وشراء الدفاتر والملخصات الدراسية بين الطلاب.</li>
                <li><strong className="text-slate-900 dark:text-white">المساعد الأكاديمي الذكي:</strong> محادثة ذكية فورية مخصصة لكل محاضرة تجيب على استفسارات الطالب بناءً على محتوى الشرح الفعلي فقط.</li>
              </ul>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="accounts" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">3. حسابات المستخدمين</h2>
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl mb-6 shadow-xs">
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-1">دقة المعلومات</strong>
                      <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">يجب أن تكون المعلومات المقدمة عند التسجيل عبر Google أو البريد دقيقة ومحدثة.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-1">مسؤولية الحماية</strong>
                      <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">أنت المسؤول الوحيد عن حماية بيانات اعتمادك وعن أي نشاط يتم عبر حسابك.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <Shield className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-1">حظر التلاعب</strong>
                      <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">وفقاً لقانون الاتصالات وتكنولوجيا المعلومات، يُحظر استخدام الحساب في أي أنشطة احتيالية أو هندسة عكسية للمنصة.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="payments" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">4. آلية الدفع والاشتراكات</h2>
              <p className="mb-6">
                تتم تسوية الاشتراكات وشراء الباقات عبر <strong className="text-slate-900 dark:text-white font-bold">التحويل المالي المباشر</strong> باستخدام القنوات المصرفية والمحافظ الرقمية المعتمدة في فلسطين (تطبيق ريفلكت Reflect، حسابات بنك فلسطين والبنك العربي)، ثم إرسال إشعار التحويل الرسمي عبر الواتساب المعتمد لتأكيد الطلب وتفعيل الحساب.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-indigo-50/70 dark:bg-indigo-900/15 border border-indigo-200 dark:border-indigo-500/20 p-5 sm:p-6 rounded-2xl">
                  <h4 className="text-indigo-800 dark:text-indigo-300 font-bold mb-2 text-base">لا يوجد تجديد تلقائي (No Auto-Renewal)</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    نظراً لعدم تفعيل بوابات الخصم الإلكتروني المباشر حالياً، لا يتم تجديد أي باقة تلقائياً ولا يتم حفظ أو خصم أي مبالغ من بطاقات المستخدمين. ينتهي الاشتراك تلقائياً بنهاية مدته المحددة، والتجديد يتم فقط بطلب وتحويل جديد باختيار الطالب.
                  </p>
                </div>
                <div className="bg-purple-50/70 dark:bg-purple-900/15 border border-purple-200 dark:border-purple-500/20 p-5 sm:p-6 rounded-2xl">
                  <h4 className="text-purple-800 dark:text-purple-300 font-bold mb-2 text-base">سياسة الرصيد والاسترجاع العادل</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    يعتمد "لمّاح" نظام الاسترجاع التلقائي العادل؛ فلا يُخصم رصيد الباقة إلا بعد اكتمال المعالجة بنجاح. وفي حال وجود أي خلل فني مثبت حال دون الاستفادة من الخدمة، يحق للطالب التواصل مع الدعم لإعادة الرصيد أو تمديد صلاحية الباقة.
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="ip" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">5. حقوق الملكية الفكرية</h2>
              <p>
                جميع حقوق الملكية الفكرية للبنية التحتية، الأكواد البرمجية، التصميمات، والخوارزميات مملوكة حصرياً لـ <strong className="text-slate-900 dark:text-white font-bold">شركة Automata (Automata Group)</strong>، الجهة المطورة والمشغلة لمنصة لمّاح.
              </p>
              <p className="mt-4">
                أما بالنسبة للمحتوى الذي ترفعه (ملفات، نصوص، تسجيلات)، فإنك <strong className="text-slate-900 dark:text-white">تظل المالك القانوني له</strong>. أنت تمنح المنصة رخصة تقنية مؤقتة فقط لمعالجة هذا المحتوى عبر نماذج الذكاء الاصطناعي بغرض تقديم الخدمة التي طلبتها.
              </p>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="disclaimer" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">6. إخلاء المسؤولية عن نتائج الذكاء الاصطناعي</h2>
              <div className="bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                <p className="text-amber-900 dark:text-amber-200/90 leading-relaxed font-bold">
                  تعمل خدمات المنصة اعتماداً على نماذج لغوية ضخمة (LLMs) احتمالية. وبالتالي:
                </p>
                <ul className="list-disc space-y-2 mr-6 mt-4 text-amber-800/90 dark:text-amber-200/70 marker:text-amber-500 text-sm sm:text-base">
                  <li>لا يضمن "لمّاح" دقة، اكتمال، أو صحة المخرجات بنسبة 100%.</li>
                  <li>يقع على عاتق الطالب مسؤولية المراجعة النهائية والتدقيق للمعلومات الحساسة.</li>
                  <li>المنصة غير مسؤولة عن أي ضرر أكاديمي أو مهني ناتج عن الاعتماد الكلي والخاطئ على مخرجات الذكاء الاصطناعي.</li>
                </ul>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="law" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">7. القانون الواجب التطبيق</h2>
              <p>
                تخضع هذه الشروط للأنظمة والقوانين المعمول بها في <strong className="text-slate-900 dark:text-white font-bold">دولة فلسطين</strong>. في حال نشوء أي نزاع يتعلق باستخدام المنصة، يتم السعي أولاً لحله ودياً خلال 30 يوماً، وفي حال التعذر، تُحال القضية لمحاكم مدينة رام الله ذات الاختصاص الحصري.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

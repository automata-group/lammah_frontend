"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

  // Intersection Observer for scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
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
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 font-sans" dir="rtl">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-24 relative z-10">
        {/* Header Section */}
        <div className="mb-16">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group font-bold text-sm bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
            العودة للرئيسية
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-6">
                <Gavel className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">الإطار القانوني</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">شروط الخدمة</h1>
              <p className="text-xl text-slate-400 font-medium max-w-2xl">
                تحكم هذه الشروط استخدامك لمنصة لمّاح. نرجو قراءتها بعناية لضمان تجربة آمنة وشفافة.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">آخر تحديث</p>
              <p className="text-lg font-black text-slate-300">{new Date().toLocaleDateString('ar-PS', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block w-1/4 sticky top-12">
            <nav className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-xl">
              <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-widest">المحتويات</h3>
              <ul className="space-y-2">
                {sections.map((s) => {
                  const isActive = activeSection === s.id;
                  const Icon = s.icon;
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => scrollTo(s.id)}
                        className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                          isActive 
                            ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner" 
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                        {s.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Content Area */}
          <div className="w-full lg:w-3/4 space-y-16 text-slate-300 leading-loose text-lg font-medium">
            <section id="intro" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">1. مقدمة وقبول الشروط</h2>
              <p className="mb-6">
                أهلاً بك في منصة <strong className="text-white font-black bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">لمّاح (Lammah)</strong>. باستخدامك لهذه المنصة، أنت توافق بشكل كامل على الالتزام بشروط الخدمة الماثلة.
              </p>
              <p>
                تخضع هذه الشروط وتُفسر وفقاً للقوانين السارية في دولة فلسطين، بما في ذلك <span className="text-indigo-300">قانون المعاملات الإلكترونية رقم (17) لسنة 2024</span>، وتعتبر ملزمة قانونياً بمجرد تسجيلك في المنصة.
              </p>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="service" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">2. وصف الخدمة</h2>
              <p>
                لمّاح هي منصة تعليمية ذكية متكاملة توفر حلولاً دراسية قائمة على تقنيات الذكاء الاصطناعي الأكاديمي لخدمة الطلاب الجامعيين:
              </p>
              <ul className="list-disc space-y-3 mr-6 mt-4 text-slate-400 marker:text-indigo-500">
                <li><strong>بيئة المذاكرة التفاعلية (Focus Study):</strong> استعراض وتخطيط شرائح المحاضرات (PDF وPowerPoint)، تدوين الملاحظات الصوتية والمكتوبة، وتفعيل أدوات الحفظ النشط وشريط الإخفاء ودبابيس أولويات الامتحان.</li>
                <li><strong>تلخيص وتفريغ المحاضرات:</strong> تحويل التسجيلات الصوتية ومقاطع يوتيوب إلى تفريغ دقيق وملخصات تفاعلية مرتبطة بشرائح المادة.</li>
                <li><strong>توليد الدفاتر الذكية (Smart Notebook):</strong> إعداد وتنسيق دفاتر ملونة وجداول مقارنة وأسئلة امتحانات متوقعة جاهزة للطباعة والدراسة.</li>
                <li><strong>متجر الدفاتر والملخصات (Marketplace):</strong> بيئة آمنة لتبادل وشراء الدفاتر والملخصات الدراسية بين الطلاب.</li>
                <li><strong>المساعد الأكاديمي الذكي:</strong> محادثة ذكية فورية مخصصة لكل محاضرة تجيب على استفسارات الطالب بناءً على محتوى الشرح الفعلي فقط.</li>
              </ul>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="accounts" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">3. حسابات المستخدمين</h2>
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl mb-6">
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-white mb-1">دقة المعلومات</strong>
                      <span className="text-slate-400 text-base">يجب أن تكون المعلومات المقدمة عند التسجيل عبر Google أو البريد دقيقة ومحدثة.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-white mb-1">مسؤولية الحماية</strong>
                      <span className="text-slate-400 text-base">أنت المسؤول الوحيد عن حماية بيانات اعتمادك وعن أي نشاط يتم عبر حسابك.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <Shield className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-white mb-1">حظر التلاعب</strong>
                      <span className="text-slate-400 text-base">وفقاً لقانون الاتصالات وتكنولوجيا المعلومات، يُحظر استخدام الحساب في أي أنشطة احتيالية أو هندسة عكسية للمنصة.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="payments" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">4. آلية الدفع والاشتراكات</h2>
              <p className="mb-6">
                تتم تسوية الاشتراكات وشراء الباقات عبر <strong className="text-white">التحويل المالي المباشر</strong> باستخدام القنوات المصرفية والمحافظ الرقمية المعتمدة في فلسطين (تطبيق ريفلكت Reflect، حسابات بنك فلسطين والبنك العربي)، ثم إرسال إشعار التحويل الرسمي عبر الواتساب المعتمد لتأكيد الطلب وتفعيل الحساب.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl">
                  <h4 className="text-indigo-300 font-bold mb-2">لا يوجد تجديد تلقائي (No Auto-Renewal)</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    نظراً لعدم تفعيل بوابات الخصم الإلكتروني المباشر حالياً، لا يتم تجديد أي باقة تلقائياً ولا يتم حفظ أو خصم أي مبالغ من بطاقات المستخدمين. ينتهي الاشتراك تلقائياً بنهاية مدته المحددة، والتجديد يتم فقط بطلب وتحويل جديد باختيار الطالب.
                  </p>
                </div>
                <div className="bg-purple-900/10 border border-purple-500/20 p-6 rounded-2xl">
                  <h4 className="text-purple-300 font-bold mb-2">سياسة الرصيد والاسترجاع العادل</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    يعتمد "لمّاح" نظام الاسترجاع التلقائي العادل؛ فلا يُخصم رصيد الباقة إلا بعد اكتمال المعالجة بنجاح. وفي حال وجود أي خلل فني مثبت حال دون الاستفادة من الخدمة، يحق للطالب التواصل مع الدعم لإعادة الرصيد أو تمديد صلاحية الباقة.
                  </p>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="ip" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">5. حقوق الملكية الفكرية</h2>
              <p>
                جميع حقوق الملكية الفكرية للبنية التحتية، الأكواد البرمجية، التصميمات، والخوارزميات مملوكة حصرياً لـ <strong className="text-white">شركة Automata (Automata Group)</strong>، الجهة المطورة والمشغلة لمنصة لمّاح.
              </p>
              <p className="mt-4">
                أما بالنسبة للمحتوى الذي ترفعه (ملفات، نصوص، تسجيلات)، فإنك <strong>تظل المالك القانوني له</strong>. أنت تمنح المنصة رخصة تقنية مؤقتة فقط لمعالجة هذا المحتوى عبر نماذج الذكاء الاصطناعي بغرض تقديم الخدمة التي طلبتها.
              </p>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="disclaimer" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">6. إخلاء المسؤولية عن نتائج الذكاء الاصطناعي</h2>
              <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                <p className="text-amber-200/90 leading-relaxed">
                  تعمل خدمات المنصة اعتماداً على نماذج لغوية ضخمة (LLMs) احتمالية. وبالتالي:
                </p>
                <ul className="list-disc space-y-2 mr-6 mt-4 text-amber-200/70 marker:text-amber-500 text-base">
                  <li>لا يضمن "لمّاح" دقة، اكتمال، أو صحة المخرجات بنسبة 100%.</li>
                  <li>يقع على عاتق الطالب مسؤولية المراجعة النهائية والتدقيق للمعلومات الحساسة.</li>
                  <li>المنصة غير مسؤولة عن أي ضرر أكاديمي أو مهني ناتج عن الاعتماد الكلي والخاطئ على مخرجات الذكاء الاصطناعي.</li>
                </ul>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="law" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">7. القانون الواجب التطبيق</h2>
              <p>
                تخضع هذه الشروط للأنظمة والقوانين المعمول بها في <strong className="text-white">دولة فلسطين</strong>. في حال نشوء أي نزاع يتعلق باستخدام المنصة، يتم السعي أولاً لحله ودياً خلال 30 يوماً، وفي حال التعذر، تُحال القضية لمحاكم مدينة رام الله ذات الاختصاص الحصري.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

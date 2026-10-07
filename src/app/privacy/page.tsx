"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, ChevronLeft, Lock, Eye, Database, Globe, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const sections = [
  { id: "data", title: "البيانات التي نجمعها", icon: Eye },
  { id: "usage", title: "كيف نستخدم بياناتك", icon: Database },
  { id: "security", title: "حماية وأمن البيانات", icon: ShieldCheck },
  { id: "sharing", title: "مشاركة البيانات", icon: Globe },
  { id: "rights", title: "حقوقك كمستخدم", icon: CheckCircle2 },
  { id: "gdpr", title: "الامتثال الدولي (GDPR)", icon: Lock },
];

export default function PrivacyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("data");

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
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-emerald-500/20 font-sans transition-colors duration-200 relative" dir="rtl">
      {/* Lightweight background accents (No heavy fixed GPU blurs) */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-full mb-4 sm:mb-6">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">خصوصيتك أولويتنا</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight text-slate-900 dark:text-white">سياسة الخصوصية</h1>
              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                نحن نلتزم بحماية بياناتك الشخصية وتأمينها وفقاً لأعلى المعايير القانونية والتقنية.
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
                            ? "bg-emerald-50 dark:bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25 shadow-xs" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
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
            <section id="data" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">1. البيانات التي نجمعها</h2>
              <p className="mb-4 sm:mb-6">
                انطلاقاً من مبدأ شفافية البيانات، نحن نجمع فقط الحد الأدنى من المعلومات اللازمة لتشغيل وتطوير الخدمات التي تشترك بها:
              </p>
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xs">
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-1">معلومات الحساب والتسجيل</strong>
                      <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">نحتفظ بالاسم والبريد الإلكتروني والصورة الرمزية (Profile Picture) عند تسجيلك عبر Google أو البريد لتخصيص حسابك وتأمين دخولك.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-1">المحتوى الأكاديمي المرفوع</strong>
                      <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">الملفات، المستندات، والنصوص الصوتية التي تقوم برفعها لمعالجتها واستخراج الملخصات والأسئلة منها.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-1">بيانات التفاعل والاستخدام</strong>
                      <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">إحصائيات تقنية مثل معدل استخدام الخدمة ونوع الجهاز، لمساعدتنا في تحسين الأداء وحل المشاكل التقنية.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white mb-1">البيانات المالية وعمليات التحويل</strong>
                      <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">نظراً لأن تسوية الباقات تتم عبر التحويل المالي المباشر (تطبيق ريفلكت أو الحسابات البنكية)، فإن المنصة <strong className="text-slate-900 dark:text-white">لا تطلب ولا تخزن أي أرقام بطاقات ائتمانية أو بيانات بنكية سرية إطلاقاً</strong>، ويقتصر التوثيق على رقم الطلب وصورة إشعار التحويل لتفعيل الحساب.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="usage" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">2. كيف نستخدم بياناتك</h2>
              <p>يتم توظيف بياناتك للأغراض المشروعة والتشغيلية التالية فقط:</p>
              <ul className="list-disc space-y-3 mr-6 mt-4 text-slate-600 dark:text-slate-300 marker:text-emerald-500">
                <li>معالجة المحتوى عبر الذكاء الاصطناعي لاستخراج المخرجات المطلوبة (ملخصات، شروحات، الخ).</li>
                <li>إدارة الاشتراكات والفوترة والتواصل معك بشأن تحديثات النظام أو الدفع.</li>
                <li>حفظ وأرشفة موادك الأكاديمية لتتمكن من الرجوع إليها في أي وقت ضمن لوحة التحكم.</li>
                <li>الامتثال للقوانين واللوائح التنظيمية في فلسطين.</li>
              </ul>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="security" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">3. حماية وأمن البيانات</h2>
              <p className="mb-4 sm:mb-6">
                يعتبر أمان بياناتك الأولوية القصوى لنا. نحن نطبق إجراءات أمنية صارمة مدعومة بأحدث التقنيات:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-500/20 p-5 sm:p-6 rounded-2xl">
                  <h4 className="text-emerald-800 dark:text-emerald-300 font-bold mb-2 text-base">التشفير الكامل</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">جميع البيانات تنتقل عبر بروتوكولات مشفرة (HTTPS/SSL) ويتم تشفير البيانات الحساسة في قواعد البيانات.</p>
                </div>
                <div className="bg-blue-50/70 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-500/20 p-5 sm:p-6 rounded-2xl">
                  <h4 className="text-blue-800 dark:text-blue-300 font-bold mb-2 text-base">الامتثال المحلي</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">نلتزم بالمبادئ التوجيهية المنصوص عليها في <strong className="text-slate-900 dark:text-white">قانون الاتصالات وتكنولوجيا المعلومات (37) لسنة 2021</strong> لمنع الوصول غير المصرح به.</p>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="sharing" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">4. مشاركة البيانات والخصوصية</h2>
              <div className="bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                <h3 className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-300 mb-3 sm:mb-4">نحن لا نبيع أو نشارك بياناتك إطلاقاً</h3>
                <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed mb-4 text-sm sm:text-base">
                  تظل بياناتك وملفاتك الأكاديمية ملكاً خاصاً بك بالكامل. وتتم معالجة المحتوى حصرياً وبشكل آمن ومشفر لغرض وحيد وهو <strong className="text-slate-900 dark:text-white">تحليل النصوص وتجهيز الملخصات والمخرجات الدراسية التي طلبتها</strong>.
                </p>
                <p className="text-amber-800/90 dark:text-amber-200/80 text-xs sm:text-sm font-bold bg-amber-100/50 dark:bg-black/30 p-3 rounded-lg border border-amber-300/40 dark:border-amber-500/10 inline-block">
                  التزام بالخصوصية: نطبق معايير أمان صارمة تضمن عدم استخدام ملفاتك أو نصوصك لتدريب أي نماذج ذكاء اصطناعي عامة، وتبقى موادك محمية ومحصورة بحسابك فقط.
                </p>
              </div>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="rights" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">5. حقوقك كمستخدم</h2>
              <p>كمستخدم لمنصتنا، أنت تمتلك الحقوق الكاملة التالية فيما يتعلق ببياناتك:</p>
              <ul className="list-disc space-y-3 mr-6 mt-4 text-slate-600 dark:text-slate-300 marker:text-emerald-500">
                <li><strong className="text-slate-900 dark:text-white">حق الوصول:</strong> عرض وتحميل جميع ملخصاتك وملفاتك المرتبطة بحسابك.</li>
                <li><strong className="text-slate-900 dark:text-white">حق النسيان (الحذف):</strong> حذف حسابك بالكامل وجميع الملفات التابعة له فوراً وبلا رجعة من خلال لوحة التحكم.</li>
                <li><strong className="text-slate-900 dark:text-white">حق التعديل:</strong> تحديث معلوماتك الشخصية في أي وقت.</li>
              </ul>
            </section>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

            <section id="gdpr" className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6">6. الامتثال الدولي (GDPR)</h2>
              <p>
                رغم كوننا مؤسسة تعمل في فلسطين تحت مظلة <strong className="text-slate-900 dark:text-white font-bold">شركة Automata (Automata Group)</strong>، إلا أننا نصمم أنظمتنا لتكون متوافقة بشكل جوهري مع <strong className="text-slate-900 dark:text-white font-bold">اللائحة العامة لحماية البيانات (GDPR)</strong> الأوروبية، لضمان تطبيق أفضل الممارسات العالمية في حماية خصوصية الأفراد.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

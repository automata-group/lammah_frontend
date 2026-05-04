"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    <main className="min-h-screen bg-[#020617] text-slate-100 selection:bg-emerald-500/30 font-sans" dir="rtl">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
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
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-6">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">خصوصيتك أولويتنا</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">سياسة الخصوصية</h1>
              <p className="text-xl text-slate-400 font-medium max-w-2xl">
                نحن نلتزم بحماية بياناتك الشخصية وتأمينها وفقاً لأعلى المعايير القانونية والتقنية.
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
                            ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-inner" 
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
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
            <section id="data" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">1. البيانات التي نجمعها</h2>
              <p className="mb-6">
                انطلاقاً من مبدأ شفافية البيانات، نحن نجمع فقط الحد الأدنى من المعلومات اللازمة لتشغيل وتطوير الخدمات التي تشترك بها:
              </p>
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-white mb-1">معلومات الحساب والتسجيل</strong>
                      <span className="text-slate-400 text-base">نحتفظ بالاسم والبريد الإلكتروني والصورة الرمزية (Profile Picture) عند تسجيلك عبر Google أو البريد لتخصيص حسابك وتأمين دخولك.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-white mb-1">المحتوى الأكاديمي المرفوع</strong>
                      <span className="text-slate-400 text-base">الملفات، المستندات، والنصوص الصوتية التي تقوم برفعها لمعالجتها واستخراج الملخصات والأسئلة منها.</span>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                      <strong className="block text-white mb-1">بيانات التفاعل والاستخدام</strong>
                      <span className="text-slate-400 text-base">إحصائيات تقنية مثل معدل استخدام الخدمة ونوع الجهاز، لمساعدتنا في تحسين الأداء وحل المشاكل التقنية.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="usage" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">2. كيف نستخدم بياناتك</h2>
              <p>يتم توظيف بياناتك للأغراض المشروعة والتشغيلية التالية فقط:</p>
              <ul className="list-disc space-y-3 mr-6 mt-4 text-slate-400 marker:text-emerald-500">
                <li>معالجة المحتوى عبر الذكاء الاصطناعي لاستخراج المخرجات المطلوبة (ملخصات، شروحات، الخ).</li>
                <li>إدارة الاشتراكات والفوترة والتواصل معك بشأن تحديثات النظام أو الدفع.</li>
                <li>حفظ وأرشفة موادك الأكاديمية لتتمكن من الرجوع إليها في أي وقت ضمن لوحة التحكم.</li>
                <li>الامتثال للقوانين واللوائح التنظيمية في فلسطين.</li>
              </ul>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="security" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">3. حماية وأمن البيانات</h2>
              <p className="mb-6">
                يعتبر أمان بياناتك الأولوية القصوى لنا. نحن نطبق إجراءات أمنية صارمة مدعومة بأحدث التقنيات:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl">
                  <h4 className="text-emerald-300 font-bold mb-2">التشفير الكامل</h4>
                  <p className="text-sm text-slate-400">جميع البيانات تنتقل عبر بروتوكولات مشفرة (HTTPS/SSL) ويتم تشفير البيانات الحساسة في قواعد البيانات.</p>
                </div>
                <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl">
                  <h4 className="text-blue-300 font-bold mb-2">الامتثال المحلي</h4>
                  <p className="text-sm text-slate-400">نلتزم بالمبادئ التوجيهية المنصوص عليها في <strong>قانون الاتصالات وتكنولوجيا المعلومات (37) لسنة 2021</strong> لمنع الوصول غير المصرح به.</p>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="sharing" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">4. مشاركة البيانات مع أطراف ثالثة</h2>
              <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                <h3 className="text-2xl font-black text-amber-300 mb-4">نحن لا نبيع بياناتك إطلاقاً</h3>
                <p className="text-amber-200/90 leading-relaxed mb-4">
                  تظل بياناتك ملكاً لك. مشاركتنا للبيانات تقتصر حصرياً على <strong>مزودي خدمات الذكاء الاصطناعي</strong> (مثل OpenAI، Anthropic عبر OpenRouter) لغرض وحيد وهو <strong>تحليل النص ومعالجته لتوفير الخدمة</strong>.
                </p>
                <p className="text-amber-200/70 text-sm font-bold bg-black/20 p-3 rounded-lg border border-amber-500/10 inline-block">
                  ملاحظة هامة: لدينا اتفاقيات صارمة مع هؤلاء المزودين تمنعهم من استخدام محتواك (Zero-Data Retention Policy) لتدريب نماذجهم مستقبلاً.
                </p>
              </div>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="rights" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">5. حقوقك كمستخدم</h2>
              <p>كمستخدم لمنصتنا، أنت تمتلك الحقوق الكاملة التالية فيما يتعلق ببياناتك:</p>
              <ul className="list-disc space-y-3 mr-6 mt-4 text-slate-400 marker:text-emerald-500">
                <li><strong>حق الوصول:</strong> عرض وتحميل جميع ملخصاتك وملفاتك المرتبطة بحسابك.</li>
                <li><strong>حق النسيان (الحذف):</strong> حذف حسابك بالكامل وجميع الملفات التابعة له فوراً وبلا رجعة من خلال لوحة التحكم.</li>
                <li><strong>حق التعديل:</strong> تحديث معلوماتك الشخصية في أي وقت.</li>
              </ul>
            </section>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

            <section id="gdpr" className="scroll-mt-24">
              <h2 className="text-3xl font-black text-white mb-6">6. الامتثال الدولي (GDPR)</h2>
              <p>
                رغم كوننا مؤسسة تعمل في فلسطين، إلا أننا نصمم أنظمتنا لتكون متوافقة بشكل جوهري مع <strong className="text-white">اللائحة العامة لحماية البيانات (GDPR)</strong> الأوروبية، لضمان تطبيق أفضل الممارسات العالمية في حماية خصوصية الأفراد.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

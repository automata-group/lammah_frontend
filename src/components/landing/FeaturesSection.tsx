"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  FileAudio, 
  Brain, 
  ShoppingBag, 
  MessageSquare, 
  BookOpen, 
  GraduationCap,
  Layers,
  ArrowRight
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "توليد دفاتر التلخيص الملونة",
      description: "دفتر ملخص منسق بصرياً بألوان مريحة للعين، يتضمن جداول مقارنة، رسومات توضيحية، وهوامش ذكية، جاهز للطباعة فوراً كـ PDF فائق الجودة.",
      icon: BookOpen,
      color: "from-pink-500 to-rose-500",
      bgLight: "bg-pink-50",
      bgDark: "dark:bg-pink-500/10",
      borderColor: "border-pink-200 dark:border-pink-500/20",
      iconColor: "text-pink-600 dark:text-pink-400"
    },
    {
      title: "دمج فائق الدقة للصوت والسلايدات",
      description: "ارفع السلايدات (PDF أو PPTX) مع تسجيل أو عدة فويسات متفرقة للمحاضرة؛ يربط لمّاح كل فكرة بشريحتها بدقة متناهية ولا يفوّت أي تفصيلة.",
      icon: FileAudio,
      color: "from-indigo-500 to-blue-500",
      bgLight: "bg-indigo-50",
      bgDark: "dark:bg-indigo-500/10",
      borderColor: "border-indigo-200 dark:border-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400"
    },
    {
      title: "امتحانات تجريبية وبطاقات ذكية",
      description: "اختبر جاهزيتك قبل قاعة الامتحان بأسئلة اختيار من متعدد مع شرح فوري للإجابة، وبطاقات استرجاع (Flashcards) بنظام التكرار المتباعد.",
      icon: Brain,
      color: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      bgDark: "dark:bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "مساعد المحاضرة الذكي والمحادثة",
      description: "اسأل عن أي مصطلح غامض أو اطلب توضيح مسألة حسابية؛ يجيبك المساعد بالاستناد الدقيق فقط إلى محتوى المحاضرة وشرح الدكتور دون تشتيت.",
      icon: MessageSquare,
      color: "from-cyan-500 to-blue-500",
      bgLight: "bg-cyan-50",
      bgDark: "dark:bg-cyan-500/10",
      borderColor: "border-cyan-200 dark:border-cyan-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400"
    },
    {
      title: "متجر الدفاتر الأول من نوعه",
      description: "انشر دفاترك وملخصاتك التي تم توليدها وبعها لزملائك في الجامعة لتحقيق دخل حقيقي، أو تصفح المتجر لشراء ملخصات الطلاب المتميزين.",
      icon: ShoppingBag,
      color: "from-amber-400 to-orange-500",
      bgLight: "bg-amber-50",
      bgDark: "dark:bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      title: "حفظ سحابي وأرشيف دائم",
      description: "احفظ كافة تسجيلاتك، تلخيصاتك، ودفاترك المولدة تلقائياً في سحابتك الخاصة للوصول إليها وتنزيلها من أي جهاز وفي أي وقت بكل أمان دون فقدان أي ملف.",
      icon: Layers,
      color: "from-purple-500 to-violet-600",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <section id="features" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden z-20">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20 flex flex-col items-center">
          
          <h2 className="text-4xl sm:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight leading-tight">
            لماذا تختار <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 pb-2">لمّاح؟</span>
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl text-center leading-relaxed font-medium">
            كل ما تحتاجه لتفوقك الدراسي في مكان واحد؛ من تفريغ المحاضرات وتوليد الدفاتر الجمالية إلى الامتحانات وسوق الدفاتر.
          </p>
        </div>

        {/* Features Grid / Mobile Horizontal Carousel */}
        <div className="relative">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-6 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="w-[82vw] max-w-[320px] sm:w-[340px] sm:max-w-none md:w-auto md:max-w-none snap-center shrink-0 group relative bg-white/85 dark:bg-[#070b16]/85 backdrop-blur-2xl rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-7 border border-indigo-200/60 dark:border-white/15 md:border-slate-200/80 md:dark:border-white/10 md:hover:border-indigo-300 shadow-xl shadow-indigo-900/5 dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Card Hover Gradient Background */}
                <div className={`absolute inset-0 opacity-10 md:opacity-0 md:group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br ${feature.color}`} />
                
                <div className="relative z-10 flex flex-col gap-4 sm:gap-5 items-start">
                  {/* Top Bar: Icon */}
                  <div className="w-full flex items-center justify-between">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 flex items-center justify-center border shadow-inner transition-transform duration-500 scale-105 rotate-2 md:scale-100 md:rotate-0 md:group-hover:scale-110 md:group-hover:rotate-3 ${feature.bgLight} ${feature.bgDark} ${feature.borderColor}`}>
                      <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-right">
                    <h3 className="text-xl sm:text-2xl font-black mb-2.5 pb-1 leading-normal tracking-tight text-slate-900 dark:text-white md:group-hover:text-transparent md:group-hover:bg-clip-text md:group-hover:bg-gradient-to-r md:group-hover:from-indigo-600 md:group-hover:to-purple-600 transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute -bottom-5 -left-5 opacity-15 md:opacity-0 md:group-hover:opacity-20 transition-all duration-700 transform scale-125 rotate-12 md:scale-100 md:group-hover:scale-150 pointer-events-none">
                  <feature.icon className={`w-24 h-24 sm:w-28 sm:h-28 ${feature.iconColor}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Swipe Hint */}
          <div className="flex md:hidden items-center justify-center gap-1.5 mt-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200/60 dark:border-white/5">
              اسحب لرؤية باقي المميزات الـ 6 ←
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}

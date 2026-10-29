"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  PenTool, 
  Target, 
  BookOpen, 
  Brain, 
  Zap, 
  Coins, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";

export default function FeaturesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const features = [
    {
      title: "تخطيط السلايدات وكتابة كلام الدكتور",
      description: "يظلل لمّاح سلايداتك الأصلية ويكتب نصاً كل ما شرحه الدكتور في القاعة، مع توضيح للمصطلحات الإنجليزية باللغة العربية لضمان فهمك السريع ليلة الامتحان.",
      icon: PenTool,
      color: "from-indigo-500 to-blue-500",
      bgLight: "bg-indigo-50",
      bgDark: "dark:bg-indigo-500/10",
      borderColor: "border-indigo-200 dark:border-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400"
    },
    {
      title: "صيد ما ركز عليه الدكتور وأسئلة الامتحان",
      description: "يلتقط لمّاح بدقة كل جملة شدد عليها الدكتور وقال عنها «مهمة وجاية بالامتحان»، ويبرزها لك في قسم خاص مع أسئلة متوقعة تغنيك عن سماع ساعات التسجيل.",
      icon: Target,
      color: "from-rose-500 to-red-500",
      bgLight: "bg-rose-50",
      bgDark: "dark:bg-rose-500/10",
      borderColor: "border-rose-200 dark:border-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400"
    },
    {
      title: "دفتر الإنقاذ الشامل (منقذ زنقة الامتحان)",
      description: "مزنوق وما عندك وقت تدرس مئات السلايدات؟ يجمع لك لمّاح خلاصة المادة في دفتر مركّز: أهم المفاهيم، جداول المقارنة، والأسئلة الأساسية لتفهم المادة وتضمن علاماتك بأقل وقت.",
      icon: BookOpen,
      color: "from-pink-500 to-purple-500",
      bgLight: "bg-pink-50",
      bgDark: "dark:bg-pink-500/10",
      borderColor: "border-pink-200 dark:border-pink-500/20",
      iconColor: "text-pink-600 dark:text-pink-400"
    },
    {
      title: "امتحانات تجريبية وبطاقات ذكية (MCQs)",
      description: "اختبر جاهزيتك قبل قاعة الاختبار بأسئلة اختيار من متعدد تحاكي نمط امتحانات الجامعة مع تصحيح فوري، وبطاقات فلاش كاردز لاسترجاع أصعب المصطلحات.",
      icon: Brain,
      color: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      bgDark: "dark:bg-emerald-500/10",
      borderColor: "border-emerald-200 dark:border-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "يعمل مع الفويسات أو السلايدات وحدها",
      description: "ما سجلت المحاضرة أو معك فويسات متفرقة؟ ارفع السلايدات أو الكتاب فقط، وسيتولى لمّاح قراءتها، تخطيطها، وتلخيص كل شابتر كأنك حضرت في القاعة.",
      icon: Zap,
      color: "from-amber-400 to-orange-500",
      bgLight: "bg-amber-50",
      bgDark: "dark:bg-amber-500/10",
      borderColor: "border-amber-200 dark:border-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    {
      title: "حوّل دراستك لأرباح مالية حقيقية",
      description: "لا تدرس مجاناً! انشر دفاتر تلخيصاتك المعتمدة في متجر لمّاح لتباع لزملائك بالجامعات، مع تحويل أرباحك مباشرة لمحفظتك عبر تطبيق ريفلكت أو الحساب البنكي.",
      icon: Coins,
      color: "from-violet-500 to-indigo-600",
      bgLight: "bg-violet-50",
      bgDark: "dark:bg-violet-500/10",
      borderColor: "border-violet-200 dark:border-violet-500/20",
      iconColor: "text-violet-600 dark:text-violet-400"
    }
  ];

  // 100% Asynchronous, Zero-Reflow IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index) && index !== activeIndexRef.current) {
              activeIndexRef.current = index;
              setActiveIndex(index);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.55
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  // Hardware-accelerated Smooth Scroll without Action-State Conflict
  const scrollToCard = useCallback((index: number) => {
    const targetCard = cardRefs.current[index];
    if (targetCard) {
      targetCard.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "nearest"
      });
    }
  }, []);

  const scrollNext = () => {
    scrollToCard(Math.min(features.length - 1, activeIndex + 1));
  };

  const scrollPrev = () => {
    scrollToCard(Math.max(0, activeIndex - 1));
  };

  // Optional mouse drag for desktop preview without interfering with mobile touch
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  return (
    <section id="features" className="relative scroll-mt-24 py-20 sm:py-32 px-4 sm:px-6 overflow-hidden z-20">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-20 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight leading-tight">
            لماذا تختار <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 pb-2">لمّاح؟</span>
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl text-center leading-relaxed font-medium">
            كل ما تحتاجه لتتفوق بأقل وقت ومجهود؛ من تخطيط السلايدات وصيد كلام الدكتور إلى دفاتر الطباعة والامتحانات التجريبية.
          </p>
        </div>

        {/* Features Grid / Mobile Horizontal Carousel */}
        <div className="relative">
          {/* Zero JS on scroll - 100% Native Hardware Acceleration */}
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7 overflow-x-auto md:overflow-x-visible snap-x snap-proximity scrollbar-none [-webkit-overflow-scrolling:touch] scroll-px-4 sm:scroll-px-6 pb-6 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0"
          >
            {features.map((feature, idx) => (
              <div
                key={idx}
                data-index={idx}
                ref={(el) => { cardRefs.current[idx] = el; }}
                className="w-[84vw] max-w-[325px] sm:w-[340px] sm:max-w-none md:w-auto md:max-w-none snap-start shrink-0 group relative bg-white dark:bg-[#0c111d] md:bg-white/85 md:dark:bg-[#070b16]/85 md:backdrop-blur-xl rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-7 border border-indigo-200/60 dark:border-white/10 md:hover:border-indigo-300 shadow-lg shadow-indigo-950/5 dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] md:transition-transform md:duration-300 md:hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between"
              >
                {/* Card Hover Gradient Background */}
                <div className={`absolute inset-0 opacity-10 md:opacity-0 md:group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${feature.color}`} />
                
                <div className="relative z-10 flex flex-col gap-4 sm:gap-5 items-start">
                  {/* Top Bar: Icon */}
                  <div className="w-full flex items-center justify-between">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 flex items-center justify-center border shadow-inner transition-transform duration-300 scale-105 rotate-2 md:scale-100 md:rotate-0 md:group-hover:scale-110 md:group-hover:rotate-3 ${feature.bgLight} ${feature.bgDark} ${feature.borderColor}`}>
                      <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.iconColor}`} />
                    </div>
                    {/* Step indicator on mobile */}
                    <span className="md:hidden text-xs font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-white/5">
                      {idx + 1} / {features.length}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-right">
                    <h3 className="text-xl sm:text-2xl font-black mb-2.5 pb-1 leading-normal tracking-tight text-slate-900 dark:text-white md:group-hover:text-transparent md:group-hover:bg-clip-text md:group-hover:bg-gradient-to-r md:group-hover:from-indigo-600 md:group-hover:to-purple-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute -bottom-5 -left-5 opacity-10 md:opacity-0 md:group-hover:opacity-20 transition-transform duration-500 transform scale-125 rotate-12 md:scale-100 md:group-hover:scale-150 pointer-events-none">
                  <feature.icon className={`w-24 h-24 sm:w-28 sm:h-28 ${feature.iconColor}`} />
                </div>
              </div>
            ))}
            {/* End Spacer for RTL mobile scroll padding */}
            <div className="shrink-0 w-2 md:hidden" aria-hidden="true" />
          </div>

          {/* Interactive Mobile Navigation Bar (Dots + Arrows) */}
          <div className="flex md:hidden items-center justify-between mt-3 px-2">
            {/* Prev Button (In RTL, previous feature is to the right) */}
            <button
              type="button"
              onClick={scrollPrev}
              disabled={activeIndex === 0}
              aria-label="الميزة السابقة"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                activeIndex === 0
                  ? "opacity-30 border-slate-200 dark:border-white/5 text-slate-400 cursor-not-allowed"
                  : "border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 active:scale-95 bg-white dark:bg-slate-900 shadow-xs"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {features.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => scrollToCard(i)}
                  aria-label={`الانتقال إلى الميزة ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === i 
                      ? "w-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400" 
                      : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            {/* Next Button (In RTL, next feature is to the left) */}
            <button
              type="button"
              onClick={scrollNext}
              disabled={activeIndex === features.length - 1}
              aria-label="الميزة التالية"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                activeIndex === features.length - 1
                  ? "opacity-30 border-slate-200 dark:border-white/5 text-slate-400 cursor-not-allowed"
                  : "border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 active:scale-95 bg-white dark:bg-slate-900 shadow-xs"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
        
      </div>
    </section>
  );
}

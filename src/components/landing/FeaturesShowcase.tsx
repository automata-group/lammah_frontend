"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  BookOpen,
  Layers,
  Target,
  Languages,
  HelpCircle,
  MessageSquare,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const features = [
  {
    id: "mindmap",
    title: "الملف المخطط الذكي",
    description: "تخطيط وتظليل ذكي يبرز لك أهم مفاهيم وهيكل المحاضرة داخل الملف الأصلي.",
    icon: <BrainCircuit className="w-5 h-5" />,
    images: ["/features/mindmap.png"],
    likes: "1,482",
    commentsCount: "42",
    topComment: "khaled_99: الملف المخطط وفر عليّ يومين دراسة كاملة! 🔥"
  },
  {
    id: "notes",
    title: "ملاحظات الدكتور بدقة",
    description: "نلتقط كل تعليق وملاحظة جانبية ذكرها الدكتور أثناء الشرح ونربطها بمكانها الصحيح.",
    icon: <BookOpen className="w-5 h-5" />,
    images: ["/features/notes.png"],
    likes: "942",
    commentsCount: "28",
    topComment: "sara_med: شرح النوتس الشفوية أسطوري وجاء في الامتحان!"
  },
  {
    id: "slides",
    title: "التفريغ الذكي",
    description: "شرح مفصل لكل شريحة مع تفريغ النص المحكي وربطه بالمحتوى المرئي بدقة عالية.",
    icon: <Layers className="w-5 h-5" />,
    images: ["/features/تفريغ.png"],
    likes: "2,104",
    commentsCount: "86",
    topComment: "d_engineer: الربط بين السلايد والتسجيل الصوتي عبقري 💻"
  },
  {
    id: "important",
    title: "النقاط المهمة جداً",
    description: "قسم خاص يسلط الضوء على النقاط التي أكد عليها الدكتور وقال أنها هامة للامتحان.",
    icon: <Target className="w-5 h-5" />,
    images: ["/features/important.png"],
    likes: "3,512",
    commentsCount: "124",
    topComment: "nour_h: منقذ حقيقي لليلة الامتحان!"
  },
  {
    id: "terms",
    title: "المصطلحات والترجمة",
    description: "استخراج جميع المصطلحات العلمية والطبية، ترجمتها، وتقديم شرح مبسط لها في سياق المحاضرة.",
    icon: <Languages className="w-5 h-5" />,
    images: ["/features/terms.png"],
    likes: "1,208",
    commentsCount: "33",
    topComment: "med_student: وداعاً لترجمة جوجل الفاشلة للمصطلحات الطبية 🩺"
  },
  {
    id: "questions",
    title: "الأسئلة المولدة",
    description: "اختبر نفسك مع أسئلة ذكية (MCQ وغيرها) تم توليدها تلقائياً من محتوى المحاضرة الفعلي.",
    icon: <HelpCircle className="w-5 h-5" />,
    images: ["/features/q1.png", "/features/q2.png"],
    likes: "2,840",
    commentsCount: "95",
    topComment: "faisal_alkhaldi: الأسئلة نسخت تماماً نمط اختبار الدكتور! 🧠"
  },
  {
    id: "chat",
    title: "محادثة ذكية تفاعلية",
    description: "اسأل الشات بوت أي سؤال حول المحاضرة، وسيجيبك بناءً على ما تم شرحه مع إعادة الصياغة لتسهيل الفهم.",
    icon: <MessageSquare className="w-5 h-5" />,
    images: ["/features/chat1.png", "/features/chat2.png"],
    likes: "4,120",
    commentsCount: "210",
    topComment: "abdulrahman: كأني بدرس مع المحاضر خصوصي وبسأله أي وقت!"
  }
];

export default function FeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(features[0]);
  const [likedFeatures, setLikedFeatures] = useState<Record<string, boolean>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeFeature]);

  const toggleLike = (id: string) => {
    setLikedFeatures(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % activeFeature.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + activeFeature.images.length) % activeFeature.images.length);
  };

  return (
    <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-4 py-2 rounded-full mb-6 backdrop-blur-md"
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-black text-purple-300 uppercase tracking-widest">مميزات استثنائية</span>
        </motion.div>
        <h2 className="text-5xl lg:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight">
          ماذا تقدم لك المنصة؟
        </h2>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
          كل ما تحتاجه لتفوقك الأكاديمي مجموع في مكان واحد، مصمم باحترافية لتجربة دراسية لا مثيل لها.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        {/* Features List (Right Side - RTL) */}
        <div className="w-full lg:w-[35%] flex flex-col gap-4 sticky top-28">
          {features.map((feature) => {
            const isActive = activeFeature.id === feature.id;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={`flex items-start gap-5 p-5 rounded-3xl text-right transition-all duration-500 relative overflow-hidden group ${isActive
                    ? "bg-white/[0.03] border border-white/[0.1] shadow-2xl backdrop-blur-xl"
                    : "bg-transparent border border-transparent hover:bg-white/[0.02]"
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
                )}
                
                <div className={`mt-0.5 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive 
                    ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-110" 
                    : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"
                  }`}>
                  {feature.icon}
                </div>
                
                <div className="relative z-10">
                  <h3 className={`text-lg font-black mb-1.5 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                    {feature.title}
                  </h3>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm text-slate-400 leading-relaxed font-medium mt-2"
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>

        {/* Instagram Post Showcase (Left Side - RTL) */}
        <div className="w-full lg:w-[65%] min-h-[600px] lg:min-h-[750px] relative rounded-[2.5rem] overflow-hidden bg-[#0A0D14] border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.6)] flex items-center justify-center p-4 lg:p-12 ring-1 ring-white/5">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 z-0 pointer-events-none"></div>

          {/* Instagram Post Container */}
          <div className="w-full max-w-[480px] bg-[#000000] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col">
            
            {/* Instagram Post Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-[1px] overflow-hidden">
                    <img src="/lammah-logo.png" alt="Profile" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-white">lammah.site</span>
                    {/* Blue Verified Badge */}
                    <svg className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                    </svg>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold block mt-0.5">برعاية • شريك تفوقك الأكاديمي</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Instagram Post Image Canvas */}
            <div className="relative aspect-[4/5] w-full bg-[#07090e] border-b border-white/5 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 z-0" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeFeature.id}-${currentImageIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 w-full h-full z-10 flex items-center justify-center"
                >
                  <img
                    src={activeFeature.images[currentImageIndex]}
                    alt={activeFeature.title}
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              {activeFeature.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Dots indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/30 px-2 py-1.5 rounded-full backdrop-blur-md">
                    {activeFeature.images.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          currentImageIndex === idx ? "bg-white scale-125" : "bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Instagram Action Icons */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleLike(activeFeature.id)}
                  className={`transition-all active:scale-75 ${
                    likedFeatures[activeFeature.id] ? "text-rose-500 fill-current scale-110" : "text-white hover:text-slate-300"
                  }`}
                >
                  <Heart className="w-6 h-6" />
                </button>
                <button className="text-white hover:text-slate-300 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-white hover:text-slate-300 transition-colors">
                  <Send className="w-5 h-5 -rotate-12" />
                </button>
              </div>
              <button className="text-white hover:text-slate-300 transition-colors">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>

            {/* Instagram Caption & Comments Section */}
            <div className="px-4 pb-5 space-y-2 text-right">
              <p className="text-xs font-black text-white">
                {likedFeatures[activeFeature.id] ? "أنت وآخرون" : `أعجب بـ ${activeFeature.likes}`} طالب وطالبة
              </p>
              
              <div className="text-xs font-medium leading-relaxed">
                <span className="font-black text-white ml-2">lammah.site</span>
                <span className="text-slate-300">
                  {activeFeature.description}
                </span>
                <div className="text-indigo-400 font-bold mt-1.5 flex gap-2 flex-wrap">
                  <span>#منصة_لمّاح</span>
                  <span>#الدراسة_الذكية</span>
                  <span>#تفوق_جامعي</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-bold cursor-pointer pt-1 hover:text-slate-400 transition-colors">
                عرض الكل {activeFeature.commentsCount} تعليقاً
              </div>

              {/* Realistic Top Comment */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 mt-2">
                <p className="text-[11px] font-medium text-slate-300 leading-relaxed">
                  {activeFeature.topComment}
                </p>
              </div>

              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest pt-2">منذ دقيقتين • عرض الترجمة</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, BookOpen, Layers, Target, Languages, HelpCircle, MessageSquare } from "lucide-react";

const features = [
  {
    id: "mindmap",
    title: "  الملف المخطط",
    description: "احصل على خريطة شاملة تربط المفاهيم وتبرز لك هيكل المحاضرة مع تخطيط ذكي للملف الأصلي.",
    icon: <BrainCircuit className="w-6 h-6" />,
    images: ["/features/mindmap.png"]
  },
  {
    id: "notes",
    title: "ملاحظات الدكتور بدقة",
    description: "نلتقط كل تعليق وملاحظة جانبية ذكرها الدكتور أثناء الشرح ونربطها بمكانها الصحيح.",
    icon: <BookOpen className="w-6 h-6" />,
    images: ["/features/notes.png"]
  },
  {
    id: "slides",
    title: "شرح السلايدات",
    description: "شرح مفصل لكل شريحة (Slide) مع تفريغ النص المحكي وربطه بالمحتوى المرئي.",
    icon: <Layers className="w-6 h-6" />,
    images: ["/features/slides.png"]
  },
  {
    id: "important",
    title: "النقاط المهمة جداً",
    description: "قسم خاص يسلط الضوء على النقاط التي أكد عليها الدكتور وقال أنها هامة للامتحان.",
    icon: <Target className="w-6 h-6" />,
    images: ["/features/important.png"]
  },
  {
    id: "terms",
    title: "المصطلحات والترجمة",
    description: "استخراج جميع المصطلحات العلمية والطبية، ترجمتها، وتقديم شرح مبسط لها في سياق المحاضرة.",
    icon: <Languages className="w-6 h-6" />,
    images: ["/features/terms1.png", "/features/terms2.png"]
  },
  {
    id: "questions",
    title: "الأسئلة المولدة",
    description: "اختبر نفسك مع أسئلة ذكية (MCQ وغيرها) تم توليدها تلقائياً من محتوى المحاضرة الفعلي.",
    icon: <HelpCircle className="w-6 h-6" />,
    images: ["/features/questions1.png", "/features/questions2.png"]
  },
  {
    id: "chat",
    title: "محادثة ذكية تفاعلية",
    description: "اسأل الشات بوت أي سؤال حول المحاضرة، وسيجيبك بناءً على ما تم شرحه مع إعادة الصياغة لتسهيل الفهم.",
    icon: <MessageSquare className="w-6 h-6" />,
    images: ["/features/chat1.png", "/features/chat2.png"]
  }
];

export default function FeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/50">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black mb-4">ماذا تقدم لك المنصة؟</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
          كل ما تحتاجه لتفوقك الأكاديمي مجموع في مكان واحد، مصمم باحترافية لتجربة دراسية لا مثيل لها.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Features List (Right Side - RTL) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 sticky top-24">
          {features.map((feature) => {
            const isActive = activeFeature.id === feature.id;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={`flex items-start gap-4 p-4 rounded-2xl text-right transition-all duration-300 ${isActive
                    ? "bg-indigo-600/10 border border-indigo-500/30 shadow-lg shadow-indigo-500/5"
                    : "bg-slate-900/30 border border-transparent hover:bg-slate-800/50 hover:border-slate-700/50"
                  }`}
              >
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? "bg-indigo-500 text-white shadow-md" : "bg-slate-800 text-slate-400"
                  }`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className={`font-bold mb-1 transition-colors ${isActive ? "text-indigo-300" : "text-slate-200"}`}>
                    {feature.title}
                  </h3>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-sm text-slate-400 leading-relaxed font-medium mt-2"
                    >
                      {feature.description}
                    </motion.p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Image Showcase (Left Side - RTL) */}
        <div className="w-full lg:w-2/3 min-h-[500px] lg:min-h-[600px] relative rounded-[2.5rem] overflow-hidden bg-slate-900/50 border border-slate-800 shadow-2xl flex items-center justify-center group p-4 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 z-0"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              <div className={`grid gap-6 w-full items-center justify-center ${activeFeature.images.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {activeFeature.images.map((img, i) => (
                  <div key={i} className="relative group/img rounded-3xl border border-slate-700/50 shadow-2xl bg-slate-800/40 p-8 lg:p-12 flex items-center justify-center h-[280px] lg:h-[380px] overflow-hidden">
                    <img
                      src={img}
                      alt={activeFeature.title}
                      className="w-auto h-auto max-w-[95%] max-h-[95%] object-contain transition-transform duration-700 group-hover/img:scale-105 drop-shadow-2xl rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

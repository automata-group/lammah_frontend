"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, BookOpen, Layers, Target, Languages, HelpCircle, MessageSquare } from "lucide-react";

const features = [
  {
    id: "mindmap",
    title: "الخريطة الذهنية والملف المخطط",
    description: "احصل على خريطة شاملة تربط المفاهيم وتبرز لك هيكل المحاضرة مع تخطيط ذكي للملف الأصلي.",
    icon: <BrainCircuit className="w-6 h-6" />,
    image: "/features/mindmap.jpg"
  },
  {
    id: "notes",
    title: "ملاحظات الدكتور بدقة",
    description: "نلتقط كل تعليق وملاحظة جانبية ذكرها الدكتور أثناء الشرح ونربطها بمكانها الصحيح.",
    icon: <BookOpen className="w-6 h-6" />,
    image: "/features/notes.jpg"
  },
  {
    id: "slides",
    title: "شرح السلايدات",
    description: "شرح مفصل لكل شريحة (Slide) مع تفريغ النص المحكي وربطه بالمحتوى المرئي.",
    icon: <Layers className="w-6 h-6" />,
    image: "/features/slides.jpg"
  },
  {
    id: "important",
    title: "النقاط المهمة جداً",
    description: "قسم خاص يسلط الضوء على النقاط التي أكد عليها الدكتور وقال أنها هامة للامتحان.",
    icon: <Target className="w-6 h-6" />,
    image: "/features/important.jpg"
  },
  {
    id: "terms",
    title: "المصطلحات والترجمة",
    description: "استخراج جميع المصطلحات العلمية والطبية، ترجمتها، وتقديم شرح مبسط لها في سياق المحاضرة.",
    icon: <Languages className="w-6 h-6" />,
    image: "/features/terms.jpg"
  },
  {
    id: "questions",
    title: "الأسئلة المولدة",
    description: "اختبر نفسك مع أسئلة ذكية (MCQ وغيرها) تم توليدها تلقائياً من محتوى المحاضرة الفعلي.",
    icon: <HelpCircle className="w-6 h-6" />,
    image: "/features/questions.jpg"
  },
  {
    id: "chat",
    title: "محادثة ذكية تفاعلية",
    description: "اسأل الشات بوت أي سؤال حول المحاضرة، وسيجيبك بناءً على ما تم شرحه مع إعادة الصياغة لتسهيل الفهم.",
    icon: <MessageSquare className="w-6 h-6" />,
    image: "/features/chat.jpg"
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

      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Features List (Right Side - RTL) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
          {features.map((feature) => {
            const isActive = activeFeature.id === feature.id;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={`flex items-start gap-4 p-4 rounded-2xl text-right transition-all duration-300 ${
                  isActive 
                    ? "bg-indigo-600/10 border border-indigo-500/30 shadow-lg shadow-indigo-500/5" 
                    : "bg-slate-900/30 border border-transparent hover:bg-slate-800/50 hover:border-slate-700/50"
                }`}
              >
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? "bg-indigo-500 text-white shadow-md" : "bg-slate-800 text-slate-400"
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
        <div className="w-full lg:w-2/3 h-[500px] lg:h-[600px] relative rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 z-0"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10 flex items-center justify-center p-8"
            >
              {/* Fallback styling for when images don't exist yet */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800/80 flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 z-10"></div>
                {/* Simulated Image Placeholder */}
                <div className="relative z-20 p-8">
                  <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-indigo-500/30">
                    {activeFeature.icon}
                  </div>
                  <h4 className="text-3xl font-black mb-4 text-white drop-shadow-lg">{activeFeature.title}</h4>
                  <p className="text-slate-300 max-w-md mx-auto text-lg leading-relaxed font-medium">
                    (سيتم إدراج صورة احترافية توضح "{activeFeature.title}" هنا قريباً)
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

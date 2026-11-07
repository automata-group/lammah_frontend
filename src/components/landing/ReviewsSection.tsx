"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Star, 
  Quote, 
  CheckCircle, 
  GraduationCap, 
  Sparkles, 
  Heart, 
  Eye, 
  X, 
  CheckCheck, 
  FileText, 
  Stethoscope, 
  Zap, 
  Flame,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface StudentTestimonial {
  id: string;
  name: string;
  role: string;
  majorBadge: string;
  badgeColor: string;
  avatarLetter: string;
  avatarGradient: string;
  highlightQuote: string;
  chatMessages: Array<{
    text: string;
    isReply?: boolean;
    hasFile?: boolean;
    fileName?: string;
    fileMeta?: string;
    time: string;
    reactions?: string[];
  }>;
  screenshotSrc: string;
  screenshotTitle: string;
  category: "medical" | "exam" | "speed" | "all";
  rating: number;
}

export const REAL_STUDENT_REVIEWS: StudentTestimonial[] = [
  {
    id: "dentistry",
    name: "طالبة في كلية طب وجراحة الأسنان",
    role: "سنة دراسية سريرية • كليات الطب والصحة",
    majorBadge: "🩺 طب وجراحة الأسنان",
    badgeColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800",
    avatarLetter: "ط",
    avatarGradient: "from-emerald-500 to-teal-600",
    highlightQuote: "«أنا فعلاً مش فاتحة المادة أبداً.. ودرست منه للكويز وممتاز بفهم المصطلحات الطبية بعكس شات GPT!»",
    category: "medical",
    rating: 5,
    chatMessages: [
      {
        text: "أنا فعلاً مش فاتحة المادة أبداً أبداً، وصراحة كنت أدرس عن شات بس لما جربت الموقع حبيت كيف الشرح وكيف تفصيل سلايدة بسلايدة. يعني في شغلات في شات مستحيل يقدر يفهمني إياهم بس لما استخدمت الموقع فهمت.. يعني خلص ما بلزم لا أحضر ريكورد ولا أرد أرجع للمادة كمان مرة! أعطيه الملف ويعطيني الشرح وأدرس من الشرح بكون ممتاز ووافي.",
        time: "9:51 م",
        reactions: ["❤️", "🥺"]
      },
      {
        text: "يعني أنا درست للكويز وممتاز كان يعطيني كل المعلومات المطلوبة والأسئلة حلوين برضو.. والحلو إنه مثلاً إني في كلية طب الأسنان وعادي شرح وفهمني لأنه بالعادة شات أو أي موقع ما بفهم في المصطلحات الطبية.",
        time: "9:52 م",
        reactions: ["❤️"]
      },
      {
        text: "لحد هسّا روعة روعة ❤️",
        time: "9:53 م",
        reactions: ["❤️", "🔥"]
      }
    ],
    screenshotSrc: "/reviews/review-5-dentistry-medical.jpg",
    screenshotTitle: "محادثة طالبة كلية طب الأسنان مع منصة لمّاح"
  },
  {
    id: "ruba-graduate",
    name: "رُبى",
    role: "طالبة سنة رابعة (تخرج)",
    majorBadge: "🎓 سنة تخرج ومواد مضغوطة",
    badgeColor: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800",
    avatarLetter: "ر",
    avatarGradient: "from-purple-500 to-indigo-600",
    highlightQuote: "«للأمانة مش شايفة ناقصه إشي، يا ريت لو عملتيه من قبل كان هسّا صرت متخرجة!»",
    category: "exam",
    rating: 5,
    chatMessages: [
      {
        text: "للأمانة مش شايفة ناقصو إشي، ويريت لو عملتي من قبل كان هسا صرت متخرجة.. هالسنة آخر سنة إلي إن شاء الله ورح تبقا سنة مضغوطة يعني دحشر كل موادي بهالسنة.",
        time: "5:28 م",
        reactions: ["💖", "🥺"]
      },
      {
        text: "وأكيييد رح أضل أشترك بهالبرنامج لحد ما أتخرج!",
        time: "5:28 م",
        reactions: ["❤️", "👍"]
      }
    ],
    screenshotSrc: "/reviews/review-3-ruba-graduate.jpg",
    screenshotTitle: "محادثة الطالبة رُبى (سنة تخرج) حول اشتراكها في لمّاح"
  },
  {
    id: "slow-reader-speed",
    name: "طالبة جامعية",
    role: "تحول جذري في سرعة الحفظ والدراسة",
    majorBadge: "⚡ سرعة الفهم والإنجاز",
    badgeColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800",
    avatarLetter: "س",
    avatarGradient: "from-amber-500 to-orange-600",
    highlightQuote: "«أكثر بني آدمة بطيئة بالقراية والحفظ.. هسّا الكل مستغرب كيف صرت أدرس بهالسرعة وبدون ملل!»",
    category: "speed",
    rating: 5,
    chatMessages: [
      {
        text: "صدقيني لو إنه ما عجبنيش كان زمان طقعتله 😂😂 أكثر بني آدمة بطيئة بالقراية والحفظ والفهم وبكره قعدة القراية أساساً.. بس من لما بلشت فيه وهمّ البشر مستغربين ويحكولي لونك هيك بتقعدي تقري من قبل وأقسم بالله ما بجاملك!",
        time: "5:22 م",
        reactions: ["😂", "❤️"]
      },
      {
        text: "بس لع والله كثير منيح وفادني لدرجة حكيت لكل اللي حواليي عنه حتى أمي عجبتها الفكرة.. يعطيكي ألف عافية مبدعة!",
        time: "5:23 م",
        reactions: ["🥺", "💖"]
      }
    ],
    screenshotSrc: "/reviews/review-4-slow-study-speed.jpg",
    screenshotTitle: "محادثة الطالبة حول كسر بطء الدراسة وسرعة الفهم بلمّاح"
  },
  {
    id: "doctor-explanation",
    name: "طالب نظم وتجارة إلكترونية",
    role: "تفريغ السلايدات وملاحظات الدكتور",
    majorBadge: "📄 دقة الشرح وتظليل السلايدات",
    badgeColor: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800",
    avatarLetter: "أ",
    avatarGradient: "from-blue-500 to-cyan-600",
    highlightQuote: "«أكيد ممتاز! الدكتور نفسه ما شرح هيك.. الملف مفصل كل المعلومات ومحددها وأوضح من الشات»",
    category: "exam",
    rating: 5,
    chatMessages: [
      {
        text: "تطور أنظمة الشراء الإلكتروني - لمّاح.pdf",
        hasFile: true,
        fileName: "تطور أنظمة الشراء الإلكتروني - لمّاح.pdf",
        fileMeta: "116 صفحة • 1.0 م.ب • PDF",
        time: "3:09 م"
      },
      {
        text: "هي أول ملف، كثير واضح ومفصل كل المعلومات ومحددها.",
        time: "3:09 م",
        reactions: ["❤️"]
      },
      {
        text: "أكيد ممتاز! الدكتور نفسه ما شرح هيك.. أوضح وأحلى من الشات كتييير.",
        time: "3:10 م",
        reactions: ["👍", "❤️", "🙏"]
      }
    ],
    screenshotSrc: "/reviews/review-1-doctor-explanation.jpg",
    screenshotTitle: "محادثة الطالب ومقارنة شرح لمّاح مع شرح دكتور القاعة"
  },
  {
    id: "design-ux",
    name: "طالبة جامعية",
    role: "سهولة الاستخدام والتنظيم",
    majorBadge: "💖 تجربة مريحة وسلسة",
    badgeColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800",
    avatarLetter: "م",
    avatarGradient: "from-rose-500 to-pink-600",
    highlightQuote: "«ما شاء الله الموقع بجنن وكل إشي فيه حلو.. حبيت تصميم المنصة والتقسيمات المرتبة!»",
    category: "speed",
    rating: 5,
    chatMessages: [
      {
        text: "ما شاء الله الموقع اللي عملتيه بجنن 🥺❤️❤️ وكل إشي فيه حلو.. أعجبني كثير ❤️",
        time: "2:17 م",
        reactions: ["❤️", "🥺"]
      },
      {
        text: "كثير حبيت تصميم المنصة والتقسيمات فيها.. أوضح وأحلى من الشات بكثير.",
        time: "2:18 م",
        reactions: ["❤️"]
      }
    ],
    screenshotSrc: "/reviews/review-2-nice-design.jpg",
    screenshotTitle: "محادثة انطباع الطالبة عن جمال وسهولة استخدام لمّاح"
  }
];

export default function ReviewsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedScreenshot, setSelectedScreenshot] = useState<{ src: string; title: string } | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedScreenshot(null);
    };
    if (selectedScreenshot) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedScreenshot]);

  const filteredReviews = activeCategory === "all"
    ? REAL_STUDENT_REVIEWS
    : REAL_STUDENT_REVIEWS.filter((r) => r.category === activeCategory);

  return (
    <section id="reviews" className="w-full py-16 sm:py-24 relative overflow-hidden select-none scroll-mt-20" dir="rtl">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-pink-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>محادثات وتجارب حقيقية 100% بدون تلميع</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            ماذا يقول طلاب الجامعات عن{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">
              لمّاح؟
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
            محادثات واقعية وصلتنا من طلاب كليات الطب، الهندسة، والصيدلة اعتمدوا على لمّاح لتجاوز أصعب المواد وتحقيق أعلى العلامات.
          </p>

          {/* Social Proof Badges Bar */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 mr-1">4.9 / 5</span>
              <span className="text-[11px] text-slate-400 font-medium">(تقييم عام)</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold">
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              <span>دقة فائقة في المصطلحات الطبية</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold">
              <CheckCircle className="w-4 h-4 text-indigo-500" />
              <span>محادثات موثقة من الطلاب</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {[
              { id: "all", label: "جميع التقييمات", count: REAL_STUDENT_REVIEWS.length },
              { id: "medical", label: "🩺 كليات الطب والصحة", count: 1 },
              { id: "exam", label: "📚 زنقة الفاينل وتظليل السلايدات", count: 2 },
              { id: "speed", label: "⚡ سرعة الحفظ والفهم", count: 2 },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 scale-102"
                    : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:border-indigo-300"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Masonry-Style Chat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="group relative rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-white/10 hover:border-indigo-400/50 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Accent Sheen */}
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

              <div>
                {/* 1. Student Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${rev.avatarGradient} text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/10`}
                    >
                      {rev.avatarLetter}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm truncate">
                          {rev.name}
                        </h3>
                        <span title="طالب موثق لدى منصة لمّاح">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        {rev.role}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-black border ${rev.badgeColor}`}
                  >
                    {rev.majorBadge}
                  </span>
                </div>

                {/* 2. Key Highlight Banner */}
                <div className="p-3 mb-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 text-xs sm:text-[13px] font-bold leading-relaxed flex items-start gap-2">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{rev.highlightQuote}</span>
                </div>

                {/* 3. Authentic Styled Chat Bubbles */}
                <div className="space-y-2.5 p-3 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-[#070b16]/70 border border-slate-200/70 dark:border-slate-800/80">
                  {rev.chatMessages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className="relative rounded-2xl p-3 bg-white dark:bg-[#111726] border border-slate-200/70 dark:border-slate-800 shadow-2xs max-w-[95%]"
                    >
                      {/* Attached PDF Card inside chat if present */}
                      {msg.hasFile && (
                        <div className="mb-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 font-black text-[10px]">
                            PDF
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {msg.fileName}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {msg.fileMeta}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <p className="text-xs sm:text-[12.5px] text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                        {msg.text}
                      </p>

                      {/* Message Footer: Time + WhatsApp-style Checkmark + Reactions */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-white/5 pt-1">
                        {msg.reactions && msg.reactions.length > 0 ? (
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-xs">
                            {msg.reactions.map((emoji, eIdx) => (
                              <span key={eIdx}>{emoji}</span>
                            ))}
                          </div>
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400 mr-auto">
                          <span>{msg.time}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Action: View Original Screenshot Lightbox Trigger */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedScreenshot({ src: rev.screenshotSrc, title: rev.screenshotTitle })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-950/50 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>معاينة المحادثة الأصلية (سكرين شوت)</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Global Floating Trust Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-center relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              جاهز لتجربة الدراسة الذكية التي وثق بها كل هؤلاء الطلاب؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              ارفع محاضرتك وسلايداتك الآن واستمتع بدفتر مرتب وملف مظلل يضمن لك أعلى العلامات بأقل مجهود.
            </p>
            <div className="pt-2">
              <a
                href="/auth"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>ابدأ دراستك الآن</span>
                <Sparkles className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Original Screenshot Lightbox Modal ──────────────────── */}
      <AnimatePresence>
        {selectedScreenshot && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setSelectedScreenshot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full max-h-[90vh] bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedScreenshot.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Image Body (Scrollable if height exceeds) */}
              <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-slate-900/5 dark:bg-black/40">
                <div className="relative max-w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                  <img
                    src={selectedScreenshot.src}
                    alt={selectedScreenshot.title}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-2xl select-none"
                  />
                </div>
              </div>

              {/* Modal Bottom Bar */}
              <div className="p-3 bg-slate-50 dark:bg-[#070b16] border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 font-medium">
                🔒 محادثة حقيقية موثقة من تطبيق المراسلة - تم إخفاء البيانات الشخصية حفاظاً على خصوصية الطالب
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

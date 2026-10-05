"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Sparkles, BookOpen, MessageCircle, Crown, 
  ChevronLeft, Download, Check, Book, BrainCircuit, Target, 
  ArrowRight, RotateCcw, Copy, Send
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Data from user lama33@gmail.com (0968d265.pdf - تطور العملات: الذهب للبيتكوين)
const FOCUS_POINTS = [
  {
    page: 1,
    title: "الامتحانات وتوزيع العلامات",
    detail: "المحاضر شدد على أهمية الـ Presentations وضرورة أن تكون ذات فائدة للطلاب وحذر من التساهل فيها (10 علامات)، بجانب امتحان عملي وواجبات (15 علامة)، وميد (35 علامة)، وفاينل (20 علامة)."
  },
  {
    page: 2,
    title: "أهمية دراسة الـ Blockchain",
    detail: "أكد المحاضر أن سلاسل الكتل تمثل ثورة تكنولوجية واستثمارات بمليارات الدولارات (Go where the money flow)، وتوفر فرص عمل واعدة وتجذب كبرى الشركات ومفهوم الأصول الرقمية (Digitized Assets)."
  },
  {
    page: 3,
    title: "مفهوم المركزية ومخاطرها",
    detail: "الـ Centralization تعتمد على الثقة بجهة مركزية واحدة (مثل البنوك والحكومات)، لكنها تحمل مخاطر احتكار السلطة وسوء الاستغلال ووجود نقطة فشل واحدة (Single Point of Failure)."
  },
  {
    page: 4,
    title: "مفهوم اللامركزية (Decentralization)",
    detail: "اللامركزية تهدف إلى سحب السلطات ونقلها لأفراد المجتمع أنفسهم (Self-Sovereign)، مما يجعل النظام مقاوماً للهجمات وأقل عرضة للفشل ويمنح المستخدمين سيادة على أصولهم وبياناتهم."
  },
  {
    page: 10,
    title: "ربط الكتل تشفيرياً (Cryptographically Linked)",
    detail: "شرح آلية ربط الكتل ببعضها بواسطة Previous Hash و Current Hash، مما يجعل أي تلاعب في أي كتلة يتطلب إعادة حساب وتغيير كل الكتل اللاحقة بصورة مستحيلة حسابياً."
  },
  {
    page: 13,
    title: "خصائص خوارزمية الهاش (Hash Algorithm)",
    detail: "الخصائص الخمس الأساسية لأمان البلوكتشين: باتجاه واحد (One-way)، حتمية (Deterministic)، حساب سريع (Fast Computation)، تأثير الانهيار الجليدي (Avalanche Effect)، ومقاومة التصادم."
  }
];

const FLASHCARDS = [
  { front: "Centralization", back: "نظام حوكمة يتم فيه التحكم والسلطة من قبل جهة واحدة أو كيان مركزي، مثل البنوك أو الحكومات." },
  { front: "Decentralization", back: "نظام يتم فيه توزيع السلطة والتحكم بين عدة أطراف أو أفراد المجتمع، بدلاً من تركيزها في نقطة واحدة." },
  { front: "Single Point of Failure (SPOF)", back: "نقطة ضعف في الأنظمة المركزية، حيث يؤدي فشل أو اختراق هذه النقطة الواحدة إلى تعطل النظام بأكمله." },
  { front: "Digitized Assets", back: "أصول رقمية غير ملموسة (إلكترونية) لها قيمة اقتصادية كبيرة، ظهرت بفضل تقنية البلوك تشين." },
  { front: "Satoshi Nakamoto", back: "الاسم المستعار للشخص أو المجموعة التي اقترحت إنشاء أول عملة رقمية (البيتكوين) في عام 2008." },
  { front: "2008 Global Financial Crisis", back: "الأزمة المالية العالمية التي كشفت عن نقاط ضعف الأنظمة المالية المركزية وساهمت في ظهور فكرة العملات اللامركزية." },
  { front: "Blockchain as a Revolution", back: "اعتبار البلوك تشين ثورة تكنولوجية قادمة لما لها من تأثير جذري على مختلف القطاعات والأنظمة المالية." },
  { front: "Peer-to-Peer (P2P)", back: "معاملة تتم مباشرة بين طرفين (الند للند) دون الحاجة لوسيط مركزي مثل البنوك أو السيرفرات." },
  { front: "Self-Sovereign", back: "الحالة التي يتمتع فيها الأفراد بالتحكم والسيادة الكاملة على بياناتهم وأصولهم وهويتهم دون الحاجة لجهة مركزية." },
  { front: "BitTorrent Protocol", back: "بروتوكول لمشاركة الملفات يعتمد على مبدأ الند للند (P2P)، حيث يتم تبادل الملفات مباشرة بين المستخدمين دون سيرفر مركزي." }
];

const MCQS = [
  {
    question: "ما هو التعريف الدقيق للمركزية (Centralization) وفق ما ورد في المحاضرة؟",
    options: [
      "توزيع الصلاحيات والسلطة بالتساوي بين جميع المشاركين",
      "إدارة وحوكمة النظام من قبل سلطة واحدة أو جهة مركزية",
      "نظام لا يتطلب أي ثقة متبادلة بين المؤسسات",
      "نظام يمنع أي طرف من الاحتفاظ بسجلات إدارية"
    ],
    correct: 1,
    explanation: "المركزية تعني تركز اتخاذ القرار والحوكمة لدى سلطة مركزية واحدة (Single Authority) مثل البنك المركزي أو الحكومة."
  },
  {
    question: "ما هو الخطر الأساسي المرتبط بالأنظمة المركزية الذي شدد عليه الدكتور؟",
    options: [
      "بطء معالجة العمليات الحسابية البسيطة",
      "صعوبة تنظيم الاتفاقيات القانونية بين الدول",
      "احتكار السلطة واحتمالية إساءة استخدام النفوذ أو اختراقها",
      "ارتفاع تكلفة الأجهزة الشخصية للمستخدمين"
    ],
    correct: 2,
    explanation: "شدد الدكتور على أن تركز السلطة بيد جهة واحدة يفتح المجال للاحتكار، وسوء الاستخدام (كما في تحكم أمريكا بالدولار)، إضافة إلى خطر نقطة الفشل الواحدة."
  },
  {
    question: "ما هي الميزة الجوهرية للامركزية (Decentralization) في شبكات البلوكتشين؟",
    options: [
      "الاعتماد على خادم مركزي واحد فائق الأمان",
      "مرونة النظام ومقاومته العالية للأعطال والهجمات بسبب توزيع العقد",
      "سهولة إلغاء وحذف المعاملات السابقة بضغطة زر",
      "تقليل الشفافية والرقابة بين المشاركين"
    ],
    correct: 1,
    explanation: "اللامركزية تجعل النظام عالي المرونة (Resilient)؛ فتعطل عقدة أو جهاز لا يؤدي أبداً لتوقف الشبكة لأن البيانات موزعة بين الجميع."
  },
  {
    question: "ما هو الحدث العالمي الذي عجّل بظهور فكرة البيتكوين عام 2008؟",
    options: [
      "انفجار فقاعة الدوت كوم عام 2000",
      "الأزمة المالية وأزمة الرهن العقاري عام 2008",
      "صدمة نيكسون وفك ارتباط الذهب عام 1971",
      "تأسيس شركة مايكروسوفت وأنظمة الويندوز"
    ],
    correct: 1,
    explanation: "أزمة 2008 المالية وإفلاس البنوك كشفت عيوب النظام المالي المركزي ودفعت ساتوشي ناكاموتو لطرح ورقة البيتكوين البيضاء."
  }
];

const CHAT_PREVIEWS = [
  {
    q: "ما هو سبب ظهور البيتكوين والعملات اللامركزية وفق ما ذكره الدكتور؟",
    a: "أوضح الدكتور في المحاضرة أن الفكرة بدأت تاريخياً مع أزمة الرهن العقاري عام 2008، حيث أفلست كبرى البنوك المركزية بسبب احتكار السلطة وسوء الاستخدام. وفي نفس العام، طرح 'ساتوشي ناكاموتو' أول عملة رقمية مبنية على تقنية البلوك تشين لتكون لامركزية ولا تخضع لسيطرة حكومة أو بنك واحد."
  },
  {
    q: "كيف وزّع الدكتور علامات المساق والامتحانات؟",
    a: "حدد الدكتور التقسيم التالي بدقة: 35 علامة لامتحان الميدتيرم، 10 علامات للـ Presentation (بحد أقصى 3 طلاب في المجموعة وشدد على جودة وفائدة العرض)، 15 علامة للامتحان العملي والواجبات، و20 علامة للامتحان النهائي الفاينل."
  }
];

export interface DemoResultUIProps {
  actionText?: string;
  onAction?: () => void;
}

export default function DemoResultUI({ actionText, onAction }: DemoResultUIProps = {}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"chat" | "focus" | "flashcards" | "quiz">("chat");
  const [isCopied, setIsCopied] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({ 0: 1 });

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 pb-10 text-right" dir="rtl">
      
      {/* Title & Actions Bar */}
      <div className="lg:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white/90 dark:bg-slate-900/60 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-indigo-200/80 dark:border-indigo-500/30 shrink-0">
            <Book className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              تطور العملات: الذهب للبيتكوين
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Blockchain: Introduction • المحاضرة المسجلة وسلايدات العرض</p>
          </div>
        </div>
        
        <button
          onClick={() => (onAction ? onAction() : router.push("/#pricing"))}
          className="relative z-10 flex items-center gap-1.5 sm:gap-2 text-white font-black transition-all bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.35)] w-full sm:w-auto justify-center text-xs sm:text-sm cursor-pointer"
        >
          <span>{actionText || "أنشئ حسابك لحفظ النتيجة"}</span>
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Right Column: PDF Viewer + Transcript */}
      <div className="lg:col-span-2 space-y-6 sm:space-y-8 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* PDF Card */}
        <div className="bg-white/90 dark:bg-slate-950/40 backdrop-blur-3xl border border-slate-200/80 dark:border-indigo-500/15 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden z-10 group">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center border border-indigo-200/80 dark:border-indigo-500/20 shadow-inner shrink-0">
                <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">دفتر التلخيص الذكي</h2>
                <p className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-300/70 font-black tracking-[0.2em] mt-1 uppercase">SMART ANNOTATED NOTEBOOK</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
              <button 
                onClick={() => router.push("/#pricing")}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>تدوين ملاحظات ومخططات</span>
              </button>

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/summarize/download/0968d265.pdf?title=${encodeURIComponent("إدارة المشاريع")}&mode=annotated`}
                download="إدارة المشاريع - مخططة فويسات - لمّاح.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all flex items-center shadow-[0_0_20px_rgba(99,102,241,0.3)] text-xs sm:text-sm cursor-pointer"
              >
                <Download className="w-4 h-4 ml-1.5" />
                تحميل الملف
              </a>
            </div>
          </div>
          
          <div className="relative rounded-xl sm:rounded-[1.5rem] p-1 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-slate-950/80 border border-slate-200 dark:border-slate-800/60 shadow-inner">
            <iframe
              src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"}/api/v1/summarize/download/0968d265.pdf#toolbar=0`}
              className="w-full h-[380px] sm:h-[520px] lg:h-[660px] rounded-lg sm:rounded-[1.25rem] bg-white dark:bg-slate-900 transition-all border border-slate-200 dark:border-slate-950/50"
              title="Smart Annotated Notebook"
            />
          </div>
        </div>
        
        {/* Transcript Card */}
        <div className="bg-white/90 dark:bg-slate-950/20 backdrop-blur-3xl border border-slate-200/80 dark:border-indigo-500/10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden relative group">
          <div className="p-4 sm:p-8 pb-4 sm:pb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                  <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mb-1">تفريغ لمّاح السريع</h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> نص المحاضرة مفرغ ومنسق بدقة عبر محرك لمّاح
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-[1.25rem] font-bold transition-all border text-xs sm:text-sm w-full md:w-auto justify-center cursor-pointer ${
                  isCopied 
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'تم النسخ!' : 'نسخ النص'}
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-8 pb-4 sm:pb-8">
            <div className="bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-md p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 shadow-inner relative max-h-[400px] overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent z-10 pointer-events-none" />
              <div className="relative z-10 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-[2] font-medium opacity-90 space-y-4">
                <p>بسم الله الرحمن الرحيم، صباح الخير للجميع. في المحاضرة السابقة كنا نتحدث عن لمحة تاريخية عن الذهب والعملات وكيف تحول الذهب إلى عملات ورقية، وكيف كانت البنوك تخزن غطاء من الذهب وتعطي الناس بدلاً منه أوراقاً نقدية.</p>
                <p>وحكينا كيف تعهدت أمريكا في الحرب العالمية الثانية بأن كل 35 دولاراً تعادل أونصة ذهب، ثم في عام 1971 وقعت صدمة نيكسون حين تم فك ارتباط الذهب بالدولار، وأصبحت أمريكا تسيطر على النظام المالي العالمي عبر الدولار ونظام سويفت دون وجود غطاء ذهبي حقيقي.</p>
                <p>ثم جاءت أزمة الرهن العقاري عام 2008، حيث انهارت كبرى المؤسسات البنكية الأمريكية وكشفت عن هشاشة المركزية الشديدة. وهنا ظهرت فكرة اللامركزية مع ساتوشي ناكاموتو وإطلاق أول عملة رقمية مبنية على سلاسل الكتل (البلوكتشين)...</p>
                <p>المساق يركز على تكنولوجيا البلوكتشين كبنية تحتية للأصول الرقمية وليس فقط العملات، وسنناقش لغة Solidity وتطبيقات العقود الذكية لاحقاً في الفصل...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Column: Interactive 4-Tab Panel */}
      <div className="space-y-6 lg:col-span-1">
        {/* 2x2 Tab Grid matching exact screenshot */}
        <div className="grid grid-cols-2 gap-2 bg-white/90 dark:bg-slate-950/60 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-3xl relative z-20">
          <button 
            onClick={() => setActiveTab("chat")} 
            className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
              activeTab === "chat" 
                ? "bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <MessageCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>المحادثة الذكية</span>
          </button>

          <button 
            onClick={() => setActiveTab("focus")} 
            className={`flex items-center justify-between px-3 py-3 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
              activeTab === "focus" 
                ? "bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>نقاط التركيز</span>
            </div>
            <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 px-2 py-0.5 rounded-full">6</span>
          </button>

          <button 
            onClick={() => setActiveTab("flashcards")} 
            className={`flex items-center justify-between px-3 py-3 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
              activeTab === "flashcards" 
                ? "bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span>بطاقات الحفظ</span>
            </div>
            <span className="text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30 px-2 py-0.5 rounded-full">10</span>
          </button>

          <button 
            onClick={() => setActiveTab("quiz")} 
            className={`flex items-center justify-between px-3 py-3 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
              activeTab === "quiz" 
                ? "bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>اختبر نفسك</span>
            </div>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full">10</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {/* 1. Smart Chat Tab */}
          {activeTab === "chat" && (
            <motion.div 
              key="chat" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              transition={{ duration: 0.2 }} 
              className="bg-white/90 dark:bg-slate-950/30 backdrop-blur-3xl border border-blue-200/80 dark:border-blue-500/15 p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group flex flex-col min-h-[500px]"
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xl mb-1">
                  <MessageCircle className="w-5 h-5" />
                  <h3>تحدث مع المحاضرة</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  يستند الرد لمعالجة سؤالك باحترافية، مع توضيح ما ذكره الدكتور في المحاضرة.
                </p>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {CHAT_PREVIEWS.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tl-sm text-xs font-medium max-w-[90%] shadow-sm">
                        {item.q}
                      </div>
                    </div>
                    {/* AI Answer */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-500/30">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl rounded-tr-sm border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-medium max-w-[90%] shadow-sm">
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 relative">
                <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    disabled 
                    placeholder="اسألني عن محتوى المحاضرة أو علامات المساق..." 
                    className="flex-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" 
                  />
                  <button 
                    onClick={() => router.push("/#pricing")} 
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-xl flex items-center justify-center shrink-0 shadow-lg cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  
                  {/* Click to start CTA overlay */}
                  <div 
                    onClick={() => router.push("/#pricing")} 
                    className="absolute inset-0 bg-white/80 dark:bg-slate-950/70 backdrop-blur-[2px] rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-500/30 cursor-pointer hover:bg-white/90 dark:hover:bg-slate-950/80 transition-all"
                  >
                    <span className="text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" /> سجّل لتجربة المحادثة مجاناً
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Focus Points Tab (6 Points) */}
          {activeTab === "focus" && (
            <motion.div 
              key="focus" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              transition={{ duration: 0.2 }} 
              className="bg-white/90 dark:bg-slate-950/30 backdrop-blur-3xl border border-amber-200/80 dark:border-amber-500/15 p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xl">
                  <Target className="w-5 h-5 text-amber-500" />
                  <h3>نقاط التركيز للاختبار</h3>
                </div>
                <span className="text-xs text-amber-700 dark:text-amber-300/80 font-bold">6 مواضع رئيسية</span>
              </div>

              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {FOCUS_POINTS.map((fp, i) => (
                  <div key={i} className="bg-amber-50/40 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-amber-200/60 dark:border-slate-800/80 border-r-4 border-r-amber-500 hover:border-amber-500/50 transition-all">
                    <div className="flex justify-between items-center mb-1.5">
                      <h4 className="text-sm font-black text-amber-900 dark:text-amber-300">{fp.title}</h4>
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20 px-2 py-0.5 rounded-full">
                        شريحة {fp.page}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{fp.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. Flashcards Tab (10 Cards) */}
          {activeTab === "flashcards" && (
            <motion.div 
              key="flashcards" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              transition={{ duration: 0.2 }} 
              className="bg-white/90 dark:bg-slate-950/30 backdrop-blur-3xl border border-purple-200/80 dark:border-purple-500/15 p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group min-h-[500px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-xl">
                    <BookOpen className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    <h3>بطاقات الحفظ الذكية</h3>
                  </div>
                  <span className="text-xs text-purple-700 dark:text-purple-300/80 font-bold">
                    {currentCardIndex + 1} من {FLASHCARDS.length}
                  </span>
                </div>

                {/* Flip Card */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)} 
                  className="bg-purple-50/40 hover:bg-purple-50/70 dark:bg-slate-900/60 dark:hover:bg-slate-900/90 border border-purple-200 dark:border-purple-500/30 p-8 rounded-3xl min-h-[220px] flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-lg shadow-purple-500/5 group/card"
                >
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400/80 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 group-hover/card:rotate-180 transition-transform duration-500" />
                    {isFlipped ? "المعنى والشرح" : "المصطلح (انقر للقلب)"}
                  </span>

                  <p className={`font-black leading-relaxed transition-all ${
                    isFlipped ? "text-slate-800 dark:text-slate-100 text-sm sm:text-base font-medium" : "text-slate-900 dark:text-white text-xl sm:text-2xl"
                  }`}>
                    {isFlipped ? FLASHCARDS[currentCardIndex].back : FLASHCARDS[currentCardIndex].front}
                  </p>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : FLASHCARDS.length - 1));
                  }} 
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
                >
                  السابق ←
                </button>

                <div className="flex gap-1">
                  {FLASHCARDS.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentCardIndex ? "bg-purple-600 dark:bg-purple-500 w-4" : "bg-slate-300 dark:bg-slate-700"
                      }`} 
                    />
                  ))}
                </div>

                <button 
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev < FLASHCARDS.length - 1 ? prev + 1 : 0));
                  }} 
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition cursor-pointer shadow-md"
                >
                  التالي →
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. Quiz Tab (MCQs) */}
          {activeTab === "quiz" && (
            <motion.div 
              key="quiz" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              transition={{ duration: 0.2 }} 
              className="bg-white/90 dark:bg-slate-950/30 backdrop-blur-3xl border border-emerald-200/80 dark:border-emerald-500/15 p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xl">
                  <BrainCircuit className="w-5 h-5 text-emerald-500" />
                  <h3>اختبر نفسك (MCQs)</h3>
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-300/80 font-bold">10 أسئلة متوقعة</span>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {MCQS.map((mcq, qIdx) => {
                  const selected = selectedAnswers[qIdx];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = selected === mcq.correct;

                  return (
                    <div key={qIdx} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h4 className="text-slate-900 dark:text-slate-100 font-bold mb-3 text-xs sm:text-sm leading-relaxed">
                        {qIdx + 1}. {mcq.question}
                      </h4>

                      <div className="space-y-2">
                        {mcq.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isOptionCorrect = optIdx === mcq.correct;

                          let btnStyle = "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800/40 dark:border-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-800";
                          if (hasAnswered) {
                            if (isOptionCorrect) {
                              btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold dark:bg-emerald-500/20 dark:border-emerald-500/50 dark:text-emerald-300";
                            } else if (isOptionSelected) {
                              btnStyle = "bg-rose-50 border-rose-300 text-rose-800 font-bold dark:bg-rose-500/20 dark:border-rose-500/50 dark:text-rose-300";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })}
                              className={`w-full text-right p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                            >
                              <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                                hasAnswered && isOptionCorrect 
                                  ? "border-emerald-500 bg-emerald-500 text-white font-black" 
                                  : "border-slate-300 dark:border-slate-500"
                              }`}>
                                {hasAnswered && isOptionCorrect && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="flex-1">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${
                          isCorrect 
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" 
                            : "bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300"
                        }`}>
                          <strong className="block mb-1">{isCorrect ? "إجابة صحيحة! أحسنت 🎯" : "إجابة خاطئة ❌"}</strong>
                          {mcq.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Shuffle,
  RotateCcw,
  ExternalLink,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Award,
  ListTodo,
  Lock,
  Crown,
} from "lucide-react";
import { MCQItem } from "@/types/dashboard";
import { getActualSlidePage, getActualCompPage } from "@/lib/dashboardUtils";

interface QuizTabContentProps {
  mcqs: MCQItem[];
  isBasicPlan: boolean;
  slidePageMap?: Record<number, number>;
  companionPageMap?: Record<number, number[] | number>;
  jumpToPdfSlide: (pageOrSlideNum: number, targetType?: "slide" | "comp1" | "comp2" | number) => void;
  isQuizCompleted: boolean;
  setIsQuizCompleted: (completed: boolean) => void;
}

export default function QuizTabContent({
  mcqs,
  isBasicPlan,
  slidePageMap,
  companionPageMap,
  jumpToPdfSlide,
  isQuizCompleted,
  setIsQuizCompleted,
}: QuizTabContentProps) {
  const router = useRouter();

  const [quizIndex, setQuizIndex] = useState(0);
  const [shuffledMcqs, setShuffledMcqs] = useState<MCQItem[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [, setShowExplanation] = useState<Record<number, boolean>>({});

  if (!mcqs || mcqs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-8 rounded-3xl text-center space-y-2">
        <BrainCircuit className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
        <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">لا توجد أسئلة اختبار مستخرجة</h4>
      </div>
    );
  }

  const originalQuestions = mcqs;
  const questionsList = shuffledMcqs || originalQuestions;
  const totalQuestions = questionsList.length;
  const currentQ = questionsList[quizIndex] || questionsList[0];
  const progressPercent = totalQuestions > 0 ? Math.min(100, Math.round(((quizIndex + 1) / totalQuestions) * 100)) : 0;

  const isCurrentAnswered = !!selectedAnswers[quizIndex];
  const isCurrentCorrect = selectedAnswers[quizIndex] === currentQ.correct_answer;

  const handleNext = () => {
    if (quizIndex < totalQuestions - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handlePrev = () => {
    if (quizIndex > 0) {
      setQuizIndex((prev) => prev - 1);
    }
  };

  const handleShuffleQuiz = () => {
    const shuffled = [...originalQuestions].sort(() => Math.random() - 0.5);
    setShuffledMcqs(shuffled);
    setSelectedAnswers({});
    setShowExplanation({});
    setQuizIndex(0);
    setIsQuizCompleted(false);
  };

  const handleResetQuiz = () => {
    setShuffledMcqs(null);
    setSelectedAnswers({});
    setShowExplanation({});
    setQuizIndex(0);
    setIsQuizCompleted(false);
  };

  const optionLabels = ["أ", "ب", "ج", "د", "هـ"];

  return (
    <div className="space-y-6 relative z-10">
      {/* Plan Lock Overlay */}
      {isBasicPlan && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/90 rounded-[2.5rem] p-4 sm:p-8 text-center border border-emerald-200 dark:border-emerald-500/20 shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200 dark:border-emerald-500/30">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-l dark:from-emerald-200 dark:to-teal-400 mb-4">
            طوّر دراستك واختبر نفسك!
          </h3>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium">
            ميزة <strong>اختبارات لمّاح التفاعلية (MCQs)</strong> حصرية لاشتراكات الباقات المتقدمة و الـ VIP. <br />
            <span className="text-slate-500 dark:text-slate-400 text-sm mt-2 block">
              رقي باقتك الآن لتفجير طاقتك الدراسية بأقوى أدوات الاسترجاع المتباعد!
            </span>
          </p>
          <button
            onClick={() => router.push("/plans")}
            className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center text-base sm:text-lg transform hover:-translate-y-1 cursor-pointer"
          >
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 ml-2" /> ترقية الباقة الآن لفك القفل
          </button>
        </div>
      )}

      <div className={isBasicPlan ? "opacity-20 pointer-events-none select-none transition-all" : ""}>
        {isQuizCompleted ? (
          /* Celebratory / Score Summary Card */
          (() => {
            const correctCount = questionsList.filter((q, idx) => selectedAnswers[idx] === q.correct_answer).length;
            const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            let gradeMessage = "";
            let gradeBadge = "";
            if (scorePercent >= 90) {
              gradeMessage = "أسطوري! أداء استثنائي يثبت تمكنك الكامل من أفكار المحاضرة 🌟";
              gradeBadge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300";
            } else if (scorePercent >= 70) {
              gradeMessage = "ممتاز جداً! فهمك عميق ومستواك يؤهلك للتفوق في الامتحان النهائي 🎯";
              gradeBadge = "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300";
            } else if (scorePercent >= 50) {
              gradeMessage = "جيد! راجع الأسئلة التي تعثرت بها وشريحة الشرح لترسيخ الفهم 📚";
              gradeBadge = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300";
            } else {
              gradeMessage = "بداية جيدة! ارجع لشريحة الشرح المخصصة بالدفتر ثم أعد المحاولة لتصل للعلامة الكاملة 💪";
              gradeBadge = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300";
            }

            return (
              <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm text-center relative overflow-hidden">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
                  <Award className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border mb-3 ${gradeBadge}`}>
                  {scorePercent >= 70 ? "اجتياز بتفوق" : "اكتمل الاختبار"}
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
                  نتيجتك في الاختبار: {correctCount} من {totalQuestions}
                </h3>

                <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-3 tracking-tight">
                  {scorePercent}%
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6 leading-relaxed font-medium">
                  {gradeMessage}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة الاختبار من البداية</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuizCompleted(false);
                      setQuizIndex(0);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ListTodo className="w-4 h-4" />
                    <span>مراجعة الأسئلة سؤالاً بسؤال</span>
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          /* Active Question Box */
          <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 rounded-3xl shadow-sm transition-all">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  اختبر نفسك
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {totalQuestions} أسئلة
                  </span>
                </h3>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={handleShuffleQuiz}
                  title="خلط ترتيب الأسئلة"
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>خلط</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  title="إعادة من البداية"
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة</span>
                </button>
              </div>
            </div>

            {/* Clean Progress Bar */}
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-4">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Details */}
            <div className="py-2">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  سؤال #{quizIndex + 1} من {totalQuestions}
                </span>

                <div className="flex items-center gap-1.5">
                  {currentQ.page_number && (
                    <button
                      type="button"
                      onClick={() => jumpToPdfSlide(currentQ.page_number!, "slide")}
                      className="text-[10px] font-black bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      title={`انتقل للشريحة ${getActualSlidePage(currentQ.page_number, 1, slidePageMap)} في ملف الـ PDF`}
                    >
                      <span>شريحة {getActualSlidePage(currentQ.page_number, 1, slidePageMap)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {companionPageMap?.[currentQ.page_number || 1] && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToPdfSlide(currentQ.page_number || 1, "comp1");
                      }}
                      className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      title={`انتقل لشريحة الشرح ${getActualCompPage(currentQ.page_number, 1, companionPageMap, slidePageMap)} المخصصة لهذه الشريحة داخل الدفتر`}
                    >
                      <span>شريحة الشرح {getActualCompPage(currentQ.page_number, 1, companionPageMap, slidePageMap)} 📖</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-4">
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {Array.isArray(currentQ?.options) &&
                  currentQ.options.map((opt: string, optIdx: number) => {
                    const isSelected = selectedAnswers[quizIndex] === opt;
                    const isCorrectOpt = opt === currentQ.correct_answer;

                    let optStyle =
                      "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500/60 hover:bg-emerald-50/30 dark:hover:bg-slate-800 shadow-2xs";

                    if (isCurrentAnswered) {
                      if (isCorrectOpt) {
                        optStyle =
                          "bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-black shadow-xs";
                      } else if (isSelected && !isCorrectOpt) {
                        optStyle =
                          "bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-900 dark:text-rose-200 font-bold";
                      } else {
                        optStyle =
                          "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={isCurrentAnswered}
                        onClick={() => {
                          setSelectedAnswers((prev) => ({ ...prev, [quizIndex]: opt }));
                          setShowExplanation((prev) => ({ ...prev, [quizIndex]: true }));
                        }}
                        className={`w-full text-right p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border ${
                              isCurrentAnswered && isCorrectOpt
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : isCurrentAnswered && isSelected && !isCorrectOpt
                                ? "bg-rose-500 text-white border-rose-500"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {optionLabels[optIdx] || optIdx + 1}
                          </span>
                          <span className="leading-relaxed font-medium truncate sm:whitespace-normal">
                            {opt}
                          </span>
                        </div>

                        {/* Status Icon */}
                        {isCurrentAnswered && isCorrectOpt && (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        {isCurrentAnswered && isSelected && !isCorrectOpt && (
                          <X className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Instant Explanation Box */}
              {isCurrentAnswered && (
                <div className="mt-4 overflow-hidden">
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrentCorrect
                        ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30"
                        : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isCurrentCorrect
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {isCurrentCorrect ? "🎉 إجابة صحيحة!" : "⚠️ إجابة غير صحيحة"}
                      </span>
                      {!isCurrentCorrect && (
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          الإجابة الصحيحة:{" "}
                          <strong className="text-emerald-700 dark:text-emerald-300">
                            {currentQ.correct_answer}
                          </strong>
                        </span>
                      )}
                    </div>
                    {currentQ.explanation && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        💡 <strong>السبب:</strong> {currentQ.explanation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Stepper Controls */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={handlePrev}
                disabled={quizIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>

              <span className="text-slate-400 dark:text-slate-500">
                {quizIndex + 1} من {totalQuestions}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${
                  isCurrentAnswered
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white font-black ring-2 ring-emerald-500/30 shadow-md shadow-emerald-600/20"
                    : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
                }`}
              >
                <span>{quizIndex === totalQuestions - 1 ? "إنهاء النتيجة 🏆" : "التالي"}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

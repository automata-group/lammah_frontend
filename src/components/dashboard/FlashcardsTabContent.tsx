"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Shuffle, RotateCcw, ChevronRight, ChevronLeft, Lock, Crown } from "lucide-react";
import { FlashcardItem } from "@/types/dashboard";

interface FlashcardsTabContentProps {
  flashcards: FlashcardItem[];
  isBasicPlan: boolean;
}

export default function FlashcardsTabContent({
  flashcards,
  isBasicPlan,
}: FlashcardsTabContentProps) {
  const router = useRouter();

  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<FlashcardItem[] | null>(null);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-slate-800 p-8 rounded-3xl text-center space-y-2">
        <Layers className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
        <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">لا توجد بطاقات حفظ مستخرجة</h4>
      </div>
    );
  }

  const cardsList = shuffledCards || flashcards;
  const totalCards = cardsList.length;
  const currentCard = cardsList[flashcardIndex] || cardsList[0];
  const progressPercent = Math.min(100, Math.round(((flashcardIndex + 1) / totalCards) * 100));

  const handleNextCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (flashcardIndex < totalCards - 1) {
      setIsFlashcardFlipped(false);
      setFlashcardIndex((prev) => prev + 1);
    } else {
      setFlashcardIndex(0);
      setIsFlashcardFlipped(false);
    }
  };

  const handlePrevCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (flashcardIndex > 0) {
      setIsFlashcardFlipped(false);
      setFlashcardIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setFlashcardIndex(0);
    setIsFlashcardFlipped(false);
  };

  const handleResetDeck = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShuffledCards(null);
    setFlashcardIndex(0);
    setIsFlashcardFlipped(false);
  };

  return (
    <div className="space-y-6 relative z-10">
      {/* Plan Lock Overlay */}
      {isBasicPlan && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/90 rounded-[2.5rem] p-4 sm:p-8 text-center border border-purple-200 dark:border-purple-500/20 shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-purple-200 dark:border-purple-500/30">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-l dark:from-purple-200 dark:to-indigo-400 mb-4">
            طوّر حفظك بالبطاقات التفاعلية!
          </h3>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium">
            ميزة <strong>البطاقات التفاعلية (Flashcards)</strong> بنظام الاسترجاع المتباعد متاحة لجميع مشتركي باقات لمّاح المدفوعة. <br />
            <span className="text-slate-500 dark:text-slate-400 text-sm mt-2 block">
              اشترك الآن لتضاعف سرعة حفظك واستيعابك للمصطلحات!
            </span>
          </p>
          <button
            onClick={() => router.push("/plans")}
            className="bg-gradient-to-l from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl shadow-md shadow-purple-500/20 transition-all flex items-center text-base sm:text-lg transform hover:-translate-y-1 cursor-pointer"
          >
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 ml-2" /> ترقية الباقة الآن لفك القفل
          </button>
        </div>
      )}

      <div className={isBasicPlan ? "opacity-20 pointer-events-none select-none transition-all" : ""}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 rounded-3xl shadow-sm mb-6 transition-all">
          {/* Top Bar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                بطاقات الحفظ
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {totalCards}
                </span>
              </h3>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={handleShuffle}
                title="خلط ترتيب البطاقات"
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>خلط</span>
              </button>
              <button
                type="button"
                onClick={handleResetDeck}
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
              className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Flashcard Canvas */}
          <div className="py-2">
            <div
              onClick={() => setIsFlashcardFlipped((prev) => !prev)}
              className="w-full min-h-[220px] sm:min-h-[250px] p-6 sm:p-8 flex flex-col justify-between bg-slate-50/70 hover:bg-slate-50 dark:bg-slate-950/60 dark:hover:bg-slate-950/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer select-none group"
            >
              {!isFlashcardFlipped ? (
                /* FRONT (QUESTION / TERM) */
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 dark:text-slate-500">
                      سؤال #{flashcardIndex + 1}
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:underline">
                      <RotateCcw className="w-3 h-3" />
                      انقر للكشف عن الإجابة
                    </span>
                  </div>

                  <div className="py-6 px-2 text-center">
                    <h4 className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-relaxed" dir="ltr">
                      {currentCard.front}
                    </h4>
                  </div>

                  <div className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    اضغط في أي مكان لقلب البطاقة
                  </div>
                </>
              ) : (
                /* BACK (ANSWER / EXPLANATION) */
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      الإجابة والشرح
                    </span>
                    <span className="font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 group-hover:underline">
                      <RotateCcw className="w-3 h-3" />
                      انقر للعودة للسؤال
                    </span>
                  </div>

                  <div className="py-4 px-2 text-center overflow-y-auto max-h-[170px] custom-scrollbar">
                    <p className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 leading-relaxed" dir="rtl">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="text-center text-[11px] font-medium text-purple-600 dark:text-purple-400">
                    اضغط في أي مكان للعودة
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Stepper Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold">
            <button
              type="button"
              onClick={handlePrevCard}
              disabled={flashcardIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </button>

            <span className="text-slate-400 dark:text-slate-500">
              {flashcardIndex + 1} من {totalCards}
            </span>

            <button
              type="button"
              onClick={handleNextCard}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white transition-all cursor-pointer shadow-sm"
            >
              {flashcardIndex === totalCards - 1 ? "البداية" : "التالي"}
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

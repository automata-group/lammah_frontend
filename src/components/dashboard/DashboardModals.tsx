"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, Loader2, X, FileAudio, FileText } from "lucide-react";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LimitReachedModal({ isOpen, onClose }: LimitReachedModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl text-center"
          >
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-amber-600 dark:text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mb-4">انتهى رصيد المحادثة! 🔒</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm sm:text-base">
              لقد استهلكت جميع الرسائل المتاحة لهذه المحاضرة بناءً على باقتك الحالية. رقِ باقتك الآن للحصول على حدود أعلى والدردشة دون قيود!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose();
                  router.push("/plans");
                }}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                ترقية الباقة الآن
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium rounded-xl transition-all cursor-pointer"
              >
                سأكتفي بالملخص حالياً
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface OnboardingNameModalProps {
  isOpen: boolean;
  onboardNameInput: string;
  setOnboardNameInput: (val: string) => void;
  handleSaveOnboardName: (e: React.FormEvent) => void;
  isOnboardUpdating: boolean;
  onboardError: string;
}

export function OnboardingNameModal({
  isOpen,
  onboardNameInput,
  setOnboardNameInput,
  handleSaveOnboardName,
  isOnboardUpdating,
  onboardError,
}: OnboardingNameModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200 dark:border-indigo-500/30">
              <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 fill-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">أهلاً بك في عائلة لمّاح! 🌟</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              يسعدنا انضمامك إلينا! يرجى تحديد اسمك المعتمد الذي ترغب في أن يطبع على دفاتر ملازمك في المتجر ويظهر لزملائك الطلاب.
            </p>

            <form onSubmit={handleSaveOnboardName} className="space-y-4">
              <div className="space-y-2">
                <input
                  required
                  type="text"
                  placeholder="اكتب اسمك الكامل (مثال: يوسف أحمد)..."
                  value={onboardNameInput}
                  onChange={(e) => setOnboardNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition text-center font-bold"
                />
              </div>

              {onboardError && <p className="text-rose-500 text-xs font-semibold">{onboardError}</p>}

              <button
                type="submit"
                disabled={isOnboardUpdating || !onboardNameInput.trim()}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-l from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
              >
                {isOnboardUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ الاسم وتأكيد الحساب 🚀"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface VirtualDemoModalProps {
  showDemoModal: "audio" | "pdf" | null;
  onClose: () => void;
  onImportDemoAudio: () => void;
  onImportDemoPdf: () => void;
}

export function VirtualDemoModal({
  showDemoModal,
  onClose,
  onImportDemoAudio,
  onImportDemoPdf,
}: VirtualDemoModalProps) {
  return (
    <AnimatePresence>
      {showDemoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center relative overflow-hidden"
            dir="rtl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-950/50 hover:bg-slate-200 dark:hover:bg-slate-950 rounded-full transition-all border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

            {showDemoModal === "audio" && (
              <>
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200 dark:border-indigo-500/30">
                  <FileAudio className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  استيراد محاضرة تجريبية 🎙️
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  أنت حالياً في النسخة التجريبية. لتجربة سرعة ودقة محرك لمّاح، تفضل بتحميل المحاضرة الصوتية المميزة من نظامنا السحابي:
                </p>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-right mb-6">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">اسم الملف التجريبي:</p>
                  <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 mb-3" dir="ltr">
                    محاضرة_تشفير_البلوك_والستريم_سايفر.mp3
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60 pt-3">
                    <span>حجم الملف: 12.4 ميجابايت</span>
                    <span>المدة: 57 دقيقة</span>
                  </div>
                </div>

                <button
                  onClick={onImportDemoAudio}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-l from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
                >
                  استيراد الملف التجريبي وبدء المعالجة 🚀
                </button>
              </>
            )}

            {showDemoModal === "pdf" && (
              <>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-200 dark:border-purple-500/30">
                  <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  استيراد ملف شرائح تجريبي 📁
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                  أنت حالياً في النسخة التجريبية. لتجربة آلية استخراج وتظليل الشرائح وتنسيق الملاحظات، تفضل باستيراد ملف الـ PDF التجريبي:
                </p>

                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl text-right mb-6">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">اسم الملف التجريبي:</p>
                  <p className="text-sm font-black text-purple-700 dark:text-purple-300 mb-3" dir="ltr">
                    سلايدات_تشفير_البلوك_والستريم_سايفر.pdf
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60 pt-3">
                    <span>حجم الملف: 4.1 ميجابايت</span>
                    <span>عدد الصفحات: 58 صفحة</span>
                  </div>
                </div>

                <button
                  onClick={onImportDemoPdf}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-l from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer"
                >
                  استيراد الملف التجريبي وبدء المعالجة 🚀
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

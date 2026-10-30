"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle, BrainCircuit, Loader2, Send, Lock, Crown, ArrowDown } from "lucide-react";
import { ChatMessage } from "@/types/dashboard";
import ChatMessageItem from "@/components/dashboard/ChatMessageItem";

interface SmartChatTabContentProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (val: string) => void;
  isChatLoading: boolean;
  handleChatSubmit: (e: React.FormEvent) => void;
  chatCount: number;
  subscriptionLimit: number;
  isBasicPlan?: boolean;
  isDemoLecture: boolean;
  isDocumentOnly?: boolean;
  isAudioOnly?: boolean;
}

export default function SmartChatTabContent({
  chatMessages,
  chatInput,
  setChatInput,
  isChatLoading,
  handleChatSubmit,
  chatCount,
  subscriptionLimit,
  isBasicPlan = false,
  isDemoLecture,
  isDocumentOnly = false,
  isAudioOnly = false,
}: SmartChatTabContentProps) {
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const latestUserMsgRef = useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = useRef(chatMessages.length);
  const isInitialMountRef = useRef(true);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  // Scroll only inside the internal messages container (never touches window.scrollY)
  const scrollToBottom = useCallback((smooth = true) => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    setIsUserScrolledUp(false);
  }, []);

  // Monitor internal scroll position to detect if student is reading earlier text
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsUserScrolledUp(distanceFromBottom > 100);
  }, []);

  // Initial mount: scroll to bottom of existing conversation without page animation
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      if (chatMessages.length > 0 && messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, [chatMessages]);

  // Handle new messages:
  useEffect(() => {
    const prevCount = prevMessagesCountRef.current;
    prevMessagesCountRef.current = chatMessages.length;

    if (chatMessages.length > prevCount) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg?.role === "user") {
        // When user asks a question, scroll smoothly inside the chat container
        // to position the question at the top so the student can read the upcoming answer directly!
        requestAnimationFrame(() => {
          if (latestUserMsgRef.current && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const element = latestUserMsgRef.current;
            const targetTop = element.offsetTop;
            container.scrollTo({
              top: Math.max(0, targetTop - 16),
              behavior: "smooth",
            });
            setIsUserScrolledUp(false);
          }
        });
      }
      // When assistant message starts (role === "assistant"), we do NOT force-scroll down!
      // This keeps the start/top of Lammah's reply directly in front of the student.
    }
  }, [chatMessages]);

  const isLimitReached = !isDemoLecture && chatCount >= subscriptionLimit;

  return (
    <div className="flex flex-col h-[500px] sm:h-[650px] lg:h-[700px] bg-white dark:bg-[#0b0f19] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl sm:rounded-[2.5rem] shadow-xs overflow-hidden relative z-10 group">
      {/* Lock overlay shown if user exhausted their question limit */}
      {isLimitReached && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/90 p-4 sm:p-8 text-center border border-blue-200 dark:border-blue-500/20">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-200 dark:border-blue-500/30">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-l dark:from-blue-200 dark:to-cyan-400 mb-4">
            انتهى رصيد الأسئلة لهذه المحاضرة!
          </h3>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-6 sm:mb-8 leading-relaxed font-medium">
            لقد استهلكت الأسئلة المتاحة لهذه المحاضرة وفق خطتك الحالية. <br />
            <span className="text-slate-500 dark:text-slate-400 text-sm mt-2 block">
              اشترك في إحدى باقات لمّاح لفتح حتى 100 سؤال لكل محاضرة ومناقشة كل تفصيلة في السلايدات!
            </span>
          </p>
          <Link
            href="/plans"
            prefetch={true}
            className="bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center text-base sm:text-lg transform hover:-translate-y-1 cursor-pointer"
          >
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 ml-2" /> ترقية الباقة الآن لفتح الأسئلة
          </Link>
        </div>
      )}

      <div
        className={`flex flex-col h-full relative z-10 ${
          isLimitReached ? "opacity-20 pointer-events-none select-none transition-all" : ""
        }`}
      >
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden">
          <h3 className="text-lg sm:text-xl font-black flex items-center text-blue-700 dark:text-blue-400 relative z-10">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 ml-2 text-blue-600 dark:text-blue-500" /> {isAudioOnly ? "تحدث مع المحاضرة الصوتية" : isDocumentOnly ? "تحدث مع السلايدات" : "تحدث مع المحاضرة والسلايدات"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pr-0 sm:pr-8 mt-1 font-medium relative z-10">
            يستند الرد لمعالجة سؤالك بدقة واحترافية وفق ما ورد في محتوى {isAudioOnly ? "التسجيل والمحاضرة الصوتية." : isDocumentOnly ? "السلايدات والمستند الدراسي." : "المحاضرة والسلايدات."}
          </p>
        </div>

        {/* Messages Viewport Container with its own relative scope */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar bg-transparent relative overscroll-contain"
            style={{ overflowAnchor: "none" }}
          >
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 opacity-70">
                <BrainCircuit className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 dark:text-slate-600" />
                <p className="text-base sm:text-lg text-center font-bold">
                  {isAudioOnly
                    ? "اطرح سؤالاً يخص جزئية معينة من المحاضرة الصوتية وسيجيبك النظام فوراً!"
                    : isDocumentOnly
                    ? "اطرح سؤالاً يخص جزئية معينة من السلايدات وسيجيبك النظام فوراً!"
                    : "اطرح سؤالاً يخص جزئية معينة من المحاضرة وسيجيبك النظام فوراً!"}
                </p>
              </div>
            )}
            {chatMessages.map((msg, idx) => {
              const isLatestUserMessage =
                msg.role === "user" &&
                (idx === chatMessages.length - 1 ||
                  (idx === chatMessages.length - 2 && chatMessages[chatMessages.length - 1]?.role === "assistant"));

              return (
                <div
                  key={idx}
                  ref={isLatestUserMessage ? latestUserMsgRef : undefined}
                  className="w-full"
                >
                  <ChatMessageItem msg={msg} />
                </div>
              );
            })}
            {isChatLoading && (
              <div className="flex justify-start w-full">
                <div className="max-w-[75%] p-3.5 sm:p-5 rounded-2xl sm:rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-400 rounded-tr-xs flex items-center gap-2 shadow-inner">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">
                    يقرأ الملف...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Scroll to Bottom Button - isolated safely inside the messages viewport */}
          {isUserScrolledUp && (
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-600/95 hover:bg-blue-600 text-white text-xs sm:text-sm font-bold py-2 px-4 rounded-full shadow-xl border border-blue-400/40 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 z-20 cursor-pointer backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
              <span>النزول للأسفل</span>
            </button>
          )}
        </div>

        <div className="p-3.5 sm:p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
          {/* Chat Usage Indicator */}
          {subscriptionLimit > 0 && (
            <div className="flex justify-between items-center mb-3 px-2">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">
                {chatCount >= subscriptionLimit
                  ? "⚠️ انتهى رصيد الأسئلة لهذه المحاضرة"
                  : `متبقي ${Math.max(0, subscriptionLimit - chatCount)} من ${subscriptionLimit} أسئلة في هذه المحاضرة`}
              </span>
              <div className="flex-1 mx-2 sm:mx-4 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    chatCount >= subscriptionLimit
                      ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                      : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  }`}
                  style={{ width: `${Math.min(100, (chatCount / subscriptionLimit) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleChatSubmit} className="flex gap-2 sm:gap-3 relative">
            <input
              type="text"
              maxLength={500}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-xs font-semibold text-xs sm:text-sm md:text-base placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal"
              placeholder={
                isAudioOnly
                  ? "مثال: اشرح الفكرة الرئيسية للمحاضرة"
                  : isDocumentOnly
                  ? "مثال: اشرح النقطة في الشريحة رقم 2"
                  : "مثال: كيف شرح الدكتور الفرق في الشريحة 2؟"
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={subscriptionLimit > 0 && chatCount >= subscriptionLimit}
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim() || (subscriptionLimit > 0 && chatCount >= subscriptionLimit)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 text-white w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-black flex items-center justify-center transition-all shadow-md shadow-blue-500/20 active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 rtl:-scale-x-100" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

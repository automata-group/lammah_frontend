"use client";

import React, { Suspense } from "react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import HighlighterQuestBoard from "@/components/tasks/HighlighterQuestBoard";

export default function TasksPage() {
  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300 selection:bg-yellow-500/20 selection:text-yellow-900 dark:selection:text-yellow-100"
      dir="rtl"
    >
      {/* Ambient Pastel Background Auras */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-400/10 via-pink-400/5 to-transparent blur-3xl rounded-full dark:from-amber-500/10 dark:via-pink-500/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-emerald-400/5 blur-3xl rounded-full pointer-events-none dark:bg-emerald-500/5" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-indigo-500/5 blur-3xl rounded-full pointer-events-none dark:bg-indigo-500/5" />
      </div>

      {/* Top Floating App Header */}
      <AppHeader activePage={"tasks" as any} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center overflow-x-hidden relative w-full z-10 px-4 pt-4 sm:pt-6 pb-16 max-w-5xl mx-auto">
        <HighlighterQuestBoard />
      </div>

      <Footer />
    </main>
  );
}

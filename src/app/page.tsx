import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSimulation from "@/components/landing/HeroSimulation";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors duration-300" dir="rtl">

      {/* Decorative Grids and Light Beams (Static Server Rendered for 0ms Hydration Overhead) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/50 dark:from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-500/5 dark:bg-indigo-600/10 blur-3xl rounded-full" />
        <div className="absolute top-[20%] left-[-5%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-purple-600/10 blur-3xl rounded-full" />
      </div>

      {/* Floating Glassmorphic Header Island */}
      <Header />

      {/* Cinematic Interactive Hero Section Island (CSS GPU Keyframes) */}
      <HeroSection />

      {/* Pure React Server Component (Zero Client JavaScript Shipped) */}
      <FeaturesSection />

      {/* Interactive Free Trial / Simulation Island (Lazy-loaded Demo Modal) */}
      <HeroSimulation />

      {/* Pricing Section Island */}
      <PricingSection />

      {/* Sleek FAQ Accordion Island */}
      <FaqSection />

    </main>
  );
}

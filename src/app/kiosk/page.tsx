"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import KioskHero from "@/components/kiosk/KioskHero";
import TrendingSection from "@/components/kiosk/TrendingSection";
import KioskCategoryFilter from "@/components/kiosk/KioskCategoryFilter";
import ProjectCard from "@/components/kiosk/ProjectCard";
import ProjectDetailModal from "@/components/kiosk/ProjectDetailModal";
import RegisterProjectModal from "@/components/kiosk/RegisterProjectModal";
import { useAuth } from "@/context/AuthContext";
import { KioskProject, KioskCategoryItem } from "@/types/kiosk";
import { 
  fetchKioskCategories, 
  fetchKioskProjects, 
  fetchTrendingProjects, 
  fetchMyKioskProjects 
} from "@/lib/kioskApi";
import { 
  Store, 
  Sparkles, 
  PlusCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal, 
  Loader2,
  RefreshCw
} from "lucide-react";

export default function KioskPage() {
  const { session, user } = useAuth();
  const token = session?.access_token || "";

  // View Mode: 'explore' | 'my_projects'
  const [activeTab, setActiveTab] = useState<"explore" | "my_projects">("explore");

  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending"); // trending, newest, top_rated, most_liked

  // Data States
  const [categories, setCategories] = useState<KioskCategoryItem[]>([]);
  const [projects, setProjects] = useState<KioskProject[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<KioskProject[]>([]);
  const [myProjects, setMyProjects] = useState<KioskProject[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMyProjects, setIsLoadingMyProjects] = useState(false);

  // Modals
  const [selectedProject, setSelectedProject] = useState<KioskProject | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Initial Categories & Trending Fetch
  const loadCategoriesAndTrending = useCallback(async () => {
    try {
      const [cats, trending] = await Promise.all([
        fetchKioskCategories(),
        fetchTrendingProjects(token),
      ]);
      setCategories(cats);
      setTrendingProjects(trending);
    } catch (e) {
      console.error("Error loading categories/trending:", e);
    }
  }, [token]);

  // Projects Fetch
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchKioskProjects({
        category: selectedCategory,
        search: searchQuery,
        sort_by: sortBy,
        token,
      });
      setProjects(res.projects);
      setTotalProjects(res.total);
    } catch (e) {
      console.error("Error loading projects:", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, token]);

  // Load user's own projects
  const loadMyProjects = useCallback(async () => {
    if (!token) return;
    setIsLoadingMyProjects(true);
    try {
      const res = await fetchMyKioskProjects(token);
      setMyProjects(res);
    } catch (e) {
      console.error("Error loading my projects:", e);
    } finally {
      setIsLoadingMyProjects(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategoriesAndTrending();
  }, [loadCategoriesAndTrending]);

  useEffect(() => {
    if (activeTab === "explore") {
      loadProjects();
    } else {
      loadMyProjects();
    }
  }, [activeTab, loadProjects, loadMyProjects]);

  // Project Open Handler
  const handleOpenDetails = (proj: KioskProject) => {
    setSelectedProject(proj);
    setIsDetailModalOpen(true);
  };

  const handleProjectUpdated = (updated: KioskProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setTrendingProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleLikeChanged = (id: string, isLiked: boolean, newCount: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_liked: isLiked, likes_count: newCount } : p
      )
    );
    setTrendingProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, is_liked: isLiked, likes_count: newCount } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors" dir="rtl">
      {/* Platform Header */}
      <AppHeader activePage="kiosk" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        
        {/* Hero Section */}
        <KioskHero
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalProjects={totalProjects}
        />

        {/* View Switcher Tabs (Explore vs My Projects) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("explore")}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "explore"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              جميع المشاريع
            </button>

            {user && (
              <button
                onClick={() => setActiveTab("my_projects")}
                className={`relative px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "my_projects"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                <span>مشاريعي الخاصة</span>
                {myProjects.length > 0 && (
                  <span className="mr-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
                    {myProjects.length}
                  </span>
                )}
              </button>
            )}
          </div>

          <button
            onClick={() => {
              loadCategoriesAndTrending();
              if (activeTab === "explore") loadProjects();
              else loadMyProjects();
            }}
            title="تحديث البيانات"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ── TAB 1: EXPLORE KIOSK ── */}
        {activeTab === "explore" && (
          <>
            {/* TRENDING SECTION - Will automatically return NULL if empty per requirement! */}
            {!searchQuery && selectedCategory === "all" && (
              <TrendingSection
                projects={trendingProjects}
                token={token}
                onOpenDetails={handleOpenDetails}
                onLikeChanged={handleLikeChanged}
              />
            )}

            {/* CATEGORY FILTER BAR */}
            <KioskCategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={categories}
              totalApproved={totalProjects}
            />

            {/* SORTING & RESULTS HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-white/70 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>المشاريع المتاحة:</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-xs font-black">
                  {totalProjects} مشروع
                </span>
                {searchQuery && (
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    (نتائج البحث عن &ldquo;{searchQuery}&rdquo;)
                  </span>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SlidersHorizontal className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium shrink-0">ترتيب حسب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                >
                  <option value="trending">الأكثر تفاعلاً</option>
                  <option value="top_rated">الأعلى تقييماً</option>
                  <option value="most_liked">الأكثر إعجاباً</option>
                  <option value="newest">الأحدث وصولاً</option>
                </select>
              </div>
            </div>

            {/* ── PROJECTS GRID ── */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-4/3 rounded-3xl bg-slate-200/70 dark:bg-slate-800/50 animate-pulse"
                  />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    token={token}
                    onOpenDetails={handleOpenDetails}
                    onLikeChanged={handleLikeChanged}
                  />
                ))}
              </div>
            ) : (
              /* EMPTY STATE */
              <div className="py-16 text-center space-y-4 bg-white/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Store className="w-8 h-8 opacity-80" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  لم يتم العثور على مشاريع في هذا القسم بعد
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  هل لديك مشروع طلابي (أكل، حلويات، تصوير، خدمات)؟ سجّله الآن لتكون أول من يعرض في هذا القسم!
                </p>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>سجّل مشروعك مجاناً</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: MY PROJECTS ── */}
        {activeTab === "my_projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  مشاريعك الطلابية المسجلة
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  تابع حالة مراجعة مشاريعك وإحصائيات الزيارات والإعجابات المباشرة
                </p>
              </div>

              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة مشروع جديد</span>
              </button>
            </div>

            {isLoadingMyProjects ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : myProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProjects.map((p) => {
                  const statusColors = {
                    approved: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
                    pending: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40",
                    rejected: "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",
                    archived: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700",
                  };
                  const statusLabels = {
                    approved: "معتمد ونشط",
                    pending: "قيد المراجعة والتدقيق",
                    rejected: "مرفوض",
                    archived: "مؤرشف",
                  };

                  return (
                    <div
                      key={p.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xl text-xs font-bold border mb-2 ${
                              statusColors[p.status] || ""
                            }`}
                          >
                            {statusLabels[p.status] || p.status}
                          </span>
                          <h3 className="font-black text-base text-slate-900 dark:text-white">
                            {p.title}
                          </h3>
                        </div>

                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-xl">
                          {p.clicks_count} زيارة للمتجر
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {p.description}
                      </p>

                      {/* Rejection reason notice if rejected */}
                      {p.status === "rejected" && p.rejection_reason && (
                        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
                          <span className="font-bold block mb-1">سبب الرفض من الإدارة:</span>
                          <span>{p.rejection_reason}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>تقييم: {p.rating_avg.toFixed(1)} ({p.rating_count})</span>
                        <span>إعجابات: {p.likes_count}</span>
                        <span>تعليقات: {p.comments_count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 bg-white/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6">
                <Store className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  ليس لديك أي مشاريع مسجلة حالياً
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  ابدأ بعرض منتجاتك للطلبة وسجّل أول مشروع الآن في دقائق معدودة!
                </p>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  سجّل مشروعك الآن
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── DETAIL MODAL ── */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        token={token}
        onProjectUpdated={handleProjectUpdated}
      />

      {/* ── REGISTER MODAL ── */}
      <RegisterProjectModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        token={token}
        onSuccess={() => {
          loadCategoriesAndTrending();
          loadProjects();
          loadMyProjects();
        }}
      />

      {/* Platform Footer */}
      <Footer />
    </div>
  );
}

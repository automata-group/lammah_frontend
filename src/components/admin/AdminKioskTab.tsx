"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Store, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Phone, 
  MapPin, 
  Clock, 
  Search, 
  RefreshCw, 
  Loader2, 
  GraduationCap,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter
} from "lucide-react";
import { KioskProject } from "@/types/kiosk";
import { 
  adminFetchKioskProjects, 
  adminUpdateKioskProjectStatus,
  formatWhatsAppUrl
} from "@/lib/kioskApi";
import { formatImageUrl } from "@/components/kiosk/ProjectCard";

interface AdminKioskTabProps {
  token: string;
}

export default function AdminKioskTab({ token }: AdminKioskTabProps) {
  const [projects, setProjects] = useState<KioskProject[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject Modal State
  const [rejectingProject, setRejectingProject] = useState<KioskProject | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Image Preview Modal
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIdx, setPreviewIdx] = useState(0);

  const loadProjects = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await adminFetchKioskProjects(filterStatus, token);
      setProjects(data);
    } catch (err) {
      console.error("Error fetching admin kiosk projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, token]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleApprove = async (project: KioskProject) => {
    if (!confirm(`هل أنت متأكد من اعتماد ونشر مشروع "${project.title}" في كشك المشاريع؟`)) return;
    setProcessingId(project.id);
    try {
      await adminUpdateKioskProjectStatus(project.id, "approved", "", token);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status: "approved" } : p))
      );
      alert("✅ تم اعتماد ونشر المشروع بنجاح!");
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (project: KioskProject) => {
    setRejectingProject(project);
    setRejectionReason(
      project.rejection_reason || "نعتذر، لم يستوفِ المشروع الشروط واللوائح الجامعية أو الصور غير واضحة."
    );
  };

  const handleConfirmReject = async () => {
    if (!rejectingProject) return;
    if (!rejectionReason.trim()) {
      alert("يرجى كتابة سبب الرفض لتوضيحه للطالب");
      return;
    }

    setProcessingId(rejectingProject.id);
    try {
      await adminUpdateKioskProjectStatus(
        rejectingProject.id,
        "rejected",
        rejectionReason.trim(),
        token
      );
      setProjects((prev) =>
        prev.map((p) =>
          p.id === rejectingProject.id
            ? { ...p, status: "rejected", rejection_reason: rejectionReason.trim() }
            : p
        )
      );
      setRejectingProject(null);
      alert("✅ تم رفض المشروع وإرسال السبب للطالب.");
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter projects by search
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.owner_name.toLowerCase().includes(q) ||
      (p.owner_faculty && p.owner_faculty.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const pendingCount = projects.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0b0f19] p-4 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              إدارة كشك المشاريع الطلابية
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black animate-pulse">
                {pendingCount} بانتظار المراجعة
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            مراجعة وتدقيق طلبات المشاريع والصور المرفوعة واعتمادها قبل نشرها للطلاب
          </p>
        </div>

        <button
          onClick={loadProjects}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "جميع الطلبات" },
            { id: "pending", label: "قيد المراجعة ⏳" },
            { id: "approved", label: "المعتمدة ✅" },
            { id: "rejected", label: "المرفوضة ❌" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الطالب، الكلية..."
            className="w-full pr-10 pl-3.5 py-2 rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>
      </div>

      {/* Projects Moderation List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs text-slate-400">جاري تحميل طلبات المشاريع...</span>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const isProcessing = processingId === project.id;
            const images = project.images || [];

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 transition-all"
              >
                {/* Header: Title, Category, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {project.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                        {project.category}
                      </span>
                      {project.price_range && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                          {project.price_range}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                        <strong>{project.owner_name}</strong>
                        {project.owner_faculty && ` • ${project.owner_faculty}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span dir="ltr">{project.whatsapp_number}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>{project.clicks_count} زيارة للمتجر</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(project.created_at).toLocaleDateString("ar-EG")}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {project.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>بانتظار المراجعة</span>
                      </span>
                    )}
                    {project.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>معتمد ونشط</span>
                      </span>
                    )}
                    {project.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>مرفوض</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>

                {/* Campus Delivery Locations */}
                {project.campus_locations && project.campus_locations.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-bold">أماكن التوصيل:</span>
                    <span>{project.campus_locations.join("، ")}</span>
                  </div>
                )}

                {/* ── 5 PHOTOS GALLERY PREVIEW ── */}
                {images.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      معاينة صور المنتجات المرفوعة ({images.length} صور - اضغط للتكبير):
                    </span>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPreviewImages(images);
                            setPreviewIdx(idx);
                          }}
                          className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 hover:scale-105 transition-transform group cursor-pointer shadow-xs"
                        >
                          <img
                            src={formatImageUrl(img)}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-5 h-5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason Notice if Present */}
                {project.status === "rejected" && project.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs">
                    <strong className="block mb-0.5">سبب الرفض:</strong>
                    <span>{project.rejection_reason}</span>
                  </div>
                )}

                {/* ── ACTION BUTTONS ── */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  {/* WhatsApp contact with owner */}
                  <a
                    href={formatWhatsAppUrl(project.whatsapp_number)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>مراسلة الطالب</span>
                  </a>

                  {/* Reject button */}
                  {project.status !== "rejected" && (
                    <button
                      onClick={() => handleOpenReject(project)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>رفض المشروع</span>
                    </button>
                  )}

                  {/* Approve button */}
                  {project.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(project)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm hover:shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>موافقة واعتماد النشر ✅</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0b0f19] rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <Store className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            لا توجد طلبات مشاريع في هذا القسم
          </h4>
          <p className="text-xs text-slate-400">
            جميع الطلبات معالجة أو لا توجد نتائج مطابقة لفلتر البحث المحدد.
          </p>
        </div>
      )}

      {/* ── REJECTION REASON MODAL ── */}
      {rejectingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                رفض مشروع &quot;{rejectingProject.title}&quot;
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يرجى كتابة سبب الرفض ليظهر للطالب في لوحته ويتمكن من تعديله:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: يرجى تصوير المنتجات بجودة أعلى، أو توضيح قائمة الأسعار..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE LIGHTBOX MODAL ── */}
      {previewImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImages([])}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={formatImageUrl(previewImages[previewIdx])}
              alt="معاينة"
              className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {previewImages.length > 1 && (
              <div className="flex items-center gap-3 mt-4 text-white text-xs font-bold">
                <button
                  onClick={() =>
                    setPreviewIdx((p) => (p === 0 ? previewImages.length - 1 : p - 1))
                  }
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/25"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span>
                  {previewIdx + 1} من {previewImages.length}
                </span>
                <button
                  onClick={() =>
                    setPreviewIdx((p) => (p === previewImages.length - 1 ? 0 : p + 1))
                  }
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/25"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

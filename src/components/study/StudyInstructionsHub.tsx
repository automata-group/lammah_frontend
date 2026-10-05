"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  Highlighter, 
  PenTool, 
  EyeOff, 
  Eye, 
  Mic, 
  MicOff, 
  Flame, 
  Bookmark, 
  Timer, 
  Tag, 
  FolderOpen, 
  CheckCircle2, 
  GraduationCap, 
  Layers, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Plus, 
  Trash2, 
  Printer,
  LayoutGrid,
  Check,
  ShieldCheck,
  Presentation,
  Volume2,
  Search,
  Square,
  Baseline,
  Grid,
  StickyNote,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StudyNote } from "@/hooks/useStudyNotes";
import { VaultDocument } from "@/lib/studyVault";

export interface StudyInstructionsHubProps {
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDropFiles?: (files: File[]) => void;
  onOpenVault: () => void;
  vaultDocsCount: number;
  isConvertingPPTX?: boolean;
  vaultDocuments?: Omit<VaultDocument, "blob">[];
  onSelectVaultDoc?: (id: string) => void;
  onDeleteVaultDoc?: (id: string) => void;
  activeDocumentTitle?: string;
  hasActiveDocument?: boolean;
  onResumeStudy?: () => void;
  notes?: StudyNote[];
  onSaveQuickNote?: (text: string, color?: string) => void;
  onDeleteNote?: (id: string) => void;
  onOpenFocusSheet?: () => void;
  onExportNotes?: () => void;
  onCreateBlankNotebook?: (style: "blank" | "ruled" | "grid") => void;
}

// ── FEATURE: Realistic Visual Document & Notebook Cover Preview ──
function DocumentCoverVisual({ doc }: { doc: Omit<VaultDocument, "blob"> }) {
  const nameLower = (doc.name || "").toLowerCase();
  const isPptx = doc.type === "pptx_converted" || nameLower.includes("بوربوينت") || nameLower.endsWith(".pptx") || nameLower.endsWith(".ppt");
  const isNotebook = doc.type === "blank_notebook" || nameLower.includes("دفتر");
  
  const isGrid = isNotebook && (nameLower.includes("رياضيات") || nameLower.includes("بيانية") || nameLower.includes("grid"));
  const isBlank = isNotebook && (nameLower.includes("حر") || nameLower.includes("فارغ") || nameLower.includes("blank"));
  const isRuled = isNotebook && !isGrid && !isBlank;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Retrieve any real student notes from localStorage for page 1
  const [stickyNotes, setStickyNotes] = useState<Array<{ text: string; bgStyle?: string; x?: number; y?: number }>>([]);
  const [hasAnnotations, setHasAnnotations] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Load sticky notes
    try {
      const rawNotes = localStorage.getItem(`lammah_textnotes_${doc.name}_p1`);
      if (rawNotes) {
        const parsed = JSON.parse(rawNotes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStickyNotes(parsed.slice(0, 2));
        }
      }
    } catch {}

    // 2. Render actual drawing strokes onto miniature canvas
    try {
      const rawAnnot = localStorage.getItem(`lammah_annot_${doc.name}_p1`);
      if (rawAnnot) {
        const strokes = JSON.parse(rawAnnot);
        if (Array.isArray(strokes) && strokes.length > 0) {
          setHasAnnotations(true);
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // Scale from standard document canvas to miniature preview
              const scaleX = canvas.width / 800;
              const scaleY = canvas.height / 1100;

              for (const s of strokes) {
                ctx.strokeStyle = s.color || "#1e3a8a";
                ctx.lineWidth = Math.max(1.2, (s.width || 2) * scaleX);
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                if (s.tool === "highlighter") {
                  ctx.globalAlpha = 0.45;
                  ctx.lineWidth = Math.max(4, 18 * scaleX);
                } else {
                  ctx.globalAlpha = 0.95;
                }

                if (s.points && s.points.length >= 2) {
                  ctx.beginPath();
                  ctx.moveTo(s.points[0].x * scaleX, s.points[0].y * scaleY);
                  for (let i = 1; i < s.points.length; i++) {
                    ctx.lineTo(s.points[i].x * scaleX, s.points[i].y * scaleY);
                  }
                  ctx.stroke();
                } else if (s.startPoint && s.endPoint) {
                  ctx.beginPath();
                  ctx.moveTo(s.startPoint.x * scaleX, s.startPoint.y * scaleY);
                  ctx.lineTo(s.endPoint.x * scaleX, s.endPoint.y * scaleY);
                  ctx.stroke();
                }
              }
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }
    } catch {}
  }, [doc.name]);

  const getStickyColorClass = (bg?: string) => {
    switch (bg) {
      case "pink": return "bg-[#fce7f3] border-[#f472b6] text-[#831843]";
      case "green": return "bg-[#dcfce7] border-[#4ade80] text-[#14532d]";
      case "blue": return "bg-[#e0f2fe] border-[#38bdf8] text-[#0c4a6e]";
      case "purple": return "bg-[#f3e8ff] border-[#c084fc] text-[#581c87]";
      case "orange": return "bg-[#ffedd5] border-[#fb923c] text-[#7c2d12]";
      default: return "bg-[#fef9c3] border-[#facc15] text-[#713f12]";
    }
  };

  return (
    <div className="h-44 sm:h-48 w-full relative bg-slate-900/90 dark:bg-[#070b14] p-3 flex items-center justify-center overflow-hidden select-none border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Ambient Desk Radial Lighting so the white page pops */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-transparent to-transparent pointer-events-none" />

      {/* ── REAL PHYSICAL WHITE A4 PAPER SHEET (Always White, Authentic Contrast) ── */}
      <div className="relative w-full h-full max-w-[175px] bg-white rounded-md shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),0_4px_10px_-3px_rgba(0,0,0,0.3)] border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.35)]">
        
        {/* Top Metallic Spiral Wire Binding (for all notebooks) */}
        {isNotebook && (
          <div className="h-3 bg-slate-100 border-b border-slate-300 flex items-center justify-around px-2 z-20 shrink-0">
            {[...Array(9)].map((_, i) => (
              <span 
                key={i} 
                className="w-1.5 h-2 rounded-xs bg-gradient-to-b from-slate-300 via-slate-500 to-slate-400 border border-slate-400 shadow-xs" 
              />
            ))}
          </div>
        )}

        {/* ── 1. RULED NOTEBOOK WHITE PAPER CANVAS ── */}
        {isRuled && (
          <div className="relative flex-1 flex flex-col justify-start overflow-hidden bg-white">
            {/* Header: Date and Subject Line */}
            <div className="flex items-center justify-between text-[7px] text-slate-400 font-bold px-2 pt-1 border-b border-slate-200 shrink-0 z-10">
              <span className="truncate max-w-[85px]">التاريخ: .....</span>
              <span className="truncate max-w-[60px]">ملاحظات 📝</span>
            </div>

            {/* Red / Rose Arabic Margin Line (Right side) */}
            <div className="absolute right-5 top-0 bottom-0 w-[1.5px] bg-red-400/80 z-10" />

            {/* Crisp Blue Horizontal Ruled Lines on Pure White Paper */}
            <div className="absolute inset-0 top-4 bg-[linear-gradient(transparent_13px,#cbd5e1_13px,#cbd5e1_14px)] bg-[size:100%_14px] pointer-events-none" />

            {/* If user placed sticky notes, display them right on the white paper */}
            {stickyNotes.length > 0 ? (
              <div className="p-2 space-y-1 z-20 mr-5">
                {stickyNotes.map((note, idx) => (
                  <div 
                    key={idx}
                    className={`max-w-[90%] p-1.5 rounded-md shadow-sm border text-[8px] font-black leading-tight truncate rotate-[-2deg] ${getStickyColorClass(note.bgStyle)}`}
                  >
                    <div className="w-3.5 h-1 bg-amber-400/60 mx-auto -mt-1 mb-0.5 rounded-xs" />
                    {note.text}
                  </div>
                ))}
              </div>
            ) : (
              /* Simulated Academic Handwriting Lines */
              <div className="space-y-2 mt-2 mr-6 z-10 opacity-70 p-1">
                <div className="h-1 bg-indigo-500/80 rounded-full w-3/4" />
                <div className="h-1 bg-slate-400 rounded-full w-4/5" />
                <div className="h-1 bg-slate-400 rounded-full w-2/3" />
                <div className="h-1 bg-slate-300 rounded-full w-1/2" />
              </div>
            )}
          </div>
        )}

        {/* ── 2. MATH / GRAPH GRID NOTEBOOK WHITE PAPER CANVAS ── */}
        {isGrid && (
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-white">
            {/* Header: Math Quad Grid Line */}
            <div className="flex items-center justify-between text-[7px] text-slate-400 font-bold px-2 pt-1 border-b border-slate-200 shrink-0 z-10">
              <span>رسم بياني 📐</span>
              <span>X - Y Grid</span>
            </div>

            {/* Crisp Quad Grid Pattern on Pure White Paper */}
            <div className="absolute inset-0 top-4 bg-[linear-gradient(to_right,#bfdbfe_1px,transparent_1px),linear-gradient(to_bottom,#bfdbfe_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-80" />

            {/* Coordinate System & Math Function Curve */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-2">
              <svg className="w-24 h-16 text-indigo-600 drop-shadow-xs" viewBox="0 0 100 60" fill="none">
                <line x1="8" y1="30" x2="92" y2="30" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2 2" />
                <line x1="50" y1="6" x2="50" y2="54" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2 2" />
                <path d="M 12 45 Q 32 10 50 30 T 88 15" stroke="#4f46e5" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {stickyNotes.length > 0 && (
              <div className="absolute bottom-1.5 right-1.5 max-w-[85%] z-20">
                <div className={`p-1 rounded-md shadow-sm border text-[8px] font-black leading-tight truncate rotate-[1deg] ${getStickyColorClass(stickyNotes[0].bgStyle)}`}>
                  {stickyNotes[0].text}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 3. BLANK CANVAS WHITE PAPER ── */}
        {isBlank && (
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-white p-2.5">
            {/* Top-Right Realistic Dog-Ear Page Fold */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-slate-100 border-b border-l border-slate-300 shadow-xs z-10" />

            {/* Center Artist Draft Motif */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-1 opacity-70">
              <div className="w-8 h-8 rounded-full border border-dashed border-indigo-400 flex items-center justify-center text-indigo-600 bg-indigo-50/50">
                <PenTool className="w-4 h-4" />
              </div>
              <span className="text-[8px] font-black text-slate-500">صفحة رسم بيضاء حرة</span>
            </div>

            {stickyNotes.length > 0 && (
              <div className="relative z-20">
                <div className={`p-1 rounded-md shadow-sm border text-[8px] font-black leading-tight truncate rotate-[-1deg] ${getStickyColorClass(stickyNotes[0].bgStyle)}`}>
                  {stickyNotes[0].text}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4. LECTURE PDF WHITE DOCUMENT SHEET ── */}
        {!isNotebook && !isPptx && (
          <div className="relative flex-1 flex flex-col overflow-hidden bg-white">
            {/* Document Header Bar */}
            <div className="h-5 bg-indigo-600 text-white px-2 flex items-center justify-between z-10 shrink-0">
              <span className="text-[8px] font-black truncate max-w-[90px]">
                {doc.name.replace(".pdf", "")}
              </span>
              <span className="text-[7px] font-bold bg-white/20 px-1 rounded-xs">PDF</span>
            </div>

            {/* Realistic Document Paragraphs Wireframe with Yellow Highlighter */}
            <div className="p-2.5 flex-1 flex flex-col justify-between z-10">
              <div className="space-y-1.5">
                <div className="h-1.5 bg-slate-800 rounded-full w-2/3" />
                <div className="h-1 bg-slate-400 rounded-full w-full" />
                <div className="h-1 bg-slate-400 rounded-full w-5/6" />
                {/* Yellow Highlighter Mark on text */}
                <div className="h-2.5 bg-yellow-200 border-b border-yellow-400/50 rounded-xs px-1 flex items-center">
                  <div className="h-1 bg-slate-900 rounded-full w-4/5" />
                </div>
                <div className="h-1 bg-slate-300 rounded-full w-3/4" />
              </div>

              {/* Bottom footer pagination */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[7px] text-slate-500 font-bold">
                <span>المستند الأصلي</span>
                <span>ص 1</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. POWERPOINT SLIDE WHITE SHEET ── */}
        {isPptx && (
          <div className="relative flex-1 flex flex-col overflow-hidden bg-white">
            {/* Top Slide Accent Line */}
            <div className="h-1.5 bg-amber-500 w-full" />
            <div className="p-2.5 flex-1 flex flex-col justify-between z-10">
              {/* Slide Title */}
              <div className="flex items-center gap-1 mb-1">
                <Presentation className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="h-1.5 bg-slate-900 rounded-full w-3/4" />
              </div>
              {/* Slide Bullets */}
              <div className="space-y-1.5 my-auto">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="h-1 bg-slate-600 rounded-full w-4/5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="h-1 bg-slate-600 rounded-full w-3/5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <div className="h-1 bg-slate-400 rounded-full w-2/3" />
                </div>
              </div>
              <div className="flex justify-end text-[7px] font-black text-amber-700">
                عرض شرائح
              </div>
            </div>
          </div>
        )}

        {/* ── Canvas Layer for Actual User Drawing Strokes ── */}
        <canvas 
          ref={canvasRef} 
          width={180} 
          height={240} 
          className="absolute inset-0 w-full h-full pointer-events-none z-15" 
        />

      </div>

      {/* Top Floating Badges (Outside sheet on desk) */}
      <div className="absolute top-2 right-2.5 left-2.5 flex items-center justify-between z-25 pointer-events-none">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shadow-md backdrop-blur-md ${
          isRuled
            ? "bg-indigo-600 text-white"
            : isGrid
            ? "bg-purple-600 text-white"
            : isBlank
            ? "bg-slate-800 text-white"
            : isPptx
            ? "bg-amber-600 text-white"
            : "bg-blue-600 text-white"
        }`}>
          {isRuled ? "دفتر مسطر 📝" : isGrid ? "رسم بياني 📐" : isBlank ? "دفتر حر 🎨" : isPptx ? "بوربوينت 📊" : "مستند PDF 📄"}
        </span>

        {doc.totalPages && (
          <span className="text-[9px] font-black bg-slate-950/80 text-white backdrop-blur-md px-1.5 py-0.5 rounded-md shadow-md border border-white/10">
            {doc.totalPages} ص
          </span>
        )}
      </div>

      {/* Hover "فتح بالمحرر" overlay */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-30 pointer-events-none">
        <span className="py-1 px-3 rounded-xl bg-white text-indigo-950 text-xs font-black shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition">
          <Play className="w-3 h-3 fill-current text-indigo-600" />
          <span>فتح بالمحرر</span>
        </span>
      </div>
    </div>
  );
}

export default function StudyInstructionsHub({
  onUploadFile,
  onDropFiles,
  onOpenVault,
  vaultDocsCount,
  isConvertingPPTX = false,
  vaultDocuments = [],
  onSelectVaultDoc,
  onDeleteVaultDoc,
  activeDocumentTitle,
  hasActiveDocument = false,
  onResumeStudy,
  notes = [],
  onSaveQuickNote,
  onDeleteNote,
  onOpenFocusSheet,
  onExportNotes,
  onCreateBlankNotebook,
}: StudyInstructionsHubProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHeroDragOver, setIsHeroDragOver] = useState(false);
  
  // Search & filter state (strictly for uploaded files)
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "pdf" | "pptx">("all");

  const handleTriggerUpload = (filter?: string) => {
    if (fileInputRef.current) {
      if (filter) {
        fileInputRef.current.accept = filter;
      } else {
        fileInputRef.current.accept = ".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation";
      }
      fileInputRef.current.click();
    }
  };

  // Filter vault documents based on search query and category (only uploaded files)
  const filteredDocuments = useMemo(() => {
    return vaultDocuments.filter((doc) => {
      // Exclude blank notebooks / templates from other sections
      if (doc.type === "blank_notebook") return false;

      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === "all") return true;
      if (activeFilter === "pdf") return doc.type === "pdf" || (!doc.name.includes("بوربوينت") && !doc.name.endsWith(".pptx"));
      if (activeFilter === "pptx") return doc.type === "pptx_converted" || doc.name.includes("بوربوينت") || doc.name.endsWith(".pptx");
      return true;
    });
  }, [vaultDocuments, searchQuery, activeFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto py-3 sm:py-6 px-3 sm:px-6 flex flex-col gap-8 sm:gap-10 select-none text-right font-sans" dir="rtl">
      
      {/* Hidden File Input for instant uploads */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
        multiple
        onChange={onUploadFile} 
        className="hidden" 
        disabled={isConvertingPPTX}
      />

      {/* ── 1. HERO BANNER: "ماذا تريد أن تدرس أو تدوّن اليوم؟" ── */}
      <div 
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
          setIsHeroDragOver(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsHeroDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.currentTarget === e.target) {
            setIsHeroDragOver(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsHeroDragOver(false);
          const droppedFiles = Array.from(e.dataTransfer?.files || []);
          if (droppedFiles.length > 0) {
            if (onDropFiles) {
              onDropFiles(droppedFiles);
            } else if (fileInputRef.current) {
              const dt = new DataTransfer();
              droppedFiles.forEach((f) => dt.items.add(f));
              fileInputRef.current.files = dt.files;
              const changeEvent = new Event("change", { bubbles: true });
              fileInputRef.current.dispatchEvent(changeEvent);
            }
          }
        }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-7 shadow-xl transition-all duration-200 border ${
          isHeroDragOver 
            ? "border-indigo-400 ring-4 ring-indigo-500/30 scale-[0.99]" 
            : "border-indigo-500/20"
        }`}
      >
        {/* Dragging over Hero Banner Active Overlay */}
        {isHeroDragOver && (
          <div className="absolute inset-0 z-30 bg-indigo-950/95 backdrop-blur-md rounded-3xl border-3 border-dashed border-indigo-400 flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-white flex items-center justify-center mb-2.5 animate-bounce">
              <Upload className="w-7 h-7 text-indigo-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mb-1">
              أفلت ملفك هنا للفتح المباشر 📂
            </h3>
            <p className="text-xs text-indigo-200 max-w-md leading-relaxed">
              يدعم ملفات PDF، عروض البوربوينت (.pptx)، والصور — بالذاكرة المؤقتة وبسرعة فائقة!
            </p>
          </div>
        )}
        
        {/* Ambient Glowing Aura */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-3.5 py-1">
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            ماذا تريد أن تدرس اليوم؟ 📚
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100/80 font-medium max-w-md leading-relaxed">
            ارفع سلايداتك ومستنداتك الدراسية للبدء بالمذاكرة فوراً.
          </p>

          {/* Single Action: Upload Study Material */}
          <div className="pt-1.5">
            <button
              type="button"
              onClick={() => handleTriggerUpload()}
              className="group px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 backdrop-blur-md border border-indigo-400/40 flex items-center gap-3 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30 cursor-pointer text-white shadow-lg shadow-indigo-900/50"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm font-black block">
                  رفع مادة دراسية
                </span>
                <span className="text-[10px] text-indigo-200 block">
                  PDF أو بوربوينت
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* ── 2. RECENT UPLOADED STUDY FILES ── */}
      <div className="space-y-6">
        
        {/* Section Header with Category Tabs and Compact Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-normal">
                آخر الملفات المرفوعة للمذاكرة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {filteredDocuments.length === 0
                  ? "لم يتم رفع أي ملف بعد — يمكنك الرفع مباشرة من الزر بالأعلى"
                  : `${filteredDocuments.length} ملف تم رفعه للمذاكرة وتدوين الملاحظات`}
              </p>
            </div>
          </div>

          {/* Controls: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input for Documents */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في ملفاتك المرفوعة..."
                className="w-full sm:w-48 py-2 pr-8 pl-7 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeFilter === "all"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("pdf")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeFilter === "pdf"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                ملفات PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("pptx")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  activeFilter === "pptx"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                عروض بوربوينت
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid (Strictly Uploaded Documents) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {filteredDocuments.map((doc) => {
            return (
              <div
                key={doc.id}
                className="group relative rounded-3xl bg-white dark:bg-[#0c111d] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col overflow-hidden shadow-xs hover:shadow-lg min-h-[250px]"
              >
                {/* Visual Realistic Cover Preview */}
                <div 
                  onClick={() => onSelectVaultDoc && onSelectVaultDoc(doc.id)}
                  className="cursor-pointer"
                >
                  <DocumentCoverVisual doc={doc} />
                </div>

                {/* Card Meta & Bottom Details */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-2 bg-white dark:bg-[#0c111d]">
                  <div 
                    onClick={() => onSelectVaultDoc && onSelectVaultDoc(doc.id)}
                    className="cursor-pointer"
                  >
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" title={doc.name}>
                      {doc.name.replace(".pdf", "")}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-bold">
                    <span>
                      {new Date(doc.lastOpenedAt || doc.createdAt || Date.now()).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}
                    </span>
                    {onDeleteVaultDoc && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("هل تريد حذف هذا الملف؟")) {
                            onDeleteVaultDoc(doc.id);
                          }
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State Card if no documents exist */}
          {filteredDocuments.length === 0 && (
            <div className="col-span-full py-12 px-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-black text-sm text-slate-800 dark:text-slate-200">
                لا توجد ملفات مرفوعة حالياً
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                ارفع كتابك أو ملخصك الدراسي (PDF أو بوربوينت) للبدء في تصفحه وتدوين الملاحظات عليه.
              </p>
              <button
                type="button"
                onClick={() => handleTriggerUpload()}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 mt-1 shadow-md shadow-indigo-600/20"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع ملف الآن</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. أدوات المذاكرة المدمجة في المحرر (عرض أفقي متجاوب للجوالات) ── */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                أدوات المذاكرة المتاحة في المحرر
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                ميزات ذكية مدمجة في الشريط العلوي لمساعدتك أثناء قراءة المستند
              </p>
            </div>
          </div>
        </div>

        {/* 6 Clean Cards - Horizontal scroll on mobile */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 snap-x snap-mandatory scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          
          {/* Tool 1: Active Recall */}
          <div className="shrink-0 w-[260px] sm:w-auto snap-center p-3 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                شريط الإخفاء (Active Recall)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                تغطية الإجابات والمفاهيم لاختبار الحفظ واسترجاع المعلومة.
              </p>
            </div>
          </div>

          {/* Tool 2: Priority Pins */}
          <div className="shrink-0 w-[260px] sm:w-auto snap-center p-3 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                دبابيس أولويات الفاينل
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                تحديد الشرائح الأهم لتصفية صفحات الحشو ليلة الامتحان.
              </p>
            </div>
          </div>

          {/* Tool 3: Pomodoro */}
          <div className="shrink-0 w-[260px] sm:w-auto snap-center p-3 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Timer className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                مؤقت بومودورو للتركيز
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                تقسيم وقت المذاكرة لجلسات مقننة (25 دقيقة) لمنع التشتت.
              </p>
            </div>
          </div>

          {/* Tool 4: Voice Notes */}
          <div className="shrink-0 w-[260px] sm:w-auto snap-center p-3 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                الملاحظات الصوتية الذكية
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                تسجيل وتفريغ الشروحات الشفهية فورياً وتحويلها لملصقات.
              </p>
            </div>
          </div>

          {/* Tool 5: AI Assistant */}
          <div className="shrink-0 w-[260px] sm:w-auto snap-center p-3 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                مساعد لمّاح الأكاديمي
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                شرح وتبسيط أي فقرة أو رسم بياني وإضافتها لملاحظاتك.
              </p>
            </div>
          </div>

          {/* Tool 6: Printable A4 */}
          <div className="shrink-0 w-[260px] sm:w-auto snap-center p-3 rounded-2xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                ملخص A4 مكثف للطباعة
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                استخراج وتلخيص النقاط الهامة والدبابيس في ورقة مراجعة شاملة.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

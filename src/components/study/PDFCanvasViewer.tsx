"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Loader2, 
  PenTool, 
  Grid,
  MoreHorizontal,
  Highlighter,
  Eraser,
  Undo2,
  Trash2,
  Hand,
  Check,
  Square,
  Minus,
  Spline,
  Circle,
  ArrowUpRight,
  EyeOff,
  Sparkles,
  Timer,
  Play,
  Pause,
  RotateCcw,
  FileDown,
  CheckCircle2,
  BookOpen,
  Type,
  Mic,
  MicOff,
  GripVertical,
  X,
  Palette,
  Plus,
  Minimize2,
  Maximize2,
  MoveDiagonal2,
  Move,
  Pin,
  Bookmark,
  Tag,
  Flame,
  AlertTriangle,
  Printer,
  FileText,
  Layers,
  AlignRight,
  AlignCenter,
  AlignLeft,
  CaseSensitive,
  Bold,
  Baseline,
  StickyNote,
  FilePlus2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface PDFCanvasViewerProps {
  pdfSource: string | File | Blob | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  onTotalPagesChange: (total: number) => void;
  pageNotesCountMap?: Record<number, number>;
  onOpenFocusSheet: (page: number) => void;
  documentTitle?: string;
}

interface StrokePoint {
  x: number;
  y: number;
}

export type AnnotationShape = "freehand" | "rect" | "circle" | "line" | "arrow";
export type AnnotationTool = "browse" | "highlighter" | "pen" | "tape" | "text" | "plain_text" | "eraser";
export type HandwritingFont = 
  | "marhey" 
  | "ruqaa" 
  | "katibeh"
  | "baloo" 
  | "lalezar" 
  | "kufi" 
  | "messiri" 
  | "amiri" 
  | "caveat" 
  | "standard";
export type TextCardBg = "transparent" | "yellow" | "green" | "pink" | "blue" | "purple" | "orange" | "white" | "ivory" | "dark";
export type SpeechLang = "ar-SA" | "en-US";
export type StickerShape = 
  | "rectangle" 
  | "square" 
  | "heart" 
  | "bow" 
  | "circle" 
  | "triangle" 
  | "star" 
  | "washi-tape" 
  | "pin-board" 
  | "paper-clip" 
  | "lined-memo" 
  | "folded-paper" 
  | "frosted-glass" 
  | "transparent";

export interface TypographyFont {
  id: string;
  name: string;
  category: "arabic" | "english";
  fontFamily: string;
  sample: string;
  tag?: string;
}

export const TYPOGRAPHY_FONTS: TypographyFont[] = [
  // ── خطوط عربية شديدة التنوع والتباين (Canva & Word Pro Styles) ──
  { id: "lalezar", name: "خط لاليزار (Lalezar)", category: "arabic", fontFamily: "'Lalezar', cursive, sans-serif", sample: "عناوين وبوسترات ضخمة تلفت الأنظار 🎯", tag: "بوسترات ضخمة" },
  { id: "baloo", name: "خط بالو (Baloo)", category: "arabic", fontFamily: "'Baloo Bhaijaan 2', cursive, sans-serif", sample: "خط دائري مرح ناعم ومريح للعين 🌸", tag: "دائري كرتوني" },
  { id: "marhey", name: "خط مرحي (Marhey)", category: "arabic", fontFamily: "'Marhey', cursive, sans-serif", sample: "عفوي ومرح كأنه كتابة يد حقيقية ✍️", tag: "كتابة يد" },
  { id: "ruqaa", name: "خط الرقعة (Ruqaa)", category: "arabic", fontFamily: "'Aref Ruqaa', cursive, serif", sample: "خط الرقعة التراثي الأكاديمي الأصيل ✒️", tag: "رقعة أصيل" },
  { id: "katibeh", name: "خط كتيبة (Katibeh)", category: "arabic", fontFamily: "'Katibeh', cursive, serif", sample: "شعر وأدب منساب بنمط فارسي رشيق 🪶", tag: "فارسي شاعري" },
  { id: "kufi", name: "خط الكوفي (Reem Kufi)", category: "arabic", fontFamily: "'Reem Kufi', sans-serif", sample: "كوفي كلاسيكي بهندسة إسلامية صارمة 📐", tag: "كوفي هندسي" },
  { id: "messiri", name: "خط المسيري (El Messiri)", category: "arabic", fontFamily: "'El Messiri', serif", sample: "أدبي شاعري بنهايات فنية راقية ✨", tag: "فني شاعري" },
  { id: "lateef", name: "خط لطيف (Lateef)", category: "arabic", fontFamily: "'Lateef', serif", sample: "نسخ منساب كحكايات ألف ليلة وليلة 📖", tag: "قصصي عتيق" },
  { id: "changa", name: "خط تشانغا (Changa)", category: "arabic", fontFamily: "'Changa', sans-serif", sample: "خط مكعبات هندسي بارز وجريء 🧱", tag: "مكعبات عريضة" },
  { id: "amiri", name: "خط الأميري (Amiri)", category: "arabic", fontFamily: "'Amiri', serif", sample: "النسخ القرآني والأدبي والمخطوطات 📜", tag: "نسخ كلاسيكي" },
  { id: "cairo", name: "خط كايرو (Cairo)", category: "arabic", fontFamily: "'Cairo', sans-serif", sample: "الخط القياسي العصري المتوازن 💻", tag: "عصري قياسي" },
  { id: "alexandria", name: "خط الإسكندرية (Alexandria)", category: "arabic", fontFamily: "'Alexandria', sans-serif", sample: "خط منصة لمّاح الرسمي الرشيق ⚡", tag: "لمّاح الرسمي" },
  { id: "almarai", name: "خط المراعي (Almarai)", category: "arabic", fontFamily: "'Almarai', sans-serif", sample: "طباعي رسمي ومريح جداً للقراءة 📰", tag: "طباعي مريح" },

  // ── خطوط أجنبية وتواقيع يدوية (English & Calligraphy) ──
  { id: "caveat", name: "Caveat (توقيع يدوي)", category: "english", fontFamily: "'Caveat', cursive", sample: "Personal handwritten signature notes 🖋️", tag: "توقيع يدوي" },
  { id: "playfair", name: "Playfair Display", category: "english", fontFamily: "'Playfair Display', serif", sample: "Luxury Royal Editorial Titles 👑", tag: "كلاسيكي ملكي" },
  { id: "poppins", name: "Poppins Modern", category: "english", fontFamily: "'Poppins', sans-serif", sample: "Clean Modern Minimal Tech Sans 🌐", tag: "هندسي نقي" },
  { id: "monospace", name: "Courier Monospace", category: "english", fontFamily: "ui-monospace, monospace", sample: "Code & Terminal Typewriter 101 ⌨️", tag: "كود وبرمجة" },
];

export const AVAILABLE_FONT_SIZES = [
  8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 54, 60, 66, 72, 80, 88, 96, 112, 128, 144
];

export const FONT_WEIGHTS = [
  { id: "300", name: "خفيف (300)" },
  { id: "400", name: "عادي (400)" },
  { id: "600", name: "متوسط (600)" },
  { id: "700", name: "عريض (700)" },
  { id: "900", name: "أسود (900)" },
];

export const LINE_SPACINGS = [
  { id: "1.1", value: 1.1, name: "مضغوط (1.1)" },
  { id: "1.4", value: 1.4, name: "عادي (1.4)" },
  { id: "1.7", value: 1.7, name: "مريح (1.7)" },
  { id: "2.0", value: 2.0, name: "مزدوج (2.0)" },
  { id: "2.4", value: 2.4, name: "واسع (2.4)" },
];

export const TEXT_BG_HIGHLIGHTS = [
  { id: "transparent", color: "transparent", name: "بدون خلفية (نص حر)", dot: "bg-transparent border border-dashed border-slate-400" },
  { id: "#fef08a", color: "#fef08a", name: "أصفر تظليل 🟨", dot: "bg-yellow-200 border border-yellow-400" },
  { id: "#bbf7d0", color: "#bbf7d0", name: "أخضر هادئ 🟩", dot: "bg-green-200 border border-green-400" },
  { id: "#bae6fd", color: "#bae6fd", name: "سماوي ناعم 🟦", dot: "bg-sky-200 border border-sky-400" },
  { id: "#fbcfe8", color: "#fbcfe8", name: "وردي باستيل 🟪", dot: "bg-pink-200 border border-pink-400" },
  { id: "#fed7aa", color: "#fed7aa", name: "برتقالي لطيف 🟧", dot: "bg-orange-200 border border-orange-400" },
  { id: "#ffffff", color: "#ffffff", name: "بطاقة بيضاء ⬜", dot: "bg-white border border-slate-300" },
  { id: "#0f172a", color: "#0f172a", name: "داكن أنيق ⬛", dot: "bg-slate-900 border border-slate-700" },
];

export interface PageTextNote {
  id: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  text: string;
  color: string;
  fontSize: number;
  fontFamily: HandwritingFont | string;
  bgStyle: TextCardBg | string;
  stickerShape?: StickerShape;
  stickerIcon?: string;
  width?: number; // custom pixel width
  height?: number; // custom pixel height
  isFolded?: boolean; // whether the note is folded / minimized to a small sticker badge
  foldedWidth?: number; // custom pixel width for folded badge (ranges from 42px micro-pin to 360px)
  // New Plain Text & Word/Canva Typography fields:
  noteType?: "sticker" | "plain_text";
  fontWeight?: string;
  lineHeight?: number;
  textBgColor?: string;
  textAlign?: "right" | "center" | "left";
}

export const STICKER_SHAPES: { id: StickerShape; name: string; emoji: string }[] = [
  { id: "rectangle", name: "مستطيل دراسي 🔲", emoji: "🔲" },
  { id: "heart", name: "قلب لطيف 💖", emoji: "💖" },
  { id: "bow", name: "فيونكة شريطية 🎀", emoji: "🎀" },
  { id: "square", name: "مربع بوست إت 🟩", emoji: "🟩" },
  { id: "circle", name: "دائرة ميمو ⭕", emoji: "⭕" },
  { id: "triangle", name: "مثلث تنبيهي 🔺", emoji: "🔺" },
  { id: "star", name: "نجمة التميز ⭐", emoji: "⭐" },
  { id: "washi-tape", name: "شريط لاصق واشي 🏷️", emoji: "🏷️" },
  { id: "pin-board", name: "دبوس تثبيت 3D 📌", emoji: "📌" },
  { id: "paper-clip", name: "مشبك أوراق ذهبي 📎", emoji: "📎" },
  { id: "lined-memo", name: "دفتر مدرسي مسطر 📋", emoji: "📋" },
  { id: "folded-paper", name: "ورقة بمثلث مطوي 📄", emoji: "📄" },
  { id: "frosted-glass", name: "بطاقة زجاجية شفافة 🪟", emoji: "🪟" },
  { id: "transparent", name: "نص حر شفاف ✨", emoji: "✨" },
];

export const getShapeDefaultDimensions = (shape: StickerShape = "rectangle"): { width: number; height: number } => {
  switch (shape) {
    case "circle":
      return { width: 230, height: 230 };
    case "square":
      return { width: 225, height: 225 };
    case "triangle":
      return { width: 260, height: 235 };
    case "heart":
      return { width: 260, height: 240 };
    case "star":
      return { width: 260, height: 250 };
    case "bow":
      return { width: 270, height: 215 };
    case "lined-memo":
      return { width: 280, height: 200 };
    case "rectangle":
      return { width: 300, height: 165 };
    case "washi-tape":
      return { width: 280, height: 165 };
    case "pin-board":
      return { width: 265, height: 175 };
    case "paper-clip":
      return { width: 270, height: 170 };
    case "folded-paper":
      return { width: 270, height: 170 };
    case "frosted-glass":
      return { width: 280, height: 170 };
    case "transparent":
      return { width: 250, height: 130 };
    default:
      return { width: 280, height: 165 };
  }
};

export const STICKER_ICONS = ["📌", "📝", "💡", "🎙️", "⭐", "❓", "🎯", "🔖", "🔥", "🧠", "📐", "✅", "🧪", "⏳"];

// Feature 7: Page Priority Pin Interface
export interface PagePin {
  id: string;
  pageNumber: number;
  title: string;
  color: string;
  icon: string;
  createdAt: number;
}

// Preset Quick Pin Templates (with custom write-in support)
export const PIN_PRESETS = [
  { title: "سؤال فاينل مؤكد 🔥", color: "#ef4444", icon: "🔥" },
  { title: "نقطة صعبة تحتاج مراجعة ⚠️", color: "#f97316", icon: "⚠️" },
  { title: "ركّز عليها الدكتور ⭐", color: "#eab308", icon: "⭐" },
  { title: "قانون ومعادلة حفظ 📐", color: "#8b5cf6", icon: "📐" },
  { title: "فكرة امتحان ذكية 💡", color: "#3b82f6", icon: "💡" },
  { title: "شريحة متقنة ومحفوظة ✅", color: "#10b981", icon: "✅" },
];

export const PIN_PALETTE_COLORS = [
  { name: "أحمر ناري", value: "#ef4444" },
  { name: "برتقالي تنبيهي", value: "#f97316" },
  { name: "أصفر ذهبي", value: "#eab308" },
  { name: "زمردي متقن", value: "#10b981" },
  { name: "أزرق ذكي", value: "#3b82f6" },
  { name: "بنفسجي أكاديمي", value: "#8b5cf6" },
];

// Feature 9: Academic Sticker Badges
export interface AcademicStickerPreset {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bgStyle: TextCardBg;
  stickerShape: StickerShape;
  textColor: string;
  badgeTag: string;
}

export const ACADEMIC_STICKER_PRESETS: AcademicStickerPreset[] = [
  {
    id: "past_exam_repeat",
    title: "سؤال سنوات مكرر 🔥",
    subtitle: "ورد في الفاينل والدور الأول سابقاً",
    icon: "🔥",
    bgStyle: "orange",
    stickerShape: "washi-tape",
    textColor: "#9a3412",
    badgeTag: "مهم للفاينل",
  },
  {
    id: "doctor_said_omitted",
    title: "ملغي / الدكتور قال مش داخل ⚠️",
    subtitle: "لا تضيع وقتك في قراءته للامتحان",
    icon: "⚠️",
    bgStyle: "yellow",
    stickerShape: "folded-paper",
    textColor: "#854d0e",
    badgeTag: "ملغي رسمي",
  },
  {
    id: "key_formula",
    title: "قانون حفظ إجباري 📐",
    subtitle: "معادلة أساسية لحل مسائل الامتحان",
    icon: "📐",
    bgStyle: "purple",
    stickerShape: "pin-board",
    textColor: "#581c87",
    badgeTag: "قانون امتحان",
  },
  {
    id: "doctor_focus_star",
    title: "ركّز هنا! ركز عليه الدكتور ⭐",
    subtitle: "شرحه الدكتور وركز على جزئياته",
    icon: "⭐",
    bgStyle: "yellow",
    stickerShape: "star",
    textColor: "#713f12",
    badgeTag: "نقطة دكتور",
  },
  {
    id: "exam_trap_alert",
    title: "احذر: فخ امتحاني خادع 💡",
    subtitle: "انتبه لكلمات النفي والاستثناءات",
    icon: "💡",
    bgStyle: "pink",
    stickerShape: "triangle",
    textColor: "#831843",
    badgeTag: "تنبيه ذكي",
  },
  {
    id: "mastered_stamp",
    title: "تم الحفظ والإتقان 100% ✅",
    subtitle: "جاهز للاختبار في هذه الصفحة",
    icon: "✅",
    bgStyle: "green",
    stickerShape: "circle",
    textColor: "#14532d",
    badgeTag: "متقن تماماً",
  },
  {
    id: "practical_example",
    title: "مثال تطبيقي ومسألة 🧪",
    subtitle: "تدريب عملي ومسألة محلولة",
    icon: "🧪",
    bgStyle: "blue",
    stickerShape: "lined-memo",
    textColor: "#0c4a6e",
    badgeTag: "تطبيق عملي",
  },
  {
    id: "memorize_verbatim",
    title: "احفظ التعريف حرفياً ⏳",
    subtitle: "مطلوب نصاً في أسئلة المقالي",
    icon: "⏳",
    bgStyle: "ivory",
    stickerShape: "paper-clip",
    textColor: "#451a03",
    badgeTag: "حفظ نصي",
  },
];

// Feature 8: Geometric Shape Snapping Algorithms
function pointToLineDistance(pt: StrokePoint, lineA: StrokePoint, lineB: StrokePoint): number {
  const dx = lineB.x - lineA.x;
  const dy = lineB.y - lineA.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(pt.x - lineA.x, pt.y - lineA.y);
  const t = Math.max(0, Math.min(1, ((pt.x - lineA.x) * dx + (pt.y - lineA.y) * dy) / lenSq));
  const projX = lineA.x + t * dx;
  const projY = lineA.y + t * dy;
  return Math.hypot(pt.x - projX, pt.y - projY);
}

function detectGeometricShape(points: StrokePoint[]): {
  shape: AnnotationShape;
  startPoint: StrokePoint;
  endPoint: StrokePoint;
} | null {
  if (!points || points.length < 6) return null;

  const start = points[0];
  const end = points[points.length - 1];
  const dStartEnd = Math.hypot(end.x - start.x, end.y - start.y);

  let pathLen = 0;
  let minX = points[0].x, maxX = points[0].x;
  let minY = points[0].y, maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    pathLen += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    minX = Math.min(minX, points[i].x);
    maxX = Math.max(maxX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxY = Math.max(maxY, points[i].y);
  }

  if (pathLen < 25) return null;

  const boxW = maxX - minX;
  const boxH = maxY - minY;

  // 1. Straight Line Detection:
  if (dStartEnd >= 0.88 * pathLen && dStartEnd > 30) {
    let maxDev = 0;
    for (const p of points) {
      const dev = pointToLineDistance(p, start, end);
      if (dev > maxDev) maxDev = dev;
    }
    if (maxDev < 15) {
      return {
        shape: "line",
        startPoint: { x: Math.round(start.x), y: Math.round(start.y) },
        endPoint: { x: Math.round(end.x), y: Math.round(end.y) },
      };
    }
  }

  // 2. Closed Loop Detection (Circle vs Rectangle):
  if (dStartEnd < 0.28 * pathLen && boxW > 25 && boxH > 25) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = boxW / 2;
    const ry = boxH / 2;

    let radiusDiffSum = 0;
    for (const p of points) {
      const normX = (p.x - cx) / rx;
      const normY = (p.y - cy) / ry;
      const r = Math.hypot(normX, normY);
      radiusDiffSum += Math.abs(r - 1);
    }
    const avgRadiusDiff = radiusDiffSum / points.length;

    if (avgRadiusDiff < 0.32) {
      return {
        shape: "circle",
        startPoint: { x: Math.round(minX), y: Math.round(minY) },
        endPoint: { x: Math.round(maxX), y: Math.round(maxY) },
      };
    }

    if (boxW > 30 && boxH > 30) {
      return {
        shape: "rect",
        startPoint: { x: Math.round(minX), y: Math.round(minY) },
        endPoint: { x: Math.round(maxX), y: Math.round(maxY) },
      };
    }
  }

  return null;
}

interface AnnotationStroke {
  id: string;
  tool: "pen" | "highlighter" | "tape";
  shape: AnnotationShape;
  color: string;
  width: number;
  points: StrokePoint[];
  startPoint?: StrokePoint;
  endPoint?: StrokePoint;
  revealed?: boolean;
}

// Academic highlighter palette options
const HIGHLIGHTER_COLORS = [
  { name: "أصفر فوسفوري (أفكار رئيسية)", value: "#fef08a", border: "#eab308" },
  { name: "أخضر (مفاهيم وتعريفات)", value: "#bbf7d0", border: "#22c55e" },
  { name: "أزرق سماوي (أمثلة)", value: "#bfdbfe", border: "#3b82f6" },
  { name: "وردي (سؤال امتحان)", value: "#fbcfe8", border: "#ec4899" },
  { name: "برتقالي (تنبيه مهم)", value: "#fed7aa", border: "#f97316" },
];

// Pen palette options
const PEN_COLORS = [
  { name: "أحمر", value: "#ef4444" },
  { name: "أزرق كحلي", value: "#2563eb" },
  { name: "أسود", value: "#0f172a" },
  { name: "بنفسجي", value: "#7c3aed" },
];

// Active Recall Tape colors
const TAPE_COLORS = [
  { name: "شريط بنفسجي اختباري", value: "#6366f1" },
  { name: "شريط وردي اختباري", value: "#ec4899" },
  { name: "شريط زمردي اختباري", value: "#10b981" },
];

// Handwritten Text Ink Colors
const TEXT_INK_COLORS = [
  { name: "حبر كحلي يدوي", value: "#1e3a8a" },
  { name: "قلم أسود", value: "#0f172a" },
  { name: "أحمر تنبيه", value: "#dc2626" },
  { name: "بنفسجي", value: "#7c3aed" },
  { name: "أخضر زمردي", value: "#059669" },
];

// Sticky Note Background Presets (Curated Academic Study Color Palettes)
export const STICKY_BG_PRESETS: { 
  id: TextCardBg; 
  name: string; 
  purpose: string;
  bgClass: string; 
  borderClass: string; 
  shadowClass: string;
  textColor: string;
  dotColor: string;
  tapeBg: string;
  svgFill: string;
  svgStroke: string;
}[] = [
  { 
    id: "yellow", 
    name: "أصفر التركيز والأفكار الهامة", 
    purpose: "النقاط الأساسية وأسئلة الامتحان 🌟",
    bgClass: "bg-gradient-to-br from-[#FFFDE0] via-[#FEF9C3] to-[#FEF08A] dark:from-[#FEF08A] dark:to-[#FDE047]", 
    borderClass: "border-[#FDE047]/70 dark:border-[#FACC15]/50", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(161,98,7,0.18),0_4px_10px_-2px_rgba(0,0,0,0.06)]",
    textColor: "#382003", 
    dotColor: "#FEF08A",
    tapeBg: "bg-amber-300/85 border-amber-500/40 text-amber-950",
    svgFill: "#FEF08A",
    svgStroke: "#EAB308",
  },
  { 
    id: "pink", 
    name: "وردي الحفظ والتعريفات", 
    purpose: "المصطلحات والمفاهيم الصعبة 🌸",
    bgClass: "bg-gradient-to-br from-[#FFF0F7] via-[#FFE4EE] to-[#FBCFE8] dark:from-[#FBCFE8] dark:to-[#F472B6]", 
    borderClass: "border-[#F472B6]/70 dark:border-[#EC4899]/50", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(190,24,93,0.18),0_4px_10px_-2px_rgba(0,0,0,0.06)]",
    textColor: "#460627", 
    dotColor: "#FBCFE8",
    tapeBg: "bg-pink-300/85 border-pink-500/40 text-pink-950",
    svgFill: "#FBCFE8",
    svgStroke: "#EC4899",
  },
  { 
    id: "green", 
    name: "أخضر الفهم والملخصات", 
    purpose: "ملخصات الدروس واستنتاجات الفهم 🌿",
    bgClass: "bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7] to-[#BBF7D0] dark:from-[#BBF7D0] dark:to-[#86EFAC]", 
    borderClass: "border-[#86EFAC]/70 dark:border-[#4ADE80]/50", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(21,128,61,0.18),0_4px_10px_-2px_rgba(0,0,0,0.06)]",
    textColor: "#033B1C", 
    dotColor: "#BBF7D0",
    tapeBg: "bg-emerald-300/85 border-emerald-500/40 text-emerald-950",
    svgFill: "#BBF7D0",
    svgStroke: "#22C55E",
  },
  { 
    id: "blue", 
    name: "سماوي الأسئلة والأمثلة", 
    purpose: "أمثلة محلولة ومسائل واستفسارات 🌊",
    bgClass: "bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD] dark:from-[#BAE6FD] dark:to-[#7DD3FC]", 
    borderClass: "border-[#7DD3FC]/70 dark:border-[#38BDF8]/50", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(3,105,161,0.18),0_4px_10px_-2px_rgba(0,0,0,0.06)]",
    textColor: "#073152", 
    dotColor: "#BAE6FD",
    tapeBg: "bg-sky-300/85 border-sky-500/40 text-sky-950",
    svgFill: "#BAE6FD",
    svgStroke: "#38BDF8",
  },
  { 
    id: "purple", 
    name: "لافندر القوانين والنظريات", 
    purpose: "المعادلات والقوانين الهامة 🔮",
    bgClass: "bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF] to-[#E9D5FF] dark:from-[#E9D5FF] dark:to-[#C084FC]", 
    borderClass: "border-[#C084FC]/70 dark:border-[#A855F7]/50", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(126,34,206,0.18),0_4px_10px_-2px_rgba(0,0,0,0.06)]",
    textColor: "#3B0766", 
    dotColor: "#E9D5FF",
    tapeBg: "bg-purple-300/85 border-purple-500/40 text-purple-950",
    svgFill: "#E9D5FF",
    svgStroke: "#A855F7",
  },
  { 
    id: "orange", 
    name: "مشمشي فخاخ الامتحانات", 
    purpose: "تنبيهات هامة وتجنب الأخطاء 🍊",
    bgClass: "bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FED7AA] dark:from-[#FED7AA] dark:to-[#FB923C]", 
    borderClass: "border-[#FB923C]/70 dark:border-[#F97316]/50", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(194,65,12,0.18),0_4px_10px_-2px_rgba(0,0,0,0.06)]",
    textColor: "#481603", 
    dotColor: "#FED7AA",
    tapeBg: "bg-amber-400/85 border-amber-600/40 text-amber-950",
    svgFill: "#FED7AA",
    svgStroke: "#F97316",
  },
  { 
    id: "ivory", 
    name: "ورق بيج جامعي كلاسيكي", 
    purpose: "ملاحظات المحاضرات الأكاديمية 📜",
    bgClass: "bg-gradient-to-br from-[#FFFDF5] via-[#FFFBEB] to-[#FEF3C7] dark:from-amber-950/40 dark:to-slate-900", 
    borderClass: "border-amber-200/80 dark:border-amber-800/60", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.05)]",
    textColor: "#291D03", 
    dotColor: "#FEF3C7",
    tapeBg: "bg-amber-200/85 border-amber-400/40 text-amber-950",
    svgFill: "#FEF3C7",
    svgStroke: "#D97706",
  },
  { 
    id: "dark", 
    name: "دارك مود للدراسة الليلية", 
    purpose: "مريح للعين أثناء المذاكرة المتأخرة 🖤",
    bgClass: "bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] text-white", 
    borderClass: "border-slate-700/80 ring-1 ring-white/10", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(0,0,0,0.25),0_4px_10px_-2px_rgba(0,0,0,0.12)]",
    textColor: "#38BDF8", 
    dotColor: "#0F172A",
    tapeBg: "bg-slate-700/85 border-slate-500/40 text-sky-200",
    svgFill: "#0F172A",
    svgStroke: "#38BDF8",
  },
  { 
    id: "white", 
    name: "أبيض ناصع نقي", 
    purpose: "ورق كتابة ناصع وكلاسيكي 📄",
    bgClass: "bg-gradient-to-br from-[#FFFFFF] via-[#FAFAFA] to-[#F1F5F9] dark:from-slate-800 dark:to-slate-900", 
    borderClass: "border-slate-300/80 dark:border-slate-700", 
    shadowClass: "shadow-[0_12px_28px_-6px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.05)]",
    textColor: "#0F172A", 
    dotColor: "#FFFFFF",
    tapeBg: "bg-slate-300/85 border-slate-400/40 text-slate-800",
    svgFill: "#FFFFFF",
    svgStroke: "#CBD5E1",
  },
  { 
    id: "transparent", 
    name: "نص حر بدون خلفية ✨", 
    purpose: "نص صافٍ بدون أي بطاقة أو حدود فوق الصفحة ✨",
    bgClass: "bg-transparent", 
    borderClass: "border-transparent", 
    shadowClass: "shadow-none",
    textColor: "#0F172A", 
    dotColor: "transparent",
    tapeBg: "bg-transparent border-transparent",
    svgFill: "transparent",
    svgStroke: "transparent",
  },
];

export default function PDFCanvasViewer({
  pdfSource,
  currentPage,
  onPageChange,
  totalPages,
  onTotalPagesChange,
  pageNotesCountMap = {},
  onOpenFocusSheet,
  documentTitle = "مستند دراسي"
}: PDFCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRawBytesRef = useRef<ArrayBuffer | null>(null);
  const currentRenderTaskRef = useRef<any>(null);
  const pageBlobCacheRef = useRef<Map<number, string>>(new Map());

  const [masterPdfDoc, setMasterPdfDoc] = useState<PDFDocument | null>(null);
  const [directMasterUrl, setDirectMasterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPdfCanvasReady, setIsPdfCanvasReady] = useState<boolean>(false);
  const [isMobileDockCollapsed, setIsMobileDockCollapsed] = useState<boolean>(false);
  const [isPageSliceLoading, setIsPageSliceLoading] = useState<boolean>(false);
  const [isPageDrawerOpen, setIsPageDrawerOpen] = useState<boolean>(false);
  const [pageDrawerFilter, setPageDrawerFilter] = useState<"all" | "pins">("all");
  const [singlePageUrl, setSinglePageUrl] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<boolean>(false);

  // Pomodoro Study Timer State (Unique Student Feature)
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState<boolean>(false);
  const [isMobileMoreToolsOpen, setIsMobileMoreToolsOpen] = useState<boolean>(false);

  // Annotation Tools State
  const [activeTool, setActiveTool] = useState<AnnotationTool>("browse");
  const isDrawingTool = activeTool === "highlighter" || activeTool === "pen" || activeTool === "tape" || activeTool === "eraser";
  const [activeShape, setActiveShape] = useState<AnnotationShape>("freehand");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>("#fef08a");
  const [selectedPenColor, setSelectedPenColor] = useState<string>("#ef4444");
  const [selectedTapeColor, setSelectedTapeColor] = useState<string>("#6366f1");
  const [activePenWidth, setActivePenWidth] = useState<number>(3);
  const [activeHighlighterWidth, setActiveHighlighterWidth] = useState<number>(16);
  
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<AnnotationStroke | null>(null);
  const [pageStrokes, setPageStrokes] = useState<AnnotationStroke[]>([]);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);

  // Handwritten Text & Speech-to-Text State
  const [pageTextNotes, setPageTextNotes] = useState<PageTextNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeHandwritingFont, setActiveHandwritingFont] = useState<HandwritingFont>("marhey");
  const [activeTextColor, setActiveTextColor] = useState<string>("#1e3a8a");
  const [activeTextBg, setActiveTextBg] = useState<TextCardBg>("yellow");
  const [activeFontSize, setActiveFontSize] = useState<number>(18);
  const [speechLang, setSpeechLang] = useState<SpeechLang>("ar-SA");
  const [recordingNoteId, setRecordingNoteId] = useState<string | null>(null);
  const [speechErrorToast, setSpeechErrorToast] = useState<string | null>(null);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState<boolean>(false);
  const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState<boolean>(false);
  const [activeTypographyFont, setActiveTypographyFont] = useState<string>("cairo");
  const [activeFontWeight, setActiveFontWeight] = useState<string>("600");
  const [activeLineHeight, setActiveLineHeight] = useState<number>(1.4);
  const [activeTextBgColor, setActiveTextBgColor] = useState<string>("transparent");
  const [activeTextAlign, setActiveTextAlign] = useState<"right" | "center" | "left">("right");
  const [isWeightMenuOpen, setIsWeightMenuOpen] = useState<boolean>(false);
  const [isLineHeightMenuOpen, setIsLineHeightMenuOpen] = useState<boolean>(false);
  const [isBgColorMenuOpen, setIsBgColorMenuOpen] = useState<boolean>(false);
  const [isDraggingAnyNote, setIsDraggingAnyNote] = useState<boolean>(false);
  const lastDragEndTimeRef = useRef<number>(0);
  const initialTextRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);

  // Dynamic page dimensions & aspect ratio (eliminates dark letterboxing on slides & documents)
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number; ratio: number } | null>(null);

  // Feature 7: Exam Priority Pins & Exam Night Mode State
  const [documentPins, setDocumentPins] = useState<Record<number, PagePin>>({});
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinModalTab, setPinModalTab] = useState<"current" | "all">("current");
  const [pinCustomTitle, setPinCustomTitle] = useState<string>("");
  const [pinSelectedColor, setPinSelectedColor] = useState<string>("#ef4444");
  const [pinSelectedIcon, setPinSelectedIcon] = useState<string>("🔥");
  const [isExamNightMode, setIsExamNightMode] = useState<boolean>(false);

  // Feature 8: Geometric Shape Snapping
  const [autoSnapShapes, setAutoSnapShapes] = useState<boolean>(true);

  // Feature 9: Academic University Sticker Pack Drawer
  const [isAcademicStickersOpen, setIsAcademicStickersOpen] = useState<boolean>(false);

  // Feature 10: Cheatsheet Summary View
  const [isCheatsheetModalOpen, setIsCheatsheetModalOpen] = useState<boolean>(false);
  const [cheatsheetData, setCheatsheetData] = useState<Array<{ page: number; pin?: PagePin; notes: PageTextNote[] }>>([]);

  // Feature 11: Add Blank Page & Delete Page State
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState<boolean>(false);
  const [addPageType, setAddPageType] = useState<"blank" | "ruled" | "grid" | "dots">("blank");
  const [addPageLocation, setAddPageLocation] = useState<"after_current" | "at_end">("after_current");
  const [isDeletePageModalOpen, setIsDeletePageModalOpen] = useState<boolean>(false);
  const [blankPageAddedToast, setBlankPageAddedToast] = useState<string | null>(null);

  // Smooth pristine white transition curtain on page change
  useEffect(() => {
    setIsIframeLoading(true);
    const timer = setTimeout(() => {
      setIsIframeLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [currentPage, singlePageUrl]);

  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsIframeLoading(false);
    }, 120);
  };

  // Load saved text notes for current page from local storage
  useEffect(() => {
    const storageKey = `lammah_textnotes_${documentTitle}_p${currentPage}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPageTextNotes(JSON.parse(saved));
      } else {
        setPageTextNotes([]);
      }
    } catch {
      setPageTextNotes([]);
    }
  }, [currentPage, documentTitle]);

  // Save text notes whenever they change
  const saveTextNotes = (notes: PageTextNote[]) => {
    setPageTextNotes(notes);
    const storageKey = `lammah_textnotes_${documentTitle}_p${currentPage}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save text notes:", e);
    }
  };

  const updateTextNote = (id: string, updates: Partial<PageTextNote>) => {
    const updated = pageTextNotes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    saveTextNotes(updated);
  };

  const deleteTextNote = (id: string) => {
    if (recordingNoteId === id) {
      handleStopVoiceRecording();
    }
    const updated = pageTextNotes.filter((n) => n.id !== id);
    saveTextNotes(updated);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setIsFontMenuOpen(false);
      setActiveTool("browse");
    }
  };

  // ── Feature 7: Load & Save Pins from LocalStorage ──
  useEffect(() => {
    const storageKey = `lammah_pins_${documentTitle}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setDocumentPins(JSON.parse(saved));
      } else {
        setDocumentPins({});
      }
    } catch {
      setDocumentPins({});
    }
  }, [documentTitle]);

  const savePins = (pins: Record<number, PagePin>) => {
    setDocumentPins(pins);
    const storageKey = `lammah_pins_${documentTitle}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(pins));
    } catch (e) {
      console.error("Failed to save pins:", e);
    }
  };

  // Sync modal inputs when page or pin changes
  useEffect(() => {
    const currentPin = documentPins[currentPage];
    if (currentPin) {
      setPinCustomTitle(currentPin.title);
      setPinSelectedColor(currentPin.color);
      setPinSelectedIcon(currentPin.icon);
    } else {
      setPinCustomTitle("");
      setPinSelectedColor("#ef4444");
      setPinSelectedIcon("🔥");
    }
  }, [currentPage, documentPins]);

  const handleSavePin = (titleOverride?: string, colorOverride?: string, iconOverride?: string) => {
    const title = (titleOverride ?? pinCustomTitle).trim() || "شريحة امتحان هامة";
    const color = colorOverride ?? pinSelectedColor;
    const icon = iconOverride ?? pinSelectedIcon;

    const newPin: PagePin = {
      id: `pin_${Date.now()}_${currentPage}`,
      pageNumber: currentPage,
      title,
      color,
      icon,
      createdAt: Date.now(),
    };

    const updated = { ...documentPins, [currentPage]: newPin };
    savePins(updated);
    setIsPinModalOpen(false);
  };

  const handleRemovePin = () => {
    const updated = { ...documentPins };
    delete updated[currentPage];
    savePins(updated);
    setIsPinModalOpen(false);
  };

  const handleRemovePinForPage = (pageNum: number) => {
    const updated = { ...documentPins };
    delete updated[pageNum];
    savePins(updated);
  };

  // Array of pinned pages sorted ascending
  const pinnedPages = useMemo(() => {
    return Object.keys(documentPins)
      .map(Number)
      .filter((p) => !isNaN(p) && p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [documentPins, totalPages]);

  // Exam Night Mode Navigation
  const handleExamNightNext = () => {
    const nextPages = pinnedPages.filter((p) => p > currentPage);
    if (nextPages.length > 0) {
      onPageChange(nextPages[0]);
    } else if (pinnedPages.length > 0) {
      onPageChange(pinnedPages[0]);
    }
  };

  const handleExamNightPrev = () => {
    const prevPages = pinnedPages.filter((p) => p < currentPage);
    if (prevPages.length > 0) {
      onPageChange(prevPages[prevPages.length - 1]);
    } else if (pinnedPages.length > 0) {
      onPageChange(pinnedPages[pinnedPages.length - 1]);
    }
  };

  // ── Feature 9: Stamp University Sticker ──
  const handleStampAcademicSticker = (preset: AcademicStickerPreset) => {
    const dimensions = getShapeDefaultDimensions(preset.stickerShape);
    const newNote: PageTextNote = {
      id: `acad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: 32 + Math.floor(Math.random() * 10),
      y: 20 + Math.floor(Math.random() * 10),
      text: `${preset.title}\n${preset.subtitle}`,
      color: preset.textColor,
      fontSize: 16,
      fontFamily: "marhey",
      bgStyle: preset.bgStyle,
      stickerShape: preset.stickerShape,
      stickerIcon: preset.icon,
      width: dimensions.width,
      height: dimensions.height,
      isFolded: false,
    };
    const updated = [...pageTextNotes, newNote];
    saveTextNotes(updated);
    setSelectedNoteId(newNote.id);
    setActiveTool("text");
    setIsAcademicStickersOpen(false);
  };

  // ── Feature 10: Generate Cheatsheet Data ──
  const handleGenerateCheatsheet = () => {
    const data: Array<{ page: number; pin?: PagePin; notes: PageTextNote[] }> = [];
    for (let p = 1; p <= totalPages; p++) {
      const pin = documentPins[p];
      let notes: PageTextNote[] = [];
      try {
        const saved = localStorage.getItem(`lammah_textnotes_${documentTitle}_p${p}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            notes = parsed.filter((n: PageTextNote) => n.text && n.text.trim().length > 0);
          }
        }
      } catch {}

      if (pin || notes.length > 0) {
        data.push({ page: p, pin, notes });
      }
    }
    setCheatsheetData(data);
    setIsCheatsheetModalOpen(true);
  };

  // Global click outside listener: deselect note when clicking outside canvas/toolbar/ribbon
  useEffect(() => {
    if (!selectedNoteId) return;

    const handleGlobalPointerDown = (e: PointerEvent) => {
      const rawTarget = e.target;
      const target = (rawTarget instanceof Element ? rawTarget : (rawTarget as Node)?.parentElement) as HTMLElement | null;
      if (!target || typeof target.closest !== "function") return;

      // If clicked inside the note card, top inspector ribbon, font menu, main toolbar, or any dropdown, keep active
      if (
        target.closest(".lammah-text-note-card") || 
        target.closest(".lammah-inspector-ribbon") || 
        target.closest(".lammah-font-menu") ||
        target.closest(".lammah-main-toolbar") ||
        target.closest("[data-lammah-dropdown]")
      ) {
        return;
      }

      setSelectedNoteId(null);
      setIsFontMenuOpen(false);
      setIsWeightMenuOpen(false);
      setIsFontSizeMenuOpen(false);
      setIsLineHeightMenuOpen(false);
      setIsBgColorMenuOpen(false);
      setIsMobileMoreToolsOpen(false);
      setActiveTool("browse");
    };

    window.addEventListener("pointerdown", handleGlobalPointerDown);
    return () => {
      window.removeEventListener("pointerdown", handleGlobalPointerDown);
    };
  }, [selectedNoteId]);

  // Real-time Bilingual (Arabic & English) Speech-to-Text Recording
  const handleStartVoiceRecording = async (noteId: string, overrideLang?: SpeechLang) => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("خاصية تحويل الصوت إلى نص المباشر متوفرة عبر متصفحات Google Chrome أو Microsoft Edge أو Safari الحديثة. يرجى استخدام متصفح حديث.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const target = pageTextNotes.find((n) => n.id === noteId);
    initialTextRef.current = target?.text || "";

    const activeLang = overrideLang || speechLang;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setRecordingNoteId(noteId);
        setSpeechErrorToast(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + " ";
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const sessionTranscript = (finalTranscript + interimTranscript).trim();
        if (sessionTranscript) {
          const base = initialTextRef.current ? initialTextRef.current.trim() + " " : "";
          const combined = base + sessionTranscript;

          setPageTextNotes((prev) =>
            prev.map((n) => (n.id === noteId ? { ...n, text: combined } : n))
          );
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        if (err.error === "not-allowed" || err.error === "service-not-allowed") {
          setSpeechErrorToast("يرجى السماح بصلاحية المايكروفون من إعدادات المتصفح للبدء بالتسجيل.");
        } else if (err.error === "network") {
          setSpeechErrorToast("يرجى التأكد من اتصالك بالإنترنت لخدمة تحويل الصوت إلى نص.");
        }
        setRecordingNoteId(null);
      };

      recognition.onend = () => {
        setRecordingNoteId(null);
        setPageTextNotes((latest) => {
          const storageKey = `lammah_textnotes_${documentTitle}_p${currentPage}`;
          try { localStorage.setItem(storageKey, JSON.stringify(latest)); } catch {}
          return latest;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error("Speech recognition startup error:", e);
      setRecordingNoteId(null);
      setSpeechErrorToast("تعذر بدء التسجيل، تأكد من إعطاء إذن المايك للمتصفح.");
    }
  };

  const handleStopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setRecordingNoteId(null);
  };

  const handleAddNewNoteAtCenter = () => {
    setActiveTool("text");
    setIsFontMenuOpen(false);

    const newNote: PageTextNote = {
      id: `txt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: 35,
      y: 25,
      text: "",
      color: activeTextColor,
      fontSize: activeFontSize,
      fontFamily: activeHandwritingFont,
      bgStyle: activeTextBg,
      width: 260,
      height: 160,
      isFolded: false,
    };

    const updated = [...pageTextNotes, newNote];
    saveTextNotes(updated);
    setSelectedNoteId(newNote.id);
  };

  const handleAddNewPlainTextAtCenter = () => {
    setActiveTool("plain_text");
    setIsFontMenuOpen(false);
    setIsWeightMenuOpen(false);
    setIsLineHeightMenuOpen(false);
    setIsBgColorMenuOpen(false);

    const newNote: PageTextNote = {
      id: `plaintxt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: 35,
      y: 28,
      text: "",
      color: activeTextColor || "#0F172A",
      fontSize: activeFontSize || 18,
      fontFamily: activeTypographyFont || "cairo",
      bgStyle: "transparent",
      noteType: "plain_text",
      fontWeight: activeFontWeight || "600",
      lineHeight: activeLineHeight || 1.4,
      textBgColor: activeTextBgColor || "transparent",
      textAlign: activeTextAlign || "right",
      width: 250,
      height: 85,
      isFolded: false,
    };

    const updated = [...pageTextNotes, newNote];
    saveTextNotes(updated);
    setSelectedNoteId(newNote.id);
  };

  const handleSelectTool = (tool: AnnotationTool) => {
    setActiveTool(tool);
    if (tool === "highlighter" || tool === "pen" || tool === "tape" || tool === "eraser") {
      setSelectedNoteId(null);
    }
    setIsFontMenuOpen(false);
    setIsWeightMenuOpen(false);
    setIsFontSizeMenuOpen(false);
    setIsLineHeightMenuOpen(false);
    setIsBgColorMenuOpen(false);
    setIsMobileMoreToolsOpen(false);
  };

  const handleViewportClickForNewText = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsFontMenuOpen(false);
    setIsWeightMenuOpen(false);
    setIsFontSizeMenuOpen(false);
    setIsLineHeightMenuOpen(false);
    setIsBgColorMenuOpen(false);
    setIsMobileMoreToolsOpen(false);

    const rawTarget = e.target;
    const target = (rawTarget instanceof Element ? rawTarget : (rawTarget as Node)?.parentElement) as HTMLElement | null;
    if (!target || typeof target.closest !== "function") return;

    if (
      target.closest(".lammah-text-note-card") ||
      target.closest(".lammah-inspector-ribbon") ||
      target.closest(".lammah-font-menu") ||
      target.closest(".lammah-main-toolbar") ||
      target.closest("[data-lammah-dropdown]")
    ) return;

    // If a note was selected, clicking outside immediately deselects it and hides the top options
    if (selectedNoteId !== null) {
      setSelectedNoteId(null);
      setIsFontMenuOpen(false);
      setIsWeightMenuOpen(false);
      setIsFontSizeMenuOpen(false);
      setIsLineHeightMenuOpen(false);
      setIsBgColorMenuOpen(false);
      setActiveTool("browse");
      return;
    }

    if (activeTool !== "text" && activeTool !== "plain_text") return;

    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const xPercent = Math.max(2, Math.min(75, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(2, Math.min(80, ((e.clientY - rect.top) / rect.height) * 100));

    let newNote: PageTextNote;
    if (activeTool === "plain_text") {
      newNote = {
        id: `plaintxt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        x: xPercent,
        y: yPercent,
        text: "",
        color: activeTextColor || "#0F172A",
        fontSize: activeFontSize || 18,
        fontFamily: activeTypographyFont || "cairo",
        bgStyle: "transparent",
        noteType: "plain_text",
        fontWeight: activeFontWeight || "600",
        lineHeight: activeLineHeight || 1.4,
        textBgColor: activeTextBgColor || "transparent",
        textAlign: activeTextAlign || "right",
        width: 250,
        height: 85,
        isFolded: false,
      };
    } else {
      newNote = {
        id: `txt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        x: xPercent,
        y: yPercent,
        text: "",
        color: activeTextColor,
        fontSize: activeFontSize,
        fontFamily: activeHandwritingFont,
        bgStyle: activeTextBg,
        width: 260,
        height: 160,
        isFolded: false,
      };
    }

    const updated = [...pageTextNotes, newNote];
    saveTextNotes(updated);
    setSelectedNoteId(newNote.id);
  };

  // ── Dragging logic for note cards (Ultra-smooth window-level tracking) ──
  const dragInfoRef = useRef<{ id: string; startX: number; startY: number; initX: number; initY: number; hasMoved?: boolean } | null>(null);

  const handleNotePointerDown = (e: React.PointerEvent, note: PageTextNote) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedNoteId(note.id);
    setIsDraggingAnyNote(true);

    dragInfoRef.current = {
      id: note.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: note.x,
      initY: note.y,
      hasMoved: false,
    };

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      if (!dragInfoRef.current || !viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dist = Math.hypot(moveEvent.clientX - dragInfoRef.current.startX, moveEvent.clientY - dragInfoRef.current.startY);
      if (dist > 3) {
        dragInfoRef.current.hasMoved = true;
      }

      const deltaX = ((moveEvent.clientX - dragInfoRef.current.startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - dragInfoRef.current.startY) / rect.height) * 100;

      const newX = Math.max(0, Math.min(92, dragInfoRef.current.initX + deltaX));
      const newY = Math.max(0, Math.min(92, dragInfoRef.current.initY + deltaY));

      setPageTextNotes((prev) =>
        prev.map((n) => (n.id === dragInfoRef.current?.id ? { ...n, x: newX, y: newY } : n))
      );
    };

    const handleWindowPointerUp = () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
      setIsDraggingAnyNote(false);

      if (dragInfoRef.current) {
        if (dragInfoRef.current.hasMoved) {
          lastDragEndTimeRef.current = Date.now();
        }
        dragInfoRef.current = null;
        setPageTextNotes((latest) => {
          const storageKey = `lammah_textnotes_${documentTitle}_p${currentPage}`;
          try {
            localStorage.setItem(storageKey, JSON.stringify(latest));
          } catch {}
          return latest;
        });
      }
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
  };

  // ── Canva-Style 8-Handle Bounding Box Resizing & Transform Logic ──
  type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

  const resizeInfoRef = useRef<{ 
    id: string; 
    startX: number; 
    startY: number; 
    initW: number; 
    initH: number; 
    initX: number;
    initY: number;
    viewportW: number;
    viewportH: number;
    handle: ResizeHandle;
  } | null>(null);

  const handleNoteResizeStart = (e: React.PointerEvent, note: PageTextNote, handle: ResizeHandle = "se") => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingAnyNote(true);
    setSelectedNoteId(note.id);
    const cardEl = (e.currentTarget as HTMLElement).closest(".lammah-text-note-card") as HTMLElement;
    const rect = cardEl ? cardEl.getBoundingClientRect() : { width: note.width || 260, height: note.height || 160 };
    const viewportRect = viewportRef.current?.getBoundingClientRect() || { width: 1000, height: 1000 };
    
    resizeInfoRef.current = {
      id: note.id,
      startX: e.clientX,
      startY: e.clientY,
      initW: rect.width,
      initH: rect.height,
      initX: note.x,
      initY: note.y,
      viewportW: Math.max(100, viewportRect.width),
      viewportH: Math.max(100, viewportRect.height),
      handle,
    };

    const handleWindowResizeMove = (moveEvent: PointerEvent) => {
      if (!resizeInfoRef.current) return;
      const { startX, startY, initW, initH, initX, initY, viewportW, viewportH, handle: h } = resizeInfoRef.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const initX_px = (initX / 100) * viewportW;
      const initY_px = (initY / 100) * viewportH;

      let newW = initW;
      let newH = initH;
      let newX_px = initX_px;
      let newY_px = initY_px;

      const minW = 100;
      const maxW = 750;
      const minH = 60;
      const maxH = 650;

      // Canva Horizontal sizing:
      // When dragging East (e, se, ne): left is pinned, width increases by deltaX
      // When dragging West (w, sw, nw): right is pinned, width increases by -deltaX, and X moves by changeInW
      if (h === "e" || h === "se" || h === "ne") {
        newW = Math.max(minW, Math.min(maxW, initW + deltaX));
      } else if (h === "w" || h === "sw" || h === "nw") {
        newW = Math.max(minW, Math.min(maxW, initW - deltaX));
        const changeInW = newW - initW;
        newX_px = initX_px - changeInW;
      }

      // Canva Vertical sizing:
      // When dragging South (s, se, sw): top is pinned, height increases by deltaY
      // When dragging North (n, ne, nw): bottom is pinned, height increases by -deltaY, and Y moves by changeInH
      if (h === "s" || h === "se" || h === "sw") {
        newH = Math.max(minH, Math.min(maxH, initH + deltaY));
      } else if (h === "n" || h === "ne" || h === "nw") {
        newH = Math.max(minH, Math.min(maxH, initH - deltaY));
        const changeInH = newH - initH;
        newY_px = initY_px - changeInH;
      }

      const newX = Math.max(0, Math.min(95, (newX_px / viewportW) * 100));
      const newY = Math.max(0, Math.min(95, (newY_px / viewportH) * 100));

      setPageTextNotes((prev) =>
        prev.map((n) => (n.id === resizeInfoRef.current?.id ? { ...n, width: newW, height: newH, x: newX, y: newY } : n))
      );
    };

    const handleWindowResizeUp = () => {
      window.removeEventListener("pointermove", handleWindowResizeMove);
      window.removeEventListener("pointerup", handleWindowResizeUp);
      window.removeEventListener("pointercancel", handleWindowResizeUp);
      setIsDraggingAnyNote(false);

      if (resizeInfoRef.current) {
        resizeInfoRef.current = null;
        setPageTextNotes((latest) => {
          const storageKey = `lammah_textnotes_${documentTitle}_p${currentPage}`;
          try {
            localStorage.setItem(storageKey, JSON.stringify(latest));
          } catch {}
          return latest;
        });
      }
    };

    window.addEventListener("pointermove", handleWindowResizeMove);
    window.addEventListener("pointerup", handleWindowResizeUp);
    window.addEventListener("pointercancel", handleWindowResizeUp);
  };

  // Pomodoro Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isPomodoroActive && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsPomodoroActive(false);
      try {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(() => {});
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isPomodoroActive, pomodoroSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Manage direct master object URL for instant fallback
  useEffect(() => {
    if (!pdfSource) {
      setDirectMasterUrl(null);
      return;
    }

    if (typeof pdfSource === "string") {
      setDirectMasterUrl(pdfSource);
      return;
    }

    if (pdfSource && typeof (pdfSource as any).arrayBuffer === "function") {
      const url = URL.createObjectURL(pdfSource as Blob);
      setDirectMasterUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfSource]);

  // Load and Parse Master PDF Document into memory
  useEffect(() => {
    let isCancelled = false;

    async function loadMasterDoc() {
      if (!pdfSource) {
        setMasterPdfDoc(null);
        pdfRawBytesRef.current = null;
        pageBlobCacheRef.current.clear();
        setSinglePageUrl(null);
        return;
      }

      setLoading(true);

      try {
        let arrayBuffer: ArrayBuffer;

        if (typeof pdfSource === "string") {
          const res = await fetch(pdfSource);
          arrayBuffer = await res.arrayBuffer();
        } else if (pdfSource && typeof (pdfSource as any).arrayBuffer === "function") {
          arrayBuffer = await (pdfSource as Blob).arrayBuffer();
        } else {
          throw new Error("Invalid PDF source");
        }

        if (isCancelled) return;

        pdfRawBytesRef.current = arrayBuffer;
        const loadedPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        if (isCancelled) return;

        pageBlobCacheRef.current.clear();
        setMasterPdfDoc(loadedPdf);

        const count = loadedPdf.getPageCount();
        onTotalPagesChange(count);
        if (currentPage > count || currentPage < 1) {
          onPageChange(1);
        }

        // Immediately calculate dimensions of current page
        try {
          const initIdx = Math.max(0, Math.min(count - 1, currentPage - 1));
          const initPage = loadedPdf.getPage(initIdx);
          const { width: pW, height: pH } = initPage.getSize();
          if (pW > 0 && pH > 0) {
            setPageDimensions({ width: pW, height: pH, ratio: pW / pH });
          }
        } catch (e) {
          console.warn("Could not calculate initial page dimensions:", e);
        }
      } catch (err) {
        console.error("Master PDF load error:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadMasterDoc();

    return () => {
      isCancelled = true;
    };
  }, [pdfSource]);

  // Dynamically calculate the active page aspect ratio and dimensions on page change
  useEffect(() => {
    if (!masterPdfDoc) return;
    try {
      const count = masterPdfDoc.getPageCount();
      if (count === 0) return;
      const pageIdx = Math.max(0, Math.min(count - 1, currentPage - 1));
      const page = masterPdfDoc.getPage(pageIdx);
      const { width, height } = page.getSize();
      if (width > 0 && height > 0) {
        setPageDimensions({
          width,
          height,
          ratio: width / height,
        });
      }
    } catch (err) {
      console.warn("Could not calculate page dimensions on navigation:", err);
    }
  }, [masterPdfDoc, currentPage]);

  // Extract Single Page Slice for the Active Page and Prefetch Adjacent Pages
  useEffect(() => {
    let isCancelled = false;

    async function slicePage(pageNum: number): Promise<string | null> {
      if (!masterPdfDoc) return null;
      if (pageBlobCacheRef.current.has(pageNum)) {
        return pageBlobCacheRef.current.get(pageNum)!;
      }

      try {
        const total = masterPdfDoc.getPageCount();
        if (pageNum < 1 || pageNum > total) return null;
        const pageIdx = pageNum - 1;

        const singleDoc = await PDFDocument.create();
        const [copiedPage] = await singleDoc.copyPages(masterPdfDoc, [pageIdx]);
        singleDoc.addPage(copiedPage);

        const singleBytes = await singleDoc.save();
        if (isCancelled) return null;

        const pageBlob = new Blob([singleBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
        const createdUrl = URL.createObjectURL(pageBlob);
        pageBlobCacheRef.current.set(pageNum, createdUrl);
        return createdUrl;
      } catch (err) {
        console.warn(`Error slicing page ${pageNum}:`, err);
        return null;
      }
    }

    async function prepareActiveAndAdjacentPages() {
      if (!masterPdfDoc) return;

      const cached = pageBlobCacheRef.current.get(currentPage);
      if (cached) {
        setSinglePageUrl(cached);
        setIsPageSliceLoading(false);
      } else {
        setIsPageSliceLoading(true);
        const url = await slicePage(currentPage);
        if (!isCancelled && url) {
          setSinglePageUrl(url);
        }
        if (!isCancelled) {
          setIsPageSliceLoading(false);
        }
      }

      // Prefetch next and previous pages in background for 0ms instant page turns
      setTimeout(async () => {
        if (isCancelled || !masterPdfDoc) return;
        const total = masterPdfDoc.getPageCount();
        if (currentPage + 1 <= total && !pageBlobCacheRef.current.has(currentPage + 1)) {
          await slicePage(currentPage + 1);
        }
        if (currentPage - 1 >= 1 && !pageBlobCacheRef.current.has(currentPage - 1)) {
          await slicePage(currentPage - 1);
        }
      }, 100);
    }

    prepareActiveAndAdjacentPages();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, masterPdfDoc]);

  // ── Native Vector High-Res PDF Canvas Rendering via pdfjs-dist (100% Mobile Scale & Zero Cut-off) ──
  useEffect(() => {
    let isCancelled = false;

    async function renderPageToCanvas() {
      if (!pdfRawBytesRef.current || !pdfCanvasRef.current) return;

      // Cancel any ongoing render task before starting a new one
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
        currentRenderTaskRef.current = null;
      }

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        let pdfDoc;
        try {
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(pdfRawBytesRef.current.slice(0)),
            cMapUrl: "/cmaps/",
            cMapPacked: true,
            standardFontDataUrl: "/standard_fonts/",
          });
          pdfDoc = await loadingTask.promise;
        } catch (firstErr) {
          console.warn("Retrying pdfjs-dist with fallback font data:", firstErr);
          const fallbackTask = pdfjsLib.getDocument({
            data: new Uint8Array(pdfRawBytesRef.current.slice(0)),
            cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
            cMapPacked: true,
            standardFontDataUrl: "https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/",
          });
          pdfDoc = await fallbackTask.promise;
        }

        if (isCancelled) return;

        const total = pdfDoc.numPages;
        if (currentPage < 1 || currentPage > total) return;

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = pdfCanvasRef.current;
        if (!canvas) return;

        // Container responsive width (exact viewport width on phone)
        const containerW = viewportRef.current?.clientWidth || (typeof window !== "undefined" ? Math.max(280, window.innerWidth - 32) : 800);
        const unscaledViewport = page.getViewport({ scale: 1, rotation: page.rotate || 0 });
        
        // Exact responsive scale to fit mobile screen without clipping
        const cssScale = Math.max(0.1, containerW / unscaledViewport.width);
        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const renderViewport = page.getViewport({ scale: cssScale * dpr, rotation: page.rotate || 0 });

        canvas.width = Math.round(renderViewport.width);
        canvas.height = Math.round(renderViewport.height);
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // CRITICAL: Reset transformation matrix and enforce LTR context direction
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if ("direction" in ctx) {
          ctx.direction = "ltr";
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport: renderViewport,
        });
        currentRenderTaskRef.current = renderTask;

        await renderTask.promise;
        currentRenderTaskRef.current = null;

        if (!isCancelled) {
          setIsPdfCanvasReady(true);
          setIsIframeLoading(false);
          setPageDimensions({
            width: unscaledViewport.width,
            height: unscaledViewport.height,
            ratio: unscaledViewport.width / unscaledViewport.height,
          });
        }
      } catch (err: any) {
        if (err?.name === "RenderingCancelledException") {
          return;
        }
        console.warn("pdfjs-dist render fallback:", err);
      } finally {
        if (!isCancelled) {
          setIsIframeLoading(false);
        }
      }
    }

    renderPageToCanvas();

    const handleResize = () => {
      renderPageToCanvas();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isCancelled = true;
      if (currentRenderTaskRef.current) {
        try {
          currentRenderTaskRef.current.cancel();
        } catch (e) {}
        currentRenderTaskRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [currentPage, masterPdfDoc]);

  // Load saved annotations for current page from local storage
  useEffect(() => {
    const storageKey = `lammah_annot_${documentTitle}_p${currentPage}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPageStrokes(JSON.parse(saved));
      } else {
        setPageStrokes([]);
      }
    } catch {
      setPageStrokes([]);
    }
  }, [currentPage, documentTitle]);

  // Save annotations whenever pageStrokes change
  const saveStrokes = (strokes: AnnotationStroke[]) => {
    setPageStrokes(strokes);
    const storageKey = `lammah_annot_${documentTitle}_p${currentPage}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(strokes));
    } catch (e) {
      console.error("Failed to save annotations:", e);
    }
  };

  // Draw overlay annotation strokes (Shapes + Freehand + Active Recall Tape)
  const redrawAnnotations = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const allStrokes = currentStroke ? [...pageStrokes, currentStroke] : pageStrokes;

    for (const stroke of allStrokes) {
      ctx.save();

      // 1. Active Recall Tape Tool
      if (stroke.tool === "tape" && stroke.startPoint && stroke.endPoint) {
        const x = Math.min(stroke.startPoint.x, stroke.endPoint.x);
        const y = Math.min(stroke.startPoint.y, stroke.endPoint.y);
        const w = Math.abs(stroke.endPoint.x - stroke.startPoint.x);
        const h = Math.abs(stroke.endPoint.y - stroke.startPoint.y);

        if (stroke.revealed) {
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = stroke.color;
          ctx.fillRect(x, y, w, h);
          ctx.globalAlpha = 0.6;
          ctx.strokeStyle = stroke.color;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, w, h);
        } else {
          ctx.globalAlpha = 0.96;
          ctx.fillStyle = stroke.color;
          ctx.fillRect(x, y, w, h);

          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

          if (w > 50 && h > 16) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("👁️ انقر للكشف", x + w / 2, y + h / 2);
          }
        }
      }
      // 2. Rectangle Shape
      else if (stroke.shape === "rect" && stroke.startPoint && stroke.endPoint) {
        const x = Math.min(stroke.startPoint.x, stroke.endPoint.x);
        const y = Math.min(stroke.startPoint.y, stroke.endPoint.y);
        const w = Math.abs(stroke.endPoint.x - stroke.startPoint.x);
        const h = Math.abs(stroke.endPoint.y - stroke.startPoint.y);

        if (stroke.tool === "highlighter") {
          ctx.globalAlpha = 0.36;
          ctx.fillStyle = stroke.color;
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, w, h);
        } else {
          ctx.globalAlpha = 0.95;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width || 3;
          ctx.strokeRect(x, y, w, h);
        }
      }
      // 3. Circle / Ellipse Shape
      else if (stroke.shape === "circle" && stroke.startPoint && stroke.endPoint) {
        const cx = (stroke.startPoint.x + stroke.endPoint.x) / 2;
        const cy = (stroke.startPoint.y + stroke.endPoint.y) / 2;
        const rx = Math.abs(stroke.endPoint.x - stroke.startPoint.x) / 2;
        const ry = Math.abs(stroke.endPoint.y - stroke.startPoint.y) / 2;

        if (rx > 2 && ry > 2) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          if (stroke.tool === "highlighter") {
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = stroke.color;
            ctx.fill();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else {
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width || 3;
            ctx.stroke();
          }
        }
      }
      // 4. Arrow Shape
      else if (stroke.shape === "arrow" && stroke.startPoint && stroke.endPoint) {
        const fromX = stroke.startPoint.x;
        const fromY = stroke.startPoint.y;
        const toX = stroke.endPoint.x;
        const toY = stroke.endPoint.y;
        const headlen = 14;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineCap = "round";
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width || 3.5;
        ctx.globalAlpha = stroke.tool === "highlighter" ? 0.65 : 0.95;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
      // 5. Straight Line Underline
      else if (stroke.shape === "line" && stroke.startPoint && stroke.endPoint) {
        ctx.beginPath();
        ctx.lineCap = "round";
        if (stroke.tool === "highlighter") {
          ctx.globalAlpha = 0.42;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width || 18;
        } else {
          ctx.globalAlpha = 0.95;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width || 3;
        }
        ctx.moveTo(stroke.startPoint.x, stroke.startPoint.y);
        ctx.lineTo(stroke.endPoint.x, stroke.endPoint.y);
        ctx.stroke();
      } 
      // 6. Freehand Drawing
      else {
        if (stroke.points && stroke.points.length >= 2) {
          ctx.beginPath();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          if (stroke.tool === "highlighter") {
            ctx.globalAlpha = 0.38;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width || 20;
          } else {
            ctx.globalAlpha = 0.95;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width || 3.5;
          }

          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }, [pageStrokes, currentStroke]);

  useEffect(() => {
    redrawAnnotations();
  }, [redrawAnnotations]);

  // Keep canvas annotations accurately synced on viewport resize or aspect ratio change
  useEffect(() => {
    if (!viewportRef.current) return;
    const ro = new ResizeObserver(() => {
      redrawAnnotations();
    });
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [redrawAnnotations]);

  // Annotation Drawing Event Handlers
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent | React.TouchEvent): StrokePoint | null => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;
    if ("clientX" in e && typeof e.clientX === "number") {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if ("touches" in e && (e as React.TouchEvent).touches && (e as React.TouchEvent).touches.length > 0) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      return null;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsMobileMoreToolsOpen(false);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const pt = getCanvasCoords(e);
    if (!pt) return;

    // In Browse or Tape mode: clicking a tape reveals / hides it (Active Recall)
    if (activeTool === "browse" || activeTool === "tape") {
      const clickedTapeIndex = pageStrokes.findIndex((stroke) => {
        if (stroke.tool !== "tape" || !stroke.startPoint || !stroke.endPoint) return false;
        const x = Math.min(stroke.startPoint.x, stroke.endPoint.x);
        const y = Math.min(stroke.startPoint.y, stroke.endPoint.y);
        const w = Math.abs(stroke.endPoint.x - stroke.startPoint.x);
        const h = Math.abs(stroke.endPoint.y - stroke.startPoint.y);
        return pt.x >= x && pt.x <= x + w && pt.y >= y && pt.y <= y + h;
      });

      if (clickedTapeIndex !== -1) {
        const updated = [...pageStrokes];
        updated[clickedTapeIndex] = {
          ...updated[clickedTapeIndex],
          revealed: !updated[clickedTapeIndex].revealed,
        };
        saveStrokes(updated);
        return;
      }
    }

    if (activeTool === "browse") return;

    if (activeTool === "eraser") {
      // Erase nearest stroke
      const threshold = 22;
      const filtered = pageStrokes.filter((stroke) => {
        if ((stroke.shape === "rect" || stroke.tool === "tape") && stroke.startPoint && stroke.endPoint) {
          const x = Math.min(stroke.startPoint.x, stroke.endPoint.x);
          const y = Math.min(stroke.startPoint.y, stroke.endPoint.y);
          const w = Math.abs(stroke.endPoint.x - stroke.startPoint.x);
          const h = Math.abs(stroke.endPoint.y - stroke.startPoint.y);
          return !(pt.x >= x - 10 && pt.x <= x + w + 10 && pt.y >= y - 10 && pt.y <= y + h + 10);
        }
        if (stroke.shape === "circle" && stroke.startPoint && stroke.endPoint) {
          const cx = (stroke.startPoint.x + stroke.endPoint.x) / 2;
          const cy = (stroke.startPoint.y + stroke.endPoint.y) / 2;
          const rx = Math.abs(stroke.endPoint.x - stroke.startPoint.x) / 2 + 10;
          const ry = Math.abs(stroke.endPoint.y - stroke.startPoint.y) / 2 + 10;
          const dx = (pt.x - cx) / rx;
          const dy = (pt.y - cy) / ry;
          return dx * dx + dy * dy > 1.2;
        }
        return !stroke.points?.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < threshold);
      });
      if (filtered.length !== pageStrokes.length) {
        saveStrokes(filtered);
      }
      return;
    }

    setIsDrawing(true);

    const toolType = activeTool === "tape" ? "tape" : activeTool === "highlighter" ? "highlighter" : "pen";
    const color = activeTool === "tape" ? selectedTapeColor : activeTool === "highlighter" ? selectedHighlightColor : selectedPenColor;
    const shape = activeTool === "tape" ? "rect" : activeShape;

    const newStroke: AnnotationStroke = {
      id: `strk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tool: toolType,
      shape: shape,
      color: color,
      width: activeTool === "highlighter" 
        ? (shape === "line" ? activeHighlighterWidth : activeHighlighterWidth + 2) 
        : (shape === "rect" || shape === "circle" ? activePenWidth : activePenWidth + 0.5),
      points: [pt],
      startPoint: pt,
      endPoint: pt,
      revealed: false,
    };
    setCurrentStroke(newStroke);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === "browse") return;
    const pt = getCanvasCoords(e);
    if (!pt) return;

    if (activeTool === "eraser" && isDrawing) {
      const threshold = 22;
      const filtered = pageStrokes.filter((stroke) => {
        return !stroke.points?.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < threshold);
      });
      if (filtered.length !== pageStrokes.length) {
        saveStrokes(filtered);
      }
      return;
    }

    if (!isDrawing || !currentStroke) return;

    if (currentStroke.shape === "freehand") {
      setCurrentStroke({
        ...currentStroke,
        points: [...currentStroke.points, pt],
      });
    } else {
      setCurrentStroke({
        ...currentStroke,
        endPoint: pt,
      });
    }
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }
    if (isDrawing && currentStroke) {
      if (currentStroke.shape === "freehand" && currentStroke.points.length > 1) {
        if (autoSnapShapes && currentStroke.points.length >= 6) {
          const snapped = detectGeometricShape(currentStroke.points);
          if (snapped) {
            const perfectedStroke: AnnotationStroke = {
              ...currentStroke,
              shape: snapped.shape,
              startPoint: snapped.startPoint,
              endPoint: snapped.endPoint,
              points: [snapped.startPoint, snapped.endPoint],
            };
            saveStrokes([...pageStrokes, perfectedStroke]);
            setIsDrawing(false);
            setCurrentStroke(null);
            return;
          }
        }
        saveStrokes([...pageStrokes, currentStroke]);
      } else if (currentStroke.startPoint && currentStroke.endPoint) {
        const dist = Math.hypot(currentStroke.endPoint.x - currentStroke.startPoint.x, currentStroke.endPoint.y - currentStroke.startPoint.y);
        if (dist > 5) {
          saveStrokes([...pageStrokes, currentStroke]);
        }
      }
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const handleUndoStroke = () => {
    if (pageStrokes.length === 0) return;
    saveStrokes(pageStrokes.slice(0, -1));
  };

  const handleClearPageAnnotations = () => {
    if (pageStrokes.length === 0) return;
    if (window.confirm("هل تريد مسح جميع التظليلات والتخطيطات من هذه الصفحة؟")) {
      saveStrokes([]);
    }
  };

  // Export Complete Annotated PDF with All Highlights & Shapes Baked In Directly
  const handleExportAnnotatedPdf = async () => {
    // 1. Immediately flush current active page strokes & text notes to localStorage
    try {
      localStorage.setItem(`lammah_annot_${documentTitle}_p${currentPage}`, JSON.stringify(pageStrokes));
      localStorage.setItem(`lammah_textnotes_${documentTitle}_p${currentPage}`, JSON.stringify(pageTextNotes));
    } catch (e) {
      console.error("Failed to flush current page state before export:", e);
    }

    if (!pdfRawBytesRef.current && pdfSource) {
      try {
        if (typeof pdfSource === "string") {
          const res = await fetch(pdfSource);
          pdfRawBytesRef.current = await res.arrayBuffer();
        } else if (pdfSource && typeof (pdfSource as any).arrayBuffer === "function") {
          pdfRawBytesRef.current = await (pdfSource as Blob).arrayBuffer();
        }
      } catch (e) {
        console.error("Failed to fetch pdf bytes for export:", e);
      }
    }

    if (!pdfRawBytesRef.current) {
      alert("لم يتم العثور على ملف لتصديره.");
      return;
    }

    setIsExportingPdf(true);
    try {
      const exportDoc = await PDFDocument.load(pdfRawBytesRef.current, { ignoreEncryption: true });
      const total = exportDoc.getPageCount();
      const canvas = overlayCanvasRef.current;
      const canvasWidth = canvas?.clientWidth || 800;
      const canvasHeight = canvas?.clientHeight || 600;

      const hexToRgb = (hex: string) => {
        const c = hex.replace("#", "");
        const r = parseInt(c.substring(0, 2), 16) / 255 || 0.9;
        const g = parseInt(c.substring(2, 4), 16) / 255 || 0.8;
        const b = parseInt(c.substring(4, 6), 16) / 255 || 0.2;
        return { r, g, b };
      };

      for (let p = 1; p <= total; p++) {
        const storageKey = `lammah_annot_${documentTitle}_p${p}`;
        const rawData = localStorage.getItem(storageKey);
        if (!rawData) continue;

        const strokes: AnnotationStroke[] = JSON.parse(rawData);
        if (!strokes || strokes.length === 0) continue;

        const pdfPage = exportDoc.getPage(p - 1);
        const { width: pdfW, height: pdfH } = pdfPage.getSize();

        const scaleX = pdfW / canvasWidth;
        const scaleY = pdfH / canvasHeight;

        for (const stroke of strokes) {
          const { r, g, b } = hexToRgb(stroke.color);
          const isHighlighter = stroke.tool === "highlighter";

          if ((stroke.shape === "rect" || stroke.tool === "tape") && stroke.startPoint && stroke.endPoint) {
            const minX = Math.min(stroke.startPoint.x, stroke.endPoint.x) * scaleX;
            const maxX = Math.max(stroke.startPoint.x, stroke.endPoint.x) * scaleX;
            const minY = Math.min(stroke.startPoint.y, stroke.endPoint.y) * scaleY;
            const maxY = Math.max(stroke.startPoint.y, stroke.endPoint.y) * scaleY;
            const w = maxX - minX;
            const h = maxY - minY;
            const y = pdfH - maxY;

            if (stroke.tool === "tape") {
              pdfPage.drawRectangle({
                x: minX,
                y: y,
                width: w,
                height: h,
                color: rgb(r, g, b),
                opacity: 0.96,
                borderWidth: 1,
                borderColor: rgb(1, 1, 1),
              });
            } else if (isHighlighter) {
              pdfPage.drawRectangle({
                x: minX,
                y: y,
                width: w,
                height: h,
                color: rgb(r, g, b),
                opacity: 0.38,
                borderWidth: 1,
                borderColor: rgb(r, g, b),
              });
            } else {
              pdfPage.drawRectangle({
                x: minX,
                y: y,
                width: w,
                height: h,
                borderColor: rgb(r, g, b),
                borderWidth: stroke.width || 2,
                opacity: 0.95,
              });
            }
          } else if (stroke.shape === "line" && stroke.startPoint && stroke.endPoint) {
            pdfPage.drawLine({
              start: { x: stroke.startPoint.x * scaleX, y: pdfH - stroke.startPoint.y * scaleY },
              end: { x: stroke.endPoint.x * scaleX, y: pdfH - stroke.endPoint.y * scaleY },
              thickness: isHighlighter ? 14 * scaleY : (stroke.width || 2) * scaleY,
              color: rgb(r, g, b),
              opacity: isHighlighter ? 0.45 : 0.95,
            });
          } else if (stroke.shape === "arrow" && stroke.startPoint && stroke.endPoint) {
            const startX = stroke.startPoint.x * scaleX;
            const startY = pdfH - stroke.startPoint.y * scaleY;
            const endX = stroke.endPoint.x * scaleX;
            const endY = pdfH - stroke.endPoint.y * scaleY;

            pdfPage.drawLine({
              start: { x: startX, y: startY },
              end: { x: endX, y: endY },
              thickness: (stroke.width || 2.5) * scaleY,
              color: rgb(r, g, b),
              opacity: 0.95,
            });
          } else if (stroke.shape === "circle" && stroke.startPoint && stroke.endPoint) {
            const minX = Math.min(stroke.startPoint.x, stroke.endPoint.x) * scaleX;
            const maxX = Math.max(stroke.startPoint.x, stroke.endPoint.x) * scaleX;
            const minY = Math.min(stroke.startPoint.y, stroke.endPoint.y) * scaleY;
            const maxY = Math.max(stroke.startPoint.y, stroke.endPoint.y) * scaleY;
            const cx = (minX + maxX) / 2;
            const cy = pdfH - (minY + maxY) / 2;
            const rx = (maxX - minX) / 2;
            const ry = (maxY - minY) / 2;

            if (rx > 1 && ry > 1) {
              pdfPage.drawEllipse({
                x: cx,
                y: cy,
                xScale: rx,
                yScale: ry,
                color: isHighlighter ? rgb(r, g, b) : undefined,
                borderColor: rgb(r, g, b),
                borderWidth: isHighlighter ? 1 : (stroke.width || 2),
                opacity: isHighlighter ? 0.35 : 0.95,
              });
            }
          } else if (stroke.points && stroke.points.length >= 2) {
            for (let i = 0; i < stroke.points.length - 1; i++) {
              const p1 = stroke.points[i];
              const p2 = stroke.points[i + 1];
              pdfPage.drawLine({
                start: { x: p1.x * scaleX, y: pdfH - p1.y * scaleY },
                end: { x: p2.x * scaleX, y: pdfH - p2.y * scaleY },
                thickness: isHighlighter ? 16 * scaleY : (stroke.width || 3) * scaleY,
                color: rgb(r, g, b),
                opacity: isHighlighter ? 0.4 : 0.95,
              });
            }
          }
        }
      }

      // Ensure all custom fonts are ready before drawing text
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      // Export text notes for all pages into the PDF with 100% exact screen-matching position and Arabic typography
      for (let p = 1; p <= total; p++) {
        const textKey = `lammah_textnotes_${documentTitle}_p${p}`;
        const rawTextData = localStorage.getItem(textKey);
        if (!rawTextData) continue;

        const textNotes: PageTextNote[] = JSON.parse(rawTextData);
        if (!textNotes || textNotes.length === 0) continue;

        const pdfPage = exportDoc.getPage(p - 1);
        const { width: pdfW, height: pdfH } = pdfPage.getSize();

        // Exact viewport dimensions matching the screen container
        const viewerWidth = viewportRef.current?.clientWidth || canvas?.clientWidth || 800;
        const viewerHeight = viewportRef.current?.clientHeight || canvas?.clientHeight || 600;
        const scaleX = pdfW / viewerWidth;
        const scaleY = pdfH / viewerHeight;

        for (const n of textNotes) {
          if (!n.text || !n.text.trim()) continue;

          const isPlainText = n.noteType === "plain_text";
          const textBg = isPlainText ? (n.textBgColor || "transparent") : n.bgStyle;
          const isTransparent = textBg === "transparent";

          const rawW = n.width ?? (isPlainText ? 250 : 260);
          const rawH = n.height ?? (isPlainText ? 85 : 160);
          const targetW = rawW * scaleX;
          const baseTargetH = rawH * scaleY;

          // Font configuration
          let fontFamilyCss = "'Cairo', 'Alexandria', sans-serif";
          if (isPlainText) {
            const fontObj = TYPOGRAPHY_FONTS.find((f) => f.id === n.fontFamily) || TYPOGRAPHY_FONTS[0];
            fontFamilyCss = fontObj?.fontFamily || "'Cairo', sans-serif";
          } else if (n.fontFamily) {
            const fontObj = TYPOGRAPHY_FONTS.find((f) => f.id === n.fontFamily);
            fontFamilyCss = fontObj?.fontFamily || `'${n.fontFamily}', cursive, sans-serif`;
          }

          const fontWeightCss = n.fontWeight || (isPlainText ? "600" : "500");
          const fontSize = Math.max(6, (n.fontSize || (isPlainText ? 18 : 16)) * scaleY);
          const lineHeight = (n.lineHeight || 1.4) * fontSize;
          const isDarkBg = textBg?.toLowerCase().includes("0f172a") || textBg === "dark";
          const textColor = n.color || (isDarkBg ? "#FFFFFF" : "#0F172A");
          const textAlign = n.textAlign || "right";

          // Exact DOM vertical offset:
          // In the DOM, text is pushed down by:
          // 1. Top grip bar: h-5 (20px) for plain_text, h-4 (16px) for sticker
          // 2. Card padding: p-2.5 (10px) for plain_text if !isTransparent, 0 if transparent
          // 3. Textarea font half-leading: ((lineHeight - 1) * 0.5 * fontSize)
          const topGripHeight = isPlainText ? 20 : 16;
          const topPad = isPlainText ? (isTransparent ? 0 : 10) : (isTransparent ? 0 : 4);
          const halfLeading = ((n.lineHeight || 1.4) - 1) * 0.5 * (n.fontSize || 18);
          const textTopOffsetInScreen = topGripHeight + topPad + halfLeading;
          const textTopOffsetInPdf = textTopOffsetInScreen * scaleY;

          const padX = (isTransparent ? 0 : (isPlainText ? 10 : 12)) * scaleX;
          const contentWidth = Math.max(20, targetW - padX * 2);

          // Wrap text lines
          const testCanvas = document.createElement("canvas");
          const testCtx = testCanvas.getContext("2d");
          if (testCtx) {
            testCtx.font = `${fontWeightCss} ${fontSize}px ${fontFamilyCss}`;
          }

          const paragraphs = (n.text || "").split("\n");
          const linesToDraw: string[] = [];

          for (const para of paragraphs) {
            if (!para.trim()) {
              linesToDraw.push("");
              continue;
            }

            const words = para.split(" ");
            let currentLine = "";

            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
              const metrics = testCtx?.measureText(testLine);

              if (metrics && metrics.width > contentWidth && currentLine) {
                linesToDraw.push(currentLine);
                currentLine = words[i];
              } else {
                currentLine = testLine;
              }
            }

            if (currentLine) {
              linesToDraw.push(currentLine);
            }
          }

          const iconHeight = n.stickerIcon && !isPlainText ? fontSize * 1.3 : 0;
          const totalContentHeight = textTopOffsetInPdf + iconHeight + (linesToDraw.length * lineHeight) + (isTransparent ? 6 * scaleY : 12 * scaleY);
          const finalTargetH = Math.max(baseTargetH, totalContentHeight);

          // High DPI offscreen canvas for crisp, vector-like rendering
          const dpr = 2.5;
          const offCanvas = document.createElement("canvas");
          offCanvas.width = Math.max(100, Math.round(targetW * dpr));
          offCanvas.height = Math.max(50, Math.round(finalTargetH * dpr));

          const ctx = offCanvas.getContext("2d");
          if (!ctx) continue;

          ctx.scale(dpr, dpr);

          // 1. Draw Background & Border if not transparent
          if (!isTransparent) {
            let bgColor = "#FEF08A";
            let strokeColor = "rgba(0, 0, 0, 0.1)";

            if (isPlainText) {
              bgColor = n.textBgColor || "#ffffff";
              strokeColor = "rgba(0, 0, 0, 0.12)";
            } else {
              const preset = STICKY_BG_PRESETS.find((pr) => pr.id === n.bgStyle) || STICKY_BG_PRESETS[0];
              bgColor = preset?.svgFill || "#FEF08A";
              strokeColor = preset?.svgStroke || "#EAB308";
            }

            const radius = 10 * scaleX;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(0, 0, targetW, finalTargetH, radius);
            } else {
              ctx.rect(0, 0, targetW, finalTargetH);
            }
            ctx.fillStyle = bgColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = Math.max(1, 1 * scaleX);
            ctx.stroke();
          }

          // 2. Render Text
          ctx.font = `${fontWeightCss} ${fontSize}px ${fontFamilyCss}`;
          ctx.fillStyle = textColor;
          ctx.textAlign = textAlign;
          ctx.textBaseline = "top";
          ctx.direction = "rtl";

          let textX = targetW - padX;
          if (textAlign === "center") {
            textX = targetW / 2;
          } else if (textAlign === "left") {
            textX = padX;
          }

          let textY = textTopOffsetInPdf;

          // Draw sticker icon if present
          if (n.stickerIcon && !isPlainText) {
            ctx.font = `${fontSize * 1.1}px sans-serif`;
            ctx.fillText(n.stickerIcon, textX, textY);
            textY += iconHeight;
            ctx.font = `${fontWeightCss} ${fontSize}px ${fontFamilyCss}`;
          }

          // Draw wrapped lines
          for (const line of linesToDraw) {
            if (line) {
              ctx.fillText(line, textX, textY);
            }
            textY += lineHeight;
          }

          // Embed crisp PNG into PDF page
          const pngDataUrl = offCanvas.toDataURL("image/png");
          const base64 = pngDataUrl.split(",")[1];
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          const embeddedImg = await exportDoc.embedPng(bytes);
          const noteX = (n.x / 100) * pdfW;
          const noteY = pdfH - (n.y / 100) * pdfH - finalTargetH;

          pdfPage.drawImage(embeddedImg, {
            x: noteX,
            y: noteY,
            width: targetW,
            height: finalTargetH,
          });
        }
      }

      const modifiedPdfBytes = await exportDoc.save();
      const blob = new Blob([modifiedPdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = (documentTitle || "مستند_دراسي").replace(/\.pdf$/i, "");
      a.download = `مخطط_${cleanTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccessToast(true);
      setTimeout(() => setExportSuccessToast(false), 4000);
    } catch (err) {
      console.error("Failed to export annotated PDF:", err);
      alert("حدث خطأ أثناء تصدير ملف الـ PDF المخطط.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Feature 11: Insert Blank, Ruled, Grid, or Dotted Page
  const handleInsertPage = async (
    type: "blank" | "ruled" | "grid" | "dots" = "blank",
    location: "after_current" | "at_end" = "after_current"
  ) => {
    if (!masterPdfDoc) return;

    try {
      setLoading(true);

      // 1. Determine dimensions from current page (fallback to standard A4)
      let width = 595.28;
      let height = 841.89;
      try {
        const curIdx = Math.max(0, Math.min(masterPdfDoc.getPageCount() - 1, currentPage - 1));
        const curPage = masterPdfDoc.getPage(curIdx);
        const size = curPage.getSize();
        if (size.width > 0 && size.height > 0) {
          width = size.width;
          height = size.height;
        }
      } catch (e) {
        console.warn("Using default page dimensions:", e);
      }

      // 2. Determine insertion index (0-based)
      const totalCount = masterPdfDoc.getPageCount();
      const insertIndex = location === "at_end" ? totalCount : Math.min(totalCount, currentPage);

      // 3. Insert page
      const newPage = masterPdfDoc.insertPage(insertIndex, [width, height]);

      // 4. Draw patterns if requested
      if (type === "ruled") {
        const startY = 60;
        const endY = height - 60;
        const step = 28;
        for (let y = startY; y < endY; y += step) {
          newPage.drawLine({
            start: { x: 35, y },
            end: { x: width - 35, y },
            thickness: 0.75,
            color: rgb(0.88, 0.91, 0.95),
          });
        }
      } else if (type === "grid") {
        const step = 22;
        for (let y = 30; y < height - 30; y += step) {
          newPage.drawLine({
            start: { x: 30, y },
            end: { x: width - 30, y },
            thickness: 0.5,
            color: rgb(0.9, 0.92, 0.95),
          });
        }
        for (let x = 30; x < width - 30; x += step) {
          newPage.drawLine({
            start: { x, y: 30 },
            end: { x, y: height - 30 },
            thickness: 0.5,
            color: rgb(0.9, 0.92, 0.95),
          });
        }
      } else if (type === "dots") {
        const step = 22;
        for (let y = 35; y < height - 35; y += step) {
          for (let x = 35; x < width - 35; x += step) {
            newPage.drawCircle({
              x,
              y,
              size: 0.8,
              color: rgb(0.75, 0.8, 0.86),
            });
          }
        }
      }

      // 5. Save current page annotations to localStorage before shifting
      localStorage.setItem(`lammah_annot_${documentTitle}_p${currentPage}`, JSON.stringify(pageStrokes));
      localStorage.setItem(`lammah_textnotes_${documentTitle}_p${currentPage}`, JSON.stringify(pageTextNotes));

      // 6. Save modified PDF and reload fresh PDFDocument
      const newBytes = await masterPdfDoc.save();
      const reloadedDoc = await PDFDocument.load(newBytes, { ignoreEncryption: true });
      pdfRawBytesRef.current = newBytes.buffer as ArrayBuffer;
      setMasterPdfDoc(reloadedDoc);

      // 7. Shift localStorage annotations and text notes for pages >= insertIndex + 1
      const oldTotal = totalPages;
      const newTotal = reloadedDoc.getPageCount();

      for (let p = oldTotal; p >= insertIndex + 1; p--) {
        const annotKeyOld = `lammah_annot_${documentTitle}_p${p}`;
        const annotKeyNew = `lammah_annot_${documentTitle}_p${p + 1}`;
        const savedAnnot = localStorage.getItem(annotKeyOld);
        if (savedAnnot) {
          localStorage.setItem(annotKeyNew, savedAnnot);
          localStorage.removeItem(annotKeyOld);
        }

        const textKeyOld = `lammah_textnotes_${documentTitle}_p${p}`;
        const textKeyNew = `lammah_textnotes_${documentTitle}_p${p + 1}`;
        const savedText = localStorage.getItem(textKeyOld);
        if (savedText) {
          localStorage.setItem(textKeyNew, savedText);
          localStorage.removeItem(textKeyOld);
        }
      }

      // Clear notes on the new page
      localStorage.removeItem(`lammah_annot_${documentTitle}_p${insertIndex + 1}`);
      localStorage.removeItem(`lammah_textnotes_${documentTitle}_p${insertIndex + 1}`);

      // Shift pins
      setDocumentPins((prevPins) => {
        const newPins: Record<number, PagePin> = {};
        for (const [pgStr, pin] of Object.entries(prevPins)) {
          const pg = Number(pgStr);
          if (pg >= insertIndex + 1) {
            newPins[pg + 1] = { ...pin, pageNumber: pg + 1 };
          } else {
            newPins[pg] = pin;
          }
        }
        const storageKey = `lammah_pins_${documentTitle}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPins));
        } catch {}
        return newPins;
      });

      // 8. Clear blob cache & singlePageUrl
      pageBlobCacheRef.current.clear();
      setSinglePageUrl(null);

      // 9. Update page counts and navigate
      onTotalPagesChange(newTotal);
      const targetPage = insertIndex + 1;
      onPageChange(targetPage);

      setIsAddPageModalOpen(false);
      setBlankPageAddedToast("تمت إضافة الصفحة بنجاح! 📄");
      setTimeout(() => setBlankPageAddedToast(null), 3000);

    } catch (err) {
      console.error("Failed to insert blank page:", err);
      alert("حدث خطأ أثناء إضافة الصفحة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Feature 11: Delete Current Page
  const handleDeleteCurrentPage = async () => {
    if (!masterPdfDoc || totalPages <= 1) {
      alert("لا يمكن حذف الصفحة الوحيدة في الملف.");
      return;
    }

    try {
      setLoading(true);
      const pageIndexToDelete = currentPage - 1;

      // Remove the page
      masterPdfDoc.removePage(pageIndexToDelete);

      // Save modified PDF and reload
      const newBytes = await masterPdfDoc.save();
      const reloadedDoc = await PDFDocument.load(newBytes, { ignoreEncryption: true });
      pdfRawBytesRef.current = newBytes.buffer as ArrayBuffer;
      setMasterPdfDoc(reloadedDoc);

      // Clean up storage for deleted page
      localStorage.removeItem(`lammah_annot_${documentTitle}_p${currentPage}`);
      localStorage.removeItem(`lammah_textnotes_${documentTitle}_p${currentPage}`);

      // Shift remaining pages backwards by 1
      for (let p = currentPage + 1; p <= totalPages; p++) {
        const annotKeyOld = `lammah_annot_${documentTitle}_p${p}`;
        const annotKeyNew = `lammah_annot_${documentTitle}_p${p - 1}`;
        const savedAnnot = localStorage.getItem(annotKeyOld);
        if (savedAnnot) {
          localStorage.setItem(annotKeyNew, savedAnnot);
          localStorage.removeItem(annotKeyOld);
        }

        const textKeyOld = `lammah_textnotes_${documentTitle}_p${p}`;
        const textKeyNew = `lammah_textnotes_${documentTitle}_p${p - 1}`;
        const savedText = localStorage.getItem(textKeyOld);
        if (savedText) {
          localStorage.setItem(textKeyNew, savedText);
          localStorage.removeItem(textKeyOld);
        }
      }

      // Shift pins
      setDocumentPins((prevPins) => {
        const newPins: Record<number, PagePin> = {};
        for (const [pgStr, pin] of Object.entries(prevPins)) {
          const pg = Number(pgStr);
          if (pg === currentPage) {
            continue;
          } else if (pg > currentPage) {
            newPins[pg - 1] = { ...pin, pageNumber: pg - 1 };
          } else {
            newPins[pg] = pin;
          }
        }
        const storageKey = `lammah_pins_${documentTitle}`;
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPins));
        } catch {}
        return newPins;
      });

      // Clear cache
      pageBlobCacheRef.current.clear();
      setSinglePageUrl(null);

      // Determine target page
      const newTotal = reloadedDoc.getPageCount();
      onTotalPagesChange(newTotal);
      const targetPage = Math.min(currentPage, newTotal);
      onPageChange(targetPage);

      setIsDeletePageModalOpen(false);
      setBlankPageAddedToast("تم حذف الصفحة بنجاح 🗑️");
      setTimeout(() => setBlankPageAddedToast(null), 3000);

    } catch (err) {
      console.error("Failed to delete page:", err);
      alert("حدث خطأ أثناء حذف الصفحة.");
    } finally {
      setLoading(false);
    }
  };

  const notesOnCurrentPage = pageNotesCountMap[currentPage] || 0;

  // Active rendering URL: single page slice if available, or direct fallback
  const activeDocumentUrl = singlePageUrl 
    ? `${singlePageUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit` 
    : directMasterUrl 
    ? `${directMasterUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0&view=Fit` 
    : null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full flex flex-col items-center select-none"
      dir="rtl"
    >
      {/* ── World-Class Clean Floating Master Dock ── */}
      <div className="relative w-full max-w-5xl flex flex-col items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-3 z-50 px-1 sm:px-0">
        
        {/* ── MOBILE SPECIFIC 2-TIER CLEAN FLOATING DOCK (sm:hidden) ── */}
        <div className="flex sm:hidden flex-col items-center gap-1.5 w-full max-w-sm px-1 z-50">
          
          {/* Mobile Tier 1: Page Navigation & Study Aids Capsule */}
          <div className="relative z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-md px-2 py-1 flex items-center justify-between gap-1 select-none">
            
            {/* Page Navigation */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 rounded-xl p-0.5 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => (isExamNightMode ? handleExamNightPrev() : onPageChange(Math.max(1, currentPage - 1)))}
                disabled={(isExamNightMode ? pinnedPages.length === 0 : currentPage <= 1) || loading}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-25 transition cursor-pointer"
                title="الصفحة السابقة"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPageDrawerOpen(!isPageDrawerOpen)}
                className="px-2 py-0.5 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer"
                title="فهرس الصفحات"
              >
                <span>{currentPage}</span>
                <span className="text-slate-400 font-normal">/</span>
                <span className="text-slate-500">{totalPages || 1}</span>
                <Grid className="w-3 h-3 text-slate-400 mr-0.5" />
              </button>

              <button
                type="button"
                onClick={() => (isExamNightMode ? handleExamNightNext() : onPageChange(Math.min(totalPages, currentPage + 1)))}
                disabled={(isExamNightMode ? pinnedPages.length === 0 : currentPage >= totalPages) || loading}
                className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-25 transition cursor-pointer"
                title="الصفحة التالية"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pomodoro Focus Timer Chip */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 rounded-xl px-2 py-1 gap-1 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setIsPomodoroActive(!isPomodoroActive)}
                className="flex items-center gap-1 text-slate-700 dark:text-slate-200 cursor-pointer"
                title={isPomodoroActive ? "إيقاف مؤقت" : "بدء مؤقت التركيز"}
              >
                <Timer className={`w-3.5 h-3.5 ${isPomodoroActive ? "text-amber-500 animate-pulse" : "text-slate-500"}`} />
                <span className="font-mono font-bold text-[11px]">{formatTimer(pomodoroSeconds)}</span>
              </button>
              {isPomodoroActive && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPomodoroActive(false);
                    setPomodoroSeconds(25 * 60);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                  title="إعادة ضبط"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Bookmark & More Options */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Bookmark */}
              <button
                type="button"
                onClick={() => {
                  setPinModalTab(documentPins[currentPage] ? "current" : "all");
                  setIsPinModalOpen(true);
                }}
                className={`relative p-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                  documentPins[currentPage]
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="تثبيت الشريحة"
              >
                <Bookmark className={`w-3.5 h-3.5 ${documentPins[currentPage] ? "fill-current text-rose-500" : ""}`} />
                {pinnedPages.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {pinnedPages.length}
                  </span>
                )}
              </button>

              {/* Mobile More Study Tools Menu (•••) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMobileMoreToolsOpen(!isMobileMoreToolsOpen)}
                  className={`p-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                    isMobileMoreToolsOpen
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title="المزيد من الأدوات"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* More Tools Dropdown Card */}
                <AnimatePresence>
                  {isMobileMoreToolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      data-lammah-dropdown="true"
                      className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-[99999] flex flex-col gap-1 text-xs"
                    >
                      {/* Little pointer triangle directly under the [...] button */}
                      <div className="absolute -top-1.5 left-3.5 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-800 rotate-45 pointer-events-none" />

                      <div className="px-2.5 py-1 text-[11px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-0.5">
                        <span>أدوات إضافية</span>
                        <span className="text-[10px] text-slate-400 font-normal">ص {currentPage}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddPageModalOpen(true);
                          setIsMobileMoreToolsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold transition text-right cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة صفحة جديدة</span>
                      </button>

                      {totalPages > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDeletePageModalOpen(true);
                            setIsMobileMoreToolsOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-bold transition text-right cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف الصفحة الحالية</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsExamNightMode(!isExamNightMode);
                          setIsMobileMoreToolsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 font-bold transition text-right cursor-pointer"
                      >
                        <Flame className="w-4 h-4" />
                        <span>{isExamNightMode ? "إنهاء وضع الامتحان" : "وضع ليلة الامتحان 🔥"}</span>
                      </button>

                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

                      {pageStrokes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUndoStroke();
                            setIsMobileMoreToolsOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition text-right cursor-pointer"
                        >
                          <Undo2 className="w-4 h-4 text-slate-500" />
                          <span>تراجع عن آخر رسم</span>
                        </button>
                      )}

                      {(pageStrokes.length > 0 || pageTextNotes.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("هل تريد مسح جميع التظليلات والنصوص والملاحظات من هذه الصفحة؟")) {
                              saveStrokes([]);
                              saveTextNotes([]);
                            }
                            setIsMobileMoreToolsOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 font-bold transition text-right cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>مسح كل تخطيطات الصفحة</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE BOTTOM FLOATING ANNOTATION DOCK (sm:hidden) ── */}
        <AnimatePresence>
          {!isMobileDockCollapsed ? (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-3 inset-x-2 z-40 sm:hidden max-w-sm mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl px-2 py-1.5 flex items-center justify-between gap-1 select-none"
            >
              {/* Browse / Pan */}
              <button
                type="button"
                onClick={() => handleSelectTool("browse")}
                className={`p-1.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  activeTool === "browse" && selectedNoteId === null
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="تصفح وقراءة"
              >
                <Hand className="w-4 h-4" />
              </button>

              {/* Smart Highlighter */}
              <button
                type="button"
                onClick={() => handleSelectTool("highlighter")}
                className={`p-1.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  activeTool === "highlighter" && selectedNoteId === null
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="تظليل ذكي"
              >
                <Highlighter className="w-4 h-4" />
              </button>

              {/* Pen Tool */}
              <button
                type="button"
                onClick={() => handleSelectTool("pen")}
                className={`p-1.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  activeTool === "pen" && selectedNoteId === null
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="قلم كتابة ورسم"
              >
                <PenTool className="w-4 h-4" />
              </button>

              {/* Plain Freeform Text (Word / Canva style) */}
              <button
                type="button"
                onClick={() => {
                  const currentSelected = pageTextNotes.find(n => n.id === selectedNoteId);
                  if (selectedNoteId && currentSelected?.noteType === "plain_text") {
                    setSelectedNoteId(null);
                    setActiveTool("browse");
                  } else {
                    setActiveTool("plain_text");
                    const plainNotes = pageTextNotes.filter(n => n.noteType === "plain_text");
                    if (plainNotes.length > 0) {
                      setSelectedNoteId(plainNotes[plainNotes.length - 1].id);
                    } else {
                      handleAddNewPlainTextAtCenter();
                    }
                  }
                }}
                className={`p-1.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  activeTool === "plain_text" || (selectedNoteId !== null && pageTextNotes.find(n => n.id === selectedNoteId)?.noteType === "plain_text")
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="نص حر"
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Sticky Note / Memo Card */}
              <button
                type="button"
                onClick={() => {
                  const currentSelected = pageTextNotes.find(n => n.id === selectedNoteId);
                  if (selectedNoteId && currentSelected?.noteType !== "plain_text") {
                    setSelectedNoteId(null);
                    setIsFontMenuOpen(false);
                    setActiveTool("browse");
                  } else {
                    const stickerNotes = pageTextNotes.filter(n => n.noteType !== "plain_text");
                    if (stickerNotes.length > 0) {
                      setSelectedNoteId(stickerNotes[stickerNotes.length - 1].id);
                      setActiveTool("text");
                    } else {
                      handleAddNewNoteAtCenter();
                    }
                  }
                }}
                className={`p-1.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  activeTool === "text" || (selectedNoteId !== null && pageTextNotes.find(n => n.id === selectedNoteId)?.noteType !== "plain_text")
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="ستيكر ملاحظات"
              >
                <StickyNote className="w-4 h-4" />
              </button>

              {/* Active Recall Tape */}
              <button
                type="button"
                onClick={() => handleSelectTool("tape")}
                className={`p-1.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  activeTool === "tape"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="شريط حجب"
              >
                <EyeOff className="w-4 h-4" />
              </button>

              {/* Eraser */}
              <button
                type="button"
                onClick={() => handleSelectTool("eraser")}
                className={`p-1.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                  activeTool === "eraser"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="ممحاة"
              >
                <Eraser className="w-4 h-4" />
              </button>

              {/* Direct PDF Export */}
              <button
                type="button"
                onClick={handleExportAnnotatedPdf}
                disabled={isExportingPdf}
                className="px-2 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 transition cursor-pointer shrink-0 disabled:opacity-50"
                title="تنزيل الملف الحالي مع كافة التخطيطات والملاحظات"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>تصدير</span>
              </button>

              {/* Collapse Button (Distraction-Free) */}
              <button
                type="button"
                onClick={() => setIsMobileDockCollapsed(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
                title="إخفاء شريط الأدوات مؤقتاً للقراءة"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              type="button"
              onClick={() => setIsMobileDockCollapsed(false)}
              className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl flex items-center justify-center sm:hidden cursor-pointer"
              title="إظهار أدوات التخطيط"
            >
              <PenTool className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── DESKTOP UNIFIED MASTER DOCK (hidden sm:flex) ── */}
        <div className="lammah-main-toolbar hidden sm:flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl px-2.5 sm:px-3 py-1.5 items-center justify-center gap-1.5 sm:gap-2 select-none">
          
          {/* 1. Page Navigation Capsule */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 rounded-xl p-0.5 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <button
              type="button"
              onClick={() => (isExamNightMode ? handleExamNightPrev() : onPageChange(Math.max(1, currentPage - 1)))}
              disabled={(isExamNightMode ? pinnedPages.length === 0 : currentPage <= 1) || loading}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-25 transition cursor-pointer"
              title={isExamNightMode ? "الشريحة المثبتة السابقة" : "الصفحة السابقة"}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsPageDrawerOpen(!isPageDrawerOpen)}
              className="px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 hover:text-indigo-600 transition cursor-pointer"
              title="فهرس الصفحات والتنقل السريع"
            >
              <span>{currentPage}</span>
              <span className="text-slate-400 font-normal">/</span>
              <span className="text-slate-500">{totalPages || 1}</span>
              <Grid className="w-3 h-3 text-slate-400 mr-0.5" />
            </button>

            <button
              type="button"
              onClick={() => (isExamNightMode ? handleExamNightNext() : onPageChange(Math.min(totalPages, currentPage + 1)))}
              disabled={(isExamNightMode ? pinnedPages.length === 0 : currentPage >= totalPages) || loading}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-25 transition cursor-pointer"
              title={isExamNightMode ? "الشريحة المثبتة التالية" : "الصفحة التالية"}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Add Blank / Ruled Page Button */}
            <button
              type="button"
              onClick={() => setIsAddPageModalOpen(true)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition cursor-pointer flex items-center gap-1 border-r border-slate-200/60 dark:border-slate-700/60 pr-1.5 mr-0.5"
              title="إضافة صفحة جديدة (فارغة / مسطرة / شبكة)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold hidden md:inline">صفحة جديدة</span>
            </button>

            {/* Delete Current Page Button (if more than 1 page) */}
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setIsDeletePageModalOpen(true)}
                className="p-1 sm:p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                title="حذف الصفحة الحالية"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />

          {/* 2. Core Canvas Tools (Icon-only, uniform active state, no rainbow clutter) */}
          <div className="flex items-center gap-0.5">
            {/* Browse / Pan */}
            <button
              type="button"
              onClick={() => handleSelectTool("browse")}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                activeTool === "browse" && selectedNoteId === null
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="تصفح وقراءة (تحريك الصفحة)"
            >
              <Hand className="w-4 h-4" />
            </button>

            {/* Smart Highlighter */}
            <button
              type="button"
              onClick={() => handleSelectTool("highlighter")}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                activeTool === "highlighter" && selectedNoteId === null
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="تظليل وهايلايتر ذكي"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            {/* Pen Tool */}
            <button
              type="button"
              onClick={() => handleSelectTool("pen")}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                activeTool === "pen" && selectedNoteId === null
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="قلم كتابة ورسم وتخطيط"
            >
              <PenTool className="w-4 h-4" />
            </button>

            {/* Plain Freeform Text (Word / Canva style) */}
            <button
              type="button"
              onClick={() => {
                const currentSelected = pageTextNotes.find(n => n.id === selectedNoteId);
                if (selectedNoteId && currentSelected?.noteType === "plain_text") {
                  setSelectedNoteId(null);
                  setActiveTool("browse");
                } else {
                  setActiveTool("plain_text");
                  const plainNotes = pageTextNotes.filter(n => n.noteType === "plain_text");
                  if (plainNotes.length > 0) {
                    setSelectedNoteId(plainNotes[plainNotes.length - 1].id);
                  } else {
                    handleAddNewPlainTextAtCenter();
                  }
                }
              }}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                activeTool === "plain_text" || (selectedNoteId !== null && pageTextNotes.find(n => n.id === selectedNoteId)?.noteType === "plain_text")
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="إضافة نص حر (خطوط وورد وكانفا، سُمك، تباعد أسطر، تظليل خلفية)"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Sticky Note / Memo Card */}
            <button
              type="button"
              onClick={() => {
                const currentSelected = pageTextNotes.find(n => n.id === selectedNoteId);
                if (selectedNoteId && currentSelected?.noteType !== "plain_text") {
                  setSelectedNoteId(null);
                  setIsFontMenuOpen(false);
                  setActiveTool("browse");
                } else {
                  const stickerNotes = pageTextNotes.filter(n => n.noteType !== "plain_text");
                  if (stickerNotes.length > 0) {
                    setSelectedNoteId(stickerNotes[stickerNotes.length - 1].id);
                    setActiveTool("text");
                  } else {
                    handleAddNewNoteAtCenter();
                  }
                }
              }}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                activeTool === "text" || (selectedNoteId !== null && pageTextNotes.find(n => n.id === selectedNoteId)?.noteType !== "plain_text")
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="ستيكر وبطاقة ملاحظات ملونة أو صوتية"
            >
              <StickyNote className="w-4 h-4" />
            </button>

            {/* Active Recall Tape */}
            <button
              type="button"
              onClick={() => handleSelectTool("tape")}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                activeTool === "tape"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="شريط حجب وإخفاء للاختبار الذاتي"
            >
              <EyeOff className="w-4 h-4" />
            </button>

            {/* Eraser */}
            <button
              type="button"
              onClick={() => handleSelectTool("eraser")}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                activeTool === "eraser"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="ممحاة التخطيطات"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* 3. Study Aids Group (Badges, Pin, Exam Mode, Focus Timer) */}
          <div className="flex items-center gap-1">


            {/* Pin / Bookmark */}
            <button
              type="button"
              onClick={() => {
                setPinModalTab(documentPins[currentPage] ? "current" : "all");
                setIsPinModalOpen(true);
              }}
              className={`relative p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                documentPins[currentPage]
                  ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={documentPins[currentPage] ? `شريحة مثبتة: ${documentPins[currentPage].title} (انقر للتعديل أو عرض الكل)` : "تثبيت هذه الشريحة / عرض الدبابيس"}
            >
              <Bookmark className={`w-4 h-4 ${documentPins[currentPage] ? "fill-current" : ""}`} />
              {pinnedPages.length > 0 && (
                <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {pinnedPages.length}
                </span>
              )}
            </button>

            {/* Exam Night Mode Switch */}
            <button
              type="button"
              onClick={() => setIsExamNightMode(!isExamNightMode)}
              className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                isExamNightMode
                  ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="وضع ليلة الامتحان: تصفح الشرائح المثبتة للامتحان فقط"
            >
              <Flame className={`w-4 h-4 ${isExamNightMode ? "text-amber-500 fill-amber-500/30" : ""}`} />
            </button>

            {/* Compact Pomodoro Focus Timer */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 rounded-xl px-2 py-1 gap-1 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setIsPomodoroActive(!isPomodoroActive)}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title={isPomodoroActive ? "إيقاف مؤقت للتركيز" : "بدء مؤقت التركيز (25 دقيقة)"}
              >
                <Timer className={`w-3.5 h-3.5 ${isPomodoroActive ? "text-amber-500 animate-pulse" : ""}`} />
                <span className="font-mono font-bold text-[11px]">{formatTimer(pomodoroSeconds)}</span>
              </button>
              {isPomodoroActive && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPomodoroActive(false);
                    setPomodoroSeconds(25 * 60);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                  title="إعادة ضبط المؤقت"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* 4. Document Actions & Export */}
          <div className="flex items-center gap-1 shrink-0">
            {pageStrokes.length > 0 && (
              <button
                type="button"
                onClick={handleUndoStroke}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="تراجع عن آخر خطوة"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}

            {(pageStrokes.length > 0 || pageTextNotes.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("هل تريد مسح جميع التظليلات والنصوص والملاحظات من هذه الصفحة؟")) {
                    saveStrokes([]);
                    saveTextNotes([]);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                title="مسح كل تخطيطات الصفحة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Direct PDF Export */}
            <button
              type="button"
              onClick={handleExportAnnotatedPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="تنزيل الملف الحالي مع كافة التخطيطات والملاحظات"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? "جارٍ التصدير..." : "تصدير"}</span>
            </button>
          </div>

        </div>

        {/* Feature 7: Floating Exam Night Status Banner */}
        <AnimatePresence>
          {isExamNightMode && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white rounded-2xl p-2.5 px-4 shadow-xl flex items-center justify-between gap-3 text-xs z-25 flex-wrap sm:flex-nowrap"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-200 animate-bounce shrink-0" />
                <span className="font-black text-xs sm:text-sm">وضع ليلة الامتحان نشط ⚡:</span>
                <span className="text-amber-100 text-xs">
                  {pinnedPages.length > 0
                    ? `تتنقل الآن بين ${pinnedPages.length} شريحة ذات أولوية قصوى!`
                    : "لم تقم بتثبيت أي شريحة بعد، اضغط على 📌 لتثبيت الشرائح المهمة"}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 mr-auto flex-wrap">
                {pinnedPages.length > 0 && (
                  <>
                    <div className="flex items-center gap-1 bg-black/20 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={handleExamNightPrev}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="الشريحة المثبتة السابقة"
                      >
                        ◀
                      </button>
                      <span className="px-1.5 font-mono text-[11px] font-bold">
                        {pinnedPages.indexOf(currentPage) !== -1 ? `${pinnedPages.indexOf(currentPage) + 1}/${pinnedPages.length}` : `خارج`}
                      </span>
                      <button
                        type="button"
                        onClick={handleExamNightNext}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="الشريحة المثبتة التالية"
                      >
                        ▶
                      </button>
                    </div>

                    {/* Direct Quick Jump Chips for all pins */}
                    <div className="flex items-center gap-1 max-w-[260px] overflow-x-auto no-scrollbar py-0.5">
                      {pinnedPages.map((p) => {
                        const pin = documentPins[p];
                        const isCur = p === currentPage;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                              isCur
                                ? "bg-white text-slate-900 shadow-md ring-1 ring-black/20"
                                : "bg-black/25 text-white hover:bg-black/40"
                            }`}
                            title={pin ? `${pin.title} (ص ${p})` : `شريحة ${p}`}
                          >
                            <span>{pin?.icon || "📌"}</span>
                            <span>ص {p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsExamNightMode(false)}
                  className="px-2.5 py-1 bg-white text-slate-900 hover:bg-amber-100 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  إنهاء الوضع
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Contextual Secondary Inspector Ribbon (Organized Segmented Cards) ── */}
        <AnimatePresence>
          {((activeTool !== "browse" && activeTool !== "eraser" && activeTool !== "text") || selectedNoteId !== null) && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.18 }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              data-lammah-dropdown="true"
              className="lammah-inspector-ribbon w-full max-w-full overflow-x-auto scrollbar-none touch-pan-x bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-start sm:justify-center gap-2 sm:gap-4 flex-nowrap sm:flex-wrap text-xs relative z-50"
            >
              
              {/* ── HIGHLIGHTER INSPECTOR ── */}
              {activeTool === "highlighter" && !selectedNoteId && (
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                  
                  {/* Group 1: Color Palette */}
                  <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">الألوان:</span>
                    {HIGHLIGHTER_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedHighlightColor(c.value)}
                        style={{ backgroundColor: c.value, borderColor: c.border }}
                        className={`w-4 h-4 rounded-full border transition transform hover:scale-115 cursor-pointer flex items-center justify-center ${
                          selectedHighlightColor === c.value ? "scale-115 ring-2 ring-amber-400 shadow-xs" : "opacity-80"
                        }`}
                        title={c.name}
                      >
                        {selectedHighlightColor === c.value && <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />}
                      </button>
                    ))}
                  </div>

                  {/* Group 2: Shape / Style */}
                  <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    {[
                      { id: "freehand", name: "حر", icon: Spline },
                      { id: "line", name: "سطر", icon: Minus },
                      { id: "rect", name: "مستطيل", icon: Square },
                      { id: "circle", name: "دائرة", icon: Circle },
                    ].map((sh) => {
                      const Icon = sh.icon;
                      return (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => setActiveShape(sh.id as AnnotationShape)}
                          className={`p-1 px-2 rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 ${
                            activeShape === sh.id
                              ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 font-black shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                          }`}
                          title={sh.name}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{sh.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Group 3: Stroke Width */}
                  <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 px-1">السمك:</span>
                    {[
                      { id: 10, name: "رفيع" },
                      { id: 16, name: "عادي" },
                      { id: 24, name: "عريض" },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setActiveHighlighterWidth(w.id)}
                        className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          activeHighlighterWidth === w.id
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>

                  {/* Feature 8: Geometric Shape Auto-Snapping Toggle */}
                  <button
                    type="button"
                    onClick={() => setAutoSnapShapes(!autoSnapShapes)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                      autoSnapShapes
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20"
                        : "bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/50 text-slate-500 hover:text-slate-800"
                    }`}
                    title="تنعيم هندسي ذكي: يصحح الخطوط والدوائر والمستطيلات المتعرجة تلقائياً عند الرسم الحر"
                  >
                    <Sparkles className={`w-3 h-3 ${autoSnapShapes ? "text-amber-500" : "text-slate-400"}`} />
                    <span>تنعيم ذكي</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${autoSnapShapes ? "bg-emerald-500" : "bg-slate-300"}`} />
                  </button>

                </div>
              )}

              {/* ── PEN INSPECTOR ── */}
              {activeTool === "pen" && !selectedNoteId && (
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                  
                  {/* Group 1: Ink Palette */}
                  <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">الحبر:</span>
                    {PEN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedPenColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-4 h-4 rounded-full transition transform hover:scale-115 cursor-pointer flex items-center justify-center ${
                          selectedPenColor === c.value ? "scale-115 ring-2 ring-indigo-500 shadow-xs" : "opacity-80"
                        }`}
                        title={c.name}
                      >
                        {selectedPenColor === c.value && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>

                  {/* Group 2: Shape / Style */}
                  <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    {[
                      { id: "freehand", name: "حر", icon: Spline },
                      { id: "line", name: "خط", icon: Minus },
                      { id: "arrow", name: "سهم", icon: ArrowUpRight },
                      { id: "rect", name: "مستطيل", icon: Square },
                      { id: "circle", name: "دائرة", icon: Circle },
                    ].map((sh) => {
                      const Icon = sh.icon;
                      return (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => setActiveShape(sh.id as AnnotationShape)}
                          className={`p-1 px-2 rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1 ${
                            activeShape === sh.id
                              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-black shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                          }`}
                          title={sh.name}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{sh.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Group 3: Stroke Width */}
                  <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 px-1">السمك:</span>
                    {[
                      { id: 2, name: "رفيع" },
                      { id: 3.5, name: "متوسط" },
                      { id: 5.5, name: "عريض" },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setActivePenWidth(w.id)}
                        className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          activePenWidth === w.id
                            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>

                  {/* Feature 8: Geometric Shape Auto-Snapping Toggle */}
                  <button
                    type="button"
                    onClick={() => setAutoSnapShapes(!autoSnapShapes)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                      autoSnapShapes
                        ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500/20"
                        : "bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/50 text-slate-500 hover:text-slate-800"
                    }`}
                    title="تنعيم هندسي ذكي: يصحح الخطوط والدوائر والمستطيلات المتعرجة تلقائياً عند الرسم الحر"
                  >
                    <Sparkles className={`w-3 h-3 ${autoSnapShapes ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    <span>تنعيم ذكي</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${autoSnapShapes ? "bg-emerald-500" : "bg-slate-300"}`} />
                  </button>

                </div>
              )}

              {/* ── STICKY NOTES & TEXT TOP INSPECTOR (All Sticker Options at Top) ── */}
              {selectedNoteId !== null && (() => {
                const activeNote = pageTextNotes.find((n) => n.id === selectedNoteId);
                if (!activeNote) return null;

                // ── CANVA & WORD STYLE PLAIN TEXT INSPECTOR ──
                if (activeNote.noteType === "plain_text") {
                  const currentFontObj = TYPOGRAPHY_FONTS.find(f => f.id === activeNote.fontFamily) || TYPOGRAPHY_FONTS[0];
                  const currentWeightObj = FONT_WEIGHTS.find(w => w.id === (activeNote.fontWeight || "600")) || FONT_WEIGHTS[2];
                  const currentSpacingObj = LINE_SPACINGS.find(s => s.value === (activeNote.lineHeight || 1.4)) || LINE_SPACINGS[1];
                  const currentFontSize = activeNote.fontSize || 18;
                  const currentAlign = activeNote.textAlign || "right";

                  return (
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center relative select-none">
                      {/* 1. Add New Plain Text */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddNewPlainTextAtCenter();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition shadow-xs cursor-pointer shrink-0"
                        title="إدراج نص حر جديد"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ نص جديد</span>
                      </button>

                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                      {/* 2. Font Family Dropdown */}
                      <div className="relative lammah-font-menu" data-lammah-dropdown="true">
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFontMenuOpen(!isFontMenuOpen);
                            setIsFontSizeMenuOpen(false);
                            setIsWeightMenuOpen(false);
                            setIsLineHeightMenuOpen(false);
                            setIsBgColorMenuOpen(false);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 hover:bg-slate-200/80 cursor-pointer"
                          title="اختيار نوع الخط (كانفا ووورد)"
                        >
                          <span style={{ fontFamily: currentFontObj.fontFamily }} className="text-xs font-black truncate max-w-[125px]">
                            {currentFontObj.name.replace(/\(.*?\)/, '').trim()}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isFontMenuOpen ? "rotate-180 text-emerald-600" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isFontMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.96 }}
                              onPointerDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              data-lammah-dropdown="true"
                              className="lammah-font-menu absolute top-full right-0 mt-2 w-72 sm:w-80 max-h-[380px] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[9999] flex flex-col gap-1 ring-1 ring-black/10"
                            >
                              <div className="px-2.5 py-1.5 text-[11px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                                <span>مكتبة الخطوط المتنوعة (17 خطاً بأنماط متباينة)</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Canva Pro</span>
                              </div>
                              {TYPOGRAPHY_FONTS.map((f) => {
                                const isSelected = activeNote.fontFamily === f.id;
                                return (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateTextNote(activeNote.id, { fontFamily: f.id });
                                      setActiveTypographyFont(f.id);
                                      setIsFontMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition cursor-pointer text-right group ${
                                      isSelected
                                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                                    }`}
                                  >
                                    <div className="flex flex-col items-start text-right w-full gap-0.5">
                                      <div className="flex items-center justify-between w-full">
                                        <span
                                          style={{ fontFamily: f.fontFamily }}
                                          className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors"
                                        >
                                          {f.name}
                                        </span>
                                        {f.tag && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                                            {f.tag}
                                          </span>
                                        )}
                                      </div>
                                      <span
                                        style={{ fontFamily: f.fontFamily }}
                                        className="text-xs text-slate-500 dark:text-slate-400 font-normal tracking-wide mt-0.5 truncate max-w-[240px]"
                                      >
                                        {f.sample}
                                      </span>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 mr-1.5" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 3. Font Weight Dropdown */}
                      <div className="relative lammah-font-menu" data-lammah-dropdown="true">
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsWeightMenuOpen(!isWeightMenuOpen);
                            setIsFontMenuOpen(false);
                            setIsFontSizeMenuOpen(false);
                            setIsLineHeightMenuOpen(false);
                            setIsBgColorMenuOpen(false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 hover:bg-slate-200/80 cursor-pointer"
                          title="سمك الخط (Font Weight)"
                        >
                          <Bold className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-bold">{currentWeightObj.name}</span>
                          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isWeightMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isWeightMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.96 }}
                              onPointerDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              data-lammah-dropdown="true"
                              className="lammah-font-menu absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-[9999] flex flex-col gap-1 ring-1 ring-black/10"
                            >
                              <div className="px-2 py-1 text-[11px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-0.5">
                                سمك الخط (Thickness)
                              </div>
                              {FONT_WEIGHTS.map((w) => {
                                const isSelected = (activeNote.fontWeight || "600") === w.id;
                                return (
                                  <button
                                    key={w.id}
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateTextNote(activeNote.id, { fontWeight: w.id });
                                      setActiveFontWeight(w.id);
                                      setIsWeightMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer text-right ${
                                      isSelected
                                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                  >
                                    <span style={{ fontWeight: Number(w.id) }}>{w.name}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 4. Font Size Controls & Dropdown Menu */}
                      <div className="relative lammah-font-menu" data-lammah-dropdown="true">
                        <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 px-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                          {/* Decrement Button */}
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              const step = currentFontSize > 36 ? 4 : currentFontSize > 20 ? 2 : 1;
                              const nextSize = Math.max(6, currentFontSize - step);
                              updateTextNote(activeNote.id, { fontSize: nextSize });
                              setActiveFontSize(nextSize);
                            }}
                            className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="تصغير حجم الخط (-)"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          {/* Font Size Display & Menu Trigger */}
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFontSizeMenuOpen(!isFontSizeMenuOpen);
                              setIsFontMenuOpen(false);
                              setIsWeightMenuOpen(false);
                              setIsLineHeightMenuOpen(false);
                              setIsBgColorMenuOpen(false);
                            }}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition cursor-pointer"
                            title="عرض واختيار جميع أحجام الخط"
                          >
                            <span className="text-xs font-black min-w-[28px] text-center">{currentFontSize}px</span>
                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isFontSizeMenuOpen ? "rotate-180 text-emerald-600" : ""}`} />
                          </button>

                          {/* Increment Button */}
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              const step = currentFontSize >= 36 ? 4 : currentFontSize >= 20 ? 2 : 1;
                              const nextSize = Math.min(200, currentFontSize + step);
                              updateTextNote(activeNote.id, { fontSize: nextSize });
                              setActiveFontSize(nextSize);
                            }}
                            className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="تكبير حجم الخط (+)"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Font Sizes Dropdown */}
                        <AnimatePresence>
                          {isFontSizeMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.96 }}
                              onPointerDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              data-lammah-dropdown="true"
                              className="lammah-font-menu absolute top-full right-0 mt-2 w-56 max-h-[390px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[9999] flex flex-col gap-1.5 ring-1 ring-black/10 overflow-hidden"
                            >
                              <div className="px-2 py-1 text-[11px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span>جميع أحجام الخط</span>
                                <span className="text-[10px] text-emerald-600 font-bold">Canva / Word</span>
                              </div>

                              {/* Custom size input */}
                              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">حجم يدوي:</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={6}
                                    max={200}
                                    value={currentFontSize}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      if (!isNaN(val) && val >= 6 && val <= 200) {
                                        updateTextNote(activeNote.id, { fontSize: val });
                                        setActiveFontSize(val);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        setIsFontSizeMenuOpen(false);
                                      }
                                    }}
                                    className="w-16 px-1.5 py-0.5 text-center text-xs font-black bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                  <span className="text-[11px] font-bold text-slate-400">px</span>
                                </div>
                              </div>

                              {/* Comprehensive Font Sizes List */}
                              <div className="overflow-y-auto max-h-[250px] flex flex-col gap-0.5 pr-0.5">
                                {AVAILABLE_FONT_SIZES.map((sz) => {
                                  const isSelected = currentFontSize === sz;
                                  let label = "";
                                  if (sz <= 10) label = "دقيق";
                                  else if (sz === 16) label = "افتراضي";
                                  else if (sz === 24) label = "عنوان فرعي";
                                  else if (sz === 36) label = "عنوان رئيسي";
                                  else if (sz >= 72) label = "مانشيت";

                                  return (
                                    <button
                                      key={sz}
                                      type="button"
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateTextNote(activeNote.id, { fontSize: sz });
                                        setActiveFontSize(sz);
                                        setIsFontSizeMenuOpen(false);
                                      }}
                                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition cursor-pointer text-right ${
                                        isSelected
                                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black"
                                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs">{sz}px</span>
                                        {label && (
                                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                            sz === 16
                                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold"
                                              : sz >= 72
                                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold"
                                              : "text-slate-400 dark:text-slate-500"
                                          }`}>
                                            {label}
                                          </span>
                                        )}
                                      </div>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 5. Line Height / Spacing Dropdown */}
                      <div className="relative lammah-font-menu" data-lammah-dropdown="true">
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsLineHeightMenuOpen(!isLineHeightMenuOpen);
                            setIsFontMenuOpen(false);
                            setIsWeightMenuOpen(false);
                            setIsFontSizeMenuOpen(false);
                            setIsBgColorMenuOpen(false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 hover:bg-slate-200/80 cursor-pointer"
                          title="تباعد الأسطر (Line Spacing)"
                        >
                          <Baseline className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-xs font-bold">{currentSpacingObj.name.split(" ")[0]}</span>
                          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLineHeightMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isLineHeightMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.96 }}
                              onPointerDown={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                              data-lammah-dropdown="true"
                              className="lammah-font-menu absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-[9999] flex flex-col gap-1 ring-1 ring-black/10"
                            >
                              <div className="px-2 py-1 text-[11px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-0.5">
                                تباعد الأسطر (Line Spacing)
                              </div>
                              {LINE_SPACINGS.map((s) => {
                                const isSelected = (activeNote.lineHeight || 1.4) === s.value;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      updateTextNote(activeNote.id, { lineHeight: s.value });
                                      setActiveLineHeight(s.value);
                                      setIsLineHeightMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer text-right ${
                                      isSelected
                                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                  >
                                    <span>{s.name}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 6. Text Background & Highlight Color */}
                      <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] font-bold text-slate-400 ml-0.5 shrink-0">خلفية:</span>
                        {TEXT_BG_HIGHLIGHTS.map((bg) => {
                          const isSelected = (activeNote.textBgColor || "transparent") === bg.color;
                          return (
                            <button
                              key={bg.id}
                              type="button"
                              onClick={() => {
                                updateTextNote(activeNote.id, { textBgColor: bg.color });
                                setActiveTextBgColor(bg.color);
                              }}
                              style={{ backgroundColor: bg.color === "transparent" ? undefined : bg.color }}
                              className={`w-5 h-5 rounded-full transition transform hover:scale-125 cursor-pointer shrink-0 flex items-center justify-center ${
                                bg.color === "transparent" ? "border-2 border-dashed border-slate-400 dark:border-slate-500" : "border border-black/20"
                              } ${isSelected ? "ring-2 ring-emerald-500 scale-120 shadow-xs" : "opacity-80 hover:opacity-100"}`}
                              title={bg.name}
                            >
                              {isSelected && <Check className={`w-2.5 h-2.5 ${bg.color === "#0f172a" ? "text-white" : "text-slate-900"} stroke-[3]`} />}
                            </button>
                          );
                        })}
                      </div>

                      {/* 7. Text Color */}
                      <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[10px] font-bold text-slate-400 ml-0.5 shrink-0">النص:</span>
                        {[
                          { color: "#0F172A", name: "أسود داكن" },
                          { color: "#FFFFFF", name: "أبيض" },
                          { color: "#4F46E5", name: "أزرق كحلي" },
                          { color: "#E11D48", name: "أحمر قرمزي" },
                          { color: "#059669", name: "أخضر زمردي" },
                          { color: "#D97706", name: "عسلي ذهبي" },
                        ].map((tc) => {
                          const isSelected = (activeNote.color || "#0F172A") === tc.color;
                          return (
                            <button
                              key={tc.color}
                              type="button"
                              onClick={() => {
                                updateTextNote(activeNote.id, { color: tc.color });
                                setActiveTextColor(tc.color);
                              }}
                              style={{ backgroundColor: tc.color }}
                              className={`w-4 h-4 rounded-full border border-black/20 transition transform hover:scale-125 cursor-pointer shrink-0 flex items-center justify-center ${
                                isSelected ? "ring-2 ring-emerald-500 scale-120" : "opacity-75 hover:opacity-100"
                              }`}
                              title={tc.name}
                            >
                              {isSelected && <Check className={`w-2 h-2 ${tc.color === "#FFFFFF" ? "text-slate-900" : "text-white"} stroke-[3]`} />}
                            </button>
                          );
                        })}
                      </div>

                      {/* 8. Text Alignment */}
                      <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        {[
                          { align: "right" as const, icon: AlignRight, title: "محاذاة لليمين" },
                          { align: "center" as const, icon: AlignCenter, title: "محاذاة للوسط" },
                          { align: "left" as const, icon: AlignLeft, title: "محاذاة لليسار" },
                        ].map((a) => (
                          <button
                            key={a.align}
                            type="button"
                            onClick={() => {
                              updateTextNote(activeNote.id, { textAlign: a.align });
                              setActiveTextAlign(a.align);
                            }}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              currentAlign === a.align
                                ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-xs font-bold"
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                            title={a.title}
                          >
                            <a.icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>

                      {/* 9. Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteTextNote(activeNote.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white text-xs font-bold transition border border-rose-200 dark:border-rose-800/60 cursor-pointer"
                        title="حذف النص الحر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>

                      {/* 10. Done Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNoteId(null);
                          setIsFontMenuOpen(false);
                          setIsWeightMenuOpen(false);
                          setIsFontSizeMenuOpen(false);
                          setIsLineHeightMenuOpen(false);
                          setIsBgColorMenuOpen(false);
                          setActiveTool("browse");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-black transition cursor-pointer shadow-xs"
                        title="إغلاق خيارات النص والعودة للقراءة"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        <span>تم / إغلاق</span>
                      </button>
                    </div>
                  );
                }

                const isRec = Boolean(recordingNoteId && activeNote && recordingNoteId === activeNote.id);
                const currentW = activeNote?.width ?? 260;
                const currentH = activeNote?.height ?? 160;

                return (
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center relative select-none">
                    
                    {/* 1. Primary Add Note Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddNewNoteAtCenter();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black transition shadow-sm hover:shadow-indigo-500/20 cursor-pointer shrink-0"
                      title="إدراج ستيكر ملاحظة جديد في الصفحة"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ ستيكر جديد</span>
                    </button>

                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                    {/* 2. Quick Size Controller ( - | صغير | عادي | كبير | + ) */}
                    <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 px-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold text-slate-400 ml-1">الحجم:</span>
                      
                      {/* Step Down (-) */}
                      <button
                        type="button"
                        onClick={() => {
                          const targetId = selectedNoteId || (pageTextNotes.length > 0 ? pageTextNotes[pageTextNotes.length - 1].id : null);
                          if (targetId) {
                            const note = pageTextNotes.find(n => n.id === targetId);
                            const w = note?.width ?? 260;
                            const h = note?.height ?? 160;
                            const nextW = Math.max(110, Math.round(w - 35));
                            const nextH = Math.max(65, Math.round(h - 22));
                            updateTextNote(targetId, { width: nextW, height: nextH });
                          }
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title="تصغير تدريجي (-)"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      {/* Presets: صغير | عادي | كبير */}
                      {[
                        { label: "صغير", w: 140, h: 90, title: "حجم صغير مدمج (140×90)" },
                        { label: "عادي", w: 260, h: 160, title: "الحجم القياسي المثالي (260×160)" },
                        { label: "كبير", w: 380, h: 230, title: "حجم كبير موسع (380×230)" },
                      ].map((s) => {
                        const isCurrent = activeNote 
                          ? (Math.abs(currentW - s.w) < 35 && Math.abs(currentH - s.h) < 25) 
                          : s.label === "عادي";
                        return (
                          <button
                            key={s.label}
                            type="button"
                            onClick={() => {
                              const targetId = selectedNoteId || (pageTextNotes.length > 0 ? pageTextNotes[pageTextNotes.length - 1].id : null);
                              if (targetId) {
                                updateTextNote(targetId, { width: s.w, height: s.h });
                              }
                            }}
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isCurrent
                                ? "bg-indigo-600 text-white shadow-xs font-black"
                                : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                            }`}
                            title={s.title}
                          >
                            {s.label}
                          </button>
                        );
                      })}

                      {/* Step Up (+) */}
                      <button
                        type="button"
                        onClick={() => {
                          const targetId = selectedNoteId || (pageTextNotes.length > 0 ? pageTextNotes[pageTextNotes.length - 1].id : null);
                          if (targetId) {
                            const note = pageTextNotes.find(n => n.id === targetId);
                            const w = note?.width ?? 260;
                            const h = note?.height ?? 160;
                            const nextW = Math.min(720, Math.round(w + 35));
                            const nextH = Math.min(650, Math.round(h + 22));
                            updateTextNote(targetId, { width: nextW, height: nextH });
                          }
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title="تكبير تدريجي (+)"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                    {/* 3. Academic Color Presets Palette */}
                    <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
                      <span className="text-[10px] font-bold text-slate-400 ml-0.5 shrink-0">اللون:</span>
                      {STICKY_BG_PRESETS.filter(p => p.id !== "transparent").map((p) => {
                        const isSelected = activeNote ? activeNote.bgStyle === p.id : activeTextBg === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setActiveTextBg(p.id);
                              const targetId = selectedNoteId || (pageTextNotes.length > 0 ? pageTextNotes[pageTextNotes.length - 1].id : null);
                              if (targetId) {
                                updateTextNote(targetId, { bgStyle: p.id });
                                setSelectedNoteId(targetId);
                              }
                            }}
                            style={{ backgroundColor: p.dotColor }}
                            className={`w-5 h-5 rounded-full border border-black/20 transition transform hover:scale-125 cursor-pointer shrink-0 flex items-center justify-center ${
                              isSelected 
                                ? "ring-2 ring-indigo-500 scale-120 shadow-sm" 
                                : "opacity-75 hover:opacity-100"
                            }`}
                            title={`${p.name} • ${p.purpose}`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* 4. Handwriting Font Dropdown */}
                    <div className="relative lammah-font-menu" data-lammah-dropdown="true">
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFontMenuOpen(!isFontMenuOpen);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          isFontMenuOpen
                            ? "bg-indigo-50 dark:bg-slate-800 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80"
                        }`}
                        title="اختيار نوع الخط اليدوي للستيكر"
                      >
                        <span className="font-bold">
                          {(() => {
                            const cur = activeNote ? activeNote.fontFamily : activeHandwritingFont;
                            if (cur === "marhey") return "خط مرحي ✍️";
                            if (cur === "ruqaa") return "خط الرقعة ✒️";
                            if (cur === "baloo") return "خط بالو 🌸";
                            if (cur === "lalezar") return "خط لاليزار 🎯";
                            if (cur === "katibeh") return "خط كَتيبة 🪶";
                            if (cur === "kufi") return "خط الكوفي 📐";
                            if (cur === "messiri") return "خط المسيري ✨";
                            if (cur === "amiri") return "خط الأميري 📜";
                            if (cur === "caveat") return "توقيع يدوي 🖋️";
                            return "خط عادي 📝";
                          })()}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isFontMenuOpen ? "rotate-180 text-indigo-600" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isFontMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.14 }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            data-lammah-dropdown="true"
                            className="lammah-font-menu absolute top-full right-0 mt-2 w-64 max-h-[380px] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[999] flex flex-col gap-1 ring-1 ring-black/10"
                          >
                            <div className="px-2.5 py-1 text-[11px] font-black text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                              <span>نوع الخط اليدوي للستيكر</span>
                              <span className="text-[10px] text-indigo-500 font-bold">10 خطوط</span>
                            </div>
                            {[
                              { id: "marhey", name: "خط مرحي ✍️", fontStyle: "'Marhey', cursive, sans-serif", subtitle: "عفوي ككتابة يد حقيقية" },
                              { id: "ruqaa", name: "خط الرقعة ✒️", fontStyle: "'Aref Ruqaa', cursive, serif", subtitle: "تراثي أكاديمي رشيق" },
                              { id: "baloo", name: "خط بالو 🌸", fontStyle: "'Baloo Bhaijaan 2', cursive, sans-serif", subtitle: "دائري مرح ناعم وسلس" },
                              { id: "lalezar", name: "خط لاليزار 🎯", fontStyle: "'Lalezar', cursive, sans-serif", subtitle: "بوستر ضخم عريض جداً" },
                              { id: "katibeh", name: "خط كتيبة 🪶", fontStyle: "'Katibeh', cursive, serif", subtitle: "شعر وأدب بنمط فارسي" },
                              { id: "kufi", name: "خط الكوفي 📐", fontStyle: "'Reem Kufi', sans-serif", subtitle: "هندسي كلاسيكي صارم" },
                              { id: "messiri", name: "خط المسيري ✨", fontStyle: "'El Messiri', serif", subtitle: "أدبي شاعري بنهايات فنية" },
                              { id: "amiri", name: "خط الأميري 📜", fontStyle: "'Amiri', serif", subtitle: "النسخ القرآني الكلاسيكي" },
                              { id: "caveat", name: "توقيع يدوي 🖋️", fontStyle: "'Caveat', cursive", subtitle: "English Cursive Signature" },
                              { id: "standard", name: "خط عادي 📝", fontStyle: "system-ui, -apple-system, sans-serif", subtitle: "طباعي قياسي مريح" },
                            ].map((f) => {
                              const currentFont = activeNote ? activeNote.fontFamily : activeHandwritingFont;
                              const isSelected = currentFont === f.id;
                              return (
                                <button
                                  key={f.id}
                                  type="button"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={() => {
                                    setActiveHandwritingFont(f.id as HandwritingFont);
                                    setIsFontMenuOpen(false);
                                    if (selectedNoteId) {
                                      updateTextNote(selectedNoteId, { fontFamily: f.id as HandwritingFont });
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer text-right ${
                                    isSelected
                                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/60"
                                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                                  }`}
                                >
                                  <div className="flex flex-col items-start text-right">
                                    <span style={{ fontFamily: f.fontStyle }} className="text-sm font-bold">
                                      {f.name}
                                    </span>
                                    <span style={{ fontFamily: f.fontStyle }} className="text-[11px] text-slate-500 font-normal">
                                      {f.subtitle}
                                    </span>
                                  </div>
                                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                    {/* 5. Voice-to-Text Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = selectedNoteId || (pageTextNotes.length > 0 ? pageTextNotes[pageTextNotes.length - 1].id : null);
                        if (!targetId) {
                          handleAddNewNoteAtCenter();
                          return;
                        }
                        if (recordingNoteId === targetId) {
                          handleStopVoiceRecording();
                        } else {
                          handleStartVoiceRecording(targetId);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isRec
                          ? "bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/40"
                          : "bg-slate-100/90 dark:bg-slate-800/90 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
                      }`}
                      title={isRec ? "إيقاف التسجيل الصوتي" : `تحدث بـ (${speechLang === "ar-SA" ? "اللغة العربية" : "English"}) لتحويل صوتك إلى نص فوراً!`}
                    >
                      {isRec ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
                      <span>{isRec ? "تسجيل..." : "مايك"}</span>
                      {isRec && (
                        <span className="flex items-center gap-0.5 h-2.5 px-0.5">
                          <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" />
                        </span>
                      )}
                    </button>

                    {/* 6. Speech Language Switch */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextLang: SpeechLang = speechLang === "ar-SA" ? "en-US" : "ar-SA";
                        setSpeechLang(nextLang);
                        if (isRec && activeNote) {
                          handleStopVoiceRecording();
                          setTimeout(() => handleStartVoiceRecording(activeNote.id, nextLang), 80);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 text-slate-700 dark:text-slate-200 text-xs font-black transition border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                      title="تبديل لغة الصوت المباشر (🇸🇦 عربي / 🇺🇸 English)"
                    >
                      <span>{speechLang === "ar-SA" ? "🇸🇦 عربي" : "🇺🇸 EN"}</span>
                    </button>

                    {/* 7. Action Buttons (if note is selected) */}
                    {selectedNoteId && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                        <button
                          type="button"
                          onClick={() => {
                            if (selectedNoteId) {
                              deleteTextNote(selectedNoteId);
                              setSelectedNoteId(null);
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white text-xs font-bold transition border border-rose-200 dark:border-rose-800/60 cursor-pointer"
                          title="حذف الستيكر المحدد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>

                        {/* 8. Done / Close Top Inspector */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNoteId(null);
                            setIsFontMenuOpen(false);
                            setActiveTool("browse");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-black transition cursor-pointer shadow-xs"
                          title="إغلاق خيارات الستيكر والعودة للقراءة"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          <span>تم / إغلاق</span>
                        </button>
                      </>
                    )}

                  </div>
                );
              })()}

              {/* ── ACTIVE RECALL TAPE INSPECTOR ── */}
              {activeTool === "tape" && !selectedNoteId && (
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                  
                  {/* Group 1: Tape Colors */}
                  <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">لون الشريط:</span>
                    {TAPE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedTapeColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-4 h-4 rounded-full transition transform hover:scale-115 cursor-pointer flex items-center justify-center ${
                          selectedTapeColor === c.value ? "scale-115 ring-2 ring-purple-500 shadow-xs" : "opacity-80"
                        }`}
                        title={c.name}
                      >
                        {selectedTapeColor === c.value && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </button>
                    ))}
                  </div>

                  {/* Group 2: Recall Guide Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 font-bold text-[11px]">
                    <span>💡 اسحب فوق أي إجابة لتغطيتها، وانقر عليها لكشفها واختبار حفظك!</span>
                  </div>

                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Export Success Toast ── */}
      <AnimatePresence>
        {exportSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-black shadow-2xl flex items-center gap-2.5 border border-slate-700/80 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تم تصدير وتحميل الملف الحالي مع كافة التخطيطات والملاحظات بنجاح!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Speech Recognition Notification / Error Toast ── */}
      <AnimatePresence>
        {speechErrorToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-black shadow-2xl flex items-center gap-2 border border-rose-400/30 backdrop-blur-md"
          >
            <MicOff className="w-4 h-4 text-rose-200" />
            <span>{speechErrorToast}</span>
            <button
              type="button"
              onClick={() => setSpeechErrorToast(null)}
              className="mr-2 text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Blank Page Added / Deleted Toast ── */}
      <AnimatePresence>
        {blankPageAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-2xl flex items-center gap-2 border border-emerald-400/30 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{blankPageAddedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Page Selector Grid Drawer ── */}
      <AnimatePresence>
        {isPageDrawerOpen && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-5xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl mb-3 z-20"
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setPageDrawerFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      pageDrawerFilter === "all"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>كل الصفحات ({totalPages})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageDrawerFilter("pins")}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      pageDrawerFilter === "pins"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>الشرائح المثبتة للامتحان ({pinnedPages.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddPageModalOpen(true);
                    setIsPageDrawerOpen(false);
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs mr-2"
                  title="إضافة صفحة فارغة جديدة"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة صفحة جديدة</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsPageDrawerOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Page Grid / List */}
            {pageDrawerFilter === "pins" && pinnedPages.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2 text-slate-400">
                <Bookmark className="w-8 h-8 opacity-40 text-rose-500" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  لم تقم بتثبيت أي شريحة بعد للامتحان!
                </p>
                <p className="text-[11px] text-slate-400">
                  انقر على زر "دبوس 📌" في أي شريحة مهمة لتثبيتها والوصول إليها بسرعة هنا.
                </p>
              </div>
            ) : pageDrawerFilter === "pins" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {pinnedPages.map((pg) => {
                  const pin = documentPins[pg];
                  const isCur = pg === currentPage;
                  return (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => {
                        onPageChange(pg);
                        setIsPageDrawerOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl border text-right transition cursor-pointer flex items-center gap-2.5 ${
                        isCur
                          ? "bg-rose-500/10 border-rose-500/40 ring-2 ring-rose-500/30 text-rose-700 dark:text-rose-300"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs shrink-0"
                        style={{ backgroundColor: `${pin?.color || "#ef4444"}25`, color: pin?.color || "#ef4444" }}
                      >
                        {pin?.icon || "📌"}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black truncate">{pin?.title || `شريحة ${pg}`}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-black/10 text-slate-600 dark:text-slate-300 shrink-0">
                            ص {pg}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">انقر للانتقال</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                  const isCur = pg === currentPage;
                  const hasNotes = (pageNotesCountMap[pg] || 0) > 0;
                  const pagePin = documentPins[pg];
                  return (
                    <button
                      key={pg}
                      onClick={() => {
                        onPageChange(pg);
                        setIsPageDrawerOpen(false);
                      }}
                      className={`relative px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        isCur
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                      }`}
                    >
                      <span>ص {pg}</span>
                      {pagePin && (
                        <span className="absolute -top-1.5 -left-1 text-[11px] drop-shadow-xs" title={`مثبتة: ${pagePin.title}`}>
                          {pagePin.icon || "📌"}
                        </span>
                      )}
                      {hasNotes && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Document Viewport (Seamless Pure White Container with Zero Black Flash) ── */}
      <div className="relative w-full max-w-5xl flex items-center justify-center p-0 sm:p-2">
        
        {/* The Native Single-Page Vector Viewer with Perfectly Bound Annotation Layer */}
        <div 
          ref={viewportRef}
          onClick={(e) => {
            const rawTarget = e.target;
            const target = (rawTarget instanceof Element ? rawTarget : (rawTarget as Node)?.parentElement) as HTMLElement | null;
            if (!target || typeof target.closest !== "function") return;
            if (
              target.closest(".lammah-text-note-card") ||
              target.closest(".lammah-inspector-ribbon") ||
              target.closest(".lammah-font-menu") ||
              target.closest(".lammah-main-toolbar") ||
              target.closest("[data-lammah-dropdown]")
            ) return;

            if (selectedNoteId) {
              setSelectedNoteId(null);
              setIsFontMenuOpen(false);
              setActiveTool("browse");
            }
          }}
          style={{
            aspectRatio: pageDimensions ? `${pageDimensions.width} / ${pageDimensions.height}` : undefined,
            maxHeight: "82vh",
            minHeight: "360px",
            width: pageDimensions && pageDimensions.ratio < 1
              ? `min(100%, calc(82vh * ${pageDimensions.ratio}))`
              : "100%",
            height: pageDimensions && pageDimensions.ratio >= 1
              ? "auto"
              : undefined,
          }}
          className={`relative rounded-2xl overflow-hidden shadow-xl bg-white border border-slate-200 mx-auto transition-[width,height] duration-200 ${
            !pageDimensions ? "w-full h-[75vh] sm:h-[84vh]" : ""
          }`}
        >
          
          {/* ── Feature 7: Slide Priority Bookmark Ribbon ── */}
          {documentPins[currentPage] && (
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => setIsPinModalOpen(true)}
              className="absolute top-0 right-4 z-35 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-b-xl shadow-lg border-x border-b border-black/20 hover:scale-105 transition-transform"
              style={{
                backgroundColor: documentPins[currentPage].color,
                color: "#FFFFFF",
              }}
              title="انقر لتعديل أو إزالة دبوس الشريحة"
            >
              <span className="text-sm drop-shadow-sm">{documentPins[currentPage].icon}</span>
              <span className="text-xs font-black drop-shadow-xs max-w-[200px] truncate">
                {documentPins[currentPage].title}
              </span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                ص {currentPage}
              </span>
            </motion.div>
          )}

          {/* Non-blocking Subtle Top Loading Bar during Background Processing */}
          <AnimatePresence>
            {(loading || isPageSliceLoading) && activeDocumentUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse z-30"
              />
            )}
          </AnimatePresence>

          {/* Pristine Beautiful White Loading Curtain */}
          <AnimatePresence>
            {(isIframeLoading && !isPdfCanvasReady && !pdfRawBytesRef.current && !activeDocumentUrl) && (
              <motion.div 
                key="white_loader_curtain"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="absolute inset-0 bg-white flex flex-col items-center justify-center z-30 select-none pointer-events-none"
              >
                <div className="flex flex-col items-center gap-3.5 p-7 rounded-3xl bg-slate-50/90 border border-slate-100 shadow-sm max-w-xs text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center shadow-xs">
                      <BookOpen className="w-7 h-7 text-indigo-600 animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <span className="flex h-3.5 w-3.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600"></span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-800">
                      صفحة {currentPage} من {totalPages || 1}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500">
                      جاري تجهيز النص والعرض...
                    </p>
                  </div>

                  {/* Skeleton placeholder shimmer lines */}
                  <div className="w-48 space-y-2 mt-1">
                    <div className="h-2 bg-slate-200/80 rounded-full animate-pulse w-full"></div>
                    <div className="h-2 bg-slate-200/60 rounded-full animate-pulse w-3/4 mx-auto"></div>
                    <div className="h-2 bg-slate-200/40 rounded-full animate-pulse w-1/2 mx-auto"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Native Vector High-Res Render Canvas (100% fitted to mobile, zero clipping) */}
          <canvas
            key={`pdf_page_canvas_${currentPage}`}
            ref={pdfCanvasRef}
            dir="ltr"
            style={{ direction: "ltr" }}
            className="w-full h-full object-contain block bg-white opacity-100"
          />

          {!isPdfCanvasReady && activeDocumentUrl && (
            <iframe
              key={`doc_frame_${currentPage}_${singlePageUrl ? "slice" : "master"}`}
              src={activeDocumentUrl}
              onLoad={handleIframeLoad}
              className={`w-full h-full border-none bg-white absolute inset-0 hidden md:block ${isDraggingAnyNote ? "pointer-events-none select-none" : ""}`}
              title={`${documentTitle} - Page ${currentPage}`}
            />
          )}

          {/* Direct Transparent Annotation Canvas Layer Bound 1:1 to This Exact Page */}
          <canvas
            ref={overlayCanvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: "none" }}
            className={`absolute inset-0 w-full h-full ${
              isDrawingTool
                ? "z-30 cursor-crosshair pointer-events-auto touch-none"
                : "z-10 pointer-events-none"
            }`}
          />

          {/* ── Handwritten Text Notes & Real-Time Speech Recognition Layer ── */}
          <div 
            onClick={!isDrawingTool ? handleViewportClickForNewText : undefined}
            className={`absolute inset-0 transition-colors ${
              isDrawingTool
                ? "z-10 pointer-events-none select-none"
                : selectedNoteId !== null
                ? "z-25 pointer-events-auto cursor-default"
                : (activeTool === "text" || activeTool === "plain_text")
                ? "z-25 pointer-events-auto cursor-text bg-blue-500/[0.02]" 
                : "z-20 pointer-events-auto"
            }`}
          >
            {/* Visual Guide Banner when Text Tool is active and page has no notes */}
            {activeTool === "text" && pageTextNotes.filter(n => n.noteType !== "plain_text").length === 0 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-blue-600/90 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 pointer-events-none animate-bounce">
                <Type className="w-3.5 h-3.5 text-amber-300" />
                <span>انقر في أي مكان في الصفحة لإضافة ستيكر ملاحظة أو تحدث بالمايك 🎙️!</span>
              </div>
            )}

            {/* Visual Guide Banner when Plain Text Tool is active and page has no plain text */}
            {activeTool === "plain_text" && pageTextNotes.filter(n => n.noteType === "plain_text").length === 0 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5 pointer-events-none animate-bounce">
                <CaseSensitive className="w-4 h-4 text-emerald-300" />
                <span>انقر في أي مكان في الصفحة لإضافة نص حر وتنسيقه (خطوط، سمك، تباعد)! ✍️</span>
              </div>
            )}

            {pageTextNotes.map((note) => {
              // ── Plain Text Note (Canva / Word Style) ──
              if (note.noteType === "plain_text") {
                const isSelected = selectedNoteId === note.id;
                const fontObj = TYPOGRAPHY_FONTS.find(f => f.id === note.fontFamily) || TYPOGRAPHY_FONTS[0];
                const fontFamilyCss = fontObj.fontFamily;
                const fontWeightCss = note.fontWeight || "600";
                const lineHeightCss = note.lineHeight || 1.4;
                const textBg = note.textBgColor || "transparent";
                const isDarkBg = textBg === "#0f172a" || textBg === "#0F172A";
                const textColorCss = note.color || (isDarkBg ? "#FFFFFF" : "#0F172A");
                const textAlignCss = note.textAlign || "right";
                const noteWidth = note.width ?? 250;
                const noteHeight = note.height ?? 85;

                return (
                  <div
                    key={note.id}
                    onClick={(e) => {
                      if (isDrawingTool) return;
                      e.stopPropagation();
                      setSelectedNoteId(note.id);
                      setActiveTool("plain_text");
                    }}
                    style={{
                      left: `${note.x}%`,
                      top: `${note.y}%`,
                      width: `${noteWidth}px`,
                      minWidth: "60px",
                      maxWidth: "750px",
                      height: `${noteHeight}px`,
                      minHeight: "30px",
                      backgroundColor: textBg !== "transparent" ? textBg : "transparent",
                    }}
                    className={`lammah-text-note-card absolute transition-all duration-150 flex flex-col group rounded-xl ${
                      isDrawingTool ? "pointer-events-none select-none" : "pointer-events-auto select-text"
                    } ${
                      textBg !== "transparent"
                        ? `shadow-sm p-2.5 border border-black/10 ${
                            isSelected
                              ? "ring-2 ring-emerald-500/80 shadow-lg z-40"
                              : "hover:ring-1 hover:ring-emerald-400/50 z-20"
                          }`
                        : `bg-transparent ${
                            isSelected
                              ? "border border-dashed border-emerald-500/60 shadow-none z-40 p-1"
                              : "border-0 shadow-none ring-0 p-0 z-20"
                          }`
                    }`}
                  >
                    {/* Top Drag & Move Grip (Visible on select or hover) */}
                    <div
                      onPointerDown={(e) => handleNotePointerDown(e, note)}
                      className={`h-5 w-full flex items-center justify-between cursor-grab active:cursor-grabbing select-none touch-none shrink-0 transition-opacity ${
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-80"
                      }`}
                      title="اسحب لنقل النص في أي مكان"
                    >
                      <div className="flex items-center gap-1 text-slate-400 hover:text-emerald-600 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                        <Move className="w-2.5 h-2.5" />
                        <span className="text-[9px]">نقل</span>
                      </div>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => deleteTextNote(note.id)}
                          className="p-0.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                          title="حذف النص ✕"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Direct Text Editor */}
                    <textarea
                      ref={(el) => {
                        if (el && selectedNoteId === note.id && !note.text) {
                          try {
                            el.focus({ preventScroll: true });
                          } catch {
                            el.focus();
                          }
                        }
                      }}
                      value={note.text}
                      placeholder="اكتب نصاً هنا..."
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoteId(note.id);
                      }}
                      onChange={(e) => updateTextNote(note.id, { text: e.target.value })}
                      style={{
                        color: textColorCss,
                        fontSize: `${note.fontSize || 18}px`,
                        lineHeight: String(lineHeightCss),
                        fontFamily: fontFamilyCss,
                        fontWeight: Number(fontWeightCss),
                        textAlign: textAlignCss,
                      }}
                      className="flex-1 w-full bg-transparent resize-none border-none outline-none placeholder:text-black/30 dark:placeholder:text-white/30 select-text cursor-text p-0 m-0"
                    />

                    {/* Canva Corner Handles (Visible when selected) */}
                    {isSelected && (
                      <>
                        <span
                          onPointerDown={(e) => handleNoteResizeStart(e, note, "nw")}
                          className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-full shadow-md cursor-nwse-resize hover:scale-130 transition-transform z-40 touch-none"
                          title="تحجيم"
                        />
                        <span
                          onPointerDown={(e) => handleNoteResizeStart(e, note, "ne")}
                          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-full shadow-md cursor-nesw-resize hover:scale-130 transition-transform z-40 touch-none"
                          title="تحجيم"
                        />
                        <span
                          onPointerDown={(e) => handleNoteResizeStart(e, note, "sw")}
                          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-full shadow-md cursor-nesw-resize hover:scale-130 transition-transform z-40 touch-none"
                          title="تحجيم"
                        />
                        <span
                          onPointerDown={(e) => handleNoteResizeStart(e, note, "se")}
                          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-emerald-600 rounded-full shadow-md cursor-nwse-resize hover:scale-130 transition-transform z-40 touch-none"
                          title="تحجيم"
                        />
                      </>
                    )}
                  </div>
                );
              }

              const isSelected = selectedNoteId === note.id;
              const preset = STICKY_BG_PRESETS.find((p) => p.id === note.bgStyle) || STICKY_BG_PRESETS[0];
              const isRec = recordingNoteId === note.id;

              const noteWidth = note.width ?? 260;
              const noteHeight = note.height ?? 160;

              {/* Render compact pill badge when note is folded/minimized */}
              if (note.isFolded) {
                return (
                  <div
                    key={note.id}
                    onClick={(e) => {
                      if (isDrawingTool) return;
                      e.stopPropagation();
                      updateTextNote(note.id, { isFolded: false });
                      setSelectedNoteId(note.id);
                      setActiveTool("text");
                    }}
                    style={{
                      left: `${note.x}%`,
                      top: `${note.y}%`,
                    }}
                    className={`lammah-text-note-card absolute z-30 shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 border-2 transition-all hover:scale-105 ${
                      isDrawingTool ? "pointer-events-none select-none" : "pointer-events-auto cursor-pointer"
                    } ${preset.bgClass} ${preset.borderClass} ${preset.shadowClass}`}
                    title="ملاحظة مطوية - انقر لفتحها وقراءتها"
                  >
                    <span className="text-sm">{note.stickerIcon || "📌"}</span>
                    <span
                      style={{ color: typeof preset.textColor === "string" && preset.textColor.startsWith("#") ? preset.textColor : "#1E293B" }}
                      className="text-xs font-black truncate max-w-[130px]"
                    >
                      {note.text.split("\n")[0] || "ملاحظة دراسية"}
                    </span>
                    <Maximize2 className="w-3 h-3 opacity-60 hover:opacity-100 text-indigo-600" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextNote(note.id);
                      }}
                      className="p-0.5 rounded-full hover:bg-rose-500 hover:text-white text-black/40 transition"
                      title="إغلاق وحذف الملاحظة نهائياً"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              const isTransparent = note.bgStyle === "transparent" || note.stickerShape === "transparent";

              return (
                <div
                  key={note.id}
                  onClick={(e) => {
                    if (isDrawingTool) return;
                    e.stopPropagation();
                    setSelectedNoteId(note.id);
                    setActiveTool("text");
                  }}
                  style={{
                    left: `${note.x}%`,
                    top: `${note.y}%`,
                    width: `${noteWidth}px`,
                    minWidth: isTransparent ? "60px" : "110px",
                    maxWidth: "720px",
                    height: `${noteHeight}px`,
                    minHeight: isTransparent ? "30px" : "65px",
                    backgroundColor: isTransparent ? "transparent" : undefined,
                  }}
                  className={`lammah-text-note-card absolute transition-all duration-200 flex flex-col group rounded-2xl ${
                    isDrawingTool ? "pointer-events-none select-none" : "pointer-events-auto select-text"
                  } ${
                    isTransparent
                      ? `bg-transparent ${
                          isSelected
                            ? "border border-dashed border-indigo-400/60 shadow-none z-40 p-1"
                            : "border-0 shadow-none ring-0 p-0 z-20"
                        }`
                      : `border-2 ${preset.bgClass} ${preset.borderClass} ${preset.shadowClass} ${
                          isSelected 
                            ? "ring-2 ring-indigo-500/50 shadow-2xl z-40 scale-[1.01]" 
                            : "opacity-98 z-20 hover:shadow-xl hover:-translate-y-0.5"
                        }`
                  }`}
                >
                  {/* Subtle Minimal Drag Grip (Visible on select or hover with NO buttons) */}
                  <div
                    onPointerDown={(e) => handleNotePointerDown(e, note)}
                    className={`h-4 w-full flex items-center justify-end px-2.5 cursor-grab active:cursor-grabbing select-none touch-none shrink-0 transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                    }`}
                    title="اسحب لنقل الملاحظة"
                  >
                    <Move className="w-3 h-3 text-black/30 dark:text-white/40 hover:text-indigo-600" />
                  </div>

                  {/* ── Direct Writing Area (Clean & Uncluttered) ── */}
                  <div className={`flex-1 w-full relative ${isTransparent ? "p-0" : "p-3 pt-1"} flex flex-col`}>
                    <textarea
                      ref={(el) => {
                        if (el && selectedNoteId === note.id && !note.text) {
                          try {
                            el.focus({ preventScroll: true });
                          } catch {
                            el.focus();
                          }
                        }
                      }}
                      value={note.text}
                      placeholder={noteWidth < 170 ? "ملاحظة 🎙️..." : "اكتب ملاحظتك هنا..."}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoteId(note.id);
                      }}
                      onChange={(e) => updateTextNote(note.id, { text: e.target.value })}
                      style={{
                        color: typeof preset.textColor === "string" && preset.textColor.startsWith("#") ? preset.textColor : "#1E293B",
                        fontSize: noteWidth < 160 ? "13px" : `${note.fontSize || 16}px`,
                        lineHeight: noteWidth < 160 ? "1.35" : "1.6",
                        fontFamily: 
                          note.fontFamily === "marhey" ? "'Marhey', cursive, sans-serif" :
                          note.fontFamily === "ruqaa" ? "'Aref Ruqaa', cursive, serif" :
                          note.fontFamily === "baloo" ? "'Baloo Bhaijaan 2', cursive, sans-serif" :
                          note.fontFamily === "lalezar" ? "'Lalezar', cursive, sans-serif" :
                          note.fontFamily === "katibeh" ? "'Katibeh', cursive, serif" :
                          note.fontFamily === "kufi" ? "'Reem Kufi', sans-serif" :
                          note.fontFamily === "messiri" ? "'El Messiri', serif" :
                          note.fontFamily === "amiri" ? "'Amiri', serif" :
                          note.fontFamily === "caveat" ? "'Caveat', cursive" :
                          (TYPOGRAPHY_FONTS.find(f => f.id === note.fontFamily)?.fontFamily || "system-ui, -apple-system, sans-serif")
                      }}
                      rows={note.height ? undefined : Math.max(2, note.text.split("\n").length)}
                      className="flex-1 w-full bg-transparent resize-none border-none outline-none placeholder:text-black/35 placeholder:text-xs font-semibold select-text cursor-text"
                    />
                  </div>

                  {/* ── Canva-Style 8-Point Transform Bounding Box Handles (Active when selected) ── */}
                  {isSelected && (
                    <>
                      {/* Top-Left Corner (NW) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "nw")}
                        title="سحب للتحجيم من الزاوية العلوية (مثل كانفا)"
                        className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nwse-resize hover:scale-130 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />

                      {/* Top-Right Corner (NE) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "ne")}
                        title="سحب للتحجيم من الزاوية العلوية (مثل كانفا)"
                        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nesw-resize hover:scale-130 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />

                      {/* Bottom-Left Corner (SW) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "sw")}
                        title="سحب للتحجيم من الزاوية السفلية (مثل كانفا)"
                        className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nesw-resize hover:scale-130 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />

                      {/* Bottom-Right Corner (SE) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "se")}
                        title="سحب للتحجيم من الزاوية السفلية (مثل كانفا)"
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-nwse-resize hover:scale-130 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />

                      {/* Top Edge Handle (N) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "n")}
                        title="سحب لضبط الارتفاع للأعلى (مثل كانفا)"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-white border border-indigo-500 rounded-full shadow-xs cursor-ns-resize hover:scale-125 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />

                      {/* Bottom Edge Handle (S) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "s")}
                        title="سحب لضبط الارتفاع للأسفل (مثل كانفا)"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-white border border-indigo-500 rounded-full shadow-xs cursor-ns-resize hover:scale-125 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />

                      {/* Left Edge Handle (W) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "w")}
                        title="سحب لضبط العرض لليسار (مثل كانفا)"
                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white border border-indigo-500 rounded-full shadow-xs cursor-ew-resize hover:scale-125 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />

                      {/* Right Edge Handle (E) */}
                      <span
                        onPointerDown={(e) => handleNoteResizeStart(e, note, "e")}
                        title="سحب لضبط العرض لليمين (مثل كانفا)"
                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white border border-indigo-500 rounded-full shadow-xs cursor-ew-resize hover:scale-125 transition-transform z-40 touch-none before:absolute before:-inset-2 before:content-['']"
                      />
                    </>
                  )}

                  {/* Subtle always-available corner resize grip when not selected */}
                  {!isSelected && (
                    <span
                      onPointerDown={(e) => handleNoteResizeStart(e, note, "se")}
                      title="اسحب لتكبير وتصغير الملاحظة بحرية"
                      className="absolute bottom-0.5 right-0.5 cursor-nwse-resize text-black/20 hover:text-indigo-600 p-1 touch-none rounded-br-xl hover:scale-125 transition-transform z-30"
                    >
                      <MoveDiagonal2 className="w-3 h-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Page Highlights Badge */}
          {(pageStrokes.length > 0 || pageTextNotes.length > 0) && activeTool === "browse" && (
            <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] sm:text-xs font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
              <Highlighter className="w-3 h-3 text-amber-400" />
              <span>
                {pageStrokes.length} تخطيط • {pageTextNotes.length} ملاحظة نصية
              </span>
            </div>
          )}
        </div>

      </div>



      {/* ══════════════════════════════════════════════════════════
          FEATURE 7: MODAL - CUSTOM EXAM PRIORITY PIN MODAL
      ══════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════
          FEATURE 10: MODAL - EXAM PRIORITY PIN MODAL (CLEAN & MINIMAL)
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-3.5 text-right select-none"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs shrink-0"
                    style={{ backgroundColor: `${pinSelectedColor}20`, color: pinSelectedColor }}
                  >
                    <span>{pinSelectedIcon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span>تثبيت شريحة {currentPage}</span>
                      {documentPins[currentPage] && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                          مثبتة
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Toggle to view all pins */}
                  <button
                    type="button"
                    onClick={() => setPinModalTab(pinModalTab === "all" ? "current" : "all")}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      pinModalTab === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                    title="عرض جميع الشرائح المثبتة"
                  >
                    <Layers className="w-3 h-3" />
                    <span>الدبابيس ({pinnedPages.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tab: All Pins */}
              {pinModalTab === "all" ? (
                <div className="flex flex-col gap-3">
                  {pinnedPages.length === 0 ? (
                    <div className="py-6 text-center flex flex-col items-center gap-1.5 text-slate-400">
                      <Bookmark className="w-8 h-8 opacity-30 text-rose-500" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        لا توجد دبابيس بعد
                      </p>
                      <button
                        type="button"
                        onClick={() => setPinModalTab("current")}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        تثبيت شريحة {currentPage} الآن 📌
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-0.5">
                      {pinnedPages.map((pg) => {
                        const pin = documentPins[pg];
                        if (!pin) return null;
                        const isCur = pg === currentPage;
                        return (
                          <div
                            key={pg}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                              isCur
                                ? "bg-rose-500/10 border-rose-500/30"
                                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-100/70"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-base shrink-0">{pin.icon}</span>
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                    {pin.title}
                                  </span>
                                  <span className="text-[10px] font-semibold px-1 rounded bg-black/5 dark:bg-white/10 text-slate-500 shrink-0">
                                    ص {pg}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  onPageChange(pg);
                                  setIsPinModalOpen(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-0.5"
                                title={`انتقال لشريحة ${pg}`}
                              >
                                <span>انتقال</span>
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePinForPage(pg)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                title="إزالة الدبوس"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Exam Night Mode & Back */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPinModalTab("current")}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
                    >
                      ← العودة للشريحة
                    </button>
                    {pinnedPages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsPinModalOpen(false);
                          setIsExamNightMode(true);
                          if (!pinnedPages.includes(currentPage)) {
                            onPageChange(pinnedPages[0]);
                          }
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer hover:opacity-90"
                      >
                        <Flame className="w-3 h-3" />
                        <span>ليلة الامتحان ⚡</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Tab: Current Page Pin Editor */
                <>
                  {/* Clean Input */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={pinCustomTitle}
                      onChange={(e) => setPinCustomTitle(e.target.value)}
                      placeholder="عنوان الدبوس (مثال: سؤال فاينل، قانون...)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-indigo-500 transition placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  {/* Compact Quick Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {PIN_PRESETS.map((pr) => {
                      const isSelected = pinCustomTitle === pr.title;
                      return (
                        <button
                          key={pr.title}
                          type="button"
                          onClick={() => {
                            setPinCustomTitle(pr.title);
                            setPinSelectedColor(pr.color);
                            setPinSelectedIcon(pr.icon);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1 border ${
                            isSelected
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300"
                              : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <span className="text-xs">{pr.icon}</span>
                          <span>{pr.title.replace(/[🔥⚠️⭐📐💡✅]/g, "").trim()}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Compact Color & Icon Row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Colors */}
                    <div className="flex items-center gap-1.5">
                      {PIN_PALETTE_COLORS.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setPinSelectedColor(col.value)}
                          style={{ backgroundColor: col.value }}
                          className={`w-4 h-4 rounded-full transition cursor-pointer flex items-center justify-center ${
                            pinSelectedColor === col.value ? "ring-2 ring-indigo-500 ring-offset-1 scale-110" : "opacity-75 hover:opacity-100"
                          }`}
                          title={col.name}
                        >
                          {pinSelectedColor === col.value && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-0.5">
                      {["🔥", "⭐", "📐", "⚠️", "💡", "📌"].map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setPinSelectedIcon(ic)}
                          className={`w-5 h-5 rounded-md text-xs flex items-center justify-center transition cursor-pointer ${
                            pinSelectedIcon === ic ? "bg-indigo-100 dark:bg-indigo-900/60 scale-110" : "hover:bg-slate-100 dark:hover:bg-slate-800 opacity-70 hover:opacity-100"
                          }`}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    {documentPins[currentPage] ? (
                      <button
                        type="button"
                        onClick={handleRemovePin}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>إزالة</span>
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2 mr-auto">
                      <button
                        type="button"
                        onClick={() => setIsPinModalOpen(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSavePin()}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>حفظ</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 9: MODAL - ACADEMIC STICKER PACK MODAL
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isAcademicStickersOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-right select-none max-h-[88vh] overflow-hidden"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-xl">
                    🏷️
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>حزمة الملصقات والشارات الجامعية</span>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                        جاهزة بضغطة واحدة
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      اختر الشارة التي تريدها لإلصاقها فوراً في الصفحة الحالية (ص {currentPage})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAcademicStickersOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of 8 Academic Stickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto p-1 max-h-[58vh]">
                {ACADEMIC_STICKER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleStampAcademicSticker(preset)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all text-right flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {preset.icon}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-black text-xs text-slate-800 dark:text-white truncate">
                          {preset.title}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                          {preset.badgeTag}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {preset.subtitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span>💡 يمكنك تحريك الملصق وتغيير حجمه ولونه بكل حرية بعد إلصاقه.</span>
                <button
                  type="button"
                  onClick={() => setIsAcademicStickersOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ══════════════════════════════════════════════════════════
          FEATURE 10: MODAL - PRINTABLE CHEATSHEET MODAL
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCheatsheetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto"
              dir="rtl"
            >
              {/* Cheatsheet Top Bar (Screen Only) */}
              <div className="print:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm">ملخص الامتحانات المكثف | Lammah Cheatsheet</h3>
                    <p className="text-[11px] text-slate-400">
                      ملخص مركز لجميع الدبابيس والملاحظات من صفحات المستند
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة ملخص A4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCheatsheetModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Body Content */}
              <div className="overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 bg-white text-slate-900 font-sans print:p-0">
                {/* Cheatsheet Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-1 bg-indigo-600 text-white rounded-lg">
                        ملخص ليلة الامتحان ⚡
                      </span>
                      <span className="text-xs text-slate-500">
                        منصة لماح للدراسة الذكية
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      {documentTitle || "ملخص المادة الأكاديمية"}
                    </h1>
                  </div>

                  <div className="text-left text-xs text-slate-500 space-y-1">
                    <div>إجمالي الشرائح المثبتة: <span className="font-black text-slate-900">{pinnedPages.length}</span></div>
                    <div>تاريخ التوليد: <span className="font-bold text-slate-700">{new Date().toLocaleDateString("ar-EG")}</span></div>
                  </div>
                </div>

                {/* Empty State */}
                {cheatsheetData.length === 0 ? (
                  <div className="py-16 text-center flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-400">
                      📌
                    </div>
                    <h4 className="font-black text-base text-slate-700">لا توجد دبابيس أو ملاحظات بعد</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      قم بإضافة دبابيس للشرائح المهمة بالضغط على 📌 أو إضافة ملصقات وملاحظات لتظهر مجمعة ومطبوعة في هذا الملخص فوراً.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {cheatsheetData.map((item) => (
                      <div
                        key={item.page}
                        className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 flex flex-col gap-3 break-inside-avoid"
                      >
                        {/* Page Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-xs font-black">
                              شريحة {item.page}
                            </span>
                            {item.pin && (
                              <div
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black text-white shadow-xs"
                                style={{ backgroundColor: item.pin.color }}
                              >
                                <span>{item.pin.icon}</span>
                                <span>{item.pin.title}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-bold">
                            {item.notes.length} ملاحظة
                          </span>
                        </div>

                        {/* Text Notes on this Page */}
                        {item.notes.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {item.notes.map((note) => (
                              <div
                                key={note.id}
                                className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-1 shadow-2xs"
                              >
                                {note.stickerIcon && (
                                  <div className="flex items-center gap-1 text-xs font-black text-slate-700">
                                    <span>{note.stickerIcon}</span>
                                  </div>
                                )}
                                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                                  {note.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Printable Footer */}
                <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>تم التوليد بواسطة منصة لماح - رفيقك الجامعي الذكي</span>
                  <span>صفحة 1 من 1</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 11: MODAL - ADD NEW BLANK / RULED / GRID PAGE
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isAddPageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-right select-none"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                    <FilePlus2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      إضافة صفحة جديدة للمستند
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      اختر نمط وتخطيط الصفحة وموقع إضافتها
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddPageModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Page Style Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  نمط وتخطيط الصفحة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Blank */}
                  <button
                    type="button"
                    onClick={() => setAddPageType("blank")}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col gap-1 ${
                      addPageType === "blank"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-100"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">بيضاء فارغة</span>
                      <Square className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      مساحة حرة ونقية للرسم والملاحظات
                    </span>
                  </button>

                  {/* Ruled */}
                  <button
                    type="button"
                    onClick={() => setAddPageType("ruled")}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col gap-1 ${
                      addPageType === "ruled"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-100"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">مسطرة (دفتر)</span>
                      <Baseline className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      أسطر منتظمة لكتابة الملاحظات والقوانين
                    </span>
                  </button>

                  {/* Grid */}
                  <button
                    type="button"
                    onClick={() => setAddPageType("grid")}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col gap-1 ${
                      addPageType === "grid"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-100"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">شبكة مربعات</span>
                      <Grid className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      مثالية للرياضيات والرسوم البيانية
                    </span>
                  </button>

                  {/* Dots */}
                  <button
                    type="button"
                    onClick={() => setAddPageType("dots")}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col gap-1 ${
                      addPageType === "dots"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-100"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">نقاط (Dotted)</span>
                      <Sparkles className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      تخطيط حر ونقاط لمخططات البوليت
                    </span>
                  </button>
                </div>
              </div>

              {/* Location Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  موقع إضافة الصفحة:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAddPageLocation("after_current")}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      addPageLocation === "after_current"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    بعد الشريحة الحالية ({currentPage})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddPageLocation("at_end")}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      addPageLocation === "at_end"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    في نهاية الملف ({totalPages + 1})
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPageModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertPage(addPageType, addPageLocation)}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>إضافة الصفحة الآن</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 11: MODAL - DELETE CURRENT PAGE CONFIRMATION
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isDeletePageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-right select-none"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center text-xl shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    حذف الصفحة {currentPage}؟
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    هل أنت متأكد من رغبتك في إزالة هذه الصفحة من الملف؟
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                ⚠️ تنبيه: سيتم حذف الصفحة بشكل نهائي مع أي تظليلات أو رسومات أو نصوص مسجلة عليها.
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeletePageModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCurrentPage}
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>تأكيد الحذف</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

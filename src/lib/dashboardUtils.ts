import { getFingerprint as getThumbmark } from "@thumbmarkjs/thumbmarkjs";
import { FocusPoint, MCQItem, PastExamItem, ParsedTranscriptItem } from "@/types/dashboard";

/**
 * Retrieves or generates the device unique fingerprint via ThumbmarkJS
 */
export async function getFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "";
  let fp = localStorage.getItem("device_id_v3");
  if (!fp) {
    try {
      fp = await getThumbmark();
      localStorage.setItem("device_id_v3", fp);
    } catch (e) {
      console.error("Device ID generation failed:", e);
      fp = `fallback_${Math.random().toString(36).substring(7)}`;
    }
  }
  return fp;
}

/**
 * Gathers complete device and browser telemetry metadata
 */
export async function getDeviceMetadata(): Promise<string> {
  if (typeof window === "undefined") return "";
  const fp = await getFingerprint();
  const metadata = {
    fingerprint: fp,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${window.screen.width}x${window.screen.height}`,
    battery: null as any
  };

  if ("getBattery" in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      metadata.battery = {
        level: Math.round(battery.level * 100),
        charging: battery.charging
      };
    } catch (e) {}
  }
  return JSON.stringify(metadata);
}

/**
 * Maps a logical slide number to its physical PDF page number
 */
export function getActualSlidePage(
  slideNum: number | undefined,
  defaultNum: number = 1,
  slideMap?: Record<number, number>
): number {
  if (!slideNum) return defaultNum;
  return slideMap?.[slideNum] || slideNum;
}

/**
 * Maps a logical slide number to its companion explanation page number
 */
export function getActualCompPage(
  slideNum: number | undefined,
  defaultNum: number = 1,
  compMap?: Record<number, number[] | number>,
  slideMap?: Record<number, number>
): number {
  if (!slideNum) return defaultNum + 1;
  const comp = compMap?.[slideNum];
  if (Array.isArray(comp) && comp.length > 0) return comp[0];
  if (typeof comp === "number") return comp;
  const actualSlide = getActualSlidePage(slideNum, defaultNum, slideMap);
  return actualSlide + 1;
}

/**
 * Filters focus points to exclude slide 1 intros, covers, non-examinable outlines, and empty points
 */
export function filterFocusPoints(rawList: any[]): FocusPoint[] {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];

  return rawList.filter((fp: any) => {
    if (!fp) return false;
    const point = (fp.point || "").toString().toLowerCase().trim();
    const exp = (fp.explanation || "").toString().toLowerCase().trim();
    const page = Number(fp.page_number) || 1;

    // 1. Slide 1 is almost universally the title slide / course intro / cover in university lectures
    if (page === 1) {
      const slide1IntroKeywords = [
        "مقدمة", "تمهيد", "ترحيب", "غلاف", "عنوان", "بداية", "رحلة", "نظرة عامة",
        "intro", "welcome", "overview", "agenda", "outline", "syllabus", "course", "lecture", "chapter 1", "جامعة", "دكتور"
      ];
      if (slide1IntroKeywords.some(kw => point.includes(kw) || exp.includes(kw))) {
        return false;
      }
      if (
        point.length < 60 &&
        (point.includes("مادة") || point.includes("مساق") || point.includes("management") || point.includes("software") || point.includes("برمجيات"))
      ) {
        return false;
      }
    }

    // 2. Non-examinable keywords anywhere
    const nonExaminableKeywords = [
      "غير مطلوب", "غير مطلوبة", "للمقدمة فقط", "تمهيدية", "شريحة تمهيدية", "شريحة عنوان",
      "جدول المحتويات", "فهرس", "أجندة", "outline", "agenda", "table of contents",
      "أهداف المساق", "أهداف المادة", "course objectives",
      "المراجع", "references", "reading list",
      "شكراً", "شكر وتقدير", "خاتمة", "أسئلة واستفسارات", "thank you", "questions?", "q&a",
      "بداية الرحلة في عالم", "مقدمة سريعة"
    ];
    if (nonExaminableKeywords.some(kw => point.includes(kw) || exp.includes(kw))) {
      return false;
    }

    // 3. Filter empty or trivial entries
    if (point.length < 3) return false;

    return true;
  });
}

/**
 * Formats or generates intelligent past exam questions aligned with slides and traps
 */
export function generatePastExamQuestions(
  annotations: any,
  filteredFocus: FocusPoint[]
): PastExamItem[] {
  if (annotations?.past_exams && Array.isArray(annotations.past_exams) && annotations.past_exams.length > 0) {
    return annotations.past_exams;
  }

  if (!annotations) return [];

  const mcqs: MCQItem[] = annotations.mcqs || [];
  if (mcqs.length === 0 && filteredFocus.length === 0) return [];

  const yearTags = [
    { year: "امتحان النهائي 2024", type: "Final Exam" },
    { year: "امتحان الميدتيرم 2023", type: "Midterm Exam" },
    { year: "الدورة الصيفية 2023", type: "Summer Session" },
    { year: "امتحان شامل 2022", type: "Comprehensive Test" },
    { year: "امتحان الدور الأول 2024", type: "First Round Exam" },
  ];

  return mcqs.map((mcq: any, i: number): PastExamItem => {
    const tag = yearTags[i % yearTags.length];
    const relatedFocus = filteredFocus[i % Math.max(1, filteredFocus.length)];
    const pageNum = mcq.page_number || relatedFocus?.page_number || (i + 1);

    return {
      id: `pe_${i}`,
      year: tag.year,
      exam_type: tag.type,
      page_number: pageNum,
      question: mcq.question,
      options: mcq.options || [],
      correct_answer: mcq.correct_answer,
      doctor_explanation:
        mcq.explanation ||
        (relatedFocus ? `ورد هذا السؤال لكون الدكتور ركز بشدة في شريحة ${pageNum} على: "${relatedFocus.point}".` : "إجابة نموذجية معتمدة مطابقة لمحتوى السلايدات وشرح المحاضر."),
      trap_warning: "⚠️ فخ شائع: انتبه لصيغة النفي أو الكلمات الخادعة (مثل NOT أو EXCEPT أو Most likely) التي يكررها الدكاترة في هذا السؤال!"
    };
  });
}

/**
 * Parses transcript into display lines and extracts search query matches
 */
export function parseTranscriptLines(
  transcript: string | undefined,
  query: string
): ParsedTranscriptItem[] {
  if (!transcript) return [];
  const rawLines: string[] = transcript.split("\n");
  const q = query?.trim().toLowerCase();

  if (!q) {
    return rawLines
      .filter((l: string) => l.trim().length > 0)
      .map((line: string, i: number): ParsedTranscriptItem => ({ id: i, line, parts: null }));
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return rawLines
    .filter((l: string) => l.toLowerCase().includes(q))
    .map((line: string, i: number): ParsedTranscriptItem => ({
      id: i,
      line,
      parts: line.split(regex)
    }));
}

/**
 * Spiritual Dhikr phrases & descriptions
 */
export const DHIKR_PHRASES = [
  "أستغفر الله العظيم",
  "لا إله إلا الله",
  "الحمد لله",
  "سبحان الله وبحمده",
  "الله أكبر",
  "اللهم صلِّ على سيدنا محمد",
  "لا حول ولا قوة إلا بالله"
];

export const DHIKR_VIRTUES = [
  "يفتح الأقفال ويجلب الرزق ويمحو الخطايا 🔑✨",
  "أعظم كلمة تشرح الصدور وتجدد الإيمان 🕊️✨",
  "تملأ الميزان وتزيد النعم والبركات 🌾✨",
  "خفيفتان على اللسان ثقيلتان في الميزان ⚖️✨",
  "تعلو بها فوق كل همّ وغمّ ⛰️✨",
  "يُكفى بها همّك ويُغفر بها ذنبك 🌸✨",
  "كنز عظيم من تحت عرش الرحمن 💎✨"
];

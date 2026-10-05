export interface UploadedAudio {
  id: string;
  file: File;
  tempId?: string;
  progress: number;
  isUploading: boolean;
}

export interface ParsedTranscriptItem {
  id: number;
  line: string;
  parts: string[] | null;
}

export interface VocabularyItem {
  term?: string;
  english?: string;
  meaning?: string;
  arabic?: string;
  translation?: string;
}

export interface SlideExplanation {
  slide_number?: number;
  page_number?: number;
  title?: string;
  summary_phrase?: string;
  doctor_explanation?: string;
  ai_explanation?: string;
  explanation?: string;
  example?: string;
  vocabulary?: (string | VocabularyItem)[];
  exam_tip?: string;
  sticky_note?: string;
}

export interface StickyNote {
  page_number?: number;
  note_text?: string;
}

export interface FocusPoint {
  point?: string;
  explanation?: string;
  page_number?: number;
}

export interface MCQItem {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  page_number?: number;
}

export interface FlashcardItem {
  front: string;
  back: string;
  page_number?: number;
}

export interface PastExamItem {
  id?: string;
  year?: string;
  exam_type?: string;
  page_number?: number;
  question: string;
  options: string[];
  correct_answer: string;
  doctor_explanation?: string;
  trap_warning?: string;
}

export interface DashboardAnnotations {
  slide_explanations?: SlideExplanation[];
  sticky_notes?: StickyNote[];
  focus_points?: FocusPoint[];
  mcqs?: MCQItem[];
  flashcards?: FlashcardItem[];
  past_exams?: PastExamItem[];
  slide_page_map?: Record<number, number>;
  companion_page_map?: Record<number, number[] | number>;
  is_audio_trimmed?: boolean;
}

export interface DashboardResult {
  transcript?: string;
  downloadUrl?: string | null;
  annotations?: DashboardAnnotations;
  isDocumentOnly?: boolean;
}

export interface PipelineStep {
  id: number;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface StudentProfileData {
  university?: string;
  major?: string;
  academic_year?: string;
  college?: string;
  specialty?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RecentLectureLog {
  id: string;
  created_at?: string;
  feature_name?: string;
  metadata?: {
    title?: string;
    job_id?: string;
    is_notebook?: boolean;
    student_name?: string;
    [key: string]: any;
  };
}

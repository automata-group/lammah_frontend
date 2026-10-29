export type ProcessingPhase = 'idle' | 'uploading' | 'processing' | 'audio' | 'slides' | 'ai' | 'pdf' | 'queued' | 'done';

export interface UploadedAudio {
  id: string;
  file: File;
  tempId: string | null;
  isUploading: boolean;
  progress: number;
  duration: number;
}

export interface QuotaCostBreakdown {
  audioCostMinutes: number;
  selectedPages: number;
  docCostMinutes: number;
  totalCost: number;
  currentQuota: number;
  remainingAfter: number;
  isSufficient: boolean;
  missingMinutes: number;
}

export interface ProcessPayload {
  audioTempId: string | null;
  pdfTempId: string | null;
  startPage: string;
  endPage: string;
  multiAudioFiles: UploadedAudio[];
  audioFile: File | null;
  pdfFile: File | null;
}

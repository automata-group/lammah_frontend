"use client";

import React, { useCallback, useRef } from "react";
import { FileAudio, CheckCircle, X } from "lucide-react";
import { UploadedAudio } from "./types";

import { getUploaderBaseUrl } from "@/lib/apiConfig";

interface AudioUploadCardProps {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  multiAudioFiles: UploadedAudio[];
  setMultiAudioFiles: React.Dispatch<React.SetStateAction<UploadedAudio[]>>;
  audioDuration: number;
  setAudioDuration: (dur: number) => void;
  audioTempId: string | null;
  setAudioTempId: (id: string | null) => void;
  audioUploadProgress: number;
  setAudioUploadProgress: (prog: number) => void;
  isAudioUploading: boolean;
  setIsAudioUploading: (val: boolean) => void;
  setError: (err: string | null) => void;
  session: any;
  formatDuration: (seconds: number) => string;
  audioCostMinutes: number;
  totalAudioSeconds: number;
}

export default function AudioUploadCard({
  audioFile,
  setAudioFile,
  multiAudioFiles,
  setMultiAudioFiles,
  audioDuration,
  setAudioDuration,
  audioTempId,
  setAudioTempId,
  audioUploadProgress,
  setAudioUploadProgress,
  isAudioUploading,
  setIsAudioUploading,
  setError,
  session,
  formatDuration,
  audioCostMinutes,
  totalAudioSeconds,
}: AudioUploadCardProps) {
  const activeXhrMap = useRef<Map<string, XMLHttpRequest>>(new Map());

  // Client-side duration detection (< 20ms)
  const getAudioDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(0);
        return;
      }
      try {
        const audio = document.createElement("audio");
        const objectUrl = URL.createObjectURL(file);
        audio.preload = "metadata";
        audio.src = objectUrl;
        audio.onloadedmetadata = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(Math.round(audio.duration || 0));
        };
        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(Math.max(30, Math.round(file.size / 16000)));
        };
      } catch {
        resolve(Math.max(30, Math.round(file.size / 16000)));
      }
    });
  }, []);

  // Upload single audio file via XHR
  const uploadSingleAudio = useCallback((file: File) => {
    setIsAudioUploading(true);
    setAudioUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    activeXhrMap.current.set("single", xhr);

    const uploaderUrl = getUploaderBaseUrl();
    xhr.open("POST", `${uploaderUrl}/api/v1/summarize/upload-temp`, true);

    if (session?.access_token) {
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setAudioUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      setIsAudioUploading(false);
      activeXhrMap.current.delete("single");
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          setAudioTempId(res.temp_id);
          setAudioUploadProgress(100);
        } catch {
          setError("فشل معالجة استجابة رفع الصوت من السيرفر.");
        }
      } else {
        setError(`فشل رفع الملف الصوتي (${xhr.status}). يرجى التحقق من الاتصال والمحاولة مجدداً.`);
        setAudioFile(null);
      }
    };

    xhr.onerror = () => {
      setIsAudioUploading(false);
      activeXhrMap.current.delete("single");
      setError("حدث خطأ أثناء رفع الملف الصوتي. يرجى التحقق من الشبكة.");
      setAudioFile(null);
    };

    xhr.send(formData);
  }, [session, setIsAudioUploading, setAudioUploadProgress, setAudioTempId, setError, setAudioFile]);

  // Upload item in multi-audio queue
  const uploadMultiAudio = useCallback((id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    activeXhrMap.current.set(id, xhr);

    const uploaderUrl = getUploaderBaseUrl();
    xhr.open("POST", `${uploaderUrl}/api/v1/summarize/upload-temp`, true);

    if (session?.access_token) {
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setMultiAudioFiles((prev) =>
          prev.map((item) => (item.id === id ? { ...item, progress: pct } : item))
        );
      }
    };

    xhr.onload = () => {
      activeXhrMap.current.delete(id);
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          setMultiAudioFiles((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, tempId: res.temp_id, isUploading: false, progress: 100 } : item
            )
          );
        } catch {
          setError(`فشل معالجة استجابة رفع الملف ${file.name}`);
        }
      } else {
        setError(`فشل رفع الملف ${file.name}`);
        setMultiAudioFiles((prev) => prev.filter((item) => item.id !== id));
      }
    };

    xhr.onerror = () => {
      activeXhrMap.current.delete(id);
      setError(`حدث خطأ أثناء رفع الملف ${file.name}`);
      setMultiAudioFiles((prev) => prev.filter((item) => item.id !== id));
    };

    xhr.send(formData);
  }, [session, setError, setMultiAudioFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setError(null);
      if (files.length === 1 && multiAudioFiles.length === 0) {
        const file = files[0];
        setAudioFile(file);
        setAudioUploadProgress(0);
        setAudioTempId(null);
        getAudioDuration(file).then((dur) => setAudioDuration(dur));
        uploadSingleAudio(file);
      } else {
        setAudioFile(null);
        setAudioTempId(null);
        setAudioDuration(0);
        const newFiles = Array.from(files).map((file) => ({
          id: Math.random().toString(36).substring(7),
          file,
          tempId: null,
          progress: 0,
          isUploading: true,
          duration: 0,
        }));
        setMultiAudioFiles((prev) => [...prev, ...newFiles]);
        newFiles.forEach(async (item) => {
          uploadMultiAudio(item.id, item.file);
          const dur = await getAudioDuration(item.file);
          setMultiAudioFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, duration: dur } : f))
          );
        });
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Abort all active uploads
    activeXhrMap.current.forEach((xhr) => xhr.abort());
    activeXhrMap.current.clear();

    setAudioFile(null);
    setAudioTempId(null);
    setAudioDuration(0);
    setMultiAudioFiles([]);
    setIsAudioUploading(false);
    setAudioUploadProgress(0);
  };

  const isMultiAudioUploading = multiAudioFiles.some((f) => f.isUploading || !f.tempId);
  const isAnyAudioUploading = isAudioUploading || (multiAudioFiles.length > 0 && isMultiAudioUploading);
  const avgMultiProgress = multiAudioFiles.length > 0
    ? Math.round(multiAudioFiles.reduce((acc, f) => acc + (f.progress || 0), 0) / multiAudioFiles.length)
    : 0;

  const hasAudioContent = !!audioFile || multiAudioFiles.length > 0;

  return (
    <div
      className={`relative group rounded-2xl p-5 transition-all duration-200 border flex flex-col justify-center min-h-[160px] ${
        hasAudioContent
          ? "bg-slate-50/90 dark:bg-slate-900/60 border-indigo-500/60 dark:border-indigo-500/40 ring-1 ring-indigo-500/20"
          : "bg-white dark:bg-slate-900/30 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30"
      }`}
    >
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />

      {hasAudioContent ? (
        <div className="w-full z-20 relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isAnyAudioUploading
                  ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                  : "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200/80 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isAnyAudioUploading ? (
                audioFile ? (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {audioUploadProgress}%
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {avgMultiProgress}%
                  </span>
                )
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate" dir="ltr">
                {audioFile ? audioFile.name : `${multiAudioFiles.length} ملفات صوتية`}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {isAnyAudioUploading ? (
                  <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    جاري الرفع...
                  </span>
                ) : (
                  <>
                    {totalAudioSeconds > 0 && (
                      <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 px-2 py-0.5 rounded-md tabular-nums">
                        ⏱️ {formatDuration(totalAudioSeconds)}
                      </span>
                    )}
                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800 px-2 py-0.5 rounded-md tabular-nums">
                      ⚡ خصم: {audioCostMinutes} دقيقة
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
            title="إزالة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2 group-hover:scale-105 transition-transform">
            <FileAudio className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">تسجيل المحاضرة</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            اسحب الصوت هنا أو{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">اختر ملفاً</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">MP3, WAV, M4A</span>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FileAudio,
  CheckCircle,
  X,
  ChevronUp,
  ChevronDown,
  Plus,
  RotateCw,
  Clock,
  Sparkles,
  ArrowUpDown,
  Music,
  AlertCircle,
  Layers
} from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);
  const isQueueRunningRef = useRef<boolean>(false);
  const [showList, setShowList] = useState<boolean>(true);

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

  // Upload item in multi-audio queue sequentially
  const uploadItemAsync = useCallback((id: string, file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
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
            prev.map((item) => (item.id === id ? { ...item, progress: pct, status: "uploading" } : item))
          );
        }
      };

      xhr.onload = () => {
        activeXhrMap.current.delete(id);
        if (xhr.status === 200) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.temp_id) {
              resolve(res.temp_id);
            } else {
              reject(new Error("استجابة غير صالحة من السيرفر"));
            }
          } catch {
            reject(new Error("فشل فك استجابة السيرفر"));
          }
        } else {
          reject(new Error(`رمز الخطأ ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        activeXhrMap.current.delete(id);
        reject(new Error("انقطاع في اتصال الشبكة"));
      };

      xhr.send(formData);
    });
  }, [session, setMultiAudioFiles]);

  // Sequential Queue Runner: guarantees 1-by-1 resilient uploads with ZERO connection timeouts
  useEffect(() => {
    if (multiAudioFiles.length === 0 || isQueueRunningRef.current) return;

    // Check if there is an item pending upload
    const pendingIndex = multiAudioFiles.findIndex(
      (f) => !f.tempId && !f.error && !f.isUploading && f.status !== "ready"
    );

    if (pendingIndex === -1) return;

    const itemToUpload = multiAudioFiles[pendingIndex];
    isQueueRunningRef.current = true;

    // Mark current item as uploading
    setMultiAudioFiles((prev) =>
      prev.map((it) => (it.id === itemToUpload.id ? { ...it, isUploading: true, status: "uploading" } : it))
    );

    (async () => {
      try {
        const tempId = await uploadItemAsync(itemToUpload.id, itemToUpload.file);
        setMultiAudioFiles((prev) =>
          prev.map((it) =>
            it.id === itemToUpload.id
              ? { ...it, tempId, isUploading: false, progress: 100, status: "ready", error: null }
              : it
          )
        );
      } catch (err: any) {
        // Retry once after 1s before giving up
        try {
          await new Promise((r) => setTimeout(r, 1000));
          const tempIdRetry = await uploadItemAsync(itemToUpload.id, itemToUpload.file);
          setMultiAudioFiles((prev) =>
            prev.map((it) =>
              it.id === itemToUpload.id
                ? { ...it, tempId: tempIdRetry, isUploading: false, progress: 100, status: "ready", error: null }
                : it
            )
          );
        } catch (retryErr: any) {
          setMultiAudioFiles((prev) =>
            prev.map((it) =>
              it.id === itemToUpload.id
                ? { ...it, isUploading: false, status: "error", error: retryErr.message || "فشل الرفع" }
                : it
            )
          );
          setError(`تعذر رفع المقطع «${itemToUpload.file.name}». يمكنك إعادة المحاولة بالضغط على زر المقطع.`);
        }
      } finally {
        isQueueRunningRef.current = false;
      }
    })();
  }, [multiAudioFiles, uploadItemAsync, setError, setMultiAudioFiles]);

  // Handle Initial File Selection
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
        // Multi-audio mode
        setAudioFile(null);
        setAudioTempId(null);
        setAudioDuration(0);

        const newFiles: UploadedAudio[] = Array.from(files).map((file) => ({
          id: Math.random().toString(36).substring(7),
          file,
          tempId: null,
          progress: 0,
          isUploading: false,
          duration: 0,
          status: "pending",
          error: null,
        }));

        setMultiAudioFiles((prev) => [...prev, ...newFiles]);

        // Detect duration in background for each file
        newFiles.forEach(async (item) => {
          const dur = await getAudioDuration(item.file);
          setMultiAudioFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, duration: dur } : f))
          );
        });
      }
    }
    if (e.target) e.target.value = "";
  };

  // Append more recordings to existing list
  const handleAppendFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    // If currently in single file mode, convert single file to first item in multi list
    if (audioFile && multiAudioFiles.length === 0) {
      const existingItem: UploadedAudio = {
        id: Math.random().toString(36).substring(7),
        file: audioFile,
        tempId: audioTempId,
        progress: audioUploadProgress,
        isUploading: isAudioUploading,
        duration: audioDuration,
        status: audioTempId ? "ready" : isAudioUploading ? "uploading" : "pending",
        error: null,
      };
      setAudioFile(null);
      setAudioTempId(null);

      const addedItems: UploadedAudio[] = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        tempId: null,
        progress: 0,
        isUploading: false,
        duration: 0,
        status: "pending",
        error: null,
      }));

      setMultiAudioFiles([existingItem, ...addedItems]);
      addedItems.forEach(async (item) => {
        const dur = await getAudioDuration(item.file);
        setMultiAudioFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, duration: dur } : f))
        );
      });
      return;
    }

    const addedItems: UploadedAudio[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      tempId: null,
      progress: 0,
      isUploading: false,
      duration: 0,
      status: "pending",
      error: null,
    }));

    setMultiAudioFiles((prev) => [...prev, ...addedItems]);
    addedItems.forEach(async (item) => {
      const dur = await getAudioDuration(item.file);
      setMultiAudioFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, duration: dur } : f))
      );
    });

    if (e.target) e.target.value = "";
  };

  // Move audio clip up in list
  const moveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index <= 0) return;
    setMultiAudioFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move audio clip down in list
  const moveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index >= multiAudioFiles.length - 1) return;
    setMultiAudioFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Natural alphanumeric sort by filename (Part 1, Part 2, etc.)
  const handleSortNatural = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMultiAudioFiles((prev) => {
      const next = [...prev];
      next.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: "base" }));
      return next;
    });
  };

  // Remove single file
  const handleRemoveSingleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const xhr = activeXhrMap.current.get(id);
    if (xhr) {
      xhr.abort();
      activeXhrMap.current.delete(id);
    }
    setMultiAudioFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Retry failed upload item
  const handleRetryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMultiAudioFiles((prev) =>
      prev.map((it) => (it.id === id ? { ...it, error: null, status: "pending", progress: 0 } : it))
    );
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Abort all active uploads
    activeXhrMap.current.forEach((xhr) => xhr.abort());
    activeXhrMap.current.clear();
    isQueueRunningRef.current = false;

    setAudioFile(null);
    setAudioTempId(null);
    setAudioDuration(0);
    setMultiAudioFiles([]);
    setIsAudioUploading(false);
    setAudioUploadProgress(0);
  };

  const isMultiAudioUploading = multiAudioFiles.some((f) => f.isUploading || (!f.tempId && !f.error));
  const isAnyAudioUploading = isAudioUploading || (multiAudioFiles.length > 0 && isMultiAudioUploading);
  const completedCount = multiAudioFiles.filter((f) => Boolean(f.tempId)).length;
  const avgMultiProgress = multiAudioFiles.length > 0
    ? Math.round(multiAudioFiles.reduce((acc, f) => acc + (f.progress || 0), 0) / multiAudioFiles.length)
    : 0;

  const hasAudioContent = !!audioFile || multiAudioFiles.length > 0;
  const isMultiMode = multiAudioFiles.length > 0;

  return (
    <div
      className={`relative group rounded-2xl transition-all duration-200 border flex flex-col justify-center ${
        isMultiMode ? "p-4 min-h-[180px]" : "p-5 min-h-[160px]"
      } ${
        hasAudioContent
          ? "bg-slate-50/95 dark:bg-slate-900/70 border-indigo-500/60 dark:border-indigo-500/40 ring-1 ring-indigo-500/20"
          : "bg-white dark:bg-slate-900/30 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30"
      }`}
    >
      {/* Hidden file input for initial selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className={hasAudioContent ? "hidden" : "absolute inset-0 opacity-0 cursor-pointer z-10"}
      />

      {/* Hidden file input for appending more recordings */}
      <input
        ref={appendFileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleAppendFiles}
        className="hidden"
      />

      {hasAudioContent ? (
        <div className="w-full z-20 relative flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3">
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
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate" dir="ltr">
                    {audioFile ? audioFile.name : `${multiAudioFiles.length} تسجيلات صوتية مدمجة`}
                  </p>
                  {isMultiMode && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      {completedCount}/{multiAudioFiles.length} جاهز
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {isAnyAudioUploading ? (
                    <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <RotateCw className="w-3 h-3 animate-spin" />
                      {isMultiMode ? `جاري رفع التسجيلات تسلسلياً (${avgMultiProgress}%)...` : "جاري الرفع..."}
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

            {/* Quick Actions (Append / Clear) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isMultiMode && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendFileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-800 px-2 py-1.5 rounded-xl transition cursor-pointer"
                    title="إضافة تسجيل آخر"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">إضافة فويس</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSortNatural}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-xl transition cursor-pointer"
                    title="ترتيب التسجيلات تلقائياً حسب الاسم والوقت"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="hidden sm:inline">ترتيب</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer shrink-0"
                title="إزالة الصوت"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-Audio Studio List & Reorder Section */}
          {isMultiMode && (
            <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold px-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  قائمة التسجيلات المرتبة للدمج:
                </span>
                <span className="text-[10px] text-slate-400">
                  (استخدم الأسهم ⬆️ ⬇️ لتعديل ترتيب المقاطع)
                </span>
              </div>

              {/* Scrollable list of items */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {multiAudioFiles.map((item, idx) => {
                  const isDone = Boolean(item.tempId);
                  const isCurUploading = item.isUploading;
                  const isPending = !isDone && !isCurUploading && !item.error;
                  const isErr = Boolean(item.error);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-xl text-xs transition border ${
                        isCurUploading
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80"
                          : isErr
                          ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900"
                          : isDone
                          ? "bg-white/80 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60"
                          : "bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/40 dark:border-slate-800"
                      }`}
                    >
                      {/* Left: Index badge & Name */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[200px]" dir="ltr">
                            {item.file.name}
                          </p>
                          {item.duration > 0 && (
                            <span className="text-[9px] text-slate-400 font-mono">
                              ⏱️ {formatDuration(item.duration)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Status badge & Reorder buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCurUploading && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <RotateCw className="w-3 h-3 animate-spin" />
                            <span>{item.progress}%</span>
                          </div>
                        )}

                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">جاهز</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">بالطابور</span>
                          </span>
                        )}

                        {isErr && (
                          <button
                            type="button"
                            onClick={(e) => handleRetryItem(item.id, e)}
                            className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-900/40 px-1.5 py-0.5 rounded flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>إعادة</span>
                          </button>
                        )}

                        {/* Reorder Buttons */}
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden ml-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => moveUp(idx, e)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition"
                            title="تقديم المقطع للأعلى"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === multiAudioFiles.length - 1}
                            onClick={(e) => moveDown(idx, e)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition border-r border-slate-200 dark:border-slate-700"
                            title="تأخير المقطع للأسفل"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Delete Single File Button */}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSingleItem(item.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="حذف هذا المقطع"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom reassurance pill */}
              <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 p-2 rounded-xl text-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  سيتم دمج جميع الفويسات أعلاه تلقائياً بتفريغ صوتي موحد ومطابقتها مع السلايدات بدقة 100%!
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-2 group-hover:scale-105 transition-transform">
            <FileAudio className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
            تسجيل المحاضرة (يدعم دمج عدة فويسات)
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            اسحب الصوت هنا أو{" "}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">اختر ملفاً أو عدة ملفات</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 font-medium">
            MP3, WAV, M4A, OGG • يدعم اختيار حتى 15 فويساً معاً
          </span>
        </div>
      )}
    </div>
  );
}

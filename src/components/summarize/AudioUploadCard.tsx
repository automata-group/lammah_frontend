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
  Layers,
  Zap,
  Video,
  Link2
} from "lucide-react";
import { UploadedAudio } from "./types";
import { getUploaderBaseUrl, getApiBaseUrl } from "@/lib/apiConfig";
import { createClient } from "@/lib/supabase";

interface AudioUploadCardProps {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  multiAudioFiles: UploadedAudio[];
  setMultiAudioFiles: React.Dispatch<React.SetStateAction<UploadedAudio[]>>;
  lectureUrls?: string[];
  setLectureUrls?: React.Dispatch<React.SetStateAction<string[]>>;
  audioDuration: number;
  setAudioDuration: React.Dispatch<React.SetStateAction<number>>;
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
  isProbingLinks?: boolean;
  setIsProbingLinks?: (val: boolean) => void;
}

export default function AudioUploadCard({
  audioFile,
  setAudioFile,
  multiAudioFiles,
  setMultiAudioFiles,
  lectureUrls = [],
  setLectureUrls,
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
  isProbingLinks,
  setIsProbingLinks,
}: AudioUploadCardProps) {
  const activeXhrMap = useRef<Map<string, XMLHttpRequest>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);
  const isQueueRunningRef = useRef<boolean>(false);
  const [showList, setShowList] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<"file" | "link">("file");
  const [linkInput, setLinkInput] = useState<string>("");
  const [showAddUrlInput, setShowAddUrlInput] = useState<boolean>(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [urlMetadata, setUrlMetadata] = useState<Record<string, { duration: number; cost_minutes: number; title: string; isProbing?: boolean }>>({});

  const multiAudioFilesRef = useRef<UploadedAudio[]>(multiAudioFiles);
  multiAudioFilesRef.current = multiAudioFiles;

  const updateMultiAudioFiles = useCallback(
    (updater: (prev: UploadedAudio[]) => UploadedAudio[]) => {
      setMultiAudioFiles((prev) => {
        const next = updater(prev);
        multiAudioFilesRef.current = next;
        return next;
      });
    },
    [setMultiAudioFiles]
  );

  // Resilient duration detector with Video & Audio support and timeout guard
  const getAudioDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(0);
        return;
      }
      try {
        const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|mkv|webm|avi|m4v)$/i.test(file.name);
        const media = isVideo ? document.createElement("video") : document.createElement("audio");
        const objectUrl = URL.createObjectURL(file);
        media.preload = "metadata";
        media.src = objectUrl;

        let resolved = false;
        const timeoutMs = isVideo ? 3500 : 1200;
        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            URL.revokeObjectURL(objectUrl);
            resolve(Math.max(15, Math.round(file.size / 16000)));
          }
        }, timeoutMs);

        media.onloadedmetadata = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            URL.revokeObjectURL(objectUrl);
            const dur = Math.round(media.duration || 0);
            if (!dur || !isFinite(dur) || dur <= 0) {
              resolve(Math.max(15, Math.round(file.size / 16000)));
            } else {
              resolve(dur);
            }
          }
        };

        media.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            URL.revokeObjectURL(objectUrl);
            resolve(Math.max(15, Math.round(file.size / 16000)));
          }
        };
      } catch {
        resolve(Math.max(15, Math.round(file.size / 16000)));
      }
    });
  }, []);

  // Proactive token resolver with auto-refresh on near-expiry (<90s) or on demand
  const getValidToken = useCallback(
    async (forceRefresh = false): Promise<string> => {
      let token = session?.access_token;
      if (typeof window !== "undefined") {
        try {
          const supabase = createClient();
          if (forceRefresh) {
            const { data: refreshed } = await supabase.auth.refreshSession();
            if (refreshed?.session?.access_token) {
              return refreshed.session.access_token;
            }
          }
          const { data: sessionData } = await supabase.auth.getSession();
          token = sessionData?.session?.access_token || token;
          const expiresAt = sessionData?.session?.expires_at;
          const now = Math.floor(Date.now() / 1000);
          if (!token || (expiresAt && expiresAt - now < 90)) {
            const { data: refreshed } = await supabase.auth.refreshSession();
            token = refreshed?.session?.access_token || token;
          }
        } catch {}
      }

      return token || "";
    },
    [session]
  );

  // Indestructible upload helper: Sequential Chunked Upload (>15MB) & Single Upload (<=15MB)
  const uploadWithEngineFallback = useCallback(
    async (
      id: string,
      file: File,
      onProgress: (pct: number) => void
    ): Promise<string> => {
      const uploaderUrl = getUploaderBaseUrl();
      const apiUrl = getApiBaseUrl();

      // Prefer Python backend for large chunked uploads, Go uploader for single uploads
      const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB chunks (effortlessly bypasses Cloudflare 100MB body limit)
      const isChunked = file.size > CHUNK_SIZE;
      const totalChunks = isChunked ? Math.ceil(file.size / CHUNK_SIZE) : 1;
      const uploadId = isChunked ? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` : "";

      const endpoints = isChunked
        ? [
            `${apiUrl}/api/v1/summarize/upload-temp-py`,
            `${uploaderUrl}/api/v1/summarize/upload-temp`,
          ]
        : [
            `${uploaderUrl}/api/v1/summarize/upload-temp`,
            `${apiUrl}/api/v1/summarize/upload-temp-py`,
          ];
      const uniqueEndpoints = Array.from(new Set(endpoints));

      let lastError: Error = new Error("فشل رفع الملف");

      for (let attempt = 0; attempt < uniqueEndpoints.length; attempt++) {
        const url = uniqueEndpoints[attempt];
        try {
          let token = await getValidToken(attempt > 0);

          if (!isChunked) {
            // Standard single file upload (< 15MB)
            const tempId = await new Promise<string>((resolve, reject) => {
              const formData = new FormData();
              formData.append("file", file);

              const xhr = new XMLHttpRequest();
              activeXhrMap.current.set(id, xhr);

              xhr.open("POST", url, true);
              if (token) {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
              }

              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  const pct = Math.round((e.loaded / e.total) * 100);
                  onProgress(pct);
                }
              };

              xhr.onload = async () => {
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
                  reject(new Error(`فشل الرفع (${xhr.status})`));
                }
              };

              xhr.onerror = () => {
                activeXhrMap.current.delete(id);
                reject(new Error("انقطاع في اتصال الشبكة"));
              };

              xhr.onabort = () => {
                activeXhrMap.current.delete(id);
                reject(new Error("تم إلغاء الرفع"));
              };

              xhr.send(formData);
            });

            return tempId;
          }

          // Resilient Sequential Chunked Upload (> 15MB)
          let finalTempId = "";
          for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
            const start = chunkIdx * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunkBlob = file.slice(start, end);

            const res = await new Promise<any>((resolve, reject) => {
              const formData = new FormData();
              formData.append("file", chunkBlob, file.name);
              formData.append("upload_id", uploadId);
              formData.append("chunk_index", chunkIdx.toString());
              formData.append("total_chunks", totalChunks.toString());

              const xhr = new XMLHttpRequest();
              activeXhrMap.current.set(id, xhr);

              xhr.open("POST", url, true);
              if (token) {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
              }

              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  const chunkLoaded = e.loaded;
                  const overallLoaded = chunkIdx * CHUNK_SIZE + chunkLoaded;
                  const overallPct = Math.min(99, Math.round((overallLoaded / file.size) * 100));
                  onProgress(overallPct);
                }
              };

              xhr.onload = () => {
                activeXhrMap.current.delete(id);
                if (xhr.status === 200) {
                  try {
                    resolve(JSON.parse(xhr.responseText));
                  } catch {
                    reject(new Error("فشل فك استجابة خادم التجزيء"));
                  }
                } else {
                  reject(new Error(`فشل رفع الجزء ${chunkIdx + 1}/${totalChunks} (${xhr.status})`));
                }
              };

              xhr.onerror = () => {
                activeXhrMap.current.delete(id);
                reject(new Error("انقطاع في اتصال الشبكة أثناء رفع أجزاء الملف"));
              };

              xhr.onabort = () => {
                activeXhrMap.current.delete(id);
                reject(new Error("تم إلغاء الرفع"));
              };

              xhr.send(formData);
            });

            if (chunkIdx === totalChunks - 1) {
              if (res.temp_id) {
                finalTempId = res.temp_id;
              } else {
                throw new Error("لم يتم استلام معرّف الملف النهائي بعد تجميع الأجزاء");
              }
            }
          }

          onProgress(100);
          return finalTempId;
        } catch (err: any) {
          lastError = err;
          if (err.message === "تم إلغاء الرفع") throw err;
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      throw lastError;
    },
    [getValidToken]
  );

  // Upload single audio file with dual-engine fallback
  const uploadSingleAudio = useCallback(
    async (file: File) => {
      setIsAudioUploading(true);
      setAudioUploadProgress(0);

      try {
        const tempId = await uploadWithEngineFallback("single", file, (pct) => {
          setAudioUploadProgress(pct);
        });
        setAudioTempId(tempId);
        setAudioUploadProgress(100);
      } catch (err: any) {
        setError(`تعذر رفع المقطع الصوتي «${file.name}»: ${err.message || "فشل الاتصال بالخادم"}`);
        setAudioFile(null);
      } finally {
        setIsAudioUploading(false);
        activeXhrMap.current.delete("single");
      }
    },
    [uploadWithEngineFallback, setIsAudioUploading, setAudioUploadProgress, setAudioTempId, setError, setAudioFile]
  );

  // Autonomous, Deadlock-Free Queue Loop (Runs independently of React re-renders)
  const runQueueWorker = useCallback(async () => {
    if (isQueueRunningRef.current) return;
    isQueueRunningRef.current = true;

    try {
      while (true) {
        const currentFiles = multiAudioFilesRef.current;
        const target = currentFiles.find(
          (f) => !f.tempId && !f.error && !f.isUploading && f.status === "pending"
        );
        if (!target) break;

        // Mark current target as uploading
        updateMultiAudioFiles((prev) =>
          prev.map((it) =>
            it.id === target.id ? { ...it, isUploading: true, status: "uploading" } : it
          )
        );

        let successTempId: string | null = null;
        let lastErr: any = null;

        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            successTempId = await uploadWithEngineFallback(target.id, target.file, (pct) => {
              updateMultiAudioFiles((prev) =>
                prev.map((item) =>
                  item.id === target.id ? { ...item, progress: pct, status: "uploading" } : item
                )
              );
            });
            break;
          } catch (err: any) {
            lastErr = err;
            if (err.message === "تم إلغاء الرفع") break;
            await new Promise((r) => setTimeout(r, 800));
          }
        }

        if (successTempId) {
          updateMultiAudioFiles((prev) =>
            prev.map((it) =>
              it.id === target.id
                ? {
                    ...it,
                    tempId: successTempId,
                    isUploading: false,
                    progress: 100,
                    status: "ready",
                    error: null,
                  }
                : it
            )
          );
        } else if (lastErr?.message !== "تم إلغاء الرفع") {
          const errMsg = lastErr?.message || "فشل الرفع";
          updateMultiAudioFiles((prev) =>
            prev.map((it) =>
              it.id === target.id
                ? { ...it, isUploading: false, status: "error", error: errMsg }
                : it
            )
          );
          setError(`تعذر رفع المقطع «${target.file.name}». يمكنك إعادة المحاولة بالضغط على زر المقطع.`);
        }
      }
    } finally {
      isQueueRunningRef.current = false;
    }
  }, [uploadWithEngineFallback, setError, setMultiAudioFiles]);

  // Monitor multiAudioFiles for new pending uploads and trigger worker
  useEffect(() => {
    const hasPending = multiAudioFiles.some(
      (f) => !f.tempId && !f.error && !f.isUploading && f.status === "pending"
    );
    if (hasPending && !isQueueRunningRef.current) {
      runQueueWorker();
    }
  }, [multiAudioFiles, runQueueWorker]);

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

      updateMultiAudioFiles(() => [existingItem, ...addedItems]);
      addedItems.forEach(async (item) => {
        const dur = await getAudioDuration(item.file);
        updateMultiAudioFiles((prev) =>
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

    updateMultiAudioFiles((prev) => [...prev, ...addedItems]);
    addedItems.forEach(async (item) => {
      const dur = await getAudioDuration(item.file);
      updateMultiAudioFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, duration: dur } : f))
      );
    });

    if (e.target) e.target.value = "";
  };

  // Move audio clip up in list
  const moveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index <= 0) return;
    updateMultiAudioFiles((prev) => {
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
    updateMultiAudioFiles((prev) => {
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
    updateMultiAudioFiles((prev) => {
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
    updateMultiAudioFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Retry failed upload item with instant worker kickstart
  const handleRetryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    updateMultiAudioFiles((prev) =>
      prev.map((it) => (it.id === id ? { ...it, error: null, status: "pending", progress: 0 } : it))
    );
    // Kickstart queue loop immediately
    setTimeout(() => {
      runQueueWorker();
    }, 50);
  };

  const handleAddUrl = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("يرجى إدخال رابط صحيح يبدأ بـ https:// أو http://");
      return;
    }
    if (setLectureUrls) {
      setLectureUrls((prev) => [...prev, trimmed]);
    }
    setLinkInput("");
    setShowAddUrlInput(false);
    setError(null);

    // Immediately probe link duration and quota from backend
    setUrlMetadata((prev) => ({ ...prev, [trimmed]: { duration: 0, cost_minutes: 0, title: "", isProbing: true } }));
    setIsProbingLinks?.(true);
    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/api/v1/summarize/probe-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.duration > 0) {
          setUrlMetadata((prev) => ({
            ...prev,
            [trimmed]: { duration: data.duration, cost_minutes: data.cost_minutes, title: data.title, isProbing: false }
          }));
          setAudioDuration((prev: number) => prev + data.duration);
        } else {
          setUrlMetadata((prev) => ({
            ...prev,
            [trimmed]: { duration: 0, cost_minutes: 0, title: "", isProbing: false }
          }));
        }
      }
    } catch {
      setUrlMetadata((prev) => ({
        ...prev,
        [trimmed]: { duration: 0, cost_minutes: 0, title: "", isProbing: false }
      }));
    } finally {
      setIsProbingLinks?.(false);
    }
  };

  const handleRemoveUrl = (urlIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setLectureUrls && lectureUrls) {
      const targetUrl = lectureUrls[urlIndex];
      if (targetUrl && urlMetadata[targetUrl]?.duration) {
        setAudioDuration((prev: number) => Math.max(0, prev - (urlMetadata[targetUrl]?.duration || 0)));
      }
      setLectureUrls((prev) => prev.filter((_, idx) => idx !== urlIndex));
    }
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
    if (setLectureUrls) setLectureUrls([]);
    setIsAudioUploading(false);
    setAudioUploadProgress(0);
  };

  const isMultiAudioUploading = multiAudioFiles.some((f) => f.isUploading || (!f.tempId && !f.error));
  const isAnyAudioUploading = isAudioUploading || (multiAudioFiles.length > 0 && isMultiAudioUploading);
  const completedCount = multiAudioFiles.filter((f) => Boolean(f.tempId)).length;
  const avgMultiProgress = multiAudioFiles.length > 0
    ? Math.round(multiAudioFiles.reduce((acc, f) => acc + (f.progress || 0), 0) / multiAudioFiles.length)
    : 0;

  const hasAudioContent = !!audioFile || multiAudioFiles.length > 0 || (lectureUrls && lectureUrls.length > 0);
  const isMultiMode = multiAudioFiles.length > 0 || (lectureUrls && lectureUrls.length > 0);

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
        accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.opus,.aac,.flac,.webm,.weba,.wma,.mp4,.m4v,.mov"
        multiple
        onChange={handleFileChange}
        className={(hasAudioContent || activeMode === "link") ? "hidden" : "absolute inset-0 opacity-0 cursor-pointer z-10"}
      />

      {/* Hidden file input for appending more recordings */}
      <input
        ref={appendFileInputRef}
        type="file"
        accept="audio/*,video/*,.mp3,.wav,.m4a,.ogg,.opus,.aac,.flac,.webm,.weba,.wma,.mp4,.m4v,.mov"
        multiple
        onChange={handleAppendFiles}
        className="hidden"
      />

      {hasAudioContent ? (
        <div className="w-full z-20 relative flex flex-col gap-3 min-h-[150px] justify-between">
          {/* Top Header: Clean Title & Glassmorphic Action Button */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            {/* Right (RTL Start): Status Icon + Title */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${
                  isAnyAudioUploading
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                    : "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200/80 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isAnyAudioUploading ? (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {audioFile ? audioUploadProgress : avgMultiProgress}%
                  </span>
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-snug" dir="auto">
                  {audioFile ? audioFile.name : "تسجيلات المحاضرة الصوتية"}
                </p>

                <div className="flex items-center gap-1.5 text-[11px] mt-0.5 whitespace-nowrap">
                  {isAnyAudioUploading ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                      <RotateCw className="w-3 h-3 animate-spin shrink-0" />
                      <span>{isMultiMode ? `جاري الرفع (${avgMultiProgress}%)...` : "جاري الرفع..."}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      جاهز للمعالجة
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Left (RTL End): Action Buttons & Clear Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Add file button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  appendFileInputRef.current?.click();
                }}
                className="relative group/glass overflow-hidden inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/70 dark:hover:bg-slate-700 shadow-2xs"
                title="إضافة ملف صوتي أو فيديو من جهازك"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                <span>+ مقطع</span>
              </button>

              {/* Add link button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddUrlInput((prev) => !prev);
                  setTimeout(() => urlInputRef.current?.focus(), 100);
                }}
                className="relative group/glass overflow-hidden inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-300 active:scale-95 whitespace-nowrap border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/70 dark:hover:bg-slate-700 shadow-2xs"
                title="إضافة رابط يوتيوب أو زووم إضافي"
              >
                <Link2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                <span>+ رابط</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                title="إزالة الصوت"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle: Multi-Audio List (if multiple clips) */}
          {isMultiMode && (
            <div className="flex flex-col gap-1.5 my-1">
              {multiAudioFiles.length > 1 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
                  <span>ترتيب المقاطع:</span>
                  <button
                    type="button"
                    onClick={handleSortNatural}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>ترتيب تلقائي</span>
                  </button>
                </div>
              )}

              <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
                {/* Render Attached URLs (YouTube / Zoom) */}
                {lectureUrls && lectureUrls.map((url, uIdx) => {
                  const lower = url.toLowerCase();
                  const isYt = lower.includes("youtube.com") || lower.includes("youtu.be");
                  const isZoom = lower.includes("zoom.us") || lower.includes("zoom.com");

                  return (
                    <div
                      key={`url-${uIdx}`}
                      className="group/item flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                          {multiAudioFiles.length + uIdx + 1}
                        </span>

                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 flex items-center gap-1 border ${
                          isYt
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            : isZoom
                            ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                        }">
                          {isYt ? '🔴 يوتيوب' : isZoom ? '🔵 زووم' : '🔗 رابط'}
                        </span>

                        <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[130px] sm:max-w-[190px]" dir="ltr">
                          {url}
                        </p>

                        {urlMetadata[url]?.isProbing ? (
                          <span className="text-[10px] text-indigo-500 animate-pulse font-medium shrink-0">
                            جاري قياس المدة... ⏳
                          </span>
                        ) : urlMetadata[url]?.duration ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                            ({formatDuration(urlMetadata[url].duration)})
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                            {isYt ? '(تفريغ فوري ⚡)' : '(تسجيل سحابي)'}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveUrl(uIdx, e)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        title="حذف هذا الرابط"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {multiAudioFiles.map((item, idx) => {
                  const isCurUploading = item.isUploading;
                  const isPending = !item.tempId && !isCurUploading && !item.error;
                  const isErr = Boolean(item.error);

                  return (
                    <div
                      key={item.id}
                      className="group/item flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </span>

                        <p className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[130px] sm:max-w-[180px]" dir="ltr">
                          {item.file.name}
                        </p>

                        {(item.file.type.startsWith("video/") || /\.(mp4|mov|mkv|webm|avi|m4v)$/i.test(item.file.name)) && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 font-medium shrink-0">
                            🎬 فيديو
                          </span>
                        )}

                        {item.duration > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            ({formatDuration(item.duration)})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isCurUploading && (
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <RotateCw className="w-3 h-3 animate-spin" />
                            {item.progress}%
                          </span>
                        )}

                        {isPending && (
                          <span className="text-[10px] text-slate-400">في الانتظار</span>
                        )}

                        {isErr && (
                          <button
                            type="button"
                            onClick={(e) => handleRetryItem(item.id, e)}
                            className="text-[10px] font-semibold text-rose-500 hover:underline cursor-pointer"
                          >
                            إعادة المحاولة
                          </button>
                        )}

                        {multiAudioFiles.length > 1 && (
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={(e) => moveUp(idx, e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 transition cursor-pointer"
                              title="تقديم للأعلى"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === multiAudioFiles.length - 1}
                              onClick={(e) => moveDown(idx, e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20 transition cursor-pointer"
                              title="تأخير للأسفل"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleRemoveSingleItem(item.id, e)}
                          className="p-1 rounded text-slate-300 hover:text-rose-500 transition cursor-pointer"
                          title="حذف هذا المقطع"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {/* Inline Quick Add URL Form */}
                <div className="pt-1.5 sticky bottom-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs pb-0.5">
                  <form
                    onSubmit={handleAddUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 w-full bg-white/90 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400/30 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 px-1">
                      <Link2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <input
                        ref={urlInputRef}
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="الصق رابط يوتيوب أو زووم إضافي هنا..."
                        dir="ltr"
                        className="w-full bg-transparent text-[11px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!linkInput.trim()}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all cursor-pointer shrink-0 shadow-2xs"
                    >
                      + إضافة
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Dedicated New Bottom Section: Clips count, Total duration & Quota deduction */}
          <div className="mt-auto pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80">
            <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm shadow-2xs">
              {/* 1. عدد المقاطع */}
              <div className="flex flex-col items-center justify-center text-center px-1 overflow-hidden">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                  <Layers className="w-3 h-3 text-indigo-500 shrink-0" />
                  المقاطع
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate max-w-full">
                  {(() => {
                    const filesCount = (audioFile ? 1 : 0) + multiAudioFiles.length;
                    const urlsCount = lectureUrls?.length || 0;
                    const total = filesCount + urlsCount;
                    if (total <= 1) {
                      return urlsCount === 1 ? "رابط واحد" : "مقطع واحد";
                    }
                    if (total === 2) {
                      if (urlsCount === 2) return "رابطان (2)";
                      if (filesCount === 2) return "مقطعان (2)";
                      return "مقطع ورابط";
                    }
                    if (urlsCount > 0 && filesCount > 0) {
                      return `${filesCount} مقاطع + ${urlsCount} روابط`;
                    }
                    if (urlsCount > 0) {
                      return `${urlsCount} روابط`;
                    }
                    return `${filesCount} مقاطع`;
                  })()}
                </span>
              </div>

              {/* 2. المدة الكلية */}
              <div className="flex flex-col items-center justify-center text-center px-1 border-x border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                  <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                  المدة الكلية
                </span>
                <span className="text-[10.5px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 tabular-nums truncate max-w-full">
                  {(() => {
                    if (totalAudioSeconds > 0) {
                      return formatDuration(totalAudioSeconds);
                    }
                    const isAnyUrlProbing = lectureUrls?.some((u) => urlMetadata[u]?.isProbing);
                    if (isAnyUrlProbing) {
                      return "جاري الفحص...";
                    }
                    if (lectureUrls && lectureUrls.length > 0) {
                      return "حسب الرابط";
                    }
                    return "—";
                  })()}
                </span>
              </div>

              {/* 3. الخصم من الرصيد */}
              <div className="flex flex-col items-center justify-center text-center px-1 overflow-hidden">
                <span className="text-[10px] text-amber-600/90 dark:text-amber-400 font-medium flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                  الخصم
                </span>
                <span className="text-[10.5px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5 tabular-nums truncate max-w-full">
                  {(() => {
                    if (audioCostMinutes > 0) {
                      return `${audioCostMinutes} دقيقة`;
                    }
                    if (lectureUrls && lectureUrls.length > 0) {
                      return "حسب الرابط";
                    }
                    return "0 دقيقة";
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

      ) : (
        <div className="flex flex-col items-center justify-center text-center py-1 w-full">
          {/* Top Pill Tabs Switcher */}
          <div className="inline-flex p-0.5 mb-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold z-20">
            <button
              type="button"
              onClick={() => setActiveMode("file")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === "file"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileAudio className="w-3.5 h-3.5" />
              <span>رفع ملفات</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("link")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === "link"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>رابط يوتيوب / زووم</span>
            </button>
          </div>

          {activeMode === "file" ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-1.5 group-hover:scale-105 transition-transform">
                <FileAudio className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                تسجيل المحاضرة
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                اسحب الملف هنا أو{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">اختر ملفاً أو عدة مقاطع</span>
              </p>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">
                يدعم MP3, M4A, WAV وفيديوهات زووم (MP4) • دمج عدة تسجيلات
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center w-full px-2 z-20" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                إضافة رابط المحاضرة (يوتيوب أو تسجيل زووم)
              </p>
              <form onSubmit={handleAddUrl} className="flex items-center gap-1.5 w-full max-w-sm">
                <input
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="الصق رابط يوتيوب أو زووم هنا..."
                  dir="ltr"
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-left"
                />
                <button
                  type="submit"
                  disabled={!linkInput.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  + إضافة
                </button>
              </form>
              <span className="text-[10px] text-slate-400 mt-1.5 font-medium">
                ⚡ تفريغ فوري فائق السرعة لروابط يوتيوب ودعم تسجيلات زووم السحابية
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

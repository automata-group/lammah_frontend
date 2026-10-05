"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Sparkles, 
  Download, 
  ArrowLeft, 
  Share2, 
  Check, 
  Sun, 
  Moon, 
  Layers, 
  Bookmark, 
  Plus, 
  RotateCcw,
  CheckCircle2,
  Lock,
  Loader2,
  FolderOpen,
  Presentation,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  MoreVertical,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import PDFCanvasViewer from "@/components/study/PDFCanvasViewer";
import FocusSheet from "@/components/study/FocusSheet";
import AIAssistantModal from "@/components/study/AIAssistantModal";
import VaultLibraryModal from "@/components/study/VaultLibraryModal";
import StudyInstructionsHub from "@/components/study/StudyInstructionsHub";
import { useStudyNotes, StudyNote } from "@/hooks/useStudyNotes";
import {
  saveDocumentToVault,
  getAllVaultDocuments,
  getDocumentFromVault,
  touchVaultDocument,
  deleteDocumentFromVault,
  VaultDocument
} from "@/lib/studyVault";

function StudyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [quota, setQuota] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const cachedQuota = localStorage.getItem("cached_user_quota");
      if (cachedQuota !== null && !isNaN(Number(cachedQuota))) return Number(cachedQuota);
    }
    return null;
  });

  // Document states
  const [pdfSource, setPdfSource] = useState<string | File | Blob | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("مساحة المذاكرة المركزة — تعليمات وإرشادات");
  const [documentId, setDocumentId] = useState<string>("welcome_guide");
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Navigation & Page Tracking
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Focus Sheet State
  const [isFocusSheetOpen, setIsFocusSheetOpen] = useState<boolean>(false);
  const [targetFocusPage, setTargetFocusPage] = useState<number>(1);

  // AI Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  // Vault Library State
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [vaultDocuments, setVaultDocuments] = useState<Omit<VaultDocument, "blob">[]>([]);
  const [isConvertingPPTX, setIsConvertingPPTX] = useState<boolean>(false);
  const [conversionMessage, setConversionMessage] = useState<string>("");
  const [statusNotification, setStatusNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setStatusNotification({ text, type });
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  }, []);

  // Load notes hook for active document
  const {
    notes,
    saveNote,
    deleteNote,
    getNotesForPage,
    pageNotesCountMap,
    totalNotesCount,
  } = useStudyNotes(documentId);

  // Refresh vault documents list
  const refreshVault = async () => {
    try {
      const docs = await getAllVaultDocuments();
      setVaultDocuments(docs);
      return docs;
    } catch (e) {
      console.error("Failed to read vault:", e);
      return [];
    }
  };

  // Initial load: either URL param, last opened vault doc, or sample demo
  useEffect(() => {
    const initDoc = async () => {
      const urlParam = searchParams.get("pdf_url") || searchParams.get("doc");
      const titleParam = searchParams.get("title");

      if (urlParam) {
        setPdfSource(urlParam);
        const autoId = urlParam.replace(/[^a-zA-Z0-9]/g, "_").slice(-30);
        setDocumentId(autoId);
        if (titleParam) setDocumentTitle(titleParam);
        await refreshVault();
        return;
      }

      // Check if user has saved documents in local vault
      const docs = await refreshVault();
      if (docs.length > 0) {
        // Restore most recently opened document
        const mostRecent = docs[0];
        const fullDoc = await getDocumentFromVault(mostRecent.id);
        if (fullDoc && fullDoc.blob) {
          setPdfSource(fullDoc.blob);
          setDocumentTitle(fullDoc.name);
          setDocumentId(fullDoc.id);
          if (fullDoc.totalPages) setTotalPages(fullDoc.totalPages);
          await touchVaultDocument(fullDoc.id);
          return;
        }
      }

      // No dummy file by default! Show the clean, professional instructions hub
      setPdfSource(null);
      setDocumentTitle("مساحة المذاكرة المركزة — تعليمات وإرشادات");
      setDocumentId("welcome_guide");
    };

    initDoc();
  }, [searchParams]);

  // Update totalPages in vault when viewer parses PDF
  useEffect(() => {
    if (totalPages > 1 && documentId && !documentId.startsWith("sample_") && !documentId.startsWith("welcome_")) {
      getDocumentFromVault(documentId).then((doc) => {
        if (doc && (!doc.totalPages || doc.totalPages !== totalPages)) {
          saveDocumentToVault(doc.id, doc.name, doc.blob, doc.type, totalPages);
          refreshVault();
        }
      });
    }
  }, [totalPages, documentId]);

  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const dragCounterRef = useRef<number>(0);

  // Unified File Processor (PDF, PPTX, or Images)
  const processFiles = useCallback(async (files: File[]) => {
    if (!files || files.length === 0) return;
    const firstFile = files[0];

    // Detect image files (PNG, JPG, JPEG, WebP, etc.)
    const imageFiles = files.filter(
      (f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|bmp|gif|avif)$/i.test(f.name)
    );

    // 1. If user uploaded image(s): Convert in-memory (RAM) with 0 disk storage footprint!
    if (imageFiles.length > 0) {
      try {
        showToast("⚡ جاري تجهيز الصور بالذاكرة المؤقتة (RAM)...", "success");
        const { convertImagesToPdfBlob } = await import("@/lib/imageToPdf");
        const { blob, pageCount, title } = await convertImagesToPdfBlob(imageFiles);

        // Ephemeral in-memory session (0 bytes stored on disk / IndexedDB)
        const ephemeralId = `ephemeral_img_${Date.now()}`;
        setPdfSource(blob);
        setDocumentTitle(title);
        setDocumentId(ephemeralId);
        setCurrentPage(1);
        setTotalPages(pageCount);
        setShowInstructions(false);

        showToast(
          `⚡ تم فتح ${imageFiles.length} صورة بنجاح بالذاكرة المؤقتة (RAM) — 0 بايت من مساحة جهازك!`
        );
      } catch (err: any) {
        console.error("Image conversion error:", err);
        showToast("تعذر معالجة الصور المختارة. يرجى التأكد من صيغة الصور.", "error");
      }
      return;
    }

    const isPPTX = firstFile.name.toLowerCase().endsWith(".pptx") || firstFile.name.toLowerCase().endsWith(".ppt");
    const isPDF = firstFile.name.toLowerCase().endsWith(".pdf") || firstFile.type === "application/pdf";

    if (!isPPTX && !isPDF) {
      showToast("يرجى اختيار ملف PDF أو PowerPoint (.pptx) أو صور (PNG, JPG, WebP)", "error");
      return;
    }

    if (isPPTX) {
      setIsConvertingPPTX(true);
      setConversionMessage("✨ نجهز لك تجربة قراءة ومذاكرة تفاعلية وسلسة، لحظات قليلة وسيكون ملفك جاهزاً...");

      try {
        const formData = new FormData();
        formData.append("file", firstFile);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";
        const res = await fetch(`${apiUrl}/api/v1/summarize/convert-pptx-stream`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail?.user_message || "تعذر تحويل ملف البوربوينت");
        }

        const pdfBlob = await res.blob();
        const docId = `pptx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const cleanName = firstFile.name.replace(/\.pptx?$/i, "") + " (عرض بوربوينت).pdf";

        // Save straight to browser IndexedDB
        await saveDocumentToVault(docId, cleanName, pdfBlob, "pptx_converted");
        await refreshVault();

        // Set as active
        setPdfSource(pdfBlob);
        setDocumentTitle(cleanName);
        setDocumentId(docId);
        setCurrentPage(1);
        setShowInstructions(false);

        showToast("✅ تم تحويل شرائح العرض التقديمي بنجاح وحفظها في خزينة جهازك المحلية!");
      } catch (err: any) {
        console.error("PPTX conversion error:", err);
        showToast(err.message || "حدث خطأ أثناء معالجة ملف البوربوينت", "error");
      } finally {
        setIsConvertingPPTX(false);
        setConversionMessage("");
      }
    } else {
      // PDF File: Save to IndexedDB directly (0 MB Server cost)
      try {
        const docId = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await saveDocumentToVault(docId, firstFile.name, firstFile, "pdf");
        await refreshVault();

        setPdfSource(firstFile);
        setDocumentTitle(firstFile.name);
        setDocumentId(docId);
        setCurrentPage(1);
        setShowInstructions(false);

        showToast("✅ تم فتح الملف وحفظه بأمان في خزينة جهازك المحلية!");
      } catch (err) {
        console.error("Error saving PDF to vault:", err);
        setPdfSource(firstFile);
        setDocumentTitle(firstFile.name);
        setDocumentId(`local_${Date.now()}`);
        setCurrentPage(1);
        setShowInstructions(false);
      }
    }
  }, []);

  // Handle local File Upload (PDF, PPTX, or Images)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    await processFiles(Array.from(fileList));
  };

  // Unified Drop Processor: works ANYWHERE on screen for Pinterest, web images, or files
  const processDroppedData = useCallback(
    async (dataTransfer: DataTransfer) => {
      // 1. Check for files (dragged from desktop or file manager)
      let files: File[] = [];
      if (dataTransfer.files && dataTransfer.files.length > 0) {
        files = Array.from(dataTransfer.files);
      } else if (dataTransfer.items && dataTransfer.items.length > 0) {
        for (let i = 0; i < dataTransfer.items.length; i++) {
          const item = dataTransfer.items[i];
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
      }

      if (files.length > 0) {
        await processFiles(files);
        return;
      }

      // 2. Check for web image URL (Pinterest, Google Images, or any website)
      const { extractImageUrlFromDataTransfer, fetchImageFileFromUrl, convertImagesToPdfBlob } =
        await import("@/lib/imageToPdf");
      const imageUrl = extractImageUrlFromDataTransfer(dataTransfer);

      if (imageUrl) {
        try {
          showToast("⚡ جاري جلب الصورة من بنترست بالذاكرة المؤقتة (RAM)...", "success");
          const imageFile = await fetchImageFileFromUrl(imageUrl, "صورة_بنترست.jpg");
          const { blob, pageCount } = await convertImagesToPdfBlob([imageFile]);

          const ephemeralId = `ephemeral_pinterest_${Date.now()}`;
          setPdfSource(blob);
          setDocumentTitle("صورة دراسية من بنترست 📌.pdf");
          setDocumentId(ephemeralId);
          setCurrentPage(1);
          setTotalPages(pageCount);
          setShowInstructions(false);

          showToast("⚡ تم فتح صورة بنترست فورياً بالذاكرة (RAM) — 0 بايت من مساحة جهازك!");
        } catch (err: any) {
          console.error("Pinterest image drop error:", err);
          showToast("تعذر جلب صورة بنترست مباشرة. يمكنك نسخ الصورة ولصقها (Ctrl+V).", "error");
        }
        return;
      }

      // 3. Fallback: check plain text if it contains an http/https link
      try {
        const text = dataTransfer.getData("text/plain")?.trim();
        if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
          showToast("⚡ جاري فحص الرابط الملقى وجلب الصورة بالذاكرة...", "success");
          const imageFile = await fetchImageFileFromUrl(text, "صورة_مجلوبة.jpg");
          const { blob, pageCount } = await convertImagesToPdfBlob([imageFile]);

          const ephemeralId = `ephemeral_url_${Date.now()}`;
          setPdfSource(blob);
          setDocumentTitle("صورة دراسية 🌐.pdf");
          setDocumentId(ephemeralId);
          setCurrentPage(1);
          setTotalPages(pageCount);
          setShowInstructions(false);

          showToast("⚡ تم فتح الصورة فورياً بالذاكرة (RAM) — 0 بايت من مساحة جهازك!");
        }
      } catch (fallbackErr) {
        console.warn("Fallback link drop error:", fallbackErr);
      }
    },
    [processFiles]
  );

  // Global Drag & Drop & Paste listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      setIsDraggingOver(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);

      if (e.dataTransfer) {
        await processDroppedData(e.dataTransfer);
      }
    };

    // Global Paste listener (Ctrl+V from clipboard - supports both images and Pinterest URLs)
    const handlePaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      // Do not intercept if student is typing inside an input or textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      const items = Array.from(e.clipboardData.items);
      const imageItems = items.filter((item) => item.type.startsWith("image/"));

      if (imageItems.length > 0) {
        e.preventDefault();
        try {
          showToast("⚡ جاري تجهيز الصورة بالذاكرة المؤقتة (RAM)...", "success");
          const { convertImagesToPdfBlob } = await import("@/lib/imageToPdf");
          const files: File[] = [];
          for (const item of imageItems) {
            const f = item.getAsFile();
            if (f) files.push(f);
          }

          if (files.length > 0) {
            const { blob, pageCount, title } = await convertImagesToPdfBlob(files);
            const ephemeralId = `ephemeral_paste_${Date.now()}`;
            setPdfSource(blob);
            setDocumentTitle("صورة دراسية من الحافظة 📋.pdf");
            setDocumentId(ephemeralId);
            setCurrentPage(1);
            setTotalPages(pageCount);
            setShowInstructions(false);

            showToast("⚡ تم فتح الصورة فورياً بالذاكرة (RAM) — 0 بايت من مساحة جهازك!");
          }
        } catch (err) {
          console.error("Paste error:", err);
        }
        return;
      }

      // If user pasted a URL (e.g. copied Pinterest pin link or image address)
      const pastedText = e.clipboardData.getData("text/plain")?.trim();
      if (
        pastedText &&
        (pastedText.startsWith("http://") || pastedText.startsWith("https://")) &&
        (pastedText.includes("pinterest.") || pastedText.includes("pin.it/") || pastedText.includes("pinimg.com") || /\.(png|jpe?g|webp|gif)($|\?)/i.test(pastedText))
      ) {
        e.preventDefault();
        try {
          showToast("⚡ جاري جلب صورة الرابط بالذاكرة المؤقتة (RAM)...", "success");
          const { fetchImageFileFromUrl, convertImagesToPdfBlob } = await import("@/lib/imageToPdf");
          const imageFile = await fetchImageFileFromUrl(pastedText, "صورة_ملصوقة.jpg");
          const { blob, pageCount } = await convertImagesToPdfBlob([imageFile]);

          const ephemeralId = `ephemeral_pasted_url_${Date.now()}`;
          setPdfSource(blob);
          setDocumentTitle("صورة دراسية من الرابط 📌.pdf");
          setDocumentId(ephemeralId);
          setCurrentPage(1);
          setTotalPages(pageCount);
          setShowInstructions(false);

          showToast("⚡ تم فتح الصورة فورياً بالذاكرة (RAM) — 0 بايت من مساحة جهازك!");
        } catch (pasteErr) {
          console.error("Pasted URL error:", pasteErr);
          showToast("تعذر جلب الصورة من الرابط المنسوخ.", "error");
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePaste);
    };
  }, [processDroppedData]);

  // Switch to another document from Vault
  const handleSelectVaultDoc = async (id: string) => {
    try {
      const doc = await getDocumentFromVault(id);
      if (!doc || !doc.blob) {
        showToast("تعذر العثور على الملف في الذاكرة المحلية", "error");
        return;
      }

      setPdfSource(doc.blob);
      setDocumentTitle(doc.name);
      setDocumentId(doc.id);
      setCurrentPage(1);
      setShowInstructions(false);
      if (doc.totalPages) setTotalPages(doc.totalPages);
      await touchVaultDocument(id);
      await refreshVault();
      showToast(`تم فتح: ${doc.name}`);
    } catch (err) {
      console.error("Error selecting vault doc:", err);
    }
  };

  // Delete document from Vault
  const handleDeleteVaultDoc = async (id: string) => {
    try {
      await deleteDocumentFromVault(id);
      const updated = await refreshVault();
      showToast("تم حذف المستند من خزينتك المحلية");

      // If active doc was deleted, switch to next or instructions
      if (id === documentId) {
        if (updated.length > 0) {
          handleSelectVaultDoc(updated[0].id);
        } else {
          setPdfSource(null);
          setDocumentTitle("مساحة المذاكرة المركزة — تعليمات وإرشادات");
          setDocumentId("welcome_guide");
          setCurrentPage(1);
          setShowInstructions(true);
        }
      }
    } catch (err) {
      console.error("Error deleting vault doc:", err);
    }
  };

  // Clear all documents from Vault
  const handleClearAllVaultDocs = async () => {
    try {
      const { clearAllVaultDocuments } = await import("@/lib/studyVault");
      await clearAllVaultDocuments();
      await refreshVault();
      setPdfSource(null);
      setDocumentTitle("مساحة المذاكرة المركزة — تعليمات وإرشادات");
      setDocumentId("welcome_guide");
      setCurrentPage(1);
      setShowInstructions(true);
      showToast("تم تفريغ الخزينة المحلية بنجاح");
    } catch (err) {
      console.error("Error clearing vault:", err);
    }
  };

  // Canva-style: Create a brand new blank, ruled, or math grid notebook
  const handleCreateNewBlankNotebook = async (style: "blank" | "ruled" | "grid" = "ruled") => {
    try {
      showToast("✨ نجهز لك دفتر ملاحظات دراسي جديد...", "success");
      const { createBlankNotebookBlob } = await import("@/lib/createBlankNotebook");
      const { blob, pageCount, title } = await createBlankNotebookBlob(style);
      const docId = `notebook_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      await saveDocumentToVault(docId, title, blob, "blank_notebook", pageCount);
      await refreshVault();

      setPdfSource(blob);
      setDocumentTitle(title);
      setDocumentId(docId);
      setCurrentPage(1);
      setTotalPages(pageCount);
      setShowInstructions(false);
      showToast("✅ تم فتح دفتر الملاحظات بالمحرر بنجاح!");
    } catch (err) {
      console.error("Failed to create blank notebook:", err);
      showToast("تعذر إنشاء دفتر الملاحظات", "error");
    }
  };

  const handleOpenFocusSheet = (page: number) => {
    setTargetFocusPage(page);
    setIsFocusSheetOpen(true);
  };

  // Export Combined Annotated Study Guide
  const handleExportStudyGuide = () => {
    if (notes.length === 0) {
      alert("لا توجد ملاحظات مسجلة بعد في هذا المستند لتصديرها.");
      return;
    }

    let guideContent = `# دفتر ملخص وملاحظات التركيز: ${documentTitle}\n\n`;
    guideContent += `تاريخ التصدير: ${new Date().toLocaleDateString("ar-EG")}\n`;
    guideContent += `إجمالي الملاحظات المسجلة: ${notes.length} ملاحظة\n\n---\n\n`;

    // Group notes by page
    const sortedPages = Array.from(new Set(notes.map((n) => n.pageNumber))).sort((a, b) => a - b);

    sortedPages.forEach((pg) => {
      guideContent += `## 📌 الصفحة ${pg}\n\n`;
      const pageNotes = notes.filter((n) => n.pageNumber === pg);
      pageNotes.forEach((note, idx) => {
        if (note.title) guideContent += `### ${idx + 1}. ${note.title}\n`;
        if (note.content) guideContent += `${note.content}\n\n`;
        if (note.tags && note.tags.length > 0) {
          guideContent += `*التصنيفات:* ${note.tags.join(" • ")}\n\n`;
        }
      });
      guideContent += `---\n\n`;
    });

    const blob = new Blob([guideContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ملاحظات_${documentTitle.replace(".pdf", "")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative transition-colors duration-300" dir="rtl">
      
      {/* ── Ambient Aura Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full dark:from-indigo-600/15 dark:via-purple-600/10 pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* ── Top Navigation: Unified AppHeader in Bento Hub / Focused Bar in Reading Mode ── */}
      {!pdfSource || showInstructions ? (
        <AppHeader quota={quota} activePage="study" />
      ) : (
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            
            {/* Left: Back to Bento Hub & Document Info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-black transition flex items-center gap-1.5 cursor-pointer border border-indigo-200/80 dark:border-indigo-500/20 shadow-xs"
                title="العودة للوحة الملاحظات"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>لوحة الملاحظات</span>
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[170px] xs:max-w-[220px] sm:max-w-md">
                    {documentTitle}
                  </h1>
                  <div className="text-[10px] text-slate-400 font-bold hidden sm:block">
                    صفحة {currentPage} من {totalPages} • وضع المذاكرة المركزة
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Vault Library Button */}
              <button
                type="button"
                onClick={() => setIsVaultModalOpen(true)}
                className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-800"
                title="مكتبة ملفاتي"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden md:inline">مكتبة ملفاتي</span>
                {vaultDocuments.length > 0 && (
                  <span className="bg-indigo-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                    {vaultDocuments.length}
                  </span>
                )}
              </button>

              {/* Upload file */}
              <label 
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200/80 dark:border-slate-800" 
                title="فتح ملف آخر"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden xl:inline">ملف آخر</span>
                <input 
                  type="file" 
                  accept=".pdf,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                  multiple
                  onChange={handleFileUpload} 
                  className="hidden" 
                  disabled={isConvertingPPTX}
                />
              </label>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Close Document */}
              <button
                type="button"
                onClick={() => {
                  setPdfSource(null);
                  setDocumentTitle("مساحة المذاكرة المركزة — تعليمات وإرشادات");
                  setDocumentId("welcome_guide");
                  setShowInstructions(true);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                title="إغلاق المستند"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>
      )}

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {statusNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black backdrop-blur-md border ${
              statusNotification.type === "success"
                ? "bg-emerald-900/90 text-white border-emerald-500/30"
                : "bg-rose-900/90 text-white border-rose-500/30"
            }`}
          >
            {statusNotification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusNotification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Converting PowerPoint Overlay ── */}
      <AnimatePresence>
        {isConvertingPPTX && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl mb-4 animate-bounce">
              <Presentation className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-2">
              جاري تجهيز العرض التقديمي للمذاكرة...
            </h3>
            <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
              {conversionMessage}
            </p>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري تحويل وتنسيق الشرائح بجودة عالية...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drag and Drop Live Overlay (Pinterest & File Drop anywhere when studying) ── */}
      <AnimatePresence>
        {isDraggingOver && pdfSource && !showInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer) {
                e.dataTransfer.dropEffect = "copy";
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.currentTarget === e.target) {
                dragCounterRef.current = 0;
                setIsDraggingOver(false);
              }
            }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              dragCounterRef.current = 0;
              setIsDraggingOver(false);
              if (e.dataTransfer) {
                await processDroppedData(e.dataTransfer);
              }
            }}
            className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none cursor-copy pointer-events-auto"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl mb-4 animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-2">
              أفلت الصورة في أي مكان للبدء بالمذاكرة فورياً 📌
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-md leading-relaxed mb-3">
              مباشرة من بنترست أو أي موقع إلى مساحة المذاكرة — بالذاكرة المؤقتة (RAM) وبدون تنزيل أي شيء على جهازك!
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>0 بايت من مساحة جهازك • خصوصية تامة</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Study Workspace ── */}
      <div 
        onDragOver={(e) => {
          e.preventDefault();
          if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={async (e) => {
          e.preventDefault();
          if (e.dataTransfer) await processDroppedData(e.dataTransfer);
        }}
        className="flex-1 max-w-7xl w-full mx-auto px-0.5 sm:px-4 py-1 sm:py-4 flex flex-col items-center justify-start overflow-x-hidden"
      >
        {!pdfSource || showInstructions ? (
          <StudyInstructionsHub
            onUploadFile={handleFileUpload}
            onDropFiles={processFiles}
            onOpenVault={() => setIsVaultModalOpen(true)}
            vaultDocsCount={vaultDocuments.length}
            isConvertingPPTX={isConvertingPPTX}
            vaultDocuments={vaultDocuments}
            onSelectVaultDoc={handleSelectVaultDoc}
            onDeleteVaultDoc={handleDeleteVaultDoc}
            activeDocumentTitle={documentTitle}
            hasActiveDocument={!!pdfSource}
            onResumeStudy={() => setShowInstructions(false)}
            notes={notes}
            onSaveQuickNote={(text, color) => {
              saveNote({
                pageNumber: currentPage || 1,
                title: "ملاحظة سريعة ✍️",
                content: text,
                color: color || "yellow",
                tags: ["💡 ملاحظة سريعة"]
              });
              showToast("تم حفظ الملاحظة بنجاح!");
            }}
            onDeleteNote={deleteNote}
            onOpenFocusSheet={() => handleOpenFocusSheet(currentPage || 1)}
            onExportNotes={handleExportStudyGuide}
            onCreateBlankNotebook={handleCreateNewBlankNotebook}
          />
        ) : (
          <PDFCanvasViewer
            pdfSource={pdfSource}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            totalPages={totalPages}
            onTotalPagesChange={(total) => setTotalPages(total)}
            pageNotesCountMap={pageNotesCountMap}
            onOpenFocusSheet={handleOpenFocusSheet}
            documentTitle={documentTitle}
          />
        )}
      </div>

      {/* ── Focus Sheet: Bottom Sheet on Mobile & Side Panel on Desktop ── */}
      <FocusSheet
        isOpen={isFocusSheetOpen}
        onClose={() => setIsFocusSheetOpen(false)}
        pageNumber={targetFocusPage}
        notesForCurrentPage={getNotesForPage(targetFocusPage)}
        allNotes={notes}
        onSaveNote={saveNote}
        onDeleteNote={deleteNote}
        onNavigateToPage={(page) => {
          setCurrentPage(page);
          setTargetFocusPage(page);
        }}
        onAskAI={(page) => setIsAIModalOpen(true)}
      />

      {/* ── AI Assistant Modal ── */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        pageNumber={targetFocusPage}
        documentTitle={documentTitle}
        onAppendToNotes={(aiText) => {
          saveNote({
            pageNumber: targetFocusPage,
            title: `💡 شرح ذكي من لمّاح (ص ${targetFocusPage})`,
            content: aiText,
            tags: ["شرح ذكي 💡"],
          });
          showToast("تمت إضافة الشرح إلى ملاحظات الصفحة");
        }}
      />

      {/* ── Vault Local Library Modal ── */}
      <VaultLibraryModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        documents={vaultDocuments}
        currentDocumentId={documentId}
        onSelectDocument={handleSelectVaultDoc}
        onDeleteDocument={handleDeleteVaultDoc}
        onUploadFile={handleFileUpload}
        onClearAll={handleClearAllVaultDocs}
        isConverting={isConvertingPPTX}
      />

    </main>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 space-y-4 select-none" dir="rtl">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-md">
            <BookOpen className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600"></span>
            </span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-black text-slate-800">جاري فتح مساحة المذاكرة المركزة...</h3>
          <p className="text-xs text-slate-400 font-semibold">منصة لمّاح الذكية</p>
        </div>
      </div>
    }>
      <StudyPageContent />
    </Suspense>
  );
}

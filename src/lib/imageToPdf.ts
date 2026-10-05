import { PDFDocument } from "pdf-lib";

/**
 * Converts one or multiple image Files (PNG, JPG, JPEG, WebP, BMP, etc.)
 * into an optimized in-memory PDF Document (Blob).
 * 
 * - Operates 100% in client-side RAM (0 bytes written to disk/device storage).
 * - Scales down excessively huge camera images (e.g. >1920px) to prevent memory bloating
 *   while preserving crystal-clear text readability for slides and notes.
 * - Exports crisp, high-clarity JPEG pages (~250-400KB per page in RAM).
 */
export async function convertImagesToPdfBlob(files: File[]): Promise<{ blob: Blob; pageCount: number; title: string }> {
  if (!files || files.length === 0) {
    throw new Error("No image files provided");
  }

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    let imgBitmap: ImageBitmap | HTMLImageElement;
    let originalW = 1000;
    let originalH = 1000;

    try {
      imgBitmap = await createImageBitmap(file);
      originalW = imgBitmap.width;
      originalH = imgBitmap.height;
    } catch {
      // Fallback for browsers or formats where createImageBitmap fails
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const htmlImg = new Image();
      await new Promise((resolve, reject) => {
        htmlImg.onload = resolve;
        htmlImg.onerror = reject;
        htmlImg.src = dataUrl;
      });
      imgBitmap = htmlImg;
      originalW = htmlImg.width || 1000;
      originalH = htmlImg.height || 1000;
    }

    // High quality scaling constraint (max 1920px):
    // Preserves razor-sharp text while reducing 8MB raw mobile photos to ~300KB in RAM
    const maxDim = 1920;
    let targetW = originalW;
    let targetH = originalH;

    if (targetW > maxDim || targetH > maxDim) {
      if (targetW > targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }

    // Render onto offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Pure white background for transparent PNG/WebP images
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);

      ctx.drawImage(imgBitmap, 0, 0, targetW, targetH);
    }

    // Export as high-clarity JPEG (0.90 quality)
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.90);
    const base64Data = jpegDataUrl.split(",")[1];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const embeddedImg = await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([targetW, targetH]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: targetW,
      height: targetH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });

  let title = files[0].name.replace(/\.[^/.]+$/, "");
  if (files.length > 1) {
    title = `ألبوم صور دراسية (${files.length} صور).pdf`;
  } else {
    title = `${title} (صورة دراسية).pdf`;
  }

  return {
    blob,
    pageCount: files.length,
    title,
  };
}

/**
 * Extracts an image URL when dragging directly from Pinterest, Google Images, or any website.
 */
export function extractImageUrlFromDataTransfer(dataTransfer: DataTransfer): string | null {
  // 1. Try HTML content (Pinterest sends an <img src="..."> or <a> tag in text/html when dragged)
  try {
    const html = dataTransfer.getData("text/html");
    if (html) {
      if (typeof window !== "undefined" && window.DOMParser) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // 1a. Check <img> elements
        const img = doc.querySelector("img");
        if (img) {
          // Check srcset first for highest resolution
          const srcset = img.getAttribute("srcset");
          if (srcset) {
            const candidates = srcset
              .split(",")
              .map((s) => s.trim().split(/\s+/)[0])
              .filter(Boolean);
            const highRes =
              candidates.find((c) => c.includes("originals") || c.includes("736x")) ||
              candidates[candidates.length - 1];
            if (highRes) return cleanImageUrl(highRes);
          }

          const src = img.getAttribute("src") || img.getAttribute("data-src") || img.src;
          if (src && src.trim() && !src.startsWith("data:")) {
            return cleanImageUrl(src.trim());
          }
        }

        // 1b. Check <a> links (e.g. pinned link or direct image link)
        const links = Array.from(doc.querySelectorAll("a"));
        for (const a of links) {
          let href = a.getAttribute("href") || "";
          if (href.startsWith("/pin/")) {
            href = `https://www.pinterest.com${href}`;
          }
          if (href && isLikelyImageUrl(href)) {
            return cleanImageUrl(href);
          }
        }
      }

      // Regex fallback
      const match = html.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
      if (match && match[1] && !match[1].startsWith("data:")) {
        return cleanImageUrl(match[1]);
      }

      const pinLinkMatch = html.match(/href=["'](\/pin\/[^"']+|https?:\/\/[^"']*pinterest\.[^"']*\/pin\/[^"']+)["']/i);
      if (pinLinkMatch && pinLinkMatch[1]) {
        let pinUrl = pinLinkMatch[1];
        if (pinUrl.startsWith("/pin/")) {
          pinUrl = `https://www.pinterest.com${pinUrl}`;
        }
        return cleanImageUrl(pinUrl);
      }
    }
  } catch (err) {
    console.warn("Error parsing drag HTML:", err);
  }

  // 2. Try text/uri-list
  try {
    const uriList = dataTransfer.getData("text/uri-list");
    if (uriList) {
      const lines = uriList.split(/\r?\n/).filter((line) => line && !line.startsWith("#"));
      for (const line of lines) {
        const trimmed = line.trim();
        if (isLikelyImageUrl(trimmed)) {
          return cleanImageUrl(trimmed);
        }
      }
    }
  } catch {}

  // 3. Try plain text
  try {
    const text = dataTransfer.getData("text/plain");
    if (text) {
      const trimmed = text.trim();
      if (isLikelyImageUrl(trimmed)) {
        return cleanImageUrl(trimmed);
      }
    }
  } catch {}

  return null;
}

function cleanImageUrl(url: string): string {
  let cleaned = url.replace(/&amp;/g, "&");
  // If Pinterest thumbnail (e.g. /236x/ or /474x/ or /564x/), upgrade to crystal-clear /736x/
  if (cleaned.includes("i.pinimg.com/236x/")) {
    cleaned = cleaned.replace("/236x/", "/736x/");
  } else if (cleaned.includes("i.pinimg.com/474x/")) {
    cleaned = cleaned.replace("/474x/", "/736x/");
  } else if (cleaned.includes("i.pinimg.com/564x/")) {
    cleaned = cleaned.replace("/564x/", "/736x/");
  }
  return cleaned;
}

function isLikelyImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  if (/\.(png|jpe?g|webp|gif|bmp|svg|avif)($|\?)/i.test(url)) return true;
  if (url.includes("pinimg.com") || url.includes("pinterest.") || url.includes("pin.it/")) return true;
  if (
    url.includes("imgur.com") ||
    url.includes("googleusercontent.com") ||
    url.includes("cloudfront.net") ||
    url.includes("unsplash.com") ||
    url.includes("images.pexels.com") ||
    url.includes("freepik.com")
  ) {
    return true;
  }
  return false;
}

/**
 * Fetches an external image URL via our zero-CORS proxy route into an in-memory File,
 * completely in RAM with 0 bytes saved to disk.
 */
export async function fetchImageFileFromUrl(imageUrl: string, defaultName: string = "صورة_من_بنترست.jpg"): Promise<File> {
  let blob: Blob;

  if (imageUrl.startsWith("data:")) {
    const res = await fetch(imageUrl);
    blob = await res.blob();
    return new File([blob], defaultName, { type: blob.type || "image/jpeg" });
  }

  try {
    // Fetch through our local proxy route to bypass Pinterest/external CORS
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) {
      throw new Error(`Proxy fetch failed: ${res.status}`);
    }
    blob = await res.blob();
  } catch (proxyErr) {
    // Fallback direct fetch if proxy fails
    const directRes = await fetch(imageUrl);
    blob = await directRes.blob();
  }

  return new File([blob], defaultName, { type: blob.type || "image/jpeg" });
}

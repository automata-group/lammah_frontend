import { PDFDocument } from "pdf-lib";

/**
 * Reads EXIF Orientation (1-8) from JPEG file bytes to prevent upside-down/sideways mobile camera images.
 * 1 = Normal (0°)
 * 3 = 180° upside-down (typical for mobile camera photos taken of papers/books on a desk)
 * 6 = 90° CW
 * 8 = 270° CW
 */
export function getExifOrientation(buffer: ArrayBuffer): number {
  try {
    const view = new DataView(buffer);
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) {
      return 1; // Not JPEG
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length) {
      if (view.getUint16(offset, false) === 0xFFE1) {
        // APP1 Marker (EXIF)
        const markerLength = view.getUint16(offset + 2, false);
        const exifHeader = offset + 4;

        if (
          offset + 10 <= length &&
          view.getUint32(exifHeader, false) === 0x45786966 && // "Exif"
          view.getUint16(exifHeader + 4, false) === 0x0000
        ) {
          const tiffOffset = exifHeader + 6;
          const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;

          const ifd0Offset = tiffOffset + view.getUint32(tiffOffset + 4, littleEndian);
          if (ifd0Offset + 2 > length) return 1;

          const entries = view.getUint16(ifd0Offset, littleEndian);
          for (let i = 0; i < entries; i++) {
            const entryOffset = ifd0Offset + 2 + i * 12;
            if (entryOffset + 12 > length) break;
            const tag = view.getUint16(entryOffset, littleEndian);
            if (tag === 0x0112) { // Orientation tag
              const val = view.getUint16(entryOffset + 8, littleEndian);
              return val >= 1 && val <= 8 ? val : 1;
            }
          }
        }
        offset += 2 + markerLength;
      } else if ((view.getUint16(offset, false) & 0xFF00) === 0xFF00) {
        const marker = view.getUint16(offset, false);
        if (marker === 0xFFDA || marker === 0xFFD9) break; // SOS or EOI
        offset += 2 + view.getUint16(offset + 2, false);
      } else {
        break;
      }
    }
  } catch (e) {
    console.warn("Could not parse EXIF orientation:", e);
  }
  return 1;
}

/**
 * Converts one or multiple image Files (PNG, JPG, JPEG, WebP, BMP, etc.)
 * into an optimized in-memory PDF Document (Blob).
 * 
 * - Operates 100% in client-side RAM (0 bytes written to disk/device storage).
 * - Corrects mobile camera EXIF orientation automatically (prevents flipped/upside-down pages).
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
    // 1. Detect EXIF orientation from raw bytes
    let exifOrientation = 1;
    try {
      const buffer = await file.arrayBuffer();
      exifOrientation = getExifOrientation(buffer);
    } catch (e) {
      console.warn("EXIF read error:", e);
    }

    // 2. Load image into HTMLImageElement
    const objectUrl = URL.createObjectURL(file);
    let htmlImg: HTMLImageElement;
    try {
      htmlImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = objectUrl;
      });
    } finally {
      // Keep URL until drawn or clean up after
    }

    const naturalW = htmlImg.naturalWidth || htmlImg.width || 1000;
    const naturalH = htmlImg.naturalHeight || htmlImg.height || 1000;

    // High quality scaling constraint (max 1920px):
    const maxDim = 1920;
    let targetW = naturalW;
    let targetH = naturalH;

    if (targetW > maxDim || targetH > maxDim) {
      if (targetW > targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }

    // Swap canvas dimensions if orientation requires 90° or 270° rotation
    const isSwapped = exifOrientation === 5 || exifOrientation === 6 || exifOrientation === 7 || exifOrientation === 8;
    const canvasW = isSwapped ? targetH : targetW;
    const canvasH = isSwapped ? targetW : targetH;

    // Render onto offscreen canvas with EXIF orientation correction
    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Pure white background for transparent PNG/WebP images
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasW, canvasH);

      ctx.save();
      // Apply exact EXIF matrix transformation to guarantee upright presentation
      switch (exifOrientation) {
        case 2: // Horizontal flip
          ctx.translate(canvasW, 0);
          ctx.scale(-1, 1);
          break;
        case 3: // 180° rotation (crucial for mobile camera shots of papers on a desk!)
          ctx.translate(canvasW, canvasH);
          ctx.rotate(Math.PI);
          break;
        case 4: // Vertical flip
          ctx.translate(0, canvasH);
          ctx.scale(1, -1);
          break;
        case 5: // Vertical flip + 90° CW
          ctx.rotate(0.5 * Math.PI);
          ctx.scale(1, -1);
          break;
        case 6: // 90° CW rotation
          ctx.translate(canvasW, 0);
          ctx.rotate(0.5 * Math.PI);
          break;
        case 7: // Horizontal flip + 90° CW
          ctx.rotate(0.5 * Math.PI);
          ctx.translate(canvasW, -canvasH);
          ctx.scale(-1, 1);
          break;
        case 8: // 270° CW rotation (90° CCW)
          ctx.translate(0, canvasH);
          ctx.rotate(-0.5 * Math.PI);
          break;
        default:
          break;
      }

      ctx.drawImage(htmlImg, 0, 0, targetW, targetH);
      ctx.restore();
    }

    URL.revokeObjectURL(objectUrl);

    // Export as high-clarity JPEG (0.90 quality)
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.90);
    const base64Data = jpegDataUrl.split(",")[1];
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const embeddedImg = await pdfDoc.embedJpg(bytes);
    const page = pdfDoc.addPage([canvasW, canvasH]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: canvasW,
      height: canvasH,
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

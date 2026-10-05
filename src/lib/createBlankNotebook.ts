import { PDFDocument, rgb } from "pdf-lib";

export type NotebookPageStyle = "blank" | "ruled" | "grid";

/**
 * Creates an in-memory PDF Document matching standard A4 notebook pages
 * (Blank, Ruled lines, or Math Grid) for instant Canva-style note-taking.
 */
export async function createBlankNotebookBlob(
  style: NotebookPageStyle = "ruled",
  customTitle?: string
): Promise<{ blob: Blob; pageCount: number; title: string }> {
  const pdfDoc = await PDFDocument.create();
  
  // Standard A4 dimensions in points: 595.28 x 841.89
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Background base
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.99, 0.99, 1.0),
  });

  if (style === "ruled") {
    // Ruled notebook lines (like classic university ruled paper)
    const startY = height - 110;
    const endY = 60;
    const lineSpacing = 30;
    
    for (let y = startY; y >= endY; y -= lineSpacing) {
      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 0.75,
        color: rgb(0.82, 0.86, 0.92),
      });
    }

    // Vertical right margin line (RTL margin)
    page.drawLine({
      start: { x: width - 85, y: height - 70 },
      end: { x: width - 85, y: 50 },
      thickness: 1.2,
      color: rgb(0.94, 0.75, 0.75),
    });
  } else if (style === "grid") {
    // Graph / Grid math notebook
    const gridSize = 22;
    for (let x = 45; x <= width - 45; x += gridSize) {
      page.drawLine({
        start: { x, y: 45 },
        end: { x, y: height - 45 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.93),
      });
    }
    for (let y = 45; y <= height - 45; y += gridSize) {
      page.drawLine({
        start: { x: 45, y },
        end: { x: width - 45, y },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.93),
      });
    }
  }

  const defaultTitle = 
    style === "ruled" 
      ? `دفتر ملاحظات مسطر — ${new Date().toLocaleDateString("ar-EG")}`
      : style === "grid"
      ? `دفتر رياضيات ورسوم بيانية — ${new Date().toLocaleDateString("ar-EG")}`
      : `دفتر ملاحظات حر فارغ — ${new Date().toLocaleDateString("ar-EG")}`;

  const title = customTitle || defaultTitle;
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

  return { blob, pageCount: 1, title: `${title}.pdf` };
}

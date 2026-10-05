"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Trash2, 
  Check, 
  Palette,
  Minus
} from "lucide-react";

interface SketchCanvasProps {
  initialDataUrl?: string;
  onSaveSketch: (dataUrl: string) => void;
  onCancel?: () => void;
}

const COLORS = [
  { id: "#4f46e5", name: "نيلي", class: "bg-indigo-600" },
  { id: "#9333ea", name: "بنفسجي", class: "bg-purple-600" },
  { id: "#059669", name: "أخضر", class: "bg-emerald-600" },
  { id: "#d97706", name: "برتقالي", class: "bg-amber-600" },
  { id: "#e11d48", name: "وردي", class: "bg-rose-600" },
  { id: "#0f172a", name: "أسود", class: "bg-slate-900" },
];

export default function SketchCanvas({
  initialDataUrl,
  onSaveSketch,
  onCancel,
}: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [color, setColor] = useState<string>("#4f46e5");
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = 320 * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `320px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, 320);

    // If initial image exists, draw it
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, 320);
      };
      img.src = initialDataUrl;
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // Save history for undo
    try {
      const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-10), currentData]);
    } catch (err) {}

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = isEraser ? lineWidth * 4 : lineWidth;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || history.length === 0) return;

    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previousState, 0, 0);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSaveSketch(dataUrl);
  };

  return (
    <div className="space-y-3" dir="rtl">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
        
        {/* Colors Picker */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setColor(c.id);
                setIsEraser(false);
              }}
              className={`w-6 h-6 rounded-full transition-all ${c.class} ${
                color === c.id && !isEraser ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "opacity-80 hover:opacity-100"
              }`}
              title={c.name}
            />
          ))}
        </div>

        {/* Tools (Pen / Eraser / Undo / Clear) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-1.5 rounded-xl transition ${
              !isEraser ? "bg-indigo-600 text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="قلم"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsEraser(true)}
            className={`p-1.5 rounded-xl transition ${
              isEraser ? "bg-indigo-600 text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
            title="ممحاة"
          >
            <Eraser className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition"
            title="تراجع"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
            title="مسح اللوحة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Drawing Area ── */}
      <div 
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-indigo-300 dark:border-indigo-500/40 bg-white shadow-inner touch-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair w-full block"
        />
      </div>

      {/* ── Bottom Save Action ── */}
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
          >
            إلغاء
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>حفظ المخطط بالدفتر</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { 
  Sparkles, 
  UtensilsCrossed, 
  Cake, 
  Palette, 
  GraduationCap, 
  Printer, 
  Shirt, 
  Laptop, 
  Package
} from "lucide-react";
import { KioskCategoryItem } from "@/types/kiosk";

interface KioskCategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: KioskCategoryItem[];
  totalApproved: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: Sparkles,
  food: UtensilsCrossed,
  sweets: Cake,
  crafts: Palette,
  services: GraduationCap,
  printing: Printer,
  fashion: Shirt,
  tech: Laptop,
  other: Package,
};

const CATEGORY_NAMES_AR: Record<string, string> = {
  all: "الكل",
  food: "أطعمة ومأكولات",
  sweets: "حلويات ومخبوزات",
  crafts: "أعمال يدوية وهدايا",
  services: "خدمات طلابية وبحوث",
  printing: "طباعة وتصوير وتجليد",
  fashion: "إكسسوارات وأزياء",
  tech: "تقنية وإلكترونيات",
  other: "أخرى",
};

export default function KioskCategoryFilter({
  selectedCategory,
  onSelectCategory,
  categories,
  totalApproved,
}: KioskCategoryFilterProps) {
  // Build lookup map for counts
  const countMap: Record<string, number> = {};
  categories.forEach((c) => {
    countMap[c.id] = c.count;
  });

  const categoryKeys = [
    "all",
    "food",
    "sweets",
    "crafts",
    "services",
    "printing",
    "fashion",
    "tech",
    "other",
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>تصفح حسب الفئة</span>
        </h2>
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          اسحب للتنقل بين الأقسام ➔
        </span>
      </div>

      {/* Horizontal Scroll Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth -mx-2 px-2 no-scrollbar">
        {categoryKeys.map((key) => {
          const Icon = CATEGORY_ICONS[key] || Package;
          const label = CATEGORY_NAMES_AR[key] || key;
          const count = key === "all" ? totalApproved : countMap[key] || 0;
          const isSelected = selectedCategory === key;

          return (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 select-none cursor-pointer border ${
                isSelected
                  ? "bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/20 scale-[1.02]"
                  : "bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
              <span>{label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

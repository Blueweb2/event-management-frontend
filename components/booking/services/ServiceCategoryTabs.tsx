"use client";

import {
  Sparkles,
  Utensils,
  Camera,
  Volume2,
  Lightbulb,
  Users,
  Warehouse,
  Wrench,
  Music,
  Video,
  Flower2,
} from "lucide-react";

import type { ElementType } from "react";

export interface ServiceCategoryMeta {
  id: string;
  name: string;
  count: number;
  icon?: ElementType;
}

interface ServiceCategoryTabsProps {
  categories: ServiceCategoryMeta[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  totalServicesCount: number;
}

const CATEGORY_ICON_MAP: Record<string, ElementType> = {
  catering: Utensils,
  decoration: Flower2,
  "stage decoration": Flower2,
  "entrance decoration": Sparkles,
  "table decoration": Sparkles,
  lighting: Lightbulb,
  sound: Volume2,
  photography: Camera,
  videography: Video,
  entertainment: Music,
  staff: Users,
  venue: Warehouse,
  other: Wrench,
};

export const getCategoryIcon = (category: string): ElementType => {
  const normalized = category.toLowerCase().trim();

  if (CATEGORY_ICON_MAP[normalized]) {
    return CATEGORY_ICON_MAP[normalized];
  }

  if (
    normalized.includes("decor") ||
    normalized.includes("flower") ||
    normalized.includes("stage")
  ) {
    return Flower2;
  }

  if (normalized.includes("light")) return Lightbulb;

  if (
    normalized.includes("sound") ||
    normalized.includes("dj") ||
    normalized.includes("audio")
  ) {
    return Volume2;
  }

  if (normalized.includes("photo")) return Camera;

  if (
    normalized.includes("video") ||
    normalized.includes("film")
  ) {
    return Video;
  }

  if (
    normalized.includes("food") ||
    normalized.includes("cater") ||
    normalized.includes("drink")
  ) {
    return Utensils;
  }

  if (
    normalized.includes("music") ||
    normalized.includes("dance") ||
    normalized.includes("entertain")
  ) {
    return Music;
  }

  if (
    normalized.includes("staff") ||
    normalized.includes("security") ||
    normalized.includes("host")
  ) {
    return Users;
  }

  if (
    normalized.includes("venue") ||
    normalized.includes("hall") ||
    normalized.includes("resort")
  ) {
    return Warehouse;
  }

  return Wrench;
};

export default function ServiceCategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: ServiceCategoryTabsProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap">
        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.id.toLowerCase();

          const IconComponent = cat.icon ?? getCategoryIcon(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isSelected}
              className={`group inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#29241f] text-white shadow-md shadow-[#29241f]/20 scale-[1.02]"
                  : "border border-[#e7decfa8] bg-white text-gray-700 hover:border-[#9A7B4F] hover:bg-[#faf7f2] hover:text-[#29241f]"
              }`}
            >
              <IconComponent
                size={15}
                className={
                  isSelected
                    ? "text-[#d8a86c]"
                    : "text-gray-400 group-hover:text-[#9A7B4F]"
                }
              />

              <span>{cat.name}</span>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
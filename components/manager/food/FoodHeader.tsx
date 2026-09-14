"use client";

import { Plus, UtensilsCrossed } from "lucide-react";
import type { FoodItem } from "@/lib/food.api";

interface FoodHeaderProps {
  items: FoodItem[];
  onAddNew: () => void;
}

export default function FoodHeader({ items, onAddNew }: FoodHeaderProps) {
  const totalCount = items.length;
  const vegCount = items.filter((i) => i.dietary === "veg").length;
  const nonVegCount = items.filter((i) => i.dietary === "non-veg").length;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6B5B95]/10 text-[#6B5B95]">
            <UtensilsCrossed size={16} />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8C7A55]">
            Catering & Menu
          </p>
        </div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#252525]">
          Food Menu Management
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          Configure dishes, set reference rates, and customize menus during booking.
        </p>

        {/* Stats */}
        <div className="mt-2.5 flex items-center gap-3 text-xs text-gray-500">
          <span>
            <strong>{totalCount}</strong> Total Dishes
          </span>
          <span>•</span>
          <span className="text-green-700 font-medium">
            <strong>{vegCount}</strong> Veg
          </span>
          <span>•</span>
          <span className="text-red-700 font-medium">
            <strong>{nonVegCount}</strong> Non-Veg
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddNew}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 active:scale-95 sm:w-auto"
      >
        <Plus size={16} />
        Add Food Item
      </button>
    </header>
  );
}

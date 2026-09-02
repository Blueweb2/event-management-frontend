"use client";

import { UtensilsCrossed } from "lucide-react";

import type { FoodItem } from "./constants";
import FoodMenuCard from "./FoodMenuCard";

interface FoodMenuListProps {
  items: FoodItem[];
  onEdit: (item: FoodItem) => void;
  onDelete: (item: FoodItem) => void;
  onToggleAvailability: (item: FoodItem) => void;
}

export default function FoodMenuList({
  items,
  onEdit,
  onDelete,
  onToggleAvailability,
}: FoodMenuListProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#29241f]">
            Menu Items
          </h2>

          <p className="mt-1 text-xs text-[#9b938a]">
            {items.length}{" "}
            {items.length === 1 ? "item" : "items"} found
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded5cb] bg-[#fdfbf8] px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
            <UtensilsCrossed size={21} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#29241f]">
            No food items found
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#8d847b]">
            Try changing your search or filters, or add a new
            food item to your menu.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <FoodMenuCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAvailability={onToggleAvailability}
            />
          ))}
        </div>
      )}
    </section>
  );
}
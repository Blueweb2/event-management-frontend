"use client";

import {
  Edit3,
  Leaf,
  MoreVertical,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

import type { FoodItem } from "./constants";

interface FoodMenuCardProps {
  item: FoodItem;
  onEdit: (item: FoodItem) => void;
  onDelete: (item: FoodItem) => void;
  onToggleAvailability: (item: FoodItem) => void;
}

export default function FoodMenuCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
}: FoodMenuCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="group rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
          <UtensilsCrossed size={21} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-[#29241f]">
                  {item.name}
                </h3>

                {item.popular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f8f0df] px-2 py-1 text-[10px] font-semibold text-[#9a6c37]">
                    <Star size={11} className="fill-current" />
                    Popular
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-[#9b938a]">
                {item.category}
              </p>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                aria-label={`More options for ${item.name}`}
                title="More options"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8d847b] transition hover:bg-[#f7f3ee] hover:text-[#29241f]"
              >
                <MoreVertical size={17} />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-xl border border-[#e8e1d8] bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(item);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#403a34] transition hover:bg-[#f8f4ee]"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(item);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#a15f57] transition hover:bg-[#fdf1ef]"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#756d64]">
            {item.description}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                item.type === "Veg"
                  ? "bg-[#edf5ed] text-[#557555]"
                  : "bg-[#f9ece8] text-[#9b5c4f]"
              }`}
            >
              <Leaf size={12} />
              {item.type}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                item.available
                  ? "bg-[#edf5ed] text-[#557555]"
                  : "bg-[#f1eeeb] text-[#756d64]"
              }`}
            >
              {item.available ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-[#eee8e1] pt-4">
        <div>
          <p className="text-[11px] text-[#9b938a]">Price</p>
          <p className="mt-0.5 text-lg font-bold text-[#29241f]">
            ₹{item.price.toLocaleString("en-IN")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleAvailability(item)}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            item.available
              ? "border-[#d9e6d9] bg-[#f5faf5] text-[#557555] hover:bg-[#edf5ed]"
              : "border-[#e3dbd2] bg-[#f8f4ee] text-[#756d64] hover:bg-[#f1ece5]"
          }`}
        >
          {item.available ? "Mark Unavailable" : "Mark Available"}
        </button>
      </div>
    </article>
  );
}
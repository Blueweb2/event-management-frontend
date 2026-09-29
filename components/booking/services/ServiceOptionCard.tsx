"use client";

import { Check, Eye, Plus, Sparkles, Users } from "lucide-react";
import type { PricingType } from "@/types/service";
import PricingDisplay, { formatCurrency } from "./PricingDisplay";
import QuantitySelector from "./QuantitySelector";
import { getCategoryIcon } from "./ServiceCategoryTabs";
import type { PreviewableServiceOption } from "./ServiceImagePreview";

interface ServiceOptionCardProps {
  item: PreviewableServiceOption;
  onToggleSelect: (item: PreviewableServiceOption) => void;
  onOpenPreview: (item: PreviewableServiceOption) => void;
  onUpdateQuantity: (uniqueKey: string, quantity: number) => void;
}

export default function ServiceOptionCard({
  item,
  onToggleSelect,
  onOpenPreview,
  onUpdateQuantity,
}: ServiceOptionCardProps) {
  const IconComponent = getCategoryIcon(item.category);

  // Compute calculated price preview
  let computedAmount = item.price;
  if (item.pricingType === "PER_GUEST") {
    computedAmount = item.price * (item.guestCount || 1);
  } else if (item.pricingType !== "FIXED") {
    computedAmount = item.price * (item.selectedQuantity || 1);
  }

  const isGuestBased = item.pricingType === "PER_GUEST";
  const isQuantityBased = item.pricingType !== "FIXED" && !isGuestBased;

  return (
    <div
      onClick={() => onToggleSelect(item)}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border text-left transition-all duration-300 cursor-pointer ${
        item.isSelected
          ? "border-[#9A7B4F] bg-[#FAF7F2] shadow-lg ring-2 ring-[#9A7B4F]/80 scale-[1.01]"
          : "border-[#e8e1d8] bg-white shadow-xs hover:border-[#9A7B4F]/60 hover:bg-[#faf9f7] hover:shadow-md"
      }`}
    >
      {/* Visual Image Header */}
      <div className="relative aspect-16/11 w-full overflow-hidden bg-[#241f1a]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-106"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.parentElement?.querySelector(".fallback-card-img");
              if (fb) fb.classList.remove("hidden");
            }}
          />
        ) : null}

        {/* Fallback image */}
        <div
          className={`fallback-card-img h-full w-full flex flex-col items-center justify-center gap-1.5 text-white/30 ${
            item.imageUrl ? "hidden" : ""
          }`}
        >
          <IconComponent size={40} className="text-[#d8a86c]/70" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
            {item.category}
          </span>
        </div>

        {/* Gradient shadow for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/20" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-xl bg-black/65 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
            <IconComponent size={11} className="text-[#d8a86c]" />
            <span>{item.category}</span>
          </span>

          {item.optionId && (
            <span className="rounded-xl bg-white/95 px-2 py-0.5 text-[9px] font-extrabold text-[#29241f] backdrop-blur-md shadow-xs">
              Option
            </span>
          )}
        </div>

        {/* Quick View / Zoom Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview(item);
          }}
          aria-label="View photo and details"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black hover:scale-110 active:scale-95 cursor-pointer shadow-md"
        >
          <Eye size={14} />
        </button>

        {/* Selected Checkmark Badge on image */}
        {item.isSelected && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-xl bg-[#9A7B4F] px-3 py-1 text-xs font-black text-white shadow-md animate-in zoom-in-75 duration-200">
            <Check size={14} strokeWidth={3} />
            <span>Selected</span>
          </div>
        )}

        {/* Hover Click to view badge */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hidden sm:block">
          {!item.isSelected && (
            <span className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/95 py-2 text-center text-xs font-bold text-gray-900 shadow-md backdrop-blur-md">
              <Plus size={13} className="text-[#9A7B4F]" />
              <span>Click to Select</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-1 flex-col justify-between p-4.5 sm:p-5">
        <div>
          {item.optionId && item.parentServiceName !== item.title && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A7B4F]">
              {item.parentServiceName}
            </p>
          )}
          <h3 className="text-base font-bold text-[#29241f] group-hover:text-black leading-snug">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#787067]">
              {item.description}
            </p>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 border-t border-[#eee7dc] pt-3.5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <PricingDisplay
                price={item.price}
                pricingType={item.pricingType}
                unitLabel={item.unitLabel}
                size="md"
              />

              {/* Guest calculation note */}
              {isGuestBased && (
                <p className="mt-0.5 text-[10px] font-semibold text-emerald-700">
                  {formatCurrency(computedAmount)} for {item.guestCount || 1} guests
                </p>
              )}
            </div>

            {/* Select / Selected Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(item);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                item.isSelected
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
                  : "bg-[#29241f] text-white hover:bg-black hover:scale-105 active:scale-95"
              }`}
            >
              {item.isSelected ? (
                <>
                  <Check size={13} strokeWidth={3} />
                  <span>Selected</span>
                </>
              ) : (
                <>
                  <Plus size={13} className="text-[#d8a86c]" />
                  <span>Select</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Quantity Stepper when selected and applicable */}
          {item.isSelected && isQuantityBased && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-3.5 flex items-center justify-between rounded-xl border border-[#e8dfd2] bg-white p-2 animate-in fade-in"
            >
              <span className="text-[11px] font-bold text-gray-700">
                Quantity ({item.unitLabel || "Units"}):
              </span>
              <QuantitySelector
                value={item.selectedQuantity || 1}
                onChange={(qty) => onUpdateQuantity(item.uniqueKey, qty)}
                unitLabel={item.unitLabel}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

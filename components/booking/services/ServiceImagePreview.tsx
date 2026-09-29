"use client";

import { useEffect } from "react";
import { X, Check, Eye, Users, Sparkles } from "lucide-react";
import type { PricingType } from "@/types/service";
import PricingDisplay, { formatCurrency } from "./PricingDisplay";
import QuantitySelector from "./QuantitySelector";
import { getCategoryIcon } from "./ServiceCategoryTabs";

export interface PreviewableServiceOption {
  uniqueKey: string;
  serviceId: string;
  optionId?: string;
  category: string;
  parentServiceName: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  pricingType: PricingType;
  unitLabel: string;
  isSelected: boolean;
  selectedQuantity: number;
  guestCount: number;
}

interface ServiceImagePreviewProps {
  item: PreviewableServiceOption | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSelect: (item: PreviewableServiceOption) => void;
  onUpdateQuantity: (uniqueKey: string, quantity: number) => void;
}

export default function ServiceImagePreview({
  item,
  isOpen,
  onClose,
  onToggleSelect,
  onUpdateQuantity,
}: ServiceImagePreviewProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const IconComponent = getCategoryIcon(item.category);

  // Compute calculated total for this option
  let estimatedTotal = item.price;
  if (item.pricingType === "PER_GUEST") {
    estimatedTotal = item.price * (item.guestCount || 1);
  } else if (item.pricingType !== "FIXED") {
    estimatedTotal = item.price * (item.selectedQuantity || 1);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#d8cfc4] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Large Media Header */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-[#29241f]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/40">
              <IconComponent size={56} />
              <p className="text-xs font-semibold uppercase tracking-wider">
                {item.category}
              </p>
            </div>
          )}

          {/* Category Tag */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <IconComponent size={14} className="text-[#d8a86c]" />
              <span>{item.category}</span>
            </span>

            {item.optionId && (
              <span className="inline-flex items-center gap-1 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-[#29241f] backdrop-blur-md shadow-xs">
                <Sparkles size={12} className="text-[#9A7B4F]" />
                <span>Option Variation</span>
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 sm:p-7">
          <div className="space-y-4">
            <div>
              {item.optionId && item.parentServiceName !== item.title && (
                <p className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">
                  {item.parentServiceName}
                </p>
              )}
              <h2 className="text-xl font-black text-[#29241f] sm:text-2xl">
                {item.title}
              </h2>
            </div>

            {item.description ? (
              <p className="text-sm leading-relaxed text-gray-600">
                {item.description}
              </p>
            ) : (
              <p className="text-xs italic text-gray-400">
                Crafted to perfection by our expert event planning and decor specialists.
              </p>
            )}

            {/* Pricing Details Breakdown Card */}
            <div className="rounded-2xl border border-[#eee7dc] bg-[#faf8f5] p-4.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8d847b]">
                    Pricing Breakdown
                  </span>
                  <div className="mt-1">
                    <PricingDisplay
                      price={item.price}
                      pricingType={item.pricingType}
                      unitLabel={item.unitLabel}
                      size="lg"
                    />
                  </div>
                </div>

                {/* Calculation Details */}
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8d847b]">
                    Estimated Line Total
                  </span>
                  <p className="mt-1 text-lg font-black text-[#29241f]">
                    {formatCurrency(estimatedTotal)}
                  </p>
                  {item.pricingType === "PER_GUEST" && (
                    <p className="text-[11px] text-gray-500 flex items-center sm:justify-end gap-1">
                      <Users size={12} className="text-[#9A7B4F]" />
                      <span>{item.guestCount || 1} guest count from event details</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Selector inside Modal if non-fixed and not per guest */}
              {item.pricingType !== "FIXED" && item.pricingType !== "PER_GUEST" && (
                <div className="mt-4 flex items-center justify-between border-t border-[#e8dfd2] pt-3.5">
                  <span className="text-xs font-bold text-gray-700">
                    Adjust {item.unitLabel || "Quantity"}:
                  </span>
                  <QuantitySelector
                    value={item.selectedQuantity || 1}
                    onChange={(newQty) => onUpdateQuantity(item.uniqueKey, newQty)}
                    unitLabel={item.unitLabel}
                    size="md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#eee7dc] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleSelect(item);
              }}
              className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black transition-all duration-200 cursor-pointer shadow-md ${
                item.isSelected
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-[#29241f] text-white hover:bg-black shadow-[#29241f]/20 hover:scale-[1.02]"
              }`}
            >
              {item.isSelected ? (
                <>
                  <Check size={16} />
                  <span>Selected in Event Plan</span>
                </>
              ) : (
                <>
                  <Check size={16} className="text-[#d8a86c]" />
                  <span>Select This Option</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

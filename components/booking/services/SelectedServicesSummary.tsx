"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trash2,
  Users,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { ServiceItem } from "../types";
import { formatCurrency } from "./PricingDisplay";
import QuantitySelector from "./QuantitySelector";
import { getCategoryIcon } from "./ServiceCategoryTabs";

interface SelectedServicesSummaryProps {
  selectedItems: ServiceItem[];
  guestCount: number;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onClearAll?: () => void;
  onContinue?: () => void;
  isMobileFloating?: boolean;
}

export default function SelectedServicesSummary({
  selectedItems,
  guestCount,
  onRemoveItem,
  onUpdateQuantity,
  onClearAll,
  onContinue,
  isMobileFloating = false,
}: SelectedServicesSummaryProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Compute calculated subtotal
  const calculatedTotal = selectedItems.reduce((total, item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.unitPrice) || 0;
    return total + price * qty;
  }, 0);

  // Group items by category
  const categorizedItems = selectedItems.reduce<Record<string, ServiceItem[]>>((acc, item) => {
    const cat = (item.category || "other").toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryKeys = Object.keys(categorizedItems);

  // Mobile Bottom Sticky Bar
  if (isMobileFloating) {
    if (selectedItems.length === 0) return null;

    return (
      <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden animate-in slide-in-from-bottom duration-300">
        {/* Mobile Expanded Drawer Backdrop */}
        {isMobileExpanded && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30"
            onClick={() => setIsMobileExpanded(false)}
          />
        )}

        {/* Mobile Drawer Sheet */}
        <div className="relative z-40 border-t border-[#e8e1d8] bg-white shadow-2xl rounded-t-3xl overflow-hidden">
          {/* Drawer Handle Header */}
          <div
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="flex items-center justify-between px-5 py-3.5 bg-[#faf8f5] border-b border-[#eee7dc] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#29241f] text-white">
                <ShoppingBag size={14} className="text-[#d8a86c]" />
              </span>
              <div>
                <p className="text-xs font-black text-[#29241f]">
                  Your Event Selection ({selectedItems.length})
                </p>
                <p className="text-[10px] text-gray-500">Tap to {isMobileExpanded ? "collapse" : "view items"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-[#29241f]">
                  {formatCurrency(calculatedTotal)}
                </p>
                <p className="text-[10px] text-gray-500">Est. Total</p>
              </div>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600"
              >
                {isMobileExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
          </div>

          {/* Expanded Item List on Mobile */}
          {isMobileExpanded && (
            <div className="max-h-72 overflow-y-auto p-4 space-y-3 bg-white">
              {selectedItems.map((item) => {
                const IconComponent = getCategoryIcon(item.category);
                const lineTotal = Number(item.unitPrice || 0) * (Number(item.quantity) || 1);

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#faf8f5] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Check size={12} className="text-emerald-600 shrink-0" />
                        <p className="truncate text-xs font-bold text-gray-900">{item.name}</p>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        {formatCurrency(item.unitPrice)}{" "}
                        {item.pricingType !== "FIXED" && `× ${item.quantity} ${item.unitLabel || ""}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">
                        {formatCurrency(lineTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile Bottom CTA Bar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-white border-t border-[#eee7dc]">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#8d847b]">
                Estimated Total
              </p>
              <p className="text-lg font-black text-[#29241f]">
                {formatCurrency(calculatedTotal)}
              </p>
            </div>

            {onContinue && (
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#29241f] px-6 py-3 text-xs font-black text-white shadow-md active:scale-95 transition"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Sticky Panel
  return (
    <div className="sticky top-6 rounded-3xl border border-[#e8e1d8] bg-white shadow-xl shadow-black/5 overflow-hidden transition-all duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#eee7dc] bg-[#faf8f5] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#29241f] text-white">
            <ShoppingBag size={15} className="text-[#d8a86c]" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#29241f]">
              Your Event Selection
            </h3>
            <p className="text-[11px] text-[#8d847b]">
              {selectedItems.length} {selectedItems.length === 1 ? "service" : "services"} included
            </p>
          </div>
        </div>

        {selectedItems.length > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-bold text-gray-400 hover:text-red-600 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Itemized List Body */}
      <div className="max-h-[55vh] overflow-y-auto p-5 space-y-4 divide-y divide-gray-100">
        {selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf8f5] text-gray-300">
              <Sparkles size={22} className="text-[#d8a86c]/70" />
            </span>
            <p className="mt-3 text-xs font-bold text-gray-700">No services selected yet</p>
            <p className="mt-1 max-w-[200px] text-[11px] leading-relaxed text-gray-400">
              Browse categories and click any photo card to curate your event plan.
            </p>
          </div>
        ) : (
          categoryKeys.map((catKey) => {
            const items = categorizedItems[catKey];
            const IconComponent = getCategoryIcon(catKey);

            return (
              <div key={catKey} className="pt-3 first:pt-0">
                {/* Category Subheader */}
                <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#9A7B4F]">
                  <IconComponent size={12} />
                  <span>{catKey}</span>
                </div>

                <div className="space-y-2.5">
                  {items.map((item) => {
                    const lineTotal = Number(item.unitPrice || 0) * (Number(item.quantity) || 1);
                    const isQuantityBased = item.pricingType !== "FIXED" && item.pricingType !== "PER_GUEST";

                    return (
                      <div
                        key={item.id}
                        className="group relative rounded-2xl border border-[#eee7dc] bg-[#faf8f5]/60 p-3 transition-all hover:bg-white hover:border-[#9A7B4F]/40 hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                                <Check size={10} strokeWidth={3} />
                              </span>
                              <p className="truncate text-xs font-bold text-gray-900">
                                {item.name}
                              </p>
                            </div>

                            <p className="mt-1 text-[11px] text-gray-500">
                              {formatCurrency(item.unitPrice)}
                              {item.pricingType === "PER_GUEST" && (
                                <span className="ml-1 text-[10px] text-emerald-700">
                                  × {item.quantity} guests
                                </span>
                              )}
                              {item.pricingType !== "FIXED" && item.pricingType !== "PER_GUEST" && (
                                <span className="ml-1 text-[10px] text-gray-500">
                                  / {item.unitLabel || "unit"}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black text-gray-900">
                              {formatCurrency(lineTotal)}
                            </p>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-red-600 transition"
                            >
                              <Trash2 size={11} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Quantity Stepper in Summary */}
                        {isQuantityBased && (
                          <div className="mt-2.5 flex items-center justify-between border-t border-gray-200/60 pt-2">
                            <span className="text-[10px] font-medium text-gray-500">
                              Quantity:
                            </span>
                            <QuantitySelector
                              value={item.quantity || 1}
                              onChange={(qty) => onUpdateQuantity(item.id, qty)}
                              unitLabel={item.unitLabel}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel Footer & Total Cost */}
      <div className="border-t border-[#eee7dc] bg-[#faf8f5] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8d847b]">
              Estimated Services Total
            </p>
            <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Includes configured pricing</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-xl font-black text-[#29241f]">
              {formatCurrency(calculatedTotal)}
            </p>
          </div>
        </div>

        {onContinue && selectedItems.length > 0 && (
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#29241f] py-3.5 text-xs font-black text-white shadow-md transition-all hover:bg-black hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <span>Proceed with Selection</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

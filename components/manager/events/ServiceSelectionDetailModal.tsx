"use client";

import { X, CheckCircle2, Sparkles, Calendar, Users, MapPin, Tag, Layers, Info } from "lucide-react";
import type { StaffingStream } from "@/lib/department.api";
import { getCategoryTheme } from "./EventServiceSelectionSummary";
import { formatINR } from "@/lib/document-formatter";

interface ServiceSelectionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: StaffingStream | null;
  eventName?: string;
  eventDate?: string;
  guests?: number;
  location?: string;
}

export default function ServiceSelectionDetailModal({
  isOpen,
  onClose,
  stream,
  eventName = "Event",
  eventDate,
  guests,
  location,
}: ServiceSelectionDetailModalProps) {
  if (!isOpen || !stream) return null;

  const spec = stream.specDetails || {};
  const theme = getCategoryTheme(stream.category || stream.department);
  const IconComponent = theme.icon;

  const selectedOptionName = spec.optionName || spec.packageName;
  const quantity = spec.quantity || 1;
  const unitLabel = spec.unitLabel || "unit";
  const unitPrice = Number(spec.unitPrice || 0);
  const totalAmount = Number(spec.total || 0);
  const pricingType = spec.pricingType || "FIXED";
  const description = spec.description || "";

  // Category services list (if multiple items booked in this category)
  const categoryServices = Array.isArray(spec.categoryServices) ? spec.categoryServices : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-[#e8e1d8] bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-[#29241f] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs ${theme.iconBoxClass}`}
            >
              <IconComponent size={20} className={theme.iconClass} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a6c37]">
                  {stream.department}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${theme.badgeClass}`}
                >
                  Client Selection
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#29241f] truncate mt-0.5">
                {spec.serviceName || stream.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Event Context Strip */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-[#FAF8F5] px-4 py-2.5 text-xs text-gray-600">
          <span className="font-bold text-[#29241f] truncate max-w-[200px]">{eventName}</span>
          {eventDate && (
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar size={12} className="text-[#9a6c37]" />
              <span>{new Date(eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
            </span>
          )}
          {guests !== undefined && guests > 0 && (
            <span className="flex items-center gap-1 text-gray-500">
              <Users size={12} className="text-[#9a6c37]" />
              <span>{guests} guests</span>
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 text-gray-500 truncate max-w-[150px]">
              <MapPin size={12} className="text-[#9a6c37]" />
              <span className="truncate">{location}</span>
            </span>
          )}
        </div>

        {/* Primary Selected Item / Package Specification Card */}
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-[#ede5d8] bg-gradient-to-br from-[#faf7f2]/70 via-white to-[#fbf8f4] p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Selected Service & Package
                </p>
                <h3 className="text-base font-bold text-[#29241f] mt-0.5">
                  {spec.serviceName || stream.title}
                </h3>
                {selectedOptionName && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                    <Tag size={12} className="text-[#9a6c37]" />
                    <span>Option / Package: {selectedOptionName}</span>
                  </div>
                )}
              </div>

              {/* Price Tag if available */}
              {totalAmount > 0 && (
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Total Amount
                  </p>
                  <p className="text-lg font-black text-[#29241f] mt-0.5">
                    {formatINR(totalAmount)}
                  </p>
                  {unitPrice > 0 && quantity > 1 && (
                    <p className="text-[10px] text-gray-500">
                      {formatINR(unitPrice)} × {quantity} {unitLabel}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Spec Details Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Quantity / Units</p>
                <p className="font-extrabold text-[#29241f] mt-0.5">
                  {quantity} {unitLabel}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Pricing Model</p>
                <p className="font-extrabold text-[#29241f] mt-0.5">
                  {pricingType.replace(/_/g, " ")}
                </p>
              </div>

              {unitPrice > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Unit Rate</p>
                  <p className="font-extrabold text-[#29241f] mt-0.5">
                    {formatINR(unitPrice)} / {unitLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Scope / Description */}
            {description && (
              <div className="mt-3.5 border-t border-gray-100 pt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Service Description & Client Instructions
                </p>
                <p className="mt-1 text-xs text-gray-700 leading-relaxed bg-white/70 rounded-xl p-2.5 border border-gray-100">
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* Multi-Item / Category Breakdown (If multiple booked items exist in this category) */}
          {categoryServices.length > 1 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <Layers size={13} className="text-[#9a6c37]" />
                  <span>All Selected {stream.department} Items ({categoryServices.length})</span>
                </h4>
                <span className="text-[10px] text-gray-400">From client estimate</span>
              </div>

              <div className="mt-3 divide-y divide-gray-100">
                {categoryServices.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-[#29241f] truncate">
                        {item.serviceName}
                      </p>
                      {item.optionName && (
                        <p className="text-[11px] text-[#9a6c37] font-semibold">
                          Option: {item.optionName}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[10px] text-gray-500 truncate max-w-sm mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#29241f]">
                        {item.quantity} {item.unitLabel}
                      </p>
                      {item.total > 0 && (
                        <p className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                          {formatINR(item.total)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

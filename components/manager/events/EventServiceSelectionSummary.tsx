"use client";

import Link from "next/link";
import {
  Utensils,
  Palette,
  Camera,
  Music,
  Package,
  Truck,
  Layers,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import type { StaffingStream } from "@/lib/department.api";

interface EventServiceSelectionSummaryProps {
  stream: StaffingStream;
  eventId: string;
  onOpenDetails: (stream: StaffingStream) => void;
}

export function getCategoryTheme(category = "") {
  const c = category.toLowerCase();
  if (c.includes("cater") || c.includes("food")) {
    return {
      name: "catering",
      icon: Utensils,
      title: "Food Menu & Ingredients",
      defaultDesc: "View dishes, quantities, and food ingredients",
      badgeLabel: "dishes",
      containerClass:
        "border-amber-200/90 bg-gradient-to-r from-[#fdfbf7] via-[#faf5ec] to-[#f6ede0] hover:border-amber-300 hover:bg-[#f5ede0]",
      iconBoxClass: "bg-amber-500/15 text-amber-900 border-amber-300/50",
      iconClass: "text-[#87551e]",
      badgeClass: "bg-amber-200/80 text-amber-900 border-amber-300/60",
      actionBtnClass:
        "border-amber-200 text-amber-800 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
      textClass: "text-[#785122]/85",
      headingHoverClass: "group-hover:text-amber-950",
    };
  }

  if (c.includes("decor") || c.includes("stage") || c.includes("styling")) {
    return {
      name: "decoration",
      icon: Palette,
      title: "Decoration & Setup Items",
      defaultDesc: "View decor items, package details, and counts",
      badgeLabel: "items",
      containerClass:
        "border-rose-200/90 bg-gradient-to-r from-[#fff9fa] via-[#fdf2f4] to-[#fae8ec] hover:border-rose-300 hover:bg-[#fae8ec]",
      iconBoxClass: "bg-rose-500/15 text-rose-900 border-rose-300/50",
      iconClass: "text-rose-700",
      badgeClass: "bg-rose-200/80 text-rose-900 border-rose-300/60",
      actionBtnClass:
        "border-rose-200 text-rose-800 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600",
      textClass: "text-rose-900/80",
      headingHoverClass: "group-hover:text-rose-950",
    };
  }

  if (c.includes("photo") || c.includes("video") || c.includes("media") || c.includes("camera")) {
    return {
      name: "photography",
      icon: Camera,
      title: "Photography & Video Packages",
      defaultDesc: "View photo packages, shoot timings, and deliverables",
      badgeLabel: "package",
      containerClass:
        "border-sky-200/90 bg-gradient-to-r from-[#f7faff] via-[#edf5fc] to-[#e4eef9] hover:border-sky-300 hover:bg-[#e4eef9]",
      iconBoxClass: "bg-sky-500/15 text-sky-900 border-sky-300/50",
      iconClass: "text-sky-700",
      badgeClass: "bg-sky-200/80 text-sky-900 border-sky-300/60",
      actionBtnClass:
        "border-sky-200 text-sky-800 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600",
      textClass: "text-sky-900/80",
      headingHoverClass: "group-hover:text-sky-950",
    };
  }

  if (
    c.includes("sound") ||
    c.includes("light") ||
    c.includes("audio") ||
    c.includes("dj") ||
    c.includes("music")
  ) {
    return {
      name: "sound",
      icon: Music,
      title: "Sound & Lighting Setup",
      defaultDesc: "View sound systems, lights, and setup details",
      badgeLabel: "setup",
      containerClass:
        "border-purple-200/90 bg-gradient-to-r from-[#fbf8fe] via-[#f5eefb] to-[#ece0f6] hover:border-purple-300 hover:bg-[#ece0f6]",
      iconBoxClass: "bg-purple-500/15 text-purple-900 border-purple-300/50",
      iconClass: "text-purple-700",
      badgeClass: "bg-purple-200/80 text-purple-900 border-purple-300/60",
      actionBtnClass:
        "border-purple-200 text-purple-800 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600",
      textClass: "text-purple-900/80",
      headingHoverClass: "group-hover:text-purple-950",
    };
  }

  if (c.includes("equip") || c.includes("rent") || c.includes("stock")) {
    return {
      name: "equipment",
      icon: Package,
      title: "Equipment & Rental Items",
      defaultDesc: "View rental items, quantities, and stock assigned",
      badgeLabel: "units",
      containerClass:
        "border-emerald-200/90 bg-gradient-to-r from-[#f6fcf8] via-[#eef9f2] to-[#e1f4e7] hover:border-emerald-300 hover:bg-[#e1f4e7]",
      iconBoxClass: "bg-emerald-500/15 text-emerald-900 border-emerald-300/50",
      iconClass: "text-emerald-700",
      badgeClass: "bg-emerald-200/80 text-emerald-900 border-emerald-300/60",
      actionBtnClass:
        "border-emerald-200 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
      textClass: "text-emerald-900/80",
      headingHoverClass: "group-hover:text-emerald-950",
    };
  }

  if (c.includes("logistic") || c.includes("transport")) {
    return {
      name: "logistics",
      icon: Truck,
      title: "Vehicles & Transport",
      defaultDesc: "View vehicle timings, trips, and load details",
      badgeLabel: "units",
      containerClass:
        "border-teal-200/90 bg-gradient-to-r from-[#f4faf9] via-[#eaf6f4] to-[#dcf0ec] hover:border-teal-300 hover:bg-[#dcf0ec]",
      iconBoxClass: "bg-teal-500/15 text-teal-900 border-teal-300/50",
      iconClass: "text-teal-700",
      badgeClass: "bg-teal-200/80 text-teal-900 border-teal-300/60",
      actionBtnClass:
        "border-teal-200 text-teal-800 group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600",
      textClass: "text-teal-900/80",
      headingHoverClass: "group-hover:text-teal-950",
    };
  }

  // Default theme
  return {
    name: "general",
    icon: Layers,
    title: "Service Details & Options",
    defaultDesc: "View selected options, details, and quantities",
    badgeLabel: "booked",
    containerClass:
      "border-[#e8dfd3] bg-gradient-to-r from-[#fdfbf7] via-[#faf6f0] to-[#f4ebe0] hover:border-[#d9cbba] hover:bg-[#f2e7db]",
    iconBoxClass: "bg-[#9a6c37]/15 text-[#9a6c37] border-[#9a6c37]/30",
    iconClass: "text-[#87551e]",
    badgeClass: "bg-stone-200/80 text-stone-900 border-stone-300/60",
    actionBtnClass:
      "border-stone-200 text-stone-800 group-hover:bg-stone-800 group-hover:text-white group-hover:border-stone-800",
    textClass: "text-stone-800/80",
    headingHoverClass: "group-hover:text-stone-950",
  };
}

export default function EventServiceSelectionSummary({
  stream,
  eventId,
  onOpenDetails,
}: EventServiceSelectionSummaryProps) {
  const isCateringStream =
    stream.streamType === "CATERING" ||
    stream.streamId === "catering" ||
    stream.department?.toLowerCase().includes("cater");

  const spec = stream.specDetails || {};
  const theme = getCategoryTheme(stream.category || stream.department);
  const IconComponent = theme.icon;

  // ==========================================
  // CASE 1: CATERING (Preserve existing navigation)
  // ==========================================
  if (isCateringStream) {
    const dishesCount =
      spec.itemsCount !== undefined
        ? spec.itemsCount
        : spec.items?.length || 0;

    return (
      <Link
        href={`/manager/events/${eventId}/catering`}
        id="catering-menu-ingredients-btn"
        className={`mt-3.5 group flex w-full max-w-full min-w-0 items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-3.5 text-left shadow-2xs transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer overflow-hidden ${theme.containerClass}`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div
            className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform ${theme.iconBoxClass}`}
          >
            <IconComponent size={17} className={theme.iconClass} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 min-w-0">
              <span
                className={`text-xs font-bold text-[#29241f] transition-colors truncate max-w-full ${theme.headingHoverClass}`}
              >
                Catering Menu & Ingredients
              </span>
              {dishesCount > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 ${theme.badgeClass}`}
                >
                  {dishesCount} {dishesCount === 1 ? "dish" : "dishes"}
                </span>
              )}
            </div>
            <p className={`text-[11px] truncate max-w-full min-w-0 mt-0.5 ${theme.textClass}`}>
              View selected dishes, quantities, and kitchen ingredients
            </p>
          </div>
        </div>
        <div
          className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-white/90 border shadow-2xs transition-colors ${theme.actionBtnClass}`}
        >
          <ChevronRight size={15} />
        </div>
      </Link>
    );
  }

  // ==========================================
  // CASE 2: GENERAL OPERATIONS WITH NO SELECTIONS
  // ==========================================
  if (stream.streamType === "OPERATIONS" && !spec.serviceName && !spec.packageName) {
    return null;
  }

  // ==========================================
  // CASE 3: STANDARD SERVICE (Decoration, Photography, Sound, Equipment, etc.)
  // ==========================================
  const selectedOptionName = spec.optionName || spec.packageName;
  const quantity = spec.quantity || 1;
  const unitLabel = spec.unitLabel || "unit";
  const categoryCount = spec.categoryServices?.length || 0;

  // Determine appropriate badge text
  let badgeText = "";
  if (categoryCount > 1) {
    badgeText = `${categoryCount} items`;
  } else if (selectedOptionName) {
    badgeText = selectedOptionName;
  } else if (quantity > 1 || unitLabel !== "unit") {
    badgeText = `${quantity} ${unitLabel}`;
  } else {
    badgeText = "Selected";
  }

  // Determine appropriate subtitle text
  let subtitleText = "";
  if (selectedOptionName) {
    subtitleText = `Option: ${selectedOptionName} • Qty: ${quantity} ${unitLabel}`;
  } else if (spec.description) {
    subtitleText = spec.description;
  } else if (categoryCount > 1) {
    subtitleText = `Includes ${categoryCount} client-selected ${stream.department.toLowerCase()} items`;
  } else {
    subtitleText = theme.defaultDesc;
  }

  return (
    <button
      type="button"
      onClick={() => onOpenDetails(stream)}
      className={`mt-3.5 group flex w-full max-w-full min-w-0 items-center justify-between gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-3.5 text-left shadow-2xs transition-all duration-200 hover:shadow-xs active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer overflow-hidden ${theme.containerClass}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <div
          className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border group-hover:scale-105 transition-transform ${theme.iconBoxClass}`}
        >
          <IconComponent size={17} className={theme.iconClass} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 min-w-0">
            <span
              className={`text-xs font-bold text-[#29241f] transition-colors truncate max-w-full ${theme.headingHoverClass}`}
            >
              {theme.title}
            </span>
            {badgeText && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 truncate max-w-[120px] sm:max-w-[200px] ${theme.badgeClass}`}
                title={badgeText}
              >
                {badgeText}
              </span>
            )}
          </div>
          <p className={`text-[11px] truncate max-w-full min-w-0 mt-0.5 ${theme.textClass}`}>
            {subtitleText}
          </p>
        </div>
      </div>
      <div
        className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-white/90 border shadow-2xs transition-colors ${theme.actionBtnClass}`}
      >
        <ChevronRight size={15} />
      </div>
    </button>
  );
}

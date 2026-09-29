"use client";

import type { PricingType } from "@/types/service";

interface PricingDisplayProps {
  price: number;
  pricingType?: PricingType;
  unitLabel?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

export const getPricingTypeLabel = (
  pricingType: PricingType = "FIXED",
  unitLabel?: string
): string => {
  if (unitLabel && unitLabel.trim()) {
    return `/ ${unitLabel.trim()}`;
  }

  switch (pricingType) {
    case "PER_GUEST":
      return "/ guest";
    case "PER_UNIT":
      return "/ unit";
    case "PER_HOUR":
      return "/ hr";
    case "PER_DAY":
      return "/ day";
    case "PER_STAFF":
      return "/ staff";
    case "PER_REEL":
      return "/ reel";
    case "FIXED":
    default:
      return "";
  }
};

export const getPricingBadgeText = (pricingType: PricingType = "FIXED"): string => {
  switch (pricingType) {
    case "PER_GUEST":
      return "Guest Based";
    case "PER_UNIT":
      return "Per Unit";
    case "PER_HOUR":
      return "Hourly Rate";
    case "PER_DAY":
      return "Daily Rate";
    case "PER_STAFF":
      return "Per Staff";
    case "PER_REEL":
      return "Per Video Reel";
    case "FIXED":
    default:
      return "Fixed Price";
  }
};

export default function PricingDisplay({
  price,
  pricingType = "FIXED",
  unitLabel,
  className = "",
  size = "md",
  showBadge = false,
}: PricingDisplayProps) {
  const formattedPrice = formatCurrency(price);
  const suffix = getPricingTypeLabel(pricingType, unitLabel);
  const badgeText = getPricingBadgeText(pricingType);

  const priceSizes = {
    sm: "text-xs font-bold",
    md: "text-sm font-black",
    lg: "text-lg font-black sm:text-xl",
  };

  const suffixSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-baseline gap-1">
        <span className={`tracking-tight text-gray-900 ${priceSizes[size]}`}>
          {formattedPrice}
        </span>
        {suffix && (
          <span className={`font-medium text-gray-500 lowercase ${suffixSizes[size]}`}>
            {suffix}
          </span>
        )}
      </div>

      {showBadge && (
        <span className="mt-0.5 inline-block text-[10px] font-semibold tracking-wider uppercase text-[#8d847b]">
          {badgeText}
        </span>
      )}
    </div>
  );
}

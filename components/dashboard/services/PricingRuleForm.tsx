"use client";

import { DollarSign, Info } from "lucide-react";
import type { PricingType } from "@/types/service";

type PricingRuleFormProps = {
  pricingType: PricingType;
  price: number;
  unitLabel: string;

  onPricingTypeChange: (value: PricingType) => void;
  onPriceChange: (value: number) => void;
  onUnitLabelChange: (value: string) => void;

  disabled?: boolean;
};

const pricingTypes: {
  value: PricingType;
  label: string;
  description: string;
  defaultUnit: string;
}[] = [
  {
    value: "FIXED",
    label: "Fixed Price",
    description: "One fixed price for the service",
    defaultUnit: "service",
  },
  {
    value: "PER_GUEST",
    label: "Per Guest",
    description: "Price is calculated based on guest count",
    defaultUnit: "guest",
  },
  {
    value: "PER_UNIT",
    label: "Per Unit",
    description: "Price is calculated by quantity",
    defaultUnit: "unit",
  },
  {
    value: "PER_HOUR",
    label: "Per Hour",
    description: "Price is calculated by hours",
    defaultUnit: "hour",
  },
  {
    value: "PER_DAY",
    label: "Per Day",
    description: "Price is calculated by number of days",
    defaultUnit: "day",
  },
  {
    value: "PER_STAFF",
    label: "Per Staff",
    description: "Price is calculated by staff count",
    defaultUnit: "staff",
  },
  {
    value: "PER_REEL",
    label: "Per Reel",
    description: "Price is calculated by number of reels",
    defaultUnit: "reel",
  },
];

export default function PricingRuleForm({
  pricingType,
  price,
  unitLabel,
  onPricingTypeChange,
  onPriceChange,
  onUnitLabelChange,
  disabled = false,
}: PricingRuleFormProps) {
  const selectedPricingType = pricingTypes.find(
    (item) => item.value === pricingType,
  );

  const handlePricingTypeChange = (
    value: PricingType,
  ) => {
    onPricingTypeChange(value);

    const selected = pricingTypes.find(
      (item) => item.value === value,
    );

    if (selected && !unitLabel) {
      onUnitLabelChange(selected.defaultUnit);
    }
  };

  return (
    <div className="space-y-5">
      {/* Pricing Type */}
      <div>
        <label
          htmlFor="pricingType"
          className="mb-2 block text-sm font-medium text-[#5F6062]"
        >
          Pricing Type
        </label>

        <select
          id="pricingType"
          value={pricingType}
          disabled={disabled}
          onChange={(event) =>
            handlePricingTypeChange(
              event.target.value as PricingType,
            )
          }
          className="h-11 w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 text-sm text-[#5F6062] outline-none transition-all duration-200 hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pricingTypes.map((type) => (
            <option
              key={type.value}
              value={type.value}
            >
              {type.label}
            </option>
          ))}
        </select>

        {selectedPricingType && (
          <div className="mt-2.5 flex items-start gap-2 text-xs leading-5 text-[#85868A]">
            <Info
              size={14}
              strokeWidth={2}
              className="mt-0.5 shrink-0 text-[#8A8B8F]"
            />

            <span>
              {selectedPricingType.description}
            </span>
          </div>
        )}
      </div>

      {/* Price + Unit */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Price */}
        <div>
          <label
            htmlFor="servicePrice"
            className="mb-2 block text-sm font-medium text-[#5F6062]"
          >
            Price
          </label>

          <div className="relative">
            <DollarSign
              size={17}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8B8F]"
            />

            <input
              id="servicePrice"
              type="number"
              min="0"
              step="0.01"
              value={price}
              disabled={disabled}
              onChange={(event) =>
                onPriceChange(
                  Number(event.target.value),
                )
              }
              className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] py-2.5 pl-10 pr-4 text-sm text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="0.00"
            />
          </div>

          <p className="mt-1.5 text-xs text-[#85868A]">
            This rate is controlled by Admin.
          </p>
        </div>

        {/* Unit Label */}
        <div>
          <label
            htmlFor="unitLabel"
            className="mb-2 block text-sm font-medium text-[#5F6062]"
          >
            Unit Label
          </label>

          <input
            id="unitLabel"
            type="text"
            value={unitLabel}
            disabled={disabled}
            onChange={(event) =>
              onUnitLabelChange(
                event.target.value,
              )
            }
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 text-sm text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={
              selectedPricingType?.defaultUnit ||
              "unit"
            }
          />

          <p className="mt-1.5 text-xs text-[#85868A]">
            Example: guest, hour, reel, unit
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-[#E5E7EB] bg-[#F3F4F8] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8B8F]">
          Pricing Preview
        </p>

        <p className="mt-1.5 text-sm font-semibold text-[#5F6062]">
          ₹{Number(price || 0).toLocaleString("en-IN")}
          {pricingType !== "FIXED" && (
            <>
              {" "}
              <span className="font-normal text-[#85868A]">
                / {unitLabel || selectedPricingType?.defaultUnit}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
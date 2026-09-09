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
          className="mb-2 block text-sm font-medium text-[var(--ink)]"
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
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="mt-2 flex items-start gap-2 text-xs text-[var(--muted)]">
            <Info
              size={14}
              className="mt-0.5 shrink-0"
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
            className="mb-2 block text-sm font-medium text-[var(--ink)]"
          >
            Price
          </label>

          <div className="relative">
            <DollarSign
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
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
              className="w-full rounded-xl border border-[var(--line)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="0.00"
            />
          </div>

          <p className="mt-1.5 text-xs text-[var(--muted)]">
            This rate is controlled by Admin.
          </p>
        </div>

        {/* Unit Label */}
        <div>
          <label
            htmlFor="unitLabel"
            className="mb-2 block text-sm font-medium text-[var(--ink)]"
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
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={
              selectedPricingType?.defaultUnit ||
              "unit"
            }
          />

          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Example: guest, hour, reel, unit
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Pricing Preview
        </p>

        <p className="mt-1 text-sm font-medium text-[var(--ink)]">
          ₹{Number(price || 0).toLocaleString("en-IN")}
          {pricingType !== "FIXED" && (
            <>
              {" "}
              / {unitLabel || selectedPricingType?.defaultUnit}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
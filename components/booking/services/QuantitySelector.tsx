"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unitLabel?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10000,
  step = 1,
  label,
  unitLabel,
  size = "sm",
  disabled = false,
}: QuantitySelectorProps) {
  const currentVal = Math.max(min, Math.min(max, Number(value) || min));

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || currentVal <= min) return;
    onChange(Math.max(min, currentVal - step));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || currentVal >= max) return;
    onChange(Math.min(max, currentVal + step));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onChange(min);
    } else {
      onChange(Math.max(min, Math.min(max, val)));
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-2"
    >
      {label && (
        <span className="text-[11px] font-semibold text-gray-500">
          {label}:
        </span>
      )}

      <div className="inline-flex items-center rounded-xl border border-[#d8cfc4] bg-white p-0.5 shadow-xs transition-colors hover:border-[#a7773f]">
        <button
          type="button"
          disabled={disabled || currentVal <= min}
          onClick={handleDecrement}
          aria-label="Decrease quantity"
          className={`${
            isSmall ? "h-6 w-6" : "h-8 w-8"
          } flex items-center justify-center rounded-lg text-gray-600 transition hover:bg-[#faf8f5] hover:text-[#29241f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <Minus size={isSmall ? 12 : 14} strokeWidth={2.5} />
        </button>

        <input
          type="number"
          min={min}
          max={max}
          value={currentVal}
          disabled={disabled}
          onChange={handleChange}
          aria-label="Quantity"
          className={`${
            isSmall ? "w-10 text-xs" : "w-14 text-sm"
          } bg-transparent text-center font-bold text-[#29241f] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />

        <button
          type="button"
          disabled={disabled || currentVal >= max}
          onClick={handleIncrement}
          aria-label="Increase quantity"
          className={`${
            isSmall ? "h-6 w-6" : "h-8 w-8"
          } flex items-center justify-center rounded-lg text-gray-600 transition hover:bg-[#faf8f5] hover:text-[#29241f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30`}
        >
          <Plus size={isSmall ? 12 : 14} strokeWidth={2.5} />
        </button>
      </div>

      {unitLabel && (
        <span className="text-[11px] font-medium text-gray-500">
          {unitLabel}
        </span>
      )}
    </div>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";

interface ManagerStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export default function ManagerStatCard({
  label,
  value,
  icon: Icon,
  description,
}: ManagerStatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Icon */}
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A7B4F]">
        <Icon size={18} strokeWidth={2} />
      </div>

      {/* Value */}
      <p className="text-2xl font-semibold tracking-tight text-[#1F1F1F]">
        {value}
      </p>

      {/* Label */}
      <p className="mt-1 text-sm font-medium text-gray-700">
        {label}
      </p>

      {/* Description */}
      {description && (
        <p className="mt-0.5 text-[11px] leading-4 text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}
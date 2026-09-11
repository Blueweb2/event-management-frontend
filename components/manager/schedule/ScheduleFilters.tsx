"use client";

import { SlidersHorizontal } from "lucide-react";

export type ScheduleFilter =
  | "All"
  | "On Duty"
  | "Available"
  | "Off Duty";

interface ScheduleFiltersProps {
  activeFilter: ScheduleFilter;
  onFilterChange: (
    filter: ScheduleFilter,
  ) => void;
}

const filters: ScheduleFilter[] = [
  "All",
  "On Duty",
  "Available",
  "Off Duty",
];

export default function ScheduleFilters({
  activeFilter,
  onFilterChange,
}: ScheduleFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
        <SlidersHorizontal size={16} />
      </div>

      {filters.map((filter) => {
        const active =
          activeFilter === filter;

        return (
          <button
            key={filter}
            type="button"
            onClick={() =>
              onFilterChange(filter)
            }
            className={`min-h-9 shrink-0 rounded-lg px-4 text-xs font-medium transition ${
              active
                ? "bg-[#A88A5A] text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
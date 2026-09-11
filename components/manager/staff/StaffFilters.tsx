"use client";

import { SlidersHorizontal } from "lucide-react";

export type StaffFilter =
  | "All"
  | "Active"
  | "Inactive";

interface StaffFiltersProps {
  activeFilter: StaffFilter;
  onFilterChange: (
    filter: StaffFilter,
  ) => void;
}

const filters: StaffFilter[] = [
  "All",
  "Active",
  "Inactive",
];

export default function StaffFilters({
  activeFilter,
  onFilterChange,
}: StaffFiltersProps) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="group"
      aria-label="Staff status filters"
    >
      {/* Filter Icon */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500"
        aria-hidden="true"
      >
        <SlidersHorizontal
          size={17}
          strokeWidth={1.9}
        />
      </div>

      {/* Filter Buttons */}
      {filters.map((filter) => {
        const isActive =
          activeFilter === filter;

        return (
          <button
            key={filter}
            type="button"
            onClick={() =>
              onFilterChange(filter)
            }
            aria-pressed={isActive}
            className={`min-h-9 shrink-0 rounded-full px-4 text-xs font-medium transition active:scale-95 ${
              isActive
                ? "bg-[#1F1F1F] text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
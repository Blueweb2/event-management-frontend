"use client";

import { SlidersHorizontal } from "lucide-react";

import type {
  AssignmentStatus,
} from "@/types/assignment";

export type AssignmentFilter =
  | "All"
  | AssignmentStatus;

interface AssignmentFiltersProps {
  activeFilter: AssignmentFilter;
  onFilterChange: (
    filter: AssignmentFilter,
  ) => void;
}

const filters: AssignmentFilter[] = [
  "All",
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const filterLabels: Record<
  AssignmentFilter,
  string
> = {
  All: "All",
  ASSIGNED: "Assigned",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function AssignmentFilters({
  activeFilter,
  onFilterChange,
}: AssignmentFiltersProps) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="group"
      aria-label="Assignment status filters"
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
            {filterLabels[filter]}
          </button>
        );
      })}
    </div>
  );
}
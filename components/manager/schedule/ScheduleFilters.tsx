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
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
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
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ScheduleFiltersProps) {
  return (
    <div className="space-y-3 bg-[#F8F7F3] px-4 py-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
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

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-medium text-gray-600">
          From
          <input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-[#A88A5A]"
          />
        </label>

        <label className="text-xs font-medium text-gray-600">
          To
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-[#A88A5A]"
          />
        </label>
      </div>
    </div>
  );
}
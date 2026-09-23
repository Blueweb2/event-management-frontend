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
    <div className="space-y-3.5 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1 sm:pb-0">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
          <SlidersHorizontal size={15} />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {filters.map((filter) => {
            const active = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                className={`min-h-8 sm:min-h-9 shrink-0 rounded-xl px-3 sm:px-4 text-xs font-semibold transition whitespace-nowrap ${
                  active
                    ? "bg-[#9a7b4f] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <label className="text-xs font-semibold text-[#403a34]">
          From Date
          <input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-xs text-[#29241f] outline-none focus:border-[#b8894b]"
          />
        </label>

        <label className="text-xs font-semibold text-[#403a34]">
          To Date
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => onEndDateChange(event.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-xs text-[#29241f] outline-none focus:border-[#b8894b]"
          />
        </label>
      </div>
    </div>
  );
}
"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  dutyStatuses,
  type DutyStatus,
} from "./constants";

interface DutiesFiltersProps {
  search: string;
  status: "All" | DutyStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "All" | DutyStatus) => void;
  onClear: () => void;
}

export default function DutiesFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: DutiesFiltersProps) {
  const hasFilters =
    search.trim() !== "" || status !== "All";

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <SlidersHorizontal size={16} />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-[#29241f]">
              Duty Filters
            </h2>

            <p className="hidden text-xs text-[#9b938a] sm:block">
              Find duties quickly
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a6c37] transition hover:text-[#756d64]"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search duty, event or staff..."
            className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] pl-10 pr-4 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            onStatusChange(
              e.target.value as "All" | DutyStatus
            )
          }
          className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
        >
          <option value="All">All Statuses</option>

          {dutyStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
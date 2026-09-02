"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface StaffFiltersProps {
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

export default function StaffFilters({
  onSearchChange,
  onStatusChange,
}: StaffFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  function handleSearch(value: string) {
    setSearch(value);
    onSearchChange?.(value);
  }

  function handleStatus(value: string) {
    setStatus(value);
    onStatusChange?.(value);
  }

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal
          size={17}
          className="text-[#a7773f]"
        />

        <p className="text-sm font-semibold text-[#29241f]">
          Find Staff
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b938a]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
            placeholder="Search by name or role..."
            className="h-11 w-full rounded-xl border border-[#ded5cb] bg-[#fdfbf8] pl-10 pr-4 text-sm text-[#29241f] outline-none transition placeholder:text-[#aaa198] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(event) =>
            handleStatus(event.target.value)
          }
          className="h-11 rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm text-[#5f574f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10 sm:w-44"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="Off Duty">Off Duty</option>
        </select>
      </div>
    </div>
  );
}
"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  foodCategories,
  type FoodCategory,
  type FoodType,
} from "./constants";

interface FoodFiltersProps {
  search: string;
  category: "All" | FoodCategory;
  type: "All" | FoodType;
  availability: "All" | "Available" | "Unavailable";
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: "All" | FoodCategory) => void;
  onTypeChange: (value: "All" | FoodType) => void;
  onAvailabilityChange: (
    value: "All" | "Available" | "Unavailable"
  ) => void;
  onClear: () => void;
}

export default function FoodFilters({
  search,
  category,
  type,
  availability,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onAvailabilityChange,
  onClear,
}: FoodFiltersProps) {
  const hasFilters =
    search.trim() !== "" ||
    category !== "All" ||
    type !== "All" ||
    availability !== "All";

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <SlidersHorizontal size={16} />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-[#29241f]">
              Menu Filters
            </h2>

            <p className="hidden text-xs text-[#9b938a] sm:block">
              Find food items quickly
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

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative md:col-span-2 lg:col-span-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search food..."
            className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] pl-10 pr-4 text-sm text-[#29241f] outline-none transition placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) =>
            onCategoryChange(
              e.target.value as "All" | FoodCategory
            )
          }
          className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
        >
          <option value="All">All Categories</option>

          {foodCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Food Type */}
        <select
          value={type}
          onChange={(e) =>
            onTypeChange(e.target.value as "All" | FoodType)
          }
          className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
        >
          <option value="All">All Types</option>
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
        </select>

        {/* Availability */}
        <select
          value={availability}
          onChange={(e) =>
            onAvailabilityChange(
              e.target.value as
                | "All"
                | "Available"
                | "Unavailable"
            )
          }
          className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
        >
          <option value="All">All Availability</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>
    </section>
  );
}
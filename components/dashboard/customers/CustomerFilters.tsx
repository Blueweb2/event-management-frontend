"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export default function CustomerFilters() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const hasFilters = search !== "" || status !== "All";

  const clearFilters = () => {
    setSearch("");
    setStatus("All");
  };

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Search */}
        <div className="w-full lg:max-w-md">
          <label
            htmlFor="customer-search"
            className="mb-2 block text-sm font-semibold text-[#403a34]"
          >
            Search Customers
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
            />

            <input
              id="customer-search"
              type="text"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-lg border border-[#d9d0c6] bg-white pl-10 pr-4 text-sm text-[#403a34] outline-none transition placeholder:text-[#aaa198] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[180px]">
            <label
              htmlFor="customer-status"
              className="mb-2 block text-sm font-semibold text-[#403a34]"
            >
              Status
            </label>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
              />

              <select
                id="customer-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[#d9d0c6] bg-white pl-9 pr-4 text-sm text-[#403a34] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
              >
                <option value="All">All Customers</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#ded5cb] px-4 text-sm font-medium text-[#756d64] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
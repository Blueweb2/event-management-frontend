"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Search,
} from "lucide-react";

import StaffCard from "./StaffCard";
import StaffFilters, {
  type StaffFilter,
} from "./StaffFilters";

import type {
  Staff,
  StaffFilters as StaffFiltersType,
} from "@/types/staff";

interface StaffListProps {
  staff: Staff[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  loading: boolean;

  error: string | null;

  onFetchStaff: (
    filters?: StaffFiltersType,
  ) => Promise<void>;

  onClearError: () => void;

  onAddStaff: () => void;
}

export default function StaffList({
  staff,
  pagination,
  loading,
  error,
  onFetchStaff,
  onClearError,
  onAddStaff,
}: StaffListProps) {
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<StaffFilter>("All");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  /*
   * Debounce search input.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(
        search.trim(),
      );
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  /*
   * Convert UI filter to the exact
   * StaffStatusFilter values used by
   * the API.
   *
   * Your type expects:
   * "active" | "inactive"
   */
  const getStatusFilter =
    (): StaffFiltersType["status"] => {
      if (activeFilter === "Active") {
        return "active";
      }

      if (activeFilter === "Inactive") {
        return "inactive";
      }

      return undefined;
    };

  /*
   * Fetch whenever search/filter changes.
   */
  useEffect(() => {
    const status = getStatusFilter();

    onFetchStaff({
      search:
        debouncedSearch || undefined,
      status,
      page: 1,
      limit: pagination.limit || 20,
    });
    // We intentionally trigger this effect
    // only when the actual filter/search changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    activeFilter,
  ]);

  /*
   * Handle search.
   */
  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);

    if (error) {
      onClearError();
    }
  };

  /*
   * Handle status filter.
   */
  const handleFilterChange = (
    filter: StaffFilter,
  ) => {
    setActiveFilter(filter);

    if (error) {
      onClearError();
    }
  };

  /*
   * Clear filters.
   */
  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setActiveFilter("All");

    onClearError();

    onFetchStaff({
      page: 1,
      limit: pagination.limit || 20,
    });
  };

  /*
   * Pagination.
   */
  const handlePreviousPage = () => {
    if (
      loading ||
      pagination.page <= 1
    ) {
      return;
    }

    const nextPage =
      pagination.page - 1;

    onFetchStaff({
      search:
        debouncedSearch || undefined,
      status: getStatusFilter(),
      page: nextPage,
      limit: pagination.limit || 20,
    });
  };

  const handleNextPage = () => {
    if (
      loading ||
      pagination.page >=
        pagination.totalPages
    ) {
      return;
    }

    const nextPage =
      pagination.page + 1;

    onFetchStaff({
      search:
        debouncedSearch || undefined,
      status: getStatusFilter(),
      page: nextPage,
      limit: pagination.limit || 20,
    });
  };

  return (
    <section className="space-y-4">
      {/* =====================================
          SEARCH
      ====================================== */}
      <div className="relative">
        <Search
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            handleSearchChange(
              event.target.value,
            )
          }
          placeholder="Search staff..."
          aria-label="Search staff"
          className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10"
        />
      </div>

      {/* =====================================
          FILTERS
      ====================================== */}
      <StaffFilters
        activeFilter={activeFilter}
        onFilterChange={
          handleFilterChange
        }
      />

      {/* =====================================
          LIST HEADER
      ====================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#1F1F1F]">
            Staff Members
          </h2>

          <p className="mt-0.5 text-xs text-gray-400">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "member"
              : "members"}
          </p>
        </div>

        <button
          type="button"
          onClick={onAddStaff}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F1F1F] text-white shadow-sm transition hover:bg-black active:scale-95"
          aria-label="Add staff"
        >
          <span className="text-xl leading-none">
            +
          </span>
        </button>
      </div>

      {/* =====================================
          ERROR
      ====================================== */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium leading-5 text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                onFetchStaff({
                  search:
                    debouncedSearch ||
                    undefined,
                  status:
                    getStatusFilter(),
                  page:
                    pagination.page || 1,
                  limit:
                    pagination.limit || 20,
                })
              }
              className="shrink-0 text-xs font-semibold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* =====================================
          INITIAL LOADING
      ====================================== */}
      {loading && staff.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-12">
          <Loader2
            size={24}
            className="animate-spin text-[#9A7B4F]"
          />

          <p className="mt-3 text-xs font-medium text-gray-500">
            Loading staff...
          </p>
        </div>
      )}

      {/* =====================================
          EMPTY STATE
      ====================================== */}
      {!loading && staff.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4EBDD]">
            <Search
              size={20}
              className="text-[#9A7B4F]"
            />
          </div>

          <h3 className="mt-3 text-sm font-semibold text-[#1F1F1F]">
            No staff found
          </h3>

          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-gray-500">
            {search ||
            activeFilter !== "All"
              ? "Try changing your search or status filter."
              : "No staff members have been added yet."}
          </p>

          {(search ||
            activeFilter !== "All") && (
            <button
              type="button"
              onClick={
                handleClearFilters
              }
              className="mt-4 text-xs font-semibold text-[#9A7B4F]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* =====================================
          STAFF CARDS
      ====================================== */}
      {staff.length > 0 && (
        <div className="relative space-y-3">
          {loading && (
            <div className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <Loader2
                size={16}
                className="animate-spin text-[#9A7B4F]"
              />
            </div>
          )}

          {staff.map((member) => (
            <StaffCard
              key={member.id}
              staff={member}
            />
          ))}
        </div>
      )}

      {/* =====================================
          PAGINATION
      ====================================== */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            type="button"
            disabled={
              loading ||
              pagination.page <= 1
            }
            onClick={
              handlePreviousPage
            }
            className="min-h-10 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <p className="text-[11px] font-medium text-gray-600">
            Page {pagination.page} of{" "}
            {pagination.totalPages}
          </p>

          <button
            type="button"
            disabled={
              loading ||
              pagination.page >=
                pagination.totalPages
            }
            onClick={handleNextPage}
            className="min-h-10 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
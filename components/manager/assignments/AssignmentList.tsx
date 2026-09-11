"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import AssignmentCard from "./AssignmentCard";
import AssignmentFilters, {
  type AssignmentFilter,
} from "./AssignmentFilters";

import LoadingState from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";

import type {
  Assignment,
  AssignmentFilters as AssignmentFiltersType,
} from "@/types/assignment";

interface AssignmentListProps {
  assignments: Assignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  onFetchAssignments: (
    filters?: AssignmentFiltersType,
  ) => Promise<void>;
  onClearError: () => void;
  onAddAssignment: () => void;
  onDeleteAssignment?: (assignment: Assignment) => void;
  onEditAssignment?: (assignment: Assignment) => void;
}

export default function AssignmentList({
  assignments,
  pagination,
  loading,
  error,
  onFetchAssignments,
  onClearError,
  onAddAssignment,
  onDeleteAssignment,
  onEditAssignment,
}: AssignmentListProps) {
  const [activeFilter, setActiveFilter] =
    useState<AssignmentFilter>("All");

  const [search, setSearch] = useState("");

  /*
   * Fetch assignments when the status filter changes.
   */
  useEffect(() => {
    const filters: AssignmentFiltersType = {
      page: 1,
      limit: pagination.limit || 20,
    };

    if (activeFilter !== "All") {
      filters.status = activeFilter;
    }

    void onFetchAssignments(filters);
  }, [activeFilter]);

  /*
   * Client-side search.
   *
   * The current backend API does not have a generic search parameter,
   * so we search through the assignments already loaded on the page.
   */
  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return assignments;
    }

    return assignments.filter((assignment) => {
      const eventName =
        typeof assignment.event === "string"
          ? assignment.event
          : assignment.event?.eventName || "";

      const eventLocation =
        typeof assignment.event === "string"
          ? ""
          : assignment.event?.location || "";

      const staffName =
        typeof assignment.staff === "string"
          ? assignment.staff
          : assignment.staff?.name || "";

      const staffEmail =
        typeof assignment.staff === "string"
          ? ""
          : assignment.staff?.email || "";

      const searchableValues = [
        assignment.dutyTitle,
        assignment.role,
        assignment.description,
        eventName,
        eventLocation,
        staffName,
        staffEmail,
        assignment.status,
      ];

      return searchableValues
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query),
        );
    });
  }, [assignments, search]);

  const handleFilterChange = (
    filter: AssignmentFilter,
  ) => {
    setActiveFilter(filter);
  };

  const buildFilters = (
    page: number,
  ): AssignmentFiltersType => {
    const filters: AssignmentFiltersType = {
      page,
      limit: pagination.limit || 20,
    };

    if (activeFilter !== "All") {
      filters.status = activeFilter;
    }

    return filters;
  };

  const handleRetry = async () => {
    onClearError();

    await onFetchAssignments(
      buildFilters(pagination.page || 1),
    );
  };

  const handlePreviousPage = async () => {
    if (pagination.page <= 1 || loading) {
      return;
    }

    await onFetchAssignments(
      buildFilters(pagination.page - 1),
    );
  };

  const handleNextPage = async () => {
    if (
      pagination.page >= pagination.totalPages ||
      loading
    ) {
      return;
    }

    await onFetchAssignments(
      buildFilters(pagination.page + 1),
    );
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1F1F]">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage staff assignments
          </p>
        </div>

        <button
          type="button"
          onClick={onAddAssignment}
          aria-label="Add assignment"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-white shadow-sm transition active:scale-95"
        >
          <Plus
            size={20}
            strokeWidth={2.2}
          />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search assignments..."
          className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#B89563] focus:ring-2 focus:ring-[#B89563]/10"
        />
      </div>

      {/* Filters */}
      <AssignmentFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Error */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRetry}
        />
      )}

      {/* Loading */}
      {loading && assignments.length === 0 ? (
        <LoadingState />
      ) : filteredAssignments.length === 0 ? (
        <div>
          <EmptyState
            title={
              search
                ? "No assignments found"
                : "No assignments yet"
            }
            description={
              search
                ? "Try changing your search or filter."
                : "Create an assignment to get started."
            }
          />

          {!search && (
            <button
              type="button"
              onClick={onAddAssignment}
              className="mt-3 min-h-11 w-full rounded-xl bg-[#1F1F1F] px-4 text-sm font-medium text-white transition active:scale-[0.99]"
            >
              Add Assignment
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Assignment Cards */}
          <div className="space-y-3">
            {filteredAssignments.map(
              (assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  onDelete={onDeleteAssignment}
                  onEdit={onEditAssignment}
                />
              ),
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-3">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={
                  pagination.page <= 1 ||
                  loading
                }
                className="min-h-11 rounded-lg px-4 text-sm font-medium text-[#1F1F1F] transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-gray-500">
                {pagination.page} /{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={
                  pagination.page >=
                    pagination.totalPages ||
                  loading
                }
                className="min-h-11 rounded-lg px-4 text-sm font-medium text-[#1F1F1F] transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Result count */}
      {!loading &&
        filteredAssignments.length > 0 && (
          <p className="text-center text-xs text-gray-400">
            Showing {filteredAssignments.length} of{" "}
            {pagination.total} assignments
          </p>
        )}
    </section>
  );
}
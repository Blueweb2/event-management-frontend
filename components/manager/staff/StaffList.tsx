"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  Users,
  ChefHat,
  ShieldCheck,
  Building2,
  Plus,
} from "lucide-react";

import StaffCard from "./StaffCard";
import StaffFilters, {
  type StaffFilter,
} from "./StaffFilters";

import type {
  Staff,
  StaffFilters as StaffFiltersType,
  StaffSummary,
} from "@/types/staff";
import { useAuth } from "@/hooks/useAuth";

interface StaffListProps {
  staff: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: StaffSummary | null;
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
  summary,
  loading,
  error,
  onFetchStaff,
  onClearError,
  onAddStaff,
}: StaffListProps) {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin" || role === "admin";
  const isChefManager =
    role === "manager" &&
    String(user?.department || "").toLowerCase().includes("kitchen");
  const isDepartmentManager = role === "manager" && !isChefManager;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<StaffFilter>("All");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /*
   * Debounce search input.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const getStatusFilter = (): StaffFiltersType["status"] => {
    if (activeFilter === "Active") return "active";
    if (activeFilter === "Inactive") return "inactive";
    return undefined;
  };

  /*
   * Fetch whenever search/filters change.
   */
  useEffect(() => {
    const status = getStatusFilter();

    onFetchStaff({
      search: debouncedSearch || undefined,
      status,
      role: selectedRole !== "all" ? selectedRole : undefined,
      department: selectedDepartment !== "all" ? selectedDepartment : undefined,
      employmentType:
        selectedEmploymentType !== "all" ? selectedEmploymentType : undefined,
      page: 1,
      limit: pagination.limit || 20,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    activeFilter,
    selectedRole,
    selectedDepartment,
    selectedEmploymentType,
  ]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (error) onClearError();
  };

  const handleFilterChange = (filter: StaffFilter) => {
    setActiveFilter(filter);
    if (error) onClearError();
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setActiveFilter("All");
    setSelectedRole("all");
    setSelectedDepartment("all");
    setSelectedEmploymentType("all");
    onClearError();

    onFetchStaff({
      page: 1,
      limit: pagination.limit || 20,
    });
  };

  const handlePreviousPage = () => {
    if (loading || pagination.page <= 1) return;

    onFetchStaff({
      search: debouncedSearch || undefined,
      status: getStatusFilter(),
      role: selectedRole !== "all" ? selectedRole : undefined,
      department: selectedDepartment !== "all" ? selectedDepartment : undefined,
      employmentType:
        selectedEmploymentType !== "all" ? selectedEmploymentType : undefined,
      page: pagination.page - 1,
      limit: pagination.limit || 20,
    });
  };

  const handleNextPage = () => {
    if (loading || pagination.page >= pagination.totalPages) return;

    onFetchStaff({
      search: debouncedSearch || undefined,
      status: getStatusFilter(),
      role: selectedRole !== "all" ? selectedRole : undefined,
      department: selectedDepartment !== "all" ? selectedDepartment : undefined,
      employmentType:
        selectedEmploymentType !== "all" ? selectedEmploymentType : undefined,
      page: pagination.page + 1,
      limit: pagination.limit || 20,
    });
  };

  // Scope Header titles
  const headerTitle = isSuperAdmin
    ? "All Managers & Staff Directory"
    : isChefManager
    ? "Kitchen Staff Directory"
    : `${user?.department || "Department"} Staff Directory`;

  const headerSubtitle = isSuperAdmin
    ? "Organization-wide staff and management personnel across all departments"
    : isChefManager
    ? "Displaying kitchen and culinary department personnel only"
    : `Staff assigned to the ${user?.department || "authorized"} department scope`;

  const placeholderText = isSuperAdmin
    ? "Search managers or staff by name, email, phone, ID, or department..."
    : isChefManager
    ? "Search kitchen staff by name, email, phone, or ID..."
    : `Search ${user?.department || ""} staff by name, email, phone, or ID...`;

  return (
    <section className="space-y-4">
      {/* Scope banner for Chef and Department Managers */}
      {!isSuperAdmin && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs font-semibold border ${
            isChefManager
              ? "bg-amber-50/70 border-amber-200 text-amber-900"
              : "bg-sky-50/70 border-sky-200 text-sky-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {isChefManager ? (
              <ChefHat size={16} className="text-amber-700" />
            ) : (
              <Building2 size={16} className="text-sky-700" />
            )}
            <span>
              {isChefManager
                ? "Kitchen Management Scope — Showing Kitchen staff only"
                : `Authorized Department Scope: ${user?.department || "Assigned Unit"}`}
            </span>
          </div>
          <span className="rounded-lg bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
            Role Protected
          </span>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative">
        <Search
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={placeholderText}
          aria-label="Search staff"
          className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 shadow-2xs"
        />
      </div>

      {/* FILTERS */}
      <StaffFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        isSuperAdmin={isSuperAdmin}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedEmploymentType={selectedEmploymentType}
        onEmploymentTypeChange={setSelectedEmploymentType}
        departmentCounts={summary?.departmentCounts || {}}
      />

      {/* LIST HEADER */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#1F1F1F] sm:text-base">
              {headerTitle}
            </h2>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
              {pagination.total} {pagination.total === 1 ? "record" : "records"}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{headerSubtitle}</p>
        </div>

        <button
          type="button"
          onClick={onAddStaff}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95"
          aria-label="Add staff member"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>{isSuperAdmin ? "Add User" : "Add Staff"}</span>
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium leading-5 text-red-600">{error}</p>
            <button
              type="button"
              onClick={() =>
                onFetchStaff({
                  search: debouncedSearch || undefined,
                  status: getStatusFilter(),
                  role: selectedRole !== "all" ? selectedRole : undefined,
                  department:
                    selectedDepartment !== "all" ? selectedDepartment : undefined,
                  employmentType:
                    selectedEmploymentType !== "all"
                      ? selectedEmploymentType
                      : undefined,
                  page: pagination.page || 1,
                  limit: pagination.limit || 20,
                })
              }
              className="shrink-0 text-xs font-semibold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* INITIAL LOADING */}
      {loading && staff.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-12">
          <Loader2 size={24} className="animate-spin text-[#9A7B4F]" />
          <p className="mt-3 text-xs font-medium text-gray-500">
            Loading team members...
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && staff.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4EBDD]">
            {isChefManager ? (
              <ChefHat size={22} className="text-[#9A7B4F]" />
            ) : (
              <Search size={20} className="text-[#9A7B4F]" />
            )}
          </div>

          <h3 className="mt-3 text-sm font-bold text-[#1F1F1F]">
            {isChefManager
              ? "No Kitchen Staff Found"
              : isDepartmentManager
              ? `No ${user?.department || "Department"} Staff Found`
              : "No Staff Members Found"}
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
            {search ||
            activeFilter !== "All" ||
            selectedRole !== "all" ||
            selectedDepartment !== "all" ||
            selectedEmploymentType !== "all"
              ? "No team members matched your active search or filters. Try clearing your filters."
              : isChefManager
              ? "No kitchen employees are assigned to the kitchen department yet. Click '+ Add Staff' to register kitchen staff."
              : isDepartmentManager
              ? `No staff are assigned to the ${user?.department || "your"} department yet.`
              : "No managers or staff accounts have been registered yet."}
          </p>

          {(search ||
            activeFilter !== "All" ||
            selectedRole !== "all" ||
            selectedDepartment !== "all" ||
            selectedEmploymentType !== "all") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-[#9A7B4F] hover:bg-gray-100 transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* STAFF CARDS */}
      {staff.length > 0 && (
        <div className="relative space-y-3">
          {loading && (
            <div className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <Loader2 size={16} className="animate-spin text-[#9A7B4F]" />
            </div>
          )}

          {staff.map((member) => (
            <StaffCard key={member.id} staff={member} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={handlePreviousPage}
            className="min-h-10 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-2xs"
          >
            Previous
          </button>

          <p className="text-[11px] font-medium text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <button
            type="button"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={handleNextPage}
            className="min-h-10 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-2xs"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
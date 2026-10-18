"use client";

import { SlidersHorizontal, Building2, Shield, Briefcase } from "lucide-react";
import { STANDARD_DEPARTMENTS } from "@/lib/department-options";

export type StaffFilter = "All" | "Active" | "Inactive";

interface StaffFiltersProps {
  activeFilter: StaffFilter;
  onFilterChange: (filter: StaffFilter) => void;
  isSuperAdmin?: boolean;
  selectedRole?: string;
  onRoleChange?: (role: string) => void;
  selectedDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
  selectedEmploymentType?: string;
  onEmploymentTypeChange?: (type: string) => void;
  departmentCounts?: Record<string, number>;
}

const statusFilters: StaffFilter[] = ["All", "Active", "Inactive"];

export default function StaffFilters({
  activeFilter,
  onFilterChange,
  isSuperAdmin = false,
  selectedRole = "all",
  onRoleChange,
  selectedDepartment = "all",
  onDepartmentChange,
  selectedEmploymentType = "all",
  onEmploymentTypeChange,
  departmentCounts = {},
}: StaffFiltersProps) {
  // Merge standard departments with any departments from backend summary
  const availableDepartments = Array.from(
    new Set([
      "Kitchen",
      ...STANDARD_DEPARTMENTS,
      ...Object.keys(departmentCounts),
    ])
  ).filter(Boolean).sort();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter Buttons */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          role="group"
          aria-label="Staff status filters"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-2xs"
            aria-hidden="true"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
          </div>

          {statusFilters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                aria-pressed={isActive}
                className={`min-h-9 shrink-0 rounded-xl px-3.5 text-xs font-semibold transition active:scale-95 ${
                  isActive
                    ? "bg-[#1F1F1F] text-white shadow-xs"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Superadmin Role Filter */}
        {isSuperAdmin && onRoleChange && (
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-2xs">
            <span className="flex items-center gap-1 px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <Shield size={12} className="text-[#9A7B4F]" />
              Role
            </span>
            <button
              type="button"
              onClick={() => onRoleChange("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedRole === "all"
                  ? "bg-[#9A7B4F] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onRoleChange("manager")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedRole === "manager"
                  ? "bg-[#9A7B4F] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Managers
            </button>
            <button
              type="button"
              onClick={() => onRoleChange("staff")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedRole === "staff"
                  ? "bg-[#9A7B4F] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Staff Only
            </button>
          </div>
        )}

        {/* Department Dropdown (Super Admin) */}
        {isSuperAdmin && onDepartmentChange && (
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 shadow-2xs">
            <Building2 size={13} className="text-gray-400 shrink-0" />
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              aria-label="Filter by department"
              className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} {departmentCounts[dept] ? `(${departmentCounts[dept]})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Employment Type Filter Dropdown */}
        {onEmploymentTypeChange && (
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 shadow-2xs">
            <Briefcase size={13} className="text-gray-400 shrink-0" />
            <select
              value={selectedEmploymentType}
              onChange={(e) => onEmploymentTypeChange(e.target.value)}
              aria-label="Filter by employment type"
              className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">All Employment Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
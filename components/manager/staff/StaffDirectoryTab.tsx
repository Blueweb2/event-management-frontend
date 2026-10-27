"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  ShieldCheck,
  ChefHat,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import StaffList from "./StaffList";
import AddStaffModal from "./AddStaffModal";
import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/hooks/useAuth";
import type { CreateStaffPayload, Staff } from "@/types/staff";

export default function StaffDirectoryTab() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const role = (user?.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin" || role === "admin";
  const isChefManager =
    role === "manager" &&
    String(user?.department || "").toLowerCase().includes("kitchen");
  const isDepartmentManager = role === "manager" && !isChefManager;

  const filters = useMemo(
    () => ({
      page: 1,
      limit: 20,
    }),
    []
  );

  const {
    staff,
    pagination,
    summary,
    loading,
    error,
    fetchStaff,
    addStaff,
    clearError,
  } = useStaff({
    token,
    filters,
  });

  const handleOpenAddStaff = useCallback(() => {
    clearError();
    setIsAddModalOpen(true);
  }, [clearError]);

  const handleCloseAddStaff = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleCreateStaff = useCallback(
    async (payload: CreateStaffPayload): Promise<Staff> => {
      const newStaff = await addStaff(payload);

      await fetchStaff({
        page: 1,
        limit: 20,
      });

      setIsAddModalOpen(false);
      return newStaff;
    },
    [addStaff, fetchStaff]
  );

  const handleRetry = async () => {
    clearError();
    await fetchStaff({
      page: pagination.page || 1,
      limit: pagination.limit || 20,
    });
  };

  // Compute metrics fallback from staff list if summary is not yet available
  const computedStats = useMemo(() => {
    if (summary) {
      return {
        totalManagers: summary.totalManagers,
        totalStaff: summary.totalStaff,
        active: summary.activeEmployees,
        inactive: summary.inactiveEmployees,
        departments: Object.keys(summary.departmentCounts || {}).length,
      };
    }
    const totalStaff = pagination.total || staff.length;
    const active = staff.filter((s) => s.isActive).length;
    const inactive = staff.filter((s) => !s.isActive).length;
    const departments = new Set(staff.map((s) => s.department).filter(Boolean)).size;
    const totalManagers = staff.filter(
      (s) => s.role === "manager" || s.role === "admin" || s.role === "superadmin"
    ).length;

    return { totalManagers, totalStaff, active, inactive, departments };
  }, [summary, pagination.total, staff]);

  return (
    <div className="space-y-6">
      {/* Top Header Summary Cards adapted to user role */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {isSuperAdmin ? (
          <>
            <div
              onClick={() => router.push("/manager/staff?tab=managers")}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 shadow-xs transition hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/80 sm:p-4 cursor-pointer group"
              title="Click to switch to Tab 5: Department Managers"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-800">
                  <ShieldCheck size={10} />
                  Total Managers
                </span>
            
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-indigo-950">
                {computedStats.totalManagers}
              </p>
              <p className="mt-0.5 text-[10px] text-indigo-700/80">Manage in Department Managers (Tab 5)</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                <Users size={10} />
                Total Staff
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
                {computedStats.totalStaff}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400">Non-manager staff members</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                <UserCheck size={10} />
                Active Staff
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-950">
                {computedStats.active}
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-700/80">Available for dispatch</p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-800">
                <Building2 size={10} />
                Departments
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-sky-950">
                {computedStats.departments || 1}
              </p>
              <p className="mt-0.5 text-[10px] text-sky-700/80">Active operational units</p>
            </div>
          </>
        ) : isChefManager ? (
          <>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                <ChefHat size={10} />
                Kitchen Staff
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-amber-950">
                {computedStats.totalStaff}
              </p>
              <p className="mt-0.5 text-[10px] text-amber-700/80">Culinary & Kitchen team</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                <UserCheck size={10} />
                Active on Duty
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-950">
                {computedStats.active}
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-700/80">Ready for prep & shifts</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                <UserX size={10} />
                Off Duty / Leave
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
                {computedStats.inactive}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400">Deactivated or off schedule</p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-800">
                <Building2 size={10} />
                Department
              </span>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-sky-950 truncate">
                Kitchen
              </p>
              <p className="mt-0.5 text-[10px] text-sky-700/80">Exclusive culinary scope</p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                <Users size={10} />
                Dept Staff
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
                {computedStats.totalStaff}
              </p>
              <p className="mt-0.5 text-[10px] text-gray-400">Assigned department team</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                <UserCheck size={10} />
                Active
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-950">
                {computedStats.active}
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-700/80">Available for dispatch</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                <UserX size={10} />
                Inactive
              </span>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-amber-950">
                {computedStats.inactive}
              </p>
              <p className="mt-0.5 text-[10px] text-amber-700/80">Deactivated or off duty</p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
              <span className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-800">
                <Building2 size={10} />
                Scope
              </span>
              <p className="mt-1.5 text-lg font-bold tracking-tight text-sky-950 truncate">
                {user?.department || "Operations"}
              </p>
              <p className="mt-0.5 text-[10px] text-sky-700/80">Assigned scope</p>
            </div>
          </>
        )}
      </section>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 font-medium"
        >
          <AlertCircle size={15} />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Staff List */}
      <StaffList
        staff={staff}
        pagination={pagination}
        summary={summary}
        loading={loading}
        error={error}
        onFetchStaff={fetchStaff}
        onClearError={clearError}
        onAddStaff={handleOpenAddStaff}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddStaff}
        onSave={handleCreateStaff}
      />
    </div>
  );
}

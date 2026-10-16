"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  AlertCircle,
} from "lucide-react";
import StaffList from "./StaffList";
import AddStaffModal from "./AddStaffModal";
import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/hooks/useAuth";
import type { CreateStaffPayload, Staff } from "@/types/staff";

export default function StaffDirectoryTab() {
  const { token } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  // Quick stats
  const stats = useMemo(() => {
    const total = pagination.total || staff.length;
    const active = staff.filter((s) => s.isActive).length;
    const inactive = staff.filter((s) => !s.isActive).length;
    const departments = new Set(staff.map((s) => s.department).filter(Boolean)).size;
    return { total, active, inactive, departments };
  }, [pagination.total, staff]);

  return (
    <div className="space-y-6">
      {/* Top Header Summary Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
          <span className="inline-flex rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">
            Total Staff
          </span>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
            {stats.total}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">Registered team members</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
          <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
            Active
          </span>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-950">
            {stats.active}
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-700/80">Available for dispatch</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
          <span className="inline-flex rounded-lg border border-amber-200 bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
            Inactive
          </span>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-amber-950">
            {stats.inactive}
          </p>
          <p className="mt-0.5 text-[10px] text-amber-700/80">Deactivated / Off duty</p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
          <span className="inline-flex rounded-lg border border-sky-200 bg-sky-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-800">
            Departments
          </span>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-sky-950">
            {stats.departments}
          </p>
          <p className="mt-0.5 text-[10px] text-sky-700/80">Active operational units</p>
        </div>
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

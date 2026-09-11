"use client";

import { useState } from "react";

import PageHeader from "@/components/common/PageHeader";
import StaffList from "@/components/manager/staff/StaffList";
import AddStaffModal from "@/components/manager/staff/AddStaffModal";

import { useStaff } from "@/hooks/useStaff";
import { useAuth } from "@/hooks/useAuth";

import type {
  CreateStaffPayload,
  Staff,
} from "@/types/staff";

export default function ManagerStaffPage() {
  const { token } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

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
    filters: {
      page: 1,
      limit: 20,
    },
  });

  /*
   * Open Add Staff modal
   */
  const handleOpenAddStaff = () => {
    clearError();
    setIsAddModalOpen(true);
  };

  /*
   * Close Add Staff modal
   */
  const handleCloseAddStaff = () => {
    if (!loading) {
      setIsAddModalOpen(false);
    }
  };

  /*
   * Create Staff
   *
   * IMPORTANT:
   * This function MUST return Staff because
   * AddStaffModal expects:
   *
   * (payload: CreateStaffPayload) => Promise<Staff>
   */
  const handleCreateStaff = async (
    payload: CreateStaffPayload,
  ): Promise<Staff> => {
    const newStaff = await addStaff(payload);

    /*
     * Refresh the list from backend.
     */
    await fetchStaff({
      page: 1,
      limit: 20,
    });

    /*
     * Close modal.
     */
    setIsAddModalOpen(false);

    /*
     * VERY IMPORTANT:
     * Return the created staff.
     */
    return newStaff;
  };

  /*
   * Retry loading staff
   */
  const handleRetry = async () => {
    clearError();

    await fetchStaff({
      page: pagination.page || 1,
      limit: pagination.limit || 20,
    });
  };

  return (
    <>
      <main className="space-y-5">
        {/* =====================================
            PAGE HEADER
        ====================================== */}
        <PageHeader
          title="Staff"
          description="Manage your event staff"
        />

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
                onClick={handleRetry}
                className="shrink-0 text-xs font-semibold text-red-700 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* =====================================
            STAFF LIST
        ====================================== */}
        <StaffList
          staff={staff}
          pagination={pagination}
          loading={loading}
          error={error}
          onFetchStaff={fetchStaff}
          onClearError={clearError}
          onAddStaff={handleOpenAddStaff}
        />
      </main>

      {/* =======================================
          ADD STAFF MODAL
      ======================================== */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddStaff}
        onSave={handleCreateStaff}
      />
    </>
  );
}
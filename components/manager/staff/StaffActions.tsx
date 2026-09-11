"use client";

import { useState } from "react";
import {
  Edit3,
  KeyRound,
  MoreHorizontal,
  Power,
  UserX,
  Loader2,
} from "lucide-react";

import EditStaffModal from "./EditStaffModal";
import ResetPasswordModal from "./ResetPasswordModal";

import type {
  Staff,
  UpdateStaffPayload,
  ResetStaffPasswordResponse,
} from "@/types/staff";

interface StaffActionsProps {
  staff: Staff;

  onStatusChange?: (
    id: string,
    isActive: boolean,
  ) => Promise<Staff>;

  onStaffUpdated?: (
    id: string,
    payload: UpdateStaffPayload,
  ) => Promise<Staff>;

  onPasswordReset?: (
    id: string,
    newPassword: string,
  ) => Promise<ResetStaffPasswordResponse>;
}

export default function StaffActions({
  staff,
  onStatusChange,
  onStaffUpdated,
  onPasswordReset,
}: StaffActionsProps) {
  const [isActionsOpen, setIsActionsOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [
    isResetPasswordModalOpen,
    setIsResetPasswordModalOpen,
  ] = useState(false);

  const [isStatusUpdating, setIsStatusUpdating] =
    useState(false);

  const [statusError, setStatusError] =
    useState<string | null>(null);

  const isActive = staff.isActive;

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = () => {
    setIsActionsOpen(false);
    setIsEditModalOpen(true);
  };

  const handleStaffUpdate = async (
    payload: UpdateStaffPayload,
  ) => {
    if (!onStaffUpdated) {
      throw new Error(
        "Staff update handler is not available.",
      );
    }

    const updatedStaff = await onStaffUpdated(
      staff.id,
      payload,
    );

    setIsEditModalOpen(false);

    return updatedStaff;
  };

  // ==========================================
  // STATUS
  // ==========================================

  const handleStatusChange = async () => {
    if (!onStatusChange) {
      return;
    }

    try {
      setStatusError(null);
      setIsStatusUpdating(true);

      await onStatusChange(
        staff.id,
        !isActive,
      );

      setIsActionsOpen(false);
    } catch (err) {
      setStatusError(
        err instanceof Error
          ? err.message
          : "Failed to update staff status.",
      );
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = () => {
    setIsActionsOpen(false);
    setIsResetPasswordModalOpen(true);
  };

  const handlePasswordReset = async (
    newPassword: string,
  ) => {
    if (!onPasswordReset) {
      throw new Error(
        "Password reset handler is not available.",
      );
    }

    await onPasswordReset(
      staff.id,
      newPassword,
    );

    setIsResetPasswordModalOpen(false);
  };

  return (
    <>
      <section
        aria-labelledby="staff-actions-heading"
        className="space-y-3"
      >
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              id="staff-actions-heading"
              className="text-sm font-semibold text-[#1F1F1F]"
            >
              Staff Management
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Manage this staff member
            </p>
          </div>

          {/* More Button */}
          <button
            type="button"
            onClick={() =>
              setIsActionsOpen(
                (open) => !open,
              )
            }
            aria-label="Open staff actions"
            aria-expanded={isActionsOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 active:scale-95"
          >
            <MoreHorizontal
              size={20}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Status Error */}
        {statusError && (
          <div
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3"
          >
            <p className="text-xs font-medium leading-5 text-red-600">
              {statusError}
            </p>
          </div>
        )}

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          {/* Edit */}
          <button
            type="button"
            onClick={handleEdit}
            disabled={isStatusUpdating}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1F1F1F] px-4 text-xs font-semibold text-white transition hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Edit3
              size={16}
              strokeWidth={1.9}
            />

            <span>Edit Staff</span>
          </button>

          {/* Activate / Deactivate */}
          <button
            type="button"
            onClick={handleStatusChange}
            disabled={
              isStatusUpdating ||
              !onStatusChange
            }
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                : "border-[#D8C29D] bg-[#F4EBDD] text-[#8A6A3F] hover:bg-[#EEDFC7]"
            }`}
          >
            {isStatusUpdating ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : isActive ? (
              <UserX
                size={16}
                strokeWidth={1.9}
              />
            ) : (
              <Power
                size={16}
                strokeWidth={1.9}
              />
            )}

            <span>
              {isStatusUpdating
                ? "Updating..."
                : isActive
                  ? "Deactivate"
                  : "Activate"}
            </span>
          </button>
        </div>

        {/* Expanded Actions */}
        {isActionsOpen && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={handleResetPassword}
              className="flex min-h-12 w-full items-center gap-3 px-4 text-left text-xs font-medium text-gray-700 transition hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4EBDD] text-[#9A7B4F]">
                <KeyRound
                  size={15}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-[#1F1F1F]">
                  Reset Password
                </p>

                <p className="mt-0.5 text-[10px] text-gray-400">
                  Set a new password for this
                  staff member
                </p>
              </div>
            </button>
          </div>
        )}
      </section>

      {/* ======================================
          EDIT STAFF MODAL
      ====================================== */}

      <EditStaffModal
        staff={staff}
        isOpen={isEditModalOpen}
        onClose={() =>
          setIsEditModalOpen(false)
        }
        onSave={handleStaffUpdate}
      />

      {/* ======================================
          RESET PASSWORD MODAL
      ====================================== */}

      <ResetPasswordModal
        staff={staff}
        isOpen={
          isResetPasswordModalOpen
        }
        onClose={() =>
          setIsResetPasswordModalOpen(false)
        }
        onConfirm={handlePasswordReset}
      />
    </>
  );
}
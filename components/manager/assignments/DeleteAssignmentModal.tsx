"use client";

import { AlertTriangle, X } from "lucide-react";

import type { Assignment } from "@/types/assignment";

interface DeleteAssignmentModalProps {
  isOpen: boolean;
  assignment: Assignment | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteAssignmentModal({
  isOpen,
  assignment,
  loading = false,
  onClose,
  onConfirm,
}: DeleteAssignmentModalProps) {
  if (!isOpen || !assignment) {
    return null;
  }

  const eventName =
    typeof assignment.event === "object"
      ? assignment.event.eventName
      : "this event";

  const staffName =
    typeof assignment.staff === "object"
      ? assignment.staff.name
      : "this staff member";

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch {
      // The parent/hook handles the actual error state.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 pb-3 sm:items-center sm:px-4 sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-assignment-title"
    >
      {/* Modal */}
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2
            id="delete-assignment-title"
            className="text-base font-semibold text-[#1F1F1F]"
          >
            Delete Assignment
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle
              size={25}
              strokeWidth={1.8}
              className="text-red-500"
            />
          </div>

          <h3 className="mt-4 text-center text-sm font-semibold text-[#1F1F1F]">
            Are you sure?
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-center text-xs leading-5 text-gray-500">
            This assignment will be deleted and
            the assignment details will no longer
            be available.
          </p>

          {/* Assignment Summary */}
          <div className="mt-5 rounded-2xl border border-gray-100 bg-[#F8F7F3] p-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Duty
              </p>

              <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                {assignment.dutyTitle}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400">
                  Event
                </p>

                <p className="mt-0.5 truncate text-xs font-medium text-gray-600">
                  {eventName}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[10px] text-gray-400">
                  Staff
                </p>

                <p className="mt-0.5 truncate text-xs font-medium text-gray-600">
                  {staffName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-12 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="min-h-12 flex-1 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : "Delete Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
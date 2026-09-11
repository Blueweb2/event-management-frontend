"use client";

import { useState } from "react";

import AssignmentList from "@/components/manager/assignments/AssignmentList";
import AssignmentForm from "@/components/manager/assignments/AssignmentForm";
import DeleteAssignmentModal from "@/components/manager/assignments/DeleteAssignmentModal";

import { useAssignments } from "@/hooks/useAssignments";

import type {
  Assignment,
  AssignmentFilters,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "@/types/assignment";

export default function AssignmentsPage() {
  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  });

  const [showForm, setShowForm] =
    useState(false);

  const [editingAssignment, setEditingAssignment] =
    useState<Assignment | null>(null);

  const [deletingAssignment, setDeletingAssignment] =
    useState<Assignment | null>(null);

  const {
    assignments,
    pagination,
    loading,
    error,
    fetchAssignments,
    addAssignment,
    editAssignment,
    removeAssignment,
    clearError,
  } = useAssignments({
    token,
    autoFetch: false,
  });

  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const handleAddAssignment = () => {
    clearError();

    setEditingAssignment(null);
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEditAssignment = (
    assignment: Assignment,
  ) => {
    clearError();

    setEditingAssignment(assignment);
    setShowForm(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const handleCloseForm = () => {
    if (loading) {
      return;
    }

    setShowForm(false);
    setEditingAssignment(null);
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (
    payload:
      | CreateAssignmentPayload
      | UpdateAssignmentPayload,
  ): Promise<void> => {
    if (editingAssignment) {
      await editAssignment(
        editingAssignment._id,
        payload as UpdateAssignmentPayload,
      );
    } else {
      await addAssignment(
        payload as CreateAssignmentPayload,
      );
    }

    setShowForm(false);
    setEditingAssignment(null);

    await fetchAssignments({
      page: 1,
      limit: pagination.limit || 20,
    });
  };

  // ==========================================
  // DELETE REQUEST
  // ==========================================

  const handleDeleteRequest = (
    assignment: Assignment,
  ) => {
    clearError();

    setDeletingAssignment(assignment);
  };

  // ==========================================
  // DELETE CONFIRM
  // ==========================================

  const handleDeleteConfirm =
    async (): Promise<void> => {
      if (!deletingAssignment) {
        return;
      }

      await removeAssignment(
        deletingAssignment._id,
      );

      setDeletingAssignment(null);

      await fetchAssignments({
        page: pagination.page || 1,
        limit: pagination.limit || 20,
      });
    };

  // ==========================================
  // FETCH
  // ==========================================

  const handleFetchAssignments = async (
    filters?: AssignmentFilters,
  ): Promise<void> => {
    await fetchAssignments(filters);
  };

  // ==========================================
  // FORM VIEW
  // ==========================================

  if (showForm) {
    return (
      <main className="min-h-screen bg-[#F8F7F3] px-4 py-5 pb-24">
        {/* Form Header */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCloseForm}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            aria-label="Back to assignments"
          >
            ←
          </button>

          <div>
            <h1 className="text-xl font-semibold text-[#1F1F1F]">
              {editingAssignment
                ? "Edit Assignment"
                : "New Assignment"}
            </h1>

            <p className="mt-0.5 text-xs text-gray-500">
              {editingAssignment
                ? "Update assignment details"
                : "Create a new staff assignment"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <AssignmentForm
            assignment={editingAssignment}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            loading={loading}
          />
        </div>
      </main>
    );
  }

  // ==========================================
  // LIST VIEW
  // ==========================================

  return (
    <>
      <main className="min-h-screen bg-[#F8F7F3] px-4 py-5 pb-24">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-[#1F1F1F]">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage staff assignments
          </p>
        </div>

        {/* Global Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs leading-5 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={clearError}
                className="shrink-0 text-xs font-semibold text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Assignment List */}
        <AssignmentList
          assignments={assignments}
          pagination={pagination}
          loading={loading}
          error={error}
          onFetchAssignments={
            handleFetchAssignments
          }
          onClearError={clearError}
          onAddAssignment={
            handleAddAssignment
          }
          onEditAssignment={
            handleEditAssignment
          }
          onDeleteAssignment={
            handleDeleteRequest
          }
        />
      </main>

      {/* Delete Modal */}
      <DeleteAssignmentModal
        isOpen={
          deletingAssignment !== null
        }
        assignment={deletingAssignment}
        loading={loading}
        onClose={() =>
          setDeletingAssignment(null)
        }
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
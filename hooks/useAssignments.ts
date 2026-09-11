"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "@/lib/assignment.api";

import type {
  Assignment,
  AssignmentFilters,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "@/types/assignment";

type UseAssignmentsOptions = {
  token: string | null;
  filters?: AssignmentFilters;
  autoFetch?: boolean;
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useAssignments = ({
  token,
  filters,
  autoFetch = true,
}: UseAssignmentsOptions) => {
  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [pagination, setPagination] = useState(
    DEFAULT_PAGINATION,
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // GET ASSIGNMENTS
  // ==========================================

  const fetchAssignments = useCallback(
    async (
      customFilters?: AssignmentFilters,
    ) => {
      if (!token) {
        setError("Authentication required");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result =
          await getAssignments(
            token,
            customFilters ?? filters,
          );

        setAssignments(result.data);

        setPagination(result.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch assignments",
        );
      } finally {
        setLoading(false);
      }
    },
    [token, filters],
  );

  // ==========================================
  // GET ASSIGNMENT BY ID
  // ==========================================

  const fetchAssignmentById =
    useCallback(
      async (id: string) => {
        if (!token) {
          throw new Error(
            "Authentication required",
          );
        }

        try {
          setLoading(true);
          setError(null);

          const assignment =
            await getAssignmentById(
              id,
              token,
            );

          setSelectedAssignment(
            assignment,
          );

          return assignment;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch assignment";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [token],
    );

  // ==========================================
  // CREATE ASSIGNMENT
  // ==========================================

  const addAssignment = useCallback(
    async (
      payload: CreateAssignmentPayload,
    ) => {
      if (!token) {
        throw new Error(
          "Authentication required",
        );
      }

      try {
        setLoading(true);
        setError(null);

        const assignment =
          await createAssignment(
            payload,
            token,
          );

        setAssignments((current) => [
          assignment,
          ...current,
        ]);

        return assignment;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create assignment";

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // ==========================================
  // UPDATE ASSIGNMENT
  // ==========================================

  const editAssignment = useCallback(
    async (
      id: string,
      payload: UpdateAssignmentPayload,
    ) => {
      if (!token) {
        throw new Error(
          "Authentication required",
        );
      }

      try {
        setLoading(true);
        setError(null);

        const updated =
          await updateAssignment(
            id,
            payload,
            token,
          );

        setAssignments((current) =>
          current.map((item) =>
            item._id === id
              ? updated
              : item,
          ),
        );

        setSelectedAssignment(
          (current) =>
            current?._id === id
              ? updated
              : current,
        );

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update assignment";

        setError(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // ==========================================
  // DELETE ASSIGNMENT
  // ==========================================

  const removeAssignment =
    useCallback(
      async (id: string) => {
        if (!token) {
          throw new Error(
            "Authentication required",
          );
        }

        try {
          setLoading(true);
          setError(null);

          await deleteAssignment(
            id,
            token,
          );

          setAssignments((current) =>
            current.filter(
              (item) => item._id !== id,
            ),
          );

          setSelectedAssignment(
            (current) =>
              current?._id === id
                ? null
                : current,
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to delete assignment";

          setError(message);

          throw err;
        } finally {
          setLoading(false);
        }
      },
      [token],
    );

  // ==========================================
  // CLEAR ERROR
  // ==========================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==========================================
  // AUTO FETCH
  // ==========================================

  useEffect(() => {
    if (autoFetch && token) {
      fetchAssignments();
    }
  }, [
    autoFetch,
    token,
    fetchAssignments,
  ]);

  return {
    assignments,
    selectedAssignment,
    pagination,

    loading,
    error,

    fetchAssignments,
    fetchAssignmentById,

    addAssignment,
    editAssignment,
    removeAssignment,

    setSelectedAssignment,
    clearError,
  };
};
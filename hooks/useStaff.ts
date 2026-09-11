"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  updateStaffStatus,
  resetStaffPassword,
} from "@/lib/staff.api";

import type {
  Staff,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffFilters,
  ResetStaffPasswordResponse,
} from "@/types/staff";

type UseStaffOptions = {
  token: string | null;
  filters?: StaffFilters;
  autoFetch?: boolean;
};

export const useStaff = ({
  token,
  filters,
  autoFetch = true,
}: UseStaffOptions) => {
  const [staff, setStaff] =
    useState<Staff[]>([]);

  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // GET STAFF
  // ==========================================

  const fetchStaff = useCallback(
    async (customFilters?: StaffFilters) => {
      if (!token) {
        setError("Authentication required");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getStaff(
          token,
          customFilters ?? filters,
        );

        setStaff(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch staff",
        );
      } finally {
        setLoading(false);
      }
    },
    [token, filters],
  );

  // ==========================================
  // GET STAFF BY ID
  // ==========================================

  const fetchStaffById = useCallback(
    async (id: string) => {
      if (!token) {
        throw new Error(
          "Authentication required",
        );
      }

      try {
        setLoading(true);
        setError(null);

        const result =
          await getStaffById(
            id,
            token,
          );

        setSelectedStaff(result);

        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch staff";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // ==========================================
  // CREATE STAFF
  // ==========================================

  const addStaff = useCallback(
    async (
      payload: CreateStaffPayload,
    ) => {
      if (!token) {
        throw new Error(
          "Authentication required",
        );
      }

      try {
        setLoading(true);
        setError(null);

        const newStaff =
          await createStaff(
            payload,
            token,
          );

        setStaff((current) => [
          newStaff,
          ...current,
        ]);

        return newStaff;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create staff";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // ==========================================
  // UPDATE STAFF
  // ==========================================

  const editStaff = useCallback(
    async (
      id: string,
      payload: UpdateStaffPayload,
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
          await updateStaff(
            id,
            payload,
            token,
          );

        setStaff((current) =>
          current.map((item) =>
            item.id === id
              ? updated
              : item,
          ),
        );

        setSelectedStaff((current) =>
          current?.id === id
            ? updated
            : current,
        );

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update staff";

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const changeStaffStatus =
    useCallback(
      async (
        id: string,
        isActive: boolean,
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
            await updateStaffStatus(
              id,
              isActive,
              token,
            );

          setStaff((current) =>
            current.map((item) =>
              item.id === id
                ? updated
                : item,
            ),
          );

          setSelectedStaff(
            (current) =>
              current?.id === id
                ? updated
                : current,
          );

          return updated;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to update staff status";

          setError(message);
          throw err;
        } finally {
          setLoading(false);
        }
      },
      [token],
    );

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const changeStaffPassword =
    useCallback(
      async (
        id: string,
        newPassword: string,
      ): Promise<ResetStaffPasswordResponse> => {
        if (!token) {
          throw new Error(
            "Authentication required",
          );
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await resetStaffPassword(
              id,
              newPassword,
              token,
            );

          return result;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to reset password";

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
      fetchStaff();
    }
  }, [
    autoFetch,
    token,
    fetchStaff,
  ]);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    staff,
    selectedStaff,
    pagination,

    loading,
    error,

    fetchStaff,
    fetchStaffById,

    addStaff,
    editStaff,

    changeStaffStatus,
    changeStaffPassword,

    setSelectedStaff,

    clearError,
  };
};
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  setAvailability,
  getAvailability,
  getAvailabilityById,
  deleteAvailability,
} from "@/lib/availability.api";

import type {
  Availability,
  SetAvailabilityPayload,
  AvailabilityFilters,
} from "@/types/availability";

type UseAvailabilityOptions = {
  token: string | null;
  filters?: AvailabilityFilters;
  autoFetch?: boolean;
};

export const useAvailability = ({
  token,
  filters,
  autoFetch = true,
}: UseAvailabilityOptions) => {
  const [availability, setAvailabilityList] =
    useState<Availability[]>([]);

  const [
    selectedAvailability,
    setSelectedAvailability,
  ] = useState<Availability | null>(
    null,
  );

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================
  // GET AVAILABILITY
  // ==========================================

  const fetchAvailability =
    useCallback(
      async (
        customFilters?: AvailabilityFilters,
      ) => {
        if (!token) {
          setError(
            "Authentication required",
          );
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await getAvailability(
              token,
              customFilters ?? filters,
            );

          setAvailabilityList(
            result.data,
          );

          setPagination(
            result.pagination,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch availability",
          );
        } finally {
          setLoading(false);
        }
      },
      [token, filters],
    );

  // ==========================================
  // GET AVAILABILITY BY ID
  // ==========================================

  const fetchAvailabilityById =
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

          const result =
            await getAvailabilityById(
              id,
              token,
            );

          setSelectedAvailability(
            result,
          );

          return result;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to fetch availability";

          setError(message);
          throw err;
        } finally {
          setLoading(false);
        }
      },
      [token],
    );

  // ==========================================
  // SET AVAILABILITY
  // CREATE OR UPDATE
  // ==========================================

  const saveAvailability =
    useCallback(
      async (
        payload: SetAvailabilityPayload,
      ) => {
        if (!token) {
          throw new Error(
            "Authentication required",
          );
        }

        try {
          setLoading(true);
          setError(null);

          const saved =
            await setAvailability(
              payload,
              token,
            );

          setAvailabilityList(
            (current) => {
              const exists =
                current.some(
                  (item) =>
                    item._id === saved._id,
                );

              if (exists) {
                return current.map(
                  (item) =>
                    item._id === saved._id
                      ? saved
                      : item,
                );
              }

              return [saved, ...current];
            },
          );

          setSelectedAvailability(
            saved,
          );

          return saved;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to save availability";

          setError(message);
          throw err;
        } finally {
          setLoading(false);
        }
      },
      [token],
    );

  // ==========================================
  // DELETE AVAILABILITY
  // ==========================================

  const removeAvailability =
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

          await deleteAvailability(
            id,
            token,
          );

          setAvailabilityList(
            (current) =>
              current.filter(
                (item) =>
                  item._id !== id,
              ),
          );

          setSelectedAvailability(
            (current) =>
              current?._id === id
                ? null
                : current,
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to delete availability";

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
      fetchAvailability();
    }
  }, [
    autoFetch,
    token,
    fetchAvailability,
  ]);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    availability,
    selectedAvailability,
    pagination,

    loading,
    error,

    fetchAvailability,
    fetchAvailabilityById,

    saveAvailability,
    removeAvailability,

    setSelectedAvailability,

    clearError,
  };
};
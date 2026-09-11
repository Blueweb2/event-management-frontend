"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  checkIn,
  checkOut,
  getAttendance,
  markAbsent,
} from "@/lib/attendance.api";

import type {
  Attendance,
  CheckInPayload,
  CheckOutPayload,
  MarkAbsentPayload,
  AttendanceFilters,
} from "@/types/attendance";

type UseAttendanceOptions = {
  token: string | null;
  filters?: AttendanceFilters;
  autoFetch?: boolean;
};

export const useAttendance = ({
  token,
  filters,
  autoFetch = true,
}: UseAttendanceOptions) => {
  const [attendance, setAttendance] =
    useState<Attendance[]>([]);

  const [
    selectedAttendance,
    setSelectedAttendance,
  ] = useState<Attendance | null>(
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
  // GET ATTENDANCE
  // ==========================================

  const fetchAttendance =
    useCallback(
      async (
        customFilters?: AttendanceFilters,
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
            await getAttendance(
              token,
              customFilters ?? filters,
            );

          setAttendance(result.data);

          setPagination(
            result.pagination,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch attendance",
          );
        } finally {
          setLoading(false);
        }
      },
      [token, filters],
    );

  // ==========================================
  // CHECK IN
  // ==========================================

  const staffCheckIn =
    useCallback(
      async (
        payload: CheckInPayload,
      ) => {
        if (!token) {
          throw new Error(
            "Authentication required",
          );
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await checkIn(
              payload,
              token,
            );

          setAttendance((current) => {
            const exists =
              current.some(
                (item) =>
                  item._id === result._id,
              );

            if (exists) {
              return current.map(
                (item) =>
                  item._id === result._id
                    ? result
                    : item,
              );
            }

            return [result, ...current];
          });

          setSelectedAttendance(
            result,
          );

          return result;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to check in staff";

          setError(message);
          throw err;
        } finally {
          setLoading(false);
        }
      },
      [token],
    );

  // ==========================================
  // CHECK OUT
  // ==========================================

  const staffCheckOut =
    useCallback(
      async (
        payload: CheckOutPayload,
      ) => {
        if (!token) {
          throw new Error(
            "Authentication required",
          );
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await checkOut(
              payload,
              token,
            );

          setAttendance((current) =>
            current.map((item) =>
              item._id === result._id
                ? result
                : item,
            ),
          );

          setSelectedAttendance(
            result,
          );

          return result;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to check out staff";

          setError(message);
          throw err;
        } finally {
          setLoading(false);
        }
      },
      [token],
    );

  // ==========================================
  // MARK ABSENT
  // ==========================================

  const staffMarkAbsent =
    useCallback(
      async (
        payload: MarkAbsentPayload,
      ) => {
        if (!token) {
          throw new Error(
            "Authentication required",
          );
        }

        try {
          setLoading(true);
          setError(null);

          const result =
            await markAbsent(
              payload,
              token,
            );

          setAttendance((current) => {
            const exists =
              current.some(
                (item) =>
                  item._id === result._id,
              );

            if (exists) {
              return current.map(
                (item) =>
                  item._id === result._id
                    ? result
                    : item,
              );
            }

            return [result, ...current];
          });

          setSelectedAttendance(
            result,
          );

          return result;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to mark staff absent";

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
      fetchAttendance();
    }
  }, [
    autoFetch,
    token,
    fetchAttendance,
  ]);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    attendance,
    selectedAttendance,
    pagination,

    loading,
    error,

    fetchAttendance,

    staffCheckIn,
    staffCheckOut,
    staffMarkAbsent,

    setSelectedAttendance,

    clearError,
  };
};
import {
  get,
  post,
  ApiResponse,
} from "./api";

import type {
  Attendance,
  AttendanceStatus,
  CheckInPayload,
  CheckOutPayload,
  MarkAbsentPayload,
  AttendanceFilters,
  AttendanceListResponse,
} from "@/types/attendance";

// ==========================================
// CHECK IN
// POST /api/attendance/check-in
// ==========================================

export const checkIn = async (
  payload: CheckInPayload,
  token: string,
): Promise<Attendance> => {
  if (!payload.duty) {
    throw new Error(
      "Duty is required",
    );
  }

  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >(
    "/attendance/check-in",
    payload,
    token,
  );

  return result.data.attendance;
};

// ==========================================
// CHECK OUT
// POST /api/attendance/check-out
// ==========================================

export const checkOut = async (
  payload: CheckOutPayload,
  token: string,
): Promise<Attendance> => {
  if (!payload.duty) {
    throw new Error(
      "Duty is required",
    );
  }

  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >(
    "/attendance/check-out",
    payload,
    token,
  );

  return result.data.attendance;
};

// ==========================================
// GET ATTENDANCE
// GET /api/attendance
// ==========================================

export const getAttendance = async (
  token: string,
  params?: AttendanceFilters,
): Promise<AttendanceListResponse> => {
  const searchParams =
    new URLSearchParams();

  if (params?.staff) {
    searchParams.set(
      "staff",
      params.staff,
    );
  }

  if (params?.event) {
    searchParams.set(
      "event",
      params.event,
    );
  }

  if (params?.duty) {
    searchParams.set(
      "duty",
      params.duty,
    );
  }

  if (params?.date) {
    searchParams.set(
      "date",
      params.date,
    );
  }

  if (params?.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params?.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params?.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  const query =
    searchParams.toString();

  const endpoint = query
    ? `/attendance?${query}`
    : "/attendance";

  return get<AttendanceListResponse>(
    endpoint,
    token,
  );
};

// ==========================================
// MARK ABSENT
// POST /api/attendance/absent
// ==========================================

export const markAbsent = async (
  payload: MarkAbsentPayload,
  token: string,
): Promise<Attendance> => {
  if (!payload.duty) {
    throw new Error(
      "Duty is required",
    );
  }

  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >(
    "/attendance/absent",
    payload,
    token,
  );

  return result.data.attendance;
};
import {
  get,
  post,
  patch,
  del,
  ApiResponse,
} from "./api";

import type {
  Attendance,
  CheckInPayload,
  CheckOutPayload,
  MarkAbsentPayload,
  AttendanceFilters,
  AttendanceListResponse,
  UpdateAttendancePayload,
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
// PAUSE SHIFT
// POST /api/attendance/pause
// ==========================================

export const pauseStaffShift = async (
  token: string,
  payload: { duty: string; reason?: string; notes?: string }
): Promise<Attendance> => {
  if (!payload.duty) {
    throw new Error("Duty is required");
  }

  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >("/attendance/pause", payload, token);

  return result.data.attendance;
};

export const getEventStaffAttendance = async (
  token: string,
  eventId: string
): Promise<any[]> => {
  const result = await get<ApiResponse<any[]>>(
    `/attendance/event/${eventId}`,
    token
  );
  return result.data || [];
};

// ==========================================
// RESUME SHIFT
// POST /api/attendance/resume
// ==========================================

export const resumeStaffShift = async (
  token: string,
  payload: { duty: string; notes?: string }
): Promise<Attendance> => {
  if (!payload.duty) {
    throw new Error("Duty is required");
  }

  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >("/attendance/resume", payload, token);

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

// ==========================================
// UPDATE ATTENDANCE (MANUAL CORRECTION)
// PATCH /api/attendance/:id
// ==========================================

export const updateAttendance = async (
  id: string,
  payload: UpdateAttendancePayload,
  token: string,
): Promise<Attendance> => {
  const result = await patch<
    ApiResponse<{
      attendance: Attendance;
    }>
  >(`/attendance/${id}`, payload, token);

  return result.data.attendance;
};

// ==========================================
// DELETE ATTENDANCE
// DELETE /api/attendance/:id
// ==========================================

export const deleteAttendance = async (
  id: string,
  token: string,
): Promise<{ success: boolean; message?: string }> => {
  return del<{ success: boolean; message?: string }>(`/attendance/${id}`, token);
};

export const checkInStaff = async (
  token: string,
  payload: CheckInPayload,
): Promise<Attendance> => checkIn(payload, token);

export const checkOutStaff = async (
  token: string,
  payload: CheckOutPayload,
): Promise<Attendance> => checkOut(payload, token);
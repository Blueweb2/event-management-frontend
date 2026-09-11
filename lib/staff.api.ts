import {
  get,
  post,
  put,
  patch,
  ApiResponse,
} from "./api";

import type {
  Staff,
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffListResponse,
  StaffStatusFilter,
  ResetStaffPasswordResponse,
} from "@/types/staff";

// ==========================================
// CREATE STAFF
// POST /api/users/staff
// ==========================================

export const createStaff = async (
  payload: CreateStaffPayload,
  token: string,
): Promise<Staff> => {
  const result = await post<
    ApiResponse<{ staff: Staff }>
  >(
    "/users/staff",
    payload,
    token,
  );

  return result.data.staff;
};

// ==========================================
// GET STAFF
// GET /api/users/staff
// ==========================================

export const getStaff = async (
  token: string,
  params?: {
    search?: string;
    status?: StaffStatusFilter;
    department?: string;
    page?: number;
    limit?: number;
  },
): Promise<StaffListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params?.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params?.department) {
    searchParams.set(
      "department",
      params.department,
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

  const query = searchParams.toString();

  const endpoint = query
    ? `/users/staff?${query}`
    : "/users/staff";

  return get<StaffListResponse>(
    endpoint,
    token,
  );
};

// ==========================================
// GET STAFF BY ID
// GET /api/users/staff/:id
// ==========================================

export const getStaffById = async (
  id: string,
  token: string,
): Promise<Staff> => {
  if (!id) {
    throw new Error(
      "Staff ID is required",
    );
  }

  const result = await get<
    ApiResponse<{ staff: Staff }>
  >(
    `/users/staff/${id}`,
    token,
  );

  return result.data.staff;
};

// ==========================================
// UPDATE STAFF
// PUT /api/users/staff/:id
// ==========================================

export const updateStaff = async (
  id: string,
  payload: UpdateStaffPayload,
  token: string,
): Promise<Staff> => {
  if (!id) {
    throw new Error(
      "Staff ID is required",
    );
  }

  const result = await put<
    ApiResponse<{ staff: Staff }>
  >(
    `/users/staff/${id}`,
    payload,
    token,
  );

  return result.data.staff;
};

// ==========================================
// UPDATE STAFF STATUS
// PATCH /api/users/staff/:id/status
// ==========================================

export const updateStaffStatus = async (
  id: string,
  isActive: boolean,
  token: string,
): Promise<Staff> => {
  if (!id) {
    throw new Error(
      "Staff ID is required",
    );
  }

  const result = await patch<
    ApiResponse<{ staff: Staff }>
  >(
    `/users/staff/${id}/status`,
    { isActive },
    token,
  );

  return result.data.staff;
};

// ==========================================
// RESET STAFF PASSWORD
// PATCH /api/users/staff/:id/password
// ==========================================

export const resetStaffPassword = async (
  id: string,
  newPassword: string,
  token: string,
): Promise<ResetStaffPasswordResponse> => {
  if (!id) {
    throw new Error(
      "Staff ID is required",
    );
  }

  if (!newPassword) {
    throw new Error(
      "New password is required",
    );
  }

  const result = await patch<
    ApiResponse<ResetStaffPasswordResponse>
  >(
    `/users/staff/${id}/password`,
    { newPassword },
    token,
  );

  return result.data;
};
import {
  get,
  post,
  put,
  del,
  type ApiResponse,
} from "./api";

import type {
  Assignment,
  AssignmentStatus,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  AssignmentListResponse,
} from "@/types/assignment";

// ==========================================
// FILTER PARAMETERS
// ==========================================

export type GetAssignmentsParams = {
  event?: string;

  staff?: string;

  status?: AssignmentStatus;

  dutyDate?: string;

  startDate?: string;

  endDate?: string;

  page?: number;

  limit?: number;
};

// ==========================================
// CREATE ASSIGNMENT
// POST /api/assignments
// ==========================================

export const createAssignment = async (
  payload: CreateAssignmentPayload,
  token: string,
): Promise<Assignment> => {
  const result =
    await post<
      ApiResponse<{
        assignment: Assignment;
      }>
    >(
      "/assignments",
      payload,
      token,
    );

  return result.data.assignment;
};

// ==========================================
// GET ASSIGNMENTS
// GET /api/assignments
// ==========================================

export const getAssignments = async (
  token: string,
  params?: GetAssignmentsParams,
): Promise<AssignmentListResponse> => {
  const searchParams =
    new URLSearchParams();

  if (params?.event) {
    searchParams.set(
      "event",
      params.event,
    );
  }

  if (params?.staff) {
    searchParams.set(
      "staff",
      params.staff,
    );
  }

  if (params?.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params?.dutyDate) {
    searchParams.set(
      "dutyDate",
      params.dutyDate,
    );
  }

  if (params?.startDate) {
    searchParams.set(
      "startDate",
      params.startDate,
    );
  }

  if (params?.endDate) {
    searchParams.set(
      "endDate",
      params.endDate,
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
    ? `/assignments?${query}`
    : "/assignments";

  return get<AssignmentListResponse>(
    endpoint,
    token,
  );
};

// ==========================================
// GET ASSIGNMENT BY ID
// GET /api/assignments/:id
// ==========================================

export const getAssignmentById =
  async (
    id: string,
    token: string,
  ): Promise<Assignment> => {
    if (!id) {
      throw new Error(
        "Assignment ID is required",
      );
    }

    const result =
      await get<
        ApiResponse<{
          assignment: Assignment;
        }>
      >(
        `/assignments/${id}`,
        token,
      );

    return result.data.assignment;
  };

// ==========================================
// UPDATE ASSIGNMENT
// PUT /api/assignments/:id
// ==========================================

export const updateAssignment =
  async (
    id: string,
    payload: UpdateAssignmentPayload,
    token: string,
  ): Promise<Assignment> => {
    if (!id) {
      throw new Error(
        "Assignment ID is required",
      );
    }

    const result =
      await put<
        ApiResponse<{
          assignment: Assignment;
        }>
      >(
        `/assignments/${id}`,
        payload,
        token,
      );

    return result.data.assignment;
  };

// ==========================================
// DELETE ASSIGNMENT
// DELETE /api/assignments/:id
// ==========================================

export const deleteAssignment =
  async (
    id: string,
    token: string,
  ): Promise<void> => {
    if (!id) {
      throw new Error(
        "Assignment ID is required",
      );
    }

    await del<ApiResponse<unknown>>(
      `/assignments/${id}`,
      token,
    );
  };
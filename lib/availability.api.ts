import {
  get,
  post,
  del,
  ApiResponse,
} from "./api";

import type {
  Availability,
  SetAvailabilityPayload,
  AvailabilityFilters,
  AvailabilityListResponse,
  DeleteAvailabilityResponse,
} from "@/types/availability";

// ==========================================
// SET AVAILABILITY
// POST /api/availability
//
// Creates a new record OR updates the existing
// record for the same staff member and date.
// ==========================================

export const setAvailability = async (
  payload: SetAvailabilityPayload,
  token: string,
): Promise<Availability> => {
  const result = await post<
    ApiResponse<{
      availability: Availability;
    }>
  >(
    "/availability",
    payload,
    token,
  );

  return result.data.availability;
};

// ==========================================
// GET AVAILABILITY
// GET /api/availability
// ==========================================

export const getAvailability = async (
  token: string,
  params?: AvailabilityFilters,
): Promise<AvailabilityListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.staff) {
    searchParams.set(
      "staff",
      params.staff,
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
    ? `/availability?${query}`
    : "/availability";

  return get<AvailabilityListResponse>(
    endpoint,
    token,
  );
};

// ==========================================
// GET AVAILABILITY BY ID
// GET /api/availability/:id
// ==========================================

export const getAvailabilityById =
  async (
    id: string,
    token: string,
  ): Promise<Availability> => {
    if (!id) {
      throw new Error(
        "Availability ID is required",
      );
    }

    const result = await get<
      ApiResponse<{
        availability: Availability;
      }>
    >(
      `/availability/${id}`,
      token,
    );

    return result.data.availability;
  };

// ==========================================
// DELETE AVAILABILITY
// DELETE /api/availability/:id
// ==========================================

export const deleteAvailability =
  async (
    id: string,
    token: string,
  ): Promise<DeleteAvailabilityResponse> => {
    if (!id) {
      throw new Error(
        "Availability ID is required",
      );
    }

    return del<DeleteAvailabilityResponse>(
      `/availability/${id}`,
      token,
    );
  };
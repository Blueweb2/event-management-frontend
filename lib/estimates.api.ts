const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

import type { FoodMenuSelection } from "./food.api";
import { getAuthToken } from "@/lib/auth-storage";

// ==========================================
// Types
// ==========================================

export type EstimatePricingType =
  | "PER_GUEST"
  | "PER_UNIT"
  | "PER_HOUR"
  | "PER_DAY"
  | "PER_STAFF"
  | "PER_REEL";

export type EstimateStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type CreateEstimateService = {
  serviceId: string;
  optionId?: string | null;
  quantity?: number;
};

export type CreateEstimatePayload = {
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  location: string;
  description: string;

  client: {
    name: string;
    phone: string;
    email: string;
    message?: string;
    referralSource?: string;
  };

  services: CreateEstimateService[];
  foodMenu?: FoodMenuSelection | null;

  discountType?: "percentage" | "fixed";
  discountValue?: number;
  additionalCharges?: number;
  gstEnabled?: boolean;
};

export type EstimateItem = {
  _id: string;
  serviceId: string;
  optionId?: string | null;
  optionName?: string | null;

  serviceName: string;
  category: string;
  description: string;

  pricingType: EstimatePricingType;
  unitLabel: string;

  quantity: number;
  unitPrice: number;
  total: number;
};

export type Estimate = {
  _id: string;
  estimateNumber: string;

  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  location: string;
  description: string;

  client: {
    name: string;
    phone: string;
    email: string;
    message?: string;
    referralSource?: string;
  };

  items: EstimateItem[];
  foodMenu?: FoodMenuSelection | null;

  subtotal: number;

  discount: number;
  discountType: "percentage" | "fixed";
  discountValue: number;

  additionalCharges: number;

  gstEnabled?: boolean;
  gstRate: number;
  gstAmount: number;

  total: number;

  currency: string;

  status: EstimateStatus;

  createdBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;

  sentAt?: string | null;
  viewedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  expiresAt?: string | null;

  convertedToEvent?: boolean;
  convertedEventId?: string | null;
  convertedBookingId?: string | null;

  createdAt: string;
  updatedAt: string;
};

// ==========================================
// API Response Types
// ==========================================

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type EstimatesResponse = {
  success: boolean;
  data: Estimate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ==========================================
// API ERROR
// ==========================================

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ==========================================
// API REQUEST HELPER
// ==========================================

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  let activeToken: string | undefined = token;
  if (!activeToken && typeof window !== "undefined") {
    activeToken = getAuthToken();
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        ...(options.headers || {}),
      },

      credentials: "include",

      cache:
        options.cache || "no-store",
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        "Invalid response from server",
        response.status
      );
    }

    return undefined as T;
  }

  if (!response.ok) {
    throw new ApiError(
      result?.message ||
        result?.error ||
        "Something went wrong",
      response.status,
      result
    );
  }

  return result as T;
}

// ==========================================
// GET
// ==========================================

export const get = <T>(
  endpoint: string,
  token?: string
): Promise<T> => {
  return api<T>(endpoint, {
    method: "GET",
  }, token);
};

// ==========================================
// POST
// ==========================================

export const post = <T>(
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<T> => {
  return api<T>(endpoint, {
    method: "POST",
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  }, token);
};

// ==========================================
// PUT
// ==========================================

export const put = <T>(
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<T> => {
  return api<T>(endpoint, {
    method: "PUT",
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  }, token);
};

// ==========================================
// PATCH
// ==========================================

export const patch = <T>(
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<T> => {
  return api<T>(endpoint, {
    method: "PATCH",
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  }, token);
};

// ==========================================
// DELETE
// ==========================================

export const del = <T>(
  endpoint: string
): Promise<T> => {
  return api<T>(endpoint, {
    method: "DELETE",
  });
};

// ==========================================
// CREATE ESTIMATE
// POST /api/estimates
// ==========================================

export const createEstimate = async (
  payload: CreateEstimatePayload
): Promise<Estimate> => {
  const result =
    await post<ApiResponse<Estimate>>(
      "/estimates",
      payload
    );

  return result.data;
};

// ==========================================
// GET ALL ESTIMATES
// GET /api/estimates
// ==========================================

export const getEstimates = async (
  params?: {
    status?: EstimateStatus;
    page?: number;
    limit?: number;
  },
  token?: string
): Promise<EstimatesResponse> => {
  const searchParams =
    new URLSearchParams();

  if (params?.status) {
    searchParams.set(
      "status",
      params.status
    );
  }

  if (params?.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page)
    );
  }

  if (params?.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit)
    );
  }

  const query =
    searchParams.toString();

  return get<EstimatesResponse>(
    `/estimates${
      query ? `?${query}` : ""
    }`,
    token
  );
};

// ==========================================
// GET SINGLE ESTIMATE
// GET /api/estimates/:id
// ==========================================

export const getEstimateById = async (
  id: string,
  token?: string
): Promise<Estimate> => {
  if (!id) {
    throw new Error(
      "Estimate ID is required"
    );
  }

  const result =
    await get<ApiResponse<Estimate>>(
      `/estimates/${id}`,
      token
    );

  return result.data;
};

// ==========================================
// UPDATE ESTIMATE STATUS
// PATCH /api/estimates/:id/status
// ==========================================

export const updateEstimateStatus =
  async (
    id: string,
    status: EstimateStatus,
    token?: string
  ): Promise<Estimate> => {
    if (!id) {
      throw new Error(
        "Estimate ID is required"
      );
    }

    const result =
      await patch<ApiResponse<Estimate>>(
        `/estimates/${id}/status`,
        {
          status,
        },
        token
      );

    return result.data;
  };

// ==========================================
// UPDATE ESTIMATE
// PUT /api/estimates/:id
// ==========================================

export const updateEstimate = async (
  id: string,
  payload: Partial<CreateEstimatePayload>,
  token?: string
): Promise<Estimate> => {
  if (!id) {
    throw new Error(
      "Estimate ID is required"
    );
  }

  const result = await put<ApiResponse<Estimate>>(
    `/estimates/${id}`,
    payload,
    token
  );

  return result.data;
};

// ==========================================
// CONVERT ESTIMATE TO BOOKING + EVENT
// POST /api/estimates/:id/convert
// ==========================================

export type ConvertEstimateData = {
  booking: {
    _id: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    eventTime: string;
    guests: number;
    location: string;
    total: number;
    currency: string;
    status: string;
  };
  event: {
    _id: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    status: string;
  };
};

export const convertEstimateToBooking = async (
  id: string,
  token?: string
): Promise<ConvertEstimateData> => {
  if (!id) {
    throw new Error("Estimate ID is required");
  }

  const result = await post<ApiResponse<ConvertEstimateData>>(
    `/estimates/${id}/convert`,
    undefined,
    token
  );

  return result.data;
};
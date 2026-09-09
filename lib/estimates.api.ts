const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

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
  };

  services: CreateEstimateService[];

  discountType?: "percentage" | "fixed";
  discountValue?: number;
  additionalCharges?: number;
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
  };

  items: EstimateItem[];

  subtotal: number;

  discount: number;
  discountType: "percentage" | "fixed";
  discountValue: number;

  additionalCharges: number;

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

  createdAt: string;
  updatedAt: string;
};

// ==========================================
// API Response Types
// ==========================================

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type EstimatesResponse = {
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
// Helper
// ==========================================

const handleResponse = async <T>(
  response: Response
): Promise<T> => {
  let result: any;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server"
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Something went wrong"
    );
  }

  return result;
};

// ==========================================
// CREATE ESTIMATE
// POST /api/estimates
// ==========================================

export const createEstimate = async (
  payload: CreateEstimatePayload
): Promise<Estimate> => {
  const response = await fetch(
    `${API_URL}/estimates`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify(payload),
    }
  );

  const result =
    await handleResponse<
      ApiResponse<Estimate>
    >(response);

  return result.data;
};

// ==========================================
// GET ALL ESTIMATES
// GET /api/estimates
// ==========================================

export const getEstimates = async (params?: {
  status?: EstimateStatus;
  page?: number;
  limit?: number;
}): Promise<EstimatesResponse> => {
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

  const response = await fetch(
    `${API_URL}/estimates${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",

      credentials: "include",

      cache: "no-store",
    }
  );

  return handleResponse<EstimatesResponse>(
    response
  );
};

// ==========================================
// GET SINGLE ESTIMATE
// GET /api/estimates/:id
// ==========================================

export const getEstimateById = async (
  id: string
): Promise<Estimate> => {
  if (!id) {
    throw new Error(
      "Estimate ID is required"
    );
  }

  const response = await fetch(
    `${API_URL}/estimates/${id}`,
    {
      method: "GET",

      credentials: "include",

      cache: "no-store",
    }
  );

  const result =
    await handleResponse<
      ApiResponse<Estimate>
    >(response);

  return result.data;
};

// ==========================================
// UPDATE ESTIMATE STATUS
// PATCH /api/estimates/:id/status
// ==========================================

export const updateEstimateStatus =
  async (
    id: string,
    status: EstimateStatus
  ): Promise<Estimate> => {
    if (!id) {
      throw new Error(
        "Estimate ID is required"
      );
    }

    const response = await fetch(
      `${API_URL}/estimates/${id}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          status,
        }),
      }
    );

    const result =
      await handleResponse<
        ApiResponse<Estimate>
      >(response);

    return result.data;
  };
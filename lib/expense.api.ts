import { API_URL, del, get, patch, post, put, type ApiResponse } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-storage";
import type { Expense, ExpenseCategory, ExpenseCreator, ExpenseStatus, PaymentMethod } from "@/components/manager/expenses/constants";

export type ExpensePayload = Omit<Expense, "id"> & {
  receipt?: File | null;
  removeReceipt?: boolean;
};

type ExpenseResponse = ApiResponse<Expense & { _id?: string }>;
type ExpensesResponse = ApiResponse<Array<Expense & { _id?: string }>>;
type CreatorsResponse = ApiResponse<ExpenseCreator[]>;

const normalizeExpense = (expense: Expense & { _id?: string }): Expense => {
  const createdByObj =
    expense.createdBy && typeof expense.createdBy === "object"
      ? (expense.createdBy as ExpenseCreator)
      : null;
  const createdByName =
    expense.createdByName ||
    createdByObj?.name ||
    createdByObj?.username ||
    (typeof expense.createdBy === "string" ? expense.createdBy : "");

  return {
    ...expense,
    id: expense.id || expense._id || "",
    category: expense.category || "Miscellaneous",
    vendorName: expense.vendorName || "",
    hasReceipt: Boolean(expense.hasReceipt ?? expense.receiptPath),
    createdByName,
  };
};

export async function getExpenses(
  filters: {
    search?: string;
    category?: string;
    paymentMethod?: PaymentMethod | "All";
    status?: ExpenseStatus | "All";
    eventId?: string;
    createdBy?: string;
    startDate?: string;
    endDate?: string;
  } = {},
  token?: string
): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category && filters.category !== "All") params.set("category", filters.category);
  if (filters.paymentMethod && filters.paymentMethod !== "All") params.set("paymentMethod", filters.paymentMethod);
  if (filters.status && filters.status !== "All") params.set("status", filters.status);
  if (filters.eventId) params.set("eventId", filters.eventId);
  if (filters.createdBy && filters.createdBy !== "All") params.set("createdBy", filters.createdBy);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);

  const query = params.toString();
  const result = await get<ExpensesResponse>(`/expenses${query ? `?${query}` : ""}`, token);
  return (result.data || []).map(normalizeExpense);
}

export async function getExpenseCreators(
  eventIdOrToken?: string,
  token?: string
): Promise<ExpenseCreator[]> {
  try {
    let eventId: string | undefined;
    let authToken = token;

    if (eventIdOrToken) {
      if (eventIdOrToken.startsWith("ey") || eventIdOrToken.length > 50) {
        authToken = eventIdOrToken;
      } else {
        eventId = eventIdOrToken;
      }
    }

    const query = eventId && eventId !== "All" ? `?eventId=${encodeURIComponent(eventId)}` : "";
    const result = await get<CreatorsResponse>(`/expenses/creators${query}`, authToken);
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch expense creators:", error);
    return [];
  }
}

export async function createExpense(
  payload: ExpensePayload | FormData,
  token?: string
): Promise<Expense> {
  if (payload instanceof FormData) {
    const activeToken = token || (typeof window !== "undefined" ? getAuthToken() : null);
    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      body: payload,
      headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : undefined,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || "Failed to create expense");
    }
    return normalizeExpense(result.data);
  }

  const result = await post<ExpenseResponse>("/expenses", payload, token);
  return normalizeExpense(result.data);
}

export async function updateExpense(
  id: string,
  payload: ExpensePayload | FormData,
  token?: string
): Promise<Expense> {
  if (payload instanceof FormData) {
    const activeToken = token || (typeof window !== "undefined" ? getAuthToken() : null);
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "PUT",
      body: payload,
      headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : undefined,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || "Failed to update expense");
    }
    return normalizeExpense(result.data);
  }

  const result = await put<ExpenseResponse>(`/expenses/${id}`, payload, token);
  return normalizeExpense(result.data);
}

export async function deleteExpense(id: string, token?: string): Promise<void> {
  await del(`/expenses/${id}`, token);
}

export async function toggleExpenseStatus(id: string, token?: string): Promise<Expense> {
  const result = await patch<ExpenseResponse>(`/expenses/${id}/status`, undefined, token);
  return normalizeExpense(result.data);
}

export function getExpenseReceiptUrl(id: string, token?: string): string {
  const activeToken = token || (typeof window !== "undefined" ? getAuthToken() : null);
  return `${API_URL}/expenses/${id}/receipt${activeToken ? `?token=${encodeURIComponent(activeToken)}` : ""}`;
}

export async function fetchExpenseReceiptBlob(
  id: string,
  token?: string
): Promise<{ blobUrl: string; mimeType: string; filename: string }> {
  const activeToken = token || (typeof window !== "undefined" ? getAuthToken() : null);
  const response = await fetch(`${API_URL}/expenses/${id}/receipt`, {
    headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : undefined,
  });

  if (!response.ok) {
    let msg = "Failed to load receipt file";
    try {
      const err = await response.json();
      if (err?.message) msg = err.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const mimeType = response.headers.get("content-type") || "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition") || "";
  let filename = "receipt";
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (match && match[1]) {
    filename = match[1];
  } else if (mimeType.includes("pdf")) {
    filename = "receipt.pdf";
  } else if (mimeType.includes("png")) {
    filename = "receipt.png";
  } else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    filename = "receipt.jpg";
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  return { blobUrl, mimeType, filename };
}

export interface EventProfitabilityData {
  event: {
    id: string;
    eventName: string;
    eventType: string;
    eventDate: string;
    eventTime: string;
    guests: number;
    location: string;
    status: string;
    client?: {
      name: string;
      phone: string;
      email: string;
    };
  };
  revenue: {
    total: number;
    cateringRevenue: number;
    servicesRevenue: number;
    servicesBreakdown: Array<{
      name: string;
      category: string;
      amount: number;
      quantity: number;
      pricingType: string;
    }>;
    currency: string;
  };
  expenses: {
    total: number;
    paid: number;
    pending: number;
    cateringExpenses: number;
    servicesExpenses: number;
    byCategory: Record<string, number>;
    distribution: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    count: number;
    list: Expense[];
  };
  staffPayroll?: {
    total: number;
    paid: number;
    pending: number;
    count: number;
    duties: Array<{
      id: string;
      staffName: string;
      role: string;
      department?: string;
      dutyDate?: string;
      startTime?: string;
      endTime?: string;
      hours: number;
      hourlyRate: number;
      amount: number;
      paymentStatus: string;
      status?: string;
    }>;
  };
  profitability: {
    netProfit: number;
    profitMargin: number;
    cateringProfit: number;
    cateringMargin: number;
    servicesProfit: number;
    servicesMargin: number;
    healthStatus: "HEALTHY" | "MODERATE" | "RISK";
  };
}

export async function getEventProfitability(
  eventId: string,
  token?: string
): Promise<EventProfitabilityData> {
  const result = await get<ApiResponse<EventProfitabilityData>>(
    `/expenses/event/${eventId}/profitability`,
    token
  );
  return result.data;
}

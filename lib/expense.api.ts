import { del, get, patch, post, put, type ApiResponse } from "@/lib/api";
import type { Expense, ExpenseCategory, ExpenseStatus, PaymentMethod } from "@/components/manager/expenses/constants";

export type ExpensePayload = Omit<Expense, "id">;

type ExpenseResponse = ApiResponse<Expense & { _id?: string }>;
type ExpensesResponse = ApiResponse<Array<Expense & { _id?: string }>>;

const normalizeExpense = (expense: Expense & { _id?: string }): Expense => ({
  ...expense,
  id: expense.id || expense._id || "",
});

export async function getExpenses(filters: {
  search?: string;
  category?: ExpenseCategory | "All";
  paymentMethod?: PaymentMethod | "All";
  status?: ExpenseStatus | "All";
  eventId?: string;
} = {}): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category && filters.category !== "All") params.set("category", filters.category);
  if (filters.paymentMethod && filters.paymentMethod !== "All") params.set("paymentMethod", filters.paymentMethod);
  if (filters.status && filters.status !== "All") params.set("status", filters.status);
  if (filters.eventId) params.set("eventId", filters.eventId);
  const query = params.toString();
  const result = await get<ExpensesResponse>(`/expenses${query ? `?${query}` : ""}`);
  return (result.data || []).map(normalizeExpense);
}

export async function createExpense(payload: ExpensePayload): Promise<Expense> {
  const result = await post<ExpenseResponse>("/expenses", payload);
  return normalizeExpense(result.data);
}

export async function updateExpense(id: string, payload: ExpensePayload): Promise<Expense> {
  const result = await put<ExpenseResponse>(`/expenses/${id}`, payload);
  return normalizeExpense(result.data);
}

export async function deleteExpense(id: string): Promise<void> {
  await del(`/expenses/${id}`);
}

export async function toggleExpenseStatus(id: string): Promise<Expense> {
  const result = await patch<ExpenseResponse>(`/expenses/${id}/status`);
  return normalizeExpense(result.data);
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

import { api, get, post, put, del, type ApiResponse } from "@/lib/api";
import type {
  StockItem,
  EventStockAllocation,
  StockMovement,
  StockTransaction,
  StaffStockSummary,
  ManagerStockSummary,
} from "@/types/stock";

// ==========================================
// Master Inventory APIs (Manager)
// ==========================================

export async function getStockItems(
  firstArg?: string | { search?: string; category?: string; lowStock?: boolean; page?: number; limit?: number },
  secondArg?: string | { search?: string; category?: string; lowStock?: boolean; page?: number; limit?: number }
): Promise<{ data: StockItem[]; pagination: { total: number; page: number; totalPages: number } }> {
  let token: string | undefined;
  let params: { search?: string; category?: string; lowStock?: boolean; page?: number; limit?: number } | undefined;

  if (typeof firstArg === "string") {
    token = firstArg;
    params = typeof secondArg === "object" ? secondArg : undefined;
  } else if (typeof firstArg === "object") {
    params = firstArg;
    token = typeof secondArg === "string" ? secondArg : undefined;
  } else if (typeof secondArg === "string") {
    token = secondArg;
  }

  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.lowStock !== undefined) query.set("lowStock", String(params.lowStock));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const endpoint = `/stock/items${query.toString() ? `?${query.toString()}` : ""}`;
  return api<{ data: StockItem[]; pagination: { total: number; page: number; totalPages: number } }>(
    endpoint,
    { method: "GET", token }
  );
}

export async function getStockItemById(
  id: string,
  token?: string
): Promise<{ data: StockItem; recentTransactions: StockTransaction[] }> {
  return get<{ data: StockItem; recentTransactions: StockTransaction[] }>(`/stock/items/${id}`, token);
}

export async function createStockItem(
  data: Partial<StockItem>,
  token?: string
): Promise<ApiResponse<StockItem>> {
  return post<ApiResponse<StockItem>>("/stock/items", data, token);
}

export async function updateStockItem(
  id: string,
  data: Partial<StockItem>,
  token?: string
): Promise<ApiResponse<StockItem>> {
  return put<ApiResponse<StockItem>>(`/stock/items/${id}`, data, token);
}

export async function addStock(
  id: string,
  payload: { quantity: number; notes?: string },
  token?: string
): Promise<ApiResponse<StockItem>> {
  return post<ApiResponse<StockItem>>(`/stock/items/${id}/add`, payload, token);
}

export async function adjustInventory(
  id: string,
  payload: {
    newTotal?: number;
    newAvailable?: number;
    damaged?: number;
    lost?: number;
    reason: string;
  },
  token?: string
): Promise<ApiResponse<StockItem>> {
  return post<ApiResponse<StockItem>>(`/stock/items/${id}/adjust`, payload, token);
}

export async function deleteStockItem(
  id: string,
  token?: string
): Promise<ApiResponse<{ success: boolean }>> {
  return del<ApiResponse<{ success: boolean }>>(`/stock/items/${id}`, token);
}

export async function getManagerStockSummary(
  token?: string
): Promise<ApiResponse<ManagerStockSummary>> {
  return get<ApiResponse<ManagerStockSummary>>("/stock/dashboard-summary", token);
}

export async function getStockTransactions(
  token?: string,
  params?: { stockItemId?: string; eventId?: string; type?: string; page?: number; limit?: number }
): Promise<{ data: StockTransaction[]; pagination: { total: number; page: number; totalPages: number } }> {
  const query = new URLSearchParams();
  if (params?.stockItemId) query.set("stockItemId", params.stockItemId);
  if (params?.eventId) query.set("eventId", params.eventId);
  if (params?.type) query.set("type", params.type);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const endpoint = `/stock/transactions${query.toString() ? `?${query.toString()}` : ""}`;
  return api<{ data: StockTransaction[]; pagination: { total: number; page: number; totalPages: number } }>(
    endpoint,
    { method: "GET", token }
  );
}

// ==========================================
// Event Stock Allocation APIs (Manager)
// ==========================================

export async function getEventStock(
  eventId: string,
  token?: string
): Promise<{ success?: boolean; data: EventStockAllocation[]; event?: any }> {
  return get<{ success?: boolean; data: EventStockAllocation[]; event?: any }>(`/stock/events/${eventId}`, token);
}

export async function addEventStockRequirement(
  eventId: string,
  payload: {
    stockItemId: string;
    requiredQuantity: number;
    autoReserve?: boolean;
    assignedStaff?: string;
    notes?: string;
  },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(`/stock/events/${eventId}/requirements`, payload, token);
}

export const addStockToEvent = addEventStockRequirement;

export async function reserveEventStock(
  eventId: string,
  itemIds?: string[],
  token?: string
): Promise<ApiResponse<any>> {
  // Re-fetch or trigger reserve on event stock requirements
  return post<ApiResponse<any>>(`/stock/events/${eventId}/requirements`, { autoReserve: true }, token);
}

export async function assignStaffToStock(
  eventStockId: string,
  payload: { staffId: string; expectedReturnAt?: string; notes?: string },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(`/stock/allocations/${eventStockId}/assign`, payload, token);
}

export async function removeEventStockRequirement(
  eventStockId: string,
  token?: string
): Promise<ApiResponse<{ success: boolean }>> {
  return del<ApiResponse<{ success: boolean }>>(`/stock/allocations/${eventStockId}`, token);
}

// ==========================================
// Staff Take & Return APIs (Staff)
// ==========================================

export async function getStaffAssignedStock(
  token?: string,
  params?: { staffId?: string }
): Promise<{ success?: boolean; data: EventStockAllocation[]; movements?: StockMovement[] }> {
  const query = new URLSearchParams();
  if (params?.staffId) query.set("staffId", params.staffId);
  const endpoint = `/stock/staff/my-stock${query.toString() ? `?${query.toString()}` : ""}`;
  return get<{ success?: boolean; data: EventStockAllocation[]; movements?: StockMovement[] }>(endpoint, token);
}

export const getMyAssignedStock = getStaffAssignedStock;

export async function getStaffStockSummary(
  token?: string,
  params?: { staffId?: string }
): Promise<ApiResponse<StaffStockSummary>> {
  const query = new URLSearchParams();
  if (params?.staffId) query.set("staffId", params.staffId);
  const endpoint = `/stock/staff/summary${query.toString() ? `?${query.toString()}` : ""}`;
  return get<ApiResponse<StaffStockSummary>>(endpoint, token);
}

export async function takeStock(
  eventStockId: string,
  payload: {
    takenQuantity: number;
    takeNotes?: string;
    expectedReturnAt?: string;
  },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(`/stock/allocations/${eventStockId}/take`, payload, token);
}

export async function takeEventStock(
  eventIdOrStockId: string,
  payload: {
    stockItemId?: string;
    takenQuantity: number;
    takeNotes?: string;
    expectedReturnAt?: string;
  },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(`/stock/allocations/${eventIdOrStockId}/take`, payload, token);
}

export async function returnStock(
  eventStockId: string,
  payload: {
    returnedQuantity: number;
    damagedQuantity?: number;
    lostQuantity?: number;
    returnNotes?: string;
    damagedReason?: string;
    lostReason?: string;
    returnedAt?: string;
  },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(`/stock/allocations/${eventStockId}/return`, payload, token);
}

export async function returnEventStock(
  eventIdOrStockId: string,
  payload: {
    stockItemId?: string;
    returnedQuantity: number;
    damagedQuantity?: number;
    lostQuantity?: number;
    returnNotes?: string;
    damagedReason?: string;
    lostReason?: string;
    returnedAt?: string;
  },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(`/stock/allocations/${eventIdOrStockId}/return`, payload, token);
}

// ==========================================
// Manager Verification & Discrepancy APIs
// ==========================================

export async function verifyStockReturn(
  eventStockId: string,
  payload?: {
    approvedReturnedQuantity?: number;
    approvedDamagedQuantity?: number;
    approvedLostQuantity?: number;
    managerNotes?: string;
    verificationNotes?: string;
  },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(
    `/stock/allocations/${eventStockId}/verify`,
    payload || {},
    token
  );
}

export async function reportDiscrepancy(
  eventStockId: string,
  payload: { discrepancyNotes?: string; notes?: string },
  token?: string
): Promise<ApiResponse<EventStockAllocation>> {
  return post<ApiResponse<EventStockAllocation>>(
    `/stock/allocations/${eventStockId}/discrepancy`,
    { discrepancyNotes: payload.discrepancyNotes || payload.notes },
    token
  );
}

export const reportStockDiscrepancy = reportDiscrepancy;

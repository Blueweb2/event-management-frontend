import {
  get,
  post,
  put,
  patch,
  del,
} from "@/lib/api";

// ==========================================
// Types
// ==========================================

export type ClientStatus =
  | "Active"
  | "Inactive";

export interface Client {
  _id: string;

  name: string;
  phone: string;
  email: string;

  alternatePhone?: string;

  address?: string;
  city?: string;
  state?: string;
  country?: string;

  notes?: string;

  status: ClientStatus;

  createdBy?:
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
      }
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Create Client
// ==========================================

export interface CreateClientPayload {
  name: string;
  phone: string;
  email: string;

  alternatePhone?: string;

  address?: string;
  city?: string;
  state?: string;
  country?: string;

  notes?: string;
}

export interface CreateClientResponse {
  success: boolean;
  message?: string;
  data: Client;
}

// ==========================================
// Update Client
// ==========================================

export type UpdateClientPayload =
  Partial<CreateClientPayload>;

export interface UpdateClientResponse {
  success: boolean;
  message?: string;
  data: Client;
}

// ==========================================
// Get Clients
// ==========================================

export interface GetClientsParams {
  search?: string;
  status?: ClientStatus | "";
  page?: number;
  limit?: number;
}

export interface GetClientsResponse {
  success: boolean;
  message?: string;

  data: Client[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// Get Client
// ==========================================

export interface GetClientResponse {
  success: boolean;
  message?: string;
  data: Client;
}

// ==========================================
// Create Client
// ==========================================

export function createClient(
  payload: CreateClientPayload,
  token?: string
): Promise<CreateClientResponse> {
  return post<CreateClientResponse>(
    "/clients",
    payload,
    token
  );
}

// ==========================================
// Get All Clients
// ==========================================

export function getClients(
  params: GetClientsParams = {},
  token?: string
): Promise<GetClientsResponse> {
  const searchParams =
    new URLSearchParams();

  if (params.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status
    );
  }

  if (params.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page)
    );
  }

  if (params.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit)
    );
  }

  const queryString =
    searchParams.toString();

  const endpoint = queryString
    ? `/clients?${queryString}`
    : "/clients";

  return get<GetClientsResponse>(
    endpoint,
    token
  );
}

// ==========================================
// Get Client By ID
// ==========================================

export function getClientById(
  clientId: string,
  token?: string
): Promise<GetClientResponse> {
  return get<GetClientResponse>(
    `/clients/${clientId}`,
    token
  );
}

// ==========================================
// Update Client
// ==========================================

export function updateClient(
  clientId: string,
  payload: UpdateClientPayload,
  token?: string
): Promise<UpdateClientResponse> {
  return put<UpdateClientResponse>(
    `/clients/${clientId}`,
    payload,
    token
  );
}

// ==========================================
// Deactivate Client
// ==========================================

export function deactivateClient(
  clientId: string,
  token?: string
): Promise<UpdateClientResponse> {
  return del<UpdateClientResponse>(
    `/clients/${clientId}`,
    token
  );
}

// ==========================================
// Activate Client
// ==========================================

export function activateClient(
  clientId: string,
  token?: string
): Promise<UpdateClientResponse> {
  return patch<UpdateClientResponse>(
    `/clients/${clientId}/activate`,
    undefined,
    token
  );
}

// ==========================================
// Client Details & Payment Breakdown Types
// ==========================================

export interface PaymentLog {
  _id?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "Cash" | "Bank Transfer" | "UPI / GPay" | "Credit/Debit Card" | "Cheque" | "Other";
  transactionId?: string;
  paymentType: "ADVANCE" | "INSTALLMENT" | "FINAL_BALANCE";
  notes?: string;
  createdAt?: string;
}

export interface ClientEventDetails {
  _id: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guests: number;
  location: string;
  status: string;
  advancePayment?: number;
  paidAmount?: number;
  paymentStatus?: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  paymentHistory?: PaymentLog[];
  booking?: {
    _id: string;
    total: number;
    subtotal: number;
    advancePayment?: number;
    paidAmount?: number;
    paymentStatus?: string;
  };
}

export interface ClientFinancialSummary {
  totalBookingsCount: number;
  totalEventsCount: number;
  totalContractValue: number;
  totalPaidAmount: number;
  totalAdvancePayment: number;
  totalBalanceDue: number;
  overallPaymentStatus: "UNPAID" | "PARTIAL" | "PAID";
}

export interface GetClientDetailsResponse {
  success: boolean;
  message?: string;
  data: {
    client: Client;
    events: ClientEventDetails[];
    bookings: any[];
    financialSummary: ClientFinancialSummary;
  };
}

export interface RecordPaymentPayload {
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentType: "ADVANCE" | "INSTALLMENT" | "FINAL_BALANCE";
  notes?: string;
  paymentDate?: string;
}

// ==========================================
// Get Full Client Details (Events & Payments)
// ==========================================

export function getClientDetails(
  clientId: string,
  token?: string
): Promise<GetClientDetailsResponse> {
  return get<GetClientDetailsResponse>(
    `/clients/${clientId}/details`,
    token
  );
}

// ==========================================
// Record Payment / Advance Deposit for Booking
// ==========================================

export function recordBookingPayment(
  bookingId: string,
  payload: RecordPaymentPayload,
  token?: string
): Promise<{ success: boolean; message: string; data: any }> {
  return post(
    `/bookings/${bookingId}/payments`,
    payload,
    token
  );
}
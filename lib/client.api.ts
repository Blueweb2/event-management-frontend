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
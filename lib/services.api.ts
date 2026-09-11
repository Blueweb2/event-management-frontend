import {
  Service,
  CreateServiceData,
  UpdateServiceData,
} from "@/types/service";

import {
  get,
  post,
  put,
  del,
  ApiResponse,
} from "./api";

// ==========================================
// GET ALL SERVICES
// GET /api/services
// ==========================================

export async function getServices(
  includeInactive = false,
): Promise<Service[]> {
  const endpoint = includeInactive
    ? "/services?all=true"
    : "/services";

  const result =
    await get<ApiResponse<Service[]>>(endpoint);

  return result.data;
}

// ==========================================
// CREATE SERVICE
// POST /api/services
// ==========================================

export async function createService(
  service: CreateServiceData,
): Promise<Service> {
  const result =
    await post<ApiResponse<Service>>(
      "/services",
      service,
    );

  return result.data;
}

// ==========================================
// UPDATE SERVICE
// PUT /api/services/:id
// ==========================================

export async function updateService(
  id: string,
  service: UpdateServiceData,
): Promise<Service> {
  if (!id) {
    throw new Error(
      "Service ID is required",
    );
  }

  const result =
    await put<ApiResponse<Service>>(
      `/services/${id}`,
      service,
    );

  return result.data;
}

// ==========================================
// DELETE / DEACTIVATE SERVICE
// DELETE /api/services/:id
// ==========================================

export async function deleteService(
  id: string,
): Promise<Service> {
  if (!id) {
    throw new Error(
      "Service ID is required",
    );
  }

  const result =
    await del<ApiResponse<Service>>(
      `/services/${id}`,
    );

  return result.data;
}
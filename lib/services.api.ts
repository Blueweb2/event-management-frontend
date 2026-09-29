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
import { getAuthToken } from "./auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==========================================
// UPLOAD SERVICE IMAGE
// POST /api/services/upload
// ==========================================

export async function uploadServiceImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/services/upload`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "Failed to upload service image");
  }

  return result.data.imageUrl;
}

export function getServiceImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http")) return imageUrl;
  const baseUrl = API_URL.replace(/\/api$/, "");
  return `${baseUrl}${imageUrl}`;
}

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

// ==========================================
// GET UPLOADED SERVICE LIBRARY IMAGES
// GET /api/services/library-images
// ==========================================

export async function getServiceLibraryImages(): Promise<
  Array<{ url: string; title: string; category: string; source: string }>
> {
  try {
    const result = await get<
      ApiResponse<Array<{ url: string; title: string; category: string; source: string }>>
    >("/services/library-images");
    return result.data || [];
  } catch {
    return [];
  }
}
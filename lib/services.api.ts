import {
  Service,
  CreateServiceData,
  UpdateServiceData,
} from "@/types/service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getServices(
  includeInactive = false,
): Promise<Service[]> {
  const url = includeInactive
    ? `${API_URL}/services?all=true`
    : `${API_URL}/services`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch services",
    );
  }

  return data.data;
}

export async function createService(
  service: CreateServiceData,
): Promise<Service> {
  const response = await fetch(
    `${API_URL}/services`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(service),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create service",
    );
  }

  return data.data;
}

export async function updateService(
  id: string,
  service: UpdateServiceData,
): Promise<Service> {
  const response = await fetch(
    `${API_URL}/services/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(service),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update service",
    );
  }

  return data.data;
}

export async function deleteService(
  id: string,
): Promise<Service> {
  const response = await fetch(
    `${API_URL}/services/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to deactivate service",
    );
  }

  return data.data;
}
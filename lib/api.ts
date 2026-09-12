const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type ApiOptions = RequestInit & {
  token?: string;
};

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  let activeToken = token;
  if (!activeToken && typeof window !== "undefined") {
    activeToken =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      undefined;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      ...headers,
    },
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

// GET
export function get<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  return api<T>(endpoint, {
    method: "GET",
    token,
  });
}

// POST
export function post<T>(
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<T> {
  return api<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    token,
  });
}

// PUT
export function put<T>(
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<T> {
  return api<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    token,
  });
}

// PATCH
export function patch<T>(
  endpoint: string,
  body?: unknown,
  token?: string
): Promise<T> {
  return api<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
    token,
  });
}

// DELETE
export function del<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  return api<T>(endpoint, {
    method: "DELETE",
    token,
  });
}
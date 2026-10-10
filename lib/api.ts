import { getAuthToken, clearAuth } from "@/lib/auth-storage";

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

// Concurrency lock to prevent duplicate redirects on simultaneous 401s
let isLoggingOut = false;

export function resetLogoutState(): void {
  isLoggingOut = false;
}

/**
 * Handles 401 Unauthorized responses cleanly:
 * - Wipes credentials and session state
 * - Avoids redirecting if already on login page or if error is from the login endpoint
 * - Ensures concurrent requests trigger only one redirect
 * - Sanitizes the redirect path to avoid leaking sensitive parameters
 */
function handleUnauthorized(endpoint: string): void {
  if (typeof window === "undefined") {
    return;
  }

  // Do not auto-logout on credentials failure from login route
  if (endpoint.includes("/auth/login")) {
    return;
  }

  // Clear credentials, cookies, and active socket connections
  clearAuth();

  const currentPathname = window.location.pathname;

  // Prevent redirect loops if already on login page
  if (currentPathname.startsWith("/login")) {
    return;
  }

  // Concurrency guard: only trigger redirect once
  if (isLoggingOut) {
    return;
  }
  isLoggingOut = true;

  // Build clean redirect path, removing sensitive query params
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete("token");
  searchParams.delete("auth");
  searchParams.delete("password");
  searchParams.delete("secret");
  searchParams.delete("code");

  const queryString = searchParams.toString();
  const safePath = queryString
    ? `${currentPathname}?${queryString}`
    : currentPathname;

  const encodedTarget = encodeURIComponent(safePath);
  window.location.assign(`/login?expired=1&redirect=${encodedTarget}`);
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  let activeToken = token;
  if (!activeToken && typeof window !== "undefined") {
    activeToken = getAuthToken();
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      ...headers,
    },
  });

  // Handle both JSON and non-JSON responses safely
  let data: any = null;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text ? { message: text } : null;
      }
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // Only 401 triggers auto-logout. 403 Forbidden, 400 validation, 500 etc. do NOT log out.
    if (response.status === 401) {
      handleUnauthorized(endpoint);
    }

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
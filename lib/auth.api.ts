// ==========================================
// AUTH API
// ==========================================

import {
  get,
  post,
  put,
  patch,
  ApiResponse,
} from "./api";

import type {
  AuthUser,
  RegisterPayload,
  LoginPayload,
  AuthResult,
  ManagerItem,
  CreateManagerPayload,
  UpdateManagerPayload,
  BootstrapSuperAdminPayload,
} from "@/types/auth";

// ==========================================
// REGISTER
// POST /api/auth/register
// ==========================================

export const register = async (
  payload: RegisterPayload,
): Promise<AuthResult> => {
  const result = await post<
    ApiResponse<AuthResult>
  >(
    "/auth/register",
    payload,
  );

  return result.data;
};

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

export const login = async (
  payload: LoginPayload,
): Promise<AuthResult> => {
  const result = await post<
    ApiResponse<AuthResult>
  >(
    "/auth/login",
    payload,
  );

  return result.data;
};

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// ==========================================

export const getMe = async (
  token: string,
): Promise<AuthUser> => {
  if (!token) {
    throw new Error(
      "Authentication token is required",
    );
  }

  const result = await get<
    ApiResponse<{
      user: AuthUser;
    }>
  >(
    "/auth/me",
    token,
  );

  return result.data.user;
};

// ==========================================
// MANAGER MANAGEMENT (SUPERADMIN ONLY)
// ==========================================



/**
 * Register a new Manager (Superadmin only)
 * POST /api/auth/managers
 */
export const createManager = async (
  payload: CreateManagerPayload,
  token: string,
): Promise<ManagerItem> => {
  if (!token) {
    throw new Error("Superadmin token is required");
  }

  const result = await post<ApiResponse<ManagerItem>>(
    "/auth/managers",
    payload,
    token,
  );

  return result.data;
};

/**
 * Get all managers (Superadmin only)
 * GET /api/auth/managers
 */
export const getManagers = async (
  token: string,
): Promise<ManagerItem[]> => {
  if (!token) {
    throw new Error("Superadmin token is required");
  }

  const result = await get<ApiResponse<ManagerItem[]>>(
    "/auth/managers",
    token,
  );

  return result.data;
};

/**
 * Update Manager active/inactive status (Superadmin only)
 * PATCH /api/auth/managers/:id/status
 */
export const updateManagerStatus = async (
  managerId: string,
  isActive: boolean,
  token: string,
): Promise<{ id: string; isActive: boolean }> => {
  if (!token) {
    throw new Error("Superadmin token is required");
  }

  const result = await patch<ApiResponse<{ id: string; isActive: boolean }>>(
    `/auth/managers/${managerId}/status`,
    { isActive },
    token,
  );

  return result.data;
};

/**
 * Update Manager department, permissions, or profile (Superadmin only)
 * PUT /api/auth/managers/:id
 */
export const updateManager = async (
  managerId: string,
  payload: UpdateManagerPayload,
  token: string,
): Promise<ManagerItem> => {
  if (!token) {
    throw new Error("Superadmin token is required");
  }

  const result = await put<ApiResponse<ManagerItem>>(
    `/auth/managers/${managerId}`,
    payload,
    token,
  );

  return result.data;
};

/**
 * One-time Superadmin Bootstrap (Self-locking)
 * POST /api/auth/bootstrap-superadmin
 */
export const bootstrapSuperAdmin = async (
  payload: BootstrapSuperAdminPayload,
): Promise<AuthResult> => {
  const result = await post<ApiResponse<AuthResult>>(
    "/auth/bootstrap-superadmin",
    payload,
  );

  return result.data;
};
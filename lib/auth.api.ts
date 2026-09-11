// ==========================================
// AUTH API
// ==========================================

import {
  get,
  post,
  ApiResponse,
} from "./api";

import type {
  AuthUser,
  RegisterPayload,
  LoginPayload,
  AuthResult,
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
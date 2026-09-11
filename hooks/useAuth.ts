"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuthUser } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  // ==========================================
  // LOAD AUTH DATA
  // ==========================================

  useEffect(() => {
    try {
      const token =
        localStorage.getItem(TOKEN_KEY);

      const storedUser =
        localStorage.getItem(USER_KEY);

      const user = storedUser
        ? (JSON.parse(storedUser) as AuthUser)
        : null;

      setState({
        user,
        token,
        loading: false,
      });
    } catch {
      setState({
        user: null,
        token: null,
        loading: false,
      });
    }
  }, []);

  // ==========================================
  // LOGIN STATE
  // ==========================================

  const setAuth = useCallback(
    (
      token: string,
      user: AuthUser,
    ) => {
      localStorage.setItem(
        TOKEN_KEY,
        token,
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user),
      );

      setState({
        user,
        token,
        loading: false,
      });
    },
    [],
  );

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = useCallback(() => {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );

    setState({
      user: null,
      token: null,
      loading: false,
    });
  }, []);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    user: state.user,
    token: state.token,
    loading: state.loading,

    isAuthenticated:
      Boolean(state.token),

    setAuth,
    logout,
  };
};
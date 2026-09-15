"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuthUser } from "@/types/auth";
import {
  clearAuth,
  readAuth,
  writeAuth,
} from "@/lib/auth-storage";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

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
    const storedAuth = readAuth();

    if (storedAuth) {
      setState({
        user: storedAuth.user,
        token: storedAuth.token,
        loading: false,
      });
      return;
    }

    setState({
      user: null,
      token: null,
      loading: false,
    });
  }, []);

  // ==========================================
  // LOGIN STATE
  // ==========================================

  const setAuth = useCallback(
    (
      token: string,
      user: AuthUser,
      remember = true,
    ) => {
        writeAuth(token, user, remember);

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
    clearAuth();

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
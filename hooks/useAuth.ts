"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuthUser } from "@/types/auth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
};

const TOKEN_KEY = "token";
const USER_KEY = "user";

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
        localStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY);

      const storedUser =
        localStorage.getItem(USER_KEY) ||
        sessionStorage.getItem(USER_KEY);

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
      remember = true,
    ) => {
      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;

      otherStorage.removeItem(TOKEN_KEY);
      otherStorage.removeItem(USER_KEY);

      storage.setItem(TOKEN_KEY, token);
      storage.setItem(USER_KEY, JSON.stringify(user));

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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

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
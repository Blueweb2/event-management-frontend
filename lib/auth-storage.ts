import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

type AuthStorage = Storage;

type AuthCleanupListener = () => void;
const cleanupListeners: Set<AuthCleanupListener> = new Set();

export function onAuthCleared(listener: AuthCleanupListener): () => void {
  cleanupListeners.add(listener);
  return () => {
    cleanupListeners.delete(listener);
  };
}

function getStorage(name: "local" | "session"): AuthStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return name === "local" ? window.localStorage : window.sessionStorage;
}

function readFromStorage(storage: AuthStorage | null) {
  if (!storage) {
    return null;
  }

  const token = storage.getItem(TOKEN_KEY);
  const storedUser = storage.getItem(USER_KEY);

  if (!token) {
    return null;
  }

  let user: AuthUser | null = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser) as AuthUser;
    } catch {
      user = null;
    }
  }

  return {
    token,
    user: user || {
      id: "",
      name: "User",
      username: "",
      email: "",
      role: "admin",
    },
  };
}

export function readAuth() {
  const fromStorage =
    readFromStorage(getStorage("local")) ||
    readFromStorage(getStorage("session"));

  if (fromStorage) {
    return fromStorage;
  }

  // Cookie fallback
  if (typeof document !== "undefined" && document.cookie) {
    const tokenMatch = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    const roleMatch = document.cookie.match(/(?:^|;\s*)user_role=([^;]+)/);
    if (tokenMatch && tokenMatch[1]) {
      const token = decodeURIComponent(tokenMatch[1]);
      const roleStr = roleMatch ? decodeURIComponent(roleMatch[1]).toLowerCase() : "admin";
      const role: AuthUser["role"] = roleStr === "staff" ? "staff" : "admin";
      return {
        token,
        user: {
          id: "",
          name: "User",
          username: "",
          email: "",
          role,
        },
      };
    }
  }

  return null;
}

export function getAuthToken(): string | undefined {
  const fromAuth = readAuth()?.token;
  if (fromAuth) {
    return fromAuth;
  }

  if (typeof window !== "undefined") {
    const localToken = window.localStorage.getItem(TOKEN_KEY);
    if (localToken) return localToken;

    const sessionToken = window.sessionStorage.getItem(TOKEN_KEY);
    if (sessionToken) return sessionToken;

    if (typeof document !== "undefined" && document.cookie) {
      const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  return undefined;
}

export function writeAuth(
  token: string,
  user: AuthUser,
  remember = true,
) {
  clearAuth();

  const storage = getStorage(remember ? "local" : "session");

  if (storage) {
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Also persist to localStorage when remember is true
  if (remember && typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  if (typeof document !== "undefined") {
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 1 day
    document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `user_role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export function clearAuth() {
  getStorage("local")?.removeItem(TOKEN_KEY);
  getStorage("local")?.removeItem(USER_KEY);
  getStorage("session")?.removeItem(TOKEN_KEY);
  getStorage("session")?.removeItem(USER_KEY);

  if (typeof document !== "undefined") {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";
  }

  cleanupListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignore listener errors
    }
  });
}

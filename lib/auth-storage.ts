import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

type AuthStorage = Storage;

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

  if (!token || !storedUser) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(storedUser) as AuthUser,
    };
  } catch {
    return null;
  }
}

export function readAuth() {
  return (
    readFromStorage(getStorage("local")) ||
    readFromStorage(getStorage("session"))
  );
}

export function getAuthToken() {
  return readAuth()?.token;
}

export function writeAuth(
  token: string,
  user: AuthUser,
  remember = false,
) {
  clearAuth();

  const storage = getStorage(remember ? "local" : "session");

  if (!storage) {
    return;
  }

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  getStorage("local")?.removeItem(TOKEN_KEY);
  getStorage("local")?.removeItem(USER_KEY);
  getStorage("session")?.removeItem(TOKEN_KEY);
  getStorage("session")?.removeItem(USER_KEY);
}

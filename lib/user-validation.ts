/**
 * Shared User & Manager Validation and Sanitization Utilities
 */

export const USERNAME_REGEX = /^[a-z0-9._-]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export function validateFullName(name: string): string | null {
  const trimmed = name?.trim() || "";
  if (!trimmed) {
    return "Full name is required.";
  }
  if (trimmed.length < 2) {
    return "Full name must be at least 2 characters.";
  }
  if (trimmed.length > 50) {
    return "Full name cannot exceed 50 characters.";
  }
  return null;
}

export function validateUsername(username: string): string | null {
  const trimmed = username?.trim().toLowerCase() || "";
  if (!trimmed) {
    return "Username is required.";
  }
  if (trimmed.length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (trimmed.length > 30) {
    return "Username cannot exceed 30 characters.";
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return "Username can only contain lowercase letters, numbers, dots (.), underscores (_), and hyphens (-).";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email?.trim().toLowerCase() || "";
  if (!trimmed) {
    return "Email address is required.";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
}

export function validatePhone(phone?: string): string | null {
  if (!phone || !phone.trim()) {
    return null; // Phone is optional
  }
  const trimmed = phone.trim();
  if (trimmed.length < 7 || trimmed.length > 25 || !PHONE_REGEX.test(trimmed)) {
    return "Please enter a valid phone number (e.g. +91 98765 43210).";
  }
  return null;
}

/**
 * Generate a clean, lowercase username suggestion from a name or email address
 */
export function generateUsernameSuggestion(input: string): string {
  if (!input) return "";
  let base = input.trim().toLowerCase();
  if (base.includes("@")) {
    base = base.split("@")[0];
  }
  const sanitized = base.replace(/[^a-z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 20);
  if (sanitized.length < 3) {
    return sanitized ? `${sanitized}usr` : "user";
  }
  return sanitized;
}

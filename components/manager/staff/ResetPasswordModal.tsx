"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  X,
} from "lucide-react";

import type { Staff } from "@/types/staff";

interface ResetPasswordModalProps {
  staff: Staff;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    newPassword: string,
  ) => Promise<unknown>;
}

export default function ResetPasswordModal({
  staff,
  isOpen,
  onClose,
  onConfirm,
}: ResetPasswordModalProps) {
  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    try {
      setIsSaving(true);

      await onConfirm(password);

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close reset password modal"
        onClick={handleClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Mobile bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
        className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A7B4F]">
              <KeyRound
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div className="min-w-0">
              <h2
                id="reset-password-title"
                className="text-base font-semibold text-[#1F1F1F]"
              >
                Reset Password
              </h2>

              <p className="mt-0.5 truncate text-xs text-gray-500">
                {staff.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 active:scale-95 disabled:opacity-50"
          >
            <X
              size={20}
              strokeWidth={2}
            />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-5 pb-6 pt-5"
        >
          {/* Information */}
          <div className="rounded-xl bg-[#F8F7F3] px-4 py-3">
            <p className="text-xs leading-5 text-gray-600">
              Set a new password for this staff
              member. They can use the new
              password to sign in.
            </p>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-xs font-medium text-gray-700"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value,
                  );

                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={isSaving}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 pr-12 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value,
                  )
                }
                disabled={isSaving}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-[10px] text-gray-400">
              Minimum 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-xs font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value,
                  );

                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={isSaving}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 pr-12 text-sm text-[#1F1F1F] outline-none transition placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value,
                  )
                }
                disabled={isSaving}
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3"
            >
              <p className="text-xs font-medium leading-5 text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="min-h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1F1F1F] px-4 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <KeyRound
                    size={16}
                    strokeWidth={1.9}
                  />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
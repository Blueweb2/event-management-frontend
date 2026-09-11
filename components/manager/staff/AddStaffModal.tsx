"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Mail,
  Phone,
  BriefcaseBusiness,
  Building2,
  LockKeyhole,
  UserRound,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

import type {
  Staff,
  CreateStaffPayload,
} from "@/types/staff";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    payload: CreateStaffPayload,
  ) => Promise<Staff>;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  password: "",
  confirmPassword: "",
};

export default function AddStaffModal({
  isOpen,
  onClose,
  onSave,
}: AddStaffModalProps) {
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [error, setError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setError(null);
      setIsSaving(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (
    field: keyof FormData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const role = formData.role.trim();
    const department =
      formData.department.trim();
    const password = formData.password;
    const confirmPassword =
      formData.confirmPassword;

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!role) {
      setError("Role is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
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

    const payload: CreateStaffPayload = {
      name,
      username: email,
      email,
      phone: phone || undefined,
      role,
      department:
        department || undefined,
      password,
    };

    try {
      setIsSaving(true);

      await onSave(payload);

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create staff.",
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
        aria-label="Close add staff modal"
        onClick={handleClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Mobile bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
        className="absolute inset-x-0 bottom-0 max-h-[94vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A7B4F]">
              <UserRound
                size={19}
                strokeWidth={1.9}
              />
            </div>

            <div className="min-w-0">
              <h2
                id="add-staff-title"
                className="text-base font-semibold text-[#1F1F1F]"
              >
                Add Staff
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Create a new staff account
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-5 pb-6 pt-5"
        >
          {/* Name */}
          <FormField
            label="Full Name"
            icon={UserRound}
            required
          >
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                handleChange(
                  "name",
                  event.target.value,
                )
              }
              placeholder="Enter full name"
              autoComplete="name"
              disabled={isSaving}
              className="form-input"
            />
          </FormField>

          {/* Email */}
          <FormField
            label="Email"
            icon={Mail}
            required
          >
            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value,
                )
              }
              placeholder="Enter email address"
              autoComplete="email"
              disabled={isSaving}
              className="form-input"
            />
          </FormField>

          {/* Phone */}
          <FormField
            label="Phone"
            icon={Phone}
          >
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) =>
                handleChange(
                  "phone",
                  event.target.value,
                )
              }
              placeholder="Enter phone number"
              autoComplete="tel"
              disabled={isSaving}
              className="form-input"
            />
          </FormField>

          {/* Role */}
          <FormField
            label="Role"
            icon={BriefcaseBusiness}
            required
          >
            <input
              type="text"
              value={formData.role}
              onChange={(event) =>
                handleChange(
                  "role",
                  event.target.value,
                )
              }
              placeholder="e.g. Event Staff"
              disabled={isSaving}
              className="form-input"
            />
          </FormField>

          {/* Department */}
          <FormField
            label="Department"
            icon={Building2}
          >
            <input
              type="text"
              value={formData.department}
              onChange={(event) =>
                handleChange(
                  "department",
                  event.target.value,
                )
              }
              placeholder="Enter department"
              disabled={isSaving}
              className="form-input"
            />
          </FormField>

          {/* Password */}
          <FormField
            label="Password"
            icon={LockKeyhole}
            required
          >
            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={(event) =>
                  handleChange(
                    "password",
                    event.target.value,
                  )
                }
                placeholder="Create password"
                autoComplete="new-password"
                disabled={isSaving}
                className="form-input pr-12"
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
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
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
          </FormField>

          {/* Confirm Password */}
          <FormField
            label="Confirm Password"
            icon={LockKeyhole}
            required
          >
            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  formData.confirmPassword
                }
                onChange={(event) =>
                  handleChange(
                    "confirmPassword",
                    event.target.value,
                  )
                }
                placeholder="Confirm password"
                autoComplete="new-password"
                disabled={isSaving}
                className="form-input pr-12"
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
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </FormField>

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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserRound
                    size={16}
                    strokeWidth={1.9}
                  />
                  <span>Create Staff</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          min-height: 48px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: white;
          padding: 0 12px;
          font-size: 13px;
          color: #1f1f1f;
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-input:focus {
          border-color: #9a7b4f;
          box-shadow: 0 0 0 3px
            rgba(154, 123, 79, 0.1);
        }

        .form-input:disabled {
          cursor: not-allowed;
          background: #f9fafb;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

/* ==========================================
   FORM FIELD
========================================== */

interface FormFieldProps {
  label: string;
  icon: React.ElementType;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  icon: Icon,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-700">
        <Icon
          size={14}
          strokeWidth={1.8}
          className="text-[#9A7B4F]"
        />

        <span>{label}</span>

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}
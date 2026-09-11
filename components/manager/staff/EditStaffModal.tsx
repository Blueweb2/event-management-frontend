"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Mail,
  Phone,
  BriefcaseBusiness,
  Building2,
  X,
  Loader2,
} from "lucide-react";

import type {
  Staff,
  UpdateStaffPayload,
} from "@/types/staff";

interface EditStaffModalProps {
  staff: Staff;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    payload: UpdateStaffPayload,
  ) => Promise<Staff>;
}

export default function EditStaffModal({
  staff,
  isOpen,
  onClose,
  onSave,
}: EditStaffModalProps) {
  const [formData, setFormData] =
    useState<FormData>({
      name: staff.name ?? "",
      email: staff.email ?? "",
      phone: staff.phone ?? "",
      role: staff.role ?? "",
      department: staff.department ?? "",
    });

  const [error, setError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  /*
   * Keep form synchronized when a different
   * staff member is opened.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData({
      name: staff.name ?? "",
      email: staff.email ?? "",
      phone: staff.phone ?? "",
      role: staff.role ?? "",
      department: staff.department ?? "",
    });

    setError(null);
  }, [staff, isOpen]);

  /*
   * Don't render when closed.
   */
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

    const payload: UpdateStaffPayload = {
      name,
      email,
      phone: phone || undefined,
      role,
      department:
        department || undefined,
    };

    try {
      setIsSaving(true);

      await onSave(payload);

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update staff.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close edit staff modal"
        onClick={() => {
          if (!isSaving) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-black/40"
      />

      {/* Mobile bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-staff-title"
        className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2
              id="edit-staff-title"
              className="text-base font-semibold text-[#1F1F1F]"
            >
              Edit Staff
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Update staff information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 active:scale-95 disabled:opacity-50"
          >
            <X size={20} strokeWidth={2} />
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
            icon={BriefcaseBusiness}
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
              onClick={onClose}
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
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
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
          transition: border-color 150ms ease,
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
   TYPES
========================================== */

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
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
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}
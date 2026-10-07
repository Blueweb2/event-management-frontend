"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  BriefcaseBusiness,
  Building2,
  X,
  Loader2,
  Camera,
  Trash2,
  UserRound,
  IndianRupee,
} from "lucide-react";

import type {
  Staff,
  UpdateStaffPayload,
} from "@/types/staff";
import { uploadStaffAvatarImage, uploadGeneralStaffAvatar, getStaffAvatarUrl } from "@/lib/staff.api";
import { useAuth } from "@/hooks/useAuth";

interface EditStaffModalProps {
  staff: Staff;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    payload: UpdateStaffPayload,
  ) => Promise<Staff>;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: string;
  salaryType: "hourly" | "daily" | "monthly" | "per_event";
  avatar: string;
}

import {
  getDepartmentAndServiceOptions,
  STANDARD_DEPARTMENTS,
} from "@/lib/department-options";

export default function EditStaffModal({
  staff,
  isOpen,
  onClose,
  onSave,
}: EditStaffModalProps) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] =
    useState<FormData>({
      name: staff.name ?? "",
      email: staff.email ?? "",
      phone: staff.phone ?? "",
      role: staff.role ?? "",
      department: staff.department ?? "",
      salary: staff.salary !== undefined ? String(staff.salary) : (staff.hourlyRate !== undefined ? String(staff.hourlyRate) : ""),
      salaryType: staff.salaryType || "hourly",
      avatar: staff.avatar ?? "",
    });

  const [departmentOptions, setDepartmentOptions] =
    useState<string[]>(STANDARD_DEPARTMENTS);

  const [error, setError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] =
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
      salary: staff.salary !== undefined ? String(staff.salary) : (staff.hourlyRate !== undefined ? String(staff.hourlyRate) : ""),
      salaryType: staff.salaryType || "hourly",
      avatar: staff.avatar ?? "",
    });

    setError(null);
    setIsUploadingAvatar(false);

    void getDepartmentAndServiceOptions(staff.department).then((opts) => {
      setDepartmentOptions(opts);
    });
  }, [staff, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB.");
      return;
    }

    try {
      setError(null);
      setIsUploadingAvatar(true);
      let newAvatarUrl = "";
      if (staff.id) {
        newAvatarUrl = await uploadStaffAvatarImage(staff.id, file, token || undefined);
      } else {
        newAvatarUrl = await uploadGeneralStaffAvatar(file, token || undefined);
      }

      if (newAvatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to upload photo.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
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

    const numSalary = Number(formData.salary) || 0;

    const payload: UpdateStaffPayload = {
      name,
      email,
      phone: phone || undefined,
      role,
      department:
        department || undefined,
      salary: numSalary,
      salaryType: formData.salaryType,
      hourlyRate: formData.salaryType === "hourly" ? numSalary : undefined,
      avatar: formData.avatar,
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

  const avatarDisplayUrl = getStaffAvatarUrl(formData.avatar);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop overlay */}
      <div
        onClick={() => {
          if (!isSaving) {
            onClose();
          }
        }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-staff-title"
        className="relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl sm:max-w-md animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Mobile drag handle */}
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
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center gap-2 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarFileSelect}
              disabled={isSaving || isUploadingAvatar}
            />

            <div className="relative group">
              {avatarDisplayUrl ? (
                <img
                  src={avatarDisplayUrl}
                  alt="Staff Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-[#9A7B4F]/30 shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F4EBDD] text-[#9A7B4F] text-xl font-bold border-2 border-dashed border-[#9A7B4F]/40 shadow-inner">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : <UserRound size={28} />}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || isUploadingAvatar}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#9A7B4F] text-white shadow-md transition hover:bg-[#85673E] active:scale-90 disabled:opacity-50"
                title="Change staff photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || isUploadingAvatar}
                className="text-[11px] font-medium text-[#9A7B4F] hover:underline"
              >
                {formData.avatar ? "Change Photo" : "Upload Photo"}
              </button>
              {formData.avatar && (
                <>
                  <span className="text-gray-300 text-xs">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isSaving || isUploadingAvatar}
                    className="text-[11px] font-medium text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
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
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </FormField>

          {/* Department */}
          <FormField
            label="Department / Service"
            icon={Building2}
          >
            <select
              value={formData.department}
              onChange={(event) =>
                handleChange(
                  "department",
                  event.target.value,
                )
              }
              disabled={isSaving}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50 cursor-pointer"
            >
              <option value="">Select a department or service...</option>
              {departmentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[10px] text-gray-400">
              Populated from active services configured in your Service Menu.
            </p>
          </FormField>

          {/* Salary & Pay Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#faf8f5] p-3.5 border border-[#e8e1d8]">
            <FormField
              label="Salary / Pay Rate (₹)"
              icon={IndianRupee}
            >
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.salary}
                onChange={(event) =>
                  handleChange(
                    "salary",
                    event.target.value,
                  )
                }
                placeholder="e.g. 500"
                disabled={isSaving}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </FormField>

            <FormField
              label="Rate Structure"
              icon={IndianRupee}
            >
              <select
                value={formData.salaryType}
                onChange={(event) =>
                  handleChange(
                    "salaryType",
                    event.target.value as any,
                  )
                }
                disabled={isSaving}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50 cursor-pointer"
              >
                <option value="hourly">Hourly Rate (₹/hr)</option>
                <option value="daily">Daily Rate (₹/day)</option>
                <option value="monthly">Monthly Salary (₹/mo)</option>
                <option value="per_event">Per Event Pay (₹/event)</option>
              </select>
            </FormField>
            <p className="col-span-full text-[10px] text-gray-500 italic">
              Configured rate will automatically apply when assigning this staff member to events.
            </p>
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
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}
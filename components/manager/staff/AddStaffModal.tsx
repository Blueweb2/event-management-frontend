"use client";

import {
  FormEvent,
  useEffect,
  useRef,
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
  Camera,
  Trash2,
  Upload,
  IndianRupee,
} from "lucide-react";

import type {
  Staff,
  CreateStaffPayload,
} from "@/types/staff";
import { uploadGeneralStaffAvatar, getStaffAvatarUrl } from "@/lib/staff.api";
import { useAuth } from "@/hooks/useAuth";

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
  salary: string;
  salaryType: "hourly" | "daily" | "monthly" | "per_event";
  password: string;
  confirmPassword: string;
  avatar: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  salary: "",
  salaryType: "hourly",
  password: "",
  confirmPassword: "",
  avatar: "",
};

import {
  getDepartmentAndServiceOptions,
  STANDARD_DEPARTMENTS,
} from "@/lib/department-options";

export default function AddStaffModal({
  isOpen,
  onClose,
  onSave,
}: AddStaffModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  const [departmentOptions, setDepartmentOptions] =
    useState<string[]>(STANDARD_DEPARTMENTS);

  const [error, setError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] =
    useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData(initialFormData);
    setError(null);
    setIsSaving(false);
    setIsUploadingAvatar(false);
    setShowPassword(false);
    setShowConfirmPassword(false);

    void getDepartmentAndServiceOptions().then((opts) => {
      setDepartmentOptions(opts);
    });
  }, [isOpen]);

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
      const uploadedUrl = await uploadGeneralStaffAvatar(file, token || undefined);
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, avatar: uploadedUrl }));
      }
    } catch (err: any) {
      setError(err?.message || "Failed to upload profile image.");
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

    const rawUsername = email.includes("@") ? email.split("@")[0] : email;
    const sanitizedUsername = rawUsername.toLowerCase().replace(/[^a-z0-9._-]/g, "_");
    const validUsername = sanitizedUsername.length >= 3 ? sanitizedUsername.slice(0, 30) : `${sanitizedUsername}staff`;

    const numSalary = Number(formData.salary) || 0;

    const payload: CreateStaffPayload = {
      name,
      username: validUsername,
      email,
      phone: phone || undefined,
      role,
      department:
        department || undefined,
      salary: numSalary,
      salaryType: formData.salaryType,
      hourlyRate: formData.salaryType === "hourly" ? numSalary : undefined,
      password,
      avatar: formData.avatar ? formData.avatar : undefined,
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

  const avatarDisplayUrl = getStaffAvatarUrl(formData.avatar);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
        className="relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl sm:max-w-md animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Mobile drag bar */}
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
                title="Upload staff photo"
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
              autoComplete="email"
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
              autoComplete="tel"
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
            required
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
              required
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50 cursor-pointer"
            >
              <option value="">Select a department / service</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[10px] text-gray-400">
              Populated from active services configured in your Service Menu.
            </p>
          </FormField>

          {/* Salary & Pay Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#faf8f5] p-3 border border-[#e8e1d8]">
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
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-3.5 pr-12 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
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
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-3.5 pr-12 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
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
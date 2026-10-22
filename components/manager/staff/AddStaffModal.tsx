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
  IndianRupee,
  ChefHat,
  AtSign,
  AlertCircle,
} from "lucide-react";

import type {
  Staff,
  CreateStaffPayload,
} from "@/types/staff";
import { uploadGeneralStaffAvatar, getStaffAvatarUrl } from "@/lib/staff.api";
import { useAuth } from "@/hooks/useAuth";
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validatePassword,
  validatePhone,
  generateUsernameSuggestion,
} from "@/lib/user-validation";
import {
  getDepartmentAndServiceOptions,
  STANDARD_DEPARTMENTS,
} from "@/lib/department-options";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    payload: CreateStaffPayload,
  ) => Promise<Staff>;
}

interface FormData {
  name: string;
  username: string;
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
  username: "",
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

export default function AddStaffModal({
  isOpen,
  onClose,
  onSave,
}: AddStaffModalProps) {
  const { user, token } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin" || role === "admin";
  const isChefManager =
    role === "manager" &&
    String(user?.department || "").toLowerCase().includes("kitchen");
  const isDepartmentManager = role === "manager" && !isChefManager;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(STANDARD_DEPARTMENTS);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const defaultDept = isChefManager
      ? "Kitchen"
      : isDepartmentManager
      ? user?.department || ""
      : "";

    setFormData({
      ...initialFormData,
      department: defaultDept,
    });
    setError(null);
    setIsSaving(false);
    setIsUploadingAvatar(false);
    setShowPassword(false);
    setShowConfirmPassword(false);

    void getDepartmentAndServiceOptions().then((opts) => {
      setDepartmentOptions(opts);
    });
  }, [isOpen, isChefManager, isDepartmentManager, user?.department]);

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

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handleNameOrEmailBlur = () => {
    if (!formData.username.trim()) {
      const suggestion = generateUsernameSuggestion(formData.name || formData.email);
      if (suggestion) {
        setFormData((prev) => ({ ...prev, username: suggestion }));
      }
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // 1. Unified Validations
    const nameErr = validateFullName(formData.name);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    let usernameVal = formData.username.trim().toLowerCase();
    if (!usernameVal) {
      usernameVal = generateUsernameSuggestion(formData.name || formData.email);
    }
    const usernameErr = validateUsername(usernameVal);
    if (usernameErr) {
      setError(usernameErr);
      return;
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) {
      setError(passwordErr);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const finalDepartment = isChefManager
      ? "Kitchen"
      : isDepartmentManager
      ? (user?.department || formData.department.trim())
      : formData.department.trim();

    if (!finalDepartment && !isSuperAdmin) {
      setError("Department is required.");
      return;
    }

    const numSalary = Number(formData.salary) || 0;

    // Staff creation strictly provisions role: "staff"
    const payload: CreateStaffPayload = {
      name: formData.name.trim(),
      username: usernameVal,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      role: "staff",
      department: finalDepartment || undefined,
      salary: isChefManager ? 0 : numSalary,
      salaryType: formData.salaryType,
      hourlyRate: !isChefManager && formData.salaryType === "hourly" ? numSalary : undefined,
      password: formData.password,
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
          : "Failed to create staff account.",
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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
        className="relative z-10 w-full max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl sm:max-w-md animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A7B4F]">
              <UserRound size={19} strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
              <h2
                id="add-staff-title"
                className="text-base font-bold text-[#1F1F1F]"
              >
                Add Staff Member
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Provision a regular employee account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form Error Alert */}
        {error && (
          <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium animate-in fade-in">
            <AlertCircle size={15} className="shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-6 pt-4">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center justify-center gap-2 pb-1">
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
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#9A7B4F] text-white shadow-md transition hover:bg-[#85673E] active:scale-90 disabled:opacity-50 cursor-pointer"
                title="Upload staff photo"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving || isUploadingAvatar}
                className="text-[11px] font-medium text-[#9A7B4F] hover:underline cursor-pointer"
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
                    className="text-[11px] font-medium text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Full Name */}
          <FormField label="Full Name" icon={UserRound} required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={handleNameOrEmailBlur}
              placeholder="e.g. Ramesh Kumar"
              autoComplete="name"
              disabled={isSaving}
              required
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50"
            />
          </FormField>

          {/* Username */}
          <FormField label="Username" icon={AtSign} required>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
              placeholder="e.g. ramesh_decor"
              autoComplete="username"
              disabled={isSaving}
              required
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50"
            />
            <p className="mt-1 text-[10px] text-gray-400">
              Unique identifier (3-30 lowercase characters, letters, numbers, dot, underscore, hyphen)
            </p>
          </FormField>

          {/* Email */}
          <FormField label="Email Address" icon={Mail} required>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={handleNameOrEmailBlur}
              placeholder="ramesh@example.com"
              autoComplete="email"
              disabled={isSaving}
              required
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50"
            />
          </FormField>

          {/* Phone */}
          <FormField label="Phone Number" icon={Phone}>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              disabled={isSaving}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50"
            />
          </FormField>

          {/* Department Selection */}
          <FormField label="Assigned Department" icon={Building2} required>
            {isChefManager ? (
              <div className="flex h-10 w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 text-xs font-semibold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <ChefHat size={14} className="text-amber-700" />
                  Kitchen Department
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                  Locked to Chef Scope
                </span>
              </div>
            ) : isDepartmentManager ? (
              <div className="flex h-10 w-full items-center justify-between rounded-xl border border-sky-200 bg-sky-50/60 px-3.5 text-xs font-semibold text-sky-900">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-sky-700" />
                  {user?.department || "Operations"}
                </span>
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800">
                  Locked to Your Scope
                </span>
              </div>
            ) : (
              <select
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                disabled={isSaving}
                required
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50 cursor-pointer"
              >
                <option value="">Select a department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {/* Salary & Pay Structure (Hidden for Chef Manager) */}
          {!isChefManager && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#faf8f5] p-3 border border-[#e8e1d8]">
              <FormField label="Rate / Base Pay (₹)" icon={IndianRupee}>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  placeholder="e.g. 500"
                  disabled={isSaving}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50"
                />
              </FormField>

              <FormField label="Rate Structure" icon={IndianRupee}>
                <select
                  value={formData.salaryType}
                  onChange={(e) => handleChange("salaryType", e.target.value as any)}
                  disabled={isSaving}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50 cursor-pointer"
                >
                  <option value="hourly">Hourly Rate (₹/hr)</option>
                  <option value="daily">Daily Rate (₹/day)</option>
                  <option value="monthly">Monthly Salary (₹/mo)</option>
                  <option value="per_event">Per Event Pay (₹/event)</option>
                </select>
              </FormField>
            </div>
          )}

          {/* Password */}
          <FormField label="Initial Password" icon={LockKeyhole} required>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Create secure password"
                autoComplete="new-password"
                disabled={isSaving}
                required
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-3 pr-10 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isSaving}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">At least 6 characters</p>
          </FormField>

          {/* Confirm Password */}
          <FormField label="Confirm Password" icon={LockKeyhole} required>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                disabled={isSaving}
                required
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-3 pr-10 text-xs text-[#1F1F1F] outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={isSaving}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </FormField>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="h-10 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#29241f] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving && <Loader2 size={13} className="animate-spin" />}
              <span>{isSaving ? "Creating Staff..." : "Create Staff Member"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  required = false,
  children,
}: {
  label: string;
  icon?: any;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-700">
        {Icon && <Icon size={13} className="text-[#9A7B4F]" />}
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
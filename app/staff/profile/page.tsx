"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Building,
  CheckCircle2,
  Edit3,
  Hash,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { get, put, patch, ApiResponse } from "@/lib/api";

interface StaffProfile {
  id: string;
  username?: string;
  employeeId?: string;
  department?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  employmentType: string;
  role: string;
  status: string;
  joinedDate: string;
}

export default function StaffProfilePage() {
  const { token, user: authUser } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "edit" | "security">(
    "details"
  );

  // Edit Profile Form State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  const loadProfile = async () => {
    try {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }
      setError("");
      const result = await get<ApiResponse<{ user: StaffProfile }>>(
        "/users/me",
        token
      );
      if (result.data?.user) {
        setProfile(result.data.user);
        setEditName(result.data.user.name || "");
        setEditPhone(result.data.user.phone || "");
        setEditLocation(result.data.user.location || "");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load staff profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, [token]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaveLoading(true);
      setSaveError("");
      setSaveSuccess("");

      const result = await put<ApiResponse<{ user: StaffProfile }>>(
        "/users/me",
        {
          name: editName,
          phone: editPhone,
          location: editLocation,
        },
        token
      );

      if (result.data?.user) {
        setProfile(result.data.user);
        setSaveSuccess("Profile details updated successfully!");
        setActiveTab("details");
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setPassLoading(true);
      setPassError("");
      setPassSuccess("");

      await patch<ApiResponse<null>>(
        "/users/me/password",
        {
          currentPassword,
          newPassword,
        },
        token
      );

      setPassSuccess("Password updated successfully! Keep your credentials safe.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassError(
        err instanceof Error ? err.message : "Failed to update password."
      );
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <main className="space-y-6 py-5 sm:space-y-8 sm:py-6">
      {/* Header */}
      <header className="border-b border-[#e8e1d8] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">
          Staff Portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          My Account & Credentials
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
          View employment credentials, update personal details, and manage login security.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e8e1d8] border-t-[#a7773f]" />
            <p className="mt-3 text-xs font-semibold text-[#756d64]">
              Loading profile details...
            </p>
          </div>
        </div>
      ) : !profile ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-600">
          Profile data not found. Please log in again.
        </div>
      ) : (
        <>
          {/* Main Hero Profile Banner */}
          <section className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white shadow-sm">
            <div className="bg-gradient-to-r from-[#29241f] via-[#3d362e] to-[#1f1b18] p-6 text-white sm:p-8">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                {/* Avatar */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#9a6c37] to-[#b8894b] font-bold text-white shadow-xl">
                  <UserRound size={40} />
                </div>

                {/* Main Information */}
                <div className="mt-5 sm:ml-6 sm:mt-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-2xl font-extrabold tracking-tight text-white">
                      {profile.name}
                    </h2>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                      {profile.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-amber-200/90 capitalize">
                    {profile.role} · {profile.department || "Event Operations"}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-gray-300">
                    <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
                      <Hash size={13} className="text-amber-400" />
                      ID: {profile.employeeId || "EMP-" + profile.id.slice(-6).toUpperCase()}
                    </span>

                    <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1">
                      <BadgeCheck size={13} className="text-amber-400" />
                      {profile.employmentType || "Full-Time"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#eee8e1] bg-[#faf8f5] px-6">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs font-bold transition ${
                  activeTab === "details"
                    ? "border-[#9a6c37] text-[#9a6c37]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <User size={15} />
                Profile Information
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs font-bold transition ${
                  activeTab === "edit"
                    ? "border-[#9a6c37] text-[#9a6c37]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Edit3 size={15} />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs font-bold transition ${
                  activeTab === "security"
                    ? "border-[#9a6c37] text-[#9a6c37]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <ShieldCheck size={15} />
                Security & Password
              </button>
            </div>

            {/* Tab 1: Profile Details */}
            {activeTab === "details" && (
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={profile.email}
                  />

                  <Info
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    value={profile.phone || "Not provided"}
                  />

                  <Info
                    icon={<MapPin size={16} />}
                    label="Location / Base City"
                    value={profile.location || "Not provided"}
                  />

                  <Info
                    icon={<Building size={16} />}
                    label="Department"
                    value={profile.department || "Event Operations"}
                  />

                  <Info
                    icon={<Hash size={16} />}
                    label="Employee ID"
                    value={profile.employeeId || "EMP-" + profile.id.slice(-6).toUpperCase()}
                  />

                  <Info
                    icon={<User size={16} />}
                    label="Username"
                    value={profile.username || "Staff User"}
                  />

                  <Info
                    icon={<BadgeCheck size={16} />}
                    label="Joined Date"
                    value={formatDate(profile.joinedDate)}
                  />

                  <Info
                    icon={<ShieldCheck size={16} />}
                    label="System Role"
                    value={profile.role.toUpperCase()}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Edit Profile Form */}
            {activeTab === "edit" && (
              <div className="p-6">
                {saveSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={16} />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                {saveError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                    <AlertCircle size={16} />
                    <span>{saveError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Location / Base City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai / Delhi NCR"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-[#a7773f] disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saveLoading ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: Security & Password */}
            {activeTab === "security" && (
              <div className="p-6">
                {passSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={16} />
                    <span>{passSuccess}</span>
                  </div>
                )}

                {passError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                    <AlertCircle size={16} />
                    <span>{passError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passLoading}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#29241f] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
                    >
                      <Lock size={16} />
                      {passLoading ? "Updating Password..." : "Update Security Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Not available";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#eee8e1] bg-[#fbf8f4] p-4">
      <div className="flex items-center gap-2 text-[#a7773f]">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b938a]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-[#403a34]">{value}</p>
    </div>
  );
}
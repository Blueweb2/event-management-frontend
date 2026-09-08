"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  employmentType: string;
  role: "admin" | "staff";
  status: "Active" | "Inactive";
  joinedDate: string;
}

export default function StaffProfilePage() {
  const [profile, setProfile] =
    useState<StaffProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load profile"
          );
        }

        setProfile(result.data.user);
      } catch (error) {
        console.error("Profile error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Loading state
  if (loading) {
    return (
      <main className="py-5 sm:py-6">
        <div className="border-b border-[#e8e1d8] pb-6">
          <p className="text-sm font-semibold text-[#9a6c37]">
            Staff Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[#756d64]">
            View your staff account information.
          </p>
        </div>

        <div className="mt-6 flex min-h-[250px] items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#e8e1d8] border-t-[#a7773f]" />

            <p className="mt-3 text-sm text-[#756d64]">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <main className="py-5 sm:py-6">
        <div className="border-b border-[#e8e1d8] pb-6">
          <p className="text-sm font-semibold text-[#9a6c37]">
            Staff Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[#756d64]">
            View your staff account information.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            Unable to load profile
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error || "Profile not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="py-5 sm:py-6">
      {/* Header */}
      <div className="border-b border-[#e8e1d8] pb-6">
        <p className="text-sm font-semibold text-[#9a6c37]">
          Staff Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-[#756d64]">
          View your staff account information.
        </p>
      </div>

      {/* Profile Card */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
        {/* Profile Header */}
        <div className="bg-[#f7efe4] p-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
            {/* Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#a7773f] shadow-sm">
              <UserRound size={32} />
            </div>

            {/* Basic information */}
            <div className="mt-4 sm:ml-5 sm:mt-0">
              <h2 className="text-xl font-bold text-[#29241f]">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm capitalize text-[#756d64]">
                {profile.role}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-[#edf5ed] px-3 py-1 text-xs font-semibold capitalize text-[#557555]">
                {profile.employmentType} ·{" "}
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <Info
            icon={<Phone size={17} />}
            label="Phone"
            value={profile.phone || "Not provided"}
          />

          <Info
            icon={<Mail size={17} />}
            label="Email"
            value={profile.email}
          />

          <Info
            icon={<MapPin size={17} />}
            label="Location"
            value={profile.location || "Not provided"}
          />

          <Info
            icon={<UserRound size={17} />}
            label="Joined"
            value={formatDate(profile.joinedDate)}
          />
        </div>
      </section>
    </main>
  );
}

function formatDate(date: string) {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString("en-US", {
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
    <div className="rounded-xl bg-[#fbf8f4] p-4">
      <div className="flex items-center gap-2 text-[#a7773f]">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide text-[#9b938a]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-[#403a34]">
        {value}
      </p>
    </div>
  );
}
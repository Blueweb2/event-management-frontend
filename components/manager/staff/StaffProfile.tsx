"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

import StaffStatusBadge from "./StaffStatusBadge";
import StaffDetails from "./StaffDetails";
import StaffActions from "./StaffActions";

import type {
  Staff,
  UpdateStaffPayload,
  ResetStaffPasswordResponse,
} from "@/types/staff";

interface StaffProfileProps {
  staff: Staff;

  onStatusChange?: (
    id: string,
    isActive: boolean,
  ) => Promise<Staff>;

  onStaffUpdated?: (
    id: string,
    payload: UpdateStaffPayload,
  ) => Promise<Staff>;

  onPasswordReset?: (
    id: string,
    newPassword: string,
  ) => Promise<ResetStaffPasswordResponse>;
}

export default function StaffProfile({
  staff,
  onStatusChange,
  onStaffUpdated,
  onPasswordReset,
}: StaffProfileProps) {
  const initials = getInitials(
    staff.name,
  );

  return (
    <div className="space-y-5">
      {/* Back Button */}
      <Link
        href="/manager/staff"
        className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-medium text-gray-600 transition hover:bg-white active:scale-95"
      >
        <ArrowLeft
          size={18}
          strokeWidth={2}
        />

        <span>Staff</span>
      </Link>

      {/* Profile Header */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          {staff.avatar ? (
            <img
              src={staff.avatar}
              alt={staff.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F4EBDD] text-xl font-semibold text-[#9A7B4F]">
              {initials}
            </div>
          )}

          {/* Name */}
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-[#1F1F1F]">
            {staff.name}
          </h1>

          {/* Role */}
          <p className="mt-1 text-sm text-gray-500">
            {staff.role}
          </p>

          {/* Status */}
          <div className="mt-3">
            <StaffStatusBadge
              status={
                staff.isActive
                  ? "Active"
                  : "Inactive"
              }
              size="md"
            />
          </div>

          {/* Staff ID */}
          <p className="mt-2 text-[11px] text-gray-400">
            Staff ID: {staff.id}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
          {/* Events */}
          <div className="rounded-xl bg-[#F8F7F3] p-3 text-center">
            <CalendarDays
              size={17}
              className="mx-auto text-[#9A7B4F]"
              strokeWidth={1.8}
            />

            <p className="mt-1.5 text-lg font-semibold text-[#1F1F1F]">
              {staff.eventsAssigned ?? 0}
            </p>

            <p className="text-[10px] text-gray-500">
              Events Assigned
            </p>
          </div>

          {/* Current Status */}
          <div className="rounded-xl bg-[#F8F7F3] p-3 text-center">
            <div className="mx-auto flex h-[17px] items-center justify-center">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  staff.isActive
                    ? "bg-[#4CAF50]"
                    : "bg-gray-400"
                }`}
              />
            </div>

            <p className="mt-1.5 text-lg font-semibold text-[#1F1F1F]">
              {staff.isActive
                ? "Active"
                : "Off"}
            </p>

            <p className="text-[10px] text-gray-500">
              Current Status
            </p>
          </div>
        </div>
      </section>

      {/* Staff Details */}
      <StaffDetails staff={staff} />

      {/* Staff Actions */}
      <StaffActions
        staff={staff}
        onStatusChange={onStatusChange}
        onStaffUpdated={onStaffUpdated}
        onPasswordReset={onPasswordReset}
      />
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}
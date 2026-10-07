"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react";

import type { Staff } from "@/types/staff";
import { getStaffAvatarUrl } from "@/lib/staff.api";

interface StaffCardProps {
  staff: Staff;
}

export default function StaffCard({
  staff,
}: StaffCardProps) {
  const isActive = staff.isActive;
  const avatarSrc = getStaffAvatarUrl(staff.avatar);

  return (
    <Link
      href={`/manager/staff/${staff.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 active:scale-[0.99]"
    >
      {/* Top Section */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={staff.name}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F4EBDD] text-sm font-semibold text-[#9A7B4F]">
            {getInitials(staff.name)}
          </div>
        )}

        {/* Staff Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[#1F1F1F]">
                {staff.name}
              </h3>

              <p className="mt-0.5 truncate text-xs text-gray-500">
                {staff.role}
              </p>
            </div>

            <ChevronRight
              size={18}
              strokeWidth={2}
              className="mt-1 shrink-0 text-gray-300"
            />
          </div>

          {/* Status & Rate */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                isActive
                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive
                    ? "bg-[#4CAF50]"
                    : "bg-gray-400"
                }`}
              />

              {isActive ? "Active" : "Inactive"}
            </span>

            {(typeof staff.salary === "number" && staff.salary > 0) || (typeof staff.hourlyRate === "number" && staff.hourlyRate > 0) ? (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                ₹{((staff.salary || staff.hourlyRate) as number).toLocaleString("en-IN")}
                {staff.salaryType === "hourly"
                  ? "/hr"
                  : staff.salaryType === "daily"
                  ? "/day"
                  : staff.salaryType === "monthly"
                  ? "/mo"
                  : "/event"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
        {/* Email */}
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-gray-500">
          <Mail
            size={14}
            strokeWidth={1.8}
            className="shrink-0 text-gray-400"
          />

          <span className="truncate">
            {staff.email}
          </span>
        </div>

        {/* Phone */}
        {staff.phone && (
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-gray-500">
            <Phone
              size={14}
              strokeWidth={1.8}
              className="shrink-0 text-gray-400"
            />

            <span className="truncate">
              {staff.phone}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Information */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <CalendarDays
            size={14}
            strokeWidth={1.8}
            className="text-[#9A7B4F]"
          />

          <span>
            {staff.eventsAssigned ?? 0}{" "}
            {(staff.eventsAssigned ?? 0) === 1
              ? "Event"
              : "Events"}{" "}
            Assigned
          </span>
        </div>

        <span className="text-[11px] font-medium text-[#9A7B4F]">
          View Profile
        </span>
      </div>
    </Link>
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
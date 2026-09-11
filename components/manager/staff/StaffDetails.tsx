"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  Phone,
  UserRound,
  Building2,
} from "lucide-react";

import type { Staff } from "@/types/staff";

interface StaffDetailsProps {
  staff: Staff;
}

export default function StaffDetails({
  staff,
}: StaffDetailsProps) {
  return (
    <section
      aria-labelledby="staff-details-heading"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      {/* Section Header */}
      <div className="mb-4">
        <h2
          id="staff-details-heading"
          className="text-sm font-semibold text-[#1F1F1F]"
        >
          Staff Details
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          Personal and work information
        </p>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {/* Name */}
        <DetailRow
          icon={UserRound}
          label="Full Name"
          value={staff.name}
        />

        {/* Role */}
        <DetailRow
          icon={BriefcaseBusiness}
          label="Role"
          value={staff.role}
        />

        {/* Department */}
        {staff.department && (
          <DetailRow
            icon={Building2}
            label="Department"
            value={staff.department}
          />
        )}

        {/* Email */}
        <DetailRow
          icon={Mail}
          label="Email"
          value={staff.email}
          href={`mailto:${staff.email}`}
        />

        {/* Phone */}
        {staff.phone && (
          <DetailRow
            icon={Phone}
            label="Phone"
            value={staff.phone}
            href={`tel:${staff.phone}`}
          />
        )}

        {/* Events Assigned */}
        <DetailRow
          icon={CalendarDays}
          label="Events Assigned"
          value={`${staff.eventsAssigned ?? 0} ${
            (staff.eventsAssigned ?? 0) === 1
              ? "event"
              : "events"
          }`}
        />

        {/* Joined */}
        {staff.joinedDate && (
          <DetailRow
            icon={CalendarDays}
            label="Joined"
            value={staff.joinedDate}
          />
        )}

        {/* Status */}
        <DetailRow
          icon={UserRound}
          label="Account Status"
          value={
            staff.isActive
              ? "Active"
              : "Inactive"
          }
        />
      </div>
    </section>
  );
}

interface DetailRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: DetailRowProps) {
  const content = (
    <>
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A7B4F]">
        <Icon
          size={16}
          strokeWidth={1.8}
        />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-medium text-[#1F1F1F]">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex min-h-12 items-center gap-3 rounded-xl px-2 transition hover:bg-[#F8F7F3] active:bg-[#F4EBDD]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl px-2">
      {content}
    </div>
  );
}
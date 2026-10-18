"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  ChefHat,
  User,
} from "lucide-react";

import type { Staff } from "@/types/staff";
import { getStaffAvatarUrl } from "@/lib/staff.api";
import { useAuth } from "@/hooks/useAuth";

interface StaffCardProps {
  staff: Staff;
}

export default function StaffCard({ staff }: StaffCardProps) {
  const { user } = useAuth();
  const isActive = staff.isActive;
  const avatarSrc = getStaffAvatarUrl(staff.avatar);

  const isRequesterChef =
    (user?.role || "").toLowerCase() === "manager" &&
    String(user?.department || "").toLowerCase().includes("kitchen");

  const isSuperAdmin = staff.role === "superadmin";
  const isManager = staff.role === "manager" || staff.role === "admin";
  const isChef =
    isManager && String(staff.department || "").toLowerCase().includes("kitchen");

  return (
    <Link
      href={`/manager/staff/${staff.id}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#9A7B4F]/40 hover:shadow-md active:scale-[0.99]"
    >
      {/* Top Section */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={staff.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4EBDD] text-sm font-bold text-[#9A7B4F] ring-2 ring-gray-100">
              {getInitials(staff.name)}
            </div>
          )}

          {/* Role Icon overlay badge */}
          {isSuperAdmin ? (
            <span
              title="Super Admin"
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs"
            >
              <ShieldCheck size={11} strokeWidth={2.5} />
            </span>
          ) : isChef ? (
            <span
              title="Chef Manager"
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white shadow-xs"
            >
              <ChefHat size={11} strokeWidth={2.5} />
            </span>
          ) : isManager ? (
            <span
              title="Department Manager"
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs"
            >
              <ShieldCheck size={11} strokeWidth={2.5} />
            </span>
          ) : null}
        </div>

        {/* Staff Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-[#1F1F1F] group-hover:text-[#9A7B4F] transition-colors">
                {staff.name}
              </h3>

              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {/* Role Badge */}
                {isSuperAdmin ? (
                  <span className="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                    Super Admin
                  </span>
                ) : isChef ? (
                  <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    Chef Manager
                  </span>
                ) : isManager ? (
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                    Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 border border-gray-200">
                    Staff
                  </span>
                )}

                {/* Department Badge */}
                {staff.department && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-800 border border-sky-100">
                    <Building2 size={10} className="shrink-0 text-sky-600" />
                    <span className="truncate max-w-[100px]">{staff.department}</span>
                  </span>
                )}

                {/* Employee ID */}
                {staff.employeeId && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    #{staff.employeeId}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight
              size={18}
              strokeWidth={2}
              className="mt-1 shrink-0 text-gray-300 group-hover:text-[#9A7B4F] group-hover:translate-x-0.5 transition-all"
            />
          </div>

          {/* Status & Compensation */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                isActive
                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-[#4CAF50]" : "bg-gray-400"
                }`}
              />
              {isActive ? "Active" : "Inactive"}
            </span>

            {/* Compensation visible only to authorized users */}
            {!isRequesterChef &&
            ((typeof staff.salary === "number" && staff.salary > 0) ||
              (typeof staff.hourlyRate === "number" && staff.hourlyRate > 0)) ? (
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

            {staff.employmentType && (
              <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500 border border-gray-200/60 capitalize">
                {staff.employmentType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-3.5 space-y-1.5 border-t border-gray-100 pt-3">
        {/* Email */}
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-gray-500">
          <Mail size={13} strokeWidth={1.8} className="shrink-0 text-gray-400" />
          <span className="truncate">{staff.email}</span>
        </div>

        {/* Phone */}
        {staff.phone && (
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-gray-500">
            <Phone size={13} strokeWidth={1.8} className="shrink-0 text-gray-400" />
            <span className="truncate">{staff.phone}</span>
          </div>
        )}
      </div>

      {/* Bottom Information */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
          <CalendarDays size={14} strokeWidth={1.8} className="text-[#9A7B4F]" />
          <span>
            {staff.eventsAssigned ?? 0}{" "}
            {(staff.eventsAssigned ?? 0) === 1 ? "Event" : "Events"} Assigned
          </span>
        </div>

        <span className="text-[11px] font-bold text-[#9A7B4F] group-hover:underline">
          View Profile & Schedule →
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
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
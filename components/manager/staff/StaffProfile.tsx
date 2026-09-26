"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  IndianRupee,
  User,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import StaffStatusBadge from "./StaffStatusBadge";
import StaffDetails from "./StaffDetails";
import StaffActions from "./StaffActions";
import { getAssignments } from "@/lib/assignment.api";
import type { Assignment } from "@/types/assignment";

import type {
  Staff,
  UpdateStaffPayload,
  ResetStaffPasswordResponse,
} from "@/types/staff";

interface StaffProfileProps {
  staff: Staff;
  token?: string;

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
  token = "",
  onStatusChange,
  onStaffUpdated,
  onPasswordReset,
}: StaffProfileProps) {
  const [activeTab, setActiveTab] = useState<"details" | "hours">("details");
  const [duties, setDuties] = useState<Assignment[]>([]);
  const [loadingDuties, setLoadingDuties] = useState(false);

  useEffect(() => {
    if (token && staff.id) {
      setLoadingDuties(true);
      getAssignments(token, { staff: staff.id, limit: 100 })
        .then((res) => setDuties(res.data || []))
        .catch((err) => console.warn("Could not fetch staff duty history", err))
        .finally(() => setLoadingDuties(false));
    }
  }, [token, staff.id]);

  const initials = getInitials(staff.name);

  // Compute stats
  let totalHours = 0;
  let totalEarnings = 0;
  let paidEarnings = 0;
  let pendingEarnings = 0;

  duties.forEach((d) => {
    let hours = d.totalHours || 0;
    if (!hours && d.startTime && d.endTime) {
      const [sH, sM] = d.startTime.split(":").map(Number);
      const [eH, eM] = d.endTime.split(":").map(Number);
      if (!isNaN(sH) && !isNaN(eH)) {
        let startMin = sH * 60 + (sM || 0);
        let endMin = eH * 60 + (eM || 0);
        if (endMin < startMin) endMin += 24 * 60;
        hours = Math.round(((endMin - startMin) / 60) * 100) / 100;
      }
    }
    const rate = d.hourlyRate || 0;
    const pay = d.totalAmount || hours * rate;
    totalHours += hours;
    totalEarnings += pay;
    if (d.paymentStatus === "PAID") paidEarnings += pay;
    else pendingEarnings += pay;
  });

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
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-5">
          {/* Events */}
          <div className="rounded-xl bg-[#F8F7F3] p-3 text-center">
            <CalendarDays
              size={17}
              className="mx-auto text-[#9A7B4F]"
              strokeWidth={1.8}
            />
            <p className="mt-1.5 text-lg font-semibold text-[#1F1F1F]">
              {staff.eventsAssigned ?? duties.length}
            </p>
            <p className="text-[10px] text-gray-500">Shifts Logged</p>
          </div>

          {/* Working Hours */}
          <div className="rounded-xl bg-[#F8F7F3] p-3 text-center">
            <Clock
              size={17}
              className="mx-auto text-amber-700"
              strokeWidth={1.8}
            />
            <p className="mt-1.5 text-lg font-semibold text-[#1F1F1F]">
              {totalHours.toFixed(1)} <span className="text-xs font-normal">hrs</span>
            </p>
            <p className="text-[10px] text-gray-500">Total Hours</p>
          </div>

          {/* Total Earnings */}
          <div className="rounded-xl bg-emerald-50/60 p-3 text-center">
            <IndianRupee
              size={17}
              className="mx-auto text-emerald-700"
              strokeWidth={1.8}
            />
            <p className="mt-1.5 text-lg font-bold text-emerald-900">
              ₹{totalEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-emerald-700">Total Compensation</p>
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
              {staff.isActive ? "Active" : "Off"}
            </p>
            <p className="text-[10px] text-gray-500">Account Status</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-gray-200 bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
            activeTab === "details"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Staff Profile & Settings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hours")}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
            activeTab === "hours"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Working Hours & Payment History ({duties.length})
        </button>
      </div>

      {activeTab === "details" ? (
        <>
          {/* Staff Details */}
          <StaffDetails staff={staff} />

          {/* Staff Actions */}
          <StaffActions
            staff={staff}
            onStatusChange={onStatusChange}
            onStaffUpdated={onStaffUpdated}
            onPasswordReset={onPasswordReset}
          />
        </>
      ) : (
        /* Working Hours & Payment Breakdown */
        <section className="space-y-4">
          {loadingDuties ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#9A7B4F]" />
              <p className="mt-2 text-xs text-gray-500">Loading duty history and timesheets...</p>
            </div>
          ) : duties.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <Clock size={28} className="mx-auto text-gray-300" />
              <p className="mt-2 text-xs font-bold text-gray-700">No duty shifts assigned yet</p>
              <p className="mt-1 text-[11px] text-gray-400">Assigned event shifts and covered duties will appear here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-100 bg-[#faf8f5] text-[11px] font-bold text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Event & Venue</th>
                      <th className="px-4 py-3">Duty Covered</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3 text-right">Rate & Pay</th>
                      <th className="px-4 py-3 text-center">Shift Status</th>
                      <th className="px-4 py-3 text-center">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {duties.map((duty) => {
                      const eventObj = typeof duty.event === "string" ? null : duty.event;
                      const eventName = eventObj?.eventName || "Event Shift";
                      const location = eventObj?.location || "";

                      let hours = duty.totalHours || 0;
                      if (!hours && duty.startTime && duty.endTime) {
                        const [sH, sM] = duty.startTime.split(":").map(Number);
                        const [eH, eM] = duty.endTime.split(":").map(Number);
                        if (!isNaN(sH) && !isNaN(eH)) {
                          let startMin = sH * 60 + (sM || 0);
                          let endMin = eH * 60 + (eM || 0);
                          if (endMin < startMin) endMin += 24 * 60;
                          hours = Math.round(((endMin - startMin) / 60) * 100) / 100;
                        }
                      }
                      const rate = duty.hourlyRate || 0;
                      const pay = duty.totalAmount || hours * rate;

                      return (
                        <tr key={duty._id} className="hover:bg-gray-50/60">
                          <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                            {duty.dutyDate?.slice(0, 10)}
                            <div className="text-[10px] text-gray-400 font-normal">
                              {duty.startTime} - {duty.endTime}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900">{eventName}</p>
                            {location && <p className="text-[10px] text-gray-500">{location}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800">{duty.dutyTitle}</p>
                            {duty.department && (
                              <span className="text-[10px] text-[#9A7B4F]">{duty.department}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                            {hours} hrs
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <p className="font-bold text-gray-900">₹{pay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                            <p className="text-[10px] text-gray-500">@ ₹{rate.toFixed(2)}/hr</p>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                duty.status === "ACCEPTED"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : duty.status === "ASSIGNED"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : duty.status === "REJECTED"
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {duty.status === "ACCEPTED" ? "Confirmed" : duty.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                duty.paymentStatus === "PAID"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {duty.paymentStatus === "PAID" ? "PAID" : "PENDING"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
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
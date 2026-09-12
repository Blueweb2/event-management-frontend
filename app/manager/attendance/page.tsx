"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  UserCheck,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import type { Attendance } from "@/types/attendance";

export default function ManagerAttendancePage() {
  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  });

  const {
    attendance,
    loading,
    error,
    fetchAttendance,
  } = useAttendance({
    token,
    autoFetch: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRecords = (attendance || []).filter((r: Attendance) => {
    const staffName =
      typeof r.staff === "object" && r.staff !== null
        ? r.staff.name || ""
        : "";
    const matchesSearch = staffName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || r.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/manager"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#9A7B4F] hover:underline"
          >
            <ArrowLeft size={13} />
            Back to Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1F1F1F]">
            Staff Attendance
          </h1>
          <p className="text-sm text-gray-500">
            Monitor daily staff check-ins, punctuality, and event shifts.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search staff name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#9A7B4F] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PRESENT", "LATE", "ABSENT"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-[#9A7B4F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          Loading attendance records...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <UserCheck className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-700">
            No attendance records found
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Records will appear here once staff members check into their assigned shifts.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {filteredRecords.map((item: Attendance) => {
              const staffName =
                typeof item.staff === "object" && item.staff
                  ? item.staff.name
                  : "Staff";
              const dateStr = item.date
                ? new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Date N/A";

              return (
                <div
                  key={item._id}
                  className="flex flex-col gap-3 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EBDD] font-bold text-[#9A7B4F]">
                      {staffName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {staffName}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {dateStr}
                        </span>
                        {item.checkIn && (
                          <span className="flex items-center gap-1">
                            <Clock3 size={12} />
                            In: {new Date(item.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        {item.checkOut && (
                          <span className="flex items-center gap-1">
                            Out: {new Date(item.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "LATE"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

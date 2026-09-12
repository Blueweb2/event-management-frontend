"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";

export default function ManagerAvailabilityPage() {
  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  });

  const {
    availability,
    loading,
    error,
  } = useAvailability({
    token,
    autoFetch: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredAvailability = availability.filter((item) => {
    const staffName =
      typeof item.staff === "object" && item.staff !== null
        ? item.staff.name || ""
        : "";
    const matchesSearch = staffName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || item.status.toUpperCase() === statusFilter;
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
            Staff Availability
          </h1>
          <p className="text-sm text-gray-500">
            Check staff schedules and working availability before assigning events.
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
            placeholder="Search staff availability..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-[#9A7B4F] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "AVAILABLE", "UNAVAILABLE"].map((st) => (
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
          Loading staff availability...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      ) : filteredAvailability.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-700">
            No availability records submitted yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Staff availability records for upcoming shifts will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAvailability.map((item) => {
            const staffName =
              typeof item.staff === "object" && item.staff
                ? item.staff.name
                : "Staff Member";
            const dateStr = item.date
              ? new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date N/A";

            const isAvailable = item.status.toUpperCase() === "AVAILABLE";

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {staffName}
                    </h3>
                    <p className="text-xs text-gray-500">{dateStr}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {isAvailable ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {item.status}
                  </span>
                </div>

                {item.startTime && item.endTime && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock3 size={13} className="text-[#9A7B4F]" />
                    <span>
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                )}

                {item.notes && (
                  <p className="mt-2 text-xs text-gray-400 italic">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

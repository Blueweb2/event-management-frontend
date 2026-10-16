"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
  X,
  AlertTriangle,
  Briefcase,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";
import {
  deleteAvailability,
  getAvailability,
  setAvailability,
} from "@/lib/availability.api";
import { getAssignments } from "@/lib/assignment.api";
import { formatTime24to12 } from "@/lib/time-utils";
import type { Availability, AvailabilityStatus } from "@/types/availability";
import type { Assignment } from "@/types/assignment";

const localToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value)
  );

interface StaffAvailabilityTabProps {
  initialDate?: string;
  initialStaffId?: string;
}

export default function StaffAvailabilityTab({
  initialDate,
  initialStaffId,
}: StaffAvailabilityTabProps) {
  const { token } = useAuth();
  const { staff } = useStaff({ token, filters: { limit: 100 } });

  const [date, setDate] = useState(initialDate || localToday());
  const [availability, setAvailabilityState] = useState<Availability[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialStaffId ? "" : "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [employmentFilter, setEmploymentFilter] = useState<"ALL" | "part-time" | "regular">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const [availRes, assignRes] = await Promise.allSettled([
        getAvailability(token, { date, limit: 100 }),
        getAssignments(token, { dutyDate: date, limit: 100 }),
      ]);

      if (availRes.status === "fulfilled") {
        setAvailabilityState(availRes.value.data || []);
      } else {
        setError("Unable to load availability records.");
      }

      if (assignRes.status === "fulfilled") {
        setAssignments(assignRes.value.data || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load availability records."
      );
    } finally {
      setLoading(false);
    }
  }, [date, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const changeDateByDays = (delta: number) => {
    const curr = new Date(date);
    curr.setDate(curr.getDate() + delta);
    setDate(curr.toISOString().slice(0, 10));
  };

  // Map assignments by staff ID for conflict checking
  const assignmentsByStaff = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    assignments.forEach((assignment) => {
      if (assignment.status === "CANCELLED") return;
      const sId =
        typeof assignment.staff === "object" && assignment.staff !== null
          ? assignment.staff.id || (assignment.staff as any)._id
          : String(assignment.staff);
      if (sId) {
        const existing = map.get(sId) || [];
        existing.push(assignment);
        map.set(sId, existing);
      }
    });
    return map;
  }, [assignments]);

  // Combine explicit availability records with all active staff members
  const fullRoster = useMemo(() => {
    const list: Array<Availability & { isExplicit?: boolean; staffMemberObj?: any }> = [
      ...availability.map((a) => {
        const sObj = typeof a.staff === "object" && a.staff !== null ? a.staff : null;
        const matchedStaff = sObj
          ? staff.find((s) => s.id === sObj._id || s.id === sObj.id)
          : staff.find((s) => s.id === String(a.staff));
        return {
          ...a,
          isExplicit: true,
          staffMemberObj: matchedStaff,
        };
      }),
    ];

    const existingStaffIds = new Set(
      availability.map((item) =>
        typeof item.staff === "object" && item.staff !== null
          ? item.staff._id || (item.staff as any).id
          : String(item.staff)
      )
    );

    staff.forEach((s) => {
      if (s.isActive && !existingStaffIds.has(s.id)) {
        const isPartTime = s.employmentType === "part-time";
        list.push({
          _id: `virtual-${s.id}`,
          staff: {
            _id: s.id,
            id: s.id,
            name: s.name,
            username: s.username || s.name,
            email: s.email,
            employeeId: s.employeeId || s.id,
            department: s.department || "General Staff",
            phone: s.phone,
          },
          date,
          status: "AVAILABLE",
          startTime: "09:00",
          endTime: "18:00",
          notes: isPartTime ? "Available (Default)" : "Regular schedule (Available by default)",
          createdAt: date,
          updatedAt: date,
          isExplicit: false,
          staffMemberObj: s,
        });
      }
    });

    return list;
  }, [availability, staff, date]);

  const filteredAvailability = useMemo(() => {
    return fullRoster.filter((item) => {
      const staffObj = typeof item.staff === "object" && item.staff !== null ? item.staff : null;
      const staffName = staffObj?.name || "";
      const department = staffObj?.department || "";
      const matchesSearch =
        staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || item.status.toUpperCase() === statusFilter;

      const isPartTime = item.staffMemberObj?.employmentType === "part-time";
      let matchesEmployment = true;
      if (employmentFilter === "part-time") matchesEmployment = isPartTime;
      else if (employmentFilter === "regular") matchesEmployment = !isPartTime;

      return matchesSearch && matchesStatus && matchesEmployment;
    });
  }, [fullRoster, searchTerm, statusFilter, employmentFilter]);

  const counts = useMemo(() => {
    const available = fullRoster.filter((i) => i.status === "AVAILABLE").length;
    const leave = fullRoster.filter((i) => i.status === "ON_LEAVE").length;
    const unavailable = fullRoster.filter((i) => i.status === "UNAVAILABLE").length;
    const total = fullRoster.length;
    return { available, leave, unavailable, total };
  }, [fullRoster]);

  const handleQuickSetStatus = async (
    staffId: string,
    newStatus: AvailabilityStatus
  ) => {
    if (!token) return;
    try {
      setActionLoadingId(staffId);
      const isLeave = newStatus === "ON_LEAVE";
      await setAvailability(
        {
          staff: staffId,
          date,
          status: newStatus,
          startTime: newStatus === "AVAILABLE" ? "09:00" : "",
          endTime: newStatus === "AVAILABLE" ? "18:00" : "",
          notes: isLeave ? "Leave recorded by Manager" : `Set to ${newStatus.replace("_", " ")} by Manager`,
        },
        token
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteAvailability(id, token);
      setAvailabilityState((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record.");
    }
  };

  // CSV Exporter for Manager Availability Roster
  const exportAvailabilityCSV = () => {
    if (filteredAvailability.length === 0) return;
    const headers = [
      "Date",
      "Staff Name",
      "Employment Type",
      "Department",
      "Status",
      "Working Hours",
      "Assigned Duty Conflict",
      "Notes / Reason",
    ];

    const rows = filteredAvailability.map((item) => {
      const staffObj = typeof item.staff === "object" ? item.staff : null;
      const sId = staffObj?._id || (staffObj as any)?.id;
      const assignedDuties = sId ? assignmentsByStaff.get(sId) || [] : [];
      const dutySummary = assignedDuties
        .map((d) => `${d.dutyTitle} (${d.startTime || ""}-${d.endTime || ""})`)
        .join("; ");

      return [
        `"${date}"`,
        `"${(staffObj?.name || "Staff").replace(/"/g, '""')}"`,
        `"${item.staffMemberObj?.employmentType || "Regular"}"`,
        `"${(staffObj?.department || "General").replace(/"/g, '""')}"`,
        `"${item.status}"`,
        `"${item.startTime && item.endTime ? `${formatTime24to12(item.startTime)} - ${formatTime24to12(item.endTime)}` : "N/A"}"`,
        `"${dutySummary.replace(/"/g, '""') || "None"}"`,
        `"${(item.notes || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_availability_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1F1F1F] sm:text-xl">
            Staff Availability & Leave Hub
          </h2>
          <p className="text-xs text-gray-500">
            Monitor working availability, part-time schedules, regular staff leave requests, and avoid dispatch conflicts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportAvailabilityCSV}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 active:scale-95"
          >
            <Download size={14} className="text-[#9A7B4F]" />
            <span>Export Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#9A7B4F] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#80653e] active:scale-95"
          >
            <Plus size={15} />
            <span>Set Availability / Leave</span>
          </button>
        </div>
      </div>

      {/* Date Navigator, Search & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Date Navigator */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => changeDateByDays(-1)}
            title="Previous Day"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-900 focus:border-[#9A7B4F] focus:outline-none"
          />

          <button
            type="button"
            onClick={() => changeDateByDays(1)}
            title="Next Day"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => setDate(localToday())}
            className="h-9 rounded-xl border border-gray-200 bg-gray-50 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 active:scale-95"
          >
            Today
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search staff or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#9A7B4F] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Employment Type & Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Employment Type Toggle */}
          <div className="flex items-center rounded-xl bg-gray-100 p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setEmploymentFilter("ALL")}
              className={`rounded-lg px-2.5 py-1 transition ${
                employmentFilter === "ALL"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setEmploymentFilter("part-time")}
              className={`rounded-lg px-2.5 py-1 transition ${
                employmentFilter === "part-time"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Part-Time
            </button>
            <button
              type="button"
              onClick={() => setEmploymentFilter("regular")}
              className={`rounded-lg px-2.5 py-1 transition ${
                employmentFilter === "regular"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Full-Time
            </button>
          </div>

          {/* Status Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {["ALL", "AVAILABLE", "ON_LEAVE", "UNAVAILABLE"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-[#9A7B4F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Summary label="Total Roster" value={counts.total} tone="gray" />
        <Summary label="Available" value={counts.available} tone="green" />
        <Summary label="On Leave" value={counts.leave} tone="gold" />
        <Summary label="Unavailable" value={counts.unavailable} tone="red" />
      </section>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={26} className="animate-spin text-[#9A7B4F]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-600">
          {error}
        </div>
      ) : filteredAvailability.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-700">
            No availability records for {formatDate(date)}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Staff availability or leave requests for this date will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAvailability.map((item) => {
            const staffObj = typeof item.staff === "object" ? item.staff : null;
            const staffId = staffObj?._id || (staffObj as any)?.id;
            const staffName = staffObj?.name || "Staff Member";
            const department = staffObj?.department || "General Staff";
            const empType = item.staffMemberObj?.employmentType || "full-time";
            const isPartTime = empType === "part-time";

            const isAvailable = item.status === "AVAILABLE";
            const isOnLeave = item.status === "ON_LEAVE";

            const assignedDuties = staffId ? assignmentsByStaff.get(staffId) || [] : [];
            const hasConflict = !isAvailable && assignedDuties.length > 0;

            return (
              <div
                key={item._id}
                className={`rounded-2xl border bg-white p-4 shadow-xs transition hover:shadow-sm flex flex-col justify-between ${
                  hasConflict ? "border-rose-300 bg-rose-50/20" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/manager/staff/${staffId}`}
                        className="text-sm font-bold text-gray-900 hover:text-[#9A7B4F] hover:underline truncate block"
                      >
                        {staffName}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {department}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span
                          className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                            isPartTime
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {isPartTime ? "Part-time" : "Regular"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                        isAvailable
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isOnLeave
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {isAvailable ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <XCircle size={11} />
                      )}
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Conflict Alert Banner */}
                  {hasConflict && (
                    <div className="mt-2.5 flex items-start gap-1.5 rounded-xl border border-rose-200 bg-rose-50 p-2 text-[10px] font-semibold text-rose-800">
                      <AlertTriangle size={13} className="shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <span>Conflict: Marked {item.status.replace("_", " ")} but assigned to {assignedDuties.length} duty shift{assignedDuties.length > 1 ? "s" : ""}!</span>
                      </div>
                    </div>
                  )}

                  {/* Active Duty Indicator */}
                  {!hasConflict && assignedDuties.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-amber-50/70 border border-amber-200/60 p-1.5 text-[10px] font-medium text-amber-900">
                      <Briefcase size={12} className="text-[#9A7B4F] shrink-0" />
                      <span className="truncate">
                        Assigned: {assignedDuties[0].dutyTitle}
                        {assignedDuties.length > 1 && ` (+${assignedDuties.length - 1} more)`}
                      </span>
                    </div>
                  )}

                  {item.startTime && item.endTime && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <Clock3 size={13} className="text-[#9A7B4F]" />
                      <span>
                        {formatTime24to12(item.startTime)} - {formatTime24to12(item.endTime)}
                      </span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="mt-2 flex items-start gap-1 rounded-xl bg-gray-50 p-2 text-[11px] text-gray-600 italic">
                      <FileText size={12} className="mt-0.5 shrink-0 text-[#9A7B4F]" />
                      <span>&ldquo;{item.notes}&rdquo;</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Date: {date}</span>
                    {item.isExplicit && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        title="Delete custom override record"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Quick Status Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      disabled={actionLoadingId === staffId}
                      onClick={() => handleQuickSetStatus(staffId, "AVAILABLE")}
                      className={`flex-1 rounded-lg py-1 px-1.5 text-[10px] font-bold border transition ${
                        isAvailable
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      Available
                    </button>

                    <button
                      type="button"
                      disabled={actionLoadingId === staffId}
                      onClick={() => handleQuickSetStatus(staffId, "ON_LEAVE")}
                      className={`flex-1 rounded-lg py-1 px-1.5 text-[10px] font-bold border transition ${
                        isOnLeave
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      On Leave
                    </button>

                    <button
                      type="button"
                      disabled={actionLoadingId === staffId}
                      onClick={() => handleQuickSetStatus(staffId, "UNAVAILABLE")}
                      className={`flex-1 rounded-lg py-1 px-1.5 text-[10px] font-bold border transition ${
                        item.status === "UNAVAILABLE"
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-rose-50 hover:text-rose-700"
                      }`}
                    >
                      Unavailable
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Staff Availability Modal */}
      {modalOpen && (
        <AddAvailabilityModal
          staffList={staff.filter((s) => s.isActive)}
          initialDate={date}
          token={token || ""}
          onClose={() => setModalOpen(false)}
          onSuccess={async () => {
            setModalOpen(false);
            await loadData();
          }}
        />
      )}
    </div>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "gold" | "red" | "gray";
}) {
  const styles = {
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    gold: "border-amber-100 bg-amber-50 text-amber-700",
    red: "border-red-100 bg-red-50 text-red-700",
    gray: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs transition hover:shadow-sm sm:p-4">
      <span
        className={`inline-flex rounded-lg border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[tone]}`}
      >
        {label}
      </span>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-gray-400">Records on date</p>
    </div>
  );
}

function AddAvailabilityModal({
  staffList,
  initialDate,
  token,
  onClose,
  onSuccess,
}: {
  staffList: Array<{ id: string; name: string; department?: string; employmentType?: string }>;
  initialDate: string;
  token: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [staffId, setStaffId] = useState("");
  const [targetDate, setTargetDate] = useState(initialDate);
  const [status, setStatus] = useState<AvailabilityStatus>("AVAILABLE");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedStaffObj = staffList.find((s) => s.id === staffId);
  const isPartTime = selectedStaffObj?.employmentType === "part-time";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) {
      setError("Please select a staff member.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await setAvailability(
        {
          staff: staffId,
          date: targetDate,
          status,
          startTime: status === "AVAILABLE" ? startTime : "",
          endTime: status === "AVAILABLE" ? endTime : "",
          notes: notes.trim(),
        },
        token
      );
      await onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save availability."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Set Availability or Leave Request
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Assign working availability slots or record leave for staff.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          {error && (
            <p className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 border border-red-100 font-medium">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Select Staff Member
            </label>
            <select
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="mt-1 h-9.5 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 focus:border-[#9A7B4F] focus:outline-none"
            >
              <option value="">Select staff member</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.department ? `(${s.department})` : ""} · {s.employmentType || "regular"}
                </option>
              ))}
            </select>
            {selectedStaffObj && (
              <p className="mt-1 text-[11px] text-gray-500">
                {isPartTime ? (
                  <span className="text-sky-700 font-medium">
                    ✦ Part-time staff: Specify working hours availability below.
                  </span>
                ) : (
                  <span className="text-purple-700 font-medium">
                    ✦ Regular staff: Select &ldquo;On Leave&rdquo; or custom working hours override.
                  </span>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Target Date
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1 h-9.5 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AvailabilityStatus)}
              className="mt-1 h-9.5 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 focus:border-[#9A7B4F] focus:outline-none"
            >
              <option value="AVAILABLE">AVAILABLE 🟢</option>
              <option value="ON_LEAVE">ON LEAVE (Leave Request) 🟡</option>
              <option value="UNAVAILABLE">UNAVAILABLE 🔴</option>
            </select>
          </div>

          {status === "AVAILABLE" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Start Time
                  {startTime && (
                    <span className="ml-1.5 font-normal text-[#9A7B4F]">
                      ({formatTime24to12(startTime)})
                    </span>
                  )}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 h-9.5 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  End Time
                  {endTime && (
                    <span className="ml-1.5 font-normal text-[#9A7B4F]">
                      ({formatTime24to12(endTime)})
                    </span>
                  )}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 h-9.5 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              {status === "ON_LEAVE" ? "Leave Reason / Manager Notes" : "Notes / Override Details"}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={status === "ON_LEAVE" ? "Reason for leave request or manager approval notes..." : "Add availability or shift notes..."}
              className="mt-1 w-full rounded-xl border border-gray-200 p-2 text-xs outline-none focus:border-[#9A7B4F]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9.5 rounded-xl border border-gray-200 px-4 text-xs font-semibold text-gray-600 hover:bg-gray-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9.5 rounded-xl bg-[#9A7B4F] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#80653e] disabled:opacity-50 active:scale-95"
            >
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

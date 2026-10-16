"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Download,
  ExternalLink,
  MapPin,
  Search,
  User,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Building2,
  RotateCw,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";
import { useAssignments } from "@/hooks/useAssignments";
import { formatTime24to12 } from "@/lib/time-utils";
import { calculateHoursFromTime } from "@/lib/duty-mapper";
import type { Assignment, AssignmentStatus } from "@/types/assignment";

interface StaffAssignmentsTabProps {
  initialStaffId?: string;
}

export default function StaffAssignmentsTab({
  initialStaffId,
}: StaffAssignmentsTabProps) {
  const { token } = useAuth();
  const { staff } = useStaff({ token, filters: { limit: 100 } });
  const {
    assignments,
    loading,
    error,
    fetchAllAssignments,
  } = useAssignments({ token, autoFetch: true });

  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(initialStaffId || "ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AssignmentStatus>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Conflict Detection: identify if a staff member has overlapping duties
  const conflictsMap = useMemo(() => {
    const map = new Map<string, string[]>();

    // Group by staff and date
    const staffDateMap = new Map<string, Assignment[]>();

    assignments.forEach((a) => {
      if (a.status === "CANCELLED") return;
      const sId = typeof a.staff === "object" && a.staff !== null ? a.staff.id || (a.staff as any)._id : String(a.staff);
      const dDate = a.dutyDate ? a.dutyDate.slice(0, 10) : "";
      if (!sId || !dDate) return;

      const key = `${sId}_${dDate}`;
      const list = staffDateMap.get(key) || [];
      list.push(a);
      staffDateMap.set(key, list);
    });

    // For each staff-date group with >= 2 duties, check time overlaps
    staffDateMap.forEach((dutiesList) => {
      if (dutiesList.length < 2) return;

      for (let i = 0; i < dutiesList.length; i++) {
        for (let j = i + 1; j < dutiesList.length; j++) {
          const a = dutiesList[i];
          const b = dutiesList[j];

          // Check if time ranges overlap
          if (a.startTime && a.endTime && b.startTime && b.endTime) {
            const aStart = a.startTime;
            const aEnd = a.endTime;
            const bStart = b.startTime;
            const bEnd = b.endTime;

            if (aStart < bEnd && bStart < aEnd) {
              const aConflicts = map.get(a._id) || [];
              aConflicts.push(`Overlaps with "${b.dutyTitle}" (${formatTime24to12(bStart)} - ${formatTime24to12(bEnd)})`);
              map.set(a._id, aConflicts);

              const bConflicts = map.get(b._id) || [];
              bConflicts.push(`Overlaps with "${a.dutyTitle}" (${formatTime24to12(aStart)} - ${formatTime24to12(aEnd)})`);
              map.set(b._id, bConflicts);
            }
          }
        }
      }
    });

    return map;
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    const q = search.trim().toLowerCase();

    return assignments.filter((a) => {
      const sObj = typeof a.staff === "object" && a.staff !== null ? a.staff : null;
      const staffName = sObj?.name || "";
      const sId = sObj?.id || (sObj as any)?._id || String(a.staff);

      const evObj = typeof a.event === "object" && a.event !== null ? a.event : null;
      const eventName = evObj?.eventName || "";
      const location = evObj?.location || "";

      const dutyDate = a.dutyDate ? a.dutyDate.slice(0, 10) : "";

      if (selectedStaffId !== "ALL" && sId !== selectedStaffId) {
        return false;
      }

      if (statusFilter !== "ALL" && a.status !== statusFilter) {
        return false;
      }

      if (startDate && dutyDate < startDate) {
        return false;
      }

      if (endDate && dutyDate > endDate) {
        return false;
      }

      if (q) {
        const matches =
          a.dutyTitle.toLowerCase().includes(q) ||
          eventName.toLowerCase().includes(q) ||
          staffName.toLowerCase().includes(q) ||
          location.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [assignments, selectedStaffId, statusFilter, startDate, endDate, search]);

  // Counts
  const counts = useMemo(() => {
    const total = assignments.length;
    const assigned = assignments.filter((a) => a.status === "ASSIGNED").length;
    const accepted = assignments.filter((a) => a.status === "ACCEPTED").length;
    const inProgress = assignments.filter((a) => a.status === "IN_PROGRESS").length;
    const completed = assignments.filter((a) => a.status === "COMPLETED").length;
    return { total, assigned, accepted, inProgress, completed };
  }, [assignments]);

  // Export CSV
  const exportCSV = () => {
    if (filteredAssignments.length === 0) return;
    const headers = [
      "Staff Name",
      "Duty Title",
      "Event Name",
      "Event Date",
      "Scheduled Hours",
      "Duration (hrs)",
      "Hourly Rate (INR)",
      "Total Pay (INR)",
      "Status",
      "Payment Status",
      "Conflict Notes",
    ];

    const rows = filteredAssignments.map((a) => {
      const sObj = typeof a.staff === "object" && a.staff !== null ? a.staff : null;
      const evObj = typeof a.event === "object" && a.event !== null ? a.event : null;
      const hours = a.totalHours || calculateHoursFromTime(a.startTime, a.endTime);
      const rate = a.hourlyRate || 0;
      const pay = a.totalAmount || hours * rate;
      const conflicts = conflictsMap.get(a._id) || [];

      return [
        `"${(sObj?.name || "Staff").replace(/"/g, '""')}"`,
        `"${a.dutyTitle.replace(/"/g, '""')}"`,
        `"${(evObj?.eventName || "Assigned Event").replace(/"/g, '""')}"`,
        `"${a.dutyDate ? a.dutyDate.slice(0, 10) : ""}"`,
        `"${a.startTime && a.endTime ? `${formatTime24to12(a.startTime)} - ${formatTime24to12(a.endTime)}` : ""}"`,
        hours,
        rate,
        pay,
        `"${a.status}"`,
        `"${a.paymentStatus || "PENDING"}"`,
        `"${conflicts.join("; ").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `staff_assignments_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1F1F1F] sm:text-xl">
            Staff Assignments & Shift Scheduling
          </h2>
          <p className="text-xs text-gray-500">
            View assigned shifts by staff member, detect overlapping schedule conflicts, and jump to operational duty management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 active:scale-95"
          >
            <Download size={14} className="text-[#9A7B4F]" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/manager/staff?tab=payroll"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#9A7B4F] px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#80653e] active:scale-95"
          >
            <IndianRupee size={14} />
            <span>Hours & Payroll</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Shifts" value={counts.total} tone="gray" />
        <SummaryCard label="Pending Acceptance" value={counts.assigned} tone="gold" />
        <SummaryCard label="Confirmed & Active" value={counts.accepted + counts.inProgress} tone="green" />
        <SummaryCard label="Completed" value={counts.completed} tone="blue" />
      </section>

      {/* Filter Toolbar */}
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs space-y-2">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search duty title, event, staff, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 text-xs focus:border-[#9A7B4F] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Staff Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800 focus:border-[#9A7B4F] focus:outline-none"
            >
              <option value="ALL">All Staff Members</option>
              {staff
                .filter((s) => s.isActive)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.department || "Staff"})
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={() => void fetchAllAssignments()}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95"
              title="Refresh Assignments"
            >
              <RotateCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Second Row: Status Filter & Date Range */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-100">
          {/* Status Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(["ALL", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-2.5 py-1 text-[10px] font-bold transition whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-[#9A7B4F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 px-2 text-[11px] focus:outline-none focus:border-[#9A7B4F]"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 px-2 text-[11px] focus:outline-none focus:border-[#9A7B4F]"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[10px] font-bold text-red-600 hover:underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      {filteredAssignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-700">
            No staff assignments found
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Try adjusting your search criteria, staff selector, or status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment) => {
            const staffObj = typeof assignment.staff === "object" && assignment.staff !== null ? assignment.staff : null;
            const staffId = staffObj?.id || (staffObj as any)?._id;
            const staffName = staffObj?.name || "Staff Member";
            const department = staffObj?.department || "General Staff";

            const eventObj = typeof assignment.event === "object" && assignment.event !== null ? assignment.event : null;
            const eventName = eventObj?.eventName || "Assigned Event";
            const location = eventObj?.location || "";

            const hours = assignment.totalHours || calculateHoursFromTime(assignment.startTime, assignment.endTime);
            const rate = assignment.hourlyRate || 0;
            const pay = assignment.totalAmount || hours * rate;

            const conflicts = conflictsMap.get(assignment._id) || [];
            const hasConflict = conflicts.length > 0;

            return (
              <div
                key={assignment._id}
                className={`rounded-2xl border bg-white p-4 shadow-xs transition hover:shadow-sm flex flex-col justify-between ${
                  hasConflict ? "border-amber-300 bg-amber-50/20" : "border-gray-200"
                }`}
              >
                <div>
                  {/* Top Bar: Staff Info and Status Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] font-bold text-xs text-[#9A7B4F]">
                        {staffName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        {staffId ? (
                          <Link
                            href={`/manager/staff/${staffId}`}
                            className="text-xs font-bold text-gray-900 hover:text-[#9A7B4F] hover:underline truncate block"
                          >
                            {staffName}
                          </Link>
                        ) : (
                          <p className="text-xs font-bold text-gray-900 truncate">{staffName}</p>
                        )}
                        <p className="text-[10px] text-gray-500 truncate">{department}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border shrink-0 ${
                        assignment.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : assignment.status === "IN_PROGRESS"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : assignment.status === "ACCEPTED"
                          ? "bg-teal-50 text-teal-800 border-teal-200"
                          : assignment.status === "ASSIGNED"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {assignment.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Conflict Warning */}
                  {hasConflict && (
                    <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-900 font-medium space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-amber-950">
                        <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                        <span>Schedule Conflict Detected</span>
                      </div>
                      {conflicts.map((c, idx) => (
                        <p key={idx} className="pl-4 text-[10px] text-amber-800">
                          {c}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Duty & Event Info */}
                  <div className="mt-3 space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {assignment.dutyTitle}
                    </h4>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-[#9A7B4F]">
                      <span className="truncate">✦ {eventName}</span>
                    </div>

                    {location && (
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <MapPin size={11} className="shrink-0 text-gray-400" />
                        <span className="truncate">{location}</span>
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-gray-800">
                        <Calendar size={12} className="text-[#9A7B4F]" />
                        {assignment.dutyDate ? assignment.dutyDate.slice(0, 10) : "TBD"}
                      </span>

                      {assignment.startTime && assignment.endTime && (
                        <span className="flex items-center gap-1">
                          <Clock3 size={12} className="text-gray-400" />
                          {formatTime24to12(assignment.startTime)} - {formatTime24to12(assignment.endTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Pay & Quick Action */}
                <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      ₹{pay.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {hours} hrs @ ₹{rate}/hr
                    </p>
                  </div>

                  {staffId ? (
                    <Link
                      href={`/manager/staff/${staffId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A7B4F] hover:underline"
                    >
                      <span>Staff Profile</span>
                      <ExternalLink size={11} />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gray" | "gold" | "green" | "blue";
}) {
  const styles = {
    gray: "border-gray-200 bg-gray-50 text-gray-600",
    gold: "border-amber-100 bg-amber-50 text-amber-700",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    blue: "border-sky-100 bg-sky-50 text-sky-700",
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
      <p className="mt-0.5 text-[10px] text-gray-400">Assignments logged</p>
    </div>
  );
}

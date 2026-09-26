"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  FileText,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import {
  checkIn,
  checkOut,
  getAttendance,
  markAbsent,
  updateAttendance,
} from "@/lib/attendance.api";
import type { Assignment } from "@/types/assignment";
import type { Attendance, AttendanceStatus } from "@/types/attendance";

const localToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value)
  );

const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(
        new Date(value)
      )
    : "--";

export default function ManagerAttendancePage() {
  const { token } = useAuth();
  const [date, setDate] = useState(localToday());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    AttendanceStatus | "UNRECORDED" | "ALL"
  >("ALL");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<{
    assignment: Assignment;
    record?: Attendance;
  } | null>(null);
  const [error, setError] = useState("");

  const loadAttendance = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const [assignmentResult, attendanceResult] = await Promise.all([
        getAssignments(token, { dutyDate: date, page: 1, limit: 100 }),
        getAttendance(token, { date, page: 1, limit: 100 }),
      ]);
      setAssignments(assignmentResult.data || []);
      setAttendance(attendanceResult.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, [date, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAttendance(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAttendance]);

  const changeDateByDays = (delta: number) => {
    const curr = new Date(date);
    curr.setDate(curr.getDate() + delta);
    setDate(curr.toISOString().slice(0, 10));
  };

  const attendanceByDuty = useMemo(
    () =>
      new Map(
        attendance.map((item) => [
          typeof item.duty === "string" ? item.duty : item.duty._id,
          item,
        ])
      ),
    [attendance]
  );

  const rows = useMemo(
    () =>
      assignments
        .map((assignment) => ({
          assignment,
          record: attendanceByDuty.get(assignment._id),
        }))
        .filter(({ assignment, record }) => {
          const event =
            typeof assignment.event === "string"
              ? ""
              : assignment.event.eventName;
          const staff =
            typeof assignment.staff === "string" ? "" : assignment.staff.name;
          const query = search.trim().toLowerCase();
          const matchesSearch =
            !query ||
            assignment.dutyTitle.toLowerCase().includes(query) ||
            event.toLowerCase().includes(query) ||
            staff.toLowerCase().includes(query);
          const currentStatus = record?.status || "UNRECORDED";
          return (
            matchesSearch && (status === "ALL" || currentStatus === status)
          );
        }),
    [assignments, attendanceByDuty, search, status]
  );

  const counts = useMemo(() => {
    const present = attendance.filter((item) => item.status === "PRESENT").length;
    const late = attendance.filter((item) => item.status === "LATE").length;
    const absent = attendance.filter((item) => item.status === "ABSENT").length;
    const unrecorded = Math.max(assignments.length - attendance.length, 0);
    const total = assignments.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { present, late, absent, unrecorded, total, rate };
  }, [assignments.length, attendance]);

  const runAction = async (
    assignment: Assignment,
    action: "in" | "out" | "absent"
  ) => {
    if (!token || actionId) return;
    try {
      setActionId(assignment._id);
      setError("");
      if (action === "in") await checkIn({ duty: assignment._id }, token);
      if (action === "out") await checkOut({ duty: assignment._id }, token);
      if (action === "absent") await markAbsent({ duty: assignment._id }, token);
      await loadAttendance();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Attendance update failed."
      );
    } finally {
      setActionId(null);
    }
  };

  // CSV Exporter for Attendance
  const exportAttendanceCSV = () => {
    if (rows.length === 0) return;
    const headers = [
      "Date",
      "Staff Name",
      "Duty Title",
      "Event Name",
      "Scheduled Hours",
      "Check-In Time",
      "Check-Out Time",
      "Status",
      "Staff Notes / GPS",
      "Marked By",
    ];

    const csvRows = rows.map(({ assignment, record }) => {
      const staff =
        typeof assignment.staff === "string" ? "" : assignment.staff.name;
      const event =
        typeof assignment.event === "string"
          ? ""
          : assignment.event.eventName;
      const markedBy =
        record?.markedBy && typeof record.markedBy === "object"
          ? record.markedBy.name
          : "System / Self";

      return [
        `"${date}"`,
        `"${staff.replace(/"/g, '""')}"`,
        `"${assignment.dutyTitle.replace(/"/g, '""')}"`,
        `"${event.replace(/"/g, '""')}"`,
        `"${assignment.startTime} - ${assignment.endTime}"`,
        `"${record?.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "--"}"`,
        `"${record?.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "--"}"`,
        `"${record?.status || "UNRECORDED"}"`,
        `"${(record?.notes || "").replace(/"/g, '""')}"`,
        `"${markedBy}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="space-y-6 py-5 sm:space-y-7 sm:py-6">
      {/* Top Header */}
      <header className="flex flex-col gap-4 border-b border-[#e8e1d8] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/manager"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A7B4F] hover:underline"
          >
            ← Manager Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
            Staff Attendance Hub
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Real-time daily attendance monitoring, staff GPS notes, and manual overrides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportAttendanceCSV}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Download size={15} className="text-[#9A7B4F]" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => void loadAttendance()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1F1F1F] px-4 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            <CalendarDays size={15} />
            Refresh Roster
          </button>
        </div>
      </header>

      {/* Date Navigation & Search Controls */}
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Date Navigator */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => changeDateByDays(-1)}
            title="Previous Day"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
          </button>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-900 focus:border-[#9A7B4F] focus:outline-none"
          />

          <button
            type="button"
            onClick={() => changeDateByDays(1)}
            title="Next Day"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => setDate(localToday())}
            className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100"
          >
            Today
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search staff name, duty title, or event..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-xs focus:border-[#9A7B4F] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 overflow-x-auto">
          {(["ALL", "PRESENT", "LATE", "ABSENT", "UNRECORDED"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                  status === item
                    ? "bg-[#9A7B4F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => void loadAttendance()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={28} className="animate-spin text-[#9A7B4F]" />
        </div>
      ) : (
        <>
          {/* KPI Analytics Bar */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Summary label="Present" value={counts.present} tone="green" />
            <Summary label="Late" value={counts.late} tone="gold" />
            <Summary label="Absent" value={counts.absent} tone="red" />
            <Summary label="Unrecorded" value={counts.unrecorded} tone="gray" />
            
            {/* Attendance Rate Card */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm transition hover:shadow-md sm:p-5 flex flex-col justify-between">
              <div>
                <span className="inline-flex rounded-lg border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                  Coverage Rate
                </span>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-amber-950">
                  {counts.rate}%
                </p>
              </div>
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                  <div
                    className="h-full bg-[#9A7B4F] transition-all duration-300"
                    style={{ width: `${counts.rate}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-amber-800/80 font-medium">
                  {counts.present + counts.late} of {counts.total} logged
                </p>
              </div>
            </div>
          </section>

          {/* Attendance Roster List */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {formatDate(date)} Duty Roster & Attendance
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {rows.length} matching duty record{rows.length === 1 ? "" : "s"}
                </p>
              </div>
              <UserCheck size={19} className="text-[#9A7B4F]" />
            </div>

            <div className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <div className="p-12 text-center">
                  <UserX className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    No assigned duties found for {date}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Try changing the date navigator or clear search filters.
                  </p>
                </div>
              ) : (
                rows.map(({ assignment, record }) => (
                  <AttendanceRow
                    key={assignment._id}
                    assignment={assignment}
                    record={record}
                    actionId={actionId}
                    onAction={runAction}
                    onEdit={() => setEditingRecord({ assignment, record })}
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* Manual Correction Modal */}
      {editingRecord && (
        <EditAttendanceModal
          assignment={editingRecord.assignment}
          record={editingRecord.record}
          token={token || ""}
          onClose={() => setEditingRecord(null)}
          onSuccess={async () => {
            setEditingRecord(null);
            await loadAttendance();
          }}
        />
      )}
    </main>
  );
}

function AttendanceRow({
  assignment,
  record,
  actionId,
  onAction,
  onEdit,
}: {
  assignment: Assignment;
  record?: Attendance;
  actionId: string | null;
  onAction: (assignment: Assignment, action: "in" | "out" | "absent") => void;
  onEdit: () => void;
}) {
  const event = typeof assignment.event === "string" ? null : assignment.event;
  const staff = typeof assignment.staff === "string" ? null : assignment.staff;
  const checkedIn = Boolean(record?.checkIn && !record.checkOut);
  const complete = Boolean(record?.checkOut);
  const status = record?.status || "UNRECORDED";

  const isGPS = record?.notes?.includes("GPS:");

  return (
    <article className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F4EBDD] font-bold text-[#9A7B4F]">
          {staff?.name?.charAt(0).toUpperCase() || "S"}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">
              {staff?.name || "Staff member"}
            </h3>
            <Badge status={status} />
          </div>

          <p className="mt-1 truncate text-xs font-medium text-gray-600">
            {assignment.dutyTitle} · {event?.eventName || "Assigned event"}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock3 size={13} className="text-[#9A7B4F]" />
              {assignment.startTime} - {assignment.endTime}
            </span>

            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-[#9A7B4F]" />
              {event?.location || "Location pending"}
            </span>

            {record && (
              <span className="font-medium text-gray-700">
                In: {formatTime(record.checkIn)} · Out: {formatTime(record.checkOut)}
              </span>
            )}
          </div>

          {/* Staff Check-in Notes & GPS Tag */}
          {record?.notes && (
            <div className="mt-2.5 flex items-start gap-1.5 rounded-xl border border-amber-100 bg-amber-50/60 p-2 text-[11px] text-amber-900">
              <FileText size={13} className="mt-0.5 shrink-0 text-[#9A7B4F]" />
              <span className="line-clamp-2 inline-flex items-center gap-1">
                {isGPS && <MapPin size={12} className="shrink-0 text-[#9A7B4F]" />}
                <span>{record.notes}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={onEdit}
          title="Manual Edit / Override"
          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <Edit3 size={14} className="text-[#9A7B4F]" />
          <span>Edit</span>
        </button>

        {!record && (
          <button
            type="button"
            disabled={Boolean(actionId)}
            onClick={() => onAction(assignment, "absent")}
            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <UserX size={14} className="mr-1 inline" />
            Mark Absent
          </button>
        )}

        {!complete && (
          <button
            type="button"
            disabled={Boolean(actionId)}
            onClick={() => onAction(assignment, checkedIn ? "out" : "in")}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 ${
              checkedIn
                ? "bg-[#557555] hover:bg-[#456345]"
                : "bg-[#9A7B4F] hover:bg-[#80653e]"
            }`}
          >
            {checkedIn ? (
              <>
                <LogOut size={14} className="mr-1 inline" />
                Check Out
              </>
            ) : (
              <>
                <LogIn size={14} className="mr-1 inline" />
                Check In
              </>
            )}
          </button>
        )}

        {complete && (
          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Completed
          </span>
        )}
      </div>
    </article>
  );
}

function Badge({ status }: { status: string }) {
  const style =
    status === "PRESENT"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "LATE"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : status === "ABSENT"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${style}`}
    >
      {status}
    </span>
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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <span
        className={`inline-flex rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[tone]}`}
      >
        {label}
      </span>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-gray-400">Duties on date</p>
    </div>
  );
}

// Manual Override Modal
function EditAttendanceModal({
  assignment,
  record,
  token,
  onClose,
  onSuccess,
}: {
  assignment: Assignment;
  record?: Attendance;
  token: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const staffName =
    typeof assignment.staff === "string" ? "Staff" : assignment.staff.name;

  const [status, setStatus] = useState<AttendanceStatus>(
    record?.status || "PRESENT"
  );
  const [checkInTime, setCheckInTime] = useState(
    record?.checkIn
      ? new Date(record.checkIn).toTimeString().slice(0, 5)
      : assignment.startTime || "09:00"
  );
  const [checkOutTime, setCheckOutTime] = useState(
    record?.checkOut
      ? new Date(record.checkOut).toTimeString().slice(0, 5)
      : assignment.endTime || "17:00"
  );
  const [notes, setNotes] = useState(record?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const dutyDateStr = assignment.dutyDate.slice(0, 10);
      const isoCheckIn = checkInTime
        ? new Date(`${dutyDateStr}T${checkInTime}:00`).toISOString()
        : null;
      const isoCheckOut = checkOutTime
        ? new Date(`${dutyDateStr}T${checkOutTime}:00`).toISOString()
        : null;

      if (record) {
        // Update existing record
        await updateAttendance(
          record._id,
          {
            status,
            checkIn: isoCheckIn,
            checkOut: isoCheckOut,
            notes: notes.trim(),
          },
          token
        );
      } else {
        // Create new attendance record via checkIn / markAbsent
        if (status === "ABSENT") {
          await markAbsent({ duty: assignment._id, notes: notes.trim() }, token);
        } else {
          await checkIn({ duty: assignment._id, notes: notes.trim() }, token);
        }
      }

      await onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update attendance record."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Edit Attendance Record
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {staffName} · {assignment.dutyTitle}
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

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Attendance Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold focus:border-[#9A7B4F] focus:outline-none"
            >
              <option value="PRESENT">PRESENT 🟢</option>
              <option value="LATE">LATE 🟡</option>
              <option value="ABSENT">ABSENT 🔴</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Check-In Time
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Check-Out Time
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Manager Notes / Overrides
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add manager override note (e.g. Approved late arrival due to traffic)"
              className="mt-1.5 w-full rounded-xl border border-gray-200 p-2.5 text-xs outline-none focus:border-[#9A7B4F]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-gray-200 px-4 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-[#9A7B4F] px-5 text-xs font-semibold text-white shadow-sm hover:bg-[#80653e] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

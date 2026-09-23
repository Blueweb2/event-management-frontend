"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
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
  UserCheck,
  UserX,
  XCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";
import {
  deleteAvailability,
  getAvailability,
  setAvailability,
} from "@/lib/availability.api";
import type { Availability, AvailabilityStatus } from "@/types/availability";

const localToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value)
  );

export default function ManagerAvailabilityPage() {
  const { token } = useAuth();
  const { staff } = useStaff({ token });

  const [date, setDate] = useState(localToday());
  const [availability, setAvailabilityState] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const loadAvailability = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const res = await getAvailability(token, { date, limit: 100 });
      setAvailabilityState(res.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load availability records."
      );
    } finally {
      setLoading(false);
    }
  }, [date, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAvailability(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAvailability]);

  const changeDateByDays = (delta: number) => {
    const curr = new Date(date);
    curr.setDate(curr.getDate() + delta);
    setDate(curr.toISOString().slice(0, 10));
  };

  const filteredAvailability = useMemo(() => {
    return availability.filter((item) => {
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
  }, [availability, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    const available = availability.filter((i) => i.status === "AVAILABLE").length;
    const leave = availability.filter((i) => i.status === "ON_LEAVE").length;
    const unavailable = availability.filter((i) => i.status === "UNAVAILABLE").length;
    const total = availability.length;
    return { available, leave, unavailable, total };
  }, [availability]);

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
      "Department",
      "Status",
      "Working Hours",
      "Notes / Reason",
    ];

    const rows = filteredAvailability.map((item) => {
      const staffObj = typeof item.staff === "object" ? item.staff : null;
      return [
        `"${date}"`,
        `"${(staffObj?.name || "Staff").replace(/"/g, '""')}"`,
        `"${(staffObj?.department || "General").replace(/"/g, '""')}"`,
        `"${item.status}"`,
        `"${item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : "N/A"}"`,
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
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#e8e1d8] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/manager"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A7B4F] hover:underline"
          >
            <ArrowLeft size={13} />
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
            Staff Availability Roster
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Monitor staff schedules, leave requests, and set working availability for event dispatching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportAvailabilityCSV}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Download size={15} className="text-[#9A7B4F]" />
            Export Roster (CSV)
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#9A7B4F] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#80653e]"
          >
            <Plus size={16} />
            Set Staff Availability
          </button>
        </div>
      </div>

      {/* Date Navigator & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search staff name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-[#9A7B4F] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "AVAILABLE", "ON_LEAVE", "UNAVAILABLE"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                statusFilter === st
                  ? "bg-[#9A7B4F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st === "ALL" ? "All Statuses" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Summary label="Total Logged" value={counts.total} tone="gray" />
        <Summary label="Available" value={counts.available} tone="green" />
        <Summary label="On Leave" value={counts.leave} tone="gold" />
        <Summary label="Unavailable" value={counts.unavailable} tone="red" />
      </section>

      {/* Content */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 size={28} className="animate-spin text-[#9A7B4F]" />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAvailability.map((item) => {
            const staffObj = typeof item.staff === "object" ? item.staff : null;
            const staffName = staffObj?.name || "Staff Member";
            const department = staffObj?.department || "General Staff";

            const isAvailable = item.status === "AVAILABLE";
            const isOnLeave = item.status === "ON_LEAVE";

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {staffName}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {department}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
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

                  {item.startTime && item.endTime && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <Clock3 size={13} className="text-[#9A7B4F]" />
                      <span>
                        {item.startTime} - {item.endTime}
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

                <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between items-center text-[11px] text-gray-400">
                  <span>Date: {date}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="text-gray-400 hover:text-red-500 transition p-1"
                    title="Delete Availability Record"
                  >
                    <Trash2 size={14} />
                  </button>
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
            await loadAvailability();
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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <span
        className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[tone]}`}
      >
        {label}
      </span>
      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
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
  staffList: Array<{ id: string; name: string; department?: string }>;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Set Staff Availability / Override
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Assign availability or leave status for a staff member.
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
              Select Staff Member
            </label>
            <select
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 focus:border-[#9A7B4F] focus:outline-none"
            >
              <option value="">Select staff member</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.department ? `(${s.department})` : ""}
                </option>
              ))}
            </select>
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
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AvailabilityStatus)}
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 focus:border-[#9A7B4F] focus:outline-none"
            >
              <option value="AVAILABLE">AVAILABLE 🟢</option>
              <option value="ON_LEAVE">ON LEAVE 🟡</option>
              <option value="UNAVAILABLE">UNAVAILABLE 🔴</option>
            </select>
          </div>

          {status === "AVAILABLE" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs focus:border-[#9A7B4F] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Notes / Override Reason
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes or leave details..."
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

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Plus,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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

export default function StaffAvailabilityPage() {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [date, setDate] = useState(localToday());
  const [status, setStatus] = useState<AvailabilityStatus>("AVAILABLE");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [notes, setNotes] = useState("");

  const loadMyAvailability = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const res = await getAvailability(token, { limit: 100 });
      setRecords(res.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load availability."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMyAvailability(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMyAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccessMsg("");

      await setAvailability(
        {
          staff: user?.id || "",
          date,
          status,
          startTime: status === "AVAILABLE" ? startTime : "",
          endTime: status === "AVAILABLE" ? endTime : "",
          notes: notes.trim(),
        },
        token
      );

      setSuccessMsg(`Availability updated for ${date}`);
      setNotes("");
      await loadMyAvailability();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save availability."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      setError("");
      await deleteAvailability(id, token);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete record."
      );
    }
  };

  return (
    <main className="space-y-6 py-5 sm:space-y-8 sm:py-6">
      {/* Header */}
      <header className="border-b border-[#e8e1d8] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">
          Staff Portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          My Work Availability & Leave
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
          Submit your available working hours or request leave dates so managers can dispatch shifts accurately.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Submission Form & History Feed */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Availability Form */}
        <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-[#eee8e1] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#29241f]">
                Set Date Availability / Leave
              </h2>
              <p className="text-xs text-[#8d847b]">
                Save work status for a specific date
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#403a34]">
                Target Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-xs text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#403a34]">
                Availability Status
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(["AVAILABLE", "ON_LEAVE", "UNAVAILABLE"] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`rounded-xl py-2.5 text-xs font-bold transition border ${
                        status === st
                          ? st === "AVAILABLE"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : st === "ON_LEAVE"
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-rose-600 text-white border-rose-600"
                          : "bg-[#fdfbf8] text-[#756d64] border-[#e3dbd2] hover:bg-[#f8f4ee]"
                      }`}
                    >
                      {st === "AVAILABLE"
                        ? "Available 🟢"
                        : st === "ON_LEAVE"
                        ? "On Leave 🟡"
                        : "Unavailable 🔴"}
                    </button>
                  )
                )}
              </div>
            </div>

            {status === "AVAILABLE" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#403a34]">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#e3dbd2] bg-white px-3 text-xs outline-none focus:border-[#b8894b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#403a34]">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-[#e3dbd2] bg-white px-3 text-xs outline-none focus:border-[#b8894b]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#403a34]">
                Notes / Leave Reason
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  status === "ON_LEAVE"
                    ? "Specify leave reason (e.g. Personal leave / Doctor appointment)..."
                    : "Add optional shift preference notes..."
                }
                className="mt-1.5 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] p-3 text-xs outline-none focus:border-[#b8894b]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#a7773f] disabled:opacity-50"
            >
              {submitting ? (
                "Saving..."
              ) : (
                <>
                  <Plus size={16} />
                  Save Availability Record
                </>
              )}
            </button>
          </form>
        </section>

        {/* My Saved Availability History */}
        <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#eee8e1] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#29241f]">
                  My Saved Availability & Leave
                </h2>
                <p className="text-xs text-[#8d847b]">
                  {records.length} record{records.length === 1 ? "" : "s"} submitted
                </p>
              </div>
              <UserCheck size={19} className="text-[#a7773f]" />
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 size={24} className="animate-spin text-[#9a6c37]" />
                </div>
              ) : records.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e3dbd2] p-8 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-xs font-medium text-gray-600">
                    No availability records saved yet.
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Use the form on the left to submit your available work dates or leave requests.
                  </p>
                </div>
              ) : (
                records.map((item) => {
                  const dateStr = item.date
                    ? new Date(item.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Date N/A";

                  const isAvailable = item.status === "AVAILABLE";
                  const isOnLeave = item.status === "ON_LEAVE";

                  return (
                    <article
                      key={item._id}
                      className="rounded-2xl border border-[#eee8e1] bg-[#fdfcfb] p-4 transition hover:border-[#e3dbd2]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#29241f]">
                              {dateStr}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                isAvailable
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : isOnLeave
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </div>

                          {item.startTime && item.endTime && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock3 size={13} className="text-[#a7773f]" />
                              <span>
                                {item.startTime} - {item.endTime}
                              </span>
                            </div>
                          )}

                          {item.notes && (
                            <div className="mt-2 flex items-start gap-1 text-[11px] text-gray-500 italic">
                              <FileText size={12} className="mt-0.5 shrink-0 text-[#a7773f]" />
                              <span>&ldquo;{item.notes}&rdquo;</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          title="Delete Record"
                          className="text-gray-400 hover:text-red-500 transition p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
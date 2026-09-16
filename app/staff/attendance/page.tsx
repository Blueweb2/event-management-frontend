"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Check, Clock3, Loader2, LogIn, LogOut, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import { checkIn, checkOut, getAttendance } from "@/lib/attendance.api";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";

const dateLabel = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
const timeLabel = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(new Date(value)) : "--";
const isToday = (value: string) => {
  const today = new Date();
  const date = new Date(value);
  return today.toDateString() === date.toDateString();
};

export default function StaffAttendancePage() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadAttendance = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const [assignmentResult, attendanceResult] = await Promise.all([
        getAssignments(token, { page: 1, limit: 100 }),
        getAttendance(token, { page: 1, limit: 100 }),
      ]);
      setAssignments(assignmentResult.data || []);
      setAttendance(attendanceResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAttendance(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAttendance]);

  const attendanceByDuty = useMemo(() => new Map(attendance.map((item) => [typeof item.duty === "string" ? item.duty : item.duty._id, item])), [attendance]);
  const activeAttendance = attendance.find((item) => item.checkIn && !item.checkOut && isToday(item.date));
  const presentCount = attendance.filter((item) => item.status === "PRESENT" || item.status === "LATE").length;
  const completedCount = attendance.filter((item) => item.checkOut).length;

  const handleAttendance = async (assignment: Assignment, record?: Attendance) => {
    if (!token || actionId) return;
    if (!isToday(assignment.dutyDate)) {
      setError("Check-in is available only on the assigned duty date.");
      return;
    }
    try {
      setActionId(assignment._id);
      setError("");
      const updated = record?.checkIn && !record.checkOut
        ? await checkOut({ duty: assignment._id }, token)
        : await checkIn({ duty: assignment._id }, token);
      setAttendance((current) => {
        const exists = current.some((item) => item._id === updated._id);
        return exists ? current.map((item) => item._id === updated._id ? updated : item) : [updated, ...current];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Attendance action failed.");
    } finally {
      setActionId(null);
    }
  };

  return <main className="space-y-6 py-5 sm:space-y-8 sm:py-6">
    <header className="border-b border-[#e8e1d8] pb-6">
      <p className="text-sm font-semibold text-[#9a6c37]">Staff Portal</p>
      <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">Check In / Out</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">Record attendance against the duty you are working.</p>
    </header>

    {error && <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17} /><span className="flex-1">{error}</span><button type="button" onClick={() => void loadAttendance()} className="text-xs font-semibold underline">Retry</button></div>}

    {loading ? <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white"><Loader2 size={28} className="animate-spin text-[#9a6c37]" /></div> : <>
      <section className="grid grid-cols-3 gap-3"><Summary label="Present" value={presentCount} /><Summary label="Completed shifts" value={completedCount} /><Summary label="Open check-in" value={activeAttendance ? 1 : 0} /></section>

      {activeAttendance && <section className="overflow-hidden rounded-3xl border border-[#263228] bg-[#151a17] text-white shadow-lg"><div className="flex flex-col items-center px-6 py-8 text-center"><div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-400 text-emerald-400"><Check size={48} strokeWidth={2.5} /></div><p className="mt-5 text-xl font-semibold">Checked In</p><p className="mt-1 text-2xl font-bold tracking-wide">{timeLabel(activeAttendance.checkIn)}</p><p className="mt-2 text-sm text-gray-300">{typeof activeAttendance.event === "string" ? "Assigned event" : activeAttendance.event.eventName}</p><div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />On Duty</div><button type="button" onClick={() => { const assignment = assignments.find((item) => item._id === (typeof activeAttendance.duty === "string" ? activeAttendance.duty : activeAttendance.duty._id)); if (assignment) void handleAttendance(assignment, activeAttendance); }} disabled={Boolean(actionId)} className="mt-8 min-h-12 w-full max-w-sm rounded-xl bg-[#fdf8ee] px-5 text-sm font-bold text-[#534330] hover:bg-white disabled:opacity-50"><LogOut size={16} className="mr-2 inline" />{actionId ? "Saving..." : "Check Out"}</button></div></section>}

      <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between border-b border-[#eee8e1] pb-4"><div><h2 className="text-base font-bold text-[#29241f]">Assigned Duties</h2><p className="mt-1 text-xs text-[#8d847b]">Choose the duty you are attending.</p></div><CalendarDays size={19} className="text-[#a7773f]" /></div><div className="mt-4 space-y-3">{assignments.length === 0 ? <p className="rounded-xl bg-[#fdfbf8] p-4 text-sm text-gray-500">No duties assigned yet.</p> : assignments.map((assignment) => { const record = attendanceByDuty.get(assignment._id); const event = typeof assignment.event === "string" ? null : assignment.event; const isCheckedIn = Boolean(record?.checkIn && !record.checkOut); const isComplete = Boolean(record?.checkOut); return <article key={assignment._id} className={`rounded-2xl border p-4 ${isCheckedIn ? "border-emerald-200 bg-emerald-50/40" : "border-[#eee8e1] bg-[#fdfcfb]"}`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-[#29241f]">{assignment.dutyTitle}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isComplete ? "bg-gray-100 text-gray-600" : isCheckedIn ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{isComplete ? "Completed" : isCheckedIn ? "On Duty" : assignment.status}</span></div><p className="mt-1 text-xs text-gray-500">{event?.eventName || "Assigned event"}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#756d64]"><span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-[#a7773f]" />{dateLabel(assignment.dutyDate)}</span><span className="flex items-center gap-1.5"><Clock3 size={14} className="text-[#a7773f]" />{assignment.startTime} - {assignment.endTime}</span><span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#a7773f]" />{event?.location || "Location pending"}</span></div></div><button type="button" disabled={Boolean(actionId) || isComplete || Boolean(activeAttendance && !isCheckedIn)} onClick={() => void handleAttendance(assignment, record)} className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${isCheckedIn ? "bg-[#557555] hover:bg-[#456345]" : "bg-[#9a6c37] hover:bg-[#7e582d]"}`}>{actionId === assignment._id ? "Saving..." : isCheckedIn ? <><LogOut size={15} className="mr-1.5 inline" />Check Out</> : <><LogIn size={15} className="mr-1.5 inline" />Check In</>}</button></div>{record?.checkIn && <p className="mt-3 border-t border-black/5 pt-3 text-xs text-gray-500">Checked in at {timeLabel(record.checkIn)}{record.checkOut ? ` · Checked out at ${timeLabel(record.checkOut)}` : ""}</p>}</article>; })}</div></section>

      <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm"><div className="border-b border-[#eee8e1] px-5 py-4"><h2 className="text-base font-bold text-[#29241f]">Attendance History</h2><p className="mt-1 text-xs text-[#8d847b]">Your recorded duty attendance</p></div><div className="divide-y divide-[#eee8e1]">{attendance.length === 0 ? <p className="p-5 text-sm text-gray-500">No attendance records yet.</p> : attendance.slice(0, 8).map((record) => <div key={record._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-[#29241f]">{typeof record.duty === "string" ? "Duty attendance" : record.duty.dutyTitle}</p><p className="mt-1 text-xs text-[#756d64]">{dateLabel(record.date)} · In {timeLabel(record.checkIn)} · Out {timeLabel(record.checkOut)}</p></div><span className="w-fit rounded-full bg-[#edf5ed] px-3 py-1 text-xs font-semibold text-[#557555]">{record.status}</span></div>)}</div></section>
    </>}
  </main>;
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8d847b]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#29241f]">{value}</p>
    </div>
  );
}

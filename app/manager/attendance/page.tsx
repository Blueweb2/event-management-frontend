"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, Loader2, LogIn, LogOut, MapPin, Search, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import { checkIn, checkOut, getAttendance, markAbsent } from "@/lib/attendance.api";
import type { Assignment } from "@/types/assignment";
import type { Attendance, AttendanceStatus } from "@/types/attendance";

const localToday = () => { const date = new Date(); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); };
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
const formatTime = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(new Date(value)) : "--";

export default function ManagerAttendancePage() {
  const { token } = useAuth();
  const [date, setDate] = useState(localToday());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | "UNRECORDED" | "ALL">("ALL");
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
        getAssignments(token, { dutyDate: date, page: 1, limit: 100 }),
        getAttendance(token, { date, page: 1, limit: 100 }),
      ]);
      setAssignments(assignmentResult.data || []);
      setAttendance(attendanceResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, [date, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAttendance(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAttendance]);

  const attendanceByDuty = useMemo(() => new Map(attendance.map((item) => [typeof item.duty === "string" ? item.duty : item.duty._id, item])), [attendance]);
  const rows = useMemo(() => assignments.map((assignment) => ({ assignment, record: attendanceByDuty.get(assignment._id) })).filter(({ assignment, record }) => {
    const event = typeof assignment.event === "string" ? "" : assignment.event.eventName;
    const staff = typeof assignment.staff === "string" ? "" : assignment.staff.name;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || assignment.dutyTitle.toLowerCase().includes(query) || event.toLowerCase().includes(query) || staff.toLowerCase().includes(query);
    const currentStatus = record?.status || "UNRECORDED";
    return matchesSearch && (status === "ALL" || currentStatus === status);
  }), [assignments, attendanceByDuty, search, status]);

  const counts = useMemo(() => ({
    present: attendance.filter((item) => item.status === "PRESENT").length,
    late: attendance.filter((item) => item.status === "LATE").length,
    absent: attendance.filter((item) => item.status === "ABSENT").length,
    unrecorded: Math.max(assignments.length - attendance.length, 0),
  }), [assignments.length, attendance]);

  const runAction = async (assignment: Assignment, action: "in" | "out" | "absent") => {
    if (!token || actionId) return;
    if (action !== "absent" && assignment.dutyDate.slice(0, 10) !== localToday()) {
      setError("Check-in and check-out are available only on the duty date.");
      return;
    }
    try {
      setActionId(assignment._id);
      setError("");
      if (action === "in") await checkIn({ duty: assignment._id }, token);
      if (action === "out") await checkOut({ duty: assignment._id }, token);
      if (action === "absent") await markAbsent({ duty: assignment._id }, token);
      await loadAttendance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Attendance update failed.");
    } finally {
      setActionId(null);
    }
  };

  return <main className="space-y-6 py-5 sm:space-y-7 sm:py-6">
    <header className="flex flex-col gap-3 border-b border-[#e8e1d8] pb-6 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/manager" className="inline-flex items-center gap-1 text-xs font-medium text-[#9A7B4F] hover:underline">Manager Dashboard</Link><h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">Staff Attendance</h1><p className="mt-1 text-sm text-gray-500">Run daily attendance by assigned duty, event, and staff member.</p></div><button type="button" onClick={() => void loadAttendance()} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50"><CalendarDays size={15} />Refresh day</button></header>

    <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"><div><label className="block text-xs font-semibold text-gray-600">Attendance date</label><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-[#9A7B4F] focus:outline-none" /></div><div className="relative flex-1"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search staff, duty, or event" className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 text-sm focus:border-[#9A7B4F] focus:bg-white focus:outline-none" /></div><div className="flex gap-1.5 overflow-x-auto">{(["ALL", "PRESENT", "LATE", "ABSENT", "UNRECORDED"] as const).map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${status === item ? "bg-[#9A7B4F] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{item}</button>)}</div></section>

    {error && <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17} /><span className="flex-1">{error}</span><button type="button" onClick={() => void loadAttendance()} className="text-xs font-semibold underline">Retry</button></div>}

    {loading ? <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white"><Loader2 size={28} className="animate-spin text-[#9A7B4F]" /></div> : <>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Summary label="Present" value={counts.present} tone="green" /><Summary label="Late" value={counts.late} tone="gold" /><Summary label="Absent" value={counts.absent} tone="red" /><Summary label="Unrecorded" value={counts.unrecorded} tone="gray" /></section>
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 className="text-base font-bold text-gray-900">{formatDate(date)} duty coverage</h2><p className="mt-1 text-xs text-gray-500">{rows.length} matching duty{rows.length === 1 ? "" : "ies"}</p></div><UserCheck size={19} className="text-[#9A7B4F]" /></div><div className="divide-y divide-gray-100">{rows.length === 0 ? <div className="p-12 text-center"><UserX className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-700">No assigned duties found</p><p className="mt-1 text-xs text-gray-400">Try another date or clear the search.</p></div> : rows.map(({ assignment, record }) => <AttendanceRow key={assignment._id} assignment={assignment} record={record} actionId={actionId} onAction={runAction} />)}</div></section>
    </>}
  </main>;
}

function AttendanceRow({ assignment, record, actionId, onAction }: { assignment: Assignment; record?: Attendance; actionId: string | null; onAction: (assignment: Assignment, action: "in" | "out" | "absent") => void }) {
  const event = typeof assignment.event === "string" ? null : assignment.event;
  const staff = typeof assignment.staff === "string" ? null : assignment.staff;
  const checkedIn = Boolean(record?.checkIn && !record.checkOut);
  const complete = Boolean(record?.checkOut);
  const status = record?.status || "UNRECORDED";
  return <article className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] font-bold text-[#9A7B4F]">{staff?.name?.charAt(0).toUpperCase() || "S"}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-gray-900">{staff?.name || "Staff member"}</h3><Badge status={status} /></div><p className="mt-1 truncate text-xs font-medium text-gray-600">{assignment.dutyTitle} · {event?.eventName || "Assigned event"}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500"><span className="flex items-center gap-1"><Clock3 size={12} />{assignment.startTime} - {assignment.endTime}</span><span className="flex items-center gap-1"><MapPin size={12} />{event?.location || "Location pending"}</span>{record && <span>In {formatTime(record.checkIn)} · Out {formatTime(record.checkOut)}</span>}</div></div></div><div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">{!record && <button type="button" disabled={Boolean(actionId)} onClick={() => onAction(assignment, "absent")} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><UserX size={14} className="mr-1 inline" />Mark absent</button>}{!complete && <button type="button" disabled={Boolean(actionId)} onClick={() => onAction(assignment, checkedIn ? "out" : "in")} className={`rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${checkedIn ? "bg-[#557555] hover:bg-[#456345]" : "bg-[#9A7B4F] hover:bg-[#80653e]"}`}>{checkedIn ? <><LogOut size={14} className="mr-1 inline" />Check out</> : <><LogIn size={14} className="mr-1 inline" />Check in</>}</button>}{complete && <span className="inline-flex items-center gap-1 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"><CheckCircle2 size={14} />Completed</span>}</div></article>;
}

function Badge({ status }: { status: string }) { const style = status === "PRESENT" ? "bg-emerald-50 text-emerald-700" : status === "LATE" ? "bg-amber-50 text-amber-700" : status === "ABSENT" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-500"; return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style}`}>{status}</span>; }
function Summary({ label, value, tone }: { label: string; value: number; tone: "green" | "gold" | "red" | "gray" }) {
  const styles = {
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    gold: "border-amber-100 bg-amber-50 text-amber-700",
    red: "border-red-100 bg-red-50 text-red-700",
    gray: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <span className={`inline-flex rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[tone]}`}>
        {label}
      </span>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      <p className="mt-1 text-[11px] text-gray-400">Duty records for selected date</p>
    </div>
  );
}

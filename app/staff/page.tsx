"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import StaffHeader from "@/components/staff/StaffHeader";
import StaffStats from "@/components/staff/StaffStats";
import TodayDuties from "@/components/staff/TodayDuties";
import UpcomingEvents from "@/components/staff/UpcomingEvents";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import { getAttendance } from "@/lib/attendance.api";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";

export default function StaffHomePage() {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
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
      setError(err instanceof Error ? err.message : "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  return <main className="space-y-6 py-5 sm:space-y-8 sm:py-6"><StaffHeader /><section><p className="text-sm font-semibold text-[#9a6c37]">Staff Portal</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">Good morning, {user?.name || "Staff Member"}</h1><p className="mt-2 text-sm leading-6 text-[#756d64]">Here&apos;s your schedule and assigned work for today.</p></section><section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b938a]">Today</p><h2 className="mt-1 text-lg font-bold text-[#29241f]">Your work is ready</h2><p className="mt-1 text-sm text-[#756d64]">Review your assigned duties and event schedule.</p></div><div className="w-fit rounded-xl bg-[#edf5ed] px-4 py-3"><p className="text-xs font-medium text-[#557555]">Employment</p><p className="mt-1 text-sm font-bold text-[#3f5f3f]">{user?.employmentType || "Staff"}</p></div></div></section>{error && <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={17} /><span className="flex-1">{error}</span><button type="button" onClick={() => void loadDashboard()} className="text-xs font-semibold underline">Retry</button></div>}{loading ? <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white"><Loader2 size={28} className="animate-spin text-[#9a6c37]" /><p className="mt-3 text-sm text-[#756d64]">Loading your dashboard...</p></div> : <><StaffStats assignments={assignments} attendance={attendance} /><div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]"><TodayDuties assignments={assignments} /><UpcomingEvents assignments={assignments} /></div></>}</main>;
}

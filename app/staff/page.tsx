"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import StaffHeader from "@/components/staff/StaffHeader";
import StaffStats from "@/components/staff/StaffStats";
import TodayDuties from "@/components/staff/TodayDuties";
import UpcomingEvents from "@/components/staff/UpcomingEvents";
import HeroActiveShiftWidget from "@/components/staff/shift/HeroActiveShiftWidget";
import InteractiveDutyChecklist from "@/components/staff/shift/InteractiveDutyChecklist";
import ShiftNotificationsFeed from "@/components/staff/shift/ShiftNotificationsFeed";
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

  const activeAssignment = assignments[0];

  return (
    <main className="space-y-6 py-5 sm:space-y-8 sm:py-6">
      <StaffHeader />

      <section>
        <p className="text-sm font-semibold text-[#9a6c37]">Staff Portal</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
          Good morning, {user?.name || "Staff Member"} 👋
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#756d64]">
          Here&apos;s your active shift, checklist, and schedule updates for today.
        </p>
      </section>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={17} />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => void loadDashboard()} className="text-xs font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white">
          <Loader2 size={28} className="animate-spin text-[#9a6c37]" />
          <p className="mt-3 text-sm text-[#756d64]">Loading your shift dashboard...</p>
        </div>
      ) : (
        <>
          {/* 1. Hero Active Shift Widget */}
          <div id="active-shift">
            <HeroActiveShiftWidget
              assignments={assignments}
              attendance={attendance}
              onAttendanceUpdate={loadDashboard}
            />
          </div>

          {/* Quick Stats Bar */}
          <StaffStats assignments={assignments} attendance={attendance} />

          {/* 2 & 3: Interactive Duty Checklist & Shift Notifications Feed */}
          <div className="grid gap-6 xl:grid-cols-2">
            <div id="duty-checklist">
              <InteractiveDutyChecklist assignments={assignments} onUpdate={loadDashboard} />
            </div>
            <ShiftNotificationsFeed assignments={assignments} />
          </div>

          {/* Duties & Upcoming Events */}
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div id="today-duties">
              <TodayDuties assignments={assignments} />
            </div>
            <div id="upcoming-events">
              <UpcomingEvents assignments={assignments} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

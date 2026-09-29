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

  const loadDashboard = useCallback(
    async (silent = false) => {
      if (!token) return;
      try {
        if (!silent) setLoading(true);
        setError("");
        const [assignmentResult, attendanceResult] = await Promise.all([
          getAssignments(token, { page: 1, limit: 100 }),
          getAttendance(token, { page: 1, limit: 100 }),
        ]);
        setAssignments(assignmentResult.data || []);
        setAttendance(attendanceResult.data || []);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Unable to load your dashboard.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void loadDashboard(false);

    const interval = setInterval(() => {
      void loadDashboard(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const activeAssignment = assignments[0];

  return (
    <main className="space-y-4 sm:space-y-6 lg:space-y-8 py-3.5 sm:py-6">
      <StaffHeader />

      <section>
        <p className="text-xs sm:text-sm font-semibold text-[#9a6c37]">Staff Portal</p>
        <h1 className="mt-0.5 text-xl font-black tracking-tight text-[#29241f] sm:text-2xl lg:text-3xl">
          Good morning, {user?.name || "Staff Member"} 👋
        </h1>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#756d64]">
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
            <div id="duty-checklist" className="w-full min-w-0 overflow-x-auto">
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

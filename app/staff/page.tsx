"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import StaffHeader from "@/components/staff/StaffHeader";
import StaffStats from "@/components/staff/StaffStats";
import UpcomingEvents from "@/components/staff/UpcomingEvents";
import HeroActiveShiftWidget from "@/components/staff/shift/HeroActiveShiftWidget";
import StaffStockWidget from "@/components/staff/StaffStockWidget";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import { getAttendance } from "@/lib/attendance.api";
import { getSocket } from "@/lib/socket";
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

  // Initial fetch and auto-polling fallback
  useEffect(() => {
    void loadDashboard(false);

    const interval = setInterval(() => {
      void loadDashboard(true);
    }, 4000);

    const handleFocus = () => {
      void loadDashboard(true);
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [loadDashboard]);

  // Real-time Socket.IO integration for instant Event Started updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const joinRooms = () => {
      const userId = user?.id || (user as any)?._id;
      if (userId) {
        socket.emit("join:staff", userId);
      }
      assignments.forEach((a) => {
        const evtId = typeof a.event === "object" && a.event !== null ? a.event._id : a.event;
        if (evtId) {
          socket.emit("join:event", evtId);
        }
      });
    };

    if (socket.connected) {
      joinRooms();
    }

    const onConnect = () => {
      joinRooms();
    };

    const handleRealtimeUpdate = () => {
      void loadDashboard(true);
    };

    socket.on("connect", onConnect);
    socket.on("event:started", handleRealtimeUpdate);
    socket.on("duty:updated", handleRealtimeUpdate);
    socket.on("duty:refresh", handleRealtimeUpdate);
    socket.on("attendance:updated", handleRealtimeUpdate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("event:started", handleRealtimeUpdate);
      socket.off("duty:updated", handleRealtimeUpdate);
      socket.off("duty:refresh", handleRealtimeUpdate);
      socket.off("attendance:updated", handleRealtimeUpdate);
    };
  }, [assignments, loadDashboard, user]);

  return (
    <main className="space-y-4 sm:space-y-6 lg:space-y-8 py-3.5 sm:py-6">
      <StaffHeader assignments={assignments} />

      <section>
        <p className="text-xs sm:text-sm font-semibold text-[#9a6c37]">Staff Portal</p>
        <h1 className="mt-0.5 text-xl font-black tracking-tight text-[#29241f] sm:text-2xl lg:text-3xl">
          Good morning, {user?.name || "Staff Member"} 👋
        </h1>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#756d64]">
          Here&apos;s your active shift overview and upcoming schedule.
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
          {/* 1. Hero Active Shift Widget (Shows today's shift if any, otherwise 'No shift scheduled today') */}
          <div id="active-shift">
            <HeroActiveShiftWidget
              assignments={assignments}
              attendance={attendance}
              onAttendanceUpdate={loadDashboard}
            />
          </div>

          {/* Quick Stats Bar */}
          <StaffStats assignments={assignments} attendance={attendance} />

          {/* Stock & Equipment Widget */}
          <StaffStockWidget />

          {/* Upcoming Events / Schedule */}
          <div id="upcoming-events">
            <UpcomingEvents assignments={assignments} />
          </div>
        </>
      )}
    </main>
  );
}

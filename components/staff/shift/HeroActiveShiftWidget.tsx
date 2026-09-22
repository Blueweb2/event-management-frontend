"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Play, Square, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";
import { checkInStaff, checkOutStaff } from "@/lib/attendance.api";
import { useAuth } from "@/hooks/useAuth";

interface HeroActiveShiftWidgetProps {
  assignments: Assignment[];
  attendance: Attendance[];
  onAttendanceUpdate?: () => void;
}

export default function HeroActiveShiftWidget({
  assignments,
  attendance,
  onAttendanceUpdate,
}: HeroActiveShiftWidgetProps) {
  const { token } = useAuth();

  // Find today's assignment
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayShift = assignments.find(
    (item) => item.dutyDate.slice(0, 10) === todayStr && item.status !== "CANCELLED"
  ) || assignments[0];

  // Find active attendance record for today's shift
  const todayAttendance = attendance.find((att) => {
    const dutyId = typeof att.duty === "string" ? att.duty : att.duty?._id;
    return dutyId === todayShift?._id;
  }) || attendance[0];

  const checkInTime = todayAttendance?.checkIn ? new Date(todayAttendance.checkIn) : null;
  const checkOutTime = todayAttendance?.checkOut ? new Date(todayAttendance.checkOut) : null;

  const isCheckedIn = Boolean(checkInTime && !checkOutTime);
  const isCompleted = Boolean(checkInTime && checkOutTime);

  // Live Elapsed Duration Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCheckedIn && checkInTime) {
      const calculateElapsed = () => {
        const now = new Date();
        const diff = Math.max(0, Math.floor((now.getTime() - checkInTime.getTime()) / 1000));
        setElapsedSeconds(diff);
      };

      calculateElapsed();
      timer = setInterval(calculateElapsed, 1000);
    } else if (isCompleted && checkInTime && checkOutTime) {
      const total = Math.max(0, Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000));
      setElapsedSeconds(total);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCheckedIn, isCompleted, checkInTime, checkOutTime]);

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const [shiftNotes, setShiftNotes] = useState("");

  const captureLocationNotes = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(shiftNotes.trim() ? `Note: ${shiftNotes.trim()}` : "Checked in via Hero Card");
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const locStr = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
            const fullNote = shiftNotes.trim() ? `${locStr} | Note: ${shiftNotes.trim()}` : locStr;
            resolve(fullNote);
          },
          () => {
            resolve(shiftNotes.trim() ? `Note: ${shiftNotes.trim()}` : "Checked in via Hero Card");
          },
          { timeout: 4000 }
        );
      }
    });
  };

  const handleCheckIn = async () => {
    if (!todayShift || !token) return;
    try {
      setActionLoading(true);
      setActionError("");
      const finalNotes = await captureLocationNotes();
      await checkInStaff(token, { duty: todayShift._id, notes: finalNotes });
      setShiftNotes("");
      onAttendanceUpdate?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to check in.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayShift || !token) return;
    try {
      setActionLoading(true);
      setActionError("");
      const finalNotes = await captureLocationNotes();
      await checkOutStaff(token, { duty: todayShift._id, notes: finalNotes });
      setShiftNotes("");
      onAttendanceUpdate?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to check out.");
    } finally {
      setActionLoading(false);
    }
  };

  const event = todayShift && typeof todayShift.event === "object" ? todayShift.event : null;

  if (!todayShift) {
    return (
      <div className="rounded-3xl border border-[#e8e1d8] bg-gradient-to-br from-[#29241f] to-[#1a1714] p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 text-amber-400">
          <Calendar size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Shift Status</span>
        </div>
        <h3 className="mt-3 text-xl font-bold">No Shift Scheduled Today</h3>
        <p className="mt-1 text-xs text-gray-400">Enjoy your day off! Check upcoming events for future shifts.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#9a6c37]/20 bg-gradient-to-br from-[#29241f] via-[#38312b] to-[#1f1b18] p-6 text-white shadow-xl">
      {/* Background Subtle Accent */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#9a6c37]/10 blur-2xl" />

      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide text-amber-200">TODAY'S ACTIVE SHIFT</span>
        </div>

        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
          isCheckedIn ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
          isCompleted ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" :
          "bg-amber-500/20 text-amber-300 border border-amber-500/40"
        }`}>
          {isCheckedIn ? "Shift Live" : isCompleted ? "Completed" : "Scheduled"}
        </span>
      </div>

      {/* Main Shift Title & Details */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">{todayShift.dutyTitle}</h2>
          <p className="mt-1 text-sm font-medium text-amber-200/80">
            {event?.eventName || "Assigned Event"} · <span className="capitalize">{todayShift.role || "Crew Member"}</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-amber-400" />
              <span>{todayShift.startTime} - {todayShift.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="text-amber-400" />
              <span>{event?.location || "Venue location pending"}</span>
            </div>
          </div>
        </div>

        {/* Live Timer Widget */}
        <div className="flex flex-col items-start justify-center rounded-2xl bg-white/5 p-4 backdrop-blur-sm lg:items-end">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Shift Elapsed Time</p>
          <div className="mt-1 font-mono text-3xl font-black tracking-wider text-amber-400">
            {formatTimer(elapsedSeconds)}
          </div>
          {checkInTime && (
            <p className="mt-1 text-[10px] text-gray-400">
              In at: {checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/20 p-3 text-xs text-red-300 border border-red-500/30">
          <AlertCircle size={15} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Optional Shift Notes & Geolocation capture */}
      {!isCompleted && (
        <div className="mt-4">
          <input
            type="text"
            value={shiftNotes}
            onChange={(e) => setShiftNotes(e.target.value)}
            placeholder="Add optional shift note or equipment status..."
            className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3.5 text-xs text-white placeholder-gray-400 outline-none backdrop-blur-md focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 border-t border-white/10 pt-4 flex flex-wrap items-center gap-3">
        {!isCheckedIn && !isCompleted && (
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={actionLoading}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <Play size={18} className="fill-white" />
            <span>{actionLoading ? "Checking In..." : "Check In Now"}</span>
          </button>
        )}

        {isCheckedIn && (
          <button
            type="button"
            onClick={handleCheckOut}
            disabled={actionLoading}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <Square size={18} className="fill-white" />
            <span>{actionLoading ? "Checking Out..." : "Check Out Shift"}</span>
          </button>
        )}

        {isCompleted && (
          <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/20 py-3 text-xs font-bold text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={16} />
            <span>Shift Completed & Logged</span>
          </div>
        )}
      </div>
    </div>
  );
}

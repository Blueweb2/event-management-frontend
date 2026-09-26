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
    <div className="relative overflow-hidden rounded-3xl border border-[#e8e1d8] bg-[#f7f2eb] shadow-sm">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#b8894b]/10" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#9a6c37]/5" />

      <div className="relative p-5 sm:p-7">

        {/* Top Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Active Shift Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e4d8c8] bg-white/80 px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#9a6c37] shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            TODAY'S ACTIVE SHIFT
          </div>

          {/* Status */}
          <span
            className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
              isCheckedIn
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : isCompleted
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {isCheckedIn
              ? "Shift Live"
              : isCompleted
              ? "Completed"
              : "Scheduled"}
          </span>
        </div>

        {/* Main Content */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">

          {/* Shift Information */}
          <div className="min-w-0">

            <h2 className="break-words text-xl font-extrabold tracking-tight text-[#29241f] sm:text-2xl">
              {todayShift.dutyTitle}
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#9a6c37] sm:text-sm">
              {event?.eventName || "Assigned Event"}{" "}
              <span className="text-[#b6a28c]">·</span>{" "}
              <span className="capitalize">
                {todayShift.role || "Crew Member"}
              </span>
            </p>

            {/* Shift Details */}
            <div className="mt-4 flex flex-wrap gap-2.5">

              <div className="inline-flex items-center gap-2 rounded-xl border border-[#e8e1d8] bg-white/80 px-3 py-2 text-xs font-medium text-[#756d64]">
                <Clock size={14} className="shrink-0 text-[#a7773f]" />
                <span>
                  {todayShift.startTime} - {todayShift.endTime}
                </span>
              </div>

              <div className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-[#e8e1d8] bg-white/80 px-3 py-2 text-xs font-medium text-[#756d64]">
                <MapPin size={14} className="shrink-0 text-[#a7773f]" />
                <span className="break-words">
                  {event?.location || "Venue location pending"}
                </span>
              </div>

            </div>
          </div>

          {/* Timer */}
          <div className="rounded-2xl border border-[#e4d8c8] bg-white px-5 py-4 shadow-sm lg:min-w-[210px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9b938a]">
              Shift Elapsed Time
            </p>

            <div className="mt-1 font-mono text-3xl font-black tracking-wider text-[#9a6c37]">
              {formatTimer(elapsedSeconds)}
            </div>

            {checkInTime && (
              <p className="mt-1 text-[10px] font-medium text-[#9b938a]">
                In at:{" "}
                {checkInTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {actionError && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Shift Notes */}
        {!isCompleted && (
          <div className="mt-5">
            <input
              type="text"
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="Add optional shift note or equipment status..."
              className="h-11 w-full rounded-xl border border-[#e3d9cd] bg-white px-3.5 text-xs text-[#403a34] placeholder-[#aaa097] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 border-t border-[#e4dcd2] pt-5">

          {!isCheckedIn && !isCompleted && (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#9a6c37] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#855b2d] active:scale-[0.98] disabled:opacity-60"
            >
              <Play size={18} className="fill-white" />
              <span>
                {actionLoading ? "Checking In..." : "Check In Now"}
              </span>
            </button>
          )}

          {isCheckedIn && (
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-60"
            >
              <Square size={18} className="fill-white" />
              <span>
                {actionLoading ? "Checking Out..." : "Check Out Shift"}
              </span>
            </button>
          )}

          {isCompleted && (
            <div className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={16} />
              <span>Shift Completed & Logged</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

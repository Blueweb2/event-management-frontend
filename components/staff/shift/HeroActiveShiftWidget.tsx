"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Play, Pause, Square, AlertCircle, CheckCircle2, Calendar, Lock } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";
import { checkInStaff, checkOutStaff, pauseStaffShift, resumeStaffShift } from "@/lib/attendance.api";
import { useAuth } from "@/hooks/useAuth";
import { formatTime24to12 } from "@/lib/duty-mapper";
import PauseShiftModal from "./PauseShiftModal";

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
  const isPaused = Boolean(todayAttendance?.isPaused);
  const pausedAtTime = todayAttendance?.pausedAt ? new Date(todayAttendance.pausedAt) : null;
  const totalPauseMins = todayAttendance?.totalPauseMinutes || 0;

  const isCheckedIn = Boolean(checkInTime && !checkOutTime);
  const isCompleted = Boolean(checkInTime && checkOutTime);

  // Live clock for 15-minute start window validation
  const [nowDate, setNowDate] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setNowDate(new Date()), 5000);
    return () => clearInterval(clockTimer);
  }, []);

  const getCheckInWindowInfo = () => {
    if (!todayShift || !todayShift.dutyDate) {
      return { canCheckIn: true, windowStartStr: "", reason: "", isWaitingForStart: false };
    }

    const shiftDate = new Date(todayShift.dutyDate);
    const isSameDate =
      nowDate.getFullYear() === shiftDate.getFullYear() &&
      nowDate.getMonth() === shiftDate.getMonth() &&
      nowDate.getDate() === shiftDate.getDate();

    if (!isSameDate) {
      const formattedDate = shiftDate.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return {
        canCheckIn: false,
        windowStartStr: formattedDate,
        reason: `Check-in opens on event date (${formattedDate})`,
        isWaitingForStart: false,
      };
    }

    // Verify manager has started the event
    const eventObj = typeof todayShift.event === "object" ? todayShift.event : null;
    const isEventStarted = eventObj
      ? eventObj.status === "IN_PROGRESS" || eventObj.status === "Ongoing"
      : false;

    if (!isEventStarted) {
      return {
        canCheckIn: false,
        windowStartStr: "",
        reason: "Waiting for manager to start the event",
        isWaitingForStart: true,
      };
    }

    if (todayShift.startTime) {
      const [hStr, mStr] = todayShift.startTime.split(":");
      const hours = Number(hStr);
      const minutes = Number(mStr || 0);

      if (Number.isInteger(hours) && Number.isInteger(minutes)) {
        const windowStart = new Date(shiftDate);
        windowStart.setHours(hours, minutes - 15, 0, 0);

        const windowStartStr = windowStart.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (nowDate < windowStart) {
          return {
            canCheckIn: false,
            windowStartStr,
            reason: `Check-in opens 15 mins before event (at ${windowStartStr})`,
            isWaitingForStart: false,
          };
        }
      }
    }

    return { canCheckIn: true, windowStartStr: "", reason: "", isWaitingForStart: false };
  };

  const checkInWindowInfo = getCheckInWindowInfo();

  // Live Minute & Second Accurate Duration Timer (excluding pause duration)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCheckedIn && checkInTime) {
      const calculateElapsed = () => {
        const now = new Date();
        const grossSecs = Math.max(0, Math.floor((now.getTime() - checkInTime.getTime()) / 1000));
        let pauseSecs = totalPauseMins * 60;
        if (isPaused && pausedAtTime) {
          pauseSecs += Math.max(0, Math.floor((now.getTime() - pausedAtTime.getTime()) / 1000));
        }
        const activeSecs = Math.max(0, grossSecs - pauseSecs);
        setElapsedSeconds(activeSecs);
      };

      calculateElapsed();
      timer = setInterval(calculateElapsed, 1000);
    } else if (isCompleted && checkInTime && checkOutTime) {
      const grossSecs = Math.max(0, Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000));
      const pauseSecs = totalPauseMins * 60;
      const activeSecs = Math.max(0, grossSecs - pauseSecs);
      setElapsedSeconds(activeSecs);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCheckedIn, isCompleted, isPaused, checkInTime, checkOutTime, pausedAtTime, totalPauseMins]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPaused && pausedAtTime) {
      const calculatePaused = () => {
        const now = new Date();
        const nowPauseSecs = Math.max(0, Math.floor((now.getTime() - pausedAtTime.getTime()) / 1000));
        setPausedSeconds(totalPauseMins * 60 + nowPauseSecs);
      };
      calculatePaused();
      timer = setInterval(calculatePaused, 1000);
    } else {
      setPausedSeconds(totalPauseMins * 60);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused, pausedAtTime, totalPauseMins]);

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
    if (!checkInWindowInfo.canCheckIn) {
      setActionError(checkInWindowInfo.reason);
      return;
    }
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

  const handleConfirmPauseShift = async (reason: string, extraNotes: string) => {
    if (!todayShift || !token) return;
    try {
      setActionLoading(true);
      setActionError("");
      const locNotes = await captureLocationNotes();
      const combinedNotes = extraNotes ? `${locNotes} | Notes: ${extraNotes}` : locNotes;
      await pauseStaffShift(token, { duty: todayShift._id, reason, notes: combinedNotes });
      setShiftNotes("");
      onAttendanceUpdate?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to pause shift.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeShift = async () => {
    if (!todayShift || !token) return;
    try {
      setActionLoading(true);
      setActionError("");
      const finalNotes = await captureLocationNotes();
      await resumeStaffShift(token, { duty: todayShift._id, notes: finalNotes });
      setShiftNotes("");
      onAttendanceUpdate?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to resume shift.");
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
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-[#29241f] px-3.5 py-1 text-xs font-semibold">
            <span className={`h-2 w-2 rounded-full ${isPaused ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
            <span className="tracking-wide text-amber-200">TODAY'S ACTIVE SHIFT</span>
          </div>

          <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            isPaused ? "bg-amber-500/20 text-amber-800 border border-amber-500/40" :
            isCheckedIn ? "bg-emerald-500/20 text-emerald-800 border border-emerald-500/40" :
            isCompleted ? "bg-blue-500/20 text-blue-800 border border-blue-500/40" :
            checkInWindowInfo.isWaitingForStart ? "bg-amber-500/20 text-amber-800 border border-amber-500/40" :
            "bg-emerald-500/20 text-emerald-800 border border-emerald-500/40"
          }`}>
            {isPaused
              ? "⏸️ Shift Paused (Break)"
              : isCheckedIn
              ? "Shift Live"
              : isCompleted
              ? "Completed"
              : checkInWindowInfo.isWaitingForStart
              ? "Waiting for Event to Start"
              : "Event Started – Clock In Available"}
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

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-[#9a6c37]" />
                <span>{formatTime24to12(todayShift.startTime)} - {formatTime24to12(todayShift.endTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-[#9a6c37]" />
                <span>{event?.location || "Venue location pending"}</span>
              </div>
            </div>
          </div>

          {/* Live Active Work Time / Paused Timer Widget */}
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white p-4 border border-[#e8e1d8] shadow-xs lg:items-end">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              {isPaused ? "DUTY PAUSED" : "ACTIVE DUTY"}
            </p>
            <div className={`mt-1 font-mono text-3xl font-black tracking-wider ${isPaused ? "text-amber-600" : "text-emerald-600"}`}>
              {formatTimer(isPaused ? pausedSeconds : elapsedSeconds)}
            </div>
            <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-gray-500 lg:text-right">
              {isPaused ? (
                <span className="text-emerald-700 font-medium">Active so far: {formatTimer(elapsedSeconds)}</span>
              ) : (
                checkInTime && (
                  <span>Started: {checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                )
              )}
              {totalPauseMins > 0 && (
                <span className="text-amber-700">({totalPauseMins} mins total break logged)</span>
              )}
            </div>
          </div>
        </div>

        {/* Check-In Window Rule Banner (If before 15 mins) */}
        {!isCheckedIn && !isCompleted && !checkInWindowInfo.canCheckIn && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
            <Lock size={15} className="shrink-0 text-amber-600" />
            <span>{checkInWindowInfo.reason}</span>
          </div>
        )}

        {/* Error Banner */}
        {actionError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
            <AlertCircle size={15} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Shift Notes */}
        {!isCompleted && (
          <div className="mt-4">
            <input
              type="text"
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="Add optional shift note or break remarks..."
              className="h-10 w-full rounded-xl border border-[#e3d9cd] bg-white px-3.5 text-xs text-[#403a34] placeholder-[#aaa097] outline-none transition focus:border-[#b8894b] focus:ring-1 focus:ring-[#b8894b]/10"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 border-t border-[#e4dcd2] pt-4 flex flex-wrap items-center gap-3">
          {!isCheckedIn && !isCompleted && (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={actionLoading || !checkInWindowInfo.canCheckIn}
              className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl px-6 text-sm font-bold text-white shadow-md transition ${
                checkInWindowInfo.canCheckIn
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-75"
              }`}
            >
              {checkInWindowInfo.canCheckIn ? (
                <Play size={18} className="fill-white" />
              ) : (
                <Lock size={18} />
              )}
              <span>
                {actionLoading
                  ? "Checking In..."
                  : checkInWindowInfo.canCheckIn
                  ? "Check In Now"
                  : checkInWindowInfo.isWaitingForStart
                  ? "Waiting for manager to start the event"
                  : checkInWindowInfo.reason}
              </span>
            </button>
          )}

          {isCheckedIn && (
            <>
              {/* Pause / Resume Button */}
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResumeShift}
                  disabled={actionLoading}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 px-5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  <Play size={18} className="fill-white" />
                  <span>{actionLoading ? "Resuming..." : "Resume Shift"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPauseModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  <Pause size={18} className="fill-white" />
                  <span>{actionLoading ? "Pausing..." : "Pause Shift (Break)"}</span>
                </button>
              )}

              {/* Check Out Button */}
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                <Square size={18} className="fill-white" />
                <span>{actionLoading ? "Checking Out..." : "Check Out Shift"}</span>
              </button>
            </>
          )}

          {isCompleted && (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-xs font-bold text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={16} />
              <span>Shift Completed ({todayAttendance?.totalHours || 0} active hrs logged)</span>
            </div>
          )}
        </div>

        {/* Pause Shift Modal with Reasons */}
        <PauseShiftModal
          isOpen={isPauseModalOpen}
          onClose={() => setIsPauseModalOpen(false)}
          onConfirm={handleConfirmPauseShift}
        />
      </div>9ac7827
    </div>
  );
}


"use client";

import { useState } from "react";
import { Clock, User, PauseCircle, PlayCircle, CheckCircle2, History, AlertCircle } from "lucide-react";

interface Session {
  type: "CLOCK_IN" | "PAUSE" | "RESUME" | "CLOCK_OUT";
  timestamp: string;
  reason?: string;
  notes?: string;
}

interface StaffAttendanceItem {
  attendanceId: string | null;
  assignmentId: string;
  dutyTitle: string;
  staff: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: "ACTIVE" | "PAUSED" | "CLOCKED_OUT" | "NOT_CLOCKED";
  checkInTime: string | null;
  checkOutTime: string | null;
  activeDutyMinutes: number;
  totalPauseMinutes: number;
  pauseReason: string | null;
  sessions: Session[];
}

interface EventStaffAttendanceCardProps {
  attendanceData: StaffAttendanceItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function EventStaffAttendanceCard({
  attendanceData,
  loading = false,
  onRefresh,
}: EventStaffAttendanceCardProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffAttendanceItem | null>(null);

  const getStatusBadge = (status: StaffAttendanceItem["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Shift
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <PauseCircle className="w-3.5 h-3.5" />
            On Break
          </span>
        );
      case "CLOCKED_OUT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Shift Completed
          </span>
        );
      case "NOT_CLOCKED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Not Clocked In
          </span>
        );
    }
  };

  const formatMinutes = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`;
    }
    return `${remainingMins}m`;
  };

  const formatTime12h = (dateStr: string | null) => {
    if (!dateStr) return "--:--";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const activeCount = attendanceData.filter((item) => item.status === "ACTIVE").length;
  const pausedCount = attendanceData.filter((item) => item.status === "PAUSED").length;
  const completedCount = attendanceData.filter((item) => item.status === "CLOCKED_OUT").length;

  return (
    <div className="rounded-2xl border border-[#9a6c37]/20 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-[#29241f] flex items-center gap-2">
            <User className="w-5 h-5 text-[#9a6c37]" />
            Staff Shift & Attendance Tracker
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time active duty hours, breaks, and shift timeline for assigned staff
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-emerald-600 font-semibold">{activeCount} Active</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-600 font-semibold">{pausedCount} Paused</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-semibold">{completedCount} Done</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-[#9a6c37] transition-colors rounded-lg hover:bg-slate-100"
              title="Refresh attendance"
            >
              <Clock className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {attendanceData.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No staff assignments found for this event.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Assigned Duty</th>
                <th className="py-3 px-4">Shift Status</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Active Duty</th>
                <th className="py-3 px-4">Break Time</th>
                <th className="py-3 px-4 text-right">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {attendanceData.map((item) => (
                <tr key={item.assignmentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{item.staff.name}</div>
                    <div className="text-xs text-slate-400">{item.staff.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.dutyTitle}</td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(item.status)}
                    {item.status === "PAUSED" && item.pauseReason && (
                      <div className="text-[11px] text-amber-700 mt-1 italic">
                        Reason: {item.pauseReason}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    <div>In: {formatTime12h(item.checkInTime)}</div>
                    {item.checkOutTime && <div>Out: {formatTime12h(item.checkOutTime)}</div>}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">
                    {formatMinutes(item.activeDutyMinutes)}
                  </td>
                  <td className="py-3.5 px-4 text-amber-700 font-medium">
                    {formatMinutes(item.totalPauseMinutes)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedStaff(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#9a6c37] bg-[#9a6c37]/10 hover:bg-[#9a6c37]/20 rounded-lg transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      Session Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Session History Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{selectedStaff.staff.name}</h4>
                <p className="text-xs text-slate-500">Duty: {selectedStaff.dutyTitle}</p>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Total Active Duty:</span>
                  <p className="font-bold text-emerald-700 text-sm">
                    {formatMinutes(selectedStaff.activeDutyMinutes)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Total Paused:</span>
                  <p className="font-bold text-amber-700 text-sm">
                    {formatMinutes(selectedStaff.totalPauseMinutes)}
                  </p>
                </div>
              </div>

              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Session Timeline Events
              </h5>

              {selectedStaff.sessions && selectedStaff.sessions.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-1">
                  {selectedStaff.sessions.map((session, idx) => (
                    <div key={idx} className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-[#9a6c37]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{session.type}</span>
                        <span className="text-slate-400">{formatTime12h(session.timestamp)}</span>
                      </div>
                      {session.reason && (
                        <p className="text-xs text-amber-700 mt-0.5">Reason: {session.reason}</p>
                      )}
                      {session.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">{session.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No session logs recorded yet.
                </p>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

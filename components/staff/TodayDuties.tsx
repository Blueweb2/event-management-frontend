"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, ChevronDown, ChevronUp, CheckCircle2, Play } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { formatTime24to12 } from "@/lib/duty-mapper";

export default function TodayDuties({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const [expandedDutyIds, setExpandedDutyIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedDutyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const now = new Date();
  const todayLocalYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayUTC = now.toISOString().slice(0, 10);

  const isCompletedDutyStatus = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "settled" || s === "invoiced" || s === "cancelled";
  };

  // Filter duties relevant for today / active
  const duties = assignments.filter((item) => {
    const d = item.dutyDate ? item.dutyDate.slice(0, 10) : "";
    if (d === todayLocalYMD || d === todayUTC) return true;
    const ev = typeof item.event === "object" && item.event !== null ? item.event : null;
    const evStatus = (ev?.status || "").toLowerCase();
    if (ev && (evStatus === "in_progress" || evStatus === "ongoing") && !isCompletedDutyStatus(ev.status)) return true;
    return (item.status || "").toLowerCase() === "in_progress" && !isCompletedDutyStatus(item.status);
  });

  const inProgressDuties = duties.filter((d) => {
    if (isCompletedDutyStatus(d.status)) return false;
    const ev = typeof d.event === "object" && d.event !== null ? d.event : null;
    if (ev && isCompletedDutyStatus(ev.status)) return false;
    const s = (d.status || "").toLowerCase();
    const evS = (ev?.status || "").toLowerCase();
    return s === "in_progress" || evS === "in_progress" || evS === "ongoing";
  });
  const inProgressIds = new Set(inProgressDuties.map((d) => d._id));

  const upcomingDuties = duties.filter(
    (d) => !inProgressIds.has(d._id) && !isCompletedDutyStatus(d.status)
  );
  const upcomingIds = new Set(upcomingDuties.map((d) => d._id));

  const completedDuties = duties.filter(
    (d) => !inProgressIds.has(d._id) && !upcomingIds.has(d._id)
  );

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-[#e8e1d8] bg-white p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#29241f]">
            Today&apos;s Assigned Duties
          </h2>
          <p className="text-xs text-[#756d64]">Live shifts and tasks assigned to you</p>
        </div>
        <Link
          href="/staff/duties"
          className="text-xs font-semibold text-[#9a6c37] hover:underline"
        >
          View All Duties
        </Link>
      </div>

      {duties.length === 0 ? (
        <p className="rounded-2xl bg-[#fdfcfb] p-4 text-xs sm:text-sm text-gray-500 text-center">
          No duties assigned for today.
        </p>
      ) : (
        <div className="space-y-3">
          {/* 1. In-Progress Duties (Top-most Full View) */}
          {inProgressDuties.map((duty) => {
            const event = typeof duty.event === "string" ? null : duty.event;
            return (
              <div
                key={duty._id}
                className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    In-Progress Shift
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Live Active Duty
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#29241f]">
                    {duty.dutyTitle}
                  </h3>
                  <p className="text-xs font-medium text-[#9a6c37]">
                    {event?.eventName || "Assigned Event"} · <span className="capitalize">{duty.role || "Crew"}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Clock3 size={12} className="text-[#9a6c37]" />
                      {formatTime24to12(duty.startTime)} - {formatTime24to12(duty.endTime)}
                    </span>
                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin size={12} className="text-[#9a6c37] shrink-0" />
                      <span className="truncate">{event?.location || "Venue location pending"}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 2. Upcoming Scheduled Duties (Middle Full View) */}
          {upcomingDuties.map((duty) => {
            const event = typeof duty.event === "string" ? null : duty.event;
            return (
              <div
                key={duty._id}
                className="flex flex-col gap-2.5 rounded-2xl border border-gray-100 bg-[#fdfcfb] p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#29241f] break-words">
                      {duty.dutyTitle}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                      {duty.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {event?.eventName || "Assigned event"} · <span className="capitalize">{duty.role || "Crew"}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} className="text-[#9a6c37]" />
                      {formatTime24to12(duty.startTime)} - {formatTime24to12(duty.endTime)}
                    </span>
                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin size={12} className="text-[#9a6c37] shrink-0" />
                      <span className="truncate">{event?.location || "Location pending"}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 3. Completed Duties (Bottom Small Compact Card + Click to Elaborate) */}
          {completedDuties.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Completed Shifts
              </p>
              {completedDuties.map((duty) => {
                const event = typeof duty.event === "string" ? null : duty.event;
                const isExpanded = expandedDutyIds.has(duty._id);

                return (
                  <div
                    key={duty._id}
                    onClick={() => toggleExpand(duty._id)}
                    className="cursor-pointer rounded-2xl border border-gray-200/70 bg-[#faf8f5] p-3 text-xs transition hover:border-[#9a6c37]/40 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-bold text-gray-800 truncate">
                          {duty.dutyTitle}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          ({formatTime24to12(duty.startTime)} - {formatTime24to12(duty.endTime)})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Done
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Elaborated View on Click */}
                    {isExpanded && (
                      <div className="mt-3 pt-2.5 border-t border-gray-200/60 space-y-1.5 text-[11px] text-gray-600 animate-in fade-in">
                        <p>
                          <strong className="text-gray-900">Event:</strong> {event?.eventName || "Assigned event"}
                        </p>
                        <p>
                          <strong className="text-gray-900">Role:</strong> {duty.role || "Crew Member"}
                        </p>
                        {event?.location && (
                          <p>
                            <strong className="text-gray-900">Location:</strong> {event.location}
                          </p>
                        )}
                        {duty.notes && (
                          <p className="text-gray-500 italic">
                            Notes: {duty.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}



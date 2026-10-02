"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, ChevronDown, ChevronUp, Activity, CheckCircle2 } from "lucide-react";
import type { Assignment } from "@/types/assignment";

export default function StaffUpcomingEvents({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const distinctEvents = Array.from(
    new Map(
      assignments.map((item) => [
        typeof item.event === "string" ? item.event : item.event?._id,
        item,
      ])
    ).values()
  );

  const isCompletedEventStatus = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "settled" || s === "invoiced" || s === "cancelled";
  };

  const isEventToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
  };

  // 1. In-Progress Events (Top-most Full View - ONLY today's active in-progress events)
  const inProgressEvents = distinctEvents.filter((item) => {
    const ev = typeof item.event === "object" && item.event !== null ? item.event : null;
    if (!ev || isCompletedEventStatus(ev.status) || isCompletedEventStatus(item.status)) return false;
    const s = (ev.status || "").toLowerCase();
    return (s === "in_progress" || s === "ongoing") && isEventToday(ev.eventDate);
  });
  const inProgressIds = new Set(inProgressEvents.map((e) => e._id));

  // 2. Upcoming Events (Date >= today, not in-progress and not completed)
  const upcomingEvents = distinctEvents.filter((item) => {
    if (inProgressIds.has(item._id)) return false;
    const dateStr = typeof item.event === "object" ? item.event?.eventDate : null;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const isCompleted = isCompletedEventStatus(item.status) || (typeof item.event === "object" && isCompletedEventStatus(item.event?.status));
    if (isCompleted) return false;
    const eventEnd = new Date(d);
    eventEnd.setHours(23, 59, 59, 999);
    return eventEnd.getTime() >= todayStart.getTime();
  }).sort((a, b) => {
    const dateA = typeof a.event === "object" && a.event?.eventDate ? new Date(a.event.eventDate).getTime() : 0;
    const dateB = typeof b.event === "object" && b.event?.eventDate ? new Date(b.event.eventDate).getTime() : 0;
    return dateA - dateB;
  });
  const upcomingIds = new Set(upcomingEvents.map((e) => e._id));

  // 3. Completed & Past Events (Bottom small cards)
  const completedEvents = distinctEvents.filter(
    (item) => !inProgressIds.has(item._id) && !upcomingIds.has(item._id)
  );

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-[#e8e1d8] bg-white p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#29241f]">
            Assigned Events
          </h2>
          <p className="text-xs text-[#756d64]">
            Events linked to your scheduled shifts
          </p>
        </div>
        <Link
          href="/staff/events"
          className="text-xs font-semibold text-[#9a6c37] hover:underline"
        >
          View All
        </Link>
      </div>

      {distinctEvents.length === 0 ? (
        <p className="rounded-2xl bg-[#fdfcfb] p-4 text-xs sm:text-sm text-gray-500 text-center">
          No assigned events yet.
        </p>
      ) : (
        <div className="space-y-3">
          {/* 1. In-Progress Events (Top-most) */}
          {inProgressEvents.map((item) => {
            const event = typeof item.event === "string" ? null : item.event;
            return (
              <div
                key={item._id}
                className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-3.5 sm:p-4 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    Live In-Progress Event
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <Activity size={12} /> Active
                  </span>
                </div>
                <div className="mt-2 flex items-start gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs sm:text-sm font-bold text-[#29241f]">
                      {event?.eventName || "Assigned event"}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {event?.eventDate
                        ? new Date(event.eventDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
                        : "Today"}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin size={11} className="shrink-0 text-[#9a6c37]" />
                      <span className="truncate">{event?.location || "Location pending"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 2. Upcoming Events (Middle) */}
          {upcomingEvents.map((item) => {
            const event = typeof item.event === "string" ? null : item.event;
            return (
              <div
                key={item._id}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-[#fdfcfb] p-3 sm:p-3.5"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5ede3] text-[#9a6c37]">
                  <CalendarDays size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs sm:text-sm font-bold text-[#29241f]">
                    {event?.eventName || "Assigned event"}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {event?.eventDate
                      ? new Date(event.eventDate).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })
                      : "Date pending"}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin size={11} className="shrink-0 text-[#9a6c37]" />
                    <span className="truncate">{event?.location || "Location pending"}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 3. Completed Events (Bottom small cards + click to elaborate) */}
          {completedEvents.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Completed Events
              </p>
              {completedEvents.map((item) => {
                const event = typeof item.event === "string" ? null : item.event;
                const isExpanded = expandedEventIds.has(item._id);

                return (
                  <div
                    key={item._id}
                    onClick={() => toggleExpand(item._id)}
                    className="cursor-pointer rounded-2xl border border-gray-200/70 bg-[#faf8f5] p-3 text-xs transition hover:border-[#9a6c37]/40 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-bold text-gray-800 truncate">
                          {event?.eventName || item.dutyTitle}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {event?.eventDate ? new Date(event.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Completed
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Elaborated View on Click */}
                    {isExpanded && (
                      <div className="mt-3 pt-2.5 border-t border-gray-200/60 space-y-1.5 text-[11px] text-gray-600 animate-in fade-in">
                        <p>
                          <strong className="text-gray-900">Duty:</strong> {item.dutyTitle} ({item.role || "Crew"})
                        </p>
                        {event?.location && (
                          <p>
                            <strong className="text-gray-900">Venue:</strong> {event.location}
                          </p>
                        )}
                        <p>
                          <strong className="text-gray-900">Time:</strong> {item.startTime} - {item.endTime}
                        </p>
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


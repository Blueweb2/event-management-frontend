"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Building2,
  IndianRupee,
  ExternalLink,
  Info,
  XCircle,
  Clock,
  Sparkles,
  CheckSquare,
} from "lucide-react";

import { formatTime24to12 } from "@/lib/time-utils";
import { calculateHoursFromTime } from "@/lib/duty-mapper";
import type { Assignment, AssignmentStatus } from "@/types/assignment";
import type { Staff } from "@/types/staff";

interface StaffScheduleSectionProps {
  staff: Staff;
  duties: Assignment[];
  loading: boolean;
  onRefresh?: () => void;
}

export default function StaffScheduleSection({
  staff,
  duties,
  loading,
}: StaffScheduleSectionProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UPCOMING" | AssignmentStatus>("ALL");

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // 1. Conflict Detection: Identify if this staff has overlapping duty time slots on the same date
  const conflictsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const dateMap = new Map<string, Assignment[]>();

    duties.forEach((d) => {
      if (d.status === "CANCELLED" || d.status === "REJECTED") return;
      const dDate = d.dutyDate ? d.dutyDate.slice(0, 10) : "";
      if (!dDate) return;

      const list = dateMap.get(dDate) || [];
      list.push(d);
      dateMap.set(dDate, list);
    });

    dateMap.forEach((dateDuties) => {
      if (dateDuties.length < 2) return;

      for (let i = 0; i < dateDuties.length; i++) {
        for (let j = i + 1; j < dateDuties.length; j++) {
          const a = dateDuties[i];
          const b = dateDuties[j];

          if (a.startTime && a.endTime && b.startTime && b.endTime) {
            if (a.startTime < b.endTime && b.startTime < a.endTime) {
              const aConflicts = map.get(a._id) || [];
              aConflicts.push(`Overlaps with "${b.dutyTitle}" (${formatTime24to12(b.startTime)} - ${formatTime24to12(b.endTime)})`);
              map.set(a._id, aConflicts);

              const bConflicts = map.get(b._id) || [];
              bConflicts.push(`Overlaps with "${a.dutyTitle}" (${formatTime24to12(a.startTime)} - ${formatTime24to12(a.endTime)})`);
              map.set(b._id, bConflicts);
            }
          }
        }
      }
    });

    return map;
  }, [duties]);

  // 2. Metrics calculation
  const metrics = useMemo(() => {
    let totalHours = 0;
    let upcomingCount = 0;
    let completedCount = 0;
    let acceptedCount = 0;
    let pendingCount = 0;
    let totalPay = 0;

    duties.forEach((d) => {
      const hours = d.totalHours || calculateHoursFromTime(d.startTime, d.endTime);
      const rate = d.hourlyRate || 0;
      const pay = d.totalAmount || hours * rate;

      totalHours += hours;
      totalPay += pay;

      const dDate = d.dutyDate ? d.dutyDate.slice(0, 10) : "";
      if (dDate >= todayStr && d.status !== "CANCELLED" && d.status !== "REJECTED") {
        upcomingCount++;
      }

      if (d.status === "COMPLETED") completedCount++;
      if (d.status === "ACCEPTED") acceptedCount++;
      if (d.status === "ASSIGNED") pendingCount++;
    });

    return {
      totalDuties: duties.length,
      upcomingCount,
      completedCount,
      acceptedCount,
      pendingCount,
      totalHours,
      totalPay,
      conflictsCount: conflictsMap.size,
    };
  }, [duties, todayStr, conflictsMap]);

  // 3. Filtered duties
  const filteredDuties = useMemo(() => {
    return duties.filter((d) => {
      const dDate = d.dutyDate ? d.dutyDate.slice(0, 10) : "";

      // Status filter
      if (statusFilter === "UPCOMING") {
        if (dDate < todayStr || d.status === "CANCELLED" || d.status === "REJECTED") return false;
      } else if (statusFilter !== "ALL") {
        if (d.status !== statusFilter) return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const eventObj = typeof d.event === "object" && d.event !== null ? d.event : null;
        const eventName = eventObj?.eventName?.toLowerCase() || "";
        const location = eventObj?.location?.toLowerCase() || "";
        const dutyTitle = (d.dutyTitle || "").toLowerCase();
        const department = (d.department || "").toLowerCase();

        return (
          eventName.includes(query) ||
          location.includes(query) ||
          dutyTitle.includes(query) ||
          department.includes(query) ||
          dDate.includes(query)
        );
      }

      return true;
    });
  }, [duties, statusFilter, search, todayStr]);

  return (
    <section className="space-y-5">
      {/* ========================================================
          KPI SUMMARY STATS FOR THIS STAFF'S SCHEDULE
      ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={16} className="text-[#9A7B4F]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Shifts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">{metrics.totalDuties}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Assigned to {staff.name}</p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-blue-700">
            <Clock3 size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Upcoming</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-900">{metrics.upcomingCount}</p>
          <p className="text-[11px] text-blue-600/80 mt-0.5">Future scheduled shifts</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{metrics.completedCount}</p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Duties finished</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Hours</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-950">{metrics.totalHours.toFixed(1)} <span className="text-xs font-normal text-amber-700">hrs</span></p>
          <p className="text-[11px] text-amber-700/80 mt-0.5">₹{metrics.totalPay.toLocaleString("en-IN")} total est. pay</p>
        </div>
      </div>

      {/* ========================================================
          SCHEDULE OVERLAP CONFLICT BANNER
      ======================================================== */}
      {metrics.conflictsCount > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Scheduling Overlap Detected ({metrics.conflictsCount} shift{metrics.conflictsCount > 1 ? "s" : ""})
              </h4>
              <p className="mt-1 text-xs text-rose-700 leading-relaxed">
                {staff.name} is assigned to multiple overlapping duties on the same calendar day. Please review the highlighted shifts below to adjust reporting times or reassign staff.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FILTER & SEARCH CONTROLS
      ======================================================== */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, duties, venues, or dates..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2 pl-10 pr-4 text-xs text-gray-900 placeholder-gray-400 focus:border-[#9A7B4F] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#9A7B4F]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-[#29241f] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({metrics.totalDuties})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("UPCOMING")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "UPCOMING"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Upcoming ({metrics.upcomingCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("ACCEPTED")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "ACCEPTED"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Confirmed ({metrics.acceptedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("COMPLETED")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              statusFilter === "COMPLETED"
                ? "bg-gray-800 text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed ({metrics.completedCount})
          </button>
        </div>
      </div>

      {/* ========================================================
          ASSIGNMENT & SCHEDULE SHIFT CARDS
      ======================================================== */}
      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8">
          <Clock3 className="h-7 w-7 animate-spin text-[#9A7B4F]" />
          <p className="mt-3 text-xs font-medium text-gray-500">Loading schedule and assigned duties for {staff.name}...</p>
        </div>
      ) : filteredDuties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EBDD] text-[#9A7B4F]">
            <CalendarDays size={24} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-gray-900">No shifts match criteria</h3>
          <p className="mt-1 text-xs text-gray-500">
            {duties.length === 0
              ? `${staff.name} has not been assigned to any event shifts yet.`
              : "Try adjusting your search filters or status options."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredDuties.map((duty) => {
            const eventObj = typeof duty.event === "object" && duty.event !== null ? duty.event : null;
            const eventId = eventObj?._id || (typeof duty.event === "string" ? duty.event : "");
            const eventName = eventObj?.eventName || "Event Shift";
            const eventType = eventObj?.eventType || "Event";
            const location = eventObj?.location || "Venue location unset";

            const hours = duty.totalHours || calculateHoursFromTime(duty.startTime, duty.endTime);
            const rate = duty.hourlyRate || staff.hourlyRate || 0;
            const pay = duty.totalAmount || hours * rate;

            const conflicts = conflictsMap.get(duty._id);
            const isConflicted = Boolean(conflicts && conflicts.length > 0);

            // Format date
            let formattedDate = duty.dutyDate ? duty.dutyDate.slice(0, 10) : "";
            let weekday = "";
            if (formattedDate) {
              const d = new Date(formattedDate + "T00:00:00");
              if (!isNaN(d.getTime())) {
                weekday = d.toLocaleDateString("en-US", { weekday: "short" });
              }
            }

            return (
              <article
                key={duty._id}
                className={`relative rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                  isConflicted
                    ? "border-rose-300 ring-2 ring-rose-200/60"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Top Bar: Date, Shift Times, and Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Date Tag */}
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#faf7f2] border border-[#e8e1d8] px-3 py-1 text-xs font-bold text-[#29241f]">
                      <Calendar size={13} className="text-[#9A7B4F]" />
                      <span>{weekday ? `${weekday}, ` : ""}{formattedDate}</span>
                    </div>

                    {/* Time Tag */}
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                      <Clock size={13} className="text-gray-400" />
                      <span>
                        {formatTime24to12(duty.startTime)} – {formatTime24to12(duty.endTime)}
                      </span>
                      <span className="text-[10px] text-gray-400">({hours.toFixed(1)} hrs)</span>
                    </div>
                  </div>

                  {/* Shift Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        duty.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : duty.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-800 border border-blue-200 animate-pulse"
                          : duty.status === "COMPLETED"
                          ? "bg-gray-100 text-gray-800 border border-gray-200"
                          : duty.status === "REJECTED"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : duty.status === "CANCELLED"
                          ? "bg-gray-100 text-gray-500 border border-gray-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {duty.status === "ACCEPTED" ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Confirmed Shift</span>
                        </>
                      ) : duty.status === "REJECTED" ? (
                        <>
                          <XCircle size={12} />
                          <span>Shift Declined</span>
                        </>
                      ) : (
                        <span>{duty.status}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Overlap Conflict Callout on Card */}
                {isConflicted && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold">Timing Overlap Conflict</p>
                      <ul className="mt-0.5 list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                        {conflicts?.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Main Content: Event details & Duty info */}
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {/* Event & Location (Col 1 & 2) */}
                  <div className="lg:col-span-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200/80">
                        {eventType}
                      </span>
                      {duty.department && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#faf7f2] px-2 py-0.5 text-[10px] font-bold text-[#9A7B4F] border border-[#e8e1d8]">
                          <Building2 size={11} />
                          {duty.department}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {eventName}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={13} className="shrink-0 text-gray-400" />
                      <span>{location}</span>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-bold text-[#29241f] flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#9A7B4F]" />
                        <span>Duty Assigned:</span>
                        <span className="text-gray-700 font-semibold">{duty.dutyTitle}</span>
                      </p>
                      {duty.description && (
                        <p className="mt-1 text-xs text-gray-500 leading-relaxed bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                          {duty.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial & Compensation (Col 3) */}
                  <div className="rounded-xl border border-gray-100 bg-[#fbf9f6] p-3.5 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Shift Compensation</p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-emerald-900">
                          ₹{pay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {rate > 0 ? `Calculated @ ₹${rate}/hr × ${hours.toFixed(1)} hrs` : "Standard salary basis"}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-gray-400">Payment:</span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            duty.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {duty.paymentStatus === "PAID" ? "PAID" : "PENDING"}
                        </span>
                      </div>
                    </div>

                    {eventId && (
                      <Link
                        href={`/manager/events/${eventId}`}
                        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-200 py-2 text-xs font-bold text-gray-700 shadow-xs transition hover:bg-gray-50 hover:text-gray-900"
                      >
                        <ExternalLink size={13} />
                        <span>View Event Details</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Duty Checklist Section */}
                {duty.checklist && duty.checklist.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <CheckSquare size={14} className="text-[#9A7B4F]" />
                      <span>Shift Checklist ({duty.checklist.filter((c) => c.completed).length} / {duty.checklist.length} done):</span>
                    </div>

                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                      {duty.checklist.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className={`flex items-center gap-2 rounded-xl p-2 text-xs transition ${
                            item.completed
                              ? "bg-emerald-50/60 text-emerald-800 line-through"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm ${
                              item.completed ? "bg-emerald-600 text-white" : "border border-gray-300 bg-white"
                            }`}
                          >
                            {item.completed && <CheckCircle2 size={12} />}
                          </span>
                          <span className="truncate">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection / Decline Notice */}
                {duty.status === "REJECTED" && duty.rejectionReason && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <Info size={15} className="mt-0.5 shrink-0 text-rose-600" />
                    <div>
                      <span className="font-bold">Decline Reason Provided: </span>
                      <span>&ldquo;{duty.rejectionReason}&rdquo;</span>
                    </div>
                  </div>
                )}

                {/* Special Manager Notes */}
                {duty.notes && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs text-amber-900">
                    <Info size={14} className="mt-0.5 shrink-0 text-amber-700" />
                    <div>
                      <span className="font-bold">Shift Notes: </span>
                      <span>{duty.notes}</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

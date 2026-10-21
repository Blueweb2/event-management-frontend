"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  ArrowRight,
  Loader2,
  DollarSign,
  Utensils,
  Layers,
  Phone,
  Mail,
  Edit,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { Estimate } from "@/lib/estimates.api";

interface EstimateListProps {
  estimates: Estimate[];
  loading?: boolean;
  onAccept: (estimate: Estimate) => Promise<void>;
  onExport: (estimate: Estimate) => void;
  onReject?: (estimate: Estimate) => Promise<void>;
  acceptingId: string | null;
}

export default function EstimateList({
  estimates,
  loading = false,
  onAccept,
  onExport,
  onReject,
  acceptingId,
}: EstimateListProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
          <Loader2 size={20} className="animate-spin text-[#9a6c37]" />
          <span>Loading booking estimates...</span>
        </div>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
          <FileText size={26} />
        </div>
        <h3 className="mt-4 text-base font-black text-[#252525]">
          No Pending Booking Estimates
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-gray-500">
          All booking estimates have either been accepted and converted into events,
          or none have been created yet.
        </p>
        <div className="mt-5">
          <Link
            href="/manager/booking"
            className="inline-flex items-center gap-2 rounded-xl bg-[#252525] px-4 py-2.5 text-xs font-bold text-white hover:bg-black transition active:scale-95"
          >
            <Sparkles size={14} className="text-[#D4AF37]" />
            <span>Create New Booking Proposal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estimates.map((est) => {
        const isAccepting = acceptingId === est._id;
        const isRejecting = rejectingId === est._id;
        const isConverted = Boolean(est.convertedToEvent || (est.status as string) === "CONVERTED");

        const isDateOver = (() => {
          if (!est.eventDate) return false;
          const d = new Date(est.eventDate);
          if (isNaN(d.getTime())) return false;
          const endOfDay = new Date(d);
          endOfDay.setHours(23, 59, 59, 999);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return endOfDay.getTime() < today.getTime();
        })();

        const foodItemsCount = est.foodMenu?.items?.length || 0;
        const servicesCount = est.items?.length || 0;

        return (
          <div
            key={est._id}
            className={`rounded-3xl border bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md ${
              isConverted
                ? "border-emerald-200 bg-emerald-50/20"
                : isDateOver
                ? "border-gray-200 bg-gray-50/40 opacity-75"
                : "border-[#e8e1d8] hover:border-[#9a6c37]"
            }`}
          >
            {/* Header: Estimate Number, Status, Created Date */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-xl bg-stone-100 px-3 py-1 font-mono text-xs font-black text-stone-800 border border-stone-200">
                  {est.estimateNumber || `EST-${est._id.slice(-6).toUpperCase()}`}
                </span>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                    isConverted
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : isDateOver
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : est.status === "ACCEPTED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : est.status === "CANCELLED"
                      ? "bg-stone-100 text-stone-600 border border-stone-200"
                      : est.status === "REJECTED"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-100 text-amber-900 border border-amber-200"
                  }`}
                >
                  {isConverted
                    ? "✓ Converted to Event"
                    : isDateOver
                    ? "Date Over / Expired"
                    : est.status === "ACCEPTED"
                    ? "Accepted"
                    : est.status === "CANCELLED"
                    ? "Cancelled"
                    : est.status === "DRAFT"
                    ? "Pending Acceptance"
                    : est.status}
                </span>

                <span className="text-xs text-gray-400">
                  Created {new Date(est.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Total Quotation Amount */}
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Total Estimate
                </p>
                <p className="text-lg sm:text-xl font-black text-[#29241f]">
                  ₹{Number(est.total || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Middle: Event Title, Details, Venue, and Client */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              {/* Event Info (Span 2) */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-[#29241f]">
                    {est.eventName}
                  </h3>
                  <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-700">
                    {est.eventType}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1 font-semibold text-[#9a6c37]">
                    <Calendar size={14} />
                    {est.eventDate
                      ? new Date(est.eventDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Date TBD"}
                  </span>

                  {est.eventTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {est.eventTime}
                    </span>
                  )}

                  <span className="flex items-center gap-1 font-bold text-gray-800">
                    <Users size={14} className="text-stone-500" />
                    {est.guests} Guests
                  </span>

                  {est.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {est.location}
                    </span>
                  )}
                </div>

                {est.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {est.description}
                  </p>
                )}

                {/* Included Services & Catering Summary */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[11px] font-bold uppercase text-stone-400 mr-1">
                    Includes:
                  </span>
                  {servicesCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-800 border border-stone-200">
                      <Layers size={12} className="text-stone-600" />
                      <span>{servicesCount} Services</span>
                    </span>
                  )}

                  {foodItemsCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
                      <Utensils size={12} className="text-[#9a6c37]" />
                      <span>Catering ({foodItemsCount} Dishes)</span>
                    </span>
                  )}

                  {est.items?.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 border border-gray-100"
                    >
                      {item.serviceName}
                    </span>
                  ))}
                  {servicesCount > 3 && (
                    <span className="text-[10px] text-gray-400">
                      +{servicesCount - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Client Info (Span 1) */}
              <div className="rounded-2xl bg-[#faf8f5] p-3.5 border border-stone-200 space-y-1.5 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Client Details
                </p>
                <p className="font-bold text-gray-900 text-sm">
                  {est.client?.name || "Client"}
                </p>
                {est.client?.phone && (
                  <a
                    href={`tel:${est.client.phone}`}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-black"
                  >
                    <Phone size={13} className="text-gray-400" />
                    <span>{est.client.phone}</span>
                  </a>
                )}
                {est.client?.email && (
                  <a
                    href={`mailto:${est.client.email}`}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-black truncate"
                  >
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{est.client.email}</span>
                  </a>
                )}
                {est.client?.referralSource && (
                  <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                    Lead: {est.client.referralSource}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Action Bar: Accept & Create Event, View Estimate, Edit, Reject */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onExport(est)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <FileText size={14} className="text-[#9a6c37]" />
                  <span>View & Print Quote</span>
                </button>

                <Link
                  href={`/manager/booking?edit=${est._id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Edit size={13} />
                  <span>Edit Proposal</span>
                </Link>

                {onReject && !isConverted && est.status !== "REJECTED" && (
                  <button
                    type="button"
                    disabled={isRejecting}
                    onClick={async () => {
                      if (confirm(`Are you sure you want to mark estimate "${est.eventName}" as rejected?`)) {
                        setRejectingId(est._id);
                        try {
                          await onReject(est);
                        } finally {
                          setRejectingId(null);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    {isRejecting ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                    <span>Reject</span>
                  </button>
                )}
              </div>

              {/* PRIMARY ACTION: Accept & Create Event */}
              <div>
                {isConverted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2.5 text-xs font-black text-emerald-800">
                    <CheckCircle2 size={15} />
                    <span>Event Created & Scheduled</span>
                  </span>
                ) : isDateOver ? (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-500 border border-gray-200"
                    title="The event date for this proposal has passed. It cannot be accepted."
                  >
                    <AlertCircle size={15} className="text-gray-400" />
                    <span>Event Date Passed</span>
                  </span>
                ) : est.status === "CANCELLED" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-600 border border-stone-200">
                    <XCircle size={15} className="text-stone-400" />
                    <span>Proposal Cancelled</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isAccepting}
                    onClick={() => onAccept(est)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#29241f] hover:bg-black px-5 py-2.5 text-xs font-black text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-amber-300" />
                        <span>Creating Event & Schedule...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>Accept & Create Event</span>
                        <ArrowRight size={13} className="text-gray-400" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

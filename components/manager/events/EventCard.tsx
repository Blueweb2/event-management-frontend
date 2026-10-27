"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/event.api";
import { ChevronDown, ChevronUp, ArrowRight, Sparkles, Activity, CreditCard, Plus, Play, CheckCircle2 } from "lucide-react";
import EventStatusBadge from "./EventStatusBadge";
import { formatTime24to12 } from "@/lib/time-utils";
import { useAuth } from "@/hooks/useAuth";
import { canViewClientPayments } from "@/lib/manager-navigation";

interface EventCardProps {
  event: Event;
  onStart?: (event: Event) => void;
  onAccept?: (event: Event) => void;
  onExport?: (event: Event) => void;
  compact?: boolean;
  isFeatured?: boolean;
}

// ==========================================
// Event Card
// ==========================================

export default function EventCard({
  event,
  onStart,
  onAccept,
  onExport,
  compact = false,
  isFeatured = false,
}: EventCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const showPayments = canViewClientPayments(user);
  const [isExpanded, setIsExpanded] = useState(false);

  const clientName =
    typeof event.client === "object"
      ? event.client.name
      : "Client";

  const isCompleted = [
    "completed",
    "settled",
    "invoiced",
    "cancelled",
  ].includes((event.status || "").toLowerCase());

  const isToday = (() => {
    if (!event.eventDate) return false;
    const now = new Date();
    const d = new Date(event.eventDate);
    return !isNaN(d.getTime()) && d.toDateString() === now.toDateString();
  })();

  const isDateOver = (() => {
    if (!event.eventDate) return false;
    const d = new Date(event.eventDate);
    if (isNaN(d.getTime())) return false;
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end.getTime() < today.getTime();
  })();

  const isOngoing =
    !isCompleted &&
    isToday &&
    (event.status === "Ongoing" ||
      event.status === "IN_PROGRESS" ||
      isFeatured);

  const bookingObj = typeof event.booking === "object" && event.booking !== null ? event.booking : null;
  const eventTotal = bookingObj?.total || 0;
  const eventPaid = event.paidAmount ?? event.advancePayment ?? bookingObj?.paidAmount ?? bookingObj?.advancePayment ?? 0;
  const eventBalance = Math.max(0, eventTotal - eventPaid);
  const isSettled = event.paymentStatus === "PAID" || (eventBalance === 0 && eventTotal > 0);
  const isPartiallyPaid = event.paymentStatus === "PARTIAL" || (eventPaid > 0 && eventBalance > 0);

  // COMPACT SMALL CARD (For Upcoming / List Events)
  if (compact && !isExpanded) {
    const canStart =
      onStart &&
      !isCompleted &&
      (event.status === "CONFIRMED" ||
        event.status === "Upcoming" ||
        event.status === "READY_TO_START");

    return (
      <div
        onClick={() => router.push(`/manager/events/${event._id}`)}
        className="group w-full max-w-full min-w-0 cursor-pointer text-left transition"
      >
        <article className="relative flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/90 bg-white p-3 sm:px-4 sm:py-3 shadow-xs transition hover:border-[#9A7B4F]/50 hover:bg-[#FAF8F5]/80 hover:shadow-sm active:scale-[0.995] w-full max-w-full min-w-0 overflow-hidden">
          {/* Main Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 group-hover:bg-[#F4EBDD] group-hover:text-[#9A7B4F] transition">
              <CalendarIcon />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                <h4 className="truncate text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#9A7B4F] max-w-full" title={event.eventName}>
                  {event.eventName}
                </h4>
                <span className="shrink-0 text-[11px] font-semibold text-gray-400">
                  · {formatDate(event.eventDate)}
                </span>
                {event.eventTime && (
                  <span className="shrink-0 text-[10px] font-medium text-gray-400 hidden xs:inline">
                    ({formatTime24to12(event.eventTime)})
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-gray-400 mt-0.5 max-w-full min-w-0" title={`${event.eventType} · ${clientName} ${event.location ? `· ${event.location}` : ""}`}>
                {event.eventType} · {clientName} {event.location ? `· ${event.location}` : ""}
              </p>
            </div>
          </div>

          {/* Action Row - Responsive: Stacks neatly on mobile, inline on sm: screens */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2 shrink-0 pt-2.5 sm:pt-0 border-t border-gray-100 sm:border-0 w-full sm:w-auto min-w-0">
            {/* Badges strip on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between sm:justify-start min-w-0">
              {showPayments && eventTotal > 0 && (
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                  isSettled ? "bg-emerald-50 text-emerald-700" : isPartiallyPaid ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                }`}>
                  {isSettled ? "Paid" : `₹${eventBalance.toLocaleString("en-IN")} Due`}
                </span>
              )}

              <EventStatusBadge status={event.status} />
            </div>

            {/* Action buttons strip */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-end min-w-0">
              {canStart && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(event);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                  title="Start Live Event Operations"
                >
                  <Play size={10} fill="currentColor" />
                  <span>Start</span>
                </button>
              )}

              {onExport && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(event);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-lg bg-[#29241F] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-black transition active:scale-95 shrink-0"
                  title="Export Invoice / Quotation"
                >
                  <Sparkles size={11} className="text-[#D4AF37]" />
                  <span>Export</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-bold text-[#9A7B4F] hover:bg-[#F4EBDD] transition shrink-0"
                title="Expand to full card details"
              >
                <span>Elaborate</span>
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push(`/manager/events/${event._id}`)}
      className="group w-full max-w-full min-w-0 cursor-pointer text-left"
    >
      <article
        className={`relative rounded-2xl transition border active:scale-[0.995] w-full max-w-full min-w-0 overflow-hidden ${
          isOngoing
            ? "border-[#9A7B4F] bg-gradient-to-br from-white via-[#faf7f2] to-[#f5ede3]/40 p-4 sm:p-6 shadow-md ring-1 ring-[#9A7B4F]/20"
            : compact && isExpanded
            ? "border-[#9A7B4F]/40 bg-white p-4 sm:p-5 shadow-md"
            : "border-transparent bg-white p-4 sm:p-5 shadow-sm hover:border-gray-300 hover:shadow-md"
        }`}
      >
        {/* In-Progress Live Badge Header */}
        {isOngoing && (
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#ebdccb] pb-2.5 w-full max-w-full min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#29241f] px-3 py-1 text-[10px] font-extrabold tracking-wider text-amber-200 uppercase shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live In-Progress Event
            </span>
            <span className="text-[11px] font-bold text-[#9A7B4F] flex items-center gap-1 shrink-0">
              <Activity size={13} /> Active Operations
            </span>
          </div>
        )}

        {/* Top Row */}
        <div className="flex items-start justify-between gap-3 w-full max-w-full min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C7A55]">
              {event.eventType}
            </p>

            <h3
              className={`mt-1 truncate font-bold text-[#252525] group-hover:text-[#9A7B4F] transition-colors max-w-full ${
                isOngoing ? "text-base sm:text-xl font-black" : "text-sm sm:text-base"
              }`}
              title={event.eventName}
            >
              {event.eventName}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <EventStatusBadge status={event.status} />

            {/* Collapse toggle if expanded from compact */}
            {compact && isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="rounded-lg bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 shrink-0"
                title="Collapse to small card"
              >
                <ChevronUp size={15} />
              </button>
            )}

          </div>
        </div>

        {/* Event Details */}
        <div className="mt-4 sm:mt-5 space-y-2.5 w-full max-w-full min-w-0">
          <InfoRow
            icon={<CalendarIcon />}
            value={formatDate(event.eventDate)}
          />

          <InfoRow
            icon={<ClockIcon />}
            value={event.eventTime ? formatTime24to12(event.eventTime) : "Schedule TBA"}
          />

          <InfoRow
            icon={<LocationIcon />}
            value={event.location || "Venue location TBA"}
          />

          <InfoRow
            icon={<UsersIcon />}
            value={`${event.guests || 0} guests`}
          />
        </div>

        {/* Payment & Financial Ledger Strip (Super Admin Only) */}
        {showPayments ? (
          <div className="mt-4 rounded-xl border border-gray-100 bg-[#faf8f5] p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-2 w-full max-w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <CreditCard size={15} className="text-[#9a6c37] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payment Status</p>
                <p className="text-xs font-black text-gray-900 truncate">
                  {eventTotal > 0 ? (
                    <>
                      <span className="text-emerald-700">₹{eventPaid.toLocaleString("en-IN")}</span>
                      <span className="text-gray-400 font-normal"> / </span>
                      <span>₹{eventTotal.toLocaleString("en-IN")}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-medium">Estimate pending</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start sm:justify-end w-full sm:w-auto min-w-0">
              {eventTotal > 0 && (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold shrink-0 ${
                  isSettled
                    ? "bg-emerald-100 text-emerald-800"
                    : isPartiallyPaid
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {isSettled ? "PAID" : `₹${eventBalance.toLocaleString("en-IN")} DUE`}
                </span>
              )}

              {/* Accept Action if Pending and date not passed */}
              {onAccept && !isDateOver && ((event.status as string) === "Pending" || (bookingObj as any)?.status === "Pending") && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(event);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-blue-700 transition active:scale-95 shrink-0"
                  title="Accept / Confirm booking"
                >
                  <CheckCircle2 size={12} />
                  <span>Accept</span>
                </button>
              )}

              {/* Start Event Action if Upcoming/Confirmed */}
              {onStart && !isCompleted && !isOngoing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(event);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-800 transition active:scale-95 shrink-0"
                  title="Start event operations now"
                >
                  <Play size={11} className="fill-white" />
                  <span>Start Event</span>
                </button>
              )}

              {/* Export Document Action */}
              {onExport && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(event);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#29241F] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-black transition active:scale-95 shrink-0"
                  title="Export Quotation, Invoice & WhatsApp Summary"
                >
                  <Sparkles size={11} className="text-[#D4AF37]" />
                  <span>Export</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/manager/events/${event._id}#payments`);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-white border border-[#e8e1d8] px-2.5 py-1 text-[11px] font-bold text-[#29241f] shadow-2xs hover:bg-[#29241f] hover:text-white transition active:scale-95 shrink-0"
                title="Record or view client payment for this event"
              >
                <Plus size={11} className="text-[#9a6c37]" />
                <span>Add Payment</span>
              </button>
            </div>
          </div>
        ) : (
          /* For other managers: Payment details are hidden, operational actions remain available */
          (Boolean(onAccept && !isDateOver && ((event.status as string) === "Pending" || (bookingObj as any)?.status === "Pending")) ||
            Boolean(onStart && !isCompleted && !isOngoing) ||
            Boolean(onExport)) ? (
            <div className="mt-3.5 flex flex-wrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2 border-t border-gray-100 pt-2.5 w-full sm:w-auto min-w-0">
              {onAccept && !isDateOver && ((event.status as string) === "Pending" || (bookingObj as any)?.status === "Pending") && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(event);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-blue-700 transition active:scale-95 shrink-0"
                  title="Accept / Confirm booking"
                >
                  <CheckCircle2 size={12} />
                  <span>Accept</span>
                </button>
              )}

              {onStart && !isCompleted && !isOngoing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(event);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-800 transition active:scale-95 shrink-0"
                  title="Start event operations now"
                >
                  <Play size={11} className="fill-white" />
                  <span>Start Event</span>
                </button>
              )}

              {onExport && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(event);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#29241F] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-black transition active:scale-95 shrink-0"
                  title="Export Quotation, Invoice & WhatsApp Summary"
                >
                  <Sparkles size={11} className="text-[#D4AF37]" />
                  <span>Export</span>
                </button>
              )}
            </div>
          ) : null
        )}

        {/* Client & Navigation Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 w-full max-w-full min-w-0">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              Client
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#252525] truncate" title={clientName}>
              {clientName}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#9A7B4F] group-hover:translate-x-0.5 transition shrink-0">
            <span>Manage Event</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </article>
    </div>
  );
}

// ==========================================
// Info Row
// ==========================================

interface InfoRowProps {
  icon: React.ReactNode;
  value: string;
}

function InfoRow({
  icon,
  value,
}: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 min-w-0 w-full">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8F7F3] text-[#8C7A55]">
        {icon}
      </span>

      <span className="truncate text-xs sm:text-sm text-gray-600 min-w-0 flex-1" title={value}>
        {value}
      </span>
    </div>
  );
}

// ==========================================
// Date Formatter
// ==========================================

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ==========================================
// Icons
// ==========================================

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
      />

      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
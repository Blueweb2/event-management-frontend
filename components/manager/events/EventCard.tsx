"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/event.api";
import { Edit, Trash2, ChevronDown, ChevronUp, ArrowRight, Sparkles, Activity } from "lucide-react";
import EventStatusBadge from "./EventStatusBadge";

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  compact?: boolean;
  isFeatured?: boolean;
}

// ==========================================
// Event Card
// ==========================================

export default function EventCard({
  event,
  onEdit,
  onDelete,
  compact = false,
  isFeatured = false,
}: EventCardProps) {
  const router = useRouter();
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

  const isOngoing =
    !isCompleted &&
    isToday &&
    (event.status === "Ongoing" ||
      event.status === "IN_PROGRESS" ||
      isFeatured);

  // COMPACT SMALL CARD (For Completed / Past Events)
  if (compact && !isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="group w-full cursor-pointer text-left transition"
      >
        <article className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200/80 bg-white/90 p-3 sm:px-4 sm:py-3 shadow-xs transition hover:border-[#9A7B4F]/40 hover:bg-[#FAF8F5] hover:shadow-sm active:scale-[0.995]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-[#F4EBDD] group-hover:text-[#9A7B4F] transition">
              <CalendarIcon />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#9A7B4F]">
                  {event.eventName}
                </h4>
                <span className="shrink-0 text-[10px] font-medium text-gray-400">
                  · {formatDate(event.eventDate)}
                </span>
              </div>
              <p className="truncate text-[11px] text-gray-400">
                {event.eventType} · {clientName} {event.location ? `· ${event.location}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1 sm:pt-0 border-t border-gray-100 sm:border-0">
            <EventStatusBadge status={event.status} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-bold text-[#9A7B4F] hover:bg-[#F4EBDD] transition"
            >
              <span>Elaborate</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div
      onClick={() => router.push(`/manager/events/${event._id}`)}
      className="group w-full cursor-pointer text-left"
    >
      <article
        className={`relative rounded-2xl transition border active:scale-[0.995] ${
          isOngoing
            ? "border-[#9A7B4F] bg-gradient-to-br from-white via-[#faf7f2] to-[#f5ede3]/40 p-5 sm:p-6 shadow-md ring-1 ring-[#9A7B4F]/20"
            : compact && isExpanded
            ? "border-[#9A7B4F]/40 bg-white p-5 shadow-md"
            : "border-transparent bg-white p-5 shadow-sm hover:border-gray-300 hover:shadow-md"
        }`}
      >
        {/* In-Progress Live Badge Header */}
        {isOngoing && (
          <div className="mb-3.5 flex items-center justify-between border-b border-[#ebdccb] pb-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#29241f] px-3 py-1 text-[10px] font-extrabold tracking-wider text-amber-200 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live In-Progress Event
            </span>
            <span className="text-[11px] font-bold text-[#9A7B4F] flex items-center gap-1">
              <Activity size={13} /> Active Operations
            </span>
          </div>
        )}

        {/* Top Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8C7A55]">
              {event.eventType}
            </p>

            <h3
              className={`mt-1 truncate font-bold text-[#252525] group-hover:text-[#9A7B4F] transition-colors ${
                isOngoing ? "text-lg sm:text-xl font-black" : "text-base"
              }`}
            >
              {event.eventName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <EventStatusBadge status={event.status} />

            {/* Collapse toggle if expanded from compact */}
            {compact && isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="rounded-lg bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200"
                title="Collapse to small card"
              >
                <ChevronUp size={15} />
              </button>
            )}

            {/* Action Buttons */}
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 pl-1">
                {onEdit && (
                  <button
                    type="button"
                    title="Edit Event"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(event);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-[#F4EBDD] hover:text-[#9A7B4F] transition"
                  >
                    <Edit size={14} />
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    title="Delete Event"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(event);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="mt-4 sm:mt-5 space-y-2.5">
          <InfoRow
            icon={<CalendarIcon />}
            value={formatDate(event.eventDate)}
          />

          <InfoRow
            icon={<ClockIcon />}
            value={event.eventTime || "Schedule TBA"}
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

        {/* Client & Navigation Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
              Client
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#252525]">
              {clientName}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#9A7B4F] group-hover:translate-x-0.5 transition">
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
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8F7F3] text-[#8C7A55]">
        {icon}
      </span>

      <span className="truncate text-sm text-gray-600">
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
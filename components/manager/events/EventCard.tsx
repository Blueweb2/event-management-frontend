"use client";

import { useRouter } from "next/navigation";

import type { Event } from "@/lib/event.api";

import { Edit, Trash2 } from "lucide-react";
import EventStatusBadge from "./EventStatusBadge";

interface EventCardProps {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

// ==========================================
// Event Card
// ==========================================

export default function EventCard({
  event,
  onEdit,
  onDelete,
}: EventCardProps) {
  const router = useRouter();

  const clientName =
    typeof event.client === "object"
      ? event.client.name
      : "Client";

  return (
    <div
      onClick={() => router.push(`/manager/events/${event._id}`)}
      className="group w-full cursor-pointer text-left"
    >
      <article className="relative rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md hover:border-gray-300 border border-transparent active:scale-[0.995]">
        {/* ======================================
            Top Row
        ====================================== */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8C7A55]">
              {event.eventType}
            </p>

            <h3 className="mt-1 truncate text-base font-bold text-[#252525] group-hover:text-[#9A7B4F] transition-colors">
              {event.eventName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <EventStatusBadge
              status={event.status}
            />

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

        {/* ======================================
            Event Details
        ====================================== */}

        <div className="mt-5 space-y-3">
          <InfoRow
            icon={<CalendarIcon />}
            value={formatDate(event.eventDate)}
          />

          <InfoRow
            icon={<ClockIcon />}
            value={event.eventTime}
          />

          <InfoRow
            icon={<LocationIcon />}
            value={event.location}
          />

          <InfoRow
            icon={<UsersIcon />}
            value={`${event.guests} guests`}
          />
        </div>

        {/* ======================================
            Client
        ====================================== */}

        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            Client
          </p>

          <p className="mt-1 text-sm font-semibold text-[#252525]">
            {clientName}
          </p>
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
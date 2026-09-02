import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import EventStatusBadge from "./EventStatusBadge";

export interface EventCardData {
  id: number | string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  customer: string;
  package: string;
  amount: string;
  status:
    | "Confirmed"
    | "Pending"
    | "Completed"
    | "Cancelled";
}

interface EventCardProps {
  event: EventCardData;
}

export default function EventCard({
  event,
}: EventCardProps) {
  return (
    <article className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6c37]">
            {event.type}
          </p>

          <h3 className="mt-1 truncate text-base font-bold text-[#29241f]">
            {event.title}
          </h3>

          <p className="mt-1 text-xs text-[#8d847b]">
            {event.customer}
          </p>
        </div>

        <EventStatusBadge status={event.status} />
      </div>

      {/* Event details */}
      <div className="mt-5 grid gap-3">
        <div className="flex items-center gap-3 text-sm text-[#5f574f]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <CalendarDays size={16} />
          </span>

          <div>
            <p className="text-[11px] text-[#9b938a]">
              Date
            </p>

            <p className="font-medium">
              {event.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#5f574f]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <Clock3 size={16} />
          </span>

          <div>
            <p className="text-[11px] text-[#9b938a]">
              Time
            </p>

            <p className="font-medium">
              {event.time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#5f574f]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <MapPin size={16} />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] text-[#9b938a]">
              Location
            </p>

            <p className="truncate font-medium">
              {event.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#5f574f]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <Users size={16} />
          </span>

          <div>
            <p className="text-[11px] text-[#9b938a]">
              Guests
            </p>

            <p className="font-medium">
              {event.guests} guests
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-[#eee8e1] pt-4">
        <div>
          <p className="text-[11px] text-[#9b938a]">
            {event.package} Package
          </p>

          <p className="mt-1 text-sm font-bold text-[#29241f]">
            {event.amount}
          </p>
        </div>

        <Link
          href={`/dashboard/events/${event.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5cb] px-3.5 py-2 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
        >
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { staffEvents } from "./constants";

export default function UpcomingEvents() {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#eee8e1] px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-[#29241f]">
            Upcoming Events
          </h2>

          <p className="mt-1 text-xs text-[#8d847b]">
            Events assigned to you
          </p>
        </div>

        <Link
          href="/staff/events"
          className="text-sm font-semibold text-[#a7773f] hover:text-[#8f6434]"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-[#eee8e1]">
        {staffEvents.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-[#f7efe4] px-2.5 py-1 text-[11px] font-semibold text-[#9a6c37]">
                  {event.type}
                </span>

                <h3 className="mt-3 text-sm font-bold text-[#29241f]">
                  {event.name}
                </h3>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  event.status === "Confirmed"
                    ? "bg-[#edf5ed] text-[#557555]"
                    : "bg-[#fff4df] text-[#9a6c37]"
                }`}
              >
                {event.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[#756d64]">
              <p className="flex items-center gap-2">
                <CalendarDays size={14} />
                {event.date}
              </p>

              <p className="flex items-center gap-2">
                <Clock3 size={14} />
                {event.time}
              </p>

              <p className="flex min-w-0 items-center gap-2">
                <MapPin size={14} />
                <span className="truncate">
                  {event.location}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Users size={14} />
                {event.guests} guests
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  MoreHorizontal,
  Users,
} from "lucide-react";

import EventCard from "./EventCard";
import EventStatusBadge from "./EventStatusBadge";
import { events } from "./constants";

export default function EventsTable() {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-[#eee8e1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#29241f]">
            All Events
          </h2>

          <p className="mt-1 text-sm text-[#756d64]">
            Manage and track all your scheduled events.
          </p>
        </div>

        <p className="text-xs font-medium text-[#9b938a]">
          {events.length} events
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-[#eee8e1] bg-[#fdfbf8]">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Event
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Date & Time
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Location
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Guests
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Package
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Amount
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Status
              </th>

              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eee8e1]">
            {events.map((event) => (
              <tr
                key={event.id}
                className="transition hover:bg-[#fdfbf8]"
              >
                {/* Event */}
                <td className="px-5 py-4">
                  <div className="min-w-[190px]">
                    <p className="text-sm font-semibold text-[#29241f]">
                      {event.title}
                    </p>

                    <p className="mt-1 text-xs text-[#9a6c37]">
                      {event.type}
                    </p>

                    <p className="mt-1 text-xs text-[#9b938a]">
                      {event.customer}
                    </p>
                  </div>
                </td>

                {/* Date */}
                <td className="px-5 py-4">
                  <div className="flex items-start gap-2">
                    <CalendarDays
                      size={16}
                      className="mt-0.5 shrink-0 text-[#a7773f]"
                    />

                    <div>
                      <p className="whitespace-nowrap text-sm font-medium text-[#5f574f]">
                        {event.date}
                      </p>

                      <p className="mt-0.5 text-xs text-[#9b938a]">
                        {event.time}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Location */}
                <td className="px-5 py-4">
                  <div className="flex max-w-[190px] items-start gap-2">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-[#a7773f]"
                    />

                    <span className="text-sm text-[#5f574f]">
                      {event.location}
                    </span>
                  </div>
                </td>

                {/* Guests */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-[#5f574f]">
                    <Users
                      size={15}
                      className="text-[#a7773f]"
                    />

                    {event.guests}
                  </div>
                </td>

                {/* Package */}
                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-[#5f574f]">
                    {event.package}
                  </span>
                </td>

                {/* Amount */}
                <td className="px-5 py-4">
                  <span className="whitespace-nowrap text-sm font-semibold text-[#29241f]">
                    {event.amount}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <EventStatusBadge
                    status={event.status}
                  />
                </td>

                {/* Action */}
                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    aria-label={`View ${event.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#756d64] transition hover:bg-[#f5eee5] hover:text-[#9a6c37]"
                  >
                    <MoreHorizontal size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 p-4 md:hidden">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#eee8e1] px-5 py-4">
        <p className="text-xs text-[#9b938a]">
          Showing {events.length} events
        </p>

        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a6c37] transition hover:text-[#7f5529]"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
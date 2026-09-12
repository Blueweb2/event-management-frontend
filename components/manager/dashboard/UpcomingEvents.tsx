"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Clock3, MapPin, Plus } from "lucide-react";
import { api } from "@/lib/api";

interface EventItem {
  _id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  guests?: number;
  status: string;
}

const statusStyles: Record<string, string> = {
  Confirmed: "bg-[#E8F5E9] text-[#2E7D32]",
  Pending: "bg-[#FFF4D6] text-[#9A7018]",
  Upcoming: "bg-[#E8F5E9] text-[#2E7D32]",
  Ongoing: "bg-[#E8F0FE] text-[#315EA8]",
  Completed: "bg-gray-100 text-gray-600",
  Draft: "bg-gray-100 text-gray-600",
};

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const res = await api<{ success: boolean; data: EventItem[] }>("/events?limit=4");
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setEvents(res.data);
        }
      } catch (err) {
        console.warn("Could not load upcoming events from API", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section aria-labelledby="upcoming-events-heading">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2
            id="upcoming-events-heading"
            className="text-base font-semibold text-[#1F1F1F]"
          >
            Upcoming Events
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Events that need your attention
          </p>
        </div>

        <Link
          href="/manager/events"
          className="text-xs font-medium text-[#9A7B4F] transition hover:text-[#7D623E]"
        >
          See All
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
          Loading events...
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">No events scheduled yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Confirmed bookings will automatically appear here as active events.
          </p>
          <Link
            href="/manager/estimates"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#9A7B4F] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#7D623E]"
          >
            <Plus size={14} />
            Create Estimate
          </Link>
        </div>
      )}

      {/* Event List */}
      {!loading && events.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {events.map((event) => {
            const dateStr = event.eventDate
              ? new Date(event.eventDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Date TBD";

            return (
              <Link
                key={event._id}
                href={`/manager/events/${event._id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:border-gray-300 hover:shadow active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  {/* Event Image Placeholder */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F4EBDD]">
                    <CalendarDays
                      size={20}
                      strokeWidth={1.8}
                      className="text-[#9A7B4F]"
                    />
                  </div>

                  {/* Event Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#1F1F1F]">
                        {event.eventName}
                      </h3>

                      <ChevronRight
                        size={16}
                        strokeWidth={2}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />
                    </div>

                    {/* Date / Time */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        {dateStr}
                      </span>

                      {event.eventTime && (
                        <span className="flex items-center gap-1">
                          <Clock3 size={12} />
                          {event.eventTime}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {/* Status */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">
                        {event.guests ? `${event.guests} Guests` : "Private Event"}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          statusStyles[event.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
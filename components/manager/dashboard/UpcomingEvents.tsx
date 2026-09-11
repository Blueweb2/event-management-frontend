"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Clock3, MapPin } from "lucide-react";

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  staffCount: number;
  status: "Confirmed" | "Pending" | "Draft";
}

const upcomingEvents: UpcomingEvent[] = [
  {
    id: "EVT-1048",
    name: "Annual Corporate Gala",
    date: "18 Dec 2026",
    time: "6:00 PM",
    location: "The Grand Hyatt",
    staffCount: 8,
    status: "Confirmed",
  },
  {
    id: "EVT-1047",
    name: "Wedding Celebration",
    date: "20 Dec 2026",
    time: "5:30 PM",
    location: "Royal Palace",
    staffCount: 12,
    status: "Pending",
  },
  {
    id: "EVT-1046",
    name: "Product Launch",
    date: "22 Dec 2026",
    time: "7:00 PM",
    location: "Tech Convention Center",
    staffCount: 6,
    status: "Confirmed",
  },
];

const statusStyles = {
  Confirmed: "bg-[#E8F5E9] text-[#2E7D32]",
  Pending: "bg-[#FFF4D6] text-[#9A7018]",
  Draft: "bg-gray-100 text-gray-600",
};

export default function UpcomingEvents() {
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
          href="/manager/schedule"
          className="text-xs font-medium text-[#9A7B4F] transition hover:text-[#7D623E]"
        >
          See All
        </Link>
      </div>

      {/* Event List */}
      <div className="space-y-3">
        {upcomingEvents.map((event) => (
          <Link
            key={event.id}
            href={`/manager/schedule?event=${event.id}`}
            className="block rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:border-gray-300 active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              {/* Event Image Placeholder */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F4EBDD]">
                <CalendarDays
                  size={23}
                  strokeWidth={1.8}
                  className="text-[#9A7B4F]"
                />
              </div>

              {/* Event Information */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#1F1F1F]">
                      {event.name}
                    </h3>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {event.id}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />
                </div>

                {/* Date / Time */}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    {event.date}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock3 size={13} />
                    {event.time}
                  </span>
                </div>

                {/* Location */}
                <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                  <MapPin size={13} className="shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>

                {/* Bottom Row */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">
                    {event.staffCount} Staff Assigned
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      statusStyles[event.status]
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
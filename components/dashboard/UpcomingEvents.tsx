import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";

type EventStatus = "Confirmed" | "Pending";

interface UpcomingEvent {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  status: EventStatus;
}

const upcomingEvents: UpcomingEvent[] = [
  {
    id: 1,
    title: "Wedding Celebration",
    type: "Wedding",
    date: "Sep 12, 2026",
    time: "6:00 PM",
    location: "Grand Palace, Kochi",
    guests: 250,
    status: "Confirmed",
  },
  {
    id: 2,
    title: "Birthday Celebration",
    type: "Birthday",
    date: "Sep 15, 2026",
    time: "7:00 PM",
    location: "Royal Banquet Hall",
    guests: 80,
    status: "Confirmed",
  },
  {
    id: 3,
    title: "Corporate Conference",
    type: "Corporate Event",
    date: "Sep 18, 2026",
    time: "10:00 AM",
    location: "Business Centre, Kochi",
    guests: 120,
    status: "Pending",
  },
  {
    id: 4,
    title: "Engagement Ceremony",
    type: "Engagement",
    date: "Sep 21, 2026",
    time: "5:30 PM",
    location: "Lake View Convention Centre",
    guests: 150,
    status: "Confirmed",
  },
];

export default function UpcomingEvents() {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#eee8e1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#29241f]">
            Upcoming Events
          </h2>

          <p className="mt-1 text-sm text-[#756d64]">
            Events scheduled for the coming days.
          </p>
        </div>

        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9a6c37] transition hover:text-[#7f5529]"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Events */}
      <div className="divide-y divide-[#eee8e1]">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="group px-5 py-5 transition hover:bg-[#fdfbf8]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Event information */}
              <div className="flex min-w-0 gap-4">
                {/* Icon */}
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] sm:flex">
                  <CalendarDays
                    size={18}
                    className="text-[#a7773f]"
                  />
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-[#29241f]">
                      {event.title}
                    </h3>

                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        event.status === "Confirmed"
                          ? "bg-[#edf5ed] text-[#557555]"
                          : "bg-[#fff5df] text-[#9a6c37]",
                      ].join(" ")}
                    >
                      {event.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-[#9a6c37]">
                    {event.type}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 text-xs text-[#756d64] sm:flex-row sm:flex-wrap sm:gap-x-5">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {event.date} · {event.time}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {event.location}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {event.guests} guests
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <Link
                href={`/dashboard/events/${event.id}`}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#ded5cb] px-4 py-2 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
              >
                View Details
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
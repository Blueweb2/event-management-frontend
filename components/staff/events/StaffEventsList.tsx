"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import StaffEventCard, {
  type StaffEvent,
} from "./StaffEventCard";

interface StaffEventsListProps {
  events: StaffEvent[];
}

export default function StaffEventsList({
  events,
}: StaffEventsListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "All" | "Confirmed" | "Pending"
  >("All");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.name.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" || event.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, status]);

  return (
    <section className="mt-6">
      {/* Filters */}
      <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b938a]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events..."
              className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] pl-10 pr-4 text-sm text-[#29241f] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          <div className="relative sm:w-44">
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b938a]"
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "All"
                    | "Confirmed"
                    | "Pending"
                )
              }
              className="h-11 w-full appearance-none rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] pl-10 pr-4 text-sm font-medium text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            >
              <option value="All">All Events</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#29241f]">
            Assigned Events
          </h2>

          <p className="mt-1 text-xs text-[#8d847b]">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"}
          </p>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filteredEvents.map((event) => (
            <StaffEventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d8cfc5] bg-white px-6 py-12 text-center">
          <CalendarDaysEmpty />

          <h3 className="mt-4 text-sm font-bold text-[#29241f]">
            No events found
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-[#8d847b]">
            Try changing your search or status filter.
          </p>
        </div>
      )}
    </section>
  );
}

function CalendarDaysEmpty() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
      <span className="text-lg">○</span>
    </div>
  );
}
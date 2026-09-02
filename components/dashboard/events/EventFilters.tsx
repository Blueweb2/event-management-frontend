"use client";

import {
  CalendarDays,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

const eventTypes = [
  "All Event Types",
  "Wedding",
  "Birthday",
  "Engagement",
  "Corporate Event",
  "Religious Event",
  "Private Function",
];

const statuses = [
  "All Statuses",
  "Confirmed",
  "Pending",
  "Completed",
  "Cancelled",
];

export default function EventFilters() {
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("All Event Types");
  const [status, setStatus] = useState("All Statuses");
  const [date, setDate] = useState("");

  const resetFilters = () => {
    setSearch("");
    setEventType("All Event Types");
    setStatus("All Statuses");
    setDate("");
  };

  const hasFilters =
    search !== "" ||
    eventType !== "All Event Types" ||
    status !== "All Statuses" ||
    date !== "";

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <SlidersHorizontal size={18} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#29241f]">
              Filter Events
            </h2>

            <p className="text-xs text-[#8d847b]">
              Search and filter your events.
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a6c37] transition hover:text-[#7f5529]"
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Search */}
        <div className="xl:col-span-1">
          <label
            htmlFor="event-search"
            className="mb-2 block text-xs font-semibold text-[#5f574f]"
          >
            Search
          </label>

          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
            />

            <input
              id="event-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search event or customer..."
              className="h-10 w-full rounded-lg border border-[#d9d0c6] bg-white pl-10 pr-3 text-sm text-[#403a34] outline-none transition placeholder:text-[#aaa198] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
            />
          </div>
        </div>

        {/* Event Type */}
        <div>
          <label
            htmlFor="event-type"
            className="mb-2 block text-xs font-semibold text-[#5f574f]"
          >
            Event Type
          </label>

          <select
            id="event-type"
            value={eventType}
            onChange={(event) =>
              setEventType(event.target.value)
            }
            className="h-10 w-full rounded-lg border border-[#d9d0c6] bg-white px-3 text-sm text-[#403a34] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="event-status"
            className="mb-2 block text-xs font-semibold text-[#5f574f]"
          >
            Status
          </label>

          <select
            id="event-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="h-10 w-full rounded-lg border border-[#d9d0c6] bg-white px-3 text-sm text-[#403a34] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="event-date"
            className="mb-2 block text-xs font-semibold text-[#5f574f]"
          >
            Event Date
          </label>

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
            />

            <input
              id="event-date"
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              className="h-10 w-full rounded-lg border border-[#d9d0c6] bg-white pl-10 pr-3 text-sm text-[#403a34] outline-none transition focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/15"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
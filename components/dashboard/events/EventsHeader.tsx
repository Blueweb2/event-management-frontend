import Link from "next/link";
import {
  CalendarPlus,
  Download,
} from "lucide-react";

export default function EventsHeader() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      {/* Heading */}
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#b8894b]" />

          <p className="text-sm font-semibold text-[#9a6c37]">
            Event Management
          </p>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
          Events
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
          Manage upcoming events, schedules, customers,
          staff, and event requirements from one place.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] bg-white px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
        >
          <Download size={17} />
          <span>Export</span>
        </button>

        <Link
          href="/booking"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#b8894b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a7773f] hover:shadow-md"
        >
          <CalendarPlus size={17} />
          <span>New Event</span>
        </Link>
      </div>
    </div>
  );
}
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MoreHorizontal,
} from "lucide-react";

import EventStatusBadge from "./EventStatusBadge";

interface EventDetailsHeaderProps {
  title: string;
  type: string;
  date: string;
  status:
    | "Confirmed"
    | "Pending"
    | "Completed"
    | "Cancelled";
}

export default function EventDetailsHeader({
  title,
  type,
  date,
  status,
}: EventDetailsHeaderProps) {
  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#756d64] transition hover:text-[#9a6c37]"
      >
        <ArrowLeft size={17} />
        Back to Events
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9a6c37]">
              {type}
            </p>

            <EventStatusBadge status={status} />
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
            {title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-[#756d64]">
            <CalendarDays
              size={17}
              className="text-[#a7773f]"
            />

            <span>{date}</span>
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          aria-label="Event actions"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ded5cb] bg-white text-[#756d64] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#9a6c37]"
        >
          <MoreHorizontal size={19} />
        </button>
      </div>
    </div>
  );
}
import {
  CalendarDays,
  ClipboardList,
} from "lucide-react";

export default function BookingHeader() {
  return (
    <div className="mb-8">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sage-light)] text-[var(--sage-dark)]">
        <ClipboardList size={24} />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--sage-dark)]">
        Event Booking
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Plan your perfect event
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
        Tell us about your event, choose a package, select
        your food requirements, and let our team take care of
        the rest.
      </p>

      <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <CalendarDays
            size={17}
            className="text-[var(--sage-dark)]"
          />
          One event per booking
        </div>

        <span className="hidden text-gray-300 sm:block">
          |
        </span>

        <span>
          No subscription required
        </span>
      </div>
    </div>
  );
}
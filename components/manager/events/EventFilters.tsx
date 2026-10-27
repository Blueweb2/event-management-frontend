import type { EventStatus } from "@/lib/event.api";

export type EventFilterStatus = EventStatus | "Estimates";

interface EventFiltersProps {
  value: EventFilterStatus;
  onChange: (value: EventFilterStatus) => void;
  estimatesCount?: number;
  ongoingCount?: number;
  isOperationsManager?: boolean;
}

export default function EventFilters({
  value,
  onChange,
  estimatesCount = 0,
  ongoingCount = 0,
  isOperationsManager = false,
}: EventFiltersProps) {
  const allFilters: {
    label: string;
    value: EventFilterStatus;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      label: "Ongoing",
      value: "Ongoing",
      badge: ongoingCount,
      badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-300",
    },
    {
      label: "Upcoming",
      value: "Upcoming",
    },
    {
      label: "New Bookings & Quotes",
      value: "Estimates",
      badge: estimatesCount,
      badgeColor: "bg-amber-100 text-amber-900 border border-amber-300",
    },
    {
      label: "Completed",
      value: "Completed",
    },
    {
      label: "Cancelled",
      value: "Cancelled",
    },
  ];

  const filters = isOperationsManager
    ? allFilters.filter((f) => f.value === "Ongoing" || f.value === "Upcoming")
    : allFilters;

  return (
    <div className="w-full max-w-full overflow-x-auto pb-1 no-scrollbar touch-pan-x">
      <div className="flex w-max flex-nowrap items-center gap-1.5 sm:gap-2">
        {filters.map((filter) => {
          const active = value === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={[
                "inline-flex items-center gap-1.5 sm:gap-2 min-h-9 sm:min-h-10 rounded-full px-3 sm:px-4 text-xs sm:text-sm font-medium transition cursor-pointer shrink-0 whitespace-nowrap",
                active
                  ? "bg-[#252525] text-white shadow-xs"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              <span>{filter.label}</span>
              {filter.badge !== undefined && filter.badge > 0 && (
                <span
                  className={`inline-flex items-center justify-center rounded-full px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black shrink-0 ${
                    active
                      ? "bg-amber-400 text-black"
                      : filter.badgeColor || "bg-amber-100 text-amber-900"
                  }`}
                >
                  {filter.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import type { EventStatus } from "@/lib/event.api";

type EventFilterStatus = EventStatus | "All";

interface EventFiltersProps {
  value: EventFilterStatus;
  onChange: (value: EventFilterStatus) => void;
}

const filters: {
  label: string;
  value: EventFilterStatus;
}[] = [
  {
    label: "All",
    value: "All",
  },
  {
    label: "Upcoming",
    value: "Upcoming",
  },
  {
    label: "Ongoing",
    value: "Ongoing",
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

// ==========================================
// Event Filters
// ==========================================

export default function EventFilters({
  value,
  onChange,
}: EventFiltersProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-none">
      <div className="flex min-w-max gap-2">
        {filters.map((filter) => {
          const active = value === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={[
                "min-h-10 rounded-full px-4 text-sm font-medium transition",
                active
                  ? "bg-[#252525] text-white"
                  : "border border-gray-200 bg-white text-gray-600",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutList,
  type LucideIcon,
} from "lucide-react";

interface EventStat {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

const eventStats: EventStat[] = [
  {
    title: "Total Events",
    value: "24",
    description: "All scheduled events",
    icon: LayoutList,
  },
  {
    title: "Upcoming",
    value: "12",
    description: "Events coming soon",
    icon: CalendarDays,
  },
  {
    title: "Confirmed",
    value: "9",
    description: "Confirmed events",
    icon: CheckCircle2,
  },
  {
    title: "Pending",
    value: "3",
    description: "Awaiting confirmation",
    icon: Clock3,
  },
];

export default function EventStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {eventStats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#756d64]">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-[#29241f]">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-[#9b938a]">
                  {stat.description}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Icon size={21} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
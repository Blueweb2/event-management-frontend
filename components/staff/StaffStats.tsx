import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
} from "lucide-react";

import { staffStats } from "./constants";

const stats = [
  {
    label: "Upcoming Events",
    value: staffStats.upcomingEvents,
    icon: CalendarDays,
  },
  {
    label: "Assigned Duties",
    value: staffStats.assignedDuties,
    icon: ClipboardList,
  },
  {
    label: "Pending Duties",
    value: staffStats.pendingDuties,
    icon: Clock3,
  },
  {
    label: "Completed",
    value: staffStats.completedDuties,
    icon: CheckCircle2,
  },
];

export default function StaffStats() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs leading-5 text-[#8d847b]">
                {stat.label}
              </p>

              <Icon
                size={16}
                className="shrink-0 text-[#b8894b]"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-[#29241f]">
              {stat.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
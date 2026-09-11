import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  UserCheck,
} from "lucide-react";

import { dutyStats } from "./constants";

const stats = [
  {
    label: "Total Duties",
    value: dutyStats.total,
    icon: ClipboardList,
    description: "All event duties",
  },
  {
    label: "Pending",
    value: dutyStats.pending,
    icon: Clock3,
    description: "Awaiting assignment",
  },
  {
    label: "Assigned",
    value: dutyStats.assigned,
    icon: UserCheck,
    description: "Staff assigned",
  },
  {
    label: "Completed",
    value: dutyStats.completed,
    icon: CheckCircle2,
    description: "Completed duties",
  },
];

export default function DutiesStats() {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#8d847b] sm:text-sm">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[#29241f] sm:text-3xl">
                  {stat.value}
                </p>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Icon size={18} />
              </span>
            </div>

            <p className="mt-3 text-xs text-[#9b938a]">
              {stat.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}
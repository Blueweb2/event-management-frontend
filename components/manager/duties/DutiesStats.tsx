import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  UserCheck,
} from "lucide-react";

import type { Duty } from "./constants";

interface DutiesStatsProps {
  duties: Duty[];
}

export default function DutiesStats({ duties }: DutiesStatsProps) {
  const stats = [
  {
    label: "Total Duties",
    value: duties.length,
    icon: ClipboardList,
    description: "All event duties",
  },
  {
    label: "In Progress",
    value: duties.filter((duty) => duty.status === "IN_PROGRESS").length,
    icon: Clock3,
    description: "Currently underway",
  },
  {
    label: "Assigned",
    value: duties.filter((duty) => ["ASSIGNED", "ACCEPTED"].includes(duty.status)).length,
    icon: UserCheck,
    description: "Staff assigned",
  },
  {
    label: "Completed",
    value: duties.filter((duty) => duty.status === "COMPLETED").length,
    icon: CheckCircle2,
    description: "Completed duties",
  },
  ];

  return (
    <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-3.5 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#8d847b] sm:text-sm">
                  {stat.label}
                </p>

                <p className="mt-1.5 text-xl font-bold text-[#29241f] sm:text-3xl">
                  {stat.value}
                </p>
              </div>

              <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Icon size={16} className="sm:hidden" />
                <Icon size={18} className="hidden sm:block" />
              </span>
            </div>

            <p className="mt-2.5 truncate text-[11px] sm:text-xs text-[#9b938a]">
              {stat.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}

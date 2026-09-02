import {
  CalendarCheck2,
  UserRoundCheck,
  UserRoundPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { customerStats } from "./constants";

interface StatCard {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export default function CustomerStats() {
  const stats: StatCard[] = [
    {
      label: "Total Customers",
      value: customerStats.total,
      description: "All registered customers",
      icon: Users,
    },
    {
      label: "Active Customers",
      value: customerStats.active,
      description: "Currently active",
      icon: UserRoundCheck,
    },
    {
      label: "Inactive Customers",
      value: customerStats.inactive,
      description: "Currently inactive",
      icon: UserRoundPlus,
    },
    {
      label: "Returning Customers",
      value: customerStats.returning,
      description: "More than one booking",
      icon: CalendarCheck2,
    },
  ];

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#29241f]">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-[#9b938a]">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                  <Icon size={19} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
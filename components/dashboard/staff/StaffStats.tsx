import {
  BriefcaseBusiness,
  CircleCheck,
  Clock3,
  Users,
  type LucideIcon,
} from "lucide-react";

import { staffStats } from "./constants";

interface StatCard {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
}

export default function StaffStats() {
  const stats: StatCard[] = [
    {
      label: "Total Staff",
      value: staffStats.total,
      description: "Registered staff members",
      icon: Users,
    },
    {
      label: "Available",
      value: staffStats.available,
      description: "Ready for assignment",
      icon: CircleCheck,
    },
    {
      label: "Busy",
      value: staffStats.busy,
      description: "Currently assigned",
      icon: BriefcaseBusiness,
    },
    {
      label: "Off Duty",
      value: staffStats.offDuty,
      description: "Currently unavailable",
      icon: Clock3,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[#8d847b]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[#29241f]">
                  {stat.value}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Icon size={18} />
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-4 text-[#9b938a]">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
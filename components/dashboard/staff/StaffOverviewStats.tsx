import {
  CalendarCheck2,
  CalendarClock,
  Clock3,
  UserRoundCheck,
} from "lucide-react";

import type { StaffMember } from "./constants";

interface StaffOverviewStatsProps {
  staff: StaffMember;
}

export default function StaffOverviewStats({
  staff,
}: StaffOverviewStatsProps) {
  const stats = [
    {
      label: "Upcoming Events",
      value: staff.upcomingEvents,
      icon: CalendarClock,
    },
    {
      label: "Completed Events",
      value: staff.completedEvents,
      icon: CalendarCheck2,
    },
    {
      label: "Experience",
      value: staff.experience,
      icon: Clock3,
    },
    {
      label: "Status",
      value: staff.status,
      icon: UserRoundCheck,
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
              <Icon size={17} />
            </div>

            <p className="mt-3 text-xs text-[#8d847b]">
              {stat.label}
            </p>

            <p className="mt-1 truncate text-sm font-bold text-[#29241f]">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
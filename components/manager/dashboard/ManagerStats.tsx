"use client";

import {
  Users,
  CalendarDays,
  UserCheck,
  ClipboardList,
} from "lucide-react";

import ManagerStatCard from "./ManagerStatCard";

export default function ManagerStats() {
  const stats = [
    {
      label: "Total Staff",
      value: "24",
      icon: Users,
      description: "Active staff members",
    },
    {
      label: "Upcoming Events",
      value: "8",
      icon: CalendarDays,
      description: "Events scheduled",
    },
    {
      label: "Available Today",
      value: "18",
      icon: UserCheck,
      description: "Staff available",
    },
    {
      label: "Pending Tasks",
      value: "6",
      icon: ClipboardList,
      description: "Need attention",
    },
  ];

  return (
    <section aria-labelledby="manager-stats-heading">
      <div className="mb-3">
        <h2
          id="manager-stats-heading"
          className="text-base font-semibold text-[#1F1F1F]"
        >
          Overview
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          Your event management summary
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <ManagerStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
          />
        ))}
      </div>
    </section>
  );
}
"use client";

import { ClipboardList, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { staffDuties, staffEvents } from "./constants";

export default function StaffStats() {
  const pendingCount = staffDuties.filter((d) => d.status !== "Completed").length;
  const completedCount = staffDuties.filter((d) => d.status === "Completed").length;

  const stats = [
    {
      label: "Pending Duties",
      value: String(pendingCount),
      icon: ClipboardList,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Upcoming Events",
      value: String(staffEvents.length),
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Completed",
      value: String(completedCount),
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "This Week Hours",
      value: "28 hrs",
      icon: Clock3,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex flex-col justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">{s.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
                <Icon size={16} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#29241f]">{s.value}</p>
          </div>
        );
      })}
    </div>
  );
}

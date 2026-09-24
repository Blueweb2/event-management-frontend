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
  const rejectedCount = duties.filter((d) => d.status === "REJECTED").length;
  const pendingCount = duties.filter((d) => d.status === "ASSIGNED").length;
  const confirmedCount = duties.filter((d) => ["ACCEPTED", "IN_PROGRESS"].includes(d.status)).length;
  const completedCount = duties.filter((d) => d.status === "COMPLETED").length;

  const stats = [
    {
      label: "Total Duties",
      value: duties.length,
      icon: ClipboardList,
      description: "All scheduled shifts",
    },
    {
      label: "Confirmed Active",
      value: confirmedCount,
      icon: UserCheck,
      description: "Accepted & in progress",
    },
    {
      label: rejectedCount > 0 ? "Declined Shifts" : "Pending Confirmation",
      value: rejectedCount > 0 ? rejectedCount : pendingCount,
      icon: Clock3,
      description: rejectedCount > 0 ? "Requires reassignment" : "Awaiting staff response",
      isAlert: rejectedCount > 0,
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      description: "Successfully fulfilled",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className={`rounded-2xl border p-3.5 sm:p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              stat.isAlert
                ? "border-rose-200 bg-rose-50/50"
                : "border-[#e8e1d8] bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={`truncate text-xs font-medium sm:text-sm ${
                    stat.isAlert ? "text-rose-700 font-bold" : "text-[#8d847b]"
                  }`}
                >
                  {stat.label}
                </p>

                <p
                  className={`mt-1.5 text-xl font-bold sm:text-3xl ${
                    stat.isAlert ? "text-rose-700" : "text-[#29241f]"
                  }`}
                >
                  {stat.value}
                </p>
              </div>

              <span
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${
                  stat.isAlert
                    ? "bg-rose-100 text-rose-700"
                    : "bg-[#f7efe4] text-[#a7773f]"
                }`}
              >
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

import {
  CalendarCheck2,
  CalendarClock,
  IndianRupee,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react";

import type { Customer } from "./constants";

interface CustomerOverviewStatsProps {
  customer: Customer;
  totalSpent?: number;
  upcomingEvents?: number;
}

interface StatCard {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export default function CustomerOverviewStats({
  customer,
  totalSpent = 0,
  upcomingEvents = 0,
}: CustomerOverviewStatsProps) {
  const stats: StatCard[] = [
    {
      label: "Total Bookings",
      value: customer.bookings.toString(),
      description: "Bookings made",
      icon: CalendarCheck2,
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      description: "Across all bookings",
      icon: IndianRupee,
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.toString(),
      description: "Currently scheduled",
      icon: CalendarClock,
    },
    {
      label: "Customer Since",
      value: customer.joinedDate,
      description: "Customer account",
      icon: UserRoundPlus,
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
              className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                    {stat.label}
                  </p>

                  <p
                    className={[
                      "mt-2 font-bold text-[#29241f]",
                      stat.label === "Customer Since"
                        ? "text-base"
                        : "text-2xl",
                    ].join(" ")}
                  >
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
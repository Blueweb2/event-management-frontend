import {
  CalendarCheck2,
  CheckCircle2,
  IndianRupee,
  Users,
  XCircle,
} from "lucide-react";

import { reportSummary } from "./constants";

const stats = [
  {
    title: "Total Revenue",
    value: `₹${(reportSummary.totalRevenue / 100000).toFixed(2)}L`,
    description: "Revenue generated",
    icon: IndianRupee,
  },
  {
    title: "Total Bookings",
    value: reportSummary.totalBookings,
    description: "All bookings",
    icon: CalendarCheck2,
  },
  {
    title: "Customers",
    value: reportSummary.totalCustomers,
    description: "Registered customers",
    icon: Users,
  },
  {
    title: "Completed",
    value: reportSummary.completedBookings,
    description: "Completed bookings",
    icon: CheckCircle2,
  },
  {
    title: "Cancelled",
    value: reportSummary.cancelledBookings,
    description: "Cancelled bookings",
    icon: XCircle,
  },
];

export default function ReportStats() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#8d847b]">
                {stat.title}
              </p>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
                <Icon size={15} />
              </div>
            </div>

            <p className="mt-3 text-xl font-bold text-[#29241f]">
              {stat.value}
            </p>

            <p className="mt-1 text-[10px] text-[#9b938a]">
              {stat.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
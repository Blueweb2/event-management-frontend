import {
  CalendarDays,
  ClipboardList,
  IndianRupee,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Stat {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

const stats: Stat[] = [
  {
    title: "Total Bookings",
    value: "128",
    description: "All time bookings",
    icon: ClipboardList,
    trend: "+12.5%",
    trendUp: true,
  },
  {
    title: "Upcoming Events",
    value: "24",
    description: "Events this month",
    icon: CalendarDays,
    trend: "+8.2%",
    trendUp: true,
  },
  {
    title: "Total Customers",
    value: "96",
    description: "Registered customers",
    icon: Users,
    trend: "+6.4%",
    trendUp: true,
  },
  {
    title: "Total Revenue",
    value: "₹8.45L",
    description: "Revenue this year",
    icon: IndianRupee,
    trend: "+14.8%",
    trendUp: true,
  },
];

export default function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                  {stat.value}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={21} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>

              {stat.trend && (
                <div
                  className={[
                    "flex items-center gap-1 text-xs font-semibold",
                    stat.trendUp
                      ? "text-green-600"
                      : "text-red-600",
                  ].join(" ")}
                >
                  {stat.trendUp ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}

                  {stat.trend}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
import {
  CalendarDays,
  ClipboardList,
  IndianRupee,
  Users,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Bookings",
    value: "128",
    change: "+12.5%",
    description: "from last month",
    icon: ClipboardList,
  },
  {
    title: "Upcoming Events",
    value: "24",
    change: "+4",
    description: "this month",
    icon: CalendarDays,
  },
  {
    title: "Total Customers",
    value: "96",
    change: "+8.2%",
    description: "from last month",
    icon: Users,
  },
  {
    title: "Total Revenue",
    value: "₹8.42L",
    change: "+14.6%",
    description: "from last month",
    icon: IndianRupee,
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Top */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                  {stat.value}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={21} />
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                <TrendingUp size={14} />
                {stat.change}
              </span>

              <span className="text-gray-400">
                {stat.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
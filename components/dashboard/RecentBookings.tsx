import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MoreHorizontal,
  Users,
} from "lucide-react";

const recentBookings = [
  {
    id: "BK-001",
    customer: "Anjali Menon",
    event: "Wedding Celebration",
    date: "Sep 12, 2026",
    guests: 250,
    package: "Premium",
    amount: "₹85,000",
    status: "Confirmed",
  },
  {
    id: "BK-002",
    customer: "Rahul Kumar",
    event: "Birthday Celebration",
    date: "Sep 15, 2026",
    guests: 80,
    package: "Starter",
    amount: "₹25,000",
    status: "Pending",
  },
  {
    id: "BK-003",
    customer: "Meera Nair",
    event: "Engagement Ceremony",
    date: "Sep 21, 2026",
    guests: 150,
    package: "Medium",
    amount: "₹50,000",
    status: "Confirmed",
  },
  {
    id: "BK-004",
    customer: "Arjun Thomas",
    event: "Corporate Event",
    date: "Sep 18, 2026",
    guests: 120,
    package: "Medium",
    amount: "₹50,000",
    status: "Pending",
  },
];

export default function RecentBookings() {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#eee8e1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#29241f]">
            Recent Bookings
          </h2>

          <p className="mt-1 text-sm text-[#756d64]">
            Latest customer booking requests.
          </p>
        </div>

        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9a6c37] transition hover:text-[#7f5529]"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#eee8e1] bg-[#fdfbf8]">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Customer
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Event
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Date
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Guests
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Package
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Amount
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Status
              </th>

              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eee8e1]">
            {recentBookings.map((booking) => (
              <tr
                key={booking.id}
                className="transition hover:bg-[#fdfbf8]"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#29241f]">
                      {booking.customer}
                    </p>

                    <p className="mt-0.5 text-xs text-[#9b938a]">
                      {booking.id}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="max-w-[170px] truncate text-sm text-[#5f574f]">
                    {booking.event}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 whitespace-nowrap text-sm text-[#5f574f]">
                    <CalendarDays
                      size={15}
                      className="text-[#a7773f]"
                    />
                    {booking.date}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-[#5f574f]">
                    <Users
                      size={15}
                      className="text-[#a7773f]"
                    />
                    {booking.guests}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm font-medium text-[#5f574f]">
                    {booking.package}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm font-semibold text-[#29241f]">
                    {booking.amount}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={booking.status} />
                </td>

                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    aria-label={`View ${booking.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#756d64] hover:bg-[#f5eee5] hover:text-[#9a6c37]"
                  >
                    <MoreHorizontal size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-[#eee8e1] md:hidden">
        {recentBookings.map((booking) => (
          <div
            key={booking.id}
            className="p-5 transition hover:bg-[#fdfbf8]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#29241f]">
                  {booking.customer}
                </p>

                <p className="mt-1 text-xs text-[#9b938a]">
                  {booking.id}
                </p>
              </div>

              <StatusBadge status={booking.status} />
            </div>

            <p className="mt-4 text-sm font-medium text-[#5f574f]">
              {booking.event}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#756d64]">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={14}
                  className="text-[#a7773f]"
                />
                {booking.date}
              </div>

              <div className="flex items-center gap-2">
                <Users
                  size={14}
                  className="text-[#a7773f]"
                />
                {booking.guests} guests
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9b938a]">
                  {booking.package} Package
                </p>

                <p className="mt-1 text-sm font-bold text-[#29241f]">
                  {booking.amount}
                </p>
              </div>

              <Link
                href={`/dashboard/bookings/${booking.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5cb] px-3 py-2 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
              >
                Details
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const confirmed = status === "Confirmed";

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
        confirmed
          ? "bg-[#edf5ed] text-[#557555]"
          : "bg-[#fff5df] text-[#9a6c37]",
      ].join(" ")}
    >
      {status}
    </span>
  );
}
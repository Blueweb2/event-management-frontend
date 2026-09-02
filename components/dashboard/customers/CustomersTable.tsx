import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  MoreHorizontal,
  Phone,
} from "lucide-react";

const customers = [
  {
    id: "CUS-001",
    name: "Anjali Menon",
    phone: "+91 98765 43210",
    email: "anjali@example.com",
    bookings: 3,
    lastBooking: "Sep 12, 2026",
    status: "Active",
  },
  {
    id: "CUS-002",
    name: "Rahul Kumar",
    phone: "+91 98765 12345",
    email: "rahul@example.com",
    bookings: 1,
    lastBooking: "Sep 15, 2026",
    status: "Active",
  },
  {
    id: "CUS-003",
    name: "Meera Nair",
    phone: "+91 91234 56789",
    email: "meera@example.com",
    bookings: 4,
    lastBooking: "Sep 21, 2026",
    status: "Active",
  },
  {
    id: "CUS-004",
    name: "Arjun Thomas",
    phone: "+91 99887 66554",
    email: "arjun@example.com",
    bookings: 2,
    lastBooking: "Sep 18, 2026",
    status: "Active",
  },
  {
    id: "CUS-005",
    name: "Neha Joseph",
    phone: "+91 87654 32109",
    email: "neha@example.com",
    bookings: 1,
    lastBooking: "Aug 28, 2026",
    status: "Inactive",
  },
];

export default function CustomersTable() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[#eee8e1] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#29241f]">
            Customers
          </h2>

          <p className="mt-1 text-sm text-[#756d64]">
            Manage your registered customers and their bookings.
          </p>
        </div>

        <span className="text-xs font-medium text-[#9b938a]">
          {customers.length} customers
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-[#eee8e1] bg-[#fdfbf8]">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Customer
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Contact
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Bookings
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Last Booking
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#8d847b]">
                Status
              </th>

              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eee8e1]">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="transition hover:bg-[#fdfbf8]"
              >
                {/* Customer */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7efe4] text-sm font-bold text-[#a7773f]">
                      {getInitials(customer.name)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#29241f]">
                        {customer.name}
                      </p>

                      <p className="mt-0.5 text-xs text-[#9b938a]">
                        {customer.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-4">
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-xs text-[#5f574f]">
                      <Phone
                        size={13}
                        className="text-[#a7773f]"
                      />
                      {customer.phone}
                    </p>

                    <p className="flex items-center gap-2 text-xs text-[#756d64]">
                      <Mail
                        size={13}
                        className="text-[#a7773f]"
                      />
                      {customer.email}
                    </p>
                  </div>
                </td>

                {/* Bookings */}
                <td className="px-5 py-4">
                  <span className="text-sm font-semibold text-[#29241f]">
                    {customer.bookings}
                  </span>
                </td>

                {/* Last booking */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-[#5f574f]">
                    <CalendarDays
                      size={15}
                      className="text-[#a7773f]"
                    />
                    {customer.lastBooking}
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <StatusBadge status={customer.status} />
                </td>

                {/* Action */}
                <td className="px-5 py-4">
                  <Link
                    href={`/dashboard/customers/${customer.id}`}
                    aria-label={`View ${customer.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#756d64] transition hover:bg-[#f5eee5] hover:text-[#9a6c37]"
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
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="p-5 transition hover:bg-[#fdfbf8]"
          >
            {/* Customer header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7efe4] text-sm font-bold text-[#a7773f]">
                  {getInitials(customer.name)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#29241f]">
                    {customer.name}
                  </p>

                  <p className="mt-0.5 text-xs text-[#9b938a]">
                    {customer.id}
                  </p>
                </div>
              </div>

              <StatusBadge status={customer.status} />
            </div>

            {/* Contact */}
            <div className="mt-4 space-y-2">
              <p className="flex items-center gap-2 text-xs text-[#5f574f]">
                <Phone
                  size={14}
                  className="shrink-0 text-[#a7773f]"
                />
                {customer.phone}
              </p>

              <p className="flex items-center gap-2 text-xs text-[#756d64]">
                <Mail
                  size={14}
                  className="shrink-0 text-[#a7773f]"
                />
                <span className="truncate">
                  {customer.email}
                </span>
              </p>
            </div>

            {/* Details */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#fdfbf8] p-3">
                <p className="text-[11px] text-[#9b938a]">
                  Bookings
                </p>

                <p className="mt-1 text-sm font-bold text-[#29241f]">
                  {customer.bookings}
                </p>
              </div>

              <div className="rounded-lg bg-[#fdfbf8] p-3">
                <p className="text-[11px] text-[#9b938a]">
                  Last Booking
                </p>

                <p className="mt-1 text-xs font-semibold text-[#5f574f]">
                  {customer.lastBooking}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-4 flex justify-end">
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5cb] px-3.5 py-2 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
              >
                View Details
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
  const active = status === "Active";

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
        active
          ? "bg-[#edf5ed] text-[#557555]"
          : "bg-[#f1efed] text-[#756d64]",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
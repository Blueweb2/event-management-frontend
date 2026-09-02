import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  Phone,
} from "lucide-react";

export interface CustomerCardData {
  id: string;
  name: string;
  phone: string;
  email: string;
  bookings: number;
  lastBooking: string;
  status: "Active" | "Inactive";
}

interface CustomerCardProps {
  customer: CustomerCardData;
}

export default function CustomerCard({
  customer,
}: CustomerCardProps) {
  return (
    <article className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7efe4] text-sm font-bold text-[#a7773f]">
            {getInitials(customer.name)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[#29241f]">
              {customer.name}
            </h3>

            <p className="mt-0.5 text-xs text-[#9b938a]">
              {customer.id}
            </p>
          </div>
        </div>

        <StatusBadge status={customer.status} />
      </div>

      {/* Contact */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 text-sm text-[#5f574f]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <Phone size={15} />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] text-[#9b938a]">
              Phone
            </p>

            <p className="truncate font-medium">
              {customer.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#5f574f]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
            <Mail size={15} />
          </span>

          <div className="min-w-0">
            <p className="text-[11px] text-[#9b938a]">
              Email
            </p>

            <p className="truncate font-medium">
              {customer.email}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#fdfbf8] p-3">
          <p className="text-[11px] text-[#9b938a]">
            Total Bookings
          </p>

          <p className="mt-1 text-lg font-bold text-[#29241f]">
            {customer.bookings}
          </p>
        </div>

        <div className="rounded-xl bg-[#fdfbf8] p-3">
          <p className="text-[11px] text-[#9b938a]">
            Last Booking
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#5f574f]">
            <CalendarDays
              size={13}
              className="text-[#a7773f]"
            />

            {customer.lastBooking}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end border-t border-[#eee8e1] pt-4">
        <Link
          href={`/dashboard/customers/${customer.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5cb] px-4 py-2 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
        >
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
}: {
  status: CustomerCardData["status"];
}) {
  const active = status === "Active";

  return (
    <span
      className={[
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
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
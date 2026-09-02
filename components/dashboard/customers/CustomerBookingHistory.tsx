import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";

export interface CustomerBooking {
  id: string;
  event: string;
  type: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  package: string;
  amount: number;
  status:
    | "Confirmed"
    | "Pending"
    | "Completed"
    | "Cancelled";
}

interface CustomerBookingHistoryProps {
  bookings: CustomerBooking[];
}

export default function CustomerBookingHistory({
  bookings,
}: CustomerBookingHistoryProps) {
  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "Confirmed" ||
      booking.status === "Pending",
  );

  const previousBookings = bookings.filter(
    (booking) =>
      booking.status === "Completed" ||
      booking.status === "Cancelled",
  );

  return (
    <section className="space-y-6">
      {/* Upcoming bookings */}
      {upcomingBookings.length > 0 && (
        <BookingSection
          title="Upcoming Events"
          description="Events currently scheduled for this customer."
          bookings={upcomingBookings}
        />
      )}

      {/* Previous bookings */}
      <BookingSection
        title="Booking History"
        description="Previous events and completed bookings."
        bookings={previousBookings}
      />

      {/* Empty state */}
      {bookings.length === 0 && (
        <div className="rounded-2xl border border-[#e8e1d8] bg-white px-5 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
            <CalendarDays size={22} />
          </div>

          <h3 className="mt-4 text-base font-bold text-[#29241f]">
            No bookings yet
          </h3>

          <p className="mt-1 text-sm text-[#756d64]">
            This customer has not made any bookings.
          </p>

          <Link
            href="/booking"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#b8894b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
          >
            Create Booking
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}

function BookingSection({
  title,
  description,
  bookings,
}: {
  title: string;
  description: string;
  bookings: CustomerBooking[];
}) {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#eee8e1] px-5 py-5 sm:px-6">
        <h2 className="text-lg font-bold text-[#29241f]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-[#756d64]">
          {description}
        </p>
      </div>

      {/* Bookings */}
      <div className="divide-y divide-[#eee8e1]">
        {bookings.map((booking) => (
          <BookingItem
            key={booking.id}
            booking={booking}
          />
        ))}
      </div>
    </div>
  );
}

function BookingItem({
  booking,
}: {
  booking: CustomerBooking;
}) {
  return (
    <div className="p-5 transition hover:bg-[#fdfbf8] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Main information */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#9a6c37]">
              {booking.type}
            </span>

            <StatusBadge status={booking.status} />
          </div>

          <h3 className="mt-1 text-base font-bold text-[#29241f]">
            {booking.event}
          </h3>

          <p className="mt-1 text-xs text-[#9b938a]">
            Booking ID: {booking.id}
          </p>

          {/* Details */}
          <div className="mt-4 grid gap-3 text-sm text-[#756d64] sm:grid-cols-2 xl:grid-cols-4">
            <DetailItem
              icon={<CalendarDays size={15} />}
              label="Date"
              value={`${booking.date} · ${booking.time}`}
            />

            <DetailItem
              icon={<MapPin size={15} />}
              label="Location"
              value={booking.location}
            />

            <DetailItem
              icon={<Users size={15} />}
              label="Guests"
              value={`${booking.guests} guests`}
            />

            <DetailItem
              icon={<Clock3 size={15} />}
              label="Package"
              value={booking.package}
            />
          </div>
        </div>

        {/* Amount + action */}
        <div className="flex shrink-0 items-center justify-between gap-5 border-t border-[#eee8e1] pt-4 lg:min-w-[180px] lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
          <div>
            <p className="text-[11px] text-[#9b938a]">
              Booking Amount
            </p>

            <p className="mt-1 text-lg font-bold text-[#29241f]">
              {formatCurrency(booking.amount)}
            </p>
          </div>

          <Link
            href={`/dashboard/bookings/${booking.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ded5cb] px-3.5 py-2 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
          >
            View Booking
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-[#a7773f]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] text-[#9b938a]">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-[#5f574f]">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: CustomerBooking["status"];
}) {
  const styles = {
    Confirmed: {
      className: "bg-[#edf5ed] text-[#557555]",
      icon: <CheckCircle2 size={12} />,
    },
    Pending: {
      className: "bg-[#fff5df] text-[#9a6c37]",
      icon: <Clock3 size={12} />,
    },
    Completed: {
      className: "bg-[#edf2f5] text-[#5d7180]",
      icon: <CheckCircle2 size={12} />,
    },
    Cancelled: {
      className: "bg-[#f5eeee] text-[#95645d]",
      icon: <XCircle size={12} />,
    },
  };

  const style = styles[status];

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        style.className,
      ].join(" ")}
    >
      {style.icon}
      {status}
    </span>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
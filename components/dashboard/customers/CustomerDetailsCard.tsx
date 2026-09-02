import {
  CalendarDays,
  Mail,
  Phone,
  User,
} from "lucide-react";

interface CustomerDetailsCardProps {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    bookings: number;
    lastBooking: string;
    status: "Active" | "Inactive";
    joinedDate?: string;
  };
}

export default function CustomerDetailsCard({
  customer,
}: CustomerDetailsCardProps) {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="border-b border-[#eee8e1] pb-4">
        <h2 className="text-lg font-bold text-[#29241f]">
          Customer Information
        </h2>

        <p className="mt-1 text-sm text-[#756d64]">
          Contact and account information for this customer.
        </p>
      </div>

      {/* Information */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <InfoItem
          icon={User}
          label="Full Name"
          value={customer.name}
        />

        <InfoItem
          icon={Phone}
          label="Phone Number"
          value={customer.phone}
        />

        <InfoItem
          icon={Mail}
          label="Email Address"
          value={customer.email}
        />

        <InfoItem
          icon={CalendarDays}
          label="Last Booking"
          value={customer.lastBooking}
        />
      </div>

      {/* Account summary */}
      <div className="mt-6 grid gap-3 border-t border-[#eee8e1] pt-5 sm:grid-cols-3">
        <SummaryItem
          label="Customer ID"
          value={customer.id}
        />

        <SummaryItem
          label="Total Bookings"
          value={String(customer.bookings)}
        />

        <SummaryItem
          label="Status"
          value={customer.status}
          status
        />
      </div>

      {/* Joined date */}
      {customer.joinedDate && (
        <div className="mt-5 rounded-xl bg-[#fdfbf8] px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-[#9b938a]">
            Customer Since
          </p>

          <p className="mt-1 text-sm font-semibold text-[#5f574f]">
            {customer.joinedDate}
          </p>
        </div>
      )}
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-[#9b938a]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-[#29241f]">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  status = false,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[#fdfbf8] p-4">
      <p className="text-[11px] uppercase tracking-wide text-[#9b938a]">
        {label}
      </p>

      {status ? (
        <span
          className={[
            "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
            value === "Active"
              ? "bg-[#edf5ed] text-[#557555]"
              : "bg-[#f1efed] text-[#756d64]",
          ].join(" ")}
        >
          {value}
        </span>
      ) : (
        <p className="mt-1 text-sm font-bold text-[#29241f]">
          {value}
        </p>
      )}
    </div>
  );
}
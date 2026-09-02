import Link from "next/link";
import {
  ArrowLeft,
  CalendarPlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from "lucide-react";

import type { Customer } from "./constants";

interface CustomerDetailsHeaderProps {
  customer: Customer;
}

export default function CustomerDetailsHeader({
  customer,
}: CustomerDetailsHeaderProps) {
  return (
    <section className="space-y-5">
      {/* Back */}
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#756d64] transition hover:text-[#9a6c37]"
      >
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      {/* Header Card */}
      <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Customer Info */}
          <div className="flex min-w-0 items-start gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f] sm:h-16 sm:w-16">
              <User size={28} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[#29241f]">
                  {customer.name}
                </h1>

                <span
                  className={[
                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    customer.status === "Active"
                      ? "bg-[#edf5ed] text-[#557555]"
                      : "bg-[#f5eeee] text-[#95645d]",
                  ].join(" ")}
                >
                  {customer.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-[#9b938a]">
                {customer.id}
              </p>

              {/* Contact Information */}
              <div className="mt-4 flex flex-col gap-2 text-sm text-[#756d64] sm:flex-row sm:flex-wrap sm:gap-x-5">
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center gap-2 transition hover:text-[#9a6c37]"
                >
                  <Phone
                    size={15}
                    className="text-[#a7773f]"
                  />
                  {customer.phone}
                </a>

                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex items-center gap-2 transition hover:text-[#9a6c37]"
                >
                  <Mail
                    size={15}
                    className="text-[#a7773f]"
                  />
                  {customer.email}
                </a>

                <span className="inline-flex items-center gap-2">
                  <MapPin
                    size={15}
                    className="text-[#a7773f]"
                  />
                  Customer since {customer.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/booking?customer=${customer.id}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#b8894b] px-4 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
            >
              <CalendarPlus size={16} />
              New Booking
            </Link>

            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] bg-white px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
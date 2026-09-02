import {
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import type { Customer } from "./constants";

interface CustomerContactCardProps {
  customer: Customer;
}

export default function CustomerContactCard({
  customer,
}: CustomerContactCardProps) {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
          <UserRound size={19} />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#29241f]">
            Contact Information
          </h2>

          <p className="mt-0.5 text-xs text-[#8d847b]">
            Customer contact details
          </p>
        </div>
      </div>

      {/* Contact details */}
      <div className="mt-6 space-y-4">
        <ContactItem
          icon={<Phone size={17} />}
          label="Phone"
          value={customer.phone}
          href={`tel:${customer.phone}`}
        />

        <ContactItem
          icon={<Mail size={17} />}
          label="Email"
          value={customer.email}
          href={`mailto:${customer.email}`}
        />

        <ContactItem
          icon={<MapPin size={17} />}
          label="Location"
          value={customer.location}
        />
      </div>

      {/* Actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a
          href={`tel:${customer.phone}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ded5cb] px-4 py-2.5 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
        >
          <Phone size={16} />
          Call Customer
        </a>

        <a
          href={`mailto:${customer.email}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
        >
          <Mail size={16} />
          Send Email
        </a>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#9b938a]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-[#403a34]">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl p-2 -mx-2 transition hover:bg-[#fdfbf8]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl p-2 -mx-2">
      {content}
    </div>
  );
}
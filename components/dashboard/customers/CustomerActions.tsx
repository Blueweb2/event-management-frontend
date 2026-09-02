"use client";

import {
  ArrowLeft,
  CalendarPlus,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface CustomerActionsProps {
  customerId: string;
  phone?: string;
  email?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CustomerActions({
  customerId,
  phone,
  email,
  onEdit,
  onDelete,
}: CustomerActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      {/* Back */}
      <Link
        href="/dashboard/customers"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] bg-white px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
      >
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] bg-white px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
          >
            <Phone size={16} />
            <span className="hidden sm:inline">
              Call
            </span>
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] bg-white px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
          >
            <Mail size={16} />
            <span className="hidden sm:inline">
              Email
            </span>
          </a>
        )}

        <Link
          href={`/booking?customer=${customerId}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#b8894b] px-4 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
        >
          <CalendarPlus size={16} />
          New Booking
        </Link>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] bg-white px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
        >
          <Pencil size={16} />
          <span className="hidden sm:inline">
            Edit
          </span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#e4d1cd] bg-white px-4 text-sm font-semibold text-[#9b6258] transition hover:bg-[#fbf1ef]"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">
            Delete
          </span>
        </button>
      </div>
    </div>
  );
}
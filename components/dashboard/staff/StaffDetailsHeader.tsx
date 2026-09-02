import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Pencil,
  Phone,
} from "lucide-react";

import type { StaffMember } from "./constants";

interface StaffDetailsHeaderProps {
  staff: StaffMember;
}

export default function StaffDetailsHeader({
  staff,
}: StaffDetailsHeaderProps) {
  const initials = staff.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const statusClasses = {
    Available: "bg-[#edf5ed] text-[#557555]",
    Busy: "bg-[#fff5df] text-[#9a6c37]",
    "Off Duty": "bg-[#f1eeeb] text-[#756d64]",
  };

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#f7efe4] text-lg font-bold text-[#9a6c37]">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#29241f]">
                {staff.name}
              </h1>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses[staff.status]}`}
              >
                {staff.status}
              </span>
            </div>

            <p className="mt-1 text-sm font-medium text-[#9a6c37]">
              {staff.role}
            </p>

            <p className="mt-1 text-xs text-[#8d847b]">
              {staff.department} · {staff.experience} experience
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${staff.phone}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#ded5cb] px-3.5 py-2 text-xs font-semibold text-[#5f574f] transition hover:bg-[#f8f3ec]"
          >
            <Phone size={14} />
            Call
          </a>

          <a
            href={`mailto:${staff.email}`}
            className="inline-flex items-center gap-2 rounded-full border border-[#ded5cb] px-3.5 py-2 text-xs font-semibold text-[#5f574f] transition hover:bg-[#f8f3ec]"
          >
            <Mail size={14} />
            Email
          </a>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#b8894b] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#a7773f]"
          >
            <Pencil size={14} />
            Edit
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-[#eee8e1] pt-4">
        <Link
          href="/dashboard/staff"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#756d64] hover:text-[#9a6c37]"
        >
          <ArrowLeft size={14} />
          Back to Staff
        </Link>
      </div>
    </section>
  );
}
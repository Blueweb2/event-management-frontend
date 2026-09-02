import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Mail,
  Phone,
} from "lucide-react";

import type { StaffMember } from "./constants";

interface StaffCardProps {
  staff: StaffMember;
}

export default function StaffCard({
  staff,
}: StaffCardProps) {
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
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:border-[#d7c4aa] hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f7efe4] text-sm font-bold text-[#9a6c37]">
          {initials}
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-[#29241f]">
              {staff.name}
            </h3>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses[staff.status]}`}
            >
              {staff.status}
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-[#9a6c37]">
            {staff.role}
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-[#756d64] sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-[#a7773f]" />
          <span className="truncate">{staff.phone}</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail size={14} className="text-[#a7773f]" />
          <span className="truncate">{staff.email}</span>
        </div>
      </div>

      {/* Workload */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#fdfbf8] p-3">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness
              size={14}
              className="text-[#a7773f]"
            />

            <span className="text-[11px] text-[#8d847b]">
              Upcoming
            </span>
          </div>

          <p className="mt-1 text-lg font-bold text-[#29241f]">
            {staff.upcomingEvents}
          </p>
        </div>

        <div className="rounded-xl bg-[#fdfbf8] p-3">
          <p className="text-[11px] text-[#8d847b]">
            Completed
          </p>

          <p className="mt-1 text-lg font-bold text-[#29241f]">
            {staff.completedEvents}
          </p>
        </div>
      </div>

      {/* Details */}
      <Link
        href={`/dashboard/staff/${staff.id}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#ded5cb] px-4 py-2.5 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
      >
        View Details
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
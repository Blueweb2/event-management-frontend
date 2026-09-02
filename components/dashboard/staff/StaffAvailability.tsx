import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import type { StaffMember } from "./constants";

interface StaffAvailabilityProps {
  staff: StaffMember;
}

export default function StaffAvailability({
  staff,
}: StaffAvailabilityProps) {
  const statusConfig = {
    Available: {
      icon: CheckCircle2,
      label: "Available",
      description: "This staff member can be assigned to new events.",
      className: "bg-[#edf5ed] text-[#557555]",
    },
    Busy: {
      icon: Clock3,
      label: "Busy",
      description: "This staff member currently has active assignments.",
      className: "bg-[#fff5df] text-[#9a6c37]",
    },
    "Off Duty": {
      icon: XCircle,
      label: "Off Duty",
      description: "This staff member is currently unavailable.",
      className: "bg-[#f1eeeb] text-[#756d64]",
    },
  };

  const config = statusConfig[staff.status];
  const Icon = config.icon;

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
          <CalendarDays size={18} />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#29241f]">
            Availability
          </h2>

          <p className="mt-1 text-xs text-[#8d847b]">
            Current staff availability and assignment status.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#fdfbf8] p-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${config.className}`}
        >
          <Icon size={19} />
        </div>

        <div>
          <p
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${config.className}`}
          >
            {config.label}
          </p>

          <p className="mt-1 text-xs text-[#756d64]">
            {config.description}
          </p>
        </div>
      </div>
    </section>
  );
}
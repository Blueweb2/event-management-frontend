"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Play,
} from "lucide-react";

import {
  staffDuties,
  type DutyStatus,
} from "@/components/staff/constants";

export default function StaffDutiesPage() {
  const [duties, setDuties] = useState(staffDuties);

  function updateStatus(
    id: string,
    status: DutyStatus
  ) {
    setDuties((current) =>
      current.map((duty) =>
        duty.id === id
          ? { ...duty, status }
          : duty
      )
    );
  }

  return (
    <main className="py-5 sm:py-6">
      <div className="border-b border-[#e8e1d8] pb-6">
        <p className="text-sm font-semibold text-[#9a6c37]">
          Staff Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          My Duties
        </h1>

        <p className="mt-2 text-sm text-[#756d64]">
          Manage the duties assigned to you.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {duties.map((duty) => (
          <article
            key={duty.id}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#29241f]">
                    {duty.title}
                  </h2>

                  <p className="mt-1 text-sm text-[#8d847b]">
                    {duty.event}
                  </p>
                </div>

                <StatusBadge status={duty.status} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Info
                  icon={<CalendarDays size={16} />}
                  label="Date"
                  value={duty.eventDate}
                />

                <Info
                  icon={<Clock3 size={16} />}
                  label="Time"
                  value={duty.eventTime}
                />

                <Info
                  icon={<MapPin size={16} />}
                  label="Location"
                  value={duty.location}
                />
              </div>

              <div className="rounded-xl bg-[#fbf8f4] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9b938a]">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-[#756d64]">
                  {duty.description}
                </p>
              </div>

              <div>
                {duty.status === "Pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        duty.id,
                        "In Progress"
                      )
                    }
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#b8894b] px-4 text-sm font-semibold text-white hover:bg-[#a7773f]"
                  >
                    <Play size={15} />
                    Start Duty
                  </button>
                )}

                {duty.status === "In Progress" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        duty.id,
                        "Completed"
                      )
                    }
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#557555] px-4 text-sm font-semibold text-white hover:opacity-90"
                  >
                    <CheckCircle2 size={15} />
                    Mark Complete
                  </button>
                )}

                {duty.status === "Completed" && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#557555]">
                    <CheckCircle2 size={17} />
                    Duty completed
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: DutyStatus;
}) {
  const classes = {
    Pending: "bg-[#fff4df] text-[#9a6c37]",
    "In Progress": "bg-[#edf5ed] text-[#557555]",
    Completed: "bg-[#f1eee9] text-[#756d64]",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#fbf8f4] p-3">
      <span className="text-[#a7773f]">
        {icon}
      </span>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-[#9b938a]">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#403a34]">
          {value}
        </p>
      </div>
    </div>
  );
}
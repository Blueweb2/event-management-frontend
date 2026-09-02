"use client";

import { useState } from "react";
import Link from "next/link";
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
  type StaffDuty,
} from "./constants";

export default function TodayDuties() {
  const [duties, setDuties] =
    useState<StaffDuty[]>(staffDuties);

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
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#eee8e1] px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-[#29241f]">
            My Duties
          </h2>

          <p className="mt-1 text-xs text-[#8d847b]">
            Your assigned work
          </p>
        </div>

        <Link
          href="/staff/duties"
          className="text-sm font-semibold text-[#a7773f] hover:text-[#8f6434]"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-[#eee8e1]">
        {duties.map((duty) => (
          <div
            key={duty.id}
            className="p-5"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#29241f]">
                    {duty.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#8d847b]">
                    {duty.event}
                  </p>
                </div>

                <DutyStatusBadge
                  status={duty.status}
                />
              </div>

              <div className="grid gap-2 text-xs text-[#756d64] sm:grid-cols-3">
                <span className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {duty.eventDate}
                </span>

                <span className="flex items-center gap-2">
                  <Clock3 size={14} />
                  {duty.eventTime}
                </span>

                <span className="flex min-w-0 items-center gap-2">
                  <MapPin size={14} />
                  <span className="truncate">
                    {duty.location}
                  </span>
                </span>
              </div>

              {duty.status === "Pending" && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(
                      duty.id,
                      "In Progress"
                    )
                  }
                  className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl bg-[#b8894b] px-4 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
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
                  className="inline-flex min-h-10 w-fit items-center gap-2 rounded-xl bg-[#557555] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <CheckCircle2 size={15} />
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DutyStatusBadge({
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
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, CheckCircle2, ChevronRight, Play } from "lucide-react";
import { staffDuties, type DutyStatus } from "./constants";

export default function TodayDuties() {
  const [duties, setDuties] = useState(staffDuties);

  const toggleStatus = (id: string) => {
    setDuties((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus: DutyStatus =
            d.status === "Pending"
              ? "In Progress"
              : d.status === "In Progress"
              ? "Completed"
              : "Pending";
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#29241f]">Today&apos;s Assigned Duties</h2>
          <p className="text-xs text-[#756d64]">Tasks assigned to your shift</p>
        </div>
        <Link
          href="/staff/duties"
          className="text-xs font-semibold text-[#9a6c37] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3 pt-2">
        {duties.map((duty) => (
          <div
            key={duty.id}
            className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 bg-[#fdfcfb] p-4 sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#29241f]">{duty.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    duty.status === "Completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : duty.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {duty.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{duty.eventName}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock3 size={12} />
                  {duty.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {duty.location}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleStatus(duty.id)}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                duty.status === "Completed"
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : duty.status === "In Progress"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-[#9a6c37] text-white hover:bg-[#7e582d]"
              }`}
            >
              {duty.status === "Pending" && (
                <>
                  <Play size={12} />
                  Start Duty
                </>
              )}
              {duty.status === "In Progress" && (
                <>
                  <CheckCircle2 size={12} />
                  Mark Done
                </>
              )}
              {duty.status === "Completed" && (
                <>
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  Completed
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

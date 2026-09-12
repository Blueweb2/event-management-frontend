"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ChevronRight, User } from "lucide-react";
import { staffEvents } from "./constants";

export default function StaffUpcomingEvents() {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#29241f]">Upcoming Events</h2>
          <p className="text-xs text-[#756d64]">Events you are scheduled for</p>
        </div>
        <Link
          href="/staff/events"
          className="text-xs font-semibold text-[#9a6c37] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3 pt-2">
        {staffEvents.map((evt) => (
          <div
            key={evt.id}
            className="flex items-start justify-between rounded-xl border border-gray-100 bg-[#fdfcfb] p-3.5 transition hover:border-[#e8e1d8]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5ede3] text-[#9a6c37]">
                <CalendarDays size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#29241f]">{evt.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{evt.date}</span>
                  <span>•</span>
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <MapPin size={11} />
                  <span>{evt.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="rounded-full bg-[#f5ede3] px-2 py-0.5 text-[10px] font-bold text-[#9a6c37]">
                {evt.role}
              </span>
              <span className="text-[10px] text-gray-400">{evt.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

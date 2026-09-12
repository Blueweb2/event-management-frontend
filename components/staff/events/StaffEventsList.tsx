import { CalendarDays, Clock3, MapPin, UserCheck, Shield } from "lucide-react";
import type { StaffEvent } from "../constants";

interface StaffEventsListProps {
  events: StaffEvent[];
}

export default function StaffEventsList({ events }: StaffEventsListProps) {
  return (
    <div className="mt-6 space-y-4">
      {events.map((evt) => (
        <article
          key={evt.id}
          className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">
                  {evt.type}
                </span>
                <span className="text-xs text-gray-300">•</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {evt.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#29241f] sm:text-xl">
                {evt.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarDays size={13} className="text-[#9a6c37]" />
                  {evt.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 size={13} className="text-[#9a6c37]" />
                  {evt.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#9a6c37]" />
                  {evt.location}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
              <div className="rounded-xl bg-[#f5ede3] px-3.5 py-2">
                <p className="text-[10px] font-semibold uppercase text-[#9a6c37]">Your Role</p>
                <p className="text-xs font-bold text-[#29241f]">{evt.role}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3.5 py-2">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Event Manager</p>
                <p className="text-xs font-bold text-gray-700">{evt.manager}</p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

import Link from "next/link";
import { Clock3, MapPin } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { formatTime24to12 } from "@/lib/duty-mapper";

export default function TodayDuties({
  assignments,
}: {
  assignments: Assignment[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const duties = assignments
    .filter((item) => item.dutyDate.slice(0, 10) === today)
    .slice(0, 4);

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-[#e8e1d8] bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#29241f]">
            Today&apos;s Assigned Duties
          </h2>
          <p className="text-xs text-[#756d64]">Live duties assigned to your shift</p>
        </div>
        <Link
          href="/staff/duties"
          className="text-xs font-semibold text-[#9a6c37] hover:underline"
        >
          View All
        </Link>
      </div>

      {duties.length === 0 ? (
        <p className="mt-3.5 rounded-2xl bg-[#fdfcfb] p-4 text-xs sm:text-sm text-gray-500 text-center">
          No duties assigned for today.
        </p>
      ) : (
        <div className="mt-3.5 space-y-2.5">
          {duties.map((duty) => {
            const event = typeof duty.event === "string" ? null : duty.event;
            return (
              <div
                key={duty._id}
                className="flex flex-col gap-2.5 rounded-2xl border border-gray-100 bg-[#fdfcfb] p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#29241f] break-words">
                      {duty.dutyTitle}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700">
                      {duty.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {event?.eventName || "Assigned event"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} className="text-[#9a6c37]" />
                      {formatTime24to12(duty.startTime)} - {formatTime24to12(duty.endTime)}
                    </span>
                    <span className="flex items-center gap-1 min-w-0">
                      <MapPin size={12} className="text-[#9a6c37] shrink-0" />
                      <span className="truncate">{event?.location || "Location pending"}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}



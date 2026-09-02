import {
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import { monthlyReports } from "./constants";

export default function BookingReport() {
  const maxBookings = Math.max(
    ...monthlyReports.map((item) => item.bookings)
  );

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <CalendarDays size={17} />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#29241f]">
              Bookings by Month
            </h2>

            <p className="mt-0.5 text-xs text-[#8d847b]">
              Monthly booking volume.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-4">
          {monthlyReports.map((item) => {
            const percentage = Math.round(
              (item.bookings / maxBookings) * 100
            );

            return (
              <div key={item.month}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#5f574f]">
                    {item.month} 2026
                  </span>

                  <span className="font-semibold text-[#29241f]">
                    {item.bookings} bookings
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee8e1]">
                  <div
                    className="h-full rounded-full bg-[#9a6c37]"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#eee8e1] p-3">
          <ClipboardList
            size={16}
            className="text-[#a7773f]"
          />

          <div>
            <p className="text-xs font-semibold text-[#29241f]">
              Booking activity
            </p>

            <p className="mt-0.5 text-[11px] text-[#8d847b]">
              August had the highest booking volume.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
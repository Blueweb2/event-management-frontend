"use client";

import { useState } from "react";
import {
  Check,
  Clock3,
} from "lucide-react";

const initialAvailability = [
  {
    day: "Monday",
    available: true,
    from: "09:00",
    to: "18:00",
  },
  {
    day: "Tuesday",
    available: true,
    from: "09:00",
    to: "18:00",
  },
  {
    day: "Wednesday",
    available: true,
    from: "09:00",
    to: "18:00",
  },
  {
    day: "Thursday",
    available: true,
    from: "09:00",
    to: "18:00",
  },
  {
    day: "Friday",
    available: true,
    from: "09:00",
    to: "18:00",
  },
  {
    day: "Saturday",
    available: false,
    from: "09:00",
    to: "14:00",
  },
  {
    day: "Sunday",
    available: false,
    from: "09:00",
    to: "14:00",
  },
];

export default function StaffAvailabilityPage() {
  const [availability, setAvailability] = useState(
    initialAvailability
  );

  function toggleDay(day: string) {
    setAvailability((current) =>
      current.map((item) =>
        item.day === day
          ? {
              ...item,
              available: !item.available,
            }
          : item
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
          Availability
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#756d64]">
          Let the manager know when you are available to work.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3 border-b border-[#eee8e1] pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <Clock3 size={19} />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#29241f]">
              Weekly Availability
            </h2>

            <p className="mt-1 text-xs text-[#8d847b]">
              Your regular working schedule
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {availability.map((item) => (
            <div
              key={item.day}
              className="rounded-xl border border-[#eee8e1] bg-[#fdfbf8] p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => toggleDay(item.day)}
                  className="flex items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                      item.available
                        ? "border-[#557555] bg-[#557555] text-white"
                        : "border-[#d8cfc5] bg-white"
                    }`}
                  >
                    {item.available && (
                      <Check size={14} />
                    )}
                  </span>

                  <span className="text-sm font-bold text-[#29241f]">
                    {item.day}
                  </span>
                </button>

                {item.available ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={item.from}
                      onChange={(e) =>
                        setAvailability((current) =>
                          current.map((day) =>
                            day.day === item.day
                              ? {
                                  ...day,
                                  from: e.target.value,
                                }
                              : day
                          )
                        )
                      }
                      className="h-10 rounded-lg border border-[#e3dbd2] bg-white px-2 text-sm outline-none focus:border-[#b8894b]"
                    />

                    <span className="text-xs text-[#8d847b]">
                      to
                    </span>

                    <input
                      type="time"
                      value={item.to}
                      onChange={(e) =>
                        setAvailability((current) =>
                          current.map((day) =>
                            day.day === item.day
                              ? {
                                  ...day,
                                  to: e.target.value,
                                }
                              : day
                          )
                        )
                      }
                      className="h-10 rounded-lg border border-[#e3dbd2] bg-white px-2 text-sm outline-none focus:border-[#b8894b]"
                    />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-[#9b938a]">
                    Not Available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-xl bg-[#b8894b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a7773f] sm:w-auto"
        >
          Save Availability
        </button>
      </section>
    </main>
  );
}
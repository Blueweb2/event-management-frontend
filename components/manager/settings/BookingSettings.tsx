"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "manager_booking_settings";

export default function BookingSettings() {
  const [requireConfirmation, setRequireConfirmation] = useState(true);
  const [allowPendingBookings, setAllowPendingBookings] = useState(true);
  const [allowPastDates, setAllowPastDates] = useState(false);
  const [minimumGuests, setMinimumGuests] = useState("10");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.requireConfirmation === "boolean") setRequireConfirmation(parsed.requireConfirmation);
        if (typeof parsed.allowPendingBookings === "boolean") setAllowPendingBookings(parsed.allowPendingBookings);
        if (typeof parsed.allowPastDates === "boolean") setAllowPastDates(parsed.allowPastDates);
        if (parsed.minimumGuests) setMinimumGuests(String(parsed.minimumGuests));
      }
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          requireConfirmation,
          allowPendingBookings,
          allowPastDates,
          minimumGuests: Number(minimumGuests) || 10,
        })
      );
      setMessage("Booking rules saved successfully.");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("Failed to save booking rules.");
    }
  };

  const options = [
    {
      label: "Require Booking Confirmation",
      description:
        "New bookings remain pending until a manager confirms them.",
      value: requireConfirmation,
      setValue: setRequireConfirmation,
    },
    {
      label: "Allow Pending Bookings",
      description:
        "Allow bookings to be saved without immediate confirmation.",
      value: allowPendingBookings,
      setValue: setAllowPendingBookings,
    },
    {
      label: "Allow Past Event Dates",
      description:
        "Allow staff to create bookings for dates that have already passed.",
      value: allowPastDates,
      setValue: setAllowPastDates,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <CalendarCheck size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#29241f]">
              Booking Settings
            </h2>

            <p className="text-sm text-[#9b938a]">
              Configure how customer and staff bookings should be validated.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#eee8e1]">
        {options.map((option) => (
          <div
            key={option.label}
            className="flex items-center justify-between gap-4 p-5 sm:p-6"
          >
            <div>
              <p className="text-sm font-semibold text-[#403a34]">
                {option.label}
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-[#9b938a]">
                {option.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={option.value}
              onClick={() =>
                option.setValue(!option.value)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                option.value
                  ? "bg-[#b8894b]"
                  : "bg-[#d9d0c7]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  option.value
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        ))}

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#403a34]">
              Minimum Guests Per Booking
            </label>

            <p className="mb-3 text-xs text-[#9b938a]">
              Set the minimum number of guests required to submit a booking proposal.
            </p>

            <input
              type="number"
              min="1"
              value={minimumGuests}
              onChange={(e) =>
                setMinimumGuests(e.target.value)
              }
              className="h-11 w-full max-w-xs rounded-xl border border-[#ded5cb] bg-[#fdfbf8] px-3 text-sm outline-none focus:border-[#b8894b]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#b8894b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a7773f] transition"
            >
              Save Booking Settings
            </button>

            {message && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#557555]">
                <CheckCircle2 size={15} />
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationSettings() {
  const [bookingNotifications, setBookingNotifications] =
    useState(true);

  const [eventNotifications, setEventNotifications] =
    useState(true);

  const [staffNotifications, setStaffNotifications] =
    useState(true);

  const [expenseNotifications, setExpenseNotifications] =
    useState(false);

  const settings = [
    {
      label: "Booking Notifications",
      description:
        "Get notified when a new booking is created or updated.",
      value: bookingNotifications,
      setValue: setBookingNotifications,
    },
    {
      label: "Event Notifications",
      description:
        "Receive reminders about upcoming events.",
      value: eventNotifications,
      setValue: setEventNotifications,
    },
    {
      label: "Staff Notifications",
      description:
        "Receive updates about staff assignments and duties.",
      value: staffNotifications,
      setValue: setStaffNotifications,
    },
    {
      label: "Expense Notifications",
      description:
        "Get notified about pending expenses and payments.",
      value: expenseNotifications,
      setValue: setExpenseNotifications,
    },
  ];

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <Bell size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#29241f]">
              Notifications
            </h2>

            <p className="text-sm text-[#9b938a]">
              Choose which updates you want to receive.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#eee8e1]">
        {settings.map((setting) => (
          <div
            key={setting.label}
            className="flex items-center justify-between gap-4 p-5 sm:p-6"
          >
            <div>
              <p className="text-sm font-semibold text-[#403a34]">
                {setting.label}
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-[#9b938a]">
                {setting.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={setting.value}
              onClick={() =>
                setting.setValue(!setting.value)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                setting.value
                  ? "bg-[#b8894b]"
                  : "bg-[#d9d0c7]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  setting.value
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
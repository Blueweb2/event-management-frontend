"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "antigravity_manager_notification_preferences";

export default function NotificationSettings() {
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  const [staffNotifications, setStaffNotifications] = useState(true);
  const [expenseNotifications, setExpenseNotifications] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.booking === "boolean") setBookingNotifications(parsed.booking);
        if (typeof parsed.event === "boolean") setEventNotifications(parsed.event);
        if (typeof parsed.staff === "boolean") setStaffNotifications(parsed.staff);
        if (typeof parsed.expense === "boolean") setExpenseNotifications(parsed.expense);
      }
    } catch {}
  }, []);

  const persistSettings = (
    booking: boolean,
    event: boolean,
    staff: boolean,
    expense: boolean
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ booking, event, staff, expense })
      );
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch {}
  };

  const settings = [
    {
      label: "Booking Notifications",
      description: "Get notified when a new booking is created or updated.",
      value: bookingNotifications,
      onToggle: (val: boolean) => {
        setBookingNotifications(val);
        persistSettings(val, eventNotifications, staffNotifications, expenseNotifications);
      },
    },
    {
      label: "Event Notifications",
      description: "Receive reminders about upcoming events within 72 hours.",
      value: eventNotifications,
      onToggle: (val: boolean) => {
        setEventNotifications(val);
        persistSettings(bookingNotifications, val, staffNotifications, expenseNotifications);
      },
    },
    {
      label: "Staff Notifications",
      description: "Receive updates about staff duty assignments, shift acceptance and attendance.",
      value: staffNotifications,
      onToggle: (val: boolean) => {
        setStaffNotifications(val);
        persistSettings(bookingNotifications, eventNotifications, val, expenseNotifications);
      },
    },
    {
      label: "Expense Notifications",
      description: "Get notified about pending expenses and vendor settlements.",
      value: expenseNotifications,
      onToggle: (val: boolean) => {
        setExpenseNotifications(val);
        persistSettings(bookingNotifications, eventNotifications, staffNotifications, val);
      },
    },
  ];

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#eee8e1] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <Bell size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#29241f]">
              Notification Preferences
            </h2>

            <p className="text-sm text-[#9b938a]">
              Choose which operational updates you want to receive in the notification drawer.
            </p>
          </div>
        </div>

        {savedNotice && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#557555]">
            <CheckCircle2 size={15} />
            <span>Preferences saved</span>
          </div>
        )}
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
              onClick={() => setting.onToggle(!setting.value)}
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
"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Users,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import {
  staffEvents,
  staffDuties,
} from "@/components/staff/constants";

type CalendarItem = {
  id: string;
  type: "event" | "duty";
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  guests?: number;
};

export default function StaffSchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(2026, 8, 1)
  );

  const [selectedDate, setSelectedDate] =
    useState("2026-09-12");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  const monthName = new Intl.DateTimeFormat(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  ).format(currentMonth);

  const selectedItems = getItemsForDate(
    selectedDate
  );

  function previousMonth() {
    const newDate = new Date(
      year,
      month - 1,
      1
    );

    setCurrentMonth(newDate);

    setSelectedDate(
      formatDate(newDate)
    );
  }

  function nextMonth() {
    const newDate = new Date(
      year,
      month + 1,
      1
    );

    setCurrentMonth(newDate);

    setSelectedDate(
      formatDate(newDate)
    );
  }

  function goToToday() {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

    setSelectedDate(
      formatDate(today)
    );
  }

  return (
    <main className="space-y-6 py-5 sm:space-y-8 sm:py-6">
      {/* Header */}
      <header className="border-b border-[#e8e1d8] pb-6">
        <p className="text-sm font-semibold text-[#9a6c37]">
          Staff Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
          My Schedule
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
          View your assigned events and duties in one
          place.
        </p>
      </header>

      {/* Quick summary */}
      <ScheduleSummary />

      {/* Calendar */}
      <section className="overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
        {/* Calendar header */}
        <div className="border-b border-[#eee8e1] px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={previousMonth}
              aria-label="Previous month"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e3dbd2] bg-white text-[#756d64] transition hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-[#29241f]">
                {monthName}
              </h2>

              <button
                type="button"
                onClick={goToToday}
                className="mt-1 text-xs font-semibold text-[#a7773f] hover:underline"
              >
                Today
              </button>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e3dbd2] bg-white text-[#756d64] transition hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
            <Legend
              className="bg-[#b8894b]"
              label="Event"
            />

            <Legend
              className="bg-[#557555]"
              label="Duty"
            />
          </div>
        </div>

        {/* Calendar */}
        <div className="p-3 sm:p-5">
          <div className="overflow-hidden rounded-xl border border-[#e8e1d8]">
            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-[#e8e1d8] bg-[#f8f4ee]">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[10px] font-bold text-[#756d64] sm:text-xs"
                >
                  <span className="sm:hidden">
                    {day.charAt(0)}
                  </span>

                  <span className="hidden sm:inline">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map(
                (day, index) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[65px] border-b border-r border-[#eee8e1] bg-[#faf8f5] sm:min-h-[100px]"
                      />
                    );
                  }

                  const dateValue =
                    formatDate(day);

                  const items =
                    getItemsForDate(
                      dateValue
                    );

                  const isSelected =
                    selectedDate ===
                    dateValue;

                  const isToday =
                    formatDate(
                      new Date()
                    ) === dateValue;

                  const hasEvent =
                    items.some(
                      (item) =>
                        item.type ===
                        "event"
                    );

                  const hasDuty =
                    items.some(
                      (item) =>
                        item.type ===
                        "duty"
                    );

                  return (
                    <button
                      key={dateValue}
                      type="button"
                      onClick={() =>
                        setSelectedDate(
                          dateValue
                        )
                      }
                      className={`relative min-h-[65px] border-b border-r border-[#eee8e1] p-1.5 text-left transition sm:min-h-[100px] sm:p-2.5 ${
                        isSelected
                          ? "bg-[#f8f4ee]"
                          : "bg-white hover:bg-[#fdfbf8]"
                      }`}
                    >
                      {/* Date */}
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm ${
                          isToday
                            ? "bg-[#b8894b] text-white"
                            : isSelected
                            ? "bg-[#29241f] text-white"
                            : "text-[#403a34]"
                        }`}
                      >
                        {day.getDate()}
                      </div>

                      {/* Desktop event labels */}
                      <div className="mt-2 hidden space-y-1 sm:block">
                        {hasEvent && (
                          <div className="truncate rounded-md bg-[#f8eee2] px-1.5 py-1 text-[10px] font-semibold text-[#9a6c37]">
                            Event
                          </div>
                        )}

                        {hasDuty && (
                          <div className="truncate rounded-md bg-[#edf5ed] px-1.5 py-1 text-[10px] font-semibold text-[#557555]">
                            Duty
                          </div>
                        )}
                      </div>

                      {/* Mobile dots */}
                      <div className="mt-2 flex gap-1 sm:hidden">
                        {hasEvent && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#b8894b]" />
                        )}

                        {hasDuty && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#557555]" />
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Selected day */}
      <SelectedDay
        date={selectedDate}
        items={selectedItems}
      />
    </main>
  );
}

/* ----------------------------------------
   SUMMARY
----------------------------------------- */

function ScheduleSummary() {
  const upcomingEvents = staffEvents;

  const pendingDuties = staffDuties.filter(
    (duty) => duty.status !== "Completed"
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <SummaryCard
        icon={<CalendarDays size={17} />}
        label="Events"
        value={String(upcomingEvents.length)}
      />

      <SummaryCard
        icon={<ClipboardList size={17} />}
        label="Duties"
        value={String(pendingDuties.length)}
      />

      <div className="col-span-2 sm:col-span-1">
        <SummaryCard
          icon={<CheckCircle2 size={17} />}
          label="Completed"
          value={String(
            staffDuties.filter(
              (duty) => duty.status === "Completed"
            ).length
          )}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#a7773f]">
        {icon}

        <span className="text-xs font-semibold">
          {label}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold text-[#29241f]">
        {value}
      </p>
    </div>
  );
}

/* ----------------------------------------
   SELECTED DAY
----------------------------------------- */

function SelectedDay({
  date,
  items,
}: {
  date: string;
  items: CalendarItem[];
}) {
  const displayDate =
    new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(
      new Date(`${date}T00:00:00`)
    );

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] px-5 py-4">
        <p className="text-xs font-semibold text-[#a7773f]">
          Selected Day
        </p>

        <h2 className="mt-1 text-lg font-bold text-[#29241f]">
          {displayDate}
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <CalendarDays
            size={26}
            className="mx-auto text-[#b8894b]"
          />

          <p className="mt-3 text-sm font-semibold text-[#29241f]">
            No schedule for this day
          </p>

          <p className="mt-1 text-xs text-[#8d847b]">
            You have no assigned events or duties
            on this date.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#eee8e1]">
          {items.map((item) => (
            <ScheduleItem
              key={`${item.type}-${item.id}`}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------
   SCHEDULE ITEM
----------------------------------------- */

function ScheduleItem({
  item,
}: {
  item: CalendarItem;
}) {
  const isEvent =
    item.type === "event";

  return (
    <div className="p-5">
      <div className="flex gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isEvent
              ? "bg-[#f8eee2] text-[#a7773f]"
              : "bg-[#edf5ed] text-[#557555]"
          }`}
        >
          {isEvent ? (
            <CalendarDays size={19} />
          ) : (
            <ClipboardList size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  isEvent
                    ? "bg-[#f8eee2] text-[#9a6c37]"
                    : "bg-[#edf5ed] text-[#557555]"
                }`}
              >
                {isEvent
                  ? "EVENT"
                  : "DUTY"}
              </span>

              <h3 className="mt-2 text-sm font-bold text-[#29241f]">
                {item.title}
              </h3>
            </div>

            <span className="w-fit rounded-full bg-[#f8f4ee] px-2.5 py-1 text-[10px] font-semibold text-[#756d64]">
              {item.status}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#756d64]">
            <div className="flex items-center gap-2">
              <Clock3
                size={14}
                className="text-[#a7773f]"
              />
              {item.time}
            </div>

            <div className="flex items-center gap-2">
              <MapPin
                size={14}
                className="text-[#a7773f]"
              />
              {item.location}
            </div>

            {item.guests !==
              undefined && (
              <div className="flex items-center gap-2">
                <Users
                  size={14}
                  className="text-[#a7773f]"
                />
                {item.guests} guests
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   LEGEND
----------------------------------------- */

function Legend({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[#756d64]">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />

      {label}
    </div>
  );
}

/* ----------------------------------------
   CALENDAR HELPERS
----------------------------------------- */

function getCalendarDays(
  year: number,
  month: number
): (Date | null)[] {
  const firstDay = new Date(
    year,
    month,
    1
  );

  const lastDay = new Date(
    year,
    month + 1,
    0
  );

  const days: (Date | null)[] = [];

  for (
    let i = 0;
    i < firstDay.getDay();
    i++
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= lastDay.getDate();
    day++
  ) {
    days.push(
      new Date(year, month, day)
    );
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function formatDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ----------------------------------------
   GET EVENTS + DUTIES FOR DATE
----------------------------------------- */

function getItemsForDate(
  date: string
): CalendarItem[] {
  const items: CalendarItem[] = [];

  staffEvents.forEach((event) => {
    const eventDate = parseDisplayDate(
      event.date
    );

    if (eventDate === date) {
      items.push({
        id: event.id,
        type: "event",
        title: event.name,
        date: date,
        time: event.time,
        location: event.location,
        guests: event.guests,
        status: event.status,
      });
    }
  });

  staffDuties.forEach((duty) => {
    const dutyDate = parseDisplayDate(
      duty.eventDate
    );

    if (dutyDate === date) {
      items.push({
        id: duty.id,
        type: "duty",
        title: duty.title,
        date: date,
        time: duty.eventTime,
        location: duty.location,
        status: duty.status,
      });
    }
  });

  return items;
}

function parseDisplayDate(
  value: string
): string {
  const date = new Date(
    `${value}, 2026`
  );

  return formatDate(date);
}
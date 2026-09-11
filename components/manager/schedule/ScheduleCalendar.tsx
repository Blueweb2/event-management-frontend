"use client";

import { ChevronDown, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";

import ScheduleDay from "./ScheduleDay";
import type { ScheduleEventData } from "./ScheduleEvent";

interface ScheduleCalendarProps {
  events?: ScheduleEventData[];
  onEventClick?: (
    event: ScheduleEventData,
  ) => void;
  onBack?: () => void;
  onAddShift?: () => void;
}

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();

  result.setDate(
    result.getDate() -
      (day === 0 ? 6 : day - 1),
  );

  result.setHours(0, 0, 0, 0);

  return result;
};

const isSameDate = (
  first: Date,
  second: Date,
) => {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
};

const formatMonth = (date: Date) => {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

export default function ScheduleCalendar({
  events = [],
  onEventClick,
  onBack,
  onAddShift,
}: ScheduleCalendarProps) {
  const today = useMemo(
    () => new Date(),
    [],
  );

  const [selectedDate, setSelectedDate] =
    useState(today);

  const weekDates = useMemo(() => {
    const start = getStartOfWeek(
      selectedDate,
    );

    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(start);

        date.setDate(
          start.getDate() + index,
        );

        return date;
      },
    );
  }, [selectedDate]);

  const selectedEvents = events.filter(
    (event) => {
      // The current schedule UI accepts
      // already-filtered events.
      return true;
    },
  );

  const goToPreviousWeek = () => {
    const date = new Date(selectedDate);

    date.setDate(
      date.getDate() - 7,
    );

    setSelectedDate(date);
  };

  const goToNextWeek = () => {
    const date = new Date(selectedDate);

    date.setDate(
      date.getDate() + 7,
    );

    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full"
        >
          <ChevronLeft size={22} />
        </button>

        <h1 className="text-base font-semibold text-[#1F1F1F]">
          Staff Schedule
        </h1>

        <div className="w-10" />
      </header>

      {/* Month selector */}
      <div className="bg-white px-4 py-4">
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm font-medium text-[#1F1F1F]"
        >
          {formatMonth(selectedDate)}

          <ChevronDown
            size={16}
            className="text-gray-500"
          />
        </button>
      </div>

      {/* Week selector */}
      <div className="border-b border-gray-100 bg-white px-3 pb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
            className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="grid flex-1 grid-cols-7 gap-1">
            {weekDates.map((date) => {
              const selected =
                isSameDate(
                  date,
                  selectedDate,
                );

              const isToday =
                isSameDate(
                  date,
                  today,
                );

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() =>
                    setSelectedDate(date)
                  }
                  className={`flex min-h-[58px] flex-col items-center justify-center rounded-xl transition ${
                    selected
                      ? "bg-[#A88A5A] text-white shadow-sm"
                      : "bg-white text-[#1F1F1F]"
                  }`}
                >
                  <span
                    className={`text-[10px] ${
                      selected
                        ? "text-white/80"
                        : "text-gray-400"
                    }`}
                  >
                    {date.toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                      },
                    )}
                  </span>

                  <span className="mt-1 text-sm font-semibold">
                    {date.getDate()}
                  </span>

                  {isToday &&
                    !selected && (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-[#B89563]" />
                    )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goToNextWeek}
            aria-label="Next week"
            className="flex h-10 w-8 shrink-0 items-center justify-center rounded-lg"
          >
            <ChevronLeft
              size={17}
              className="rotate-180"
            />
          </button>
        </div>
      </div>

      {/* Selected day */}
      <div className="mt-3">
        <ScheduleDay
          date={selectedDate}
          events={selectedEvents}
          onEventClick={onEventClick}
        />
      </div>

      {/* Add shift */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-3">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={onAddShift}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1F1F1F] px-4 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98]"
          >
            <span className="text-lg leading-none">
              +
            </span>

            Add Shift
          </button>
        </div>
      </div>
    </div>
  );
}
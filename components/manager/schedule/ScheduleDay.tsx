"use client";

import ScheduleEvent, {
  type ScheduleEventData,
} from "./ScheduleEvent";

interface ScheduleDayProps {
  date: Date;
  events: ScheduleEventData[];
  onEventClick?: (
    event: ScheduleEventData,
  ) => void;
}

export default function ScheduleDay({
  date,
  events,
  onEventClick,
}: ScheduleDayProps) {
  const formattedDate =
    date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <section>
      {/* Day heading */}
      <div className="border-b border-gray-200 bg-[#F8F7F3] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#1F1F1F]">
          {formattedDate}
        </h2>
      </div>

      {/* Events */}
      {events.length > 0 ? (
        <div className="bg-white">
          {events.map((event) => (
            <ScheduleEvent
              key={event.id}
              event={event}
              onClick={onEventClick}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white px-4 py-10 text-center">
          <p className="text-sm text-gray-400">
            No staff scheduled for this day.
          </p>
        </div>
      )}
    </section>
  );
}
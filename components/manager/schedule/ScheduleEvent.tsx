"use client";

import { Clock3, MoreHorizontal } from "lucide-react";

export interface ScheduleEventData {
  id: string;
  staffName: string;
  staffRole?: string;
  staffAvatar?: string;
  startTime: string;
  endTime: string;
  eventName: string;
}

interface ScheduleEventProps {
  event: ScheduleEventData;
  onClick?: (event: ScheduleEventData) => void;
}

export default function ScheduleEvent({
  event,
  onClick,
}: ScheduleEventProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="w-full border-b border-gray-100 bg-white px-4 py-4 text-left transition active:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F4EBDD]">
          {event.staffAvatar ? (
            <img
              src={event.staffAvatar}
              alt={event.staffName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#9A7B4F]">
              {event.staffName
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* Main information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[#1F1F1F]">
              {event.staffName}
            </p>

            <MoreHorizontal
              size={19}
              className="shrink-0 text-gray-500"
            />
          </div>

          {event.staffRole && (
            <p className="truncate text-xs text-gray-500">
              {event.staffRole}
            </p>
          )}

          <div className="mt-1 flex items-center gap-1.5">
            <Clock3
              size={12}
              className="text-gray-400"
            />

            <span className="text-xs text-gray-500">
              {event.startTime} – {event.endTime}
            </span>
          </div>

          {/* Event indicator */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />

            <span className="truncate text-xs text-gray-500">
              {event.eventName}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
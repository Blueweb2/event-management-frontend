"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  eventName: string;
  location: string;
  staffCount: number;
  status: "Upcoming" | "In Progress" | "Completed";
}

const todaySchedule: ScheduleItem[] = [
  {
    id: "SCH-001",
    time: "10:00 AM",
    title: "Staff Briefing",
    eventName: "Annual Corporate Gala",
    location: "Main Office",
    staffCount: 8,
    status: "Completed",
  },
  {
    id: "SCH-002",
    time: "2:00 PM",
    title: "Venue Setup",
    eventName: "Annual Corporate Gala",
    location: "The Grand Hyatt",
    staffCount: 6,
    status: "In Progress",
  },
  {
    id: "SCH-003",
    time: "6:00 PM",
    title: "Event Service",
    eventName: "Annual Corporate Gala",
    location: "The Grand Hyatt",
    staffCount: 8,
    status: "Upcoming",
  },
];

const statusStyles = {
  Upcoming: "bg-[#FFF4D6] text-[#9A7018]",
  "In Progress": "bg-[#E8F0FE] text-[#315EA8]",
  Completed: "bg-[#E8F5E9] text-[#2E7D32]",
};

export default function TodaySchedule() {
  return (
    <section aria-labelledby="today-schedule-heading">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2
            id="today-schedule-heading"
            className="text-base font-semibold text-[#1F1F1F]"
          >
            Today&apos;s Schedule
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Your events and activities for today
          </p>
        </div>

        <Link
          href="/manager/schedule"
          className="text-xs font-medium text-[#9A7B4F] transition hover:text-[#7D623E]"
        >
          View All
        </Link>
      </div>

      {/* Schedule Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {todaySchedule.map((item, index) => {
          const isLast = index === todaySchedule.length - 1;

          return (
            <Link
              key={item.id}
              href={`/manager/schedule?item=${item.id}`}
              className={`relative flex gap-3 p-4 transition hover:bg-gray-50 active:bg-gray-100 ${
                !isLast ? "border-b border-gray-100" : ""
              }`}
            >
              {/* Timeline */}
              <div className="flex w-16 shrink-0 flex-col items-center">
                <span className="text-xs font-semibold text-[#1F1F1F]">
                  {item.time}
                </span>

                <div className="mt-2 flex flex-1 flex-col items-center">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.status === "Completed"
                        ? "bg-[#6B8E6B]"
                        : item.status === "In Progress"
                          ? "bg-[#8B6F47]"
                          : "bg-gray-300"
                    }`}
                  />

                  {!isLast && (
                    <span className="mt-1 h-full w-px bg-gray-200" />
                  )}
                </div>
              </div>

              {/* Schedule Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#1F1F1F]">
                      {item.title}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {item.eventName}
                    </p>
                  </div>

                  <ChevronRight
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />
                </div>

                {/* Metadata */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <MapPin
                      size={13}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span className="truncate">
                      {item.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Users
                      size={13}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span>
                      {item.staffCount} Staff
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      statusStyles[item.status]
                    }`}
                  >
                    {item.status === "Upcoming" && (
                      <Clock3 size={11} />
                    )}

                    {item.status === "In Progress" && (
                      <CalendarDays size={11} />
                    )}

                    {item.status === "Completed" && (
                      <span className="text-[10px]">✓</span>
                    )}

                    {item.status}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
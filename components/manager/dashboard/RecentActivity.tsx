"use client";

import Link from "next/link";
import {
  UserPlus,
  ClipboardCheck,
  CalendarPlus,
  UserCheck,
  Clock3,
  ChevronRight,
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "staff" | "assignment" | "event" | "attendance";
}

const recentActivities: Activity[] = [
  {
    id: "ACT-001",
    title: "New staff added",
    description: "Sarah Johnson was added to the team",
    time: "10 min ago",
    type: "staff",
  },
  {
    id: "ACT-002",
    title: "Assignment created",
    description: "John Doe assigned to Annual Corporate Gala",
    time: "35 min ago",
    type: "assignment",
  },
  {
    id: "ACT-003",
    title: "New event scheduled",
    description: "Wedding Celebration scheduled for 20 Dec",
    time: "1 hour ago",
    type: "event",
  },
  {
    id: "ACT-004",
    title: "Attendance updated",
    description: "8 staff members checked in",
    time: "2 hours ago",
    type: "attendance",
  },
];

const activityConfig = {
  staff: {
    icon: UserPlus,
    iconClass: "bg-[#F4EBDD] text-[#9A7B4F]",
  },
  assignment: {
    icon: ClipboardCheck,
    iconClass: "bg-[#F1F1F1] text-[#555555]",
  },
  event: {
    icon: CalendarPlus,
    iconClass: "bg-[#F4EBDD] text-[#9A7B4F]",
  },
  attendance: {
    icon: UserCheck,
    iconClass: "bg-[#F1F1F1] text-[#555555]",
  },
};

export default function RecentActivity() {
  return (
    <section aria-labelledby="recent-activity-heading">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2
            id="recent-activity-heading"
            className="text-base font-semibold text-[#1F1F1F]"
          >
            Recent Activity
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Latest updates from your team
          </p>
        </div>

        <Link
          href="/manager/attendance"
          className="text-xs font-medium text-[#9A7B4F] transition hover:text-[#7D623E]"
        >
          View All
        </Link>
      </div>

      {/* Activity List */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {recentActivities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const isLast = index === recentActivities.length - 1;

          return (
            <div
              key={activity.id}
              className={`flex items-center gap-3 p-4 ${
                !isLast ? "border-b border-gray-100" : ""
              }`}
            >
              {/* Activity Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
              >
                <Icon size={18} strokeWidth={1.9} />
              </div>

              {/* Activity Content */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1F1F1F]">
                  {activity.title}
                </p>

                <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-gray-500">
                  {activity.description}
                </p>

                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock3 size={11} strokeWidth={1.8} />
                  <span>{activity.time}</span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={17}
                strokeWidth={2}
                className="shrink-0 text-gray-300"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
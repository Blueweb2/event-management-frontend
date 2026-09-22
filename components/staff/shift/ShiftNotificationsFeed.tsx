"use client";

import { useState } from "react";
import { Bell, Calendar, CheckCheck, Clock, Info, ShieldAlert, Sparkles } from "lucide-react";
import type { Assignment } from "@/types/assignment";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "ASSIGNMENT" | "REMINDER" | "SCHEDULE_UPDATE";
  read: boolean;
}

interface ShiftNotificationsFeedProps {
  assignments: Assignment[];
}

export default function ShiftNotificationsFeed({ assignments }: ShiftNotificationsFeedProps) {
  // Generate realistic notifications from assigned shifts
  const generatedNotifications: NotificationItem[] = assignments.flatMap((item, idx) => {
    const event = typeof item.event === "object" ? item.event : null;
    const items: NotificationItem[] = [
      {
        id: `notif-assign-${item._id}-${idx}`,
        title: `New Assignment: ${item.dutyTitle}`,
        message: `You have been assigned to ${event?.eventName || "Event"} on ${item.dutyDate.slice(0, 10)} (${item.startTime} - ${item.endTime}).`,
        timestamp: "2 hours ago",
        type: "ASSIGNMENT",
        read: false,
      },
      {
        id: `notif-remind-${item._id}-${idx}`,
        title: `Shift Reminder`,
        message: `Your shift for ${item.dutyTitle} starts today at ${item.startTime}. Please remember to check in on arrival!`,
        timestamp: "1 hour ago",
        type: "REMINDER",
        read: false,
      },
    ];
    return items;
  }).slice(0, 5);

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    generatedNotifications.length > 0
      ? generatedNotifications
      : [
          {
            id: "default-1",
            title: "Welcome to Staff Portal",
            message: "All shift updates and assignment alerts will appear in your feed here.",
            timestamp: "Just now",
            type: "REMINDER",
            read: true,
          },
        ]
  );

  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-[#9a6c37]">
          <Bell size={18} />
          <h2 className="text-base font-bold text-[#29241f]">Shift Reminders & Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter(filter === "ALL" ? "UNREAD" : "ALL")}
            className="text-xs font-semibold text-[#9a6c37] hover:underline"
          >
            {filter === "ALL" ? "Unread Only" : "Show All"}
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Feed List */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <p className="rounded-xl bg-[#fdfcfb] p-4 text-center text-xs text-gray-500">
            No notifications found.
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleRead(item.id)}
              className={`flex items-start gap-3 rounded-xl border p-3.5 transition cursor-pointer ${
                item.read
                  ? "border-gray-100 bg-[#fdfcfb] text-gray-600 opacity-80"
                  : "border-amber-200/80 bg-amber-50/30 text-gray-900 shadow-2xs"
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  item.type === "ASSIGNMENT"
                    ? "bg-amber-100 text-[#9a6c37]"
                    : item.type === "REMINDER"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {item.type === "ASSIGNMENT" ? (
                  <Calendar size={15} />
                ) : item.type === "REMINDER" ? (
                  <Clock size={15} />
                ) : (
                  <Info size={15} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${item.read ? "text-gray-700" : "text-[#29241f]"}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-gray-400">{item.timestamp}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-600">{item.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

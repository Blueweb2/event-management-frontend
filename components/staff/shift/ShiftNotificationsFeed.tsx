"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Calendar, CheckCheck, Clock, Info, ListTodo, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { formatTime24to12 } from "@/lib/duty-mapper";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "ASSIGNMENT" | "REMINDER" | "SCHEDULE_UPDATE" | "CHECKLIST";
  read: boolean;
  targetId?: string;
  targetUrl?: string;
  actionText?: string;
}

interface ShiftNotificationsFeedProps {
  assignments: Assignment[];
}

export default function ShiftNotificationsFeed({ assignments }: ShiftNotificationsFeedProps) {
  const router = useRouter();

  // Generate realistic notifications from assigned shifts with specific navigation targets
  const generatedNotifications: NotificationItem[] = assignments.flatMap((item, idx) => {
    const event = typeof item.event === "object" ? item.event : null;
    const dateFormatted = new Date(item.dutyDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const items: NotificationItem[] = [];

    // 1. Shift Check-in Reminder (targets Hero Active Shift Widget)
    if (item.status === "ACCEPTED" || item.status === "IN_PROGRESS") {
      items.push({
        id: `notif-remind-${item._id}-${idx}`,
        title: `Shift Check-In Reminder: ${item.dutyTitle}`,
        message: `Your shift for ${item.dutyTitle} is scheduled on ${dateFormatted} (${formatTime24to12(item.startTime)} - ${formatTime24to12(item.endTime)}). Click here to clock in or manage break hours.`,
        timestamp: "Active",
        type: "REMINDER",
        read: false,
        targetId: "active-shift",
        actionText: "Go to Shift Check-in →",
      });
    }

    // 2. Sub-Task Checklist Notification (targets Duty Sub-Task Checklist)
    if (item.checklist && item.checklist.length > 0) {
      const completed = item.checklist.filter((c) => c.completed).length;
      items.push({
        id: `notif-checklist-${item._id}-${idx}`,
        title: `Sub-Task Checklist: ${item.dutyTitle}`,
        message: `Manager assigned ${item.checklist.length} event subtasks (${completed}/${item.checklist.length} completed). Click to inspect & check off tasks.`,
        timestamp: "Recently assigned",
        type: "CHECKLIST",
        read: false,
        targetId: "duty-checklist",
        actionText: "View Sub-Tasks →",
      });
    }

    // 3. New Assignment / Shift Response Needed (targets Today Duties or Duties page)
    if (item.status === "ASSIGNED") {
      items.push({
        id: `notif-assign-${item._id}-${idx}`,
        title: `Action Required: Accept Shift - ${item.dutyTitle}`,
        message: `You have been assigned to ${event?.eventName || "Event"} on ${dateFormatted}. Please review & accept your duty shift.`,
        timestamp: "1 hour ago",
        type: "ASSIGNMENT",
        read: false,
        targetId: "today-duties",
        targetUrl: "/staff/duties",
        actionText: "Accept Shift →",
      });
    }

    return items;
  }).slice(0, 6);

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    generatedNotifications.length > 0
      ? generatedNotifications
      : [
          {
            id: "default-1",
            title: "Welcome to Staff Portal",
            message: "All shift updates, checklist reminders, and assignment alerts will appear in your feed here.",
            timestamp: "Just now",
            type: "REMINDER",
            read: true,
            targetId: "active-shift",
            actionText: "View Active Shift →",
          },
        ]
  );

  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark clicked notification as read
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));

    // 1. If target HTML element exists on current page, smooth scroll & highlight
    if (item.targetId) {
      const element = document.getElementById(item.targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-[#9a6c37]", "ring-offset-2", "rounded-2xl", "transition-all", "duration-500");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-[#9a6c37]", "ring-offset-2", "transition-all", "duration-500");
        }, 2200);
        return;
      }
    }

    // 2. Otherwise navigate to target route if specified
    if (item.targetUrl) {
      router.push(item.targetUrl);
    }
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-xs">
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
      <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="rounded-xl bg-[#fdfcfb] p-4 text-center text-xs text-gray-500">
            No notifications found.
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`group flex items-start gap-3 rounded-xl border p-3.5 transition cursor-pointer hover:border-[#9a6c37] ${
                item.read
                  ? "border-gray-100 bg-[#fdfcfb] text-gray-600 opacity-85"
                  : "border-amber-200/80 bg-amber-50/40 text-gray-900 shadow-2xs"
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${
                  item.type === "ASSIGNMENT"
                    ? "bg-amber-100 text-[#9a6c37]"
                    : item.type === "CHECKLIST"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.type === "REMINDER"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {item.type === "ASSIGNMENT" ? (
                  <Calendar size={15} />
                ) : item.type === "CHECKLIST" ? (
                  <ListTodo size={15} />
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
                  <span className="text-[10px] text-gray-400 shrink-0">{item.timestamp}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-600">{item.message}</p>

                {item.actionText && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-extrabold text-[#9a6c37] group-hover:underline">
                    <span>{item.actionText}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


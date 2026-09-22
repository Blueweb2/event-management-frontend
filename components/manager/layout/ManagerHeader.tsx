"use client";

import { Bell, Menu } from "lucide-react";

interface ManagerHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
}

export default function ManagerHeader({
  title = "Manager",
  onMenuClick,
  onNotificationClick,
  unreadCount = 0,
}: ManagerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Menu Button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
        >
          <Menu size={22} strokeWidth={2} />
        </button>

        {/* Page Title */}
        <h1 className="text-base font-semibold text-gray-900">
          {title}
        </h1>

        {/* Notification Button */}
        <button
          type="button"
          onClick={onNotificationClick}
          aria-label={`Notifications (${unreadCount} unread)`}
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
        >
          <Bell size={21} strokeWidth={2} />

          {/* Dynamic Notification Badge */}
          {unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} unread notifications`}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
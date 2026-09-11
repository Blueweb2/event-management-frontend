"use client";

import { Bell, Menu } from "lucide-react";

interface ManagerHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export default function ManagerHeader({
  title = "Manager",
  onMenuClick,
  onNotificationClick,
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
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 active:scale-95"
        >
          <Bell size={21} strokeWidth={2} />

          {/* Notification indicator */}
          <span
            aria-label="Unread notifications"
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"
          />
        </button>
      </div>
    </header>
  );
}
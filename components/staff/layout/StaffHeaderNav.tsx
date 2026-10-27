"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Clock,
} from "lucide-react";

interface StaffHeaderNavProps {
  onMenuClick: () => void;
  onNotificationClick: () => void;
  unreadCount?: number;
}

export default function StaffHeaderNav({
  onMenuClick,
  onNotificationClick,
  unreadCount = 0,
}: StaffHeaderNavProps) {
  // Live Clock State (updates every 30 seconds)
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e8e1d8] bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* ======================================================= */}
        {/* Left: Hamburger Button & Brand Logo (Mobile only)       */}
        {/* ======================================================= */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            title="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-[#fbf6ef] hover:text-[#9a6c37] active:scale-95 cursor-pointer"
          >
            <Menu size={22} strokeWidth={2} />
          </button>

          <Link href="/staff" className="flex items-center">
            <img
              src="/images/logo.svg"
              alt="Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* ======================================================= */}
        {/* Right: Time & Notification Button                       */}
        {/* ======================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Live Clock (Time) */}
          {currentTime && (
            <div className="flex items-center gap-2 rounded-xl border border-[#ede5d8] bg-[#fbf8f4] px-2.5 sm:px-3 py-1.5 text-xs">
              <Clock size={13} className="text-[#9a6c37]" />
              <span className="font-extrabold text-[#29241f]">{currentTime}</span>
              <span className="hidden sm:inline text-gray-400">·</span>
              <span className="hidden sm:inline text-gray-500 font-medium">{currentDate}</span>
            </div>
          )}

          {/* Notifications Bell Button */}
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label={`Notifications (${unreadCount} unread)`}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-[#fbf6ef] hover:text-[#9a6c37] active:scale-95 cursor-pointer"
          >
            <Bell size={21} strokeWidth={2} />
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
      </div>
    </header>
  );
}

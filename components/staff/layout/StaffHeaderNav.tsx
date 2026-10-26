"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Clock,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Attendance } from "@/types/attendance";

interface StaffHeaderNavProps {
  onMenuClick: () => void;
  onNotificationClick: () => void;
  unreadCount?: number;
  attendance?: Attendance[];
  isDesktopOpen?: boolean;
}

export default function StaffHeaderNav({
  onMenuClick,
  onNotificationClick,
  unreadCount = 0,
  attendance = [],
  isDesktopOpen = true,
}: StaffHeaderNavProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

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

  // Compute Active Attendance / Shift Status
  const activeAttendance = useMemo(() => {
    return attendance.find((item) => item.checkIn && !item.checkOut);
  }, [attendance]);

  const isClockedIn = Boolean(activeAttendance);
  const isShiftPaused = Boolean(activeAttendance?.isPaused);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#e8e1d8] bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* ======================================================= */}
        {/* Left: Menu / Hamburger Toggle Button & Logo             */}
        {/* (Identical to Manager Header: visible on mobile, and on  */}
        {/* desktop when the sidebar is collapsed/closed)           */}
        {/* ======================================================= */}
        <div
          className={`flex items-center gap-3 ${
            isDesktopOpen ? "lg:hidden" : ""
          }`}
        >
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={isDesktopOpen ? "Toggle sidebar menu" : "Open menu"}
            title={isDesktopOpen ? "Collapse sidebar" : "Expand sidebar"}
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
        {/* Right: Icons like in Manager Dashboard                  */}
        {/* ======================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Live Clock Badge */}
          {currentTime && (
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-[#ede5d8] bg-[#fbf8f4] px-3 py-1.5 text-xs">
              <Clock size={13} className="text-[#9a6c37]" />
              <span className="font-extrabold text-[#29241f]">{currentTime}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 font-medium">{currentDate}</span>
            </div>
          )}

          {/* Live Duty Status Badge */}
       

          {/* Notification Bell Button with Badge */}
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

          {/* User Profile Mini Badge */}
          <Link
            href="/staff/profile"
            className="flex items-center gap-2 rounded-xl p-1 sm:px-2.5 sm:py-1 hover:bg-[#fbf6ef] transition"
            title="My Profile"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#9a6c37] to-[#ba8a4d] text-xs font-black text-white shadow-2xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="hidden xl:block text-left min-w-0">
              <p className="truncate text-xs font-bold text-gray-900 max-w-[110px]">
                {user?.name || "Staff Member"}
              </p>
              <p className="truncate text-[10px] text-gray-400 font-medium">
                {user?.role || "Staff"}
              </p>
            </div>
          </Link>

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Sign out of Staff Portal"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}

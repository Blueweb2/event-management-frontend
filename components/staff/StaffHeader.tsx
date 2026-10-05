"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Bell, LogOut, UserCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Assignment } from "@/types/assignment";
import ShiftNotificationsFeed from "@/components/staff/shift/ShiftNotificationsFeed";

interface StaffHeaderProps {
  assignments?: Assignment[];
}

export default function StaffHeader({ assignments = [] }: StaffHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Approximate unread count based on assigned shifts
  const unreadCount = useMemo(() => {
    return assignments.filter(
      (a) =>
        a.status === "ASSIGNED" ||
        a.status === "IN_PROGRESS" ||
        (a.checklist && a.checklist.some((c) => !c.completed))
    ).length;
  }, [assignments]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <>
      <header className="flex items-center justify-between rounded-2xl border border-[#e8e1d8] bg-white px-3.5 py-3 sm:px-5 sm:py-3.5 shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#9a6c37] text-white shadow-xs">
            <CalendarDays size={18} className="sm:hidden" />
            <CalendarDays size={20} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">
              Staff Portal
            </span>
            <h1 className="truncate text-sm sm:text-base font-bold text-[#29241f] max-w-[130px] xs:max-w-[180px] sm:max-w-none">
              {user?.name || "Staff Member"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Bell Button: Shift Reminders & Notifications */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 cursor-pointer"
            title="Shift Reminders & Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <Link
            href="/staff/profile"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100"
            title="My Profile"
          >
            <UserCircle size={18} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 sm:h-9 items-center gap-1 rounded-xl border border-red-100 bg-red-50 px-2.5 sm:px-3 text-xs font-medium text-red-600 transition hover:bg-red-100 active:scale-95 cursor-pointer"
          >
            <LogOut size={13} />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Notifications Drawer / Modal */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setNotificationsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <ShiftNotificationsFeed
              assignments={assignments}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

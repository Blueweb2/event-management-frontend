"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Bell, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function StaffHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
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
        <Link
          href="/staff/duties"
          className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100"
          title="Shift Alerts & Duties"
        >
          <Bell size={17} />
        </Link>
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
  );
}


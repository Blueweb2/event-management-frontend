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
    <header className="flex items-center justify-between rounded-2xl border border-[#e8e1d8] bg-white px-5 py-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9a6c37] text-white">
          <CalendarDays size={20} />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">
            Staff Portal
          </span>
          <h1 className="text-base font-bold text-[#29241f]">
            {user?.name || "Staff Member"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/staff/profile"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100"
          title="My Profile"
        >
          <UserCircle size={20} />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-medium text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

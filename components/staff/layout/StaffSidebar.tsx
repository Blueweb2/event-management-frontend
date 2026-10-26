"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  ClipboardList,
  Clock3,
  Package,
  CalendarDays,
  UserCircle,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
  Bell,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";
import { formatTime24to12 } from "@/lib/time-utils";

interface StaffSidebarProps {
  isOpen: boolean; // Mobile slide-over state
  isDesktopOpen?: boolean; // Desktop open state
  onClose: () => void;
  onToggle?: () => void;
  assignments?: Assignment[];
  attendance?: Attendance[];
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export default function StaffSidebar({
  isOpen,
  isDesktopOpen = true,
  onClose,
  onToggle,
  assignments = [],
  attendance = [],
  unreadCount = 0,
  onOpenNotifications,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // If closed on mobile and closed on desktop, do not render
  if (!isOpen && !isDesktopOpen) {
    return null;
  }

  const handleLogout = () => {
    logout();
    onClose();
    router.replace("/login");
  };

  // 1. Calculate live shift status
  const activeAttendance = useMemo(() => {
    return attendance.find((item) => item.checkIn && !item.checkOut);
  }, [attendance]);

  const isClockedIn = Boolean(activeAttendance);
  const isShiftPaused = Boolean(activeAttendance?.isPaused);

  // 2. Count new assigned shifts waiting for confirmation
  const pendingAssignmentsCount = useMemo(() => {
    return assignments.filter((a) => a.status === "ASSIGNED").length;
  }, [assignments]);

  // 3. Resolve today's shift for the mini widget in sidebar
  const todayShift = useMemo(() => {
    if (!assignments || assignments.length === 0) return null;
    const now = new Date();
    const todayLocalYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Prefer active shift if any
    if (activeAttendance) {
      const activeDutyId =
        typeof activeAttendance.duty === "string"
          ? activeAttendance.duty
          : activeAttendance.duty?._id;
      const found = assignments.find((a) => a._id === activeDutyId);
      if (found) return found;
    }

    // Match today's date
    return (
      assignments.find((a) => {
        if (a.status === "CANCELLED" || a.status === "REJECTED" || a.status === "COMPLETED")
          return false;
        const d = a.dutyDate ? a.dutyDate.slice(0, 10) : "";
        return d === todayLocalYMD;
      }) || null
    );
  }, [assignments, activeAttendance]);

  // Navigation Items
  const navItems = [
    {
      group: "WORKSPACE",
      items: [
        {
          label: "Dashboard",
          href: "/staff",
          icon: LayoutDashboard,
          badge: null,
          exact: true,
        },
        {
          label: "My Shifts & Duties",
          href: "/staff/duties",
          icon: ClipboardList,
          badge: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} New` : null,
          badgeColor: "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold",
        },
        {
          label: "Attendance & Hours",
          href: "/staff/attendance",
          icon: Clock3,
          badge: isClockedIn ? "LIVE" : null,
          badgeColor: "bg-emerald-500 text-white animate-pulse font-extrabold",
        },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        {
          label: "Stock & Equipment",
          href: "/staff/stock",
          icon: Package,
          badge: "Items",
          badgeColor: "bg-stone-100 text-stone-700 font-semibold",
        },
        {
          label: "Availability & Leave",
          href: "/staff/availability",
          icon: CalendarDays,
          badge: null,
        },
      ],
    },
    {
      group: "ACCOUNT",
      items: [
        {
          label: "My Profile",
          href: "/staff/profile",
          icon: UserCircle,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* Mobile Backdrop Overlay (Visible only on < lg when open) */}
      {/* ========================================================= */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* ========================================================= */}
      {/* Sidebar Container (Docked on desktop, drawer on mobile)  */}
      {/* ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-white transition-[width,transform] duration-200 lg:z-30 lg:border-r lg:border-[#e8e1d8] lg:shadow-none ${
          isDesktopOpen ? "lg:flex lg:w-64" : "lg:hidden"
        } ${
          isOpen ? "flex w-[85%] max-w-sm shadow-xl" : "hidden"
        }`}
        role="navigation"
        aria-label="Staff navigation sidebar"
      >
        {/* ======================================================= */}
        {/* Header: Hamburger Icon & Logo (Like Manager Dashboard) */}
        {/* ======================================================= */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e8e1d8] px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggle || onClose}
              aria-label={isDesktopOpen ? "Collapse sidebar" : "Toggle sidebar menu"}
              title={isDesktopOpen ? "Collapse sidebar" : "Toggle sidebar menu"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 transition hover:bg-[#fbf6ef] hover:text-[#9a6c37] active:scale-95 cursor-pointer"
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

          {/* Close Button (Mobile Only) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 active:scale-95 lg:hidden cursor-pointer"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* ======================================================= */}
        {/* Navigation Links Grouped by Section */}
        {/* ======================================================= */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4 no-scrollbar">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1">
              <p className="px-2.5 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                {group.group}
              </p>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-[#29241f] text-white shadow-xs"
                        : "text-gray-700 hover:bg-[#fbf6ef] hover:text-[#9a6c37]"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.3 : 1.8}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? "text-[#d8a86c]"
                          : "text-gray-500 group-hover:text-[#9a6c37]"
                      }`}
                    />

                    <span className="flex-1 truncate">{item.label}</span>

                    {item.badge && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.badgeColor || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    <ChevronRight
                      size={14}
                      className={`transition-transform duration-150 ${
                        isActive
                          ? "text-white/60 translate-x-0.5"
                          : "text-gray-300 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Quick Active Shift Mini Card */}
          {todayShift && (
            <div className="pt-2">
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#9a6c37]">
                    Today&apos;s Duty
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="mt-1 truncate text-xs font-bold text-[#29241f]">
                  {todayShift.dutyTitle}
                </p>
                <p className="text-[11px] text-gray-500">
                  {formatTime24to12(todayShift.startTime)} - {formatTime24to12(todayShift.endTime)}
                </p>

                <Link
                  href="/staff/duties"
                  onClick={onClose}
                  className="mt-2.5 flex items-center justify-between rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#9a6c37] border border-amber-200 hover:bg-[#9a6c37] hover:text-white transition shadow-2xs"
                >
                  <span>{isClockedIn ? "Manage Shift" : "Clock In / View"}</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* ======================================================= */}
        {/* Footer Area: Staff User Profile Card & Sign Out         */}
        {/* ======================================================= */}
        <div className="shrink-0 border-t border-[#e8e1d8] p-3 space-y-2 bg-[#faf7f2]/60">
          {/* Staff User Profile Card at the bottom */}
          <Link
            href="/staff/profile"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                onClose();
              }
            }}
            className="flex items-center gap-2.5 rounded-2xl border border-[#ede5d8] bg-white p-2.5 transition hover:border-[#9a6c37]/50 hover:shadow-2xs"
            title="View profile & account"
          >
            <div className="relative shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#9a6c37] to-[#bd8c4b] font-black text-white shadow-xs text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                  isClockedIn
                    ? isShiftPaused
                      ? "bg-amber-500"
                      : "bg-emerald-500 animate-pulse"
                    : "bg-stone-400"
                }`}
                title={
                  isClockedIn
                    ? isShiftPaused
                      ? "Shift Paused"
                      : "Clocked In & Active"
                    : "Off Duty"
                }
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#29241f]">
                {user?.name || "Staff Member"}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wide ${
                    isClockedIn
                      ? isShiftPaused
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isClockedIn
                        ? isShiftPaused
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                        : "bg-stone-400"
                    }`}
                  />
                  {isClockedIn ? (isShiftPaused ? "Break" : "On Duty") : "Off Duty"}
                </span>
                <span className="truncate text-[10px] text-gray-400 font-medium">
                  {user?.department || "Operations"}
                </span>
              </div>
            </div>
          </Link>

       

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition active:scale-[0.98] cursor-pointer"
            title="Log out of Staff Portal"
          >
            <LogOut size={15} className="shrink-0" />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

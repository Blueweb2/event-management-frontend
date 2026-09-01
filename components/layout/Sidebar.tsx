"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  ClipboardList,
  Users,
  UserRoundCog,
  Utensils,
  ListChecks,
  Wallet,
  CreditCard,
  BarChart3,
  Image,
  Star,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  role?: "manager" | "staff";
  isOpen?: boolean;
  onClose?: () => void;
}

const managerItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: ClipboardList,
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    label: "Staff",
    href: "/dashboard/staff",
    icon: UserRoundCog,
  },
  {
    label: "Food",
    href: "/dashboard/food",
    icon: Utensils,
  },
  {
    label: "Duties",
    href: "/dashboard/duties",
    icon: ListChecks,
  },
  {
    label: "Expenses",
    href: "/dashboard/expenses",
    icon: Wallet,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    label: "Gallery",
    href: "/dashboard/gallery",
    icon: Image,
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const staffItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Events",
    href: "/staff/events",
    icon: CalendarDays,
  },
  {
    label: "My Duties",
    href: "/staff/duties",
    icon: ListChecks,
  },
];

export default function Sidebar({
  role = "manager",
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const items =
    role === "manager"
      ? managerItems
      : staffItems;

  const dashboardHref =
    role === "manager"
      ? "/dashboard"
      : "/staff/dashboard";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className={[
            "fixed inset-0 z-40 lg:hidden",
            "bg-[var(--sage-dark)]/45",
            "backdrop-blur-[2px]",
          ].join(" ")}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 z-50",
          "flex h-screen w-64 flex-col",
          "border-r border-[var(--border)]",
          "bg-[var(--cream)]",
          "shadow-sm",
          "transition-transform duration-300 ease-in-out",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo Header */}
        <div
          className={[
            "flex h-16 items-center justify-between",
            "border-b border-[var(--border)]",
            "px-5",
          ].join(" ")}
        >
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="flex items-center gap-2.5"
            aria-label="Event Management Dashboard"
          >
            {/* Logo Icon */}
            <div
              className={[
                "flex h-9 w-9 items-center justify-center",
                "rounded-xl",
                "bg-[var(--sage-dark)]",
                "text-white",
              ].join(" ")}
            >
              <CalendarDays
                size={20}
                strokeWidth={1.8}
              />
            </div>

            {/* Logo */}
            <span className="font-semibold tracking-tight text-[var(--sage-dark)]">
              Event
              <span className="font-normal text-[var(--sage)]">
                Management
              </span>
            </span>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            className={[
              "rounded-full p-2",
              "text-[var(--taupe)]",
              "transition-all duration-200",
              "hover:bg-[var(--sage-light)]",
              "hover:text-[var(--sage-dark)]",
              "focus:outline-none",
              "focus:ring-2 focus:ring-[var(--sage)]",
              "lg:hidden",
            ].join(" ")}
            aria-label="Close sidebar"
          >
            <X
              size={20}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Role */}
        <div
          className={[
            "border-b border-[var(--border)]",
            "bg-[var(--ivory)]",
            "px-5 py-4",
          ].join(" ")}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--taupe)]">
            Portal
          </p>

          <p className="mt-1 text-sm font-semibold capitalize text-[var(--sage-dark)]">
            {role} Portal
          </p>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label={`${role} navigation`}
        >
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={[
                    "group flex items-center gap-3",
                    "rounded-xl px-3 py-2.5",
                    "text-sm font-medium",
                    "transition-all duration-200",

                    isActive
                      ? [
                          "bg-[var(--sage-light)]",
                          "text-[var(--sage-dark)]",
                        ].join(" ")
                      : [
                          "text-[var(--taupe)]",
                          "hover:bg-[var(--sage-light)]/60",
                          "hover:text-[var(--sage-dark)]",
                        ].join(" "),
                  ].join(" ")}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2 : 1.8}
                    className={[
                      "shrink-0 transition-colors",
                      isActive
                        ? "text-[var(--sage-dark)]"
                        : "text-[var(--sage)] group-hover:text-[var(--sage-dark)]",
                    ].join(" ")}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div
          className={[
            "border-t border-[var(--border)]",
            "bg-[var(--ivory)]",
            "p-3",
          ].join(" ")}
        >
          <button
            type="button"
            className={[
              "flex w-full items-center gap-3",
              "rounded-xl px-3 py-2.5",
              "text-sm font-medium",
              "text-[var(--taupe)]",
              "transition-all duration-200",
              "hover:bg-[#f2dfdb]",
              "hover:text-[var(--rose)]",
              "focus:outline-none",
              "focus:ring-2 focus:ring-[var(--rose)]",
            ].join(" ")}
          >
            <LogOut
              size={19}
              strokeWidth={1.8}
            />

            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
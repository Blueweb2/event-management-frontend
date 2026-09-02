"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Home,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

interface DashboardBottomNavProps {
  role?: "manager" | "staff";
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export default function DashboardBottomNav({
  role = "manager",
}: DashboardBottomNavProps) {
  const pathname = usePathname();

  const managerItems: NavItem[] = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
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
      label: "Staff",
      href: "/dashboard/staff",
      icon: Users,
    },
  ];

  const staffItems: NavItem[] = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
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
  ];

  const items = role === "manager" ? managerItems : staffItems;

  return (
    <nav
      aria-label="Dashboard navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e8e1d8] bg-[#fdfbf8]/95 shadow-[0_-4px_20px_rgba(41,36,31,0.06)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition",
                isActive
                  ? "text-[#9a6c37]"
                  : "text-[#8d847b] hover:bg-[#f7efe4] hover:text-[#5f574f]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-10 items-center justify-center rounded-full transition",
                  isActive ? "bg-[#f7efe4]" : "",
                ].join(" ")}
              >
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>

              <span className="text-[10px] font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More */}
        <Link
          href="/dashboard/more"
          className={[
            "flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition",
            pathname.startsWith("/dashboard/more")
              ? "text-[#9a6c37]"
              : "text-[#8d847b] hover:bg-[#f7efe4] hover:text-[#5f574f]",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-10 items-center justify-center rounded-full",
              pathname.startsWith("/dashboard/more")
                ? "bg-[#f7efe4]"
                : "",
            ].join(" ")}
          >
            <MoreHorizontal size={20} />
          </span>

          <span className="text-[10px] font-semibold">More</span>
        </Link>
      </div>
    </nav>
  );
}
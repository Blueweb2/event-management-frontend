"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Clock3,
  Menu,
} from "lucide-react";

interface StaffBottomNavProps {
  onMore: () => void;
}

export default function StaffBottomNav({ onMore }: StaffBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/staff", icon: LayoutDashboard },
    { label: "Duties", href: "/staff/duties", icon: ClipboardList },
    { label: "Events", href: "/staff/events", icon: CalendarDays },
    { label: "Schedule", href: "/staff/schedule", icon: Clock3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e8e1d8] bg-white px-2 py-2 sm:px-6 lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] font-medium transition ${
                isActive
                  ? "text-[#9a6c37]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onMore}
          className="flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-900"
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}

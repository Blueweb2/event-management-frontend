"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Clock3,
  User,
  Menu,
} from "lucide-react";

interface StaffBottomNavProps {
  onMore?: () => void;
}

export default function StaffBottomNav({ onMore }: StaffBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/staff", icon: LayoutDashboard },
    { label: "Shifts", href: "/staff/duties", icon: ClipboardList },
    { label: "Attendance", href: "/staff/attendance", icon: Clock3 },
    { label: "Profile", href: "/staff/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8e1d8] bg-white/95 backdrop-blur-md px-3 py-2 sm:px-6 lg:hidden shadow-lg">
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
              className={`relative flex flex-col items-center gap-1 rounded-2xl px-3.5 py-1.5 text-[11px] font-bold transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-[#9a6c37]"
                  : "text-gray-400 hover:text-gray-800"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-2xl bg-[#9a6c37]/10 -z-10 animate-fade-in" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {onMore && (
          <button
            type="button"
            onClick={onMore}
            className="flex flex-col items-center gap-1 rounded-2xl px-3.5 py-1.5 text-[11px] font-bold text-gray-400 hover:text-gray-800 transition active:scale-95"
          >
            <Menu size={20} />
            <span>More</span>
          </button>
        )}
      </div>
    </nav>
  );
}

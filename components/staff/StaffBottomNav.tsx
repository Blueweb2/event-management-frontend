"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Home,
  MoreHorizontal,
} from "lucide-react";

const navigation = [
  {
    label: "Home",
    href: "/staff",
    icon: Home,
  },
  {
    label: "Events",
    href: "/staff/events",
    icon: CalendarDays,
  },
  {
    label: "Duties",
    href: "/staff/duties",
    icon: ClipboardList,
  },
];

interface StaffBottomNavProps {
  onMore: () => void;
}

export default function StaffBottomNav({
  onMore,
}: StaffBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8e1d8] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(41,36,31,0.06)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                active
                  ? "text-[#a7773f]"
                  : "text-[#8d847b]"
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onMore}
          className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-[#8d847b]"
        >
          <MoreHorizontal size={19} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
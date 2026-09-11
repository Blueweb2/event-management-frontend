"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
LayoutDashboard,
Users,
ClipboardList,
CalendarDays,
MoreHorizontal,
} from "lucide-react";

interface ManagerBottomNavProps {
onMenuClick?: () => void;
}

const navigationItems = [
{
label: "Home",
href: "/manager",
icon: LayoutDashboard,
},
{
label: "Staff",
href: "/manager/staff",
icon: Users,
},
{
label: "Assignments",
href: "/manager/assignments",
icon: ClipboardList,
},
{
label: "Schedule",
href: "/manager/schedule",
icon: CalendarDays,
},
];

export default function ManagerBottomNav({
onMenuClick,
}: ManagerBottomNavProps) {
const pathname = usePathname();

return ( <nav
   className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur"
   aria-label="Manager bottom navigation"
 > <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
{navigationItems.map((item) => {
const Icon = item.icon;

      const isActive =
        item.href === "/manager"
          ? pathname === "/manager"
          : pathname.startsWith(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-medium transition active:scale-95 ${
            isActive
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-800"
          }`}
          aria-current={isActive ? "page" : undefined}
        >
          <span
            className={`flex h-8 w-10 items-center justify-center rounded-full transition ${
              isActive ? "bg-gray-100" : ""
            }`}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.3 : 2}
            />
          </span>

          <span>{item.label}</span>
        </Link>
      );
    })}

    {/* More / Menu */}
    <button
      type="button"
      onClick={onMenuClick}
      className="flex min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-medium text-gray-500 transition hover:text-gray-800 active:scale-95"
      aria-label="Open more menu"
    >
      <span className="flex h-8 w-10 items-center justify-center rounded-full">
        <MoreHorizontal size={21} strokeWidth={2} />
      </span>

      <span>More</span>
    </button>
  </div>
</nav>

);
}

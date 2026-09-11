"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
X,
LayoutDashboard,
Users,
ClipboardList,
CalendarDays,
Clock3,
UserCheck,
LogOut,
ChevronRight,
} from "lucide-react";

interface ManagerMenuProps {
isOpen: boolean;
onClose: () => void;
onLogout?: () => void;
}

const menuItems = [
{
label: "Dashboard",
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
{
label: "Availability",
href: "/manager/availability",
icon: Clock3,
},
{
label: "Attendance",
href: "/manager/attendance",
icon: UserCheck,
},
];

export default function ManagerMenu({
isOpen,
onClose,
onLogout,
}: ManagerMenuProps) {
const pathname = usePathname();

if (!isOpen) {
return null;
}

return ( 

<div className="fixed inset-0 z-50">
{/* Background Overlay */} <button
     type="button"
     aria-label="Close menu"
     onClick={onClose}
     className="absolute inset-0 bg-black/40"
   />

  {/* Mobile Drawer */}
  <aside
    className="relative flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl"
    role="dialog"
    aria-modal="true"
    aria-label="Manager navigation menu"
  >
    {/* Header */}
    <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 px-5">
      <div className="flex items-center gap-3">
        {/* Manager Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
          M
        </div>

        {/* Manager Info */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            Manager
          </p>

          <p className="truncate text-xs text-gray-500">
            Management Panel
          </p>
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 active:scale-95"
      >
        <X size={22} strokeWidth={2} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Menu
      </p>

      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/manager"
              ? pathname === "/manager"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {/* Icon */}
              <Icon
                size={20}
                strokeWidth={2}
                className="shrink-0"
              />

              {/* Label */}
              <span className="flex-1">
                {item.label}
              </span>

              {/* Arrow */}
              <ChevronRight
                size={17}
                strokeWidth={2}
                className={
                  isActive
                    ? "text-white/70"
                    : "text-gray-400"
                }
              />
            </Link>
          );
        })}
      </div>
    </nav>

    {/* Logout */}
    <div className="shrink-0 border-t border-gray-200 p-4">
      <button
        type="button"
        onClick={onLogout}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 active:scale-[0.99]"
      >
        <LogOut
          size={20}
          strokeWidth={2}
          className="shrink-0"
        />

        <span className="flex-1 text-left">
          Logout
        </span>
      </button>
    </div>
  </aside>
</div>

);
}

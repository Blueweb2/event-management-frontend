"use client";

import Link from "next/link";
import {
  CalendarClock,
  Clock3,
  LogOut,
  UserRound,
  X,
} from "lucide-react";

interface StaffMoreMenuProps {
  open: boolean;
  onClose: () => void;
}

const items = [
  {
    title: "Availability",
    description: "Manage your availability",
    href: "/staff/availability",
    icon: Clock3,
  },
  {
    title: "Attendance",
    description: "View your attendance",
    href: "/staff/attendance",
    icon: CalendarClock,
  },
  {
    title: "Profile",
    description: "View your staff profile",
    href: "/staff/profile",
    icon: UserRound,
  },
];

export default function StaffMoreMenu({
  open,
  onClose,
}: StaffMoreMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-[#29241f]/20"
      />

      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-[#e8e1d8] bg-[#fbf6ef] p-5 pb-24 shadow-2xl">
        <div className="mx-auto max-w-lg">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#29241f]">
                More
              </h2>

              <p className="mt-1 text-xs text-[#8d847b]">
                Staff account and work tools
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e3dbd2] bg-white text-[#756d64]"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                    <Icon size={18} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#29241f]">
                      {item.title}
                    </span>

                    <span className="mt-0.5 block text-xs text-[#8d847b]">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}

            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-2xl border border-[#eadfd5] bg-white p-4 text-left shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8eeee] text-[#9a6660]">
                <LogOut size={18} />
              </span>

              <span>
                <span className="block text-sm font-bold text-[#29241f]">
                  Logout
                </span>

                <span className="mt-0.5 block text-xs text-[#8d847b]">
                  Sign out of your account
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
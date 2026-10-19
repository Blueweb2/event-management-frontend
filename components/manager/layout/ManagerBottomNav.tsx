"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAuthorizedBottomNavItems } from "@/lib/manager-navigation";

export default function ManagerBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navigationItems = getAuthorizedBottomNavItems(user);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden shadow-lg"
      aria-label="Manager bottom navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
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
                  className={isActive ? "text-[#9A7B4F]" : "text-gray-500"}
                />
              </span>

              <span className="truncate max-w-[70px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

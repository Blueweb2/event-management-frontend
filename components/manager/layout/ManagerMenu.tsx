"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  X,
  Menu,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  getAuthorizedMenuItems,
  getManagerScope,
} from "@/lib/manager-navigation";

// ==========================================
// Props
// ==========================================

interface ManagerMenuProps {
  isOpen: boolean;
  isDesktopOpen?: boolean;
  onClose: () => void;
  onToggle?: () => void;
  onLogout?: () => void;
}

// ==========================================
// Manager Menu
// ==========================================

export default function ManagerMenu({
  isOpen,
  isDesktopOpen = true,
  onClose,
  onToggle,
  onLogout,
}: ManagerMenuProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // If closed on mobile and closed on desktop, do not render
  if (!isOpen && !isDesktopOpen) {
    return null;
  }

  const scope = getManagerScope(user);
  const menuItems = getAuthorizedMenuItems(user);

  return (
    <>
      {/* ======================================
          Mobile Background Overlay (Hidden on desktop)
      ====================================== */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 lg:hidden animate-in fade-in"
        />
      )}

      {/* ======================================
          Sidebar / Drawer
          - On mobile: slide-over drawer when isOpen
          - On desktop: always opened docked sidebar on left
      ====================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-white transition-[width,transform] duration-200 lg:z-30 lg:border-r lg:border-gray-200 lg:shadow-none ${
          isDesktopOpen ? "lg:flex lg:w-64" : "lg:hidden"
        } ${
          isOpen ? "flex w-[85%] max-w-sm shadow-xl" : "hidden"
        }`}
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Manager navigation menu"
      >
        {/* ======================================
            Header: Hamburger Icon & Logo
        ====================================== */}

        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggle || onClose}
              aria-label={isDesktopOpen ? "Collapse sidebar" : "Toggle sidebar menu"}
              title={isDesktopOpen ? "Collapse sidebar" : "Toggle sidebar menu"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100 active:scale-95 cursor-pointer"
            >
              <Menu size={22} strokeWidth={2} />
            </button>

            <Link href="/manager" className="flex items-center">
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

        {/* ======================================
            Navigation (Role & Department Scoped)
        ====================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={[
                    "flex min-h-12 items-center gap-3 rounded-xl px-3",
                    "text-sm font-medium transition",
                    isActive
                      ? "bg-gray-900 text-white shadow-xs"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className={`shrink-0 ${
                      isActive
                        ? scope.isChefManager
                          ? "text-amber-400"
                          : "text-[#9A7B4F]"
                        : "text-gray-500"
                    }`}
                  />

                  {/* Label */}
                  <span className="flex-1">{item.label}</span>

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Arrow */}
                  <ChevronRight
                    size={17}
                    strokeWidth={2}
                    className={isActive ? "text-white/70" : "text-gray-400"}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ======================================
            User Profile & Logout
        ====================================== */}

        <div className="shrink-0 border-t border-gray-200 p-3 space-y-1.5">
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#29241f] text-xs font-bold text-white shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-gray-900">
                {user?.name || "Manager"}
              </p>
              <p className="truncate text-[10px] text-gray-500 font-medium">
                {user?.email || scope.roleTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 active:scale-[0.99] cursor-pointer"
          >
            <LogOut size={16} strokeWidth={2} className="shrink-0" />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
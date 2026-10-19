"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  X,
  LogOut,
  ChevronRight,
  ChefHat,
  Palette,
  Camera,
  ShieldCheck,
  User,
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
  onClose: () => void;
  onLogout?: () => void;
}

// ==========================================
// Manager Menu
// ==========================================

export default function ManagerMenu({
  isOpen,
  onClose,
  onLogout,
}: ManagerMenuProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!isOpen) {
    return null;
  }

  const scope = getManagerScope(user);
  const menuItems = getAuthorizedMenuItems(user);

  return (
    <div className="fixed inset-0 z-50">
      {/* ======================================
          Background Overlay
      ====================================== */}

      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* ======================================
          Mobile Drawer
      ====================================== */}

      <aside
        className="relative flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Manager navigation menu"
      >
        {/* ======================================
            Header
        ====================================== */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex min-w-0 items-center gap-3">
            {/* Scoped Manager Avatar */}
            {scope.isChefManager ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm ring-2 ring-amber-100">
                <ChefHat size={22} strokeWidth={2.2} />
              </div>
            ) : scope.departmentType === "decoration" ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-100">
                <Palette size={20} strokeWidth={2.2} />
              </div>
            ) : scope.departmentType === "photography" ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm ring-2 ring-sky-100">
                <Camera size={20} strokeWidth={2.2} />
              </div>
            ) : scope.isSuperAdmin ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm ring-2 ring-rose-100">
                <ShieldCheck size={22} strokeWidth={2.2} />
              </div>
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6B5B95] text-sm font-semibold text-white shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
              </div>
            )}

            {/* Manager Information */}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user?.name || "Manager"}
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border truncate ${scope.badgeColor}`}
                >
                  {scope.roleTitle} · {scope.departmentDisplay}
                </span>
              </div>
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

        {/* ======================================
            Navigation (Role & Department Scoped)
        ====================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {scope.isChefManager ? "Chef & Kitchen Menus" : `${scope.roleTitle} Menus`}
            </p>
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
              {menuItems.length} items
            </span>
          </div>

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
            Logout
        ====================================== */}

        <div className="shrink-0 border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 active:scale-[0.99]"
          >
            <LogOut size={20} strokeWidth={2} className="shrink-0" />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
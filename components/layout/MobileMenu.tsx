"use client";

import Link from "next/link";
import {
  CalendarDays,
  Home,
  Package,
  Images,
  Star,
  HelpCircle,
  LogIn,
  X,
  ArrowRight,
} from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Packages",
    href: "/#packages",
    icon: Package,
  },
  {
    label: "Gallery",
    href: "/#gallery",
    icon: Images,
  },
  {
    label: "Reviews",
    href: "/#reviews",
    icon: Star,
  },
  {
    label: "How It Works",
    href: "/#how-it-works",
    icon: HelpCircle,
  },
];

export default function MobileMenu({
  isOpen,
  onClose,
}: MobileMenuProps) {
  return (
    <div
      className={[
        "fixed inset-0 z-[100] lg:hidden",
        "transition-all duration-300",
        isOpen
          ? "pointer-events-auto visible"
          : "pointer-events-none invisible",
      ].join(" ")}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/40 backdrop-blur-[2px]",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* Drawer */}
      <aside
        aria-hidden={!isOpen}
        className={[
          "absolute right-0 top-0 flex h-full w-[88%] max-w-sm",
          "flex-col",
          "border-l border-[var(--border)]",
          "bg-[var(--ivory)]",
          "shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sage-dark)] text-white">
              <CalendarDays size={19} />
            </div>

            <span className="font-semibold text-[var(--sage-dark)]">
              EventManagement
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--sage-dark)] transition hover:bg-[var(--cream)]"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--taupe)]">
            Explore
          </p>

          <div className="mt-3 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={[
                    "flex items-center gap-3",
                    "rounded-xl px-4 py-3.5",
                    "text-sm font-medium",
                    "text-[var(--sage-dark)]",
                    "transition-all duration-200",
                    "hover:bg-white",
                    "hover:shadow-sm",
                  ].join(" ")}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sage-light)] text-[var(--sage-dark)]">
                    <Icon size={18} />
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="shrink-0 space-y-3 border-t border-[var(--border)] bg-white p-5">
          <Link
            href="/login"
            onClick={onClose}
            className={[
              "flex min-h-12 w-full items-center justify-center gap-2",
              "rounded-xl",
              "border border-[var(--border)]",
              "text-sm font-semibold",
              "text-[var(--sage-dark)]",
              "transition hover:bg-[var(--cream)]",
            ].join(" ")}
          >
            <LogIn size={18} />
            Manager / Staff Login
          </Link>

          <Link
            href="/booking"
            onClick={onClose}
            className={[
              "flex min-h-12 w-full items-center justify-center gap-2",
              "rounded-xl",
              "bg-[var(--sage-dark)]",
              "text-sm font-semibold text-white",
              "transition hover:bg-[var(--sage)]",
            ].join(" ")}
          >
            Book Your Event
            <ArrowRight size={17} />
          </Link>
        </div>
      </aside>
    </div>
  );
}
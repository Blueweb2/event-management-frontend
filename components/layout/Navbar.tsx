"use client";

import Link from "next/link";
import {
  Menu,
  CalendarDays,
  LogIn,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({
  onMenuClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--ivory)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Event Management Home"
        >
          {/* Logo Icon */}
          <div
            className={[
              "flex h-9 w-9 items-center justify-center",
              "rounded-xl",
              "bg-[var(--sage-dark)]",
              "text-white",
            ].join(" ")}
          >
            <CalendarDays
              size={20}
              strokeWidth={1.8}
            />
          </div>

          {/* Logo Text */}
          <span className="text-lg font-semibold tracking-tight text-[var(--sage-dark)]">
            Event
            <span className="font-normal text-[var(--sage)]">
              Management
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className={[
              "text-sm font-medium",
              "text-[var(--sage-dark)]",
              "transition-colors duration-200",
              "hover:text-[var(--sage)]",
            ].join(" ")}
          >
            Home
          </Link>

          <Link
            href="#events"
            className={[
              "text-sm font-medium",
              "text-[var(--sage-dark)]",
              "transition-colors duration-200",
              "hover:text-[var(--sage)]",
            ].join(" ")}
          >
            Events
          </Link>

          <Link
            href="#packages"
            className={[
              "text-sm font-medium",
              "text-[var(--sage-dark)]",
              "transition-colors duration-200",
              "hover:text-[var(--sage)]",
            ].join(" ")}
          >
            Packages
          </Link>

          <Link
            href="#gallery"
            className={[
              "text-sm font-medium",
              "text-[var(--sage-dark)]",
              "transition-colors duration-200",
              "hover:text-[var(--sage)]",
            ].join(" ")}
          >
            Gallery
          </Link>

          <Link
            href="#reviews"
            className={[
              "text-sm font-medium",
              "text-[var(--sage-dark)]",
              "transition-colors duration-200",
              "hover:text-[var(--sage)]",
            ].join(" ")}
          >
            Reviews
          </Link>

          <Link
            href="#how-it-works"
            className={[
              "text-sm font-medium",
              "text-[var(--sage-dark)]",
              "transition-colors duration-200",
              "hover:text-[var(--sage)]",
            ].join(" ")}
          >
            How It Works
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Login */}
          <Link
            href="/login"
            className={[
              "inline-flex items-center gap-2",
              "rounded-full px-4 py-2",
              "text-sm font-medium",
              "text-[var(--sage-dark)]",
              "transition-all duration-200",
              "hover:bg-[var(--sage-light)]",
              "hover:text-[var(--sage-dark)]",
            ].join(" ")}
          >
            <LogIn size={17} strokeWidth={1.8} />
            Login
          </Link>

          {/* Booking CTA */}
          <Link href="/booking">
            <Button size="sm">
              Book Your Event
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className={[
            "rounded-full p-2.5",
            "text-[var(--sage-dark)]",
            "transition-all duration-200",
            "hover:bg-[var(--sage-light)]",
            "focus:outline-none",
            "focus:ring-2 focus:ring-[var(--sage)]",
            "lg:hidden",
          ].join(" ")}
        >
          <Menu
            size={24}
            strokeWidth={1.8}
          />
        </button>
      </div>
    </header>
  );
}
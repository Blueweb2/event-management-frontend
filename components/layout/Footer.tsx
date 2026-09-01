import Link from "next/link";
import {
  CalendarDays,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer
      className={[
        "border-t border-[var(--border)]",
        "bg-[var(--sage-dark)]",
        "text-[var(--sage-light)]",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Main Footer */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="group flex items-center gap-2.5"
              aria-label="Event Management Home"
            >
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center",
                  "rounded-xl",
                  "bg-[var(--cream)]",
                  "text-[var(--sage-dark)]",
                  "transition-transform duration-200",
                  "group-hover:scale-105",
                ].join(" ")}
              >
                <CalendarDays
                  size={20}
                  strokeWidth={1.8}
                />
              </div>

              <span className="font-semibold tracking-tight text-[var(--cream)]">
                Event
                <span className="font-normal text-[var(--sage-light)]">
                  Management
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--sage-light)]/75">
              We help you plan and manage memorable events
              with carefully selected packages, food,
              services, and professional staff.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cream)]">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[var(--sage-light)]/75 transition-colors duration-200 hover:text-[var(--cream)]"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/#events"
                  className="text-[var(--sage-light)]/75 transition-colors duration-200 hover:text-[var(--cream)]"
                >
                  Events
                </Link>
              </li>

              <li>
                <Link
                  href="/#packages"
                  className="text-[var(--sage-light)]/75 transition-colors duration-200 hover:text-[var(--cream)]"
                >
                  Packages
                </Link>
              </li>

              <li>
                <Link
                  href="/#gallery"
                  className="text-[var(--sage-light)]/75 transition-colors duration-200 hover:text-[var(--cream)]"
                >
                  Gallery
                </Link>
              </li>

              <li>
                <Link
                  href="/#reviews"
                  className="text-[var(--sage-light)]/75 transition-colors duration-200 hover:text-[var(--cream)]"
                >
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cream)]">
              Events
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li className="text-[var(--sage-light)]/75">
                Weddings
              </li>

              <li className="text-[var(--sage-light)]/75">
                Birthdays
              </li>

              <li className="text-[var(--sage-light)]/75">
                Engagements
              </li>

              <li className="text-[var(--sage-light)]/75">
                Corporate Events
              </li>

              <li className="text-[var(--sage-light)]/75">
                Private Functions
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cream)]">
              Contact Us
            </h3>

            <ul className="mt-5 space-y-4 text-sm">

              {/* Address */}
              <li className="flex gap-3">
                <MapPin
                  size={18}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-[var(--blush)]"
                />

                <span className="leading-6 text-[var(--sage-light)]/75">
                  Your Business Address
                </span>
              </li>

              {/* Phone */}
              <li className="flex gap-3">
                <Phone
                  size={18}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-[var(--blush)]"
                />

                <span className="text-[var(--sage-light)]/75">
                  +91 XXXXX XXXXX
                </span>
              </li>

              {/* Email */}
              <li className="flex gap-3">
                <Mail
                  size={18}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-[var(--blush)]"
                />

                <span className="break-all text-[var(--sage-light)]/75">
                  info@example.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div
          className={[
            "mt-10 flex flex-col gap-4",
            "border-t border-[var(--sage-light)]/15",
            "pt-6",
            "sm:flex-row sm:items-center sm:justify-between",
          ].join(" ")}
        >
          <p className="text-xs text-[var(--sage-light)]/55">
            © {new Date().getFullYear()} EventManagement.
            All rights reserved.
          </p>

          <Link
            href="/login"
            className={[
              "inline-flex items-center",
              "text-xs font-medium",
              "text-[var(--sage-light)]/65",
              "transition-colors duration-200",
              "hover:text-[var(--cream)]",
            ].join(" ")}
          >
            Manager / Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
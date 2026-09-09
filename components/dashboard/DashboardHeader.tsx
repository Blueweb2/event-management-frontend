import Link from "next/link";
import {
  CalendarPlus,
  Bell,
  ChevronDown,
  User,
} from "lucide-react";

interface DashboardHeaderProps {
  role?: "manager" | "staff";
}

export default function DashboardHeader({
  role = "manager",
}: DashboardHeaderProps) {
  const isManager = role === "manager";

  return (
    <header className="border-b border-[#E5E7EB] pb-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5F6062]" />

            <p className="text-sm font-semibold text-[#5F6062]">
              {isManager
                ? "Manager Dashboard"
                : "Staff Dashboard"}
            </p>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#5F6062] sm:text-3xl">
            Good morning, {isManager ? "Manager" : "Staff"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#85868A]">
            {isManager
              ? "Here's what's happening with your events today."
              : "Here's an overview of your assigned events and duties."}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {/* Date */}
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-[#9A9BA0]">
              Today
            </p>

            <p className="mt-0.5 text-sm font-semibold text-[#5F6062]">
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date())}
            </p>
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#FEFEFE] text-[#85868A] transition-all duration-200 hover:border-[#DCDDE2] hover:bg-[#F3F4F8] hover:text-[#5F6062] focus:outline-none focus:ring-2 focus:ring-[#5F6062]/10"
          >
            <Bell size={18} strokeWidth={2} />

            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#5F6062] ring-2 ring-[#FEFEFE]"
            />
          </button>

          {/* New Booking */}
          {isManager && (
            <Link
              href="/booking"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#5F6062] px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#48494B] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5F6062]/20 focus:ring-offset-2"
            >
              <CalendarPlus size={17} strokeWidth={2} />

              <span>New Booking</span>
            </Link>
          )}

          {/* Profile */}
          <button
            type="button"
            aria-label="Open profile menu"
            title="Profile"
            className="group flex h-10 items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FEFEFE] pl-1 pr-2 transition-all duration-200 hover:border-[#DCDDE2] hover:bg-[#F3F4F8]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F8] text-[#5F6062]">
              <User size={16} strokeWidth={2} />
            </span>

            <ChevronDown
              size={15}
              strokeWidth={2}
              className="text-[#9A9BA0] transition-transform group-hover:translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
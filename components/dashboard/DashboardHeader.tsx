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
    <header className="border-b border-[#eee8e1] pb-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#b8894b]" />

            <p className="text-sm font-semibold text-[#9a6c37]">
              {isManager
                ? "Manager Dashboard"
                : "Staff Dashboard"}
            </p>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
            Good morning, {isManager ? "Manager" : "Staff"} 
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
            {isManager
              ? "Here's what's happening with your events today."
              : "Here's an overview of your assigned events and duties."}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {/* Date */}
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-[#9b938a]">
              Today
            </p>

            <p className="mt-0.5 text-sm font-semibold text-[#403a34]">
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
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3dbd2] bg-white text-[#756d64] transition-all duration-200 hover:border-[#cdbba5] hover:bg-[#f8f4ee] hover:text-[#29241f] focus:outline-none focus:ring-2 focus:ring-[#b8894b]/20"
          >
            <Bell size={18} />

            <span
              aria-hidden="true"
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b8894b] ring-2 ring-white"
            />
          </button>

          {/* New Booking */}
          {isManager && (
            <Link
              href="/booking"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#b8894b] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#a7773f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#b8894b]/30 focus:ring-offset-2"
            >
              <CalendarPlus size={17} />

              <span>New Booking</span>
            </Link>
          )}

          {/* Profile */}
          <button
            type="button"
            aria-label="Open profile menu"
            title="Profile"
            className="group flex h-10 items-center gap-2 rounded-full border border-[#e3dbd2] bg-white pl-1 pr-2 transition-all duration-200 hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5eee5] text-[#9a6c37]">
              <User size={16} />
            </span>

            <ChevronDown
              size={15}
              className="text-[#9b938a] transition-transform group-hover:translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
} from "lucide-react";

export default function StaffEventsHeader() {
  return (
    <header className="border-b border-[#e8e1d8] pb-6">
      <Link
        href="/staff"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#756d64] hover:text-[#29241f]"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
          <CalendarDays size={20} />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#9a6c37]">
            Staff Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
            My Events
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#756d64]">
            View the events assigned to you.
          </p>
        </div>
      </div>
    </header>
  );
}
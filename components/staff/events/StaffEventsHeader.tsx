import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function StaffEventsHeader() {
  return (
    <div className="border-b border-[#e8e1d8] pb-6">
      <Link
        href="/staff"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a6c37] transition hover:underline"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-[#29241f] sm:text-3xl">My Events</h1>
      <p className="mt-1 text-sm text-[#756d64]">
        All events you are assigned to work as part of the staff team.
      </p>
    </div>
  );
}

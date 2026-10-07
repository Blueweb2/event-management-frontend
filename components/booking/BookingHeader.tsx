import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BookingHeader() {
  return (
    <div className="mb-4 sm:mb-6 flex items-center gap-3">
      <Link
        href="/manager"
        className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-[#d8cfc4] bg-[#faf8f5] text-[#29241f] hover:bg-[#eee8de] active:scale-95 transition shadow-2xs shrink-0"
        title="Return to Manager Dashboard"
      >
        <ArrowLeft size={18} />
      </Link>

      <div>
        <h1 className="text-base sm:text-xl font-black tracking-tight text-[#29241f]">
          Create Event Proposal
        </h1>
        <p className="text-[11px] sm:text-xs text-[#756d64]">
          Fill in event, client, food, and service details.
        </p>
      </div>
    </div>
  );
}
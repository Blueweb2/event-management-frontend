"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

// ==========================================
// Events Header
// ==========================================

interface EventsHeaderProps {
  isOperationsManager?: boolean;
}

export default function EventsHeader({
  isOperationsManager = false,
}: EventsHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex flex-row items-center justify-between gap-3 sm:gap-4 w-full max-w-full min-w-0">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[#8C7A55]">
          {isOperationsManager ? "Events" : "Events & Billing"}
        </p>

        <h1 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-black tracking-tight text-[#252525]">
          Events
        </h1>
        <p className="mt-0.5 text-xs text-gray-500 hidden sm:block">
          {isOperationsManager
            ? "View running events, daily timings, and upcoming bookings."
            : "View quotes, running events, client payments, and bills in one place."}
        </p>
      </div>

      <div className="shrink-0 ml-auto">
        <button
          type="button"
          onClick={() => {
            router.push("/manager/booking");
          }}
          className="inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#252525] px-3.5 sm:px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95 cursor-pointer"
        >
          <Plus size={15} className="text-[#D4AF37]" />
          <span>New Booking</span>
        </button>
      </div>
    </header>
  );
}

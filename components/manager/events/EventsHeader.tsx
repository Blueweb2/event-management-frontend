"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

// ==========================================
// Events Header
// ==========================================

export default function EventsHeader() {
  const router = useRouter();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8C7A55]">
          Operations & Financials
        </p>

        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#252525]">
          Events
        </h1>
        <p className="mt-0.5 text-xs text-gray-500">
          Manage estimates, live operations, client payments, and documentation in one place.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            router.push("/manager/booking");
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#252525] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-95"
        >
          <Plus size={15} className="text-[#D4AF37]" />
          <span>New Booking</span>
        </button>
      </div>
    </header>
  );
}

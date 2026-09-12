"use client";

import { useRouter } from "next/navigation";

// ==========================================
// Events Header
// ==========================================

export default function EventsHeader() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between">
      {/* ======================================
          Title
      ====================================== */}

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8C7A55]">
          Manager
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#252525]">
          Events
        </h1>
      </div>

      {/* ======================================
          Add Event — navigates to Estimates
          so manager can convert an accepted
          estimate into an event.
      ====================================== */}

      <button
        type="button"
        onClick={() => {
          router.push("/manager/estimates");
        }}
        aria-label="Add event from estimate"
        title="Convert an accepted estimate to an event"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#252525] text-xl font-light text-white shadow-sm transition active:scale-95"
      >
        +
      </button>
    </header>
  );
}
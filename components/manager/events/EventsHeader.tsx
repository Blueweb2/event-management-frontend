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
          Add Event / Create Booking
      ====================================== */}

      <button
        type="button"
        onClick={() => {
          router.push("/manager/booking");
        }}
        aria-label="Create new booking"
        title="Create a new event proposal & booking"
        className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[#252525] text-xl font-light text-white shadow-xs transition hover:bg-black active:scale-95"
      >
        +
      </button>
    </header>
  );
}
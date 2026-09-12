// ==========================================
// Empty Events
// ==========================================

export default function EmptyEvents() {
  return (
    <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
      {/* ======================================
          Icon
      ====================================== */}

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F7F3] text-[#8C7A55]">
        <CalendarIcon />
      </div>

      {/* ======================================
          Text
      ====================================== */}

      <h3 className="mt-5 text-base font-bold text-[#252525]">
        No events found
      </h3>

      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
        Confirmed bookings will appear here as
        events.
      </p>
    </div>
  );
}

// ==========================================
// Calendar Icon
// ==========================================

function CalendarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
      />

      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}
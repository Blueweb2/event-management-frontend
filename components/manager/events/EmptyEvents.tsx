// ==========================================
// Empty Events
// ==========================================

interface EmptyEventsProps {
  title?: string;
  description?: string;
}

export default function EmptyEvents({
  title = "No events found",
  description = "Confirmed bookings will show up here.",
}: EmptyEventsProps) {
  return (
    <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-xs border border-gray-100">
      {/* ======================================
          Icon
      ====================================== */}

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F7F3] text-[#8C7A55]">
        <CalendarIcon />
      </div>

      {/* ======================================
          Text
      ====================================== */}

      <h3 className="mt-4 text-base font-bold text-[#252525]">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-gray-500">
        {description}
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
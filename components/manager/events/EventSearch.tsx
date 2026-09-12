interface EventSearchProps {
  value: string;
  onChange: (value: string) => void;
}

// ==========================================
// Event Search
// ==========================================

export default function EventSearch({
  value,
  onChange,
}: EventSearchProps) {
  return (
    <div className="relative">
      {/* Search Icon */}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          />

          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>

      {/* Input */}

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search events, clients or locations..."
        className="min-h-12 w-full rounded-2xl border border-gray-100 bg-white pl-11 pr-4 text-sm text-[#252525] outline-none shadow-sm placeholder:text-gray-400 focus:border-[#C7B58A] focus:ring-2 focus:ring-[#C7B58A]/20"
      />
    </div>
  );
}
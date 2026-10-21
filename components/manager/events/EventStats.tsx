interface EventsStatsProps {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  estimates?: number;
  onSelectEstimates?: () => void;
  activeFilter?: string;
}

// ==========================================
// Events Stats
// ==========================================

export default function EventsStats({
  total,
  upcoming,
  ongoing,
  completed,
  estimates = 0,
  onSelectEstimates,
  activeFilter,
}: EventsStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <StatCard
        label="Total Confirmed"
        value={total}
      />

      <StatCard
        label="New Estimates"
        value={estimates}
        highlight={estimates > 0}
        onClick={onSelectEstimates}
        active={activeFilter === "Estimates"}
      />

      <StatCard
        label="Upcoming"
        value={upcoming}
      />

      <StatCard
        label="Ongoing"
        value={ongoing}
      />

      <StatCard
        label="Completed"
        value={completed}
      />
    </div>
  );
}

// ==========================================
// Stat Card
// ==========================================

interface StatCardProps {
  label: string;
  value: number;
  highlight?: boolean;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({
  label,
  value,
  highlight = false,
  onClick,
  active = false,
}: StatCardProps) {
  const content = (
    <div
      className={`rounded-2xl p-4 shadow-sm transition ${
        active
          ? "bg-[#252525] text-white ring-2 ring-amber-400"
          : highlight
          ? "bg-amber-50/80 border border-amber-200 hover:border-amber-400"
          : "bg-white border border-gray-100"
      } ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-2xl font-black tracking-tight ${
            active
              ? "text-white"
              : highlight
              ? "text-amber-900"
              : "text-[#252525]"
          }`}
        >
          {value}
        </p>
        {highlight && !active && (
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>

      <p
        className={`mt-1 text-xs font-semibold ${
          active ? "text-amber-300" : highlight ? "text-amber-800" : "text-gray-500"
        }`}
      >
        {label}
      </p>
    </div>
  );

  return content;
}
interface EventsStatsProps {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
}

// ==========================================
// Events Stats
// ==========================================

export default function EventsStats({
  total,
  upcoming,
  ongoing,
  completed,
}: EventsStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label="Total"
        value={total}
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
}

function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold tracking-tight text-[#252525]">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-gray-500">
        {label}
      </p>
    </div>
  );
}
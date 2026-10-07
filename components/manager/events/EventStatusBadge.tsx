import type { EventStatus } from "@/lib/event.api";

interface EventStatusBadgeProps {
  status: EventStatus | string;
}

// ==========================================
// Event Status Badge
// ==========================================

export default function EventStatusBadge({
  status,
}: EventStatusBadgeProps) {
  const styles: Record<string, string> = {
    Upcoming: "bg-[#F4EFE4] text-[#8C7A55]",
    CONFIRMED: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    Confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    READY_TO_START: "bg-blue-50 text-blue-700 border border-blue-200/60",
    Ongoing: "bg-amber-50 text-amber-800 border border-amber-200/60",
    IN_PROGRESS: "bg-amber-50 text-amber-800 border border-amber-200/60",
    Completed: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    Cancelled: "bg-rose-50 text-rose-700 border border-rose-200/80",
    CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200/80",
    Planned: "bg-blue-50 text-blue-700",
    Invoiced: "bg-[#f8f0df] text-[#9a6c37]",
    Settled: "bg-purple-50 text-purple-700 border border-purple-200/60",
  };

  const badgeStyle = styles[status] || "bg-[#F4EFE4] text-[#8C7A55]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${badgeStyle}`}
    >
      {status === "IN_PROGRESS" ? "In Progress" : status}
    </span>
  );
}
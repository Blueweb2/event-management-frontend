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
    Ongoing: "bg-[#EEEAE1] text-[#6F6044]",
    IN_PROGRESS: "bg-[#EEEAE1] text-[#6F6044]",
    Completed: "bg-gray-100 text-gray-600",
    Cancelled: "bg-gray-100 text-gray-400",
    Planned: "bg-blue-50 text-blue-700",
    Confirmed: "bg-emerald-50 text-emerald-700",
    Invoiced: "bg-[#f8f0df] text-[#9a6c37]",
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
import type { EventStatus } from "@/lib/event.api";

interface EventStatusBadgeProps {
  status: EventStatus;
}

// ==========================================
// Event Status Badge
// ==========================================

export default function EventStatusBadge({
  status,
}: EventStatusBadgeProps) {
  const styles = {
    Upcoming:
      "bg-[#F4EFE4] text-[#8C7A55]",
    Ongoing:
      "bg-[#EEEAE1] text-[#6F6044]",
    Completed:
      "bg-gray-100 text-gray-600",
    Cancelled:
      "bg-gray-100 text-gray-400",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1.5",
        "text-xs font-semibold",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}
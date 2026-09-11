"use client";

import type { AssignmentStatus } from "@/types/assignment";

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
}

const statusConfig: Record<
  AssignmentStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  ASSIGNED: {
    label: "Assigned",
    className: "bg-[#F4EBDD] text-[#9A7B4F]",
    dotClassName: "bg-[#B89563]",
  },

  ACCEPTED: {
    label: "Accepted",
    className: "bg-blue-50 text-blue-600",
    dotClassName: "bg-blue-500",
  },

  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-purple-50 text-purple-600",
    dotClassName: "bg-purple-500",
  },

  COMPLETED: {
    label: "Completed",
    className: "bg-[#E8F5E9] text-[#2E7D32]",
    dotClassName: "bg-[#4CAF50]",
  },

  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-500",
    dotClassName: "bg-gray-400",
  },
};

export default function AssignmentStatusBadge({
  status,
}: AssignmentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`}
      />

      {config.label}
    </span>
  );
}
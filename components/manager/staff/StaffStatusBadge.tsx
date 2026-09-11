interface StaffStatusBadgeProps {
  status: "Active" | "Inactive";
  size?: "sm" | "md";
}

export default function StaffStatusBadge({
  status,
  size = "sm",
}: StaffStatusBadgeProps) {
  const isActive = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "md"
          ? "px-3 py-1.5 text-xs"
          : "px-2.5 py-1 text-[10px]"
      } ${
        isActive
          ? "bg-[#E8F5E9] text-[#2E7D32]"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`rounded-full ${
          size === "md" ? "h-2 w-2" : "h-1.5 w-1.5"
        } ${
          isActive ? "bg-[#4CAF50]" : "bg-gray-400"
        }`}
      />

      {status}
    </span>
  );
}
interface EventStatusBadgeProps {
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
}

export default function EventStatusBadge({
  status,
}: EventStatusBadgeProps) {
  const styles = {
    Confirmed: "bg-[#edf5ed] text-[#557555]",
    Pending: "bg-[#fff5df] text-[#9a6c37]",
    Completed: "bg-[#eef2f7] text-[#5d7188]",
    Cancelled: "bg-[#f9eeee] text-[#9a625b]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1",
        "text-[11px] font-semibold",
        styles[status],
      ].join(" ")}
    >
      <span
        className={[
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          status === "Confirmed"
            ? "bg-[#6f946f]"
            : status === "Pending"
              ? "bg-[#b8894b]"
              : status === "Completed"
                ? "bg-[#71869d]"
                : "bg-[#a87068]",
        ].join(" ")}
      />

      {status}
    </span>
  );
}
import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "No data found",
  description = "There is nothing to display here yet.",
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex
        min-h-[260px]
        w-full
        flex-col
        items-center
        justify-center
        px-5
        py-10
        text-center
        ${className}
      `}
    >
      {/* Icon */}
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-[#F3EBDD]
          text-[#80683D]
        "
      >
        {icon || <DefaultEmptyIcon />}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-[#1F2023]">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-5 text-[#77746D]">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}

function DefaultEmptyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" />
      <path d="M3 8h18" />
      <path d="M7 12h.01" />
      <path d="M11 12h6" />
      <path d="M7 16h.01" />
      <path d="M11 16h4" />
    </svg>
  );
}
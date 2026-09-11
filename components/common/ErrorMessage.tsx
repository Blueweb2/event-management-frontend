import type { ReactNode } from "react";

interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: ReactNode;
  variant?: "default" | "compact";
  className?: string;
}

export default function ErrorMessage({
  message,
  title = "Something went wrong",
  onRetry,
  retryText = "Try again",
  icon,
  variant = "default",
  className = "",
}: ErrorMessageProps) {
  if (variant === "compact") {
    return (
      <div
        role="alert"
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-[#F1C8C5]
          bg-[#FDF3F2]
          px-4
          py-3
          text-sm
          text-[#8F2118]
          ${className}
        `}
      >
        <div className="flex shrink-0 items-center">
          {icon || <ErrorIcon size={18} />}
        </div>

        <p className="min-w-0 flex-1">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="
              shrink-0
              font-medium
              text-[#8F2118]
              underline
              underline-offset-2
              transition-colors
              hover:text-[#B42318]
              focus:outline-none
              focus:ring-2
              focus:ring-[#B42318]/20
            "
          >
            {retryText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`
        flex
        min-h-[220px]
        w-full
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-[#F1C8C5]
        bg-[#FDF8F7]
        px-5
        py-10
        text-center
        ${className}
      `}
    >
      {/* Icon */}
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-[#FDECEC]
          text-[#B42318]
        "
      >
        {icon || <ErrorIcon size={22} />}
      </div>

      {/* Title */}
      <h3
        className="
          mt-4
          text-base
          font-semibold
          text-[#1F2023]
        "
      >
        {title}
      </h3>

      {/* Message */}
      <p
        className="
          mt-1.5
          max-w-md
          text-sm
          leading-5
          text-[#77746D]
        "
      >
        {message}
      </p>

      {/* Retry */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            mt-5
            inline-flex
            h-10
            items-center
            justify-center
            rounded-xl
            bg-[#1F2023]
            px-4
            text-sm
            font-medium
            text-white
            transition-colors
            hover:bg-[#2A2B2F]
            focus:outline-none
            focus:ring-2
            focus:ring-[#B49A6A]/30
          "
        >
          {retryText}
        </button>
      )}
    </div>
  );
}

function ErrorIcon({
  size = 22,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 8v4" />

      <path d="M12 16h.01" />
    </svg>
  );
}
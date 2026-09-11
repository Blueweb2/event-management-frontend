import type { ReactNode } from "react";

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function LoadingState({
  message = "Loading...",
  fullPage = false,
  className = "",
  children,
}: LoadingStateProps) {
  return (
    <div
      className={`
        flex
        w-full
        flex-col
        items-center
        justify-center
        ${
          fullPage
            ? "min-h-[60vh]"
            : "min-h-[220px]"
        }
        px-5
        py-10
        text-center
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Spinner */}
      <div
        className="
          relative
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          bg-[#F3EBDD]
        "
      >
        <span
          className="
            h-6
            w-6
            animate-spin
            rounded-full
            border-2
            border-[#D8C9AC]
            border-t-[#B49A6A]
          "
          aria-hidden="true"
        />
      </div>

      {/* Message */}
      {message && (
        <p className="mt-4 text-sm font-medium text-[#55565A]">
          {message}
        </p>
      )}

      {/* Optional custom content */}
      {children}
    </div>
  );
}
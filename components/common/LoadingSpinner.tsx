interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

// ==========================================
// Loading Spinner
// ==========================================

export default function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        "animate-spin rounded-full",
        "border-gray-200 border-t-[#8C7A55]",
        sizeClasses[size],
        className,
      ].join(" ")}
    />
  );
}
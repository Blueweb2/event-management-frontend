interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loading({
  size = "md",
  className = "",
}: LoadingProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  return (
    <span
      className={[
        "inline-block animate-spin rounded-full",
        "border-[var(--sage-light)]",
        "border-t-[var(--sage-dark)]",
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-label="Loading"
    />
  );
}
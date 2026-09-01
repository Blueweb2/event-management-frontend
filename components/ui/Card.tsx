import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  children,
  title,
  description,
  action,
  className = "",
  padding = "md",
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={[
        "rounded-2xl",
        "border border-[var(--border)]",
        "bg-[var(--cream)]",
        "shadow-sm",
        "transition-shadow duration-200",
        "hover:shadow-md",
        paddings[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Card Header */}
      {(title || description || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          {/* Title & Description */}
          {(title || description) && (
            <div className="min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-[var(--sage-dark)]">
                  {title}
                </h3>
              )}

              {description && (
                <p className="mt-1 text-sm leading-6 text-[var(--taupe)]">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Header Action */}
          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      {children}
    </div>
  );
}
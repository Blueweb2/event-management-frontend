import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "sm" | "md";
  dot?: boolean;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
}: BadgeProps) {
  const variants = {
    default: {
      container:
        "bg-[#eeebe3] text-[var(--sage-dark)]",
      dot: "bg-[var(--taupe)]",
    },

    success: {
      container:
        "bg-[var(--sage-light)] text-[var(--sage-dark)]",
      dot: "bg-[var(--sage)]",
    },

    warning: {
      container:
        "bg-[#f3ead5] text-[#806c3f]",
      dot: "bg-[var(--gold)]",
    },

    danger: {
      container:
        "bg-[#f2dfdb] text-[var(--rose)]",
      dot: "bg-[var(--rose)]",
    },

    info: {
      container:
        "bg-[#e8ebe1] text-[var(--sage-dark)]",
      dot: "bg-[var(--sage)]",
    },
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const current = variants[variant];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full font-medium",
        "whitespace-nowrap",
        current.container,
        sizes[size],
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={[
            "h-1.5 w-1.5 shrink-0 rounded-full",
            current.dot,
          ].join(" ")}
        />
      )}

      <span>{children}</span>
    </span>
  );
}
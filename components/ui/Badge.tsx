import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold"
  | "purple"
  | "dark";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  icon,
  className = "",
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default:
      "bg-[#F1F0EC] text-[#5F5D57]",

    success:
      "bg-[#EAF7EE] text-[#19713A]",

    warning:
      "bg-[#FFF4D9] text-[#946A12]",

    danger:
      "bg-[#FDECEC] text-[#B42318]",

    info:
      "bg-[#EAF3FB] text-[#24658F]",

    gold:
      "bg-[#F3EBDD] text-[#80683D]",

    purple:
      "bg-[#F0EBFA] text-[#6846A5]",

    dark:
      "bg-[#1F2023] text-white",
  };

  const dots: Record<BadgeVariant, string> = {
    default: "bg-[#85827B]",
    success: "bg-[#2E9B57]",
    warning: "bg-[#C69222]",
    danger: "bg-[#D92D20]",
    info: "bg-[#3688BA]",
    gold: "bg-[#B49A6A]",
    purple: "bg-[#7956B5]",
    dark: "bg-white",
  };

  const sizes: Record<BadgeSize, string> = {
    sm: "min-h-6 px-2.5 text-xs gap-1.5",
    md: "min-h-7 px-3 text-xs gap-1.5",
    lg: "min-h-8 px-3.5 text-sm gap-2",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        whitespace-nowrap
        rounded-full
        font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            h-1.5
            w-1.5
            shrink-0
            rounded-full
            ${dots[variant]}
          `}
          aria-hidden="true"
        />
      )}

      {icon && (
        <span
          className="flex shrink-0 items-center"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      <span>{children}</span>
    </span>
  );
}
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "gold";

type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#B49A6A]/30 disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#1F2023] text-white hover:bg-[#2A2B2F] active:bg-[#17181A]",

    secondary:
      "bg-white text-[#1F2023] border border-[#E5E1D8] hover:bg-[#F8F7F3] active:bg-[#F0EEE8]",

    outline:
      "bg-transparent text-[#1F2023] border border-[#D8D3C8] hover:bg-[#F8F7F3] active:bg-[#EFEBE3]",

    ghost:
      "bg-transparent text-[#55565A] hover:bg-[#F3F1EC] hover:text-[#1F2023] active:bg-[#EBE8E1]",

    danger:
      "bg-[#B42318] text-white hover:bg-[#981B12] active:bg-[#7F160F]",

    gold:
      "bg-[#B49A6A] text-white hover:bg-[#A58C5F] active:bg-[#927A50]",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm rounded-lg",
    md: "h-11 px-4 text-sm rounded-xl",
    lg: "h-12 px-6 text-base rounded-xl",
    icon: "h-10 w-10 rounded-xl p-0",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type="button"
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />

          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
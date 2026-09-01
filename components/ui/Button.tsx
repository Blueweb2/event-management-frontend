import type { ButtonHTMLAttributes, ReactNode } from "react";
import Loading from "./Loading";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    icon,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary:
            "bg-[var(--sage-dark)] text-white hover:bg-[var(--sage)] focus:ring-[var(--sage)]",

        secondary:
            "bg-[var(--sage-light)] text-[var(--sage-dark)] hover:bg-[#dde2d5] focus:ring-[var(--sage)]",

        outline:
            "border border-[var(--sage)] bg-transparent text-[var(--sage-dark)] hover:bg-[var(--sage-light)] focus:ring-[var(--sage)]",

        danger:
            "bg-[var(--rose)] text-white hover:bg-[#a87e76] focus:ring-[var(--rose)]",

        ghost:
            "bg-transparent text-[var(--sage-dark)] hover:bg-[var(--sage-light)] focus:ring-[var(--sage)]",
    };

    const sizes = {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-10 px-4 text-sm",
        lg: "min-h-12 px-6 text-base",
    };

    return (
        <button
            disabled={disabled || loading}
            className={[
                "inline-flex items-center justify-center gap-2",
                "rounded-full",
                "font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-50",
                variants[variant],
                sizes[size],
                fullWidth ? "w-full" : "",
                className,
            ].join(" ")}
            {...props}
        >
            {loading ? <Loading size="sm" /> : icon}
            {children}
        </button>
    );
}
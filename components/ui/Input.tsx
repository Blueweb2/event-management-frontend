import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-[var(--sage-dark)]"
        >
          {label}

          {props.required && (
            <span
              className="ml-1 text-[var(--rose)]"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div
            className={[
              "pointer-events-none absolute inset-y-0 left-0",
              "flex items-center pl-3.5",
              "text-[var(--taupe)]",
            ].join(" ")}
          >
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          className={[
            "w-full rounded-xl border",
            "bg-[var(--cream)]",
            "px-3.5 py-3",
            "text-sm text-[var(--foreground)]",
            "placeholder:text-[var(--taupe)]",
            "outline-none",
            "transition-all duration-200",

            // Normal border
            error
              ? [
                  "border-[var(--rose)]",
                  "focus:border-[var(--rose)]",
                  "focus:ring-2",
                  "focus:ring-[#ead5d0]",
                ].join(" ")
              : [
                  "border-[var(--border)]",
                  "focus:border-[var(--sage)]",
                  "focus:ring-2",
                  "focus:ring-[var(--sage-light)]",
                ].join(" "),

            // Icons
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",

            // Disabled
            "disabled:cursor-not-allowed",
            "disabled:bg-[#f1eee6]",
            "disabled:text-[var(--taupe)]",
            "disabled:opacity-70",

            // Read only
            "read-only:bg-[#f5f2ea]",

            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div
            className={[
              "pointer-events-none absolute inset-y-0 right-0",
              "flex items-center pr-3.5",
              "text-[var(--taupe)]",
            ].join(" ")}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error ? (
        <p
          className="mt-1.5 text-xs text-[var(--rose)]"
          role="alert"
        >
          {error}
        </p>
      ) : helperText ? (
        /* Helper Text */
        <p className="mt-1.5 text-xs leading-5 text-[var(--taupe)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
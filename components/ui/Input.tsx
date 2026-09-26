import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  rightIcon?: ReactNode;
  variant?: "light" | "dark";
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightElement,
  rightIcon,
  variant = "light",
  containerClassName = "",
  className = "",
  id,
  ...props
}: InputProps) {
  const rightContent = rightElement || rightIcon;
  const inputId =
    id ||
    (label
      ? label
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : undefined);

  const isDark = variant === "dark";

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`mb-1.5 block text-sm font-semibold ${
            isDark ? "text-gray-200" : "text-[#29241f]"
          }`}
        >
          {label}

          {required && (
            <span
              className={`ml-1 ${
                isDark ? "text-[#D2B47A]" : "text-[#b49a6a]"
              }`}
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div
            className={`pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center ${
              isDark ? "text-[#D2B47A]" : "text-[#8d847b]"
            }`}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            h-11
            w-full
            rounded-xl
            border
            px-3.5
            text-sm
            outline-none
            transition-all
            duration-200

            ${
              isDark
                ? `
                  border-[#333333]
                  bg-[#111111]
                  text-gray-100
                  placeholder:text-gray-600
                  disabled:bg-[#1A1A1A]
                  disabled:text-gray-600
                  ${
                    error
                      ? "border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                      : "focus:border-[#D2B47A] focus:ring-2 focus:ring-[#D2B47A]/15"
                  }
                `
                : `
                  border-[#d8cfc4]
                  bg-white
                  text-[#29241f]
                  placeholder:text-gray-400
                  shadow-2xs
                  disabled:bg-[#fbf9f6]
                  disabled:text-gray-400
                  ${
                    error
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                      : "focus:border-[#b49a6a] focus:ring-2 focus:ring-[#b49a6a]/20"
                  }
                `
            }

            disabled:cursor-not-allowed

            ${leftIcon ? "pl-10" : ""}
            ${rightElement ? "pr-11" : ""}
            ${className}
          `}
          {...props}
        />

        {rightContent && (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
            {rightContent}
          </div>
        )}
      </div>

      {error ? (
        <p
          className={`mt-1.5 text-xs ${
            isDark ? "text-red-400" : "text-rose-600"
          }`}
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          className={`mt-1.5 text-xs ${
            isDark ? "text-gray-500" : "text-[#756d64]"
          }`}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
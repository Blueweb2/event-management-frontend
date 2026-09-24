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
}

export default function Input({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightElement,
  rightIcon,
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

  return (
    <div className="w-full px-3">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-gray-200"
        >
          {label}

          {required && (
            <span className="ml-1 text-[#D2B47A]">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
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
            border-[#333333]
            bg-[#111111]
            px-3.5
            text-sm
            text-gray-100
            outline-none
            transition-all
            duration-200

            placeholder:text-gray-600

            ${
              error
                ? "border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "focus:border-[#D2B47A] focus:ring-2 focus:ring-[#D2B47A]/15"
            }

            disabled:cursor-not-allowed
            disabled:bg-[#1A1A1A]
            disabled:text-gray-600

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
        <p className="mt-1.5 px-3 text-xs text-red-400">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 px-3 text-xs text-gray-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
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
}

export default function Input({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightElement,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId =
    id ||
    (label
      ? label
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-[#292A2D]"
        >
          {label}

          {required && (
            <span className="ml-1 text-[#B42318]">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#77746D]">
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
            bg-white
            px-3.5
            text-sm
            text-[#1F2023]
            outline-none
            transition-all
            duration-200

            placeholder:text-[#A3A09A]

            ${
              error
                ? "border-[#D92D20] focus:border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/10"
                : "border-[#DEDAD1] focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/15"
            }

            disabled:cursor-not-allowed
            disabled:bg-[#F3F1EC]
            disabled:text-[#99968F]

            ${leftIcon ? "pl-10" : ""}

            ${rightElement ? "pr-11" : ""}

            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-[#B42318]">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#77746D]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
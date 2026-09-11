import type {
  ReactNode,
  SelectHTMLAttributes,
} from "react";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  leftIcon?: ReactNode;
}

export default function Select({
  label,
  error,
  helperText,
  required = false,
  placeholder,
  options,
  leftIcon,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId =
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
          htmlFor={selectId}
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
          <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-[#77746D]">
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          className={`
            h-11
            w-full
            appearance-none
            rounded-xl
            border
            bg-white
            px-3.5
            pr-10
            text-sm
            text-[#1F2023]
            outline-none
            transition-all
            duration-200

            ${
              error
                ? "border-[#D92D20] focus:border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/10"
                : "border-[#DEDAD1] focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/15"
            }

            disabled:cursor-not-allowed
            disabled:bg-[#F3F1EC]
            disabled:text-[#99968F]

            ${leftIcon ? "pl-10" : ""}

            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#77746D]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
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
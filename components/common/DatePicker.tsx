import type {
  InputHTMLAttributes,
} from "react";

interface DatePickerProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export default function DatePicker({
  label,
  error,
  helperText,
  required = false,
  className = "",
  id,
  ...props
}: DatePickerProps) {
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
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="
            mb-2
            block
            text-sm
            font-medium
            text-[#292A2D]
          "
        >
          {label}

          {required && (
            <span className="ml-1 text-[#B42318]">
              *
            </span>
          )}
        </label>
      )}

      {/* Date input */}
      <div className="relative">
        <input
          id={inputId}
          type="date"
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

            ${
              error
                ? `
                  border-[#D92D20]
                  focus:border-[#D92D20]
                  focus:ring-2
                  focus:ring-[#D92D20]/10
                `
                : `
                  border-[#DEDAD1]
                  focus:border-[#B49A6A]
                  focus:ring-2
                  focus:ring-[#B49A6A]/15
                `
            }

            hover:border-[#D1CCC2]

            disabled:cursor-not-allowed
            disabled:bg-[#F3F1EC]
            disabled:text-[#99968F]

            ${className}
          `}
          {...props}
        />
      </div>

      {/* Error / helper */}
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
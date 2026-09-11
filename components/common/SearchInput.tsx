"use client";

import type {
  InputHTMLAttributes,
} from "react";

interface SearchInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    onChange("");
  };

  return (
    <div
      className={`
        relative
        w-full
        ${className}
      `}
    >
      {/* Search icon */}
      <div
        className="
          pointer-events-none
          absolute
          left-3.5
          top-1/2
          z-10
          flex
          -translate-y-1/2
          items-center
          justify-center
          text-[#77746D]
        "
      >
        <SearchIcon />
      </div>

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-[#DEDAD1]
          bg-white
          pl-10
          pr-10
          text-sm
          text-[#1F2023]
          outline-none
          transition-all
          duration-200

          placeholder:text-[#A3A09A]

          hover:border-[#D1CCC2]

          focus:border-[#B49A6A]
          focus:ring-2
          focus:ring-[#B49A6A]/15

          disabled:cursor-not-allowed
          disabled:bg-[#F3F1EC]
          disabled:text-[#99968F]

          [&::-webkit-search-cancel-button]:hidden
        "
        {...props}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          disabled={props.disabled}
          aria-label="Clear search"
          className="
            absolute
            right-2.5
            top-1/2
            flex
            h-7
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-lg
            text-[#77746D]
            transition-colors
            hover:bg-[#F3F1EC]
            hover:text-[#1F2023]
            focus:outline-none
            focus:ring-2
            focus:ring-[#B49A6A]/30
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
} from "react";
import {
  Sparkles,
  ChevronDown,
  Check,
  X,
  Heart,
  Briefcase,
  PartyPopper,
  Users,
  Music,
  Rocket,
  Utensils,
} from "lucide-react";
import { eventTypeOptions } from "../constants";

interface EventTypeSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

const EVENT_TYPE_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  "Corporate Gala": Briefcase,
  "Wedding": Heart,
  "Birthday Celebration": PartyPopper,
  "Conference": Users,
  "Concert / Festival": Music,
  "Product Launch": Rocket,
  "Private Dinner": Utensils,
  "Other": Sparkles,
};

// Common quick-pick chips displayed beneath the dropdown for instant single-tap selection
const POPULAR_QUICK_CHIPS = [
  "Wedding",
  "Corporate Gala",
  "Birthday Celebration",
  "Conference",
  "Private Dinner",
];

export function getCanonicalEventType(val?: string): string {
  if (!val) return "";
  const match = eventTypeOptions.find(
    (opt) =>
      opt.toLowerCase().replace(/\s+/g, "-") ===
        val.toLowerCase().replace(/\s+/g, "-") ||
      opt.toLowerCase() === val.toLowerCase(),
  );
  return match || val;
}

export default function EventTypeSelect({
  id,
  name,
  value = "",
  onChange,
  required = false,
  error,
  helperText,
  className = "",
}: EventTypeSelectProps) {
  const autoId = useId();
  const selectId = id || autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const canonicalValue = getCanonicalEventType(value);
  const SelectedIcon =
    EVENT_TYPE_ICONS[canonicalValue] || Sparkles;

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (eventType: string) => {
    onChange(eventType);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      {/* Header Label and Badge */}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          htmlFor={selectId}
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#29241f]"
        >
          Event Type
          {required && <span className="text-[#b8894b]">*</span>}
        </label>

        {canonicalValue && (
          <span className="flex items-center gap-1 rounded-full bg-[#B8894B]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#9A6C37] animate-in fade-in">
            <SelectedIcon size={11} />
            {canonicalValue}
          </span>
        )}
      </div>

      {/* Main Trigger Box */}
      <div
        id={selectId}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Event Type"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`
          group relative flex h-11 w-full min-w-0 items-center justify-between rounded-xl border bg-white px-3.5 text-sm transition-all duration-200 cursor-pointer select-none
          ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
              : isOpen
                ? "border-[#b8894b] ring-2 ring-[#b8894b]/20 shadow-xs"
                : "border-[#d8cfc4] hover:border-[#b49a6a] shadow-2xs"
          }
          ${className}
        `}
      >
        {/* Left Icon + Text */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center justify-center text-[#8d847b] transition-colors group-hover:text-[#b8894b]">
            <SelectedIcon size={18} />
          </div>

          <div className="min-w-0 flex-1 truncate">
            {canonicalValue ? (
              <span className="block truncate font-semibold text-[#29241f]">
                {canonicalValue}
              </span>
            ) : (
              <span className="block truncate font-medium text-gray-400">
                Select event type
              </span>
            )}
          </div>
        </div>

        {/* Right Action Icons (Clear / Dropdown) */}
        <div className="flex shrink-0 items-center gap-1.5 pl-2">
          {canonicalValue && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-95 cursor-pointer"
              title="Clear event type"
              aria-label="Clear event type"
            >
              <X size={14} />
            </button>
          )}

          <div
            className={`flex items-center text-[#8d847b] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#b8894b]" : ""
            }`}
          >
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Hidden input for form submission and selector compatibility */}
      <input
        type="hidden"
        name={name || selectId}
        value={canonicalValue}
        required={required}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Event Type Options"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[280px] rounded-2xl border border-[#e8e1d8] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-1">
            {eventTypeOptions.map((option) => {
              const isSelected = option === canonicalValue;
              const OptionIcon = EVENT_TYPE_ICONS[option] || Sparkles;

              return (
                <div
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer select-none
                    ${
                      isSelected
                        ? "bg-[#B8894B]/15 text-[#9A6C37] font-bold"
                        : "text-[#29241f] hover:bg-[#fcfaf7] hover:text-[#9A6C37]"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                        isSelected
                          ? "bg-[#b8894b] text-white shadow-2xs"
                          : "bg-[#f5efe6] text-[#756d64]"
                      }`}
                    >
                      <OptionIcon size={14} />
                    </span>
                    <span className="truncate">{option}</span>
                  </div>

                  {isSelected && (
                    <Check size={16} className="text-[#b8894b] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick-Pick Chips Row for 1-Tap Selection on Mobile & Desktop */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-[#8d847b] mr-1 select-none">
          Popular:
        </span>
        {POPULAR_QUICK_CHIPS.map((chip) => {
          const isSelected = chip === canonicalValue;
          const ChipIcon = EVENT_TYPE_ICONS[chip] || Sparkles;

          return (
            <button
              key={chip}
              type="button"
              onClick={() => handleSelect(chip)}
              className={`
                inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer select-none active:scale-95
                ${
                  isSelected
                    ? "bg-[#b8894b] text-white shadow-2xs border border-[#b8894b]"
                    : "bg-[#fcfaf7] text-[#756d64] border border-[#e8e1d8] hover:border-[#b8894b] hover:text-[#29241f]"
                }
              `}
            >
              <ChipIcon size={11} className={isSelected ? "text-white" : "text-[#9A6C37]"} />
              <span>{chip}</span>
            </button>
          );
        })}
      </div>

      {/* Error or Helper text */}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#756d64]">{helperText}</p>
      ) : null}
    </div>
  );
}

"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
} from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string; // Format: "YYYY-MM-DD"
  onChange?: (value: string) => void;
  required?: boolean;
  minDate?: string; // Format: "YYYY-MM-DD"
  maxDate?: string; // Format: "YYYY-MM-DD"
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseYmd(ymd?: string): { year: number; month: number; day: number } | null {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { year: y, month: m - 1, day: d };
}

function formatYmd(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, "0");
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(ymd?: string): string {
  const parsed = parseYmd(ymd);
  if (!parsed) return "";
  const date = new Date(parsed.year, parsed.month, parsed.day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortBadge(ymd?: string): string {
  const parsed = parseYmd(ymd);
  if (!parsed) return "";
  const date = new Date(parsed.year, parsed.month, parsed.day);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTodayYmd(): string {
  const now = new Date();
  return formatYmd(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function DatePicker({
  id,
  name,
  label,
  value = "",
  onChange,
  required = false,
  minDate,
  maxDate,
  error,
  helperText,
  placeholder = "Select event date",
  className = "",
  containerClassName = "",
  disabled = false,
}: DatePickerProps) {
  const autoId = useId();
  const inputId = id || autoId;
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  // Initialize viewing calendar month and year based on value or today
  const initialParsed = parseYmd(value);
  const todayParsed = parseYmd(getTodayYmd())!;

  const [viewYear, setViewYear] = useState<number>(
    initialParsed ? initialParsed.year : todayParsed.year,
  );
  const [viewMonth, setViewMonth] = useState<number>(
    initialParsed ? initialParsed.month : todayParsed.month,
  );

  // Synchronize calendar view if value changes externally (e.g., AI auto-fill or draft restore)
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const parsed = parseYmd(value);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }

  // Click outside to close handler
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

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    if (disabled) return;
    const selectedStr = formatYmd(viewYear, viewMonth, day);

    if (minDate && selectedStr < minDate) return;
    if (maxDate && selectedStr > maxDate) return;

    onChange?.(selectedStr);
    setIsOpen(false);
  };

  const handleQuickToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const today = getTodayYmd();
    if (minDate && today < minDate) return;
    if (maxDate && today > maxDate) return;

    const parsed = parseYmd(today)!;
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
    onChange?.(today);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.("");
  };

  // Build calendar matrix for current viewMonth & viewYear
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const todayYmd = getTodayYmd();
  const selectedParsed = parseYmd(value);

  const displayString = formatDisplayDate(value);
  const badgeString = formatShortBadge(value);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-w-0 ${containerClassName}`}
    >
      {/* Label and Badge Row */}
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#29241f]"
          >
            {label}
            {required && <span className="text-[#b8894b]">*</span>}
          </label>
          {badgeString && (
            <span className="flex items-center gap-1 rounded-full bg-[#B8894B]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#9A6C37] animate-in fade-in">
              <CalendarDays size={11} />
              {badgeString}
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Input Field */}
      <div
        id={inputId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label || "Event Date"}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`
          group relative flex h-11 w-full min-w-0 items-center justify-between rounded-xl border bg-white px-3.5 text-sm transition-all duration-200 cursor-pointer select-none
          ${
            disabled
              ? "cursor-not-allowed border-[#e8e1d8] bg-[#fbf9f6] opacity-60"
              : error
                ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                : isOpen
                  ? "border-[#b8894b] ring-2 ring-[#b8894b]/20 shadow-xs"
                  : "border-[#d8cfc4] hover:border-[#b49a6a] shadow-2xs"
          }
          ${className}
        `}
      >
        {/* Left Icon and Display Text */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex shrink-0 items-center justify-center text-[#8d847b] transition-colors group-hover:text-[#b8894b]">
            <CalendarDays size={18} />
          </div>

          <div className="min-w-0 flex-1 truncate">
            {displayString ? (
              <span className="block truncate font-semibold text-[#29241f]">
                {displayString}
              </span>
            ) : (
              <span className="block truncate font-medium text-gray-400">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        {/* Right Action Icons (Clear / Dropdown) */}
        <div className="flex shrink-0 items-center gap-1.5 pl-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 active:scale-95 cursor-pointer"
              title="Clear date"
              aria-label="Clear date"
            >
              <X size={14} />
            </button>
          )}

          <div
            className={`flex items-center text-[#8d847b] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#b8894b]" : ""
            }`}
          >
            <ChevronRight size={15} className="rotate-90" />
          </div>
        </div>
      </div>

      {/* Hidden native input for form compatibility, validation, and accessibility */}
      <input
        type="hidden"
        name={name || inputId}
        value={value}
        required={required}
      />

      {/* Calendar Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[280px] max-w-[340px] rounded-2xl border border-[#e8e1d8] bg-white p-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Calendar Header: Month/Year and Navigation Buttons */}
          <div className="mb-3 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#eee7dc] bg-[#fcfaf7] text-[#756d64] transition hover:bg-white hover:text-[#29241f] hover:border-[#b8894b] active:scale-95 cursor-pointer shadow-2xs"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs sm:text-sm font-bold text-[#29241f]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#eee7dc] bg-[#fcfaf7] text-[#756d64] transition hover:bg-white hover:text-[#29241f] hover:border-[#b8894b] active:scale-95 cursor-pointer shadow-2xs"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAY_NAMES.map((weekday) => (
              <span
                key={weekday}
                className="text-[11px] font-bold text-[#8d847b] py-0.5 select-none"
              >
                {weekday}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank filler cells for days before the first day of the month */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-8 w-full select-none"
                aria-hidden="true"
              />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const cellYmd = formatYmd(viewYear, viewMonth, day);

              const isSelected =
                Boolean(selectedParsed) &&
                selectedParsed?.year === viewYear &&
                selectedParsed?.month === viewMonth &&
                selectedParsed?.day === day;

              const isToday = cellYmd === todayYmd;
              const isPast = minDate ? cellYmd < minDate : false;
              const isFutureBlocked = maxDate ? cellYmd > maxDate : false;
              const isBlocked = isPast || isFutureBlocked;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isBlocked || disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`
                    flex h-8 w-full min-w-0 items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer select-none
                    ${
                      isSelected
                        ? "bg-[#b8894b] text-white shadow-xs font-bold scale-102"
                        : isBlocked
                          ? "opacity-25 cursor-not-allowed text-gray-400"
                          : isToday
                            ? "border border-[#b8894b] text-[#9A6C37] bg-[#B8894B]/10 hover:bg-[#B8894B]/20 font-bold"
                            : "text-[#29241f] hover:bg-[#f7f3eb] hover:text-[#9A6C37]"
                    }
                  `}
                  aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="mt-3.5 flex items-center justify-between border-t border-[#eee7dc] pt-2.5">
            <button
              type="button"
              onClick={handleQuickToday}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#9A6C37] hover:bg-[#B8894B]/10 transition active:scale-95 cursor-pointer"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#756d64] hover:bg-gray-100 transition active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Error / Helper Text */}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#756d64]">{helperText}</p>
      ) : null}
    </div>
  );
}
/**
 * Shared Time Utilities
 * Provides reliable conversion between 12-hour AM/PM display values and 24-hour "HH:mm" storage values.
 *
 * Examples:
 * - 12:00 AM <-> 00:00
 * - 12:00 PM <-> 12:00
 * - 6:30 PM  <-> 18:30
 * - 9:15 AM  <-> 09:15
 * - 6:00 PM  <-> 18:00
 * - 9:00 AM  <-> 09:00
 */

/**
 * Formats a 24-hour time string ("HH:mm"), ISO timestamp, or Date object
 * into a user-friendly 12-hour AM/PM format (e.g. "9:00 AM", "12:00 PM", "6:30 PM", "12:00 AM").
 */
export function formatTime24to12(timeVal?: string | Date | null): string {
  if (!timeVal) return "";

  // If Date object
  if (timeVal instanceof Date) {
    if (isNaN(timeVal.getTime())) return "";
    let hour = timeVal.getHours();
    const minute = String(timeVal.getMinutes()).padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }

  const trimmed = String(timeVal).trim();
  if (!trimmed) return "";

  // If date-only string e.g. "2026-10-12", return empty
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "";
  }

  // If ISO timestamp with T or full datetime string
  if (trimmed.includes("T") || /^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      let hour = d.getHours();
      const minute = String(d.getMinutes()).padStart(2, "0");
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${minute} ${ampm}`;
    }
  }

  // If already in 12-hour format e.g. "09:00 AM", "6:00 PM", "6:30pm", "6 PM"
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    const h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? ampmMatch[2] : "00";
    const period = ampmMatch[3].toUpperCase();
    if (h >= 1 && h <= 12) {
      return `${h}:${m} ${period}`;
    }
  }

  // Parse 24-hour format "HH:mm" or "HH:mm:ss"
  const match24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (match24) {
    let hour = parseInt(match24[1], 10);
    const minute = match24[2];
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }

  return "";
}

/**
 * Formats a start and end time into a clean 12-hour range string:
 * e.g. formatTimeRange12("10:00", "17:00") -> "10:00 AM – 5:00 PM"
 */
export function formatTimeRange12(
  startTime?: string | null,
  endTime?: string | null
): string {
  const start = formatTime24to12(startTime);
  const end = formatTime24to12(endTime);
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  return "";
}

/**
 * Formats a full date/time timestamp into a clean 12-hour string:
 * e.g. "12 Oct 2026, 6:30 PM"
 */
export function formatDateTime12(dateVal?: string | Date | null): string {
  if (!dateVal) return "";
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return "";

  const dateStr = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = formatTime24to12(d);
  return `${dateStr}, ${timeStr}`;
}

/**
 * Converts a 12-hour display value (e.g. "6:30 PM", "12:00 AM", "9:15 AM")
 * to standard 24-hour storage format ("HH:mm").
 *
 * Examples:
 * - "12:00 AM" -> "00:00"
 * - "12:00 PM" -> "12:00"
 * - "6:30 PM"  -> "18:30"
 * - "9:15 AM"  -> "09:15"
 * - "18:30"    -> "18:30"
 */
export function formatTime12to24(timeStr?: string | null): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (!trimmed) return "";

  // 12-hour with AM/PM
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const mins = ampmMatch[2] ? ampmMatch[2] : "00";
    const period = ampmMatch[3].toLowerCase();

    if (hours < 1 || hours > 12) return "";
    const minsNum = parseInt(mins, 10);
    if (minsNum < 0 || minsNum > 59) return "";

    if (period === "pm" && hours < 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${mins}`;
  }

  // Already 24-hour format
  const match24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match24) {
    return `${match24[1].padStart(2, "0")}:${match24[2]}`;
  }

  return "";
}

/**
 * Splits a 24h or 12h time string into components for 12-hour form controls.
 */
export function parse12HourComponents(timeStr?: string | null): {
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
} {
  if (!timeStr) {
    return { hour: "", minute: "00", ampm: "AM" };
  }

  const trimmed = timeStr.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    const h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] || "00";
    const period = ampmMatch[3].toUpperCase() as "AM" | "PM";
    return {
      hour: String(h),
      minute: m,
      ampm: period,
    };
  }

  const match24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match24) {
    let h = parseInt(match24[1], 10);
    const m = match24[2];
    const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return {
      hour: String(h),
      minute: m,
      ampm,
    };
  }

  return { hour: "", minute: "00", ampm: "AM" };
}

/**
 * Combines 12-hour components (hour: 1-12, minute: 0-59, ampm: "AM" | "PM")
 * into standard 24-hour "HH:mm" storage format.
 */
export function build24HourFrom12(
  hour: string | number,
  minute: string | number,
  ampm: "AM" | "PM"
): string {
  const hNum = typeof hour === "string" ? parseInt(hour, 10) : hour;
  const mNum = typeof minute === "string" ? parseInt(minute, 10) : minute;

  if (isNaN(hNum) || hNum < 1 || hNum > 12) return "";
  const validMinute = isNaN(mNum) ? 0 : Math.min(Math.max(mNum, 0), 59);

  let hours24 = hNum;
  if (ampm === "PM" && hours24 < 12) hours24 += 12;
  if (ampm === "AM" && hours24 === 12) hours24 = 0;

  return `${String(hours24).padStart(2, "0")}:${String(validMinute).padStart(2, "0")}`;
}

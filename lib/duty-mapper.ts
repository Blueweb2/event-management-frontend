import type { Assignment } from "@/types/assignment";
import type { Duty } from "@/components/manager/duties/constants";

/**
 * Converts a 24-hour time string ("09:00", "14:30", "21:15") to 12-hour AM/PM format ("09:00 AM", "02:30 PM").
 */
export function formatTime24to12(timeStr?: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();

  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }

  const parts = trimmed.split(":");
  if (parts.length < 2) return trimmed;

  let hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return trimmed;

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;

  const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
  const formattedMinute = minute < 10 ? `0${minute}` : `${minute}`;

  return `${formattedHour}:${formattedMinute} ${ampm}`;
}

/**
 * Accurately calculates shift duration in hours from 24h or 12h time strings.
 */
export function calculateHoursFromTime(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;

  const parseToMinutes = (timeStr: string) => {
    const trimmed = timeStr.trim();
    if (!trimmed) return NaN;

    const isPM = /pm/i.test(trimmed);
    const isAM = /am/i.test(trimmed);
    const cleanStr = trimmed.replace(/am|pm/i, "").trim();
    const parts = cleanStr.split(":");

    if (parts.length < 2) return NaN;

    let hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);

    if (Number.isNaN(hour) || Number.isNaN(minute)) return NaN;

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  const startMin = parseToMinutes(startTime);
  const endMin = parseToMinutes(endTime);

  if (Number.isNaN(startMin) || Number.isNaN(endMin)) return 0;

  let diff = endMin - startMin;
  if (diff < 0) diff += 24 * 60; // Overnight shift

  return Math.round((diff / 60) * 100) / 100;
}

const getEvent = (assignment: Assignment) =>
  typeof assignment.event === "string"
    ? { _id: assignment.event }
    : assignment.event;

const getStaff = (assignment: Assignment) => {
  if (typeof assignment.staff === "string") {
    return {
      id: assignment.staff,
      _id: assignment.staff,
      name: "Staff Member",
      department: assignment.department || "General Staff",
    };
  }

  const staffObj = assignment.staff as any;
  return {
    ...staffObj,
    id: staffObj.id || staffObj._id,
    _id: staffObj._id || staffObj.id,
    name: staffObj.name || "Staff Member",
    department: staffObj.department || assignment.department || "General Staff",
  };
};

const formatDate = (date: string) => {
  if (!date) return "";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toISOString().slice(0, 10);
};

export const mapAssignmentToDuty = (
  assignment: Assignment,
): Duty => {
  const event = getEvent(assignment);
  const staff = getStaff(assignment);

  const computedHours =
    assignment.totalHours ||
    calculateHoursFromTime(assignment.startTime, assignment.endTime);
  const rate = assignment.hourlyRate || 0;
  const computedAmount = assignment.totalAmount || (computedHours * rate);

  return {
    id: assignment._id,
    eventId: event._id,
    title: assignment.dutyTitle,
    event: "eventName" in event ? event.eventName : "Event unavailable",
    eventDate: formatDate(assignment.dutyDate),
    startTime: formatTime24to12(assignment.startTime),
    endTime: formatTime24to12(assignment.endTime),
    location: "location" in event ? event.location : "",
    staffId: staff.id,
    staffName: staff.name,
    description: assignment.description ?? "",
    status: assignment.status,
    rejectionReason: assignment.rejectionReason,
    department: staff.department || assignment.department,
    serviceName: assignment.serviceName,
    respondedAt: assignment.respondedAt,
    hourlyRate: rate,
    totalHours: computedHours,
    totalAmount: computedAmount,
    paymentStatus: assignment.paymentStatus || "PENDING",
    paidAt: assignment.paidAt,
    paymentReference: assignment.paymentReference,
    checklist: assignment.checklist || [],
  };
};

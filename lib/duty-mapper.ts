import type { Assignment } from "@/types/assignment";

import type { Duty } from "@/components/manager/duties/constants";

/**
 * Converts a 24-hour time string ("09:00", "14:30", "21:15") to 12-hour AM/PM format ("09:00 AM", "02:30 PM").
 */
export function formatTime24to12(timeStr?: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();

  // If already contains AM or PM (case-insensitive)
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

const getEvent = (assignment: Assignment) =>
  typeof assignment.event === "string"
    ? { _id: assignment.event }
    : assignment.event;

const getStaff = (assignment: Assignment) =>
  typeof assignment.staff === "string"
    ? { id: assignment.staff }
    : {
        ...assignment.staff,
        id: assignment.staff.id || (assignment.staff as any)._id,
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
    staffName: "name" in staff ? staff.name : "Staff unavailable",
    description: assignment.description ?? "",
    status: assignment.status,
    rejectionReason: assignment.rejectionReason,
    department: assignment.department,
    serviceName: assignment.serviceName,
    respondedAt: assignment.respondedAt,
    hourlyRate: assignment.hourlyRate,
    totalHours: assignment.totalHours,
    totalAmount: assignment.totalAmount,
    paymentStatus: assignment.paymentStatus,
    paidAt: assignment.paidAt,
    paymentReference: assignment.paymentReference,
    checklist: assignment.checklist || [],
  };
};


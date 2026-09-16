import type { Assignment } from "@/types/assignment";

import type { Duty } from "@/components/manager/duties/constants";

const getEvent = (assignment: Assignment) =>
  typeof assignment.event === "string"
    ? { _id: assignment.event }
    : assignment.event;

const getStaff = (assignment: Assignment) =>
  typeof assignment.staff === "string"
    ? { id: assignment.staff }
    : assignment.staff;

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
    startTime: assignment.startTime,
    endTime: assignment.endTime,
    location: "location" in event ? event.location : "",
    staffId: staff.id,
    staffName: "name" in staff ? staff.name : "Staff unavailable",
    description: assignment.description ?? "",
    status: assignment.status,
  };
};

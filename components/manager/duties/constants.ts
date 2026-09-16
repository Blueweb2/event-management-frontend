import type { AssignmentStatus } from "@/types/assignment";

export type DutyStatus = AssignmentStatus;

export interface Duty {
  id: string;
  eventId: string;
  title: string;
  event: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  staffId: string;
  staffName: string;
  description: string;
  status: DutyStatus;
}

export const dutyStatuses: DutyStatus[] = [
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

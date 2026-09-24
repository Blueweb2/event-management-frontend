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
  rejectionReason?: string;
  department?: string;
  serviceName?: string;
  respondedAt?: string;
  hourlyRate?: number;
  totalHours?: number;
  totalAmount?: number;
  paymentStatus?: "PENDING" | "PAID" | "PROCESSING";
  paidAt?: string;
  paymentReference?: string;
  checklist?: Array<{ _id?: string; text: string; completed: boolean }>;
}

export const dutyStatuses: DutyStatus[] = [
  "ASSIGNED",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

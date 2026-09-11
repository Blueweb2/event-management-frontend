import type { Staff } from "./staff";

// ==========================================
// ASSIGNMENT STATUS
// ==========================================

export type AssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

// ==========================================
// POPULATED STAFF
// ==========================================

export type AssignmentStaff = Pick<
  Staff,
  | "id"
  | "name"
  | "username"
  | "email"
  | "phone"
  | "employeeId"
  | "department"
  | "location"
>;

// ==========================================
// ASSIGNMENT EVENT
// ==========================================

export type AssignmentEvent = {
  _id: string;

  eventName: string;
  eventType: string;

  eventDate: string;
  eventTime: string;

  guests?: number;

  location: string;

  status?: string;
};

// ==========================================
// ASSIGNED BY
// ==========================================

export type AssignmentCreatedBy = {
  _id: string;

  name: string;

  username: string;

  email: string;
};

// ==========================================
// ASSIGNMENT
// ==========================================

export type Assignment = {
  _id: string;

  event:
    | string
    | AssignmentEvent;

  staff:
    | string
    | AssignmentStaff;

  dutyTitle: string;

  role?: string;

  description?: string;

  dutyDate: string;

  startTime: string;

  endTime: string;

  status: AssignmentStatus;

  notes?: string;

  assignedBy:
    | string
    | AssignmentCreatedBy;

  createdAt: string;

  updatedAt: string;
};

// ==========================================
// CREATE ASSIGNMENT
// ==========================================

export type CreateAssignmentPayload = {
  event: string;

  staff: string;

  dutyTitle: string;

  role?: string;

  description?: string;

  dutyDate: string;

  startTime: string;

  endTime: string;

  notes?: string;
};

// ==========================================
// UPDATE ASSIGNMENT
// ==========================================

export type UpdateAssignmentPayload = {
  staff?: string;

  dutyTitle?: string;

  role?: string;

  description?: string;

  dutyDate?: string;

  startTime?: string;

  endTime?: string;

  status?: AssignmentStatus;

  notes?: string;
};

// ==========================================
// ASSIGNMENT FILTERS
// ==========================================

export type AssignmentFilters = {
  event?: string;

  staff?: string;

  date?: string;

  status?: AssignmentStatus;

  page?: number;

  limit?: number;
};

// ==========================================
// PAGINATION
// ==========================================

export type AssignmentPagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
};

// ==========================================
// LIST RESPONSE
// ==========================================

export type AssignmentListResponse = {
  success: boolean;

  data: Assignment[];

  pagination: AssignmentPagination;
};

// ==========================================
// SINGLE ASSIGNMENT RESPONSE
// ==========================================

export type AssignmentResponse = {
  success: boolean;

  message?: string;

  data: {
    assignment: Assignment;
  };
};

// ==========================================
// DELETE RESPONSE
// ==========================================

export type DeleteAssignmentResponse = {
  success: boolean;

  message?: string;
};
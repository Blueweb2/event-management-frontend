// ==========================================
// ATTENDANCE STATUS
// ==========================================

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "ABSENT";

// ==========================================
// ATTENDANCE STAFF
// ==========================================

export type AttendanceStaff = {
  _id: string;
  name: string;
  username: string;
  employeeId: string;
  department: string;
};

// ==========================================
// ATTENDANCE EVENT
// ==========================================

export type AttendanceEvent = {
  _id: string;
  eventName: string;
  eventType?: string;
  eventDate: string;
  location: string;
};

// ==========================================
// ATTENDANCE DUTY
// ==========================================

export type AttendanceDuty = {
  _id: string;

  dutyTitle: string;
  role?: string;

  dutyDate?: string;

  startTime: string;
  endTime: string;

  status?: string;
};

// ==========================================
// ATTENDANCE MARKED BY
// ==========================================

export type AttendanceMarkedBy = {
  _id: string;
  name: string;
  username: string;
};

// ==========================================
// ATTENDANCE
// ==========================================

export type Attendance = {
  _id: string;

  duty: string | AttendanceDuty;

  staff: string | AttendanceStaff;

  event: string | AttendanceEvent;

  date: string;

  checkIn: string | null;

  checkOut: string | null;

  status: AttendanceStatus;

  notes: string;

  markedBy: string | AttendanceMarkedBy | null;

  createdAt: string;

  updatedAt: string;
};

// ==========================================
// CHECK IN
// ==========================================

export type CheckInPayload = {
  duty: string;
};

// ==========================================
// CHECK OUT
// ==========================================

export type CheckOutPayload = {
  duty: string;
};

// ==========================================
// MARK ABSENT
// ==========================================

export type MarkAbsentPayload = {
  duty: string;

  notes?: string;
};

// ==========================================
// ATTENDANCE FILTERS
// ==========================================

export type AttendanceFilters = {
  staff?: string;

  event?: string;

  duty?: string;

  date?: string;

  status?: AttendanceStatus;

  page?: number;

  limit?: number;
};

// ==========================================
// PAGINATION
// ==========================================

export type AttendancePagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
};

// ==========================================
// ATTENDANCE LIST RESPONSE
// ==========================================

export type AttendanceListResponse = {
  success: boolean;

  data: Attendance[];

  pagination: AttendancePagination;
};

// ==========================================
// SINGLE ATTENDANCE RESPONSE
// ==========================================

export type AttendanceResponse = {
  success: boolean;

  message?: string;

  data: {
    attendance: Attendance;
  };
};
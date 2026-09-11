// ==========================================
// AVAILABILITY STATUS
// ==========================================

export type AvailabilityStatus =
  | "AVAILABLE"
  | "ON_LEAVE"
  | "UNAVAILABLE";

// ==========================================
// AVAILABILITY STAFF
// ==========================================

export type AvailabilityStaff = {
  _id: string;

  name: string;
  username: string;
  email: string;

  employeeId: string;
  department: string;

  phone?: string;
  location?: string;
};

// ==========================================
// AVAILABILITY
// ==========================================

export type Availability = {
  _id: string;

  staff: string | AvailabilityStaff;

  date: string;

  status: AvailabilityStatus;

  startTime: string;

  endTime: string;

  notes: string;

  createdBy?: string | null;

  createdAt: string;

  updatedAt: string;
};

// ==========================================
// SET AVAILABILITY PAYLOAD
// POST /api/availability
// ==========================================

export type SetAvailabilityPayload = {
  staff: string;

  date: string;

  status: AvailabilityStatus;

  startTime?: string;

  endTime?: string;

  notes?: string;
};

// ==========================================
// AVAILABILITY FILTERS
// ==========================================

export type AvailabilityFilters = {
  staff?: string;

  date?: string;

  status?: AvailabilityStatus;

  page?: number;

  limit?: number;
};

// ==========================================
// PAGINATION
// ==========================================

export type AvailabilityPagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
};

// ==========================================
// AVAILABILITY LIST RESPONSE
// ==========================================

export type AvailabilityListResponse = {
  success: boolean;

  data: Availability[];

  pagination: AvailabilityPagination;
};

// ==========================================
// SINGLE AVAILABILITY RESPONSE
// ==========================================

export type AvailabilityResponse = {
  success: boolean;

  message?: string;

  data: {
    availability: Availability;
  };
};

// ==========================================
// DELETE AVAILABILITY RESPONSE
// ==========================================

export type DeleteAvailabilityResponse = {
  success: boolean;

  message?: string;
};
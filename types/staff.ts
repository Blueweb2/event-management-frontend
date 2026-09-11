// ==========================================
// EMPLOYMENT TYPE
// ==========================================

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary";

// ==========================================
// STAFF ROLE
// ==========================================

export type StaffRole =
  | "admin"
  | "staff";

// ==========================================
// STAFF STATUS
// ==========================================

export type StaffStatus =
  | "Active"
  | "Inactive";

// ==========================================
// EMERGENCY CONTACT
// ==========================================

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

// ==========================================
// STAFF
// ==========================================

export type Staff = {
  id: string;

  name: string;
  username: string;
  email: string;
  phone: string;
  location: string;

  employeeId: string;
  department: string;

  employmentType: EmploymentType;

  role: StaffRole;

  avatar?: string;

  eventsAssigned?: number;

  emergencyContact: EmergencyContact;

  isActive: boolean;

  status: StaffStatus;

  createdBy?: string | null;

  joinedDate: string;

  createdAt: string;
  updatedAt: string;
};

// ==========================================
// CREATE STAFF
// ==========================================

export type CreateStaffPayload = {
  name: string;
  username: string;
  email: string;
  password: string;

  phone?: string;
  location?: string;

  employeeId?: string;
  department?: string;

  employmentType?: EmploymentType;

  role?: string;

  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
};

// ==========================================
// UPDATE STAFF
// ==========================================

export type UpdateStaffPayload = {
  name?: string;
  username?: string;
  email?: string;

  phone?: string;
  location?: string;

  employmentType?: EmploymentType;

  role?: string;

  employeeId?: string;
  department?: string;

  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
};

// ==========================================
// STAFF STATUS FILTER
// ==========================================

export type StaffStatusFilter =
  | "all"
  | "active"
  | "inactive";

// ==========================================
// STAFF FILTERS
// ==========================================

export type StaffFilters = {
  search?: string;

  status?: StaffStatusFilter;

  department?: string;

  page?: number;

  limit?: number;
};

// ==========================================
// PAGINATION
// ==========================================

export type StaffPagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
};

// ==========================================
// STAFF LIST RESPONSE
// ==========================================

export type StaffListResponse = {
  success: boolean;

  data: Staff[];

  pagination: StaffPagination;
};

// ==========================================
// SINGLE STAFF RESPONSE
// ==========================================

export type StaffResponse = {
  success: boolean;

  message?: string;

  data: {
    staff: Staff;
  };
};

// ==========================================
// UPDATE STAFF STATUS
// ==========================================

export type UpdateStaffStatusPayload = {
  isActive: boolean;
};

// ==========================================
// RESET STAFF PASSWORD
// ==========================================

export type ResetStaffPasswordPayload = {
  newPassword: string;
};

// ==========================================
// RESET STAFF PASSWORD RESPONSE
// ==========================================

export type ResetStaffPasswordResponse = {
  id: string;

  username: string;

  message: string;
};
// ==========================================
// USER ROLE
// ==========================================

export type UserRole =
  | "superadmin"
  | "manager"
  | "staff"
  | "admin";

// ==========================================
// USER STATUS
// ==========================================

export type UserStatus =
  | "Active"
  | "Inactive";

// ==========================================
// AUTH USER
// ==========================================

export type AuthUser = {
  id: string;

  name: string;

  username: string;

  email: string;

  phone?: string;

  location?: string;

  employmentType?:
    | "full-time"
    | "part-time"
    | "contract"
    | "temporary";

  role: UserRole;

  department?: string;

  permissions?: string[];

  status?: UserStatus;

  joinedDate?: string;
};

// ==========================================
// REGISTER PAYLOAD
// ==========================================

export type RegisterPayload = {
  name: string;

  username: string;

  email: string;

  password: string;

  role?: UserRole;
};

// ==========================================
// LOGIN PAYLOAD
// ==========================================

export type LoginPayload = {
  identifier: string;

  password: string;
};

// ==========================================
// AUTH RESULT
// ==========================================

export type AuthResult = {
  user: AuthUser;

  token: string;
};

// ==========================================
// REGISTER RESPONSE
// ==========================================

export type RegisterResponse = {
  success: boolean;

  message?: string;

  data: AuthResult;
};

// ==========================================
// LOGIN RESPONSE
// ==========================================

export type LoginResponse = {
  success: boolean;

  message?: string;

  data: AuthResult;
};

// ==========================================
// GET CURRENT USER RESPONSE
// ==========================================

export type MeResponse = {
  success: boolean;

  data: {
    user: AuthUser;
  };
};

// ==========================================
// MANAGER TYPES
// ==========================================

export type ManagerItem = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  department?: string;
  permissions?: string[];
  employmentType?: string;
  role: "manager" | "admin";
  isActive: boolean;
  createdAt?: string;
};

export type CreateManagerPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  department?: string;
  permissions?: string[];
};

export type UpdateManagerPayload = {
  name?: string;
  phone?: string;
  location?: string;
  department?: string;
  permissions?: string[];
  isActive?: boolean;
};

export type BootstrapSuperAdminPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  secret?: string;
};
// ==========================================
// USER ROLE
// ==========================================

export type UserRole =
  | "admin"
  | "staff";

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
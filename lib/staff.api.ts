const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary";

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

  role: "admin" | "staff";

  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  isActive: boolean;
  status: "Active" | "Inactive";

  createdBy?: string | null;

  joinedDate: string;
  createdAt: string;
  updatedAt: string;
};

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

  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
};

export type UpdateStaffPayload = {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  location?: string;

  employeeId?: string;
  department?: string;

  employmentType?: EmploymentType;

  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type StaffListResponse = {
  success: boolean;
  data: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const handleResponse = async <T>(
  response: Response
): Promise<T> => {
  let result: any;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server"
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Something went wrong"
    );
  }

  return result;
};

/**
 * Create staff
 */
export const createStaff = async (
  payload: CreateStaffPayload,
  token: string
): Promise<Staff> => {
  const response = await fetch(
    `${API_URL}/users/staff`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const result =
    await handleResponse<
      ApiResponse<{ staff: Staff }>
    >(response);

  return result.data.staff;
};

/**
 * Get staff
 */
export const getStaff = async (
  token: string,
  params?: {
    search?: string;
    status?: "all" | "active" | "inactive";
    department?: string;
    page?: number;
    limit?: number;
  }
): Promise<StaffListResponse> => {
  const searchParams =
    new URLSearchParams();

  if (params?.search) {
    searchParams.set(
      "search",
      params.search
    );
  }

  if (params?.status) {
    searchParams.set(
      "status",
      params.status
    );
  }

  if (params?.department) {
    searchParams.set(
      "department",
      params.department
    );
  }

  if (params?.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page)
    );
  }

  if (params?.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit)
    );
  }

  const query =
    searchParams.toString();

  const response = await fetch(
    `${API_URL}/users/staff${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  return handleResponse<StaffListResponse>(
    response
  );
};

/**
 * Get staff by ID
 */
export const getStaffById = async (
  id: string,
  token: string
): Promise<Staff> => {
  if (!id) {
    throw new Error(
      "Staff ID is required"
    );
  }

  const response = await fetch(
    `${API_URL}/users/staff/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const result =
    await handleResponse<
      ApiResponse<{ staff: Staff }>
    >(response);

  return result.data.staff;
};

/**
 * Update staff
 */
export const updateStaff = async (
  id: string,
  payload: UpdateStaffPayload,
  token: string
): Promise<Staff> => {
  const response = await fetch(
    `${API_URL}/users/staff/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const result =
    await handleResponse<
      ApiResponse<{ staff: Staff }>
    >(response);

  return result.data.staff;
};

/**
 * Activate / deactivate staff
 */
export const updateStaffStatus =
  async (
    id: string,
    isActive: boolean,
    token: string
  ): Promise<Staff> => {
    const response = await fetch(
      `${API_URL}/users/staff/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive,
        }),
      }
    );

    const result =
      await handleResponse<
        ApiResponse<{ staff: Staff }>
      >(response);

    return result.data.staff;
  };

/**
 * Reset staff password
 */
export const resetStaffPassword =
  async (
    id: string,
    newPassword: string,
    token: string
  ) => {
    const response = await fetch(
      `${API_URL}/users/staff/${id}/password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword,
        }),
      }
    );

    return handleResponse(response);
  };
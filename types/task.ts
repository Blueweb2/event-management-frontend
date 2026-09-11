// ==========================================
// TASK STATUS
// ==========================================

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

// ==========================================
// TASK PRIORITY
// ==========================================

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

// ==========================================
// TASK STAFF
// ==========================================

export type TaskStaff = {
  _id: string;
  name: string;
  username: string;
  employeeId: string;
  email?: string;
};

// ==========================================
// TASK EVENT
// ==========================================

export type TaskEvent = {
  _id: string;
  eventName: string;
  eventType?: string;
  eventDate: string;
  location: string;
};

// ==========================================
// TASK DUTY
// ==========================================

export type TaskDuty = {
  _id: string;

  staff: string | TaskStaff;

  event: string | TaskEvent;

  dutyTitle?: string;
  role?: string;

  dutyDate?: string;
  startTime?: string;
  endTime?: string;

  status?: string;
};

// ==========================================
// TASK
// ==========================================

export type Task = {
  _id: string;

  duty: string | TaskDuty;

  title: string;

  description: string;

  dueDate: string;

  dueTime: string;

  priority: TaskPriority;

  status: TaskStatus;

  notes: string;

  createdBy?: string | null;

  completedAt?: string | null;

  createdAt: string;

  updatedAt: string;
};

// ==========================================
// CREATE TASK PAYLOAD
// ==========================================

export type CreateTaskPayload = {
  duty: string;

  title: string;

  description?: string;

  dueDate: string;

  dueTime?: string;

  priority?: TaskPriority;

  notes?: string;
};

// ==========================================
// UPDATE TASK PAYLOAD
// ==========================================

export type UpdateTaskPayload = {
  title?: string;

  description?: string;

  dueDate?: string;

  dueTime?: string;

  priority?: TaskPriority;

  status?: TaskStatus;

  notes?: string;
};

// ==========================================
// TASK FILTERS
// ==========================================

export type TaskFilters = {
  duty?: string;

  status?: TaskStatus;

  priority?: TaskPriority;

  page?: number;

  limit?: number;
};

// ==========================================
// PAGINATION
// ==========================================

export type TaskPagination = {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
};

// ==========================================
// TASK LIST RESPONSE
// ==========================================

export type TaskListResponse = {
  success: boolean;

  data: Task[];

  pagination: TaskPagination;
};

// ==========================================
// SINGLE TASK RESPONSE
// ==========================================

export type TaskResponse = {
  success: boolean;

  message?: string;

  data: {
    task: Task;
  };
};

// ==========================================
// DELETE TASK RESPONSE
// ==========================================

export type DeleteTaskResponse = {
  success: boolean;

  message?: string;
};
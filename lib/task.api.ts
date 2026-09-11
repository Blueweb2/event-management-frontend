import {
  get,
  post,
  put,
  del,
  ApiResponse,
} from "./api";

import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  TaskListResponse,
  DeleteTaskResponse,
} from "@/types/task";

// ==========================================
// CREATE TASK
// POST /api/tasks
// ==========================================

export const createTask = async (
  payload: CreateTaskPayload,
  token: string,
): Promise<Task> => {
  const result = await post<
    ApiResponse<{ task: Task }>
  >(
    "/tasks",
    payload,
    token,
  );

  return result.data.task;
};

// ==========================================
// GET TASKS
// GET /api/tasks
// ==========================================

export const getTasks = async (
  token: string,
  params?: TaskFilters,
): Promise<TaskListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.duty) {
    searchParams.set(
      "duty",
      params.duty,
    );
  }

  if (params?.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params?.priority) {
    searchParams.set(
      "priority",
      params.priority,
    );
  }

  if (params?.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params?.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  const query = searchParams.toString();

  const endpoint = query
    ? `/tasks?${query}`
    : "/tasks";

  return get<TaskListResponse>(
    endpoint,
    token,
  );
};

// ==========================================
// GET TASK BY ID
// GET /api/tasks/:id
// ==========================================

export const getTaskById = async (
  id: string,
  token: string,
): Promise<Task> => {
  if (!id) {
    throw new Error(
      "Task ID is required",
    );
  }

  const result = await get<
    ApiResponse<{ task: Task }>
  >(
    `/tasks/${id}`,
    token,
  );

  return result.data.task;
};

// ==========================================
// UPDATE TASK
// PUT /api/tasks/:id
// ==========================================

export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload,
  token: string,
): Promise<Task> => {
  if (!id) {
    throw new Error(
      "Task ID is required",
    );
  }

  const result = await put<
    ApiResponse<{ task: Task }>
  >(
    `/tasks/${id}`,
    payload,
    token,
  );

  return result.data.task;
};

// ==========================================
// DELETE / CANCEL TASK
// DELETE /api/tasks/:id
// ==========================================

export const deleteTask = async (
  id: string,
  token: string,
): Promise<DeleteTaskResponse> => {
  if (!id) {
    throw new Error(
      "Task ID is required",
    );
  }

  return del<DeleteTaskResponse>(
    `/tasks/${id}`,
    token,
  );
};
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "@/lib/task.api";
import type {
  CreateTaskPayload,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload,
} from "@/types/task";
import type { Assignment } from "@/types/assignment";

const statusOptions = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

const priorityOptions: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
];

const emptyForm = {
  duty: "",
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "MEDIUM" as TaskPriority,
  notes: "",
};

function formatDate(value?: string) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string) {
  if (!value) return "Flexible timing";
  return value;
}

function getStatusClasses(status: TaskStatus) {
  switch (status) {
    case "PENDING":
      return "bg-[#FFF4E5] text-[#A35A00]";
    case "IN_PROGRESS":
      return "bg-[#EAF3FF] text-[#1D4ED8]";
    case "COMPLETED":
      return "bg-[#EAFBF1] text-[#117A45]";
    case "CANCELLED":
      return "bg-[#FDECEC] text-[#B42318]";
    default:
      return "bg-[#F2F4F7] text-[#344054]";
  }
}

function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "LOW":
      return "bg-[#ECFDF5] text-[#027A48]";
    case "MEDIUM":
      return "bg-[#FFF7E5] text-[#B54708]";
    case "HIGH":
      return "bg-[#FEE4E2] text-[#B42318]";
    default:
      return "bg-[#F2F4F7] text-[#344054]";
  }
}

export default function ManagerTasksPage() {
  const { token } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [duties, setDuties] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchTasks = async () => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getTasks(token, {
        page: 1,
        limit: 100,
        status:
          statusFilter !== "ALL"
            ? (statusFilter as TaskStatus)
            : undefined,
        priority:
          priorityFilter !== "ALL"
            ? priorityFilter
            : undefined,
      });

      setTasks(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load tasks",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDuties = async () => {
    if (!token) return;

    try {
      const result = await getAssignments(token, {
        page: 1,
        limit: 100,
      });

      setDuties(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load duties",
      );
    }
  };

  useEffect(() => {
    void fetchTasks();
  }, [token, statusFilter, priorityFilter]);

  useEffect(() => {
    void fetchDuties();
  }, [token]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tasks;

    return tasks.filter((task) => {
      const dutyInfo = typeof task.duty === "string" ? null : task.duty;
      const eventName = dutyInfo?.event && typeof dutyInfo.event !== "string"
        ? dutyInfo.event.eventName
        : "";
      const dutyTitle = dutyInfo?.dutyTitle || "";
      const matchText = [
        task.title,
        task.description,
        task.notes,
        dutyTitle,
        eventName,
        task.status,
        task.priority,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchText.includes(query);
    });
  }, [tasks, search]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((item) => item.status === "PENDING").length,
      inProgress: tasks.filter((item) => item.status === "IN_PROGRESS").length,
      completed: tasks.filter((item) => item.status === "COMPLETED").length,
    };
  }, [tasks]);

  const openCreateForm = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setForm({
      duty: typeof task.duty === "string" ? task.duty : task.duty?._id || "",
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      dueTime: task.dueTime || "",
      priority: task.priority,
      notes: task.notes || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    if (!form.duty || !form.title || !form.dueDate) {
      setError("Duty ID, task title, and due date are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: CreateTaskPayload = {
        duty: form.duty,
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
        dueTime: form.dueTime,
        priority: form.priority,
        notes: form.notes,
      };

      if (editingTask) {
        const updatePayload: UpdateTaskPayload = {
          title: form.title,
          description: form.description,
          dueDate: form.dueDate,
          dueTime: form.dueTime,
          priority: form.priority,
          notes: form.notes,
        };

        await updateTask(editingTask._id, updatePayload, token);
      } else {
        await createTask(payload, token);
      }

      closeForm();
      await fetchTasks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save task",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (task: Task) => {
    if (!token) {
      setError("Authentication required");
      return;
    }

    setDeletingTask(task);
  };

  const confirmDelete = async () => {
    if (!token || !deletingTask) return;

    try {
      setLoading(true);
      setError(null);
      await deleteTask(deletingTask._id, token);
      setDeletingTask(null);
      await fetchTasks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete task",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    task: Task,
    status: TaskStatus,
  ) => {
    if (!token || status === task.status) return;

    try {
      setLoading(true);
      setError(null);
      await updateTask(task._id, { status }, token);
      await fetchTasks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update task status",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDutyLabel = (duty: Assignment) => {
    const eventName =
      typeof duty.event === "string"
        ? "Event"
        : duty.event.eventName;
    const date = formatDate(duty.dutyDate);

    return `${duty.dutyTitle} - ${eventName} (${date})`;
  };

  return (
    <main className="min-h-screen bg-[#F8F7F3] px-4 py-5 pb-24">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#9A7B4F]">Operations</p>
            <h1 className="text-2xl font-semibold text-[#1F1F1F]">
              Task Management
            </h1>
          </div>

          <Button
            variant="primary"
            className="bg-[#1F2023] hover:bg-[#2A2B2F]"
            onClick={openCreateForm}
            leftIcon={<Plus size={17} />}
          >
            New task
          </Button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Total</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-semibold text-[#1F1F1F]">{stats.total}</span>
              <ClipboardList className="h-8 w-8 text-[#9A7B4F]" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Pending</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-semibold text-[#1F1F1F]">{stats.pending}</span>
              <AlertCircle className="h-8 w-8 text-[#B54708]" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">In progress</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-semibold text-[#1F1F1F]">{stats.inProgress}</span>
              <CalendarDays className="h-8 w-8 text-[#1D4ED8]" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Completed</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-semibold text-[#1F1F1F]">{stats.completed}</span>
              <CheckCircle2 className="h-8 w-8 text-[#117A45]" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-[#F9F8F6] pl-10 pr-4 text-sm text-[#1F1F1F] outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                placeholder="Search tasks, duty, or event"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
              className="h-11 rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All statuses" : option.replace("_", " ")}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | "ALL")}
              className="h-11 rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
            >
              <option value="ALL">All priorities</option>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => void fetchTasks()}
          />
        )}

        {loading && tasks.length === 0 ? (
          <LoadingState message="Loading tasks..." />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Create a task or adjust your filters to view results."
            action={
              <Button variant="primary" onClick={openCreateForm}>
                Add task
              </Button>
            }
          />
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {filteredTasks.map((task) => {
              const dutyInfo = typeof task.duty === "string" ? null : task.duty;
              const eventInfo = dutyInfo?.event && typeof dutyInfo.event !== "string"
                ? dutyInfo.event
                : null;

              return (
                <article
                  key={task._id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-[#1F1F1F]">{task.title}</h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {eventInfo?.eventName || dutyInfo?.dutyTitle || "Duty record"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getPriorityClasses(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(task.status)}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-[#9A7B4F]" />
                      <span>{formatDate(task.dueDate)}</span>
                      <span className="text-gray-400">•</span>
                      <span>{formatTime(task.dueTime)}</span>
                    </div>

                    {eventInfo?.location && (
                      <p className="text-sm text-gray-600">Location: {eventInfo.location}</p>
                    )}

                    {task.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-gray-600">{task.description}</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-500">
                      {dutyInfo?.staff && typeof dutyInfo.staff !== "string"
                        ? `Assigned to ${dutyInfo.staff.name}`
                        : "Duty not assigned"}
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={task.status}
                        onChange={(event) =>
                          void handleStatusChange(
                            task,
                            event.target.value as TaskStatus,
                          )
                        }
                        disabled={loading}
                        aria-label={`Update status for ${task.title}`}
                        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10 disabled:opacity-50"
                      >
                        {statusOptions
                          .filter((option) => option !== "ALL")
                          .map((option) => (
                            <option key={option} value={option}>
                              {option.replace("_", " ")}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => openEditForm(task)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                        aria-label={`Edit ${task.title}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(task)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
                  {editingTask ? "Update" : "Create"}
                </p>
                <h2 className="text-xl font-semibold text-[#1F1F1F]">
                  {editingTask ? "Edit task" : "New task"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                aria-label="Close task form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Duty</label>
                <select
                  value={form.duty}
                  onChange={(event) => setForm((current) => ({ ...current, duty: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 text-sm outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                >
                  <option value="">
                    {duties.length > 0 ? "Select a duty" : "Loading duties..."}
                  </option>
                  {duties.map((duty) => (
                    <option key={duty._id} value={duty._id}>
                      {getDutyLabel(duty)}
                    </option>
                  ))}
                  {editingTask &&
                    form.duty &&
                    !duties.some((duty) => duty._id === form.duty) && (
                      <option value={form.duty}>
                        Current duty ({form.duty})
                      </option>
                    )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Task title</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 text-sm outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                  placeholder="e.g. Venue setup checklist"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 py-2.5 text-sm outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                  placeholder="Brief task description"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Due date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 text-sm outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Due time</label>
                <input
                  type="time"
                  value={form.dueTime}
                  onChange={(event) => setForm((current) => ({ ...current, dueTime: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 text-sm outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Priority</label>
                <select
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 text-sm outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Status</label>
                <input
                  value={editingTask?.status ? editingTask.status.replace("_", " ") : "PENDING"}
                  readOnly
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[#1F1F1F]">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 bg-[#F9F8F6] px-3 py-2.5 text-sm outline-none transition focus:border-[#B49A6A] focus:ring-2 focus:ring-[#B49A6A]/10"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={closeForm}>
                Cancel
              </Button>

              <Button onClick={() => void handleSubmit()} loading={loading}>
                {editingTask ? "Save changes" : "Create task"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => void confirmDelete()}
        title="Cancel task?"
        description={
          deletingTask
            ? `Are you sure you want to cancel "${deletingTask.title}"?`
            : undefined
        }
        confirmText="Cancel task"
        loading={loading}
      />
    </main>
  );
}

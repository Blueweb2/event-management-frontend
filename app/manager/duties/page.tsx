"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  CalendarDays,
  CheckSquare,
  Building2,
  Plus,
  Loader2,
} from "lucide-react";

import AddDutyModal, { type DutyFormValues } from "@/components/manager/duties/AddDutyModal";
import DepartmentCapacityGrid from "@/components/manager/duties/DepartmentCapacityGrid";
import DutiesFilters from "@/components/manager/duties/DutiesFilters";
import DutiesHeader from "@/components/manager/duties/DutiesHeader";
import DutiesList from "@/components/manager/duties/DutiesList";
import DutiesStats from "@/components/manager/duties/DutiesStats";
import ScheduleCalendar from "@/components/manager/schedule/ScheduleCalendar";
import ScheduleFilters, { type ScheduleFilter } from "@/components/manager/schedule/ScheduleFilters";
import ScheduleLegend from "@/components/manager/schedule/ScheduleLegend";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { type Duty, type DutyStatus } from "@/components/manager/duties/constants";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";
import { getEvents, type Event } from "@/lib/event.api";
import { mapAssignmentToDuty } from "@/lib/duty-mapper";
import type { ScheduleEventData } from "@/components/manager/schedule/ScheduleEvent";

// Import Task management API & Types
import { getTasks, updateTask } from "@/lib/task.api";
import type { Task } from "@/types/task";

type TabType = "list" | "calendar" | "tasks" | "departments";

function OperationsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "list";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const { token } = useAuth();

  // Duties & Assignments State
  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    addAssignment,
    editAssignment,
    removeAssignment,
    fetchAllAssignments,
    fetchAssignments,
  } = useAssignments({ token, autoFetch: false });
  
  const { staff, loading: staffLoading } = useStaff({ token });
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | DutyStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [deletingDuty, setDeletingDuty] = useState<Duty | null>(null);

  // Calendar State
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>("ALL");
  const [taskSearch, setTaskSearch] = useState("");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && ["list", "calendar", "tasks"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/manager/duties?tab=${tab}`);
  };

  useEffect(() => {
    if (!token) return;
    getEvents({ limit: 100 }, token)
      .then((result) => setEvents(result.data))
      .catch((error) =>
        setEventsError(error instanceof Error ? error.message : "Failed to load events")
      );
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => {
      void fetchAllAssignments();
    });
    return () => window.clearTimeout(timer);
  }, [token, fetchAllAssignments]);

  useEffect(() => {
    if (!token || activeTab !== "tasks") return;
    setTasksLoading(true);
    getTasks(token, { limit: 100 })
      .then((res) => setTasks(res.data))
      .catch((err) => console.warn("Failed to load tasks", err))
      .finally(() => setTasksLoading(false));
  }, [token, activeTab]);

  // Mapped duties
  const duties = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.status !== "CANCELLED")
        .map(mapAssignmentToDuty),
    [assignments]
  );

  const filteredDuties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return duties.filter(
      (duty) =>
        (!query ||
          [duty.title, duty.event, duty.staffName, duty.location].some((val) =>
            val.toLowerCase().includes(query)
          )) &&
        (status === "All" || duty.status === status)
    );
  }, [duties, search, status]);

  // Roster CSV Exporter
  const handleExportRoster = () => {
    if (duties.length === 0) return;
    const headers = ["Duty Title", "Event", "Assigned Staff", "Date", "Start Time", "End Time", "Status", "Location", "Checklist Items", "Completed"];
    const rows = filteredDuties.map((d) => [
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.event.replace(/"/g, '""')}"`,
      `"${d.staffName.replace(/"/g, '""')}"`,
      `"${d.eventDate}"`,
      `"${d.startTime}"`,
      `"${d.endTime}"`,
      `"${d.status}"`,
      `"${(d.location || "").replace(/"/g, '""')}"`,
      d.checklist?.length || 0,
      d.checklist?.filter((c) => c.completed).length || 0,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `duty_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Schedule Events
  const scheduleEvents = useMemo<ScheduleEventData[]>(() => {
    return assignments
      .filter((assignment) => {
        if (activeFilter === "All") return true;
        if (activeFilter === "On Duty") {
          return (
            assignment.status === "ASSIGNED" ||
            assignment.status === "ACCEPTED" ||
            assignment.status === "IN_PROGRESS"
          );
        }
        if (activeFilter === "Available") return assignment.status === "COMPLETED";
        if (activeFilter === "Off Duty") return assignment.status === "CANCELLED";
        return true;
      })
      .map((assignment) => {
        const staffObj = typeof assignment.staff === "string" ? null : assignment.staff;
        const eventObj = typeof assignment.event === "string" ? null : assignment.event;

        return {
          id: assignment._id,
          staffName:
            staffObj?.name ||
            (typeof assignment.staff === "string" ? assignment.staff : "Staff member"),
          staffRole: staffObj?.department || undefined,
          startTime: assignment.startTime,
          endTime: assignment.endTime,
          eventName:
            eventObj?.eventName ||
            (typeof assignment.event === "string"
              ? assignment.event
              : assignment.dutyTitle),
          dutyDate: assignment.dutyDate,
        };
      });
  }, [assignments, activeFilter]);

  const closeModal = () => {
    if (!assignmentsLoading) {
      setModalOpen(false);
      setEditingDuty(null);
    }
  };

  const handleSaveDuty = async (values: DutyFormValues) => {
    const payload = {
      staff: values.staff,
      dutyTitle: values.dutyTitle,
      description: values.description || undefined,
      dutyDate: values.dutyDate,
      startTime: values.startTime,
      endTime: values.endTime,
      checklist: values.checklist || [],
    };
    if (editingDuty) await editAssignment(editingDuty.id, payload);
    else await addAssignment({ ...payload, event: values.event });
    closeModal();
  };

  const handleToggleChecklist = async (
    dutyId: string,
    updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>
  ) => {
    await editAssignment(dutyId, { checklist: updatedChecklist });
  };

  const handleStatusChange = async (duty: Duty) => {
    const nextStatus: Partial<Record<DutyStatus, DutyStatus>> = {
      ASSIGNED: "IN_PROGRESS",
      ACCEPTED: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
    };
    const next = nextStatus[duty.status];
    if (next) await editAssignment(duty.id, { status: next });
  };

  const handleToggleTaskStatus = async (task: Task) => {
    if (!token) return;
    const statusFlow: Record<string, "PENDING" | "IN_PROGRESS" | "COMPLETED"> = {
      PENDING: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "PENDING",
    };
    const nextStatus = statusFlow[task.status] || "PENDING";
    try {
      const updated = await updateTask(task._id, { status: nextStatus }, token);
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (err) {
      console.warn("Failed to update task status", err);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesPriority = taskPriorityFilter === "ALL" || t.priority === taskPriorityFilter;
      const matchesSearch = !taskSearch.trim() || t.title.toLowerCase().includes(taskSearch.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  }, [tasks, taskPriorityFilter, taskSearch]);

  const eventOptions = events.map((ev) => ({
    id: ev._id,
    name: ev.eventName,
    date: ev.eventDate.slice(0, 10),
    time: ev.eventTime,
  }));
  const staffOptions = staff
    .filter((member) => member.isActive)
    .map((member) => ({ id: member.id, name: member.name, department: member.department }));
  
  const loading = assignmentsLoading || staffLoading;
  const error = assignmentsError || eventsError;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-gray-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9A7B4F]">
            Operations Hub
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#1F1F1F]">
            Duties, Schedule & Tasks
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Manage staff assignments, duty schedules, and operational checklists in one place.
          </p>
        </div>

        {/* View Switcher Tabs - Mobile scrollable */}
        <div className="flex w-full overflow-x-auto no-scrollbar scrollbar-none rounded-2xl bg-gray-100 p-1.5 lg:w-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              type="button"
              onClick={() => switchTab("list")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ClipboardList size={15} className="shrink-0" />
              <span>Duty List</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("calendar")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "calendar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CalendarDays size={15} className="shrink-0" />
              <span>Schedule Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("tasks")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "tasks"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckSquare size={15} className="shrink-0" />
              <span>Task Checklist</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("departments")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === "departments"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Building2 size={15} className="shrink-0" />
              <span>Department Capacity</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* ========================================================
          TAB 1: DUTY LIST VIEW
      ======================================================== */}
      {activeTab === "list" && (
        <div className="space-y-6">
          <DutiesHeader
            onAddDuty={() => { setEditingDuty(null); setModalOpen(true); }}
            onExportRoster={handleExportRoster}
          />
          <DutiesStats duties={duties} />
          <DutiesFilters
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onClear={() => { setSearch(""); setStatus("All"); }}
          />
          <DutiesList
            duties={filteredDuties}
            loading={loading}
            onEdit={(duty) => { setEditingDuty(duty); setModalOpen(true); }}
            onDelete={setDeletingDuty}
            onStatusChange={handleStatusChange}
            onToggleChecklist={handleToggleChecklist}
          />
        </div>
      )}

      {/* ========================================================
          TAB 2: CALENDAR SCHEDULE VIEW
      ======================================================== */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <ScheduleFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={async (val) => {
              setStartDate(val);
              await fetchAssignments({ page: 1, limit: 100, startDate: val || undefined, endDate: endDate || undefined });
            }}
            onEndDateChange={async (val) => {
              setEndDate(val);
              await fetchAssignments({ page: 1, limit: 100, startDate: startDate || undefined, endDate: val || undefined });
            }}
          />
          <ScheduleLegend />
          <ScheduleCalendar
            events={scheduleEvents}
            onEventClick={() => {}}
            onBack={() => switchTab("list")}
            onAddShift={() => { setEditingDuty(null); setModalOpen(true); }}
          />
        </div>
      )}

      {/* ========================================================
          TAB 3: TASK CHECKLIST VIEW
      ======================================================== */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1F1F1F]">Operation Task Checklist</h2>
              <p className="text-xs text-gray-500">Track and update active shift checklist items in real time.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/manager/tasks")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1F1F1F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 sm:w-auto"
            >
              <Plus size={15} />
              Open Full Task Manager
            </button>
          </div>

          {/* Priority Filters & Search */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-gray-200 bg-white p-3.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1 md:pb-0">
              <span className="text-xs font-semibold text-gray-500 mr-1 shrink-0">Priority:</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaskPriorityFilter(p)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      taskPriorityFilter === p
                        ? "bg-[#1F1F1F] text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p === "ALL" ? "All Priorities" : p}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Search operation tasks..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="h-10 w-full md:w-64 rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9A7B4F]"
            />
          </div>

          {tasksLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
              Loading operation tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <CheckSquare className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-700">No matching tasks found</p>
              <p className="mt-1 text-xs text-gray-400">Try adjusting your search or priority filter.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => {
                const priorityColors: Record<string, string> = {
                  HIGH: "bg-rose-50 text-rose-700 border-rose-200",
                  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
                  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
                };

                const statusBadges: Record<string, string> = {
                  PENDING: "bg-gray-100 text-gray-700",
                  IN_PROGRESS: "bg-amber-100 text-amber-800 font-semibold",
                  COMPLETED: "bg-emerald-100 text-emerald-800 font-semibold",
                };

                return (
                  <div key={task._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-gray-900 leading-snug">{task.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${priorityColors[task.priority] || priorityColors.LOW}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{task.description}</p>
                      )}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2.5">
                        <span>Due: {task.dueDate?.slice(0, 10) || "Today"}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] ${statusBadges[task.status] || statusBadges.PENDING}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 text-center"
                      >
                        {task.status === "PENDING" && "Start Task (In Progress)"}
                        {task.status === "IN_PROGRESS" && "Mark Task as Completed ✓"}
                        {task.status === "COMPLETED" && "Reset Task to Pending"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: DEPARTMENT CAPACITY & ROSTER MATRIX
      ======================================================== */}
      {activeTab === "departments" && (
        <DepartmentCapacityGrid
          onSelectStaffForDuty={() => {
            setEditingDuty(null);
            setModalOpen(true);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingDuty)}
        onClose={() => setDeletingDuty(null)}
        onConfirm={async () => {
          if (deletingDuty) {
            await removeAssignment(deletingDuty.id);
            setDeletingDuty(null);
          }
        }}
        title="Delete duty?"
        description={deletingDuty ? `Are you sure you want to delete "${deletingDuty.title}"?` : undefined}
        confirmText="Delete duty"
      />

      {modalOpen && (
        <AddDutyModal
          key={editingDuty?.id ?? "new"}
          open={modalOpen}
          onClose={closeModal}
          onSave={handleSaveDuty}
          editingDuty={editingDuty}
          events={eventOptions}
          staff={staffOptions}
          loading={loading}
        />
      )}
    </div>
  );
}

export default function DutiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9A7B4F]/10 text-[#9A7B4F]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-xs font-medium text-gray-500">Loading Operations Hub...</p>
        </div>
      }
    >
      <OperationsHubContent />
    </Suspense>
  );
}

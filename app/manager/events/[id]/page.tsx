"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

import {
  getEventById,
  type Event,
} from "@/lib/event.api";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";

import type { CreateAssignmentPayload } from "@/types/assignment";

// ==========================================
// Page
// ==========================================

export default function ManagerEventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();

  const eventId =
    typeof params.id === "string"
      ? params.id
      : "";

  // ==========================================
  // State
  // ==========================================

  const [event, setEvent] = useState<Event | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [assignmentForm, setAssignmentForm] = useState({
    staff: "",
    dutyTitle: "",
    role: "",
    dutyDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  });

  const [assignmentError, setAssignmentError] = useState("");

  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    fetchAssignments,
    addAssignment,
  } = useAssignments({
    token,
    autoFetch: false,
  });

  const {
    staff,
    loading: staffLoading,
    error: staffError,
    fetchStaff,
  } = useStaff({
    token,
    autoFetch: false,
  });

  // ==========================================
  // Fetch Event
  // ==========================================

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setError("Event ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getEventById(eventId);

      setEvent(response.data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load event";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // ==========================================
  // Load Event
  // ==========================================

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchEvent();
    }, 0);

    return () => clearTimeout(timeout);
  }, [fetchEvent]);

  useEffect(() => {
    if (!token || !eventId) return;

    void fetchAssignments({
      event: eventId,
      page: 1,
      limit: 100,
    });
    void fetchStaff({
      status: "active",
      page: 1,
      limit: 100,
    });
  }, [eventId, fetchAssignments, fetchStaff, token]);

  const handleAssignmentChange = (
    field: keyof typeof assignmentForm,
    value: string,
  ) => {
    setAssignmentForm((current) => ({
      ...current,
      [field]: value,
    }));
    setAssignmentError("");
  };

  const handleAssignStaff = async (
    submitEvent: React.FormEvent<HTMLFormElement>,
  ) => {
    submitEvent.preventDefault();

    if (!eventId) return;

    const dutyDate =
      assignmentForm.dutyDate || event?.eventDate.slice(0, 10) || "";
    const startTime =
      assignmentForm.startTime || event?.eventTime || "";

    const requiredFields = [
      assignmentForm.staff,
      assignmentForm.dutyTitle,
      dutyDate,
      startTime,
      assignmentForm.endTime,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      setAssignmentError("Staff, duty, date, start time, and end time are required.");
      return;
    }

    if (assignmentForm.endTime <= startTime) {
      setAssignmentError("End time must be later than start time.");
      return;
    }

    const payload: CreateAssignmentPayload = {
      event: eventId,
      staff: assignmentForm.staff,
      dutyTitle: assignmentForm.dutyTitle.trim(),
      role: assignmentForm.role.trim() || undefined,
      dutyDate,
      startTime,
      endTime: assignmentForm.endTime,
      notes: assignmentForm.notes.trim() || undefined,
    };

    try {
      await addAssignment(payload);
      await fetchAssignments({
        event: eventId,
        page: 1,
        limit: 100,
      });
      setAssignmentForm((current) => ({
        ...current,
        staff: "",
        dutyTitle: "",
        role: "",
        notes: "",
      }));
      setAssignmentError("");
    } catch (err) {
      setAssignmentError(
        err instanceof Error
          ? err.message
          : "Failed to assign staff member.",
      );
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F7F3]">
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[#F8F7F3]">
        <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5 sm:px-6">
          {/* Back Button */}

          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex min-h-11 items-center gap-2 text-sm font-medium text-[#252525]"
          >
            <span className="text-lg">←</span>

            <span>Back to Events</span>
          </button>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <ErrorMessage
              message={error || "Event not found"}
            />

            <button
              type="button"
              onClick={fetchEvent}
              className="mt-4 min-h-11 rounded-xl bg-[#252525] px-5 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const assignedStaff = assignments.reduce<
    Array<{
      id: string;
      name: string;
      department: string;
      assignments: typeof assignments;
    }>
  >((members, assignment) => {
    const populatedStaff =
      typeof assignment.staff === "object"
        ? assignment.staff
        : undefined;
    const staffId = populatedStaff?.id || (typeof assignment.staff === "string" ? assignment.staff : "");
    const directoryStaff = staff.find(
      (member) => member.id === staffId,
    );

    if (!staffId) {
      return members;
    }

    const existingMember = members.find(
      (member) => member.id === staffId,
    );

    if (existingMember) {
      existingMember.assignments.push(assignment);
      return members;
    }

    members.push({
      id: staffId,
      name:
        populatedStaff?.name ||
        directoryStaff?.name ||
        "Staff member",
      department:
        populatedStaff?.department ||
        directoryStaff?.department ||
        "",
      assignments: [assignment],
    });

    return members;
  }, []);

  // ==========================================
  // Render
  // ==========================================

  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5 sm:px-6">

        {/* ======================================
            Header
        ====================================== */}

        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back to Events"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl text-[#252525] shadow-sm"
          >
            ←
          </button>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8C7A55]">
              Event Details
            </p>

            <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-[#252525]">
              {event.eventName}
            </h1>
          </div>
        </header>

        {/* ======================================
            Event Status
        ====================================== */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Event Status
              </p>

              <p className="mt-1 text-lg font-semibold text-[#252525]">
                {event.status}
              </p>
            </div>

            <span className="rounded-full bg-[#F4EFE4] px-3 py-1.5 text-xs font-semibold text-[#8C7A55]">
              {event.status}
            </span>
          </div>
        </section>

        {/* ======================================
            Event Information
        ====================================== */}

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#252525]">
            Event Information
          </h2>

          <div className="mt-4 space-y-4">
            <DetailRow
              label="Event Type"
              value={event.eventType}
            />

            <DetailRow
              label="Date"
              value={formatDate(event.eventDate)}
            />

            <DetailRow
              label="Time"
              value={event.eventTime}
            />

            <DetailRow
              label="Guests"
              value={`${event.guests} guests`}
            />

            <DetailRow
              label="Location"
              value={event.location}
            />
          </div>
        </section>

        {/* ======================================
            Client Information
        ====================================== */}

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#252525]">
            Client
          </h2>

          <div className="mt-4">
            {typeof event.client === "object" ? (
              <>
                <p className="text-base font-semibold text-[#252525]">
                  {event.client.name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {event.client.phone}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {event.client.email}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Client information unavailable
              </p>
            )}
          </div>
        </section>

        {/* ======================================
            Description
        ====================================== */}

        {event.description && (
          <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#252525]">
              Description
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {event.description}
            </p>
          </section>
        )}

        {/* ======================================
            Notes
        ====================================== */}

        {event.notes && (
          <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#252525]">
              Notes
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {event.notes}
            </p>
          </section>
        )}

        {/* ======================================
            Staff Assignments
        ====================================== */}

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A7B4F]">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#252525]">
                Assign Staff
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Assign staff members one at a time for this event.
              </p>
            </div>
          </div>

          {(assignmentError || assignmentsError || staffError) && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {assignmentError || assignmentsError || staffError}
            </div>
          )}

          <form onSubmit={handleAssignStaff} className="mt-5 space-y-4">
            <div>
              <label htmlFor="event-assignment-staff" className="mb-1.5 block text-xs font-medium text-gray-700">
                Staff member
              </label>
              <select
                id="event-assignment-staff"
                value={assignmentForm.staff}
                onChange={(formEvent) => handleAssignmentChange("staff", formEvent.target.value)}
                disabled={staffLoading || assignmentsLoading}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#252525] outline-none focus:border-[#B89563] focus:ring-2 focus:ring-[#B89563]/10"
              >
                <option value="">{staffLoading ? "Loading staff..." : "Select a staff member"}</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                aria-label="Duty title"
                value={assignmentForm.dutyTitle}
                onChange={(formEvent) => handleAssignmentChange("dutyTitle", formEvent.target.value)}
                placeholder="Duty title"
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#B89563]"
              />
              <input
                aria-label="Role"
                value={assignmentForm.role}
                onChange={(formEvent) => handleAssignmentChange("role", formEvent.target.value)}
                placeholder="Role (optional)"
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#B89563]"
              />
              <input
                aria-label="Duty date"
                type="date"
                value={assignmentForm.dutyDate || event?.eventDate.slice(0, 10) || ""}
                onChange={(formEvent) => handleAssignmentChange("dutyDate", formEvent.target.value)}
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#B89563]"
              />
              <input
                aria-label="Start time"
                type="time"
                value={assignmentForm.startTime || event?.eventTime || ""}
                onChange={(formEvent) => handleAssignmentChange("startTime", formEvent.target.value)}
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#B89563]"
              />
              <input
                aria-label="End time"
                type="time"
                value={assignmentForm.endTime}
                onChange={(formEvent) => handleAssignmentChange("endTime", formEvent.target.value)}
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#B89563]"
              />
              <input
                aria-label="Assignment notes"
                value={assignmentForm.notes}
                onChange={(formEvent) => handleAssignmentChange("notes", formEvent.target.value)}
                placeholder="Notes (optional)"
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#B89563]"
              />
            </div>

            <button
              type="submit"
              disabled={assignmentsLoading || staffLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#252525] px-5 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assignmentsLoading && <Loader2 size={16} className="animate-spin" />}
              {assignmentsLoading ? "Assigning..." : "Assign Staff Member"}
            </button>
          </form>

          {assignmentsLoading && assignments.length === 0 && (
            <p className="mt-5 text-sm text-gray-500">
              Loading assigned staff...
            </p>
          )}

          {!assignmentsLoading && assignments.length === 0 && (
            <p className="mt-5 rounded-xl bg-[#F8F7F3] px-3 py-3 text-sm text-gray-500">
              No staff members are assigned to this event yet.
            </p>
          )}

          {assignedStaff.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-[#252525]">
                Assigned staff ({assignedStaff.length})
              </h3>
              <div className="mt-3 space-y-2">
                {assignedStaff.map((member) => (
                  <div key={member.id} className="rounded-xl bg-[#F8F7F3] px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#252525]">
                        {member.name}
                      </p>
                      {member.department && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {member.department}
                        </p>
                      )}
                      <div className="mt-2 space-y-1">
                        {member.assignments.map((assignment) => (
                          <div
                            key={assignment._id}
                            className="flex items-center justify-between gap-3 text-xs text-gray-500"
                          >
                            <span className="truncate">
                              {assignment.dutyTitle} · {assignment.startTime} - {assignment.endTime}
                            </span>
                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase text-gray-500">
                              {assignment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ======================================
            Actions
        ====================================== */}

        <section className="mt-6 space-y-3">
          <button
            type="button"
            className="min-h-12 w-full rounded-xl bg-[#252525] px-5 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Assign Staff
          </button>

          <button
            type="button"
            className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-[#252525] transition active:scale-[0.98]"
          >
            Update Status
          </button>
        </section>
      </div>
    </main>
  );
}

// ==========================================
// Detail Row
// ==========================================

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-[#252525]">
        {value}
      </span>
    </div>
  );
}

// ==========================================
// Date Formatter
// ==========================================

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, UserPlus, Sparkles, Phone, Mail, Edit, Trash2 } from "lucide-react";

import {
  getEventById,
  deleteEvent,
  type Event,
} from "@/lib/event.api";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";
import EventServiceStaffingMatrix from "@/components/manager/events/EventServiceStaffingMatrix";
import EventProfitabilityCard from "@/components/manager/events/EventProfitabilityCard";
import EventStaffAttendanceCard from "@/components/manager/events/EventStaffAttendanceCard";
import EventTaskProgressCard from "@/components/manager/events/EventTaskProgressCard";
import EventActivityTimelineCard from "@/components/manager/events/EventActivityTimelineCard";
import EventStockTab from "@/components/manager/events/EventStockTab";
import EditEventModal from "@/components/manager/events/EditEventModal";
import DeleteEventModal from "@/components/manager/events/DeleteEventModal";
import { getEventStaffAttendance } from "@/lib/attendance.api";
import { getEventTaskProgress } from "@/lib/assignment.api";
import { getEventActivityTimeline } from "@/lib/event.api";
import ClientDocumentModal from "@/components/manager/documents/ClientDocumentModal";
import {
  type ClientDocumentData,
  defaultCompanyDetails,
} from "@/lib/document-formatter";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";

import type { CreateAssignmentPayload } from "@/types/assignment";
import { getSocket } from "@/lib/socket";

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
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const [attendanceTrackingData, setAttendanceTrackingData] = useState<any[]>([]);
  const [taskProgressData, setTaskProgressData] = useState<{ tasks: any[]; summary: any }>({
    tasks: [],
    summary: { totalTasks: 0, completedCount: 0, inProgressCount: 0, pendingCount: 0, overdueCount: 0, progressPercentage: 0 },
  });
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  const fetchMonitoringData = useCallback(async () => {
    if (!token || !eventId) return;
    try {
      setMonitoringLoading(true);
      const [attendanceRes, taskRes, activityRes] = await Promise.all([
        getEventStaffAttendance(token, eventId).catch(() => []),
        getEventTaskProgress(eventId, token).catch(() => ({ tasks: [], summary: {} })),
        getEventActivityTimeline(eventId, token).catch(() => ({ success: false, data: { activities: [] } })),
      ]);
      setAttendanceTrackingData(attendanceRes);
      setTaskProgressData(taskRes);
      if (activityRes?.data?.activities) {
        setActivitiesData(activityRes.data.activities);
      }
    } catch {
      // ignore
    } finally {
      setMonitoringLoading(false);
    }
  }, [eventId, token]);

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
    void fetchEvent();
    void fetchMonitoringData();

    // Auto-poll live staff attendance & monitoring data every 4 seconds
    const interval = setInterval(() => {
      void fetchMonitoringData();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchEvent, fetchMonitoringData]);

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

  // ==========================================
  // Socket.IO Room & Connection Management
  // ==========================================
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !eventId) return;

    const joinRoom = () => {
      socket.emit("join:event", eventId);
    };

    const onConnect = () => {
      console.log(`🔌 Manager Socket connected: ${socket.id}`);
      joinRoom();
    };

    const onEventJoined = (data: { eventId: string; room: string }) => {
      console.log(`👥 Joined event room: ${data.room}`);
    };

    const onDisconnect = () => {
      console.log("🔌 Manager Socket disconnected");
    };

    const onConnectError = (err: Error) => {
      console.error("❌ Manager Socket connection error:", err);
    };

    // If socket is already connected when component mounts, join room immediately
    if (socket.connected) {
      console.log(`🔌 Manager Socket connected: ${socket.id}`);
      joinRoom();
    }

    socket.on("connect", onConnect);
    socket.on("event:joined", onEventJoined);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("event:joined", onEventJoined);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [eventId]);

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

  const bookingObj = typeof event.booking === "object" && event.booking !== null ? event.booking : null;
  const eventTotal = bookingObj?.total || 0;
  const eventPaid = (event.paidAmount ?? event.advancePayment) || 0;
  const eventBalance = Math.max(0, eventTotal - eventPaid);

  const eventDocumentData: ClientDocumentData | null = event
    ? {
        documentType: "INVOICE",
        documentNumber: `INV-${event._id.slice(-6).toUpperCase()}`,
        date: new Date().toISOString().slice(0, 10),
        status: event.status === "Completed" || event.status === "Settled" || event.paymentStatus === "PAID" ? "PAID" : "CONFIRMED",
        company: defaultCompanyDetails,
        client: {
          name:
            typeof event.client === "object" && event.client?.name
              ? event.client.name
              : "Valued Client",
          phone:
            typeof event.client === "object" ? event.client?.phone || "" : "",
          email:
            typeof event.client === "object" ? event.client?.email || "" : "",
          address:
            typeof event.client === "object"
              ? event.client?.address
              : undefined,
        },
        event: {
          name: event.eventName,
          type: event.eventType,
          date: event.eventDate,
          time: event.eventTime,
          guests: event.guests,
          location: event.location,
          description: event.description || event.notes,
        },
        services:
          bookingObj &&
          Array.isArray(bookingObj.services) &&
          bookingObj.services.length > 0
            ? bookingObj.services.map((s, idx) => ({
                id: s._id || String(idx),
                name: s.serviceName,
                category: s.category,
                quantity: s.quantity,
                unitLabel: s.unitLabel,
                unitPrice: s.unitPrice,
                total: s.total,
              }))
            : [
                {
                  id: "1",
                  name: "Full Event Production & Management Package",
                  category: "Production",
                  quantity: 1,
                  unitLabel: "Package",
                  unitPrice:
                    bookingObj?.subtotal || bookingObj?.total || 0,
                  total:
                    bookingObj?.subtotal || bookingObj?.total || 0,
                },
              ],
        catering:
          bookingObj &&
          bookingObj.foodMenu &&
          bookingObj.foodMenu.included
            ? {
                included: true,
                servingType: bookingObj.foodMenu.servingType,
                ratePerGuest: bookingObj.foodMenu.ratePerGuest,
                totalFoodAmount: bookingObj.foodMenu.totalFoodAmount,
                guestCount: event.guests,
                notes: bookingObj.foodMenu.notes,
                items: bookingObj.foodMenu.items,
              }
            : undefined,
        subtotal:
          bookingObj?.subtotal ||
          bookingObj?.total ||
          0,
        discount:
          bookingObj?.discountAmount || 0,
        additionalCharges:
          bookingObj?.additionalCharges || 0,
        gstRate:
          bookingObj?.gstRate || 18,
        gstAmount:
          bookingObj?.gstAmount || 0,
        total: eventTotal,
        currency:
          bookingObj?.currency || "INR",
        advancePayment: event.advancePayment || 0,
        paidAmount: eventPaid,
        balanceDue: eventBalance,
        paymentStatus: event.paymentStatus || (eventBalance === 0 && eventTotal > 0 ? "PAID" : "PARTIAL"),
      }
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="w-full">
        {/* ======================================
            Header
        ====================================== */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back to Events"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-xl text-[#252525] shadow-xs border border-gray-200 hover:bg-gray-50 transition active:scale-95"
            >
              ←
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8C7A55]">
                Event Management
              </p>

              <h1 className="mt-0.5 truncate text-lg sm:text-2xl font-black tracking-tight text-[#252525]">
                {event.eventName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition active:scale-95"
            >
              <Edit size={14} className="text-[#9A7B4F]" />
              <span>Edit Event</span>
            </button>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 shadow-xs hover:bg-red-100 transition active:scale-95"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>

            {/* Export Studio Trigger */}
            {eventDocumentData && (
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#29241F] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-black transition active:scale-95"
              >
                <Sparkles size={14} className="text-[#D4AF37]" />
                <span>Export Invoice & Quotation</span>
              </button>
            )}
          </div>
        </header>

        {/* ======================================
            Event Overview Grid
        ====================================== */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Event Status & Specs */}
          <section className="rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  Event Status
                </p>
                <p className="mt-1 text-lg font-black text-[#252525]">
                  {event.status}
                </p>
              </div>

              <span className="rounded-full bg-[#F4EFE4] px-3 py-1 text-xs font-bold text-[#8C7A55]">
                {event.eventType}
              </span>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="font-bold text-[#252525]">{formatDate(event.eventDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time:</span>
                <span className="font-bold text-[#252525]">{event.eventTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Guests:</span>
                <span className="font-bold text-[#252525]">{event.guests} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Venue:</span>
                <span className="font-bold text-[#252525] truncate max-w-[150px]">{event.location}</span>
              </div>
            </div>
          </section>

          {/* Client Information */}
          <section className="rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              Client Details
            </h2>

            <div className="mt-3">
              {typeof event.client === "object" ? (
                <>
                  <p className="text-base font-extrabold text-[#252525]">
                    {event.client.name}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Phone size={13} className="text-[#9a6c37] shrink-0" />
                    <span>{event.client.phone}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500 truncate">
                    <Mail size={13} className="text-[#9a6c37] shrink-0" />
                    <span className="truncate">{event.client.email}</span>
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-400">Client details unavailable</p>
              )}
            </div>
          </section>

          {/* Description & Internal Notes */}
          <section className="rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              Event Notes & Scope
            </h2>
            <p className="mt-2 text-xs leading-5 text-gray-600 line-clamp-4">
              {event.description || event.notes || "No additional instructions provided for this booking."}
            </p>
          </section>
        </div>

        {/* ======================================
            Event Profitability & Expense Tracking
        ====================================== */}
        <section className="mt-6">
          <EventProfitabilityCard
            eventId={eventId}
            eventName={event.eventName}
          />
        </section>

        {/* ======================================
            Dynamic Service & Catering Staffing Matrix
        ====================================== */}
        <section className="mt-6">
          <EventServiceStaffingMatrix
            eventId={eventId}
            token={token || undefined}
            onAssignmentCreated={() => {
              void fetchAssignments({
                event: eventId,
                page: 1,
                limit: 100,
              });
              void fetchMonitoringData();
            }}
          />
        </section>

        {/* ======================================
            Event Stock & Equipment Allocation
        ====================================== */}
        <section className="mt-6">
          <EventStockTab
            eventId={eventId}
            eventName={event.eventName}
            token={token || undefined}
          />
        </section>

        {/* ======================================
            Staff Duty Time & Attendance Tracker
        ====================================== */}
        <section className="mt-6">
          <EventStaffAttendanceCard
            attendanceData={attendanceTrackingData}
            loading={monitoringLoading}
            onRefresh={fetchMonitoringData}
          />
        </section>

        {/* ======================================
            Task Execution Progress Tracker
        ====================================== */}
        <section className="mt-6">
          <EventTaskProgressCard
            taskProgress={taskProgressData}
            loading={monitoringLoading}
            isCompleted={
              event?.status === "COMPLETED" ||
              event?.status === "Completed" ||
              event?.status === "Settled" ||
              event?.status === "Invoiced"
            }
            onRefresh={fetchMonitoringData}
          />
        </section>

        {/* ======================================
            Operational Activity Audit Log
        ====================================== */}
        <section className="mt-6">
          <EventActivityTimelineCard
            activities={activitiesData}
            loading={monitoringLoading}
            onRefresh={fetchMonitoringData}
          />
        </section>

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
            onClick={() => setEditModalOpen(true)}
            className="min-h-12 w-full rounded-2xl border border-gray-300 bg-white px-5 text-sm font-bold text-[#252525] shadow-xs transition hover:bg-gray-50 active:scale-[0.98]"
          >
            Edit Event Details & Status
          </button>
        </section>

        {eventDocumentData && (
          <ClientDocumentModal
            open={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
            documentData={eventDocumentData}
          />
        )}

        {/* Edit Event Modal */}
        <EditEventModal
          isOpen={editModalOpen}
          event={event}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(updated) => {
            setEvent(updated);
            fetchEvent();
          }}
        />

        {/* Delete Event Modal */}
        <DeleteEventModal
          isOpen={deleteModalOpen}
          event={event}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={async (id) => {
            await deleteEvent(id, token || undefined);
            router.push("/manager/events");
          }}
        />
      </div>
    </div>
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